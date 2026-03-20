import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/bookings', () => ({
  patchAttendance: vi.fn(),
}));

import { PATCH } from './route';
import * as bookingsServer from '@/src/server/bookings';

const mockPatchAttendance = vi.mocked(bookingsServer.patchAttendance);
const id = '550e8400-e29b-41d4-a716-446655440000';

describe('PATCH /api/v1/bookings/:id/attendance', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for valid attendance payload', async () => {
    mockPatchAttendance.mockResolvedValue({
      booking: {
        id,
        sessionId: id,
        memberId: id,
        gymId: id,
        branchId: null,
        status: 'attended',
        attendanceStatus: 'checked_in',
        bookedAt: '2025-03-19T12:00:00.000Z',
        cancelledAt: null,
        waitlistedAt: null,
        checkInAt: '2025-03-19T12:05:00.000Z',
        waitlistPosition: null,
        notes: null,
        createdAt: '2025-03-19T12:00:00.000Z',
        updatedAt: '2025-03-19T12:05:00.000Z',
      },
    });

    const req = new NextRequest(`http://localhost:3001/api/v1/bookings/${id}/attendance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ attendanceStatus: 'checked_in' }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(200);
  });
});
