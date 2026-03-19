import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/billing', () => ({
  listPaymentsServer: vi.fn(),
  logPaymentServer: vi.fn(),
}));

import { GET, POST } from './route';
import * as billingServer from '@/src/server/billing';

const mockListPaymentsServer = vi.mocked(billingServer.listPaymentsServer);
const mockLogPaymentServer = vi.mocked(billingServer.logPaymentServer);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/billing/payments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockListPaymentsServer.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3001/api/v1/billing/payments');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/billing/payments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid payload', async () => {
    const req = new NextRequest('http://localhost:3001/api/v1/billing/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ invalid: true }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 for valid payment log payload', async () => {
    mockLogPaymentServer.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      memberId: validUuid,
      invoiceId: null,
      currency: 'TRY',
      amount: 1000,
      method: 'cash',
      status: 'succeeded',
      paidAt: '2025-03-19T12:00:00.000Z',
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    const req = new NextRequest('http://localhost:3001/api/v1/billing/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({
        gymId: validUuid,
        memberId: validUuid,
        currency: 'TRY',
        amount: 1000,
        method: 'cash',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
