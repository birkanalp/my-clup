/**
 * Integration tests for GET /api/v1/chat/conversations/:id/subscribe.
 *
 * Task 17.5, Issue #101 — Realtime channel validation, tenant isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { ChatSubscribeResponseSchema } from '@myclup/contracts/chat';
import { ForbiddenError, NotFoundError } from '@myclup/supabase';

vi.mock('@/src/server/chat/subscribe', () => ({
  validateChatSubscription: vi.fn(),
}));

import { GET } from './route';
import * as subscribeServer from '@/src/server/chat/subscribe';

const mockValidateChatSubscription = vi.mocked(subscribeServer.validateChatSubscription);

const CONV_ID = '550e8400-e29b-41d4-a716-446655440001';
const GYM_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('GET /api/v1/chat/conversations/:id/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockValidateChatSubscription.mockResolvedValue(null);

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/subscribe`
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(401);
  });

  it('returns 200 with channel params when user is participant', async () => {
    mockValidateChatSubscription.mockResolvedValue({
      channelName: `chat:${GYM_ID}:${CONV_ID}`,
      gymId: GYM_ID,
      conversationId: CONV_ID,
    });

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/subscribe`,
      { headers: { Authorization: 'Bearer test-token' } }
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = ChatSubscribeResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.channelName).toBe(`chat:${GYM_ID}:${CONV_ID}`);
      expect(parsed.data.gymId).toBe(GYM_ID);
      expect(parsed.data.conversationId).toBe(CONV_ID);
    }
  });

  it('returns 403 when user is not participant and has no gym access', async () => {
    mockValidateChatSubscription.mockRejectedValue(
      new ForbiddenError('Not a participant and no access to this gym')
    );

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/subscribe`,
      { headers: { Authorization: 'Bearer test-token' } }
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(403);
  });

  it('returns 404 when conversation does not exist', async () => {
    mockValidateChatSubscription.mockRejectedValue(new NotFoundError('Conversation not found'));

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/subscribe`,
      { headers: { Authorization: 'Bearer test-token' } }
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(404);
  });

  it('tenant isolation: channel name includes gym_id for scope verification', async () => {
    mockValidateChatSubscription.mockResolvedValue({
      channelName: `chat:${GYM_ID}:${CONV_ID}`,
      gymId: GYM_ID,
      conversationId: CONV_ID,
    });

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/subscribe`,
      { headers: { Authorization: 'Bearer test-token' } }
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });
    const json = (await response.json()) as {
      channelName: string;
      gymId: string;
      conversationId: string;
    };

    expect(response.status).toBe(200);
    // Channel name format enforces tenant scope: chat:gymId:conversationId
    expect(json.channelName).toMatch(new RegExp(`^chat:${GYM_ID}:`));
    expect(json.gymId).toBe(GYM_ID);
  });
});
