/**
 * Chat Realtime subscription validation.
 *
 * Validates that the authenticated user may subscribe to a conversation's
 * Supabase Realtime channel. Returns channel params for postgres_changes
 * (messages), presence, and typing.
 *
 * Per .cursor/rules/chat-first-realtime-safety.mdc:
 * - Tenant isolation enforced on channel subscription
 * - Presence and typing are ephemeral; no persistence
 *
 * Task 17.5, Issue #101
 */

import type { NextRequest } from 'next/server';
import type { ChatSubscribeResponse } from '@myclup/contracts/chat';
import {
  createServerClient,
  getCurrentUser,
  resolveTenantScope,
  requirePermission,
  ForbiddenError,
  NotFoundError,
  buildChatChannelName,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

/**
 * Validate that the user may subscribe to the conversation's Realtime channel.
 * Returns channel params (channelName, gymId, conversationId) for:
 * - postgres_changes on messages table (filter: conversation_id=eq.{conversationId})
 * - presence (ephemeral online/typing state)
 *
 * Membership: user must be participant OR have gym staff access with chat:read.
 * Tenant isolation: conversation.gym_id must be in user's permitted scope.
 */
export async function validateChatSubscription(
  req: NextRequest,
  conversationId: string
): Promise<ChatSubscribeResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const userId = currentUser.user.id;

  const { data: conv, error: convErr } = await client
    .from('conversations')
    .select('id, gym_id')
    .eq('id', conversationId)
    .single();

  if (convErr || !conv) throw new NotFoundError('Conversation not found');

  // Validate membership or gym access
  const { data: participant } = await client
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!participant) {
    const scopes = await resolveTenantScope(client, userId, conv.gym_id);
    if (scopes.length === 0) {
      throw new ForbiddenError('Not a participant and no access to this gym');
    }
    await requirePermission(client, userId, { gymId: conv.gym_id, branchId: null }, 'chat:read');
  }

  return {
    channelName: buildChatChannelName(conv.gym_id, conv.id),
    gymId: conv.gym_id,
    conversationId: conv.id,
  };
}
