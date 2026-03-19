/**
 * Integration tests for chat messages server module.
 *
 * Verifies auth, tenant permissions, membership validation, and cross-tenant denial.
 * Task 17.11, Issue #107
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { listMessages, sendMessage } from './messages';
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

const CONV_ID = '550e8400-e29b-41d4-a716-446655440001';
const GYM_A = '550e8400-e29b-41d4-a716-446655440000';
const GYM_B = '550e8400-e29b-41d4-a716-446655440002';

function makeMockClient(opts: {
  participant: { conversation_id: string } | null;
  conv: { gym_id: string } | null;
  messages?: Array<{ id: string; conversation_id: string; sender_id: string; content: string; dedupe_key: string | null; created_at: string }>;
}) {
  const { participant, conv, messages = [] } = opts;

  const from = vi.fn().mockImplementation((table: string) => {
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
    if (table === 'messages') {
      const chain: Record<string, ReturnType<typeof vi.fn>> = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: messages, error: null }),
        lt: vi.fn().mockReturnThis(),
      };
      return chain;
    }
    return {};
  });

  return { from };
}

const mockGetCurrentUser = vi.mocked(supabase.getCurrentUser);
const mockCreateServerClient = vi.mocked(supabase.createServerClient);
const mockResolveTenantScope = vi.mocked(supabase.resolveTenantScope);

describe('listMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
  });

  it('returns null when unauthenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const client = makeMockClient({
      participant: { conversation_id: CONV_ID },
      conv: { gym_id: GYM_A },
    });
    mockCreateServerClient.mockReturnValue(client as never);

    const req = new NextRequest(`http://localhost/api/conversations/${CONV_ID}/messages`);
    const result = await listMessages(req, CONV_ID);

    expect(result).toBeNull();
  });

  it('throws ForbiddenError when user is not a participant (cross-tenant or unauthorized)', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const client = makeMockClient({
      participant: null,
      conv: { gym_id: GYM_B },
    });
    mockCreateServerClient.mockReturnValue(client as never);

    const req = new NextRequest(`http://localhost/api/conversations/${CONV_ID}/messages`);
    await expect(listMessages(req, CONV_ID)).rejects.toThrow(ForbiddenError);
    await expect(listMessages(req, CONV_ID)).rejects.toThrow(/Not a participant/);
  });

  it('throws ForbiddenError when participant but no tenant scope (cross-tenant denial)', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const client = makeMockClient({
      participant: { conversation_id: CONV_ID },
      conv: { gym_id: GYM_B },
    });
    mockCreateServerClient.mockReturnValue(client as never);
    mockResolveTenantScope.mockResolvedValue([]);

    const req = new NextRequest(`http://localhost/api/conversations/${CONV_ID}/messages`);
    await expect(listMessages(req, CONV_ID)).rejects.toThrow(ForbiddenError);
    await expect(listMessages(req, CONV_ID)).rejects.toThrow(/No access to this gym/);
  });

  it('throws NotFoundError when conversation does not exist', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const client = makeMockClient({
      participant: { conversation_id: CONV_ID },
      conv: null,
    });
    mockCreateServerClient.mockReturnValue(client as never);

    const req = new NextRequest(`http://localhost/api/conversations/${CONV_ID}/messages`);
    await expect(listMessages(req, CONV_ID)).rejects.toThrow(NotFoundError);
  });

  it('returns messages when participant and has tenant scope', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const msgs = [
      {
        id: 'msg-1',
        conversation_id: CONV_ID,
        sender_id: mockUser.id,
        content: 'Hello',
        dedupe_key: 'dk-1',
        created_at: '2024-01-01T12:00:00.000Z',
      },
    ];
    const client = makeMockClient({
      participant: { conversation_id: CONV_ID },
      conv: { gym_id: GYM_A },
      messages: msgs,
    });
    mockCreateServerClient.mockReturnValue(client as never);
    mockResolveTenantScope.mockResolvedValue([{ gymId: GYM_A, branchId: null }]);

    const req = new NextRequest(`http://localhost/api/conversations/${CONV_ID}/messages`);
    const result = await listMessages(req, CONV_ID);

    expect(result).not.toBeNull();
    expect(result!.items).toHaveLength(1);
    expect(result!.items[0].content).toBe('Hello');
    expect(result!.items[0].conversationId).toBe(CONV_ID);
  });
});

describe('sendMessage', () => {
  const input = { content: 'Hello', dedupeKey: 'dedupe-1' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when unauthenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const client = makeMockClient({
      participant: { conversation_id: CONV_ID },
      conv: { gym_id: GYM_A },
    });
    mockCreateServerClient.mockReturnValue(client as never);

    const req = new NextRequest('http://localhost/api', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const result = await sendMessage(req, CONV_ID, input);

    expect(result).toBeNull();
  });

  it('throws ForbiddenError when not a participant', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const client = makeMockClient({
      participant: null,
      conv: { gym_id: GYM_B },
    });
    mockCreateServerClient.mockReturnValue(client as never);

    const req = new NextRequest('http://localhost/api', { method: 'POST', body: JSON.stringify(input) });
    await expect(sendMessage(req, CONV_ID, input)).rejects.toThrow(ForbiddenError);
    await expect(sendMessage(req, CONV_ID, input)).rejects.toThrow(/Not a participant/);
  });

  it('throws ForbiddenError when participant but no tenant scope (cross-tenant denial)', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: mockUser, profile: {} as supabase.Profile });
    const client = makeMockClient({
      participant: { conversation_id: CONV_ID },
      conv: { gym_id: GYM_B },
    });
    mockCreateServerClient.mockReturnValue(client as never);
    mockResolveTenantScope.mockResolvedValue([]);

    const req = new NextRequest('http://localhost/api', { method: 'POST', body: JSON.stringify(input) });
    await expect(sendMessage(req, CONV_ID, input)).rejects.toThrow(ForbiddenError);
    await expect(sendMessage(req, CONV_ID, input)).rejects.toThrow(/No access to this gym/);
  });
});
