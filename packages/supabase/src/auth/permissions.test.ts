/**
 * Unit tests for permission resolution and enforcement helpers.
 *
 * Uses mocked Supabase client to test resolveTenantScope, checkPermission,
 * and requirePermission without live DB access.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  resolveTenantScope,
  checkPermission,
  requirePermission,
  ForbiddenError,
  ROLE_PERMISSIONS,
} from './permissions';
import type { ServerSupabaseClient } from '../client/create-server-client';

// ---------------------------------------------------------------------------
// Helper: create a mock client that returns specified role rows
// ---------------------------------------------------------------------------

type MockRoleRow = { role: string; gym_id: string | null; branch_id: string | null };
type MockStaffRow = { role: string; gym_id: string; branch_id: string | null };

function makeMockClient(
  roleAssignments: MockRoleRow[],
  staffAssignments: MockStaffRow[]
): ServerSupabaseClient {
  const makeQuery = (rows: unknown[]) => ({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: rows, error: null }),
    }),
  });

  return {
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'user_role_assignments') return makeQuery(roleAssignments);
      if (table === 'gym_staff') return makeQuery(staffAssignments);
      return makeQuery([]);
    }),
  } as unknown as ServerSupabaseClient;
}

// ---------------------------------------------------------------------------
// Tests: ROLE_PERMISSIONS mapping
// ---------------------------------------------------------------------------

describe('ROLE_PERMISSIONS', () => {
  it('platform_admin has all permissions', () => {
    expect(ROLE_PERMISSIONS.platform_admin).toContain('billing:override');
    expect(ROLE_PERMISSIONS.platform_admin).toContain('roles:write');
    expect(ROLE_PERMISSIONS.platform_admin).toContain('members:write');
  });

  it('gym_owner has all gym-level permissions', () => {
    expect(ROLE_PERMISSIONS.gym_owner).toContain('members:write');
    expect(ROLE_PERMISSIONS.gym_owner).toContain('billing:override');
    expect(ROLE_PERMISSIONS.gym_owner).toContain('roles:write');
  });

  it('gym_receptionist does not have payments:write', () => {
    expect(ROLE_PERMISSIONS.gym_receptionist).not.toContain('payments:write');
    expect(ROLE_PERMISSIONS.gym_receptionist).not.toContain('billing:override');
    expect(ROLE_PERMISSIONS.gym_receptionist).not.toContain('roles:write');
  });

  it('platform_support has read-only access', () => {
    expect(ROLE_PERMISSIONS.platform_support).toContain('members:read');
    expect(ROLE_PERMISSIONS.platform_support).not.toContain('members:write');
    expect(ROLE_PERMISSIONS.platform_support).not.toContain('billing:override');
  });
});

// ---------------------------------------------------------------------------
// Tests: resolveTenantScope
// ---------------------------------------------------------------------------

describe('resolveTenantScope', () => {
  const userId = 'user-1';
  const gymId = 'gym-1';
  const branchId = 'branch-1';

  it('returns empty array when user has no roles', async () => {
    const client = makeMockClient([], []);
    const scopes = await resolveTenantScope(client, userId);
    expect(scopes).toEqual([]);
  });

  it('returns gym scope for gym-level role assignment', async () => {
    const client = makeMockClient([{ role: 'gym_owner', gym_id: gymId, branch_id: null }], []);
    const scopes = await resolveTenantScope(client, userId);
    expect(scopes).toHaveLength(1);
    expect(scopes[0]).toEqual({ gymId, branchId: null });
  });

  it('returns branch scope for branch-level role assignment', async () => {
    const client = makeMockClient(
      [{ role: 'branch_manager', gym_id: gymId, branch_id: branchId }],
      []
    );
    const scopes = await resolveTenantScope(client, userId);
    expect(scopes).toHaveLength(1);
    expect(scopes[0]).toEqual({ gymId, branchId });
  });

  it('filters by gymId when provided', async () => {
    const client = makeMockClient(
      [
        { role: 'gym_owner', gym_id: gymId, branch_id: null },
        { role: 'gym_manager', gym_id: 'gym-2', branch_id: null },
      ],
      []
    );
    const scopes = await resolveTenantScope(client, userId, gymId);
    expect(scopes).toHaveLength(1);
    expect(scopes[0].gymId).toBe(gymId);
  });

  it('includes platform_admin scope when gymId filter provided', async () => {
    const client = makeMockClient([{ role: 'platform_admin', gym_id: null, branch_id: null }], []);
    const scopes = await resolveTenantScope(client, userId, gymId);
    expect(scopes).toHaveLength(1);
    expect(scopes[0]).toEqual({ gymId, branchId: null });
  });

  it('returns no scopes for platform_admin without gymId filter', async () => {
    const client = makeMockClient([{ role: 'platform_admin', gym_id: null, branch_id: null }], []);
    const scopes = await resolveTenantScope(client, userId);
    expect(scopes).toHaveLength(0);
  });

  it('deduplicates scopes from user_role_assignments and gym_staff', async () => {
    const client = makeMockClient(
      [{ role: 'gym_staff', gym_id: gymId, branch_id: null }],
      [{ role: 'gym_staff', gym_id: gymId, branch_id: null }]
    );
    const scopes = await resolveTenantScope(client, userId);
    expect(scopes).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: checkPermission
// ---------------------------------------------------------------------------

describe('checkPermission', () => {
  const userId = 'user-1';
  const gymId = 'gym-1';

  it('returns true for gym_owner with members:write in gym scope', async () => {
    const client = makeMockClient([{ role: 'gym_owner', gym_id: gymId, branch_id: null }], []);
    const result = await checkPermission(
      client,
      userId,
      { gymId, branchId: null },
      'members:write'
    );
    expect(result).toBe(true);
  });

  it('returns false for gym_receptionist with payments:write', async () => {
    const client = makeMockClient(
      [{ role: 'gym_receptionist', gym_id: gymId, branch_id: null }],
      []
    );
    const result = await checkPermission(
      client,
      userId,
      { gymId, branchId: null },
      'payments:write'
    );
    expect(result).toBe(false);
  });

  it('returns true for platform_admin in any gym scope', async () => {
    const client = makeMockClient([{ role: 'platform_admin', gym_id: null, branch_id: null }], []);
    const result = await checkPermission(
      client,
      userId,
      { gymId: 'any-gym', branchId: null },
      'billing:override'
    );
    expect(result).toBe(true);
  });

  it('returns false for wrong gym', async () => {
    const client = makeMockClient(
      [{ role: 'gym_owner', gym_id: 'gym-other', branch_id: null }],
      []
    );
    const result = await checkPermission(client, userId, { gymId, branchId: null }, 'members:read');
    expect(result).toBe(false);
  });

  it('gym-wide role grants permission in branch scope', async () => {
    const client = makeMockClient([{ role: 'gym_manager', gym_id: gymId, branch_id: null }], []);
    const result = await checkPermission(
      client,
      userId,
      { gymId, branchId: 'branch-1' },
      'members:read'
    );
    expect(result).toBe(true);
  });

  it('branch-scoped role does not grant permission in gym-wide scope', async () => {
    const client = makeMockClient(
      [{ role: 'branch_manager', gym_id: gymId, branch_id: 'branch-1' }],
      []
    );
    const result = await checkPermission(client, userId, { gymId, branchId: null }, 'members:read');
    expect(result).toBe(false);
  });

  it('cross-tenant access is denied', async () => {
    const client = makeMockClient([{ role: 'gym_owner', gym_id: 'gym-a', branch_id: null }], []);
    const result = await checkPermission(
      client,
      userId,
      { gymId: 'gym-b', branchId: null },
      'members:read'
    );
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: requirePermission
// ---------------------------------------------------------------------------

describe('requirePermission', () => {
  const userId = 'user-1';
  const gymId = 'gym-1';

  it('does not throw when user has the permission', async () => {
    const client = makeMockClient([{ role: 'gym_owner', gym_id: gymId, branch_id: null }], []);
    await expect(
      requirePermission(client, userId, { gymId, branchId: null }, 'members:write')
    ).resolves.toBeUndefined();
  });

  it('throws ForbiddenError when user lacks the permission', async () => {
    const client = makeMockClient(
      [{ role: 'gym_receptionist', gym_id: gymId, branch_id: null }],
      []
    );
    await expect(
      requirePermission(client, userId, { gymId, branchId: null }, 'billing:override')
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('ForbiddenError has statusCode 403', async () => {
    const client = makeMockClient([], []);
    try {
      await requirePermission(client, userId, { gymId, branchId: null }, 'members:read');
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenError);
      expect((e as ForbiddenError).statusCode).toBe(403);
    }
  });

  it('throws ForbiddenError for cross-tenant access attempt', async () => {
    const client = makeMockClient([{ role: 'gym_owner', gym_id: 'gym-a', branch_id: null }], []);
    await expect(
      requirePermission(client, userId, { gymId: 'gym-b', branchId: null }, 'members:read')
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
