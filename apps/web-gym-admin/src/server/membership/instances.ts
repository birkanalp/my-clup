import type { NextRequest } from 'next/server';
import type {
  AssignMembershipInstanceRequest,
  AssignMembershipInstanceResponse,
  CancelMembershipRequest,
  CancelMembershipResponse,
  FreezeMembershipRequest,
  FreezeMembershipResponse,
  ListMembershipInstancesRequest,
  ListMembershipInstancesResponse,
  RenewMembershipRequest,
  RenewMembershipResponse,
  ValidateMembershipAccessRequest,
  ValidateMembershipAccessResponse,
} from '@myclup/contracts/membership';
import {
  assignMembershipInstance,
  AUDIT_EVENT_TYPES,
  cancelMembership,
  createServerClient,
  ForbiddenError,
  freezeMembership,
  getCurrentUser,
  getMembershipInstance,
  listMembershipInstances,
  renewMembership,
  requirePermission,
  resolveTenantScope,
  validateMembershipAccess,
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

function parseListParams(req: NextRequest): ListMembershipInstancesRequest {
  const sp = req.nextUrl.searchParams;
  const limitParam = sp.get('limit');
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  return {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
    memberId: sp.get('memberId') ?? undefined,
    status: (sp.get('status') as ListMembershipInstancesRequest['status']) ?? undefined,
    cursor: sp.get('cursor') ?? undefined,
    limit: typeof limit === 'number' && Number.isFinite(limit) ? limit : 20,
  };
}

async function writeMembershipAudit(
  client: ReturnType<typeof getClient>,
  params: Parameters<typeof writeAuditEvent>[1]
) {
  // Audit failures must never block primary operation.
  try {
    await writeAuditEvent(client, params);
  } catch (error) {
    console.error('[membership] audit write failed', error);
  }
}

type ActorContext = {
  actorRole: string;
  isPlatformAdmin: boolean;
};

async function getActorContext(
  client: ReturnType<typeof getClient>,
  userId: string,
  scope: TenantScope
): Promise<ActorContext> {
  const { data } = await client
    .from('user_role_assignments')
    .select('role, gym_id')
    .eq('user_id', userId);
  const rows = data ?? [];
  const platform = rows.find((row) => row.role === 'platform_admin' && row.gym_id === null);
  if (platform) {
    return { actorRole: 'platform_admin', isPlatformAdmin: true };
  }
  const gymRole = rows.find((row) => row.gym_id === scope.gymId)?.role;
  return { actorRole: gymRole ?? 'staff', isPlatformAdmin: false };
}

export async function listInstances(
  req: NextRequest
): Promise<ListMembershipInstancesResponse | null> {
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
    throw new ForbiddenError('No tenant scope for membership instances');
  }

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');
  const actor = await getActorContext(client, currentUser.user.id, scope);
  if (actor.isPlatformAdmin && params.gymId) {
    const timestamp = new Date().toISOString();
    await writeMembershipAudit(client, {
      event_type: AUDIT_EVENT_TYPES.cross_tenant_support,
      actor_id: currentUser.user.id,
      target_type: 'membership_instances',
      target_id: null,
      payload: {
        target_gym_id: scope.gymId,
        target_branch_id: scope.branchId ?? undefined,
        action: 'membership_list_access',
        actor_role: actor.actorRole,
        tenant_id: scope.gymId,
        before_state: 'request_received',
        after_state: 'scope_granted',
        timestamp,
      },
      tenant_context: { gym_id: scope.gymId, branch_id: scope.branchId ?? undefined },
    });
  }
  return listMembershipInstances(client, {
    ...params,
    gymId: scope.gymId,
    branchId: scope.branchId ?? params.branchId,
  });
}

