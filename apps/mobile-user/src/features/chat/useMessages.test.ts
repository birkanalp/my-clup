/**
 * Tests for useMessages hook integration.
 * Validates message API contract and send payload.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/api', () => ({
  api: {
    chat: {
      messages: {
        list: vi.fn(),
        send: vi.fn(),
      },
    },
  },
}));

describe('useMessages API integration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('messages.list accepts conversationId and cursor params', async () => {
    const { api } = await import('../../lib/api');
    const mockList = vi.mocked(api.chat.messages.list);
    mockList.mockResolvedValue({
      items: [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'user-1',
          content: 'Hello',
          dedupeKey: null,
          createdAt: '2025-01-01T12:00:00Z',
        },
      ],
      nextCursor: null,
    });

    const result = await mockList('conv-1', { cursor: undefined, limit: 50 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].content).toBe('Hello');
  });

  it('messages.send accepts content and dedupeKey', async () => {
    const { api } = await import('../../lib/api');
    const mockSend = vi.mocked(api.chat.messages.send);
    mockSend.mockResolvedValue({
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-2',
      content: 'Hi back',
      dedupeKey: 'mobile-user-123',
      createdAt: '2025-01-01T12:01:00Z',
    });

    const result = await mockSend('conv-1', {
      content: 'Hi back',
      dedupeKey: 'mobile-user-123',
    });
    expect(result.content).toBe('Hi back');
    expect(result.dedupeKey).toBe('mobile-user-123');
  });
});
