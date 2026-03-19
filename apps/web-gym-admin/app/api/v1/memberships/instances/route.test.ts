import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@myclup/supabase';

vi.mock('@/src/server/membership/instances', () => ({
  listInstances: vi.fn(),
  assignInstance: vi.fn(),
}));

import { GET, POST } from './route';
import * as instancesServer from '@/src/server/membership/instances';

const mockListInstances = vi.mocked(instancesServer.listInstances);
const mockAssignInstance = vi.mocked(instancesServer.assignInstance);
const validUuid = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/memberships/instances', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when unauthenticated', async () => {
    mockListInstances.mockResolvedValue(null);
    const req = new NextRequest('http://localhost:3001/api/v1/memberships/instances');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when permission denied', async () => {
    mockListInstances.mockRejectedValue(
      new ForbiddenError('No tenant scope for membership instances')
    );
    const req = new NextRequest('http://localhost:3001/api/v1/memberships/instances', {
      headers: { Authorization: 'Bearer test-token' },
    });
    const res = await GET(req);
    expect(res.status).toBe(403);
  });
});

describe('POST /api/v1/memberships/instances', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid body', async () => {
    const req = new NextRequest('http://localhost:3001/api/v1/memberships/instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({ invalid: true }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 200 for valid assignment payload', async () => {
    mockAssignInstance.mockResolvedValue({
      id: validUuid,
      planId: validUuid,
      memberId: validUuid,
      gymId: validUuid,
      branchId: null,
      status: 'active',
      validFrom: '2025-03-19T12:00:00.000Z',
      validUntil: null,
      remainingSessions: null,
      entitledBranchIds: [],
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });

    const req = new NextRequest('http://localhost:3001/api/v1/memberships/instances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: JSON.stringify({
        planId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        validFrom: '2025-03-19T12:00:00.000Z',
        validUntil: null,
        entitledBranchIds: [],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
