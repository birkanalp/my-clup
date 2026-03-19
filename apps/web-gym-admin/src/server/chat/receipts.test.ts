/**
 * Integration tests for chat receipts server module.
 *
 * Verifies auth, tenant permissions, membership validation, and cross-tenant denial.
 * Task 17.11, Issue #107
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { markRead } from './receipts';
import { ForbiddenError, NotFoundError } from '@myclup/supabase';

vi.mock('@myclup/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@myclup/supabase')>();
  return {
    ...actual,
    getCurrentUser: vi.fn(),
    createServerClient: vi.fn(),
    resolveTenantScope: vi.fn(),
  };
});

import * as supabase from '@myclup/supabase';

const mockUser = {
  id: 'user-gym-a',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
} as supabase.CurrentUser['user'];

const MSG_ID = '550e8400-e29b-41d4-a716-446655440010';
const CONV_ID = '550e8400-e29b-41d4-a716-446655440001';
const GYM_A = '550e8400-e29b-41d4-a716-446655440000';
const GYM_B = '550e8400-e29b-41d4-a716-446655440002';

function makeMockClient(opts: {
  msg: { id: string; conversation_id: string } | null;
  participant: { conversation_id: string } | null;
  conv: { gym_id: string } | null;
  upsertError?: Error | null;
}) {
  const { msg, participant, conv, upsertError = null } = opts;

  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'messages') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: msg, error: null }),
          }),
        }),
      };
    }
    if (table === 'conversation_participants') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: participant, error: null }),
            }),
          }),
        }),
      };
    }
    if (table === 'conversations') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: conv, error: null }),
          }),
        }),
      };
    }
    if (table === 'message_receipts') {
      return {
        upsert: vi.fn().mockResolvedValue({ error: upsertError }),
      };
    }
    return {};
  });

  return { from };
}

const mockGetCurrentUser = vi.mocked(supabase.getCurrentUser);
const mockCreateServerClient = vi.mocked(supabase.createServerClient);
const mockResolveTenantScope = vi.mocked(supabase.resolveTenantScope);

describe('markRead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when unauthenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const client = makeMockClient({
      msg: { id: MSG_ID, conversation_id: CONV_ID },
      participant: { conversation_id: CONV_ID },
      conv: { gym_id: GYM_A },
    });
    mockCreateServerClient.mockReturnValue(client as never);

    const req = new NextRequest('http://localhost/api');
    const result = await markRead(req, MSG_ID);

    expect(result).toBeNull();
  });

  it('throws NotFoundError when message does not exist', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const client = makeMockClient({
      msg: null,
      participant: null,
      conv: null,
    });
    mockCreateServerClient.mockReturnValue(client as never);

    const req = new NextRequest('http://localhost/api');
    await expect(markRead(req, MSG_ID)).rejects.toThrow(NotFoundError);
  });

  it('throws ForbiddenError when not a participant', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const client = makeMockClient({
      msg: { id: MSG_ID, conversation_id: CONV_ID },
      participant: null,
      conv: { gym_id: GYM_B },
    });
    mockCreateServerClient.mockReturnValue(client as never);

    const req = new NextRequest('http://localhost/api');
    await expect(markRead(req, MSG_ID)).rejects.toThrow(ForbiddenError);
    await expect(markRead(req, MSG_ID)).rejects.toThrow('Not a participant');
  });

  it('throws ForbiddenError when participant but no tenant scope (cross-tenant denial)', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const client = makeMockClient({
      msg: { id: MSG_ID, conversation_id: CONV_ID },
      participant: { conversation_id: CONV_ID },
      conv: { gym_id: GYM_B },
    });
    mockCreateServerClient.mockReturnValue(client as never);
    mockResolveTenantScope.mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api');
    await expect(markRead(req, MSG_ID)).rejects.toThrow(ForbiddenError);
    await expect(markRead(req, MSG_ID)).rejects.toThrow('No access to this gym');
  });

  it('returns readAt when participant and has tenant scope', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const client = makeMockClient({
      msg: { id: MSG_ID, conversation_id: CONV_ID },
      participant: { conversation_id: CONV_ID },
      conv: { gym_id: GYM_A },
    });
    mockCreateServerClient.mockReturnValue(client as never);
    mockResolveTenantScope.mockResolvedValue([{ gymId: GYM_A, branchId: null }]);

    const req = new NextRequest('http://localhost/api');
    const result = await markRead(req, MSG_ID);

    expect(result).not.toBeNull();
    expect(result!.readAt).toBeDefined();
    expect(typeof result!.readAt).toBe('string');
  });
});
