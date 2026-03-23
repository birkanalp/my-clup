import type { NextRequest } from 'next/server';
import type {
  GetMemberResponse,
  ListMembersRequest,
  ListMembersResponse,
  MemberSummary,
  UpdateMemberStatusRequest,
  UpdateMemberStatusResponse,
} from '@myclup/contracts/members';
import {
  AUDIT_EVENT_TYPES,
  createServerClient,
  ForbiddenError,
  getCurrentUser,
  requirePermission,
  resolveTenantScope,
  writeAuditEvent,
} from '@myclup/supabase';
import type { TenantScope } from '@myclup/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

async function writeAuditSafe(
  client: ReturnType<typeof getClient>,
  params: Parameters<typeof writeAuditEvent>[1]
) {
  try {
    await writeAuditEvent(client, params);
  } catch (err) {
    console.error('[members] audit write failed', err);
  }
}

async function getActorRole(
  client: ReturnType<typeof getClient>,
  userId: string,
  gymId: string
): Promise<string> {
  const { data } = await client
    .from('user_role_assignments')
    .select('role, gym_id')
    .eq('user_id', userId);
  const rows = data ?? [];
  const platform = rows.find((row) => row.role === 'platform_admin' && row.gym_id === null);
  if (platform) return 'platform_admin';
  return rows.find((row) => row.gym_id === gymId)?.role ?? 'staff';
}

export async function listMembers(req: NextRequest): Promise<ListMembersResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const sp = req.nextUrl.searchParams;
  const gymId = sp.get('gymId') ?? undefined;
  const branchId = sp.get('branchId') ?? undefined;
  const status = sp.get('status') as ListMembersRequest['status'];
  const search = sp.get('search') ?? undefined;
  const cursor = sp.get('cursor') ?? undefined;
  const limitParam = sp.get('limit');
  const limit =
    limitParam && Number.isFinite(Number.parseInt(limitParam, 10))
      ? Number.parseInt(limitParam, 10)
      : 20;

  const client = getClient();
  const scopes = await resolveTenantScope(client, currentUser.user.id, gymId, branchId);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for members list');

  const scope: TenantScope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');

  // Query membership_instances to get distinct member_ids for this gym
  let instanceQuery = client
    .from('membership_instances')
    .select(
      'id, plan_id, member_id, gym_id, branch_id, status, valid_from, valid_until, remaining_sessions, created_at'
    )
    .eq('gym_id', scope.gymId)
    .order('created_at', { ascending: false });

  if (branchId ?? scope.branchId) {
    instanceQuery = instanceQuery.eq('branch_id', branchId ?? scope.branchId ?? '');
  }
  if (status) {
    instanceQuery = instanceQuery.eq('status', status);
  }

  const { data: instanceData, error: instanceError } = await instanceQuery;
  if (instanceError) throw new Error(`listMembers instances failed: ${instanceError.message}`);

  // Deduplicate by member_id, keeping the most recent membership instance per member
  const memberMap = new Map<
    string,
    {
      instanceId: string;
      planId: string;
      status: string;
      validUntil: string | null;
      joinedAt: string;
    }
  >();

  for (const row of instanceData ?? []) {
    if (!memberMap.has(row.member_id)) {
      memberMap.set(row.member_id, {
        instanceId: row.id,
        planId: row.plan_id,
        status: row.status,
        validUntil: row.valid_until,
        joinedAt: row.created_at,
      });
    }
  }

  const memberIds = Array.from(memberMap.keys());
  if (memberIds.length === 0) {
    return { items: [], nextCursor: null, total: 0 };
  }

  // Fetch profiles for all member_ids
  const { data: profileData, error: profileError } = await client
    .from('profiles')
    .select('user_id, display_name, avatar_url, created_at')
    .in('user_id', memberIds);
  if (profileError) throw new Error(`listMembers profiles failed: ${profileError.message}`);

  const profileMap = new Map<string, { displayName: string; createdAt: string }>();
  for (const profile of profileData ?? []) {
    profileMap.set(profile.user_id, {
      displayName: profile.display_name,
      createdAt: profile.created_at,
    });
  }

  // Fetch auth.users emails via a join on profiles is not directly possible without admin API.
  // Use the service role to look up emails from the auth schema is not safe here.
  // We will leave email as null — it requires auth.admin.listUsers which is outside RLS scope.

  // Fetch plan names for unique plan_ids
  const uniquePlanIds = [...new Set([...memberMap.values()].map((v) => v.planId))];
  const { data: planData } = await client
    .from('membership_plans')
    .select('id, name')
    .in('id', uniquePlanIds);
  const planNameMap = new Map<string, string>();
  for (const plan of planData ?? []) {
    planNameMap.set(plan.id, plan.name);
  }

  // Apply search filter client-side (display name contains search term)
  let filteredMemberIds = memberIds;
  if (search && search.trim().length > 0) {
    const searchLower = search.toLowerCase();
    filteredMemberIds = memberIds.filter((id) => {
      const profile = profileMap.get(id);
      return profile?.displayName.toLowerCase().includes(searchLower) ?? false;
    });
  }

  const total = filteredMemberIds.length;

  // Apply cursor-based pagination
  const cursorIndex = cursor ? filteredMemberIds.indexOf(cursor) : -1;
  const startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
  const pageIds = filteredMemberIds.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < filteredMemberIds.length;
  const nextCursor = hasMore ? (pageIds[pageIds.length - 1] ?? null) : null;

  const items: MemberSummary[] = pageIds.map((memberId) => {
    const membership = memberMap.get(memberId);
    const profile = profileMap.get(memberId);
    return {
      memberId,
      displayName: profile?.displayName ?? memberId,
      email: null,
      phone: null,
      membershipStatus: (membership?.status as MemberSummary['membershipStatus']) ?? null,
      membershipPlanName: membership ? (planNameMap.get(membership.planId) ?? null) : null,
      membershipValidUntil: membership?.validUntil ?? null,
      membershipInstanceId: membership?.instanceId ?? null,
      joinedAt: profile?.createdAt ?? membership?.joinedAt ?? new Date().toISOString(),
    };
  });

  return { items, nextCursor, total };
}

