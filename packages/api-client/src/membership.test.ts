import { describe, expect, it, vi } from 'vitest';
import { createApi } from './index';
import {
  ListMembershipPlansResponseSchema,
  RenewMembershipResponseSchema,
  ValidateMembershipAccessResponseSchema,
} from '@myclup/contracts/membership';
import { ListInvoicesResponseSchema, ListPaymentsResponseSchema } from '@myclup/contracts/billing';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const validDatetime = '2025-03-19T12:00:00.000Z';

function mockFetch(status: number, body: unknown): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : String(status),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as unknown as typeof fetch;
}

describe('membership api', () => {
  it('lists membership plans from /api/v1/memberships/plans', async () => {
    const payload = {
      items: [
        {
          id: validUuid,
          gymId: validUuid,
          branchId: null,
          name: 'Monthly',
          type: 'time_based' as const,
          status: 'active' as const,
          durationDays: 30,
          sessionCount: null,
          freezeRule: { maxDays: 7, maxCountPerPeriod: 1, period: 'month' as const },
          branchRestrictionEnabled: false,
          allowedBranchIds: [],
          pricingTiers: [{ label: 'Standard', amount: 1000, currency: 'TRY' }],
          discountRules: [],
          trialEnabled: false,
          createdAt: validDatetime,
          updatedAt: validDatetime,
        },
      ],
    };
    const mockFetchFn = mockFetch(200, payload);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.membership.listMembershipPlans();
    expect(ListMembershipPlansResponseSchema.safeParse(result).success).toBe(true);
    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/memberships/plans',
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('renews membership with path param', async () => {
    const payload = {
      membership: {
        id: validUuid,
        planId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'active' as const,
        validFrom: validDatetime,
        validUntil: validDatetime,
        remainingSessions: null,
        entitledBranchIds: [],
        createdAt: validDatetime,
        updatedAt: validDatetime,
      },
    };
    const mockFetchFn = mockFetch(200, payload);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.membership.renewMembership(validUuid, {
      membershipInstanceId: validUuid,
      renewedUntil: validDatetime,
    });

    expect(RenewMembershipResponseSchema.safeParse(result).success).toBe(true);
    expect(mockFetchFn).toHaveBeenCalledWith(
      `http://localhost:3001/api/v1/memberships/instances/${validUuid}/renew`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('validates access on versioned endpoint', async () => {
    const payload = {
      membershipInstanceId: validUuid,
      result: 'allowed' as const,
      reason: 'active' as const,
      status: 'active' as const,
      checkedAt: validDatetime,
    };
    const mockFetchFn = mockFetch(200, payload);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.membership.validateMembershipAccess(validUuid, {
      membershipInstanceId: validUuid,
      branchId: validUuid,
      at: validDatetime,
    });

    expect(ValidateMembershipAccessResponseSchema.safeParse(result).success).toBe(true);
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.stringContaining(`/api/v1/memberships/instances/${validUuid}/access`),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('lists invoices and payments from /api/v1/billing endpoints', async () => {
    const invoices = { items: [], nextCursor: null };
    const payments = { items: [], nextCursor: null };
    const mockFetchFn = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(invoices),
        text: () => Promise.resolve(JSON.stringify(invoices)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(payments),
        text: () => Promise.resolve(JSON.stringify(payments)),
      }) as unknown as typeof fetch;

    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });
    const invoiceResult = await api.membership.listInvoices();
    const paymentResult = await api.membership.listPayments();

    expect(ListInvoicesResponseSchema.safeParse(invoiceResult).success).toBe(true);
    expect(ListPaymentsResponseSchema.safeParse(paymentResult).success).toBe(true);
    expect((mockFetchFn as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(
      'http://localhost:3001/api/v1/billing/invoices'
    );
    expect((mockFetchFn as ReturnType<typeof vi.fn>).mock.calls[1]?.[0]).toBe(
      'http://localhost:3001/api/v1/billing/payments'
    );
  });
});
