import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/billing', () => ({
  applyDiscountServer: vi.fn(),
}));

import { POST } from './route';
import * as billingServer from '@/src/server/billing';

const mockApplyDiscountServer = vi.mocked(billingServer.applyDiscountServer);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/v1/billing/discounts/apply', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for valid discount payload', async () => {
    mockApplyDiscountServer.mockResolvedValue({
      code: 'WELCOME10',
      applied: true,
      discountAmount: 100,
      finalAmount: 900,
    });
    const req = new NextRequest('http://localhost:3001/api/v1/billing/discounts/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({
        gymId: validUuid,
        memberId: validUuid,
        code: 'WELCOME10',
        originalAmount: 1000,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
