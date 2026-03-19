import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePaymentHistory } from './usePaymentHistory';

vi.mock('../chat/useCurrentUser', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('../../lib/api', () => ({
  api: {
    membership: {
      listPayments: vi.fn(),
      listInvoices: vi.fn(),
    },
  },
}));

describe('usePaymentHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads payment rows with invoice detail', async () => {
    const { useCurrentUser } = await import('../chat/useCurrentUser');
    vi.mocked(useCurrentUser).mockReturnValue('member-1');

    const { api } = await import('../../lib/api');
    vi.mocked(api.membership.listPayments).mockResolvedValue({
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440010',
          gymId: '550e8400-e29b-41d4-a716-446655440003',
          branchId: null,
          memberId: '550e8400-e29b-41d4-a716-446655440002',
          invoiceId: '550e8400-e29b-41d4-a716-446655440011',
          currency: 'TRY',
          amount: 1000,
          method: 'card',
          status: 'succeeded',
          paidAt: '2025-03-10T00:00:00.000Z',
          createdAt: '2025-03-10T00:00:00.000Z',
          updatedAt: '2025-03-10T00:00:00.000Z',
        },
      ],
      nextCursor: null,
    });
    vi.mocked(api.membership.listInvoices).mockResolvedValue({
      items: [
        {
          id: '550e8400-e29b-41d4-a716-446655440011',
          gymId: '550e8400-e29b-41d4-a716-446655440003',
          branchId: null,
          memberId: '550e8400-e29b-41d4-a716-446655440002',
          membershipInstanceId: null,
          status: 'paid',
          currency: 'TRY',
          subtotalAmount: 1000,
          discountAmount: 0,
          totalAmount: 1000,
          dueAt: '2025-03-10T00:00:00.000Z',
          issuedAt: '2025-03-10T00:00:00.000Z',
          paidAt: '2025-03-10T00:00:00.000Z',
          lineItems: [
            {
              id: '550e8400-e29b-41d4-a716-446655440012',
              label: 'Membership',
              quantity: 1,
              unitAmount: 1000,
              totalAmount: 1000,
            },
          ],
          createdAt: '2025-03-10T00:00:00.000Z',
          updatedAt: '2025-03-10T00:00:00.000Z',
        },
      ],
      nextCursor: null,
    });

    const { result } = renderHook(() => usePaymentHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]?.invoice?.status).toBe('paid');
  });

  it('supports empty state', async () => {
    const { useCurrentUser } = await import('../chat/useCurrentUser');
    vi.mocked(useCurrentUser).mockReturnValue('member-1');

    const { api } = await import('../../lib/api');
    vi.mocked(api.membership.listPayments).mockResolvedValue({ items: [], nextCursor: null });
    vi.mocked(api.membership.listInvoices).mockResolvedValue({ items: [], nextCursor: null });

    const { result } = renderHook(() => usePaymentHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toEqual([]);
  });

  it('surfaces fetch errors', async () => {
    const { useCurrentUser } = await import('../chat/useCurrentUser');
    vi.mocked(useCurrentUser).mockReturnValue('member-1');

    const { api } = await import('../../lib/api');
    vi.mocked(api.membership.listPayments).mockRejectedValue(new Error('billing failed'));

    const { result } = renderHook(() => usePaymentHistory());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error?.message).toBe('billing failed');
  });
});
