import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AuthRequest } from './get-session';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
};

const mockProfile = {
  user_id: 'user-123',
  display_name: 'Test User',
  avatar_url: null,
  locale: 'en',
  fallback_locale: 'en',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

function createMockRequest(overrides: Partial<{ Authorization: string }> = {}): AuthRequest {
  const headers = new Map<string, string>();
  if (overrides.Authorization) headers.set('Authorization', overrides.Authorization);
  return {
    headers: { get: (name: string) => headers.get(name) ?? null },
  };
}

const mockGetSession = vi.fn();
const mockSingle = vi.fn();

vi.mock('./get-session.js', () => ({
  getSession: (req: AuthRequest) => mockGetSession(req),
}));

vi.mock('../client/create-server-client.js', () => ({
  createServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => mockSingle(),
        }),
      }),
    }),
  }),
}));

describe('getCurrentUser', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key-at-least-32-chars',
    };
  });

  it('returns null when getSession returns null', async () => {
    mockGetSession.mockResolvedValue(null);
    const { getCurrentUser } = await import('./get-current-user.js');
    const req = createMockRequest();
    const result = await getCurrentUser(req);
    expect(result).toBeNull();
    expect(mockSingle).not.toHaveBeenCalled();
  });

  it('returns null when profile does not exist', async () => {
    mockGetSession.mockResolvedValue({
      user: mockUser,
      access_token: 'token',
      refresh_token: '',
      expires_in: 3600,
      expires_at: 0,
      token_type: 'bearer',
    });
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } });

    const { getCurrentUser } = await import('./get-current-user.js');
    const req = createMockRequest({ Authorization: 'Bearer token' });
    const result = await getCurrentUser(req);
    expect(result).toBeNull();
  });

  it('returns user and profile when session valid and profile exists', async () => {
    mockGetSession.mockResolvedValue({
      user: mockUser,
      access_token: 'token',
      refresh_token: '',
      expires_in: 3600,
      expires_at: 0,
      token_type: 'bearer',
    });
    mockSingle.mockResolvedValue({ data: mockProfile, error: null });

    const { getCurrentUser } = await import('./get-current-user.js');
    const req = createMockRequest({ Authorization: 'Bearer token' });
    const result = await getCurrentUser(req);

    expect(result).not.toBeNull();
    expect(result?.user.id).toBe('user-123');
    expect(result?.profile.user_id).toBe('user-123');
    expect(result?.profile.display_name).toBe('Test User');
  });
});
