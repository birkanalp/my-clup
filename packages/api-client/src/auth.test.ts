/**
 * Unit tests for the auth API namespace.
 *
 * Tests that auth methods call the correct contracts and parse responses.
 * Uses mocked fetch to avoid live network calls.
 */

import { describe, it, expect, vi } from 'vitest';
import { createApi, ApiError } from './index';
import {
  WhoamiResponseSchema,
  SessionResponseSchema,
  ProfilePatchResponseSchema,
} from '@myclup/contracts/auth';

const MOCK_WHOAMI = {
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

const MOCK_SESSION_VALID = { valid: true };

const MOCK_PROFILE = {
  userId: 'user-1',
  displayName: 'Updated Name',
  avatarUrl: null,
  localePreference: { locale: 'en' as const },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
};

function mockFetch(status: number, body: unknown): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : String(status),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as unknown as typeof fetch;
}

describe('auth.whoami', () => {
  it('calls GET /api/v1/auth/whoami with auth headers and returns parsed response', async () => {
    const mockFetchFn = mockFetch(200, MOCK_WHOAMI);
    const authHeaders = { Authorization: 'Bearer test-token' };
    const getAuthHeaders = vi.fn().mockResolvedValue(authHeaders);

    const api = createApi({
      baseUrl: 'http://localhost:3001',
      fetch: mockFetchFn,
      getAuthHeaders,
    });

    const result = await api.auth.whoami();

    expect(getAuthHeaders).toHaveBeenCalledOnce();
    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/auth/whoami',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    );
    expect(WhoamiResponseSchema.safeParse(result).success).toBe(true);
    expect(result.user.id).toBe('user-1');
    expect(result.tenantScope.gymId).toBe('gym-1');
  });

  it('throws ApiError with status 401 when unauthenticated', async () => {
    const mockFetchFn = mockFetch(401, { error: 'unauthorized' });
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    await expect(api.auth.whoami()).rejects.toBeInstanceOf(ApiError);
    await expect(api.auth.whoami()).rejects.toMatchObject({ status: 401 });
  });
});

describe('auth.getSession', () => {
  it('calls GET /api/v1/auth/session and returns valid:true when authenticated', async () => {
    const api = createApi({
      baseUrl: 'http://localhost:3001',
      fetch: mockFetch(200, MOCK_SESSION_VALID),
    });

    const result = await api.auth.getSession();

    expect(SessionResponseSchema.safeParse(result).success).toBe(true);
    expect(result.valid).toBe(true);
  });

  it('returns valid:false when session is absent', async () => {
    const api = createApi({
      baseUrl: 'http://localhost:3001',
      fetch: mockFetch(200, { valid: false }),
    });

    const result = await api.auth.getSession();

    expect(result.valid).toBe(false);
  });
});

describe('auth.updateProfile', () => {
  it('calls PATCH /api/v1/auth/profile with validated body and returns updated profile', async () => {
    const mockFetchFn = mockFetch(200, MOCK_PROFILE);
    const api = createApi({
      baseUrl: 'http://localhost:3001',
      fetch: mockFetchFn,
      getAuthHeaders: async () => ({ Authorization: 'Bearer test-token' }),
    });

    const input = { displayName: 'Updated Name', localePreference: { locale: 'en' as const } };
    const result = await api.auth.updateProfile(input);

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/auth/profile',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(input),
      })
    );
    expect(ProfilePatchResponseSchema.safeParse(result).success).toBe(true);
    expect(result.displayName).toBe('Updated Name');
  });

  it('throws ApiError with status 401 when unauthenticated', async () => {
    const api = createApi({
      baseUrl: 'http://localhost:3001',
      fetch: mockFetch(401, { error: 'unauthorized' }),
    });

    await expect(api.auth.updateProfile({ displayName: 'Test' })).rejects.toMatchObject({
      status: 401,
    });
  });
});

describe('getAuthHeaders injection', () => {
  it('merges getAuthHeaders result into every request', async () => {
    const mockFetchFn = mockFetch(200, MOCK_SESSION_VALID);
    const getAuthHeaders = vi.fn().mockResolvedValue({ Authorization: 'Bearer dynamic-token' });

    const api = createApi({
      baseUrl: 'http://localhost:3001',
      fetch: mockFetchFn,
      getAuthHeaders,
    });

    await api.auth.getSession();

    const callArgs = (mockFetchFn as ReturnType<typeof vi.fn>).mock.calls[0];
    const init = callArgs[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer dynamic-token');
    expect(getAuthHeaders).toHaveBeenCalledOnce();
  });

  it('auth headers take precedence over static headers', async () => {
    const mockFetchFn = mockFetch(200, MOCK_SESSION_VALID);

    const api = createApi({
      baseUrl: 'http://localhost:3001',
      fetch: mockFetchFn,
      headers: { Authorization: 'Bearer static-token', 'X-Custom': 'value' },
      getAuthHeaders: async () => ({ Authorization: 'Bearer dynamic-token' }),
    });

    await api.auth.getSession();

    const callArgs = (mockFetchFn as ReturnType<typeof vi.fn>).mock.calls[0];
    const init = callArgs[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer dynamic-token');
    expect(headers['X-Custom']).toBe('value');
  });
});
