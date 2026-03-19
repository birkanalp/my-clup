/**
 * Permission resolution and enforcement helpers.
 *
 * ⚠️ SERVER-ONLY: Use only in BFF routes, API handlers, server actions.
 * Never call from client apps. Never trust gymId/branchId from the client;
 * derive from server context using resolveTenantScope.
 *
 * Usage sequence:
 *   1. getSession(req) → validate identity
 *   2. getCurrentUser(req) → get user + profile
 *   3. resolveTenantScope(client, userId, gymId?, branchId?) → derive permitted scopes
 *   4. requirePermission(client, userId, scope, permission) → enforce before writes
 */

import type {
  TenantScope,
  FeaturePermission,
  PlatformRole,
  GymRole,
  BranchRole,
} from '@myclup/types';
import type { ServerSupabaseClient } from '../client/create-server-client';

/** All roles that can be assigned. Matches AppRole in database.types.ts. */
export type AnyRole = PlatformRole | GymRole | BranchRole;

/**
 * Thrown by requirePermission when the user lacks the required permission.
 * Callers should map this to a 403 response.
 */
export class ForbiddenError extends Error {
  readonly statusCode = 403;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Thrown when a requested resource does not exist.
 * Callers should map this to a 404 response.
 */
export class NotFoundError extends Error {
  readonly statusCode = 404;

  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Role → FeaturePermission mapping.
 *
 * Platform admins have full access to everything.
 * Platform support has read-only access to most resources.
 * Platform finance can read payments and billing.
 * Gym owners have full access within their gym.
 * Gym managers can manage members, bookings, classes, and staff.
 * Gym staff have limited write access.
 * Gym instructors can manage classes and bookings.
 * Gym receptionists handle check-in and bookings.
 * Gym sales manage memberships and payments.
 * Branch managers have gym-manager level access scoped to their branch.
 * Branch instructors and staff mirror gym equivalents at branch scope.
 */
const ROLE_PERMISSIONS: Record<AnyRole, ReadonlyArray<FeaturePermission>> = {
  // Platform roles
  platform_admin: [
    'members:read',
    'members:write',
    'bookings:read',
    'bookings:write',
    'payments:read',
    'payments:write',
    'chat:read',
    'chat:write',
    'classes:read',
    'classes:write',
    'reports:read',
    'settings:write',
    'roles:write',
    'billing:override',
  ],
  platform_support: [
    'members:read',
    'bookings:read',
    'payments:read',
    'chat:read',
    'classes:read',
    'reports:read',
  ],
  platform_finance: [
    'members:read',
    'payments:read',
    'payments:write',
    'reports:read',
    'billing:override',
  ],

  // Gym roles
  gym_owner: [
    'members:read',
    'members:write',
    'bookings:read',
    'bookings:write',
    'payments:read',
    'payments:write',
    'chat:read',
    'chat:write',
    'classes:read',
    'classes:write',
    'reports:read',
    'settings:write',
    'roles:write',
    'billing:override',
  ],
  gym_manager: [
    'members:read',
    'members:write',
    'bookings:read',
    'bookings:write',
    'payments:read',
    'chat:read',
    'chat:write',
    'classes:read',
    'classes:write',
    'reports:read',
    'settings:write',
    'roles:write',
  ],
  gym_staff: [
    'members:read',
    'members:write',
    'bookings:read',
    'bookings:write',
    'payments:read',
    'chat:read',
    'chat:write',
    'classes:read',
  ],
  gym_instructor: [
    'members:read',
    'bookings:read',
    'bookings:write',
    'chat:read',
    'chat:write',
    'classes:read',
    'classes:write',
  ],
  gym_receptionist: [
    'members:read',
    'bookings:read',
    'bookings:write',
    'chat:read',
    'classes:read',
  ],
  gym_sales: [
    'members:read',
    'members:write',
    'payments:read',
    'payments:write',
    'chat:read',
    'bookings:read',
  ],

  // Branch roles — mirrors gym equivalents, scoped to branch
  branch_manager: [
    'members:read',
    'members:write',
    'bookings:read',
    'bookings:write',
    'payments:read',
    'chat:read',
    'chat:write',
    'classes:read',
    'classes:write',
    'reports:read',
    'settings:write',
    'roles:write',
  ],
  branch_instructor: [
    'members:read',
    'bookings:read',
    'bookings:write',
    'chat:read',
    'chat:write',
    'classes:read',
    'classes:write',
  ],
  branch_staff: [
    'members:read',
    'members:write',
    'bookings:read',
    'bookings:write',
    'payments:read',
    'chat:read',
    'classes:read',
  ],
};

/**
 * Returns true when a role grants the given permission.
 */
function roleHasPermission(role: AnyRole, permission: FeaturePermission): boolean {
  return (ROLE_PERMISSIONS[role] as ReadonlyArray<string>).includes(permission);
}

/** A resolved role assignment from user_role_assignments or gym_staff. */
interface ResolvedRoleAssignment {
  role: AnyRole;
  gymId: string | null;
  branchId: string | null;
}

/**
 * Fetch all role assignments for a user from user_role_assignments and gym_staff.
 * Uses service role client — never expose this to client-side code.
 */
async function fetchUserRoles(
  client: ServerSupabaseClient,
  userId: string
): Promise<ResolvedRoleAssignment[]> {
  const [assignmentsResult, staffResult] = await Promise.all([
    client.from('user_role_assignments').select('role, gym_id, branch_id').eq('user_id', userId),
    client.from('gym_staff').select('role, gym_id, branch_id').eq('user_id', userId),
  ]);

  const assignments: ResolvedRoleAssignment[] = [];

  if (assignmentsResult.data) {
    for (const row of assignmentsResult.data) {
      assignments.push({
        role: row.role as AnyRole,
        gymId: row.gym_id,
        branchId: row.branch_id,
      });
    }
  }

  if (staffResult.data) {
    for (const row of staffResult.data) {
      // Skip duplicates already captured from user_role_assignments
      const alreadyExists = assignments.some(
        (a) => a.role === row.role && a.gymId === row.gym_id && a.branchId === row.branch_id
      );
      if (!alreadyExists) {
        assignments.push({
          role: row.role as AnyRole,
          gymId: row.gym_id,
          branchId: row.branch_id,
        });
      }
    }
  }

  return assignments;
}

/**
 * Resolve the tenant scopes a user is permitted to operate in.
 *
 * Queries user_role_assignments and gym_staff to determine which gym/branch
 * scopes the user has access to. Platform-level roles (platform_admin,
 * platform_support, platform_finance) with gymId=null are not returned
 * as TenantScope entries — callers should check those separately via
 * checkPermission if needed.
 *
 * When gymId is provided, only scopes matching that gym are returned.
 * When branchId is also provided, only scopes matching that branch are returned.
 *
 * ⚠️ NEVER trust gymId or branchId from the client; always derive from
 * server context (e.g. from the authenticated user's JWT claims or URL params
 * validated server-side).
 *
 * @param client - Service role Supabase client
 * @param userId - Authenticated user's ID (from getSession)
 * @param gymId - Optional: filter to a specific gym
 * @param branchId - Optional: filter to a specific branch
 * @returns Array of tenant scopes the user is permitted to operate in
 */
export async function resolveTenantScope(
  client: ServerSupabaseClient,
  userId: string,
  gymId?: string,
  branchId?: string
): Promise<TenantScope[]> {
  const roles = await fetchUserRoles(client, userId);
  const scopes: TenantScope[] = [];

  for (const assignment of roles) {
    // Platform-level roles (gymId = null) grant access to all gyms.
    // Represent as the requested gymId scope when a gymId is provided.
    if (assignment.gymId === null) {
      if (gymId) {
        const scope: TenantScope = { gymId, branchId: branchId ?? null };
        if (!scopes.some((s) => s.gymId === scope.gymId && s.branchId === scope.branchId)) {
          scopes.push(scope);
        }
      }
      // If no gymId filter provided, we cannot enumerate all gyms — skip.
      continue;
    }

    // Filter by gymId when provided
    if (gymId && assignment.gymId !== gymId) continue;

    // Filter by branchId when provided
    if (
      branchId !== undefined &&
      assignment.branchId !== null &&
      assignment.branchId !== branchId
    ) {
      continue;
    }

    const scope: TenantScope = {
      gymId: assignment.gymId,
      branchId: branchId ?? assignment.branchId,
    };

    const alreadyAdded = scopes.some(
      (s) => s.gymId === scope.gymId && s.branchId === scope.branchId
    );
    if (!alreadyAdded) {
      scopes.push(scope);
    }
  }

  return scopes;
}

/**
 * Check whether a user has a specific feature permission in the given scope.
 *
 * Checks all role assignments for the user and returns true if any role
 * matching the scope grants the permission. Platform-level roles (gymId = null)
 * grant the permission in any scope.
 *
 * @param client - Service role Supabase client
 * @param userId - Authenticated user's ID (from getSession)
 * @param scope - Tenant scope to check (gymId, branchId)
 * @param permission - Feature permission to verify
 * @returns true if the user has the permission in the given scope
 */
export async function checkPermission(
  client: ServerSupabaseClient,
  userId: string,
  scope: TenantScope,
  permission: FeaturePermission
): Promise<boolean> {
  const roles = await fetchUserRoles(client, userId);

  for (const assignment of roles) {
    if (!roleHasPermission(assignment.role, permission)) continue;

    // Platform-level role (gymId = null): grants permission in any scope
    if (assignment.gymId === null) return true;

    // Must match the gym
    if (assignment.gymId !== scope.gymId) continue;

    // If scope is branch-scoped, role must cover that branch
    if (scope.branchId !== null) {
      // Gym-wide role (branchId = null) covers all branches
      if (assignment.branchId === null) return true;
      // Branch-scoped role must match
      if (assignment.branchId === scope.branchId) return true;
    } else {
      // Scope is gym-wide — only gym-wide roles apply (branchId = null on assignment)
      if (assignment.branchId === null) return true;
    }
  }

  return false;
}

/**
 * Require that a user has a specific feature permission in the given scope.
 *
 * Throws ForbiddenError if the user lacks the permission.
 * Use in write paths before executing any state-modifying operation.
 *
 * @param client - Service role Supabase client
 * @param userId - Authenticated user's ID (from getSession)
 * @param scope - Tenant scope to enforce (gymId, branchId)
 * @param permission - Feature permission required
 * @throws ForbiddenError if permission is denied
 */
export async function requirePermission(
  client: ServerSupabaseClient,
  userId: string,
  scope: TenantScope,
  permission: FeaturePermission
): Promise<void> {
  const permitted = await checkPermission(client, userId, scope, permission);
  if (!permitted) {
    throw new ForbiddenError(
      `User ${userId} does not have permission '${permission}' in scope gym:${scope.gymId}/branch:${scope.branchId ?? 'any'}`
    );
  }
}

export { ROLE_PERMISSIONS };
