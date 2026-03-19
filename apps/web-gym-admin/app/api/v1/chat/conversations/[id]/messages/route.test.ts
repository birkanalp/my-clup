/**
 * Integration tests for GET/POST /api/v1/chat/conversations/:id/messages.
 *
 * Task 17.11, Issue #107 — Auth, tenant permissions, send message, list messages.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { ListMessagesResponseSchema, MessageSchema } from '@myclup/contracts/chat';
import { ForbiddenError, NotFoundError } from '@myclup/supabase';

vi.mock('@/src/server/chat/messages', () => ({
  listMessages: vi.fn(),
  sendMessage: vi.fn(),
}));

import { GET, POST } from './route';
import * as msgServer from '@/src/server/chat/messages';

const mockListMessages = vi.mocked(msgServer.listMessages);
const mockSendMessage = vi.mocked(msgServer.sendMessage);

const CONV_ID = '550e8400-e29b-41d4-a716-446655440001';
const MSG_ID = '550e8400-e29b-41d4-a716-446655440010';
const SENDER_ID = '550e8400-e29b-41d4-a716-446655440011';

describe('GET /api/v1/chat/conversations/:id/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockListMessages.mockResolvedValue(null);

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(401);
  });

  it('returns 403 when user is not participant', async () => {
    mockListMessages.mockRejectedValue(
      new ForbiddenError('Not a participant in this conversation')
    );

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`,
      { headers: { Authorization: 'Bearer test-token' } }
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(403);
  });

  it('returns 403 when user has no tenant access (cross-tenant denial)', async () => {
    mockListMessages.mockRejectedValue(new ForbiddenError('No access to this gym'));

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`,
      { headers: { Authorization: 'Bearer test-token' } }
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(403);
  });

  it('returns 200 with cursor-paginated messages when authenticated', async () => {
    mockListMessages.mockResolvedValue({
      items: [
        {
          id: MSG_ID,
          conversationId: CONV_ID,
          senderId: SENDER_ID,
          content: 'Hello',
          dedupeKey: 'dedupe-1',
          createdAt: '2024-01-01T12:00:00.000Z',
        },
      ],
      nextCursor: null,
    });

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`,
      { headers: { Authorization: 'Bearer test-token' } }
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = ListMessagesResponseSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.items).toHaveLength(1);
      expect(parsed.data.items[0].id).toBe(MSG_ID);
      expect(parsed.data.items[0].content).toBe('Hello');
      expect(parsed.data.nextCursor).toBeNull();
    }
  });

  it('returns 404 when conversation does not exist', async () => {
    mockListMessages.mockRejectedValue(new NotFoundError('Conversation not found'));

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`,
      { headers: { Authorization: 'Bearer test-token' } }
    );
    const response = await GET(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(404);
  });
});

describe('POST /api/v1/chat/conversations/:id/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockSendMessage.mockResolvedValue(null);

    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: '' },
        body: JSON.stringify({ content: 'Hi', dedupeKey: 'dedupe-1' }),
      }
    );
    const response = await POST(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(401);
  });

  it('returns 400 for invalid request body (missing dedupeKey)', async () => {
    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ content: 'Hi' }),
      }
    );
    const response = await POST(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(400);
  });

  it('returns 403 when user is not participant', async () => {
    mockSendMessage.mockRejectedValue(new ForbiddenError('Not a participant in this conversation'));

    const input = { content: 'Hello', dedupeKey: 'dedupe-1' };
    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(input),
      }
    );
    const response = await POST(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(403);
  });

  it('returns 200 with created message when authenticated and valid input', async () => {
    mockSendMessage.mockResolvedValue({
      id: MSG_ID,
      conversationId: CONV_ID,
      senderId: SENDER_ID,
      content: 'Hello',
      dedupeKey: 'dedupe-1',
      createdAt: '2024-01-01T12:00:00.000Z',
    });

    const input = { content: 'Hello', dedupeKey: 'dedupe-1' };
    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(input),
      }
    );
    const response = await POST(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(200);
    const json = (await response.json()) as unknown;
    const parsed = MessageSchema.safeParse(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe(MSG_ID);
      expect(parsed.data.content).toBe('Hello');
      expect(parsed.data.dedupeKey).toBe('dedupe-1');
    }
    expect(mockSendMessage).toHaveBeenCalledWith(request, CONV_ID, input);
  });

  it('idempotency: returns existing message when dedupe_key matches', async () => {
    const existingMsg = {
      id: MSG_ID,
      conversationId: CONV_ID,
      senderId: SENDER_ID,
      content: 'Hello',
      dedupeKey: 'dedupe-1',
      createdAt: '2024-01-01T12:00:00.000Z',
    };
    mockSendMessage.mockResolvedValue(existingMsg);

    const input = { content: 'Hello', dedupeKey: 'dedupe-1' };
    const request = new NextRequest(
      `http://localhost:3001/api/v1/chat/conversations/${CONV_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify(input),
      }
    );
    const response = await POST(request, { params: Promise.resolve({ id: CONV_ID }) });

    expect(response.status).toBe(200);
    const json = (await response.json()) as { id: string };
    expect(json.id).toBe(MSG_ID);
  });
});
