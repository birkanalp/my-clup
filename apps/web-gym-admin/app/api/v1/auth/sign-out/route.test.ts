import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/src/server/auth/sign-out', () => ({
  signOut: vi.fn(),
}));

import { POST } from './route';
import * as signOutServer from '@/src/server/auth/sign-out';

const mockSignOut = vi.mocked(signOutServer.signOut);

describe('POST /api/v1/auth/sign-out', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls signOut and returns ok:true', async () => {
    mockSignOut.mockResolvedValue(undefined);

    const response = await POST();

    expect(response.status).toBe(200);
    const json = (await response.json()) as { ok: boolean };
    expect(json.ok).toBe(true);
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('propagates errors from signOut', async () => {
    mockSignOut.mockRejectedValue(new Error('Supabase error'));

    await expect(POST()).rejects.toThrow('Supabase error');
  });
});
