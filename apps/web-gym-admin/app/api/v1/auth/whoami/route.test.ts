/**
 * Integration tests for GET /api/v1/auth/whoami.
 *
 * Tests authentication gates and response shape. Uses vi.mock to isolate
 * the route handler from live Supabase connections.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { WhoamiResponseSchema } from '@myclup/contracts/auth';

// Mock the whoami server module
vi.mock('@/src/server/auth/whoami', () => ({
  whoami: vi.fn(),
}));

import { GET } from './route';
import * as whoamiServer from '@/src/server/auth/whoami';

const mockWhoami = vi.mocked(whoamiServer.whoami);

const MOCK_WHOAMI_RESPONSE = {
  user: {
    id: 'user-1',
    email: 'test@example.com',
    phone: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  profile: {
    userId: 'user-1',
    displayName: 'Test User',
    avatarUrl: null,
    localePreference: { locale: 'tr' as const },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  tenantScope: { gymId: 'gym-1', branchId: null },
  roles: [
    {
      userId: 'user-1',
      role: 'gym_owner' as const,
      gymId: 'gym-1',
      branchId: null,
      grantedAt: '2024-01-01T00:00:00Z',
      grantedBy: 'admin',
    },
  ],
};

describe('GET /api/v1/auth/whoami', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated (server module returns null)', async () => {
    mockWhoami.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3001/api/v1/auth/whoami', {
      method: 'GET',
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
    const json = (await response.json()) as { error: string };
    expect(json.error).toBe('unauthorized');
  });

  it('returns 200 with validated whoami response when authenticated', async () => {
    mockWhoami.mockResolvedValue(MOCK_WHOAMI_RESPONSE);

    const request = new NextRequest('http://localhost:3001/api/v1/auth/whoami', {
      method: 'GET',
      headers: { Authorization: 'Bearer test-token' },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = WhoamiResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.user.id).toBe('user-1');
      expect(parsed.data.profile.userId).toBe('user-1');
      expect(parsed.data.tenantScope.gymId).toBe('gym-1');
      expect(parsed.data.roles).toHaveLength(1);
    }
  });

  it('passes the request object to the server module', async () => {
    mockWhoami.mockResolvedValue(MOCK_WHOAMI_RESPONSE);

    const request = new NextRequest('http://localhost:3001/api/v1/auth/whoami', {
      method: 'GET',
      headers: { Authorization: 'Bearer some-token' },
    });

    await GET(request);

    expect(mockWhoami).toHaveBeenCalledWith(request);
  });
});
