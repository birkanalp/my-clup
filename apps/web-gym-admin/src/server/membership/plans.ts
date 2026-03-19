import type { NextRequest } from 'next/server';
import type {
  CreateMembershipPlanRequest,
  CreateMembershipPlanResponse,
  DeactivateMembershipPlanResponse,
  ListMembershipPlansRequest,
  ListMembershipPlansResponse,
  UpdateMembershipPlanRequest,
  UpdateMembershipPlanResponse,
} from '@myclup/contracts/membership';
import {
  createMembershipPlan,
  createServerClient,
  deactivateMembershipPlan,
  ForbiddenError,
  getCurrentUser,
  getMembershipPlan,
  listMembershipPlans,
  requirePermission,
  resolveTenantScope,
  updateMembershipPlan,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

function parseListParams(req: NextRequest): ListMembershipPlansRequest {
  const sp = req.nextUrl.searchParams;
  return {
    gymId: sp.get('gymId') ?? undefined,
    branchId: sp.get('branchId') ?? undefined,
    includeInactive: sp.get('includeInactive') === 'true',
  };
}

export async function listPlans(req: NextRequest): Promise<ListMembershipPlansResponse | null> {
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
    throw new ForbiddenError('No tenant scope for membership plans');
  }

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:read');
  return listMembershipPlans(client, {
    ...params,
    gymId: scope.gymId,
    branchId: scope.branchId ?? params.branchId,
  });
}

export async function createPlan(
  req: NextRequest,
  input: CreateMembershipPlanRequest
): Promise<CreateMembershipPlanResponse | null> {
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
    throw new ForbiddenError('No tenant scope for membership plan creation');
  }

  const scope = scopes[0];
  await requirePermission(client, currentUser.user.id, scope, 'members:write');
  return createMembershipPlan(client, {
    ...input,
    gymId: scope.gymId,
    branchId: scope.branchId,
  });
}

export async function updatePlan(
  req: NextRequest,
  planId: string,
  input: UpdateMembershipPlanRequest
): Promise<UpdateMembershipPlanResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const plan = await getMembershipPlan(client, planId);
  if (!plan) {
    throw new Error('membership_plan_not_found');
  }

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    plan.gymId,
    plan.branchId ?? undefined
  );
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for membership plan update');
  }

  await requirePermission(client, currentUser.user.id, scopes[0], 'members:write');
  return updateMembershipPlan(client, planId, input);
}

export async function removePlan(
  req: NextRequest,
  planId: string
): Promise<DeactivateMembershipPlanResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const plan = await getMembershipPlan(client, planId);
  if (!plan) {
    throw new Error('membership_plan_not_found');
  }

  const scopes = await resolveTenantScope(
    client,
    currentUser.user.id,
    plan.gymId,
    plan.branchId ?? undefined
  );
  if (scopes.length === 0) {
    throw new ForbiddenError('No tenant scope for membership plan removal');
  }

  await requirePermission(client, currentUser.user.id, scopes[0], 'members:write');
  return deactivateMembershipPlan(client, planId);
}
