import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/src/server/membership/instances', () => ({
  validateInstanceAccess: vi.fn(),
}));

import { GET } from './route';
import * as instancesServer from '@/src/server/membership/instances';

const mockValidateInstanceAccess = vi.mocked(instancesServer.validateInstanceAccess);
const id = '550e8400-e29b-41d4-a716-446655440000';
const branchId = '550e8400-e29b-41d4-a716-446655440001';

describe('GET /api/v1/memberships/instances/:id/access', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when branchId is missing', async () => {
    const req = new NextRequest(`http://localhost:3001/api/v1/memberships/instances/${id}/access`);
    const res = await GET(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(400);
  });

  it('returns 200 for valid validation request', async () => {
    mockValidateInstanceAccess.mockResolvedValue({
      membershipInstanceId: id,
      result: 'allowed',
      reason: 'active',
      status: 'active',
      checkedAt: '2025-03-19T12:00:00.000Z',
    });

    const req = new NextRequest(
      `http://localhost:3001/api/v1/memberships/instances/${id}/access?branchId=${branchId}`,
      {
        headers: { Authorization: 'Bearer test-token' },
      }
    );
    const res = await GET(req, { params: Promise.resolve({ id }) });
    expect(res.status).toBe(200);
  });
});
