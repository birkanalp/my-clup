import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@myclup/supabase';

vi.mock('@/src/server/bookings', () => ({
  cancelExistingBooking: vi.fn(),
}));

import { POST } from './route';
import * as bookingsServer from '@/src/server/bookings';

const mockCancelExistingBooking = vi.mocked(bookingsServer.cancelExistingBooking);
const id = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/v1/bookings/:id/cancel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission denied', async () => {
    mockCancelExistingBooking.mockRejectedValue(new ForbiddenError('No tenant scope'));
    const req = new NextRequest(`http://localhost:3001/api/v1/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ reason: 'member_requested' }),
    });
    const res = await POST(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(403);
  });
});
