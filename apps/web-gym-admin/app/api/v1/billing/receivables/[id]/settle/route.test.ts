import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/billing', () => ({
  settleReceivableServer: vi.fn(),
}));

import { POST } from './route';
import * as billingServer from '@/src/server/billing';

const mockSettleReceivableServer = vi.mocked(billingServer.settleReceivableServer);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/v1/billing/receivables/:id/settle', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for valid settle payload', async () => {
    mockSettleReceivableServer.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      memberId: validUuid,
      invoiceId: null,
      currency: 'TRY',
      amountDue: 500,
      amountPaid: 500,
      dueAt: '2025-03-20T12:00:00.000Z',
      status: 'settled',
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    const req = new NextRequest(
      `http://localhost:3001/api/v1/billing/receivables/${validUuid}/settle`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
        body: JSON.stringify({ amountPaid: 500 }),
      }
    );
    const res = await POST(req, { params: Promise.resolve({ id: validUuid }) });
    expect(res.status).toBe(200);
  });
});
