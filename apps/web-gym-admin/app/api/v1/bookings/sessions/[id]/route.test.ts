import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/bookings', () => ({
  getSession: vi.fn(),
}));

import { GET } from './route';
import * as bookingsServer from '@/src/server/bookings';

const mockGetSession = vi.mocked(bookingsServer.getSession);
const id = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/bookings/sessions/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for valid session response', async () => {
    mockGetSession.mockResolvedValue({
      id,
      gymId: id,
      branchId: null,
      kind: 'class',
      status: 'scheduled',
      title: 'Morning Class',
      startsAt: '2025-03-19T12:00:00.000Z',
      endsAt: '2025-03-19T13:00:00.000Z',
      timezone: 'Europe/Istanbul',
      instructor: null,
      capacity: 10,
      bookedCount: 4,
      waitlistCount: 1,
      availableSpots: 6,
      locationLabel: null,
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });

    const req = new NextRequest(`http://localhost:3001/api/v1/bookings/sessions/${id}`, {
      headers: { Authorization: 'Bearer test-token' },
    });
    const res = await GET(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(200);
  });
});
