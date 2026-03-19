import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/billing', () => ({
  listInvoicesServer: vi.fn(),
  createInvoiceServer: vi.fn(),
}));

import { GET, POST } from './route';
import * as billingServer from '@/src/server/billing';

const mockListInvoicesServer = vi.mocked(billingServer.listInvoicesServer);
const mockCreateInvoiceServer = vi.mocked(billingServer.createInvoiceServer);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/billing/invoices', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockListInvoicesServer.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3001/api/v1/billing/invoices');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/billing/invoices', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for valid create invoice payload', async () => {
    mockCreateInvoiceServer.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      memberId: validUuid,
      membershipInstanceId: null,
      status: 'open',
      currency: 'TRY',
      subtotalAmount: 1000,
      discountAmount: 100,
      totalAmount: 900,
      dueAt: '2025-03-20T12:00:00.000Z',
      issuedAt: '2025-03-19T12:00:00.000Z',
      paidAt: null,
      lineItems: [
        { id: validUuid, label: 'Plan', quantity: 1, unitAmount: 1000, totalAmount: 1000 },
      ],
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    const req = new NextRequest('http://localhost:3001/api/v1/billing/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({
        gymId: validUuid,
        memberId: validUuid,
        currency: 'TRY',
        dueAt: '2025-03-20T12:00:00.000Z',
        lineItems: [{ label: 'Plan', quantity: 1, unitAmount: 1000, totalAmount: 1000 }],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