export async function assignInstance(
  req: NextRequest,
  input: Omit<AssignMembershipInstanceRequest, 'entitledBranchIds'> & {
    entitledBranchIds?: string[];
  }
): Promise<AssignMembershipInstanceResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    input.gymId,
    input.branchId ?? undefined
  );
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for membership assignment');
  }
  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');
  const actor = await getActorContext(client, currentUser.user.id, scope);
  const timestamp = new Date().toISOString();

  const assigned = await assignMembershipInstance(client, {
    ...input,
    gymId: scope.gymId,
    branchId: scope.branchId,
    entitledBranchIds: input.entitledBranchIds ?? [],
  });

  await writeMembershipAudit(client, {
    event_type: AUDIT_EVENT_TYPES.membership_assignment,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: assigned.id,
    payload: {
      membership_id: assigned.id,
      member_id: assigned.memberId,
      plan_id: assigned.planId,
      valid_from: assigned.validFrom,
      valid_until: assigned.validUntil,
      actor_role: actor.actorRole,
      tenant_id: assigned.gymId,
      action: 'membership_assignment',
      before_state: 'not_assigned',
      after_state: assigned.status,
      timestamp,
    },
    tenant_context: { gym_id: assigned.gymId, branch_id: assigned.branchId ?? undefined },
  });

  return assigned;
}

export async function renewInstance(
  req: NextRequest,
  instanceId: string,
  input: RenewMembershipRequest
): Promise<RenewMembershipResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const current = await getMembershipInstance(client, instanceId);
  if (!current) throw new Error('membership_not_found');

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    current.gymId,
    current.branchId ?? undefined
  );
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for membership renewal');
  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');
  const actor = await getActorContext(client, currentUser.user.id, scope);
  const timestamp = new Date().toISOString();

  await writeMembershipAudit(client, {
    event_type: AUDIT_EVENT_TYPES.membership_extension,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: current.id,
    payload: {
      membership_id: current.id,
      previous_end_at: current.validUntil ?? undefined,
      new_end_at: input.renewedUntil,
      reason: undefined,
      actor_role: actor.actorRole,
      tenant_id: current.gymId,
      action: 'membership_manual_extension',
      before_state: current.status,
      after_state: 'pending_extension',
      timestamp,
    },
    tenant_context: { gym_id: current.gymId, branch_id: current.branchId ?? undefined },
  });

  const renewed = await renewMembership(client, instanceId, input);

  await writeMembershipAudit(client, {
    event_type: AUDIT_EVENT_TYPES.membership_extension,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: renewed.membership.id,
    payload: {
      membership_id: renewed.membership.id,
      previous_end_at: current.validUntil,
      new_end_at: renewed.membership.validUntil,
      reason: undefined,
      actor_role: actor.actorRole,
      tenant_id: renewed.membership.gymId,
      action: 'membership_manual_extension',
      before_state: current.status,
      after_state: renewed.membership.status,
      timestamp: new Date().toISOString(),
    },
    tenant_context: {
      gym_id: renewed.membership.gymId,
      branch_id: renewed.membership.branchId ?? undefined,
    },
  });

  return renewed;
}

export async function freezeInstance(
  req: NextRequest,
  instanceId: string,
  input: FreezeMembershipRequest
): Promise<FreezeMembershipResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const current = await getMembershipInstance(client, instanceId);
  if (!current) throw new Error('membership_not_found');

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    current.gymId,
    current.branchId ?? undefined
  );
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for membership freeze');
  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');
  const actor = await getActorContext(client, currentUser.user.id, scope);
  const timestamp = new Date().toISOString();

  await writeMembershipAudit(client, {
    event_type: AUDIT_EVENT_TYPES.membership_freeze,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: current.id,
    payload: {
      membership_id: current.id,
      freeze_start_at: input.freezeStartAt,
      freeze_end_at: input.freezeEndAt,
      reason: input.reason,
      actor_role: actor.actorRole,
      tenant_id: current.gymId,
      action: 'membership_freeze',
      before_state: current.status,
      after_state: 'pending_freeze',
      timestamp,
    },
    tenant_context: { gym_id: current.gymId, branch_id: current.branchId ?? undefined },
  });

  const frozen = await freezeMembership(client, instanceId, input);

  await writeMembershipAudit(client, {
    event_type: AUDIT_EVENT_TYPES.membership_freeze,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: frozen.membership.id,
    payload: {
      membership_id: frozen.membership.id,
      freeze_start_at: input.freezeStartAt,
      freeze_end_at: input.freezeEndAt,
      reason: input.reason,
      actor_role: actor.actorRole,
      tenant_id: frozen.membership.gymId,
      action: 'membership_freeze',
      before_state: current.status,
      after_state: frozen.membership.status,
      timestamp: new Date().toISOString(),
    },
    tenant_context: {
      gym_id: frozen.membership.gymId,
      branch_id: frozen.membership.branchId ?? undefined,
    },
  });

  return frozen;
}

