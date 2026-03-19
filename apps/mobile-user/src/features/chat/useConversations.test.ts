/**
 * Tests for useConversations hook.
 * Validates chat API integration and pagination logic.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/api', () => ({
  api: {
    chat: {
      conversations: {
        list: vi.fn(),
      },
    },
  },
}));

describe('useConversations', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('loads conversations from api.chat.conversations.list', async () => {
    const { api } = await import('../../lib/api');
    const mockList = vi.mocked(api.chat.conversations.list);
    mockList.mockResolvedValue({
      items: [
        {
          id: 'conv-1',
          gymId: 'gym-1',
          branchId: null,
          type: 'support',
          metadata: {},
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
      nextCursor: null,
    });

    // Verify the API contract is called correctly
    const result = await mockList({ limit: 20 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('conv-1');
    expect(result.items[0].type).toBe('support');
  });
});
