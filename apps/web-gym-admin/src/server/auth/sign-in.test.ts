/**
 * Unit tests for sign-in server module.
 *
 * Covers the security-critical role gate (`checkUserHasAdminRole`) and the
 * overall sign-in flow.  Issue #220.
 *
 * Module-level constants are evaluated on import, so every test resets the
 * module registry and re-imports the module with the desired env vars.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

/** Build a minimal cookie-store mock that satisfies the SSR client factory. */
function makeCookieStore() {
  return {
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  };
}

/** Build an anon SSR client mock with configurable sign-in result. */
function makeAnonClient(opts: {
  signInResult: { data: { session: unknown; user: { id: string } } | null; error: unknown };
  signOutResult?: { error: unknown };
}) {
  const { signInResult, signOutResult = { error: null } } = opts;
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue(signInResult),
      signOut: vi.fn().mockResolvedValue(signOutResult),
    },
  };
}

/** Build a service role client mock with configurable role rows. */
function makeServiceClient(roleRows: Array<{ role: string }> | null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: roleRows, error: null }),
  };
  return {
    from: vi.fn().mockReturnValue(chain),
  };
}

const VALID_USER_ID = 'user-abc-123';

/**
 * Loads the sign-in module fresh after setting env vars.
 * Returns the `signIn` function and the mocked factory fns.
 */
async function loadModule() {
  vi.resetModules();
  vi.mock('@myclup/supabase', () => ({
    createAnonSsrServerClient: vi.fn(),
    createServerClient: vi.fn(),
  }));
  vi.mock('next/headers', () => ({
    cookies: vi.fn(),
  }));

  const supabase = await import('@myclup/supabase');
  const nextHeaders = await import('next/headers');
  const { signIn } = await import('./sign-in');

  return {
    signIn,
    mockCreateAnonSsrServerClient: vi.mocked(supabase.createAnonSsrServerClient),
    mockCreateServerClient: vi.mocked(supabase.createServerClient),
    mockCookies: vi.mocked(nextHeaders.cookies),
  };
}

describe('signIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns { ok: true } for a user with an allowed role', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');

    const { signIn, mockCreateAnonSsrServerClient, mockCreateServerClient, mockCookies } =
      await loadModule();

    mockCookies.mockResolvedValue(makeCookieStore() as never);

    const anonClient = makeAnonClient({
      signInResult: {
        data: {
          session: { access_token: 'tok', refresh_token: 'ref' },
          user: { id: VALID_USER_ID },
        },
        error: null,
      },
    });
    mockCreateAnonSsrServerClient.mockReturnValue(anonClient as never);
    mockCreateServerClient.mockReturnValue(makeServiceClient([{ role: 'gym_owner' }]) as never);

    const result = await signIn('admin@example.com', 'secret');

    expect(result).toEqual({ ok: true });
  });

  it('returns { ok: false, error: "invalid_credentials" } when Supabase auth fails', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');

    const { signIn, mockCreateAnonSsrServerClient, mockCookies } = await loadModule();

    mockCookies.mockResolvedValue(makeCookieStore() as never);

    const anonClient = makeAnonClient({
      signInResult: {
        data: null as never,
        error: { message: 'Invalid login credentials' },
      },
    });
    mockCreateAnonSsrServerClient.mockReturnValue(anonClient as never);

    const result = await signIn('wrong@example.com', 'badpass');

    expect(result).toEqual({ ok: false, error: 'invalid_credentials' });
  });

  it('returns { ok: false, error: "unauthorized_role" } when user has no allowed role', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-key');

    const { signIn, mockCreateAnonSsrServerClient, mockCreateServerClient, mockCookies } =
      await loadModule();

    mockCookies.mockResolvedValue(makeCookieStore() as never);

    const anonClient = makeAnonClient({
      signInResult: {
        data: {
          session: { access_token: 'tok', refresh_token: 'ref' },
          user: { id: VALID_USER_ID },
        },
        error: null,
      },
    });
    mockCreateAnonSsrServerClient.mockReturnValue(anonClient as never);
    // User exists but has no matching roles
    mockCreateServerClient.mockReturnValue(makeServiceClient([]) as never);

    const result = await signIn('member@example.com', 'secret');

    expect(result).toEqual({ ok: false, error: 'unauthorized_role' });
    // The anon client should have been told to sign out immediately
    expect(anonClient.auth.signOut).toHaveBeenCalledOnce();
  });

  it('allows through when SUPABASE_SERVICE_ROLE_KEY env var is absent', async () => {
    // When the service role key is missing the module falls through and returns
    // ok: true — downstream BFF whoami enforces roles on subsequent requests.
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    const { signIn, mockCreateAnonSsrServerClient, mockCreateServerClient, mockCookies } =
      await loadModule();

    mockCookies.mockResolvedValue(makeCookieStore() as never);

    const anonClient = makeAnonClient({
      signInResult: {
        data: {
          session: { access_token: 'tok', refresh_token: 'ref' },
          user: { id: VALID_USER_ID },
        },
        error: null,
      },
    });
    mockCreateAnonSsrServerClient.mockReturnValue(anonClient as never);

    const result = await signIn('admin@example.com', 'secret');

    expect(result).toEqual({ ok: true });
    // createServerClient must not be called when service role key is absent
    expect(mockCreateServerClient).not.toHaveBeenCalled();
  });
});