export async function cancelInstance(
  req: NextRequest,
  instanceId: string,
  input: CancelMembershipRequest
): Promise<CancelMembershipResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const current = await getMembershipInstance(client, instanceId);
  if (!current) throw new Error('membership_not_found');

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    current.gymId,
    current.branchId ?? undefined
  );
  if (scopes.length === 0) throw new ForbiddenError('No tenant scope for membership cancellation');
  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');
  const actor = await getActorContext(client, currentUser.user.id, scope);
  const timestamp = new Date().toISOString();

  await writeMembershipAudit(client, {
    event_type: AUDIT_EVENT_TYPES.membership_cancellation,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: current.id,
    payload: {
      membership_id: current.id,
      cancelled_at: input.cancelledAt,
      reason: input.reason,
      actor_role: actor.actorRole,
      tenant_id: current.gymId,
      action: 'membership_cancellation',
      before_state: current.status,
      after_state: 'pending_cancellation',
      timestamp,
    },
    tenant_context: { gym_id: current.gymId, branch_id: current.branchId ?? undefined },
  });

  const cancelled = await cancelMembership(client, instanceId, input.cancelledAt);

  await writeMembershipAudit(client, {
    event_type: AUDIT_EVENT_TYPES.membership_cancellation,
    actor_id: currentUser.user.id,
    target_type: 'membership_instances',
    target_id: cancelled.membership.id,
    payload: {
      membership_id: cancelled.membership.id,
      cancelled_at: input.cancelledAt,
      reason: input.reason,
      actor_role: actor.actorRole,
      tenant_id: cancelled.membership.gymId,
      action: 'membership_cancellation',
      before_state: current.status,
      after_state: cancelled.membership.status,
      timestamp: new Date().toISOString(),
    },
    tenant_context: {
      gym_id: cancelled.membership.gymId,
      branch_id: cancelled.membership.branchId ?? undefined,
    },
  });

  return cancelled;
}

export async function validateInstanceAccess(
  req: NextRequest,
  instanceId: string,
  input: ValidateMembershipAccessRequest
): Promise<ValidateMembershipAccessResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const current = await getMembershipInstance(client, instanceId);
  if (!current) throw new Error('membership_not_found');

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    current.gymId,
    input.branchId
  );
  if (scopes.length === 0)
    throw new ForbiddenError('No tenant scope for membership access validation');
  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');
  const actor = await getActorContext(client, currentUser.user.id, scope);

  const result = await validateMembershipAccess(client, instanceId, input.branchId, input.at);

  if (result.result === 'denied') {
    await writeMembershipAudit(client, {
      event_type: AUDIT_EVENT_TYPES.membership_access_denied,
      actor_id: currentUser.user.id,
      target_type: 'membership_instances',
      target_id: instanceId,
      payload: {
        membership_id: instanceId,
        branch_id: input.branchId,
        reason: result.reason,
        actor_role: actor.actorRole,
        tenant_id: current.gymId,
        action: 'membership_access_validation',
        before_state: current.status,
        after_state: result.status,
        timestamp: new Date().toISOString(),
      },
      tenant_context: {
        gym_id: current.gymId,
        branch_id: current.branchId ?? undefined,
      },
    });
  }

  return result;
}
