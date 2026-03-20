import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@myclup/supabase';

vi.mock('@/src/server/bookings', () => ({
  listSessions: vi.fn(),
}));

import { GET } from './route';
import * as bookingsServer from '@/src/server/bookings';

const mockListSessions = vi.mocked(bookingsServer.listSessions);

describe('GET /api/v1/bookings/sessions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockListSessions.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3001/api/v1/bookings/sessions');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when permission denied', async () => {
    mockListSessions.mockRejectedValue(new ForbiddenError('No tenant scope for booking access'));
    const req = new NextRequest('http://localhost:3001/api/v1/bookings/sessions');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });
});
