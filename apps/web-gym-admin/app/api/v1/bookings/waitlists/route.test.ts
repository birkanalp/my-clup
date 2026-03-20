import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/bookings', () => ({
  createWaitlistEntry: vi.fn(),
}));

import { POST } from './route';
import * as bookingsServer from '@/src/server/bookings';

const mockCreateWaitlistEntry = vi.mocked(bookingsServer.createWaitlistEntry);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/v1/bookings/waitlists', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for valid waitlist payload', async () => {
    mockCreateWaitlistEntry.mockResolvedValue({
      entry: {
        id: validUuid,
        sessionId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'waiting',
        position: 1,
        promotedAt: null,
        expiredAt: null,
        createdAt: '2025-03-19T12:00:00.000Z',
        updatedAt: '2025-03-19T12:00:00.000Z',
      },
    });
    const req = new NextRequest('http://localhost:3001/api/v1/bookings/waitlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ sessionId: validUuid, memberId: validUuid }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
