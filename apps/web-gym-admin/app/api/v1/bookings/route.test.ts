import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/bookings', () => ({
  listAllBookings: vi.fn(),
  createNewBooking: vi.fn(),
}));

import { GET, POST } from './route';
import * as bookingsServer from '@/src/server/bookings';

const mockListAllBookings = vi.mocked(bookingsServer.listAllBookings);
const mockCreateNewBooking = vi.mocked(bookingsServer.createNewBooking);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/bookings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for valid booking list', async () => {
    mockListAllBookings.mockResolvedValue({ items: [], nextCursor: null });
    const req = new NextRequest('http://localhost:3001/api/v1/bookings', {
      headers: { Authorization: 'Bearer test-token' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});

describe('POST /api/v1/bookings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid body', async () => {
    const req = new NextRequest('http://localhost:3001/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ invalid: true }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 for valid create booking payload', async () => {
    mockCreateNewBooking.mockResolvedValue({
      booking: {
        id: validUuid,
        sessionId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'booked',
        attendanceStatus: 'pending',
        bookedAt: '2025-03-19T12:00:00.000Z',
        cancelledAt: null,
        waitlistedAt: null,
        checkInAt: null,
        waitlistPosition: null,
        notes: null,
        createdAt: '2025-03-19T12:00:00.000Z',
        updatedAt: '2025-03-19T12:00:00.000Z',
      },
    });

    const req = new NextRequest('http://localhost:3001/api/v1/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ sessionId: validUuid, memberId: validUuid }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
