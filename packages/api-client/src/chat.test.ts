/**
 * Unit tests for the chat API namespace.
 *
 * Verifies path param substitution, query params for GET, and response parsing.
 * Uses mocked fetch to avoid live network calls.
 */

import { describe, it, expect, vi } from 'vitest';
import { createApi, ApiError } from './index';

const CONV_ID = '11111111-1111-1111-1111-111111111111';
const MSG_ID = '22222222-2222-2222-2222-222222222222';
const GYM_ID = '33333333-3333-3333-3333-333333333333';
const USER_ID = '44444444-4444-4444-4444-444444444444';
const USER_ID_2 = '55555555-5555-5555-5555-555555555555';
const ASSIGN_ID = '66666666-6666-6666-6666-666666666666';

const MOCK_CONVERSATION = {
  id: CONV_ID,
  gymId: GYM_ID,
  branchId: null,
  type: 'direct' as const,
  metadata: {},
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  participants: [
    { conversationId: CONV_ID, userId: USER_ID, role: 'member', joinedAt: '2024-01-01T00:00:00Z' },
  ],
  assignment: null,
};

const MOCK_MESSAGE = {
  id: MSG_ID,
  conversationId: CONV_ID,
  senderId: USER_ID,
  content: 'Hello',
  dedupeKey: 'msg-1',
  createdAt: '2024-01-01T00:00:00Z',
};

const MOCK_LIST_CONVERSATIONS = { items: [MOCK_CONVERSATION], nextCursor: null };
const MOCK_LIST_MESSAGES = { items: [MOCK_MESSAGE], nextCursor: null };

function mockFetch(status: number, body: unknown): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : String(status),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as unknown as typeof fetch;
}

describe('chat.conversations', () => {
  it('get substitutes :id in path and returns parsed response', async () => {
    const mockFetchFn = mockFetch(200, MOCK_CONVERSATION);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.chat.conversations.get(CONV_ID);

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/chat/conversations/11111111-1111-1111-1111-111111111111',
      expect.any(Object)
    );
    expect(result.id).toBe(CONV_ID);
    expect(result.participants).toHaveLength(1);
  });

  it('list sends query params for GET', async () => {
    const mockFetchFn = mockFetch(200, MOCK_LIST_CONVERSATIONS);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    await api.chat.conversations.list({ cursor: 'abc', limit: 10 });

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/chat/conversations?cursor=abc&limit=10',
      expect.any(Object)
    );
  });

  it('create POSTs with body', async () => {
    const mockFetchFn = mockFetch(200, MOCK_CONVERSATION);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });
    const input = {
      gymId: GYM_ID,
      type: 'direct' as const,
      participantUserIds: [USER_ID_2],
    };

    const result = await api.chat.conversations.create(input);

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/chat/conversations',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(input) })
    );
    expect(result.id).toBe(CONV_ID);
  });

  it('assign substitutes :id and POSTs input', async () => {
    const mockAssign = {
      id: ASSIGN_ID,
      conversationId: CONV_ID,
      assignedToUserId: USER_ID_2,
      assignedAt: '2024-01-01T00:00:00Z',
      assignedByUserId: null,
      unassignedAt: null,
    };
    const mockFetchFn = mockFetch(200, mockAssign);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.chat.conversations.assign(CONV_ID, { assignedToUserId: USER_ID_2 });

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/chat/conversations/11111111-1111-1111-1111-111111111111/assign',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ assignedToUserId: USER_ID_2 }),
      })
    );
    expect(result.assignedToUserId).toBe(USER_ID_2);
  });
});

describe('chat.messages', () => {
  it('list substitutes conversation :id and sends query params', async () => {
    const mockFetchFn = mockFetch(200, MOCK_LIST_MESSAGES);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    await api.chat.messages.list(CONV_ID, { limit: 5 });

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/chat/conversations/11111111-1111-1111-1111-111111111111/messages?limit=5',
      expect.any(Object)
    );
  });

  it('send POSTs payload with conversation :id', async () => {
    const mockFetchFn = mockFetch(200, MOCK_MESSAGE);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });
    const payload = { content: 'Hello', dedupeKey: 'msg-1' };

    const result = await api.chat.messages.send(CONV_ID, payload);

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/chat/conversations/11111111-1111-1111-1111-111111111111/messages',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) })
    );
    expect(result.content).toBe('Hello');
  });

  it('markRead substitutes message :id and PATCHes', async () => {
    const mockReceipt = { readAt: '2024-01-01T00:00:00Z' };
    const mockFetchFn = mockFetch(200, mockReceipt);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.chat.messages.markRead(MSG_ID);

    expect(mockFetchFn).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/chat/messages/22222222-2222-2222-2222-222222222222/receipts',
      expect.objectContaining({ method: 'PATCH', body: '{}' })
    );
    expect(result).toBeDefined();
  });

  it('throws ApiError on non-2xx', async () => {
    const api = createApi({
      baseUrl: 'http://localhost:3001',
      fetch: mockFetch(404, { error: 'not found' }),
    });

    await expect(api.chat.conversations.get(CONV_ID)).rejects.toBeInstanceOf(ApiError);
    await expect(api.chat.conversations.get(CONV_ID)).rejects.toMatchObject({ status: 404 });
  });
});
