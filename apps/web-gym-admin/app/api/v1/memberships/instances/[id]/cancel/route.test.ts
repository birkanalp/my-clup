import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@myclup/supabase';

vi.mock('@/src/server/membership/instances', () => ({
  cancelInstance: vi.fn(),
}));

import { POST } from './route';
import * as instancesServer from '@/src/server/membership/instances';

const mockCancelInstance = vi.mocked(instancesServer.cancelInstance);
const id = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/v1/memberships/instances/:id/cancel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission denied', async () => {
    mockCancelInstance.mockRejectedValue(
      new ForbiddenError('No tenant scope for membership cancellation')
    );
    const req = new NextRequest(`http://localhost:3001/api/v1/memberships/instances/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ membershipInstanceId: id, cancelledAt: '2025-03-19T12:00:00.000Z' }),
    });
    const res = await POST(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(403);
  });
});
