import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/bookings', () => ({
  listAvailability: vi.fn(),
}));

import { GET } from './route';
import * as bookingsServer from '@/src/server/bookings';

const mockListAvailability = vi.mocked(bookingsServer.listAvailability);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/bookings/instructor-availability', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 for valid availability response', async () => {
    mockListAvailability.mockResolvedValue({
      items: [
        {
          id: validUuid,
          instructorUserId: validUuid,
          gymId: validUuid,
          branchId: null,
          startsAt: '2025-03-19T12:00:00.000Z',
          endsAt: '2025-03-19T13:00:00.000Z',
          status: 'available',
          note: null,
          createdAt: '2025-03-19T12:00:00.000Z',
          updatedAt: '2025-03-19T12:00:00.000Z',
        },
      ],
    });
    const req = new NextRequest('http://localhost:3001/api/v1/bookings/instructor-availability', {
      headers: { Authorization: 'Bearer test-token' },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
