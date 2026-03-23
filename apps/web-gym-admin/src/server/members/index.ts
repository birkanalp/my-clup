import type { NextRequest } from 'next/server';
import type {
  GetGymMemberResponse,
  GymMember,
  GymMemberDetail,
  ListGymMembersRequest,
  ListGymMembersResponse,
  MemberStatus,
  UpdateMemberStatusRequest,
  UpdateMemberStatusResponse,
} from '@myclup/contracts/members';
import {
  AUDIT_EVENT_TYPES,
  createServerClient,
  ForbiddenError,
  getCurrentUser,
  NotFoundError,
  requirePermission,
  resolveTenantScope,
  writeAuditEvent,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

async function writeMembersAudit(
  client: ReturnType<typeof getClient>,
  params: Parameters<typeof writeAuditEvent>[1]
) {
  try {
    await writeAuditEvent(client, params);
  } catch (error) {
    console.error('[members] audit write failed', error);
  }
}

function parseListParams(req: NextRequest): ListGymMembersRequest {
  const sp = req.nextUrl.searchParams;
  const limitParam = sp.get('limit');
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  return {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
    status: (sp.get('status') as ListGymMembersRequest['status']) ?? undefined,
    search: sp.get('search') ?? undefined,
    cursor: sp.get('cursor') ?? undefined,
    limit: typeof limit === 'number' && Number.isFinite(limit) ? limit : 20,
  };
}

/**
 * Derives a member's status from their latest membership instance.
 * Members are users with membership_instances belonging to a gym.
 */
function deriveMemberStatus(
  instanceStatus: string | null,
  validUntil: string | null
): MemberStatus {
  if (!instanceStatus) return 'no_membership';
  if (instanceStatus === 'cancelled') return 'suspended';
  if (instanceStatus === 'expired') return 'expired';
  if (instanceStatus === 'frozen') return 'suspended';
  if (instanceStatus === 'active') {
    if (validUntil && new Date(validUntil) < new Date()) return 'expired';
    return 'active';
  }
  return 'no_membership';
}

export async function listMembers(req: NextRequest): Promise<ListGymMembersResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const params = parseListParams(req);
  const client = getClient();
  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    params.gymId,
    params.branchId
  );
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for members list');
  }

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');

  // Query membership instances joined with profiles for the gym
  let query = client
    .from('membership_instances')
    .select(
      'id, member_id, gym_id, branch_id, status, valid_from, valid_until, plan_id, remaining_sessions, created_at, membership_plans(name), profiles!membership_instances_member_id_fkey(user_id, display_name, locale)'
    )
    .eq('gym_id', scope.gymId)
    .order('created_at', { ascending: false })
    .limit(params.limit + 1);

  if (params.branchId ?? scope.branchId) {
    query = query.eq('branch_id', params.branchId ?? scope.branchId ?? '');
  }

  if (params.cursor) {
    query = query.lt('created_at', params.cursor);
  }

  if (params.status && params.status !== 'no_membership') {
    const dbStatus = params.status === 'suspended' ? 'cancelled' : params.status;
    query = query.eq('status', dbStatus);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[members] list query failed', error);
    throw new Error('members_list_failed');
  }

  const rows = data ?? [];
  const hasMore = rows.length > params.limit;
  const items = (hasMore ? rows.slice(0, params.limit) : rows).map((row): GymMember => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const plan = Array.isArray(row.membership_plans)
      ? row.membership_plans[0]
      : row.membership_plans;
    const memberStatus = deriveMemberStatus(row.status, row.valid_until);

    return {
      id: row.member_id,
      displayName: (profile as { display_name?: string } | null)?.display_name ?? 'Unknown',
      email: '',
      membershipStatus: memberStatus,
      membershipPlanName: (plan as { name?: string } | null)?.name ?? null,
      membershipValidUntil: row.valid_until,
      membershipInstanceId: row.id,
      joinedAt: row.created_at,
    };
  });

  // Filter by search on display name after fetching (simple approach)
  const filtered =
    params.search
      ? items.filter((m) =>
          m.displayName.toLowerCase().includes(params.search!.toLowerCase())
        )
      : items;

  const nextCursor =
    hasMore && rows[params.limit - 1]?.created_at ? rows[params.limit - 1].created_at : null;

  return {
    items: filtered,
    nextCursor,
  };
}

