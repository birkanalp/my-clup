import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AuthRequest } from './get-session';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
} as const;

const mockSession = {
  access_token: 'valid-token',
  refresh_token: 'refresh',
  expires_in: 3600,
  expires_at: 1234567890,
  token_type: 'bearer' as const,
  user: mockUser,
};

function createMockRequest(
  overrides: Partial<{ Authorization: string; Cookie: string }> = {}
): AuthRequest {
  const headers = new Map<string, string>();
  if (overrides.Authorization) headers.set('Authorization', overrides.Authorization);
  if (overrides.Cookie) headers.set('Cookie', overrides.Cookie);

  return {
    headers: {
      get(name: string) {
        return headers.get(name) ?? null;
      },
    },
  };
}

const bearerGetUserMock = vi.fn();
const ssrGetSessionMock = vi.fn();
const ssrGetUserMock = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: bearerGetUserMock },
  }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getSession: () => ssrGetSessionMock(),
      getUser: (token?: string) => ssrGetUserMock(token),
    },
  }),
  parseCookieHeader: (header: string) => {
    if (!header) return [];
    return header.split(';').map((part) => {
      const [name, value] = part.trim().split('=');
      return { name: name ?? '', value: value ?? '' };
    });
  },
}));

describe('getSession', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key-at-least-32-chars',
    };
  });

  it('returns null when env vars are missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';
    vi.resetModules();
    const { getSession } = await import('./get-session.js');
    const req = createMockRequest({ Authorization: 'Bearer token' });
    const session = await getSession(req);
    expect(session).toBeNull();
  });

  it('returns null when no Authorization or Cookie headers', async () => {
    ssrGetSessionMock.mockResolvedValue({ data: { session: null }, error: null });
    vi.resetModules();
    const { getSession } = await import('./get-session.js');
    const req = createMockRequest();
    const session = await getSession(req);
    expect(session).toBeNull();
  });

  it('returns null when Authorization is not Bearer format', async () => {
    ssrGetSessionMock.mockResolvedValue({ data: { session: null }, error: null });
    vi.resetModules();
    const { getSession } = await import('./get-session.js');
    const req = createMockRequest({ Authorization: 'Basic xxx' });
    const session = await getSession(req);
    expect(session).toBeNull();
  });

  it('returns null when Bearer token fails getUser validation', async () => {
    bearerGetUserMock.mockResolvedValue({ data: { user: null }, error: { message: 'Invalid' } });
    const { getSession } = await import('./get-session.js');
    const req = createMockRequest({ Authorization: 'Bearer invalid-token' });
    const session = await getSession(req);
    expect(session).toBeNull();
  });

  it('returns session when Bearer token is valid', async () => {
    bearerGetUserMock.mockResolvedValue({ data: { user: mockUser }, error: null });
    const { getSession } = await import('./get-session.js');
    const req = createMockRequest({ Authorization: 'Bearer valid-token' });
    const session = await getSession(req);
    expect(session).not.toBeNull();
    expect(session?.user.id).toBe('user-123');
    expect(session?.access_token).toBe('valid-token');
  });

  it('returns null when cookie flow has no session', async () => {
    ssrGetSessionMock.mockResolvedValue({ data: { session: null }, error: null });
    const { getSession } = await import('./get-session.js');
    const req = createMockRequest({ Cookie: 'some=cookie' });
    const session = await getSession(req);
    expect(session).toBeNull();
  });

  it('returns session when cookie flow has valid session', async () => {
    ssrGetSessionMock.mockResolvedValue({ data: { session: mockSession }, error: null });
    ssrGetUserMock.mockResolvedValue({ data: { user: mockUser }, error: null });
    const { getSession } = await import('./get-session.js');
    const req = createMockRequest({ Cookie: 'sb-auth-token=value' });
    const session = await getSession(req);
    expect(session).not.toBeNull();
    expect(session?.user.id).toBe('user-123');
  });
});
