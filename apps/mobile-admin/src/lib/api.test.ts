/**
 * Unit tests for API client — chat namespace.
 * Task 17.9 (#105): Mobile-Admin Chat Experience
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./supabase', () => ({ supabase: null }));

describe('api', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exposes chat namespace with conversations and messages', async () => {
    const { api } = await import('./api');
    expect(api.chat).toBeDefined();
    expect(api.chat.conversations).toBeDefined();
    expect(typeof api.chat.conversations.list).toBe('function');
    expect(typeof api.chat.conversations.get).toBe('function');
    expect(api.chat.messages).toBeDefined();
    expect(typeof api.chat.messages.list).toBe('function');
    expect(typeof api.chat.messages.send).toBe('function');
  });
});
