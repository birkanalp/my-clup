/**
 * Unit tests for chat Realtime channel helpers.
 *
 * Task 17.5, Issue #101
 */

import { describe, it, expect } from 'vitest';
import {
  buildChatChannelName,
  parseChatChannelName,
  buildMessageConversationFilter,
  CHAT_CHANNEL_PREFIX,
} from './chat-channel';

describe('buildChatChannelName', () => {
  it('returns tenant-scoped channel name', () => {
    const gymId = '550e8400-e29b-41d4-a716-446655440000';
    const conversationId = '550e8400-e29b-41d4-a716-446655440001';
    expect(buildChatChannelName(gymId, conversationId)).toBe(
      'chat:550e8400-e29b-41d4-a716-446655440000:550e8400-e29b-41d4-a716-446655440001'
    );
  });

  it('throws when gymId is empty', () => {
    expect(() => buildChatChannelName('', 'conv-id')).toThrow(
      'gymId and conversationId are required'
    );
  });

  it('throws when conversationId is empty', () => {
    expect(() => buildChatChannelName('gym-id', '')).toThrow(
      'gymId and conversationId are required'
    );
  });
});

describe('parseChatChannelName', () => {
  it('parses valid channel name', () => {
    const result = parseChatChannelName('chat:gym-123:conv-456');
    expect(result).toEqual({ gymId: 'gym-123', conversationId: 'conv-456' });
  });

  it('returns null for invalid prefix', () => {
    expect(parseChatChannelName('other:gym:conv')).toBeNull();
  });

  it('returns null for missing colon', () => {
    expect(parseChatChannelName('chat:gymOnly')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseChatChannelName('')).toBeNull();
  });
});

describe('buildMessageConversationFilter', () => {
  it('returns postgres_changes filter for conversation_id', () => {
    const convId = '550e8400-e29b-41d4-a716-446655440001';
    expect(buildMessageConversationFilter(convId)).toBe(
      'conversation_id=eq.550e8400-e29b-41d4-a716-446655440001'
    );
  });
});

describe('CHAT_CHANNEL_PREFIX', () => {
  it('is chat:', () => {
    expect(CHAT_CHANNEL_PREFIX).toBe('chat:');
  });
});
