import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock next-intl middleware — always returns a 200 response so the auth
// branch runs.
vi.mock('next-intl/middleware', () => ({
  default: () => () => new NextResponse(null, { status: 200 }),
}));

// Mock @myclup/supabase getSession
vi.mock('@myclup/supabase', () => ({
  getSession: vi.fn(),
}));

// routing mock
vi.mock('./src/i18n/routing', () => ({
  routing: {
    locales: ['en', 'tr'],
    defaultLocale: 'en',
  },
}));

import middleware from './middleware';
import { getSession } from '@myclup/supabase';

const mockGetSession = vi.mocked(getSession);

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost:3001${path}`, { method: 'GET' });
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects unauthenticated request to sign-in', async () => {
    mockGetSession.mockResolvedValue(null);

    const req = makeRequest('/en/members');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/en/sign-in');
  });

  it('allows access to sign-in path without authentication', async () => {
    // getSession should not be called for public paths
    const req = makeRequest('/en/sign-in');
    const res = await middleware(req);

    expect(res.status).toBe(200);
    expect(mockGetSession).not.toHaveBeenCalled();
  });

  it('treats dev-login as a protected path in non-development environments', async () => {
    // Vitest runs with NODE_ENV === 'test', so /dev-login must NOT be in
    // PUBLIC_PATHS — the middleware should check for a session and redirect
    // unauthenticated requests to sign-in.
    mockGetSession.mockResolvedValue(null);

    const req = makeRequest('/en/dev-login');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/en/sign-in');
  });

  it('allows access to dev-login when NODE_ENV is development', async () => {
    // PUBLIC_PATHS is evaluated at module load time, so we must reset modules,
    // stub NODE_ENV, then re-import to pick up the new value.
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'development');

    vi.mock('next-intl/middleware', () => ({
      default: () => () => new NextResponse(null, { status: 200 }),
    }));
    vi.mock('@myclup/supabase', () => ({
      getSession: vi.fn(),
    }));
    vi.mock('./src/i18n/routing', () => ({
      routing: {
        locales: ['en', 'tr'],
        defaultLocale: 'en',
      },
    }));

    const { default: devMiddleware } = await import('./middleware');

    const req = makeRequest('/en/dev-login');
    const res = await devMiddleware(req);

    expect(res.status).toBe(200);

    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('passes through authenticated request', async () => {
    mockGetSession.mockResolvedValue({
      access_token: 'test-token',
      refresh_token: 'refresh',
      expires_in: 3600,
      expires_at: 9999999999,
      token_type: 'bearer',
      user: {
        id: 'user-1',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01T00:00:00Z',
      },
    });

    const req = makeRequest('/en/members');
    const res = await middleware(req);

    expect(res.status).toBe(200);
  });

  it('preserves locale in redirect URL', async () => {
    mockGetSession.mockResolvedValue(null);

    const req = makeRequest('/tr/members');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location') ?? '';
    expect(location).toContain('/tr/sign-in');
  });
});
