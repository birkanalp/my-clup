import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@myclup/supabase';

vi.mock('@/src/server/membership/instances', () => ({
  freezeInstance: vi.fn(),
}));

import { POST } from './route';
import * as instancesServer from '@/src/server/membership/instances';

const mockFreezeInstance = vi.mocked(instancesServer.freezeInstance);
const id = '550e8400-e29b-41d4-a716-446655440000';

describe('POST /api/v1/memberships/instances/:id/freeze', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when permission denied', async () => {
    mockFreezeInstance.mockRejectedValue(
      new ForbiddenError('No tenant scope for membership freeze')
    );
    const req = new NextRequest(`http://localhost:3001/api/v1/memberships/instances/${id}/freeze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({
        membershipInstanceId: id,
        freezeStartAt: '2025-03-19T12:00:00.000Z',
        freezeEndAt: '2025-03-20T12:00:00.000Z',
      }),
    });
    const res = await POST(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(403);
  });
});
