import type {
  AssignMembershipInstanceRequest,
  AssignMembershipInstanceResponse,
  CreateMembershipPlanRequest,
  CreateMembershipPlanResponse,
  FreezeMembershipRequest,
  FreezeMembershipResponse,
  GetMembershipInstanceResponse,
  ListMembershipInstancesRequest,
  ListMembershipInstancesResponse,
  ListMembershipPlansRequest,
  ListMembershipPlansResponse,
  MembershipInstance,
  MembershipPlan,
  RenewMembershipRequest,
  RenewMembershipResponse,
  UpdateMembershipPlanRequest,
  UpdateMembershipPlanResponse,
  ValidateMembershipAccessResponse,
} from '@myclup/contracts/membership';
import type { Json } from '../generated/database.types';
import type { ServerSupabaseClient } from '../client';

type PlanRow = {
  id: string;
  gym_id: string;
  branch_id: string | null;
  name: string;
  type: MembershipPlan['type'];
  status: MembershipPlan['status'];
  duration_days: number | null;
  session_count: number | null;
  freeze_rule: Json;
  branch_restriction_enabled: boolean;
  allowed_branch_ids: string[] | null;
  pricing_tiers: Json;
  discount_rules: Json;
  trial_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type InstanceRow = {
  id: string;
  plan_id: string;
  member_id: string;
  gym_id: string;
  branch_id: string | null;
  status: MembershipInstance['status'];
  valid_from: string;
  valid_until: string | null;
  remaining_sessions: number | null;
  entitled_branch_ids: string[] | null;
  freeze_start_at: string | null;
  freeze_end_at: string | null;
  created_at: string;
  updated_at: string;
};

function toMembershipPlan(row: PlanRow): MembershipPlan {
  return {
    id: row.id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    name: row.name,
    type: row.type,
    status: row.status,
    durationDays: row.duration_days,
    sessionCount: row.session_count,
    freezeRule: (row.freeze_rule as MembershipPlan['freezeRule']) ?? {
      maxDays: 0,
      maxCountPerPeriod: 0,
      period: 'month',
    },
    branchRestrictionEnabled: row.branch_restriction_enabled,
    allowedBranchIds: row.allowed_branch_ids ?? [],
    pricingTiers: (row.pricing_tiers as MembershipPlan['pricingTiers']) ?? [],
    discountRules: (row.discount_rules as MembershipPlan['discountRules']) ?? [],
    trialEnabled: row.trial_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toMembershipInstance(row: InstanceRow): MembershipInstance {
  return {
    id: row.id,
    planId: row.plan_id,
    memberId: row.member_id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    status: row.status,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    remainingSessions: row.remaining_sessions,
    entitledBranchIds: row.entitled_branch_ids ?? [],
    freezeStartAt: row.freeze_start_at,
    freezeEndAt: row.freeze_end_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listMembershipPlans(
  client: ServerSupabaseClient,
  input: ListMembershipPlansRequest
): Promise<ListMembershipPlansResponse> {
  let query = client
    .from('membership_plans')
    .select(
      'id, gym_id, branch_id, name, type, status, duration_days, session_count, freeze_rule, branch_restriction_enabled, allowed_branch_ids, pricing_tiers, discount_rules, trial_enabled, created_at, updated_at'
    )
    .order('updated_at', { ascending: false });

  if (input.gymId) query = query.eq('gym_id', input.gymId);
  if (input.branchId) query = query.eq('branch_id', input.branchId);
  if (!input.includeInactive) query = query.eq('status', 'active');

  const { data, error } = await query;
  if (error) throw new Error(`listMembershipPlans failed: ${error.message}`);

  return { items: (data ?? []).map((row) => toMembershipPlan(row as PlanRow)) };
}

export async function createMembershipPlan(
  client: ServerSupabaseClient,
  input: CreateMembershipPlanRequest
): Promise<CreateMembershipPlanResponse> {
  const { data, error } = await client
    .from('membership_plans')
    .insert({
      gym_id: input.gymId,
      branch_id: input.branchId ?? null,
      name: input.name,
      type: input.type,
      duration_days: input.durationDays ?? null,
      session_count: input.sessionCount ?? null,
      freeze_rule: input.freezeRule as unknown as Json,
      branch_restriction_enabled: input.branchRestrictionEnabled,
      allowed_branch_ids: input.allowedBranchIds,
      pricing_tiers: input.pricingTiers as unknown as Json,
      discount_rules: input.discountRules as unknown as Json,
      trial_enabled: input.trialEnabled,
      status: 'active',
    })
    .select(
      'id, gym_id, branch_id, name, type, status, duration_days, session_count, freeze_rule, branch_restriction_enabled, allowed_branch_ids, pricing_tiers, discount_rules, trial_enabled, created_at, updated_at'
    )
    .single();

  if (error || !data) throw new Error(`createMembershipPlan failed: ${error?.message}`);
  return toMembershipPlan(data as PlanRow);
}

export async function updateMembershipPlan(
  client: ServerSupabaseClient,
  planId: string,
  input: UpdateMembershipPlanRequest
): Promise<UpdateMembershipPlanResponse> {
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) patch.name = input.name;
  if (input.type !== undefined) patch.type = input.type;
  if (input.durationDays !== undefined) patch.duration_days = input.durationDays;
  if (input.sessionCount !== undefined) patch.session_count = input.sessionCount;
  if (input.freezeRule !== undefined) patch.freeze_rule = input.freezeRule;
  if (input.branchRestrictionEnabled !== undefined) {
    patch.branch_restriction_enabled = input.branchRestrictionEnabled;
  }
  if (input.allowedBranchIds !== undefined) patch.allowed_branch_ids = input.allowedBranchIds;
  if (input.pricingTiers !== undefined) patch.pricing_tiers = input.pricingTiers;
  if (input.discountRules !== undefined) patch.discount_rules = input.discountRules;
  if (input.trialEnabled !== undefined) patch.trial_enabled = input.trialEnabled;

  const { data, error } = await client
    .from('membership_plans')
    .update(patch)
    .eq('id', planId)
    .select(
      'id, gym_id, branch_id, name, type, status, duration_days, session_count, freeze_rule, branch_restriction_enabled, allowed_branch_ids, pricing_tiers, discount_rules, trial_enabled, created_at, updated_at'
    )
    .single();

  if (error || !data) throw new Error(`updateMembershipPlan failed: ${error?.message}`);
  return toMembershipPlan(data as PlanRow);
}

export async function deactivateMembershipPlan(
  client: ServerSupabaseClient,
  planId: string
): Promise<{ planId: string; deactivated: true }> {
  const { error } = await client
    .from('membership_plans')
    .update({ status: 'inactive', updated_at: new Date().toISOString() })
    .eq('id', planId);
  if (error) throw new Error(`deactivateMembershipPlan failed: ${error.message}`);
  return { planId, deactivated: true };
}

export async function getMembershipPlan(
  client: ServerSupabaseClient,
  planId: string
): Promise<MembershipPlan | null> {
  const { data, error } = await client
    .from('membership_plans')
    .select(
      'id, gym_id, branch_id, name, type, status, duration_days, session_count, freeze_rule, branch_restriction_enabled, allowed_branch_ids, pricing_tiers, discount_rules, trial_enabled, created_at, updated_at'
    )
    .eq('id', planId)
    .maybeSingle();
  if (error) throw new Error(`getMembershipPlan failed: ${error.message}`);
  return data ? toMembershipPlan(data as PlanRow) : null;
}

export async function listMembershipInstances(
  client: ServerSupabaseClient,
  input: ListMembershipInstancesRequest
): Promise<ListMembershipInstancesResponse> {
  const limit = input.limit ?? 20;
  let query = client
    .from('membership_instances')
    .select(
      'id, plan_id, member_id, gym_id, branch_id, status, valid_from, valid_until, remaining_sessions, entitled_branch_ids, freeze_start_at, freeze_end_at, created_at, updated_at'
    )
    .order('updated_at', { ascending: false })
    .limit(limit + 1);

  if (input.gymId) query = query.eq('gym_id', input.gymId);
  if (input.branchId) query = query.eq('branch_id', input.branchId);
  if (input.memberId) query = query.eq('member_id', input.memberId);
  if (input.status) query = query.eq('status', input.status);

  if (input.cursor) {
    const { data: cursorRow } = await client
      .from('membership_instances')
      .select('updated_at')
      .eq('id', input.cursor)
      .maybeSingle();
    if (cursorRow?.updated_at) {
      query = query.lt('updated_at', cursorRow.updated_at);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`listMembershipInstances failed: ${error.message}`);

  const rows = (data ?? []) as InstanceRow[];
  const hasMore = rows.length > limit;
  const items = (hasMore ? rows.slice(0, limit) : rows).map(toMembershipInstance);
  return {
    items,
    nextCursor: hasMore ? (rows[limit - 1]?.id ?? null) : null,
  };
}

export async function assignMembershipInstance(
  client: ServerSupabaseClient,
  input: AssignMembershipInstanceRequest
): Promise<AssignMembershipInstanceResponse> {
  const { data, error } = await client
    .from('membership_instances')
    .insert({
      plan_id: input.planId,
      member_id: input.memberId,
      gym_id: input.gymId,
      branch_id: input.branchId ?? null,
      status: 'active',
      valid_from: input.validFrom,
      valid_until: input.validUntil,
      remaining_sessions: input.remainingSessions ?? null,
      entitled_branch_ids: input.entitledBranchIds,
    })
    .select(
      'id, plan_id, member_id, gym_id, branch_id, status, valid_from, valid_until, remaining_sessions, entitled_branch_ids, freeze_start_at, freeze_end_at, created_at, updated_at'
    )
    .single();
  if (error || !data) throw new Error(`assignMembershipInstance failed: ${error?.message}`);
  return toMembershipInstance(data as InstanceRow);
}

export async function getMembershipInstance(
  client: ServerSupabaseClient,
  instanceId: string
): Promise<GetMembershipInstanceResponse | null> {
  const { data, error } = await client
    .from('membership_instances')
    .select(
      'id, plan_id, member_id, gym_id, branch_id, status, valid_from, valid_until, remaining_sessions, entitled_branch_ids, freeze_start_at, freeze_end_at, created_at, updated_at'
    )
    .eq('id', instanceId)
    .maybeSingle();
  if (error) throw new Error(`getMembershipInstance failed: ${error.message}`);
  return data ? toMembershipInstance(data as InstanceRow) : null;
}

export async function renewMembership(
  client: ServerSupabaseClient,
  instanceId: string,
  input: RenewMembershipRequest
): Promise<RenewMembershipResponse> {
  const instance = await getMembershipInstance(client, instanceId);
  if (!instance) throw new Error('membership_not_found');

  const updatedSessions =
    input.addedSessionCount !== undefined
      ? Math.max((instance.remainingSessions ?? 0) + input.addedSessionCount, 0)
      : instance.remainingSessions;

  const { data, error } = await client
    .from('membership_instances')
    .update({
      status: 'active',
      valid_until: input.renewedUntil,
      remaining_sessions: updatedSessions,
      freeze_start_at: null,
      freeze_end_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', instanceId)
    .select(
      'id, plan_id, member_id, gym_id, branch_id, status, valid_from, valid_until, remaining_sessions, entitled_branch_ids, freeze_start_at, freeze_end_at, created_at, updated_at'
    )
    .single();
  if (error || !data) throw new Error(`renewMembership failed: ${error?.message}`);
  return { membership: toMembershipInstance(data as InstanceRow) };
}

export async function freezeMembership(
  client: ServerSupabaseClient,
  instanceId: string,
  input: FreezeMembershipRequest
): Promise<FreezeMembershipResponse> {
  const start = new Date(input.freezeStartAt).getTime();
  const end = new Date(input.freezeEndAt).getTime();
  const frozenDays = Math.max(Math.round((end - start) / 86_400_000), 0);

  const { data, error } = await client
    .from('membership_instances')
    .update({
      status: 'frozen',
      freeze_start_at: input.freezeStartAt,
      freeze_end_at: input.freezeEndAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', instanceId)
    .select(
      'id, plan_id, member_id, gym_id, branch_id, status, valid_from, valid_until, remaining_sessions, entitled_branch_ids, freeze_start_at, freeze_end_at, created_at, updated_at'
    )
    .single();
  if (error || !data) throw new Error(`freezeMembership failed: ${error?.message}`);
  return { membership: toMembershipInstance(data as InstanceRow), frozenDays };
}

export async function cancelMembership(
  client: ServerSupabaseClient,
  instanceId: string,
  cancelledAt: string
): Promise<{ membership: MembershipInstance; cancelled: true }> {
  const { data, error } = await client
    .from('membership_instances')
    .update({
      status: 'cancelled',
      cancelled_at: cancelledAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', instanceId)
    .select(
      'id, plan_id, member_id, gym_id, branch_id, status, valid_from, valid_until, remaining_sessions, entitled_branch_ids, freeze_start_at, freeze_end_at, created_at, updated_at'
    )
    .single();
  if (error || !data) throw new Error(`cancelMembership failed: ${error?.message}`);
  return { membership: toMembershipInstance(data as InstanceRow), cancelled: true };
}

export async function validateMembershipAccess(
  client: ServerSupabaseClient,
  instanceId: string,
  branchId: string,
  at?: string
): Promise<ValidateMembershipAccessResponse> {
  const instance = await getMembershipInstance(client, instanceId);
  if (!instance) {
    return {
      membershipInstanceId: instanceId,
      result: 'denied',
      reason: 'expired',
      status: 'expired',
      checkedAt: new Date().toISOString(),
    };
  }

  const when = at ? new Date(at) : new Date();
  const validUntil = instance.validUntil ? new Date(instance.validUntil) : null;
  const isExpired = validUntil ? validUntil.getTime() < when.getTime() : false;
  const isBranchEntitled =
    instance.entitledBranchIds.length === 0 || instance.entitledBranchIds.includes(branchId);

  if (instance.status === 'cancelled') {
    return {
      membershipInstanceId: instance.id,
      result: 'denied',
      reason: 'cancelled',
      status: instance.status,
      checkedAt: when.toISOString(),
    };
  }
  if (instance.status === 'frozen') {
    return {
      membershipInstanceId: instance.id,
      result: 'denied',
      reason: 'frozen',
      status: instance.status,
      checkedAt: when.toISOString(),
    };
  }
  if (isExpired || instance.status === 'expired') {
    return {
      membershipInstanceId: instance.id,
      result: 'denied',
      reason: 'expired',
      status: 'expired',
      checkedAt: when.toISOString(),
    };
  }
  if (!isBranchEntitled) {
    return {
      membershipInstanceId: instance.id,
      result: 'denied',
      reason: 'branch_not_entitled',
      status: instance.status,
      checkedAt: when.toISOString(),
    };
  }
  return {
    membershipInstanceId: instance.id,
    result: 'allowed',
    reason: 'active',
    status: 'active',
    checkedAt: when.toISOString(),
  };
}