export async function getMember(
  req: NextRequest,
  memberId: string
): Promise<GetGymMemberResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();

  // Get the member's latest membership instance for this gym to derive scope
  const { data: instances, error: instError } = await client
    .from('membership_instances')
    .select(
      'id, member_id, gym_id, branch_id, status, valid_from, valid_until, plan_id, remaining_sessions, created_at, membership_plans(name), profiles!membership_instances_member_id_fkey(user_id, display_name, locale)'
    )
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (instError) {
    console.error('[members] getMember query failed', instError);
    throw new Error('member_query_failed');
  }

  const latest = instances?.[0] ?? null;
  if (!latest) {
    throw new NotFoundError('Member not found');
  }

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    latest.gym_id,
    latest.branch_id ?? undefined
  );
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for member detail');
  }

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');

  const profile = Array.isArray(latest.profiles) ? latest.profiles[0] : latest.profiles;
  const plan = Array.isArray(latest.membership_plans)
    ? latest.membership_plans[0]
    : latest.membership_plans;
  const memberStatus = deriveMemberStatus(latest.status, latest.valid_until);

  const result: GymMemberDetail = {
    id: latest.member_id,
    displayName: (profile as { display_name?: string } | null)?.display_name ?? 'Unknown',
    email: '',
    membershipStatus: memberStatus,
    membershipPlanName: (plan as { name?: string } | null)?.name ?? null,
    membershipValidUntil: latest.valid_until,
    membershipInstanceId: latest.id,
    membershipPlanId: latest.plan_id,
    remainingSessions: latest.remaining_sessions,
    locale: (profile as { locale?: string } | null)?.locale ?? 'en',
    joinedAt: latest.created_at,
  };

  return result;
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

  // Find the active membership instance for this member
  const { data: instances, error: instError } = await client
    .from('membership_instances')
    .select('id, gym_id, branch_id, status, valid_until')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (instError) {
    console.error('[members] updateMemberStatus query failed', instError);
    throw new Error('member_query_failed');
  }

  const latest = instances?.[0] ?? null;
  if (!latest) {
    throw new NotFoundError('Member not found');
  }

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    latest.gym_id,
    latest.branch_id ?? undefined
  );
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for member status update');
  }

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');

  // Map UI status to DB status
  const newDbStatus = input.status === 'suspended' ? 'cancelled' : 'active';
  const previousStatus = deriveMemberStatus(latest.status, latest.valid_until);
  const timestamp = new Date().toISOString();

  // Write audit before state change
  await writeMembersAudit(client, {
    event_type: AUDIT_EVENT_TYPES.role_change,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: latest.id,
    payload: {
      member_id: memberId,
      action: 'member_status_update',
      reason: input.reason,
      before_state: latest.status,
      after_state: newDbStatus,
      actor_role: 'gym_manager',
      tenant_id: scope.gymId,
      timestamp,
    },
    tenant_context: { gym_id: scope.gymId, branch_id: scope.branchId ?? undefined },
  });

  const { error: updateError } = await client
    .from('membership_instances')
    .update({ status: newDbStatus as 'active' | 'cancelled', updated_at: timestamp })
    .eq('id', latest.id);

  if (updateError) {
    console.error('[members] status update failed', updateError);
    throw new Error('member_status_update_failed');
  }

  const newStatus = deriveMemberStatus(newDbStatus, latest.valid_until);

  return {
    memberId,
    previousStatus,
    newStatus,
    updatedAt: timestamp,
  };
}
