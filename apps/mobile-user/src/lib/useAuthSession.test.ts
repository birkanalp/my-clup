import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Session } from '@supabase/supabase-js';

const { mockGetSession, mockOnAuthStateChange, mockUnsubscribe } = vi.hoisted(() => {
  const mockUnsubscribe = vi.fn();
  const mockGetSession = vi.fn();
  const mockOnAuthStateChange = vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
  return { mockGetSession, mockOnAuthStateChange, mockUnsubscribe };
});

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

import { useAuthSession } from './useAuthSession';

const FAKE_SESSION: Session = {
  access_token: 'token-abc',
  refresh_token: 'refresh-abc',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-1',
    aud: 'authenticated',
    email: 'user@example.com',
    created_at: '2025-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
    role: 'authenticated',
    updated_at: '2025-01-01T00:00:00Z',
  },
};

describe('useAuthSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it('returns loading=true initially and loading=false after session resolves', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });

    const { result } = renderHook(() => useAuthSession());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.session).toBeNull();
  });

  it('returns session when one exists', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: FAKE_SESSION } });

    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.session).toEqual(FAKE_SESSION);
    expect(result.current.loading).toBe(false);
  });

  it('updates session when auth state changes', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });

    let authStateCallback: (event: string, session: Session | null) => void = () => {};
    mockOnAuthStateChange.mockImplementation(
      (cb: (event: string, session: Session | null) => void) => {
        authStateCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      }
    );

    const { result } = renderHook(() => useAuthSession());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.session).toBeNull();

    act(() => {
      authStateCallback('SIGNED_IN', FAKE_SESSION);
    });

    expect(result.current.session).toEqual(FAKE_SESSION);
  });

  it('unsubscribes on unmount', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });

    const { unmount } = renderHook(() => useAuthSession());

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
