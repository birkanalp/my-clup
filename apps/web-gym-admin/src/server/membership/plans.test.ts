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
    listMembershipPlans: vi.fn(),
    createMembershipPlan: vi.fn(),
    getMembershipPlan: vi.fn(),
    updateMembershipPlan: vi.fn(),
    deactivateMembershipPlan: vi.fn(),
  };
});

import { createPlan, listPlans, removePlan } from './plans';
import * as supabase from '@myclup/supabase';

const mockGetCurrentUser = vi.mocked(supabase.getCurrentUser);
const mockCreateServerClient = vi.mocked(supabase.createServerClient);
const mockResolveTenantScope = vi.mocked(supabase.resolveTenantScope);
const mockRequirePermission = vi.mocked(supabase.requirePermission);
const mockListMembershipPlans = vi.mocked(supabase.listMembershipPlans);
const mockCreateMembershipPlan = vi.mocked(supabase.createMembershipPlan);
const mockGetMembershipPlan = vi.mocked(supabase.getMembershipPlan);
const mockDeactivateMembershipPlan = vi.mocked(supabase.deactivateMembershipPlan);

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

describe('membership plans server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
    mockCreateServerClient.mockReturnValue({} as never);
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockResolveTenantScope.mockResolvedValue([{ gymId: validUuid, branchId: null }]);
    mockRequirePermission.mockResolvedValue(undefined);
  });

  it('returns null when unauthenticated for list', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/v1/memberships/plans');
    const result = await listPlans(req);
    expect(result).toBeNull();
  });

  it('throws ForbiddenError when no scope for create', async () => {
    mockResolveTenantScope.mockResolvedValue([]);
    const req = new NextRequest('http://localhost/api/v1/memberships/plans');
    await expect(
      createPlan(req, {
        gymId: validUuid,
        name: 'Monthly',
        type: 'time_based',
        durationDays: 30,
        sessionCount: null,
        freezeRule: { maxDays: 5, maxCountPerPeriod: 1, period: 'month' },
        branchRestrictionEnabled: false,
        allowedBranchIds: [],
        pricingTiers: [{ label: 'Standard', amount: 1000, currency: 'TRY' }],
        discountRules: [],
        trialEnabled: false,
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it('deactivates plan with permission check', async () => {
    mockGetMembershipPlan.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      name: 'Monthly',
      type: 'time_based',
      status: 'active',
      durationDays: 30,
      sessionCount: null,
      freezeRule: { maxDays: 5, maxCountPerPeriod: 1, period: 'month' },
      branchRestrictionEnabled: false,
      allowedBranchIds: [],
      pricingTiers: [{ label: 'Standard', amount: 1000, currency: 'TRY' }],
      discountRules: [],
      trialEnabled: false,
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockDeactivateMembershipPlan.mockResolvedValue({ planId: validUuid, deactivated: true });

    const req = new NextRequest('http://localhost/api/v1/memberships/plans');
    const result = await removePlan(req, validUuid);

    expect(result?.deactivated).toBe(true);
    expect(mockRequirePermission).toHaveBeenCalled();
  });

  it('lists plans with tenant-scoped query', async () => {
    mockListMembershipPlans.mockResolvedValue({ items: [] });
    const req = new NextRequest(`http://localhost/api/v1/memberships/plans?gymId=${validUuid}`);
    const result = await listPlans(req);
    expect(result?.items).toEqual([]);
  });

  it('creates plan with normalized scope from server permissions', async () => {
    mockCreateMembershipPlan.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      name: 'Monthly',
      type: 'time_based',
      status: 'active',
      durationDays: 30,
      sessionCount: null,
      freezeRule: { maxDays: 5, maxCountPerPeriod: 1, period: 'month' },
      branchRestrictionEnabled: false,
      allowedBranchIds: [],
      pricingTiers: [{ label: 'Standard', amount: 1000, currency: 'TRY' }],
      discountRules: [],
      trialEnabled: false,
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    const req = new NextRequest('http://localhost/api/v1/memberships/plans');
    const result = await createPlan(req, {
      gymId: validUuid,
      name: 'Monthly',
      type: 'time_based',
      durationDays: 30,
      sessionCount: null,
      freezeRule: { maxDays: 5, maxCountPerPeriod: 1, period: 'month' },
      branchRestrictionEnabled: false,
      allowedBranchIds: [],
      pricingTiers: [{ label: 'Standard', amount: 1000, currency: 'TRY' }],
      discountRules: [],
      trialEnabled: false,
    });
    expect(result?.id).toBe(validUuid);
  });
});
