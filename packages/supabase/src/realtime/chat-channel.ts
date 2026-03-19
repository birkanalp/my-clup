/**
 * Chat Realtime channel helpers.
 *
 * Task 17.5, Issue #101
 * Per .cursor/rules/chat-first-realtime-safety.mdc:
 * - Channel naming enforces tenant scope (gym_id) + conversation
 * - Message delivery via postgres_changes on messages table
 * - Presence and typing are ephemeral (not persisted)
 *
 * ⚠️ SERVER-ONLY: Used by API layer for channel validation.
 * Clients receive validated channel params and subscribe via Supabase Realtime directly.
 */

/** Channel name format: chat:gymId:conversationId — tenant-scoped, prevents cross-tenant subscription. */
export const CHAT_CHANNEL_PREFIX = 'chat:';

/** Postgres change event for message INSERTs. */
export const CHAT_MESSAGES_POSTGRES_EVENT = 'INSERT' as const;

/** Schema and table for message changes. */
export const CHAT_MESSAGES_SCHEMA = 'public' as const;
export const CHAT_MESSAGES_TABLE = 'messages' as const;

/**
 * Build tenant-scoped channel name for a conversation.
 * Format: chat:{gymId}:{conversationId}
 *
 * Ensures channel names cannot be guessed across tenants and matches
 * server-side validation before subscription.
 *
 * @param gymId - Tenant gym UUID
 * @param conversationId - Conversation UUID
 * @returns Channel name for postgres_changes, presence, and typing
 */
export function buildChatChannelName(gymId: string, conversationId: string): string {
  if (!gymId || !conversationId) {
    throw new Error('buildChatChannelName: gymId and conversationId are required');
  }
  return `${CHAT_CHANNEL_PREFIX}${gymId}:${conversationId}`;
}

/**
 * Parse channel name to extract gym and conversation IDs.
 * Returns null if format is invalid.
 */
export function parseChatChannelName(channelName: string): {
  gymId: string;
  conversationId: string;
} | null {
  if (!channelName.startsWith(CHAT_CHANNEL_PREFIX)) return null;
  const rest = channelName.slice(CHAT_CHANNEL_PREFIX.length);
  const colonIdx = rest.indexOf(':');
  if (colonIdx < 0) return null;
  const gymId = rest.slice(0, colonIdx);
  const conversationId = rest.slice(colonIdx + 1);
  if (!gymId || !conversationId) return null;
  return { gymId, conversationId };
}

/** Filter string for postgres_changes: conversation_id = conversationId */
export function buildMessageConversationFilter(conversationId: string): string {
  return `conversation_id=eq.${conversationId}`;
}
