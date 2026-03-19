import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMembership } from './useMembership';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'en' },
  }),
}));

vi.mock('../chat/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  api: {
    membership: {
      listMembershipInstances: vi.fn(),
      getMembershipInstance: vi.fn(),
      listMembershipPlans: vi.fn(),
      renewMembership: vi.fn(),
    },
  },
}));

describe('useMembership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads membership, plan, and renewal visibility', async () => {
    const { useCurrentUser } = await import('../chat/useCurrentUser');
    vi.mocked(useCurrentUser).mockReturnValue('member-1');

    const { api } = await import('../../lib/api');
    vi.mocked(api.membership.listMembershipInstances).mockResolvedValue({
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          planId: '550e8400-e29b-41d4-a716-446655440001',
          memberId: '550e8400-e29b-41d4-a716-446655440002',
          gymId: '550e8400-e29b-41d4-a716-446655440003',
          branchId: null,
          status: 'active',
          validFrom: '2025-03-01T00:00:00.000Z',
          validUntil: '2099-03-05T00:00:00.000Z',
          remainingSessions: 4,
          entitledBranchIds: [],
          createdAt: '2025-03-01T00:00:00.000Z',
          updatedAt: '2025-03-01T00:00:00.000Z',
        },
      ],
      nextCursor: null,
    });
    vi.mocked(api.membership.getMembershipInstance).mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      planId: '550e8400-e29b-41d4-a716-446655440001',
      memberId: '550e8400-e29b-41d4-a716-446655440002',
      gymId: '550e8400-e29b-41d4-a716-446655440003',
      branchId: null,
      status: 'frozen',
      validFrom: '2025-03-01T00:00:00.000Z',
      validUntil: '2025-03-05T00:00:00.000Z',
      remainingSessions: 4,
      freezeStartAt: '2025-03-02T00:00:00.000Z',
      freezeEndAt: '2025-03-04T00:00:00.000Z',
      entitledBranchIds: ['550e8400-e29b-41d4-a716-446655440009'],
      createdAt: '2025-03-01T00:00:00.000Z',
      updatedAt: '2025-03-01T00:00:00.000Z',
    });
    vi.mocked(api.membership.listMembershipPlans).mockResolvedValue({
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          gymId: '550e8400-e29b-41d4-a716-446655440003',
          branchId: null,
          name: 'Session pack',
          type: 'session_based',
          status: 'active',
          durationDays: null,
          sessionCount: 10,
          freezeRule: { maxDays: 7, maxCountPerPeriod: 1, period: 'month' },
          branchRestrictionEnabled: false,
          allowedBranchIds: [],
          pricingTiers: [{ label: 'Standard', amount: 1200, currency: 'TRY' }],
          discountRules: [],
          trialEnabled: false,
          createdAt: '2025-03-01T00:00:00.000Z',
          updatedAt: '2025-03-01T00:00:00.000Z',
        },
      ],
    });

    const { result } = renderHook(() => useMembership());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.membership?.status).toBe('frozen');
    expect(result.current.data.plan?.name).toBe('Session pack');
    expect(result.current.data.renewalOptions).toHaveLength(1);
  });

  it('returns no-membership state when no instance exists', async () => {
    const { useCurrentUser } = await import('../chat/useCurrentUser');
    vi.mocked(useCurrentUser).mockReturnValue('member-1');

    const { api } = await import('../../lib/api');
    vi.mocked(api.membership.listMembershipInstances).mockResolvedValue({
      items: [],
      nextCursor: null,
    });

    const { result } = renderHook(() => useMembership());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data.membership).toBeNull();
    expect(result.current.data.canRenew).toBe(false);
  });

  it('surfaces request errors', async () => {
    const { useCurrentUser } = await import('../chat/useCurrentUser');
    vi.mocked(useCurrentUser).mockReturnValue('member-1');

    const { api } = await import('../../lib/api');
    vi.mocked(api.membership.listMembershipInstances).mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useMembership());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('network');
  });

  it('submits membership renewal', async () => {
    const { useCurrentUser } = await import('../chat/useCurrentUser');
    vi.mocked(useCurrentUser).mockReturnValue('member-1');

    const { api } = await import('../../lib/api');
    vi.mocked(api.membership.listMembershipInstances).mockResolvedValue({
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          planId: '550e8400-e29b-41d4-a716-446655440001',
          memberId: '550e8400-e29b-41d4-a716-446655440002',
          gymId: '550e8400-e29b-41d4-a716-446655440003',
          branchId: null,
          status: 'expired',
          validFrom: '2025-03-01T00:00:00.000Z',
          validUntil: '2025-03-05T00:00:00.000Z',
          remainingSessions: 0,
          entitledBranchIds: [],
          createdAt: '2025-03-01T00:00:00.000Z',
          updatedAt: '2025-03-01T00:00:00.000Z',
        },
      ],
      nextCursor: null,
    });
    vi.mocked(api.membership.getMembershipInstance).mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      planId: '550e8400-e29b-41d4-a716-446655440001',
      memberId: '550e8400-e29b-41d4-a716-446655440002',
      gymId: '550e8400-e29b-41d4-a716-446655440003',
      branchId: null,
      status: 'expired',
      validFrom: '2025-03-01T00:00:00.000Z',
      validUntil: '2025-03-05T00:00:00.000Z',
      remainingSessions: 0,
      entitledBranchIds: [],
      createdAt: '2025-03-01T00:00:00.000Z',
      updatedAt: '2025-03-01T00:00:00.000Z',
    });
    vi.mocked(api.membership.listMembershipPlans).mockResolvedValue({
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          gymId: '550e8400-e29b-41d4-a716-446655440003',
          branchId: null,
          name: 'Monthly',
          type: 'time_based',
          status: 'active',
          durationDays: 30,
          sessionCount: null,
          freezeRule: { maxDays: 7, maxCountPerPeriod: 1, period: 'month' },
          branchRestrictionEnabled: false,
          allowedBranchIds: [],
          pricingTiers: [{ label: 'Standard', amount: 1200, currency: 'TRY' }],
          discountRules: [],
          trialEnabled: false,
          createdAt: '2025-03-01T00:00:00.000Z',
          updatedAt: '2025-03-01T00:00:00.000Z',
        },
      ],
    });
    vi.mocked(api.membership.renewMembership).mockResolvedValue({
      membership: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        planId: '550e8400-e29b-41d4-a716-446655440001',
        memberId: '550e8400-e29b-41d4-a716-446655440002',
        gymId: '550e8400-e29b-41d4-a716-446655440003',
        branchId: null,
        status: 'active',
        validFrom: '2025-03-01T00:00:00.000Z',
        validUntil: '2025-04-05T00:00:00.000Z',
        remainingSessions: null,
        entitledBranchIds: [],
        createdAt: '2025-03-01T00:00:00.000Z',
        updatedAt: '2025-03-01T00:00:00.000Z',
      },
    });

    const { result } = renderHook(() => useMembership());

    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      const renewal = await result.current.renewMembership('550e8400-e29b-41d4-a716-446655440001');
      expect(renewal.plan.name).toBe('Monthly');
    });
    expect(api.membership.renewMembership).toHaveBeenCalledTimes(1);
  });
});
