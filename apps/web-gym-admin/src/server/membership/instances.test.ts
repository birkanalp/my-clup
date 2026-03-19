import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@myclup/supabase';

vi.mock('@myclup/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@myclup/supabase')>();
  return {
    ...actual,
    getCurrentUser: vi.fn(),
    createServerClient: vi.fn(),
    resolveTenantScope: vi.fn(),
    requirePermission: vi.fn(),
    getMembershipInstance: vi.fn(),
    assignMembershipInstance: vi.fn(),
    renewMembership: vi.fn(),
    freezeMembership: vi.fn(),
    cancelMembership: vi.fn(),
    validateMembershipAccess: vi.fn(),
    writeAuditEvent: vi.fn(),
  };
});

import { assignInstance, cancelInstance, renewInstance, validateInstanceAccess } from './instances';
import * as supabase from '@myclup/supabase';

const mockGetCurrentUser = vi.mocked(supabase.getCurrentUser);
const mockCreateServerClient = vi.mocked(supabase.createServerClient);
const mockResolveTenantScope = vi.mocked(supabase.resolveTenantScope);
const mockRequirePermission = vi.mocked(supabase.requirePermission);
const mockGetMembershipInstance = vi.mocked(supabase.getMembershipInstance);
const mockRenewMembership = vi.mocked(supabase.renewMembership);
const mockCancelMembership = vi.mocked(supabase.cancelMembership);
const mockValidateMembershipAccess = vi.mocked(supabase.validateMembershipAccess);
const mockWriteAuditEvent = vi.mocked(supabase.writeAuditEvent);

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const mockUser = {
  user: {
    id: validUuid,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  profile: {
    userId: validUuid,
    displayName: 'Test',
    avatarUrl: null,
    locale: 'tr',
    fallbackLocale: 'en',
  },
} as unknown as supabase.CurrentUser;

describe('membership instances server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
    mockCreateServerClient.mockReturnValue({} as never);
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockResolveTenantScope.mockResolvedValue([{ gymId: validUuid, branchId: null }]);
    mockRequirePermission.mockResolvedValue(undefined);
    mockWriteAuditEvent.mockResolvedValue(validUuid);
  });

  it('returns null when unauthenticated on assign', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/v1/memberships/instances');
    const result = await assignInstance(req, {
      planId: validUuid,
      memberId: validUuid,
      gymId: validUuid,
      validFrom: '2025-03-19T12:00:00.000Z',
      validUntil: null,
      entitledBranchIds: [],
    });
    expect(result).toBeNull();
  });

  it('throws ForbiddenError when tenant scope is empty on renewal', async () => {
    mockGetMembershipInstance.mockResolvedValue({
      id: validUuid,
      planId: validUuid,
      memberId: validUuid,
      gymId: validUuid,
      branchId: null,
      status: 'active',
      validFrom: '2025-03-19T12:00:00.000Z',
      validUntil: '2025-04-19T12:00:00.000Z',
      remainingSessions: null,
      entitledBranchIds: [],
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockResolveTenantScope.mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api/v1/memberships/instances');
    await expect(
      renewInstance(req, validUuid, {
        membershipInstanceId: validUuid,
        renewedUntil: '2025-05-19T12:00:00.000Z',
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it('writes audit event when cancellation succeeds', async () => {
    mockGetMembershipInstance.mockResolvedValue({
      id: validUuid,
      planId: validUuid,
      memberId: validUuid,
      gymId: validUuid,
      branchId: null,
      status: 'active',
      validFrom: '2025-03-19T12:00:00.000Z',
      validUntil: '2025-04-19T12:00:00.000Z',
      remainingSessions: null,
      entitledBranchIds: [],
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockCancelMembership.mockResolvedValue({
      membership: {
        id: validUuid,
        planId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'cancelled',
        validFrom: '2025-03-19T12:00:00.000Z',
        validUntil: '2025-04-19T12:00:00.000Z',
        remainingSessions: null,
        entitledBranchIds: [],
        createdAt: '2025-03-19T12:00:00.000Z',
        updatedAt: '2025-03-19T12:00:00.000Z',
      },
      cancelled: true,
    });

    const req = new NextRequest('http://localhost/api/v1/memberships/instances');
    const result = await cancelInstance(req, validUuid, {
      membershipInstanceId: validUuid,
      cancelledAt: '2025-03-19T12:00:00.000Z',
    });

    expect(result?.cancelled).toBe(true);
    expect(mockWriteAuditEvent).toHaveBeenCalled();
  });

  it('writes denied-access audit on failed validation', async () => {
    mockGetMembershipInstance.mockResolvedValue({
      id: validUuid,
      planId: validUuid,
      memberId: validUuid,
      gymId: validUuid,
      branchId: null,
      status: 'active',
      validFrom: '2025-03-19T12:00:00.000Z',
      validUntil: '2025-03-20T12:00:00.000Z',
      remainingSessions: null,
      entitledBranchIds: [],
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockValidateMembershipAccess.mockResolvedValue({
      membershipInstanceId: validUuid,
      result: 'denied',
      reason: 'expired',
      status: 'expired',
      checkedAt: '2025-03-22T12:00:00.000Z',
    });

    const req = new NextRequest('http://localhost/api/v1/memberships/instances');
    const result = await validateInstanceAccess(req, validUuid, {
      membershipInstanceId: validUuid,
      branchId: validUuid,
    });

    expect(result?.result).toBe('denied');
    expect(mockWriteAuditEvent).toHaveBeenCalled();
  });

  it('renew path executes permission check before write', async () => {
    mockGetMembershipInstance.mockResolvedValue({
      id: validUuid,
      planId: validUuid,
      memberId: validUuid,
      gymId: validUuid,
      branchId: null,
      status: 'active',
      validFrom: '2025-03-19T12:00:00.000Z',
      validUntil: '2025-04-19T12:00:00.000Z',
      remainingSessions: 10,
      entitledBranchIds: [],
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockRenewMembership.mockResolvedValue({
      membership: {
        id: validUuid,
        planId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'active',
        validFrom: '2025-03-19T12:00:00.000Z',
        validUntil: '2025-05-19T12:00:00.000Z',
        remainingSessions: 15,
        entitledBranchIds: [],
        createdAt: '2025-03-19T12:00:00.000Z',
        updatedAt: '2025-03-19T12:00:00.000Z',
      },
    });

    const req = new NextRequest('http://localhost/api/v1/memberships/instances');
    await renewInstance(req, validUuid, {
      membershipInstanceId: validUuid,
      renewedUntil: '2025-05-19T12:00:00.000Z',
      addedSessionCount: 5,
    });

    expect(mockRequirePermission).toHaveBeenCalled();
    expect(mockRenewMembership).toHaveBeenCalled();
  });
});