export async function getMember(
  req: NextRequest,
  memberId: string
): Promise<GetMemberResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();

  // Look up this member's most recent membership instance to determine tenant scope
  const { data: instanceRows, error: instanceError } = await client
    .from('membership_instances')
    .select(
      'id, plan_id, member_id, gym_id, branch_id, status, valid_from, valid_until, remaining_sessions, created_at'
    )
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (instanceError) throw new Error(`getMember instances failed: ${instanceError.message}`);

  const latestInstance = instanceRows?.[0] ?? null;

  // Resolve tenant scope — use the gym from the membership instance if found
  const gymId = latestInstance?.gym_id;
  const scopes = await resolveTenantScope(client, currentUser.user.id, gymId);
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for member detail');

  const scope: TenantScope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');

  // Verify this member actually belongs to the actor's gym
  if (latestInstance && latestInstance.gym_id !== scope.gymId) {
    throw new ForbiddenError('Member does not belong to your gym');
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('user_id, display_name, avatar_url, created_at')
    .eq('user_id', memberId)
    .maybeSingle();

  if (profileError) throw new Error(`getMember profile failed: ${profileError.message}`);
  if (!profile && !latestInstance) return null;

  let activeMembership: GetMemberResponse['activeMembership'] = null;
  if (latestInstance) {
    const { data: plan } = await client
      .from('membership_plans')
      .select('id, name')
      .eq('id', latestInstance.plan_id)
      .maybeSingle();

    activeMembership = {
      instanceId: latestInstance.id,
      planName: plan?.name ?? '',
      status: latestInstance.status as GetMemberResponse['activeMembership'] extends null
        ? never
        : NonNullable<GetMemberResponse['activeMembership']>['status'],
      validFrom: latestInstance.valid_from,
      validUntil: latestInstance.valid_until,
      remainingSessions: latestInstance.remaining_sessions,
    };
  }

  return {
    memberId,
    displayName: profile?.display_name ?? memberId,
    email: null,
    phone: null,
    avatarUrl: profile?.avatar_url ?? null,
    joinedAt: profile?.created_at ?? latestInstance?.created_at ?? new Date().toISOString(),
    activeMembership,
  };
}

export async function updateMemberStatus(
  req: NextRequest,
  memberId: string,
  input: UpdateMemberStatusRequest
): Promise<UpdateMemberStatusResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();

  // Find the member's most recent active/frozen membership instance
  const { data: instanceRows, error: instanceError } = await client
    .from('membership_instances')
    .select('id, gym_id, branch_id, status, member_id')
    .eq('member_id', memberId)
    .in('status', ['active', 'frozen', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(1);

  if (instanceError) throw new Error(`updateMemberStatus query failed: ${instanceError.message}`);

  const instance = instanceRows?.[0] ?? null;
  if (!instance) throw new ForbiddenError('No membership instance found for this member');

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    instance.gym_id,
    instance.branch_id ?? undefined
  );
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for member status update');

  const scope: TenantScope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');

  if (instance.gym_id !== scope.gymId) {
    throw new ForbiddenError('Member does not belong to your gym');
  }

  const actorRole = await getActorRole(client, currentUser.user.id, scope.gymId);
  const previousStatus = instance.status as UpdateMemberStatusResponse['previousStatus'];
  const timestamp = new Date().toISOString();

  const newStatus = (input.action === 'suspend' ? 'cancelled' : 'active') as 'cancelled' | 'active';

  // Write before-state audit event
  await writeAuditSafe(client, {
    event_type: AUDIT_EVENT_TYPES.membership_cancellation,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: instance.id,
    payload: {
      membership_id: instance.id,
      member_id: memberId,
      action: input.action === 'suspend' ? 'member_suspend' : 'member_reactivate',
      reason: input.reason,
      actor_role: actorRole,
      tenant_id: scope.gymId,
      before_state: previousStatus,
      after_state: 'pending',
      timestamp,
    },
    tenant_context: {
      gym_id: scope.gymId,
      branch_id: scope.branchId ?? undefined,
    },
  });

  const { error: updateError } = await client
    .from('membership_instances')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', instance.id);

  if (updateError) throw new Error(`updateMemberStatus update failed: ${updateError.message}`);

  // Write after-state audit event
  await writeAuditSafe(client, {
    event_type: AUDIT_EVENT_TYPES.membership_cancellation,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: instance.id,
    payload: {
      membership_id: instance.id,
      member_id: memberId,
      action: input.action === 'suspend' ? 'member_suspend' : 'member_reactivate',
      reason: input.reason,
      actor_role: actorRole,
      tenant_id: scope.gymId,
      before_state: previousStatus,
      after_state: newStatus,
      timestamp: new Date().toISOString(),
    },
    tenant_context: {
      gym_id: scope.gymId,
      branch_id: scope.branchId ?? undefined,
    },
  });

  return {
    memberId,
    action: input.action,
    membershipInstanceId: instance.id,
    previousStatus: previousStatus as UpdateMemberStatusResponse['previousStatus'],
    newStatus: newStatus as UpdateMemberStatusResponse['newStatus'],
  };
}
