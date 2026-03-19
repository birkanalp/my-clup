/**
 * Chat message receipts server module.
 *
 * Mark message as read (upsert receipt).
 * Validates membership before access.
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { NextRequest } from 'next/server';
import type { MessageReceiptUpdate } from '@myclup/contracts/chat';
import {
  getCurrentUser,
  createServerClient,
  resolveTenantScope,
  ForbiddenError,
  NotFoundError,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Mark a message as read for the current user.
 * Uses message_id from path; participant_id = current user.
 */
export async function markRead(
  req: NextRequest,
  messageId: string
): Promise<MessageReceiptUpdate | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });

  const userId = currentUser.user.id;

  // Fetch message and conversation
  const { data: msg } = await client
    .from('messages')
    .select('id, conversation_id')
    .eq('id', messageId)
    .single();

  if (!msg) {
    throw new NotFoundError('Message not found');
  }

  // Validate membership
  const { data: participant } = await client
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', msg.conversation_id)
    .eq('user_id', userId)
    .single();

  if (!participant) {
    throw new ForbiddenError('Not a participant in this conversation');
  }

  const { data: conv } = await client
    .from('conversations')
    .select('gym_id')
    .eq('id', msg.conversation_id)
    .single();

  if (!conv) {
    throw new NotFoundError('Conversation not found');
  }

  const scopes = await resolveTenantScope(client, userId, conv.gym_id);
  if (scopes.length === 0) {
    throw new ForbiddenError('No access to this gym');
  }

  const readAt = new Date().toISOString();

  const { error } = await client.from('message_receipts').upsert(
    {
      message_id: messageId,
      participant_id: userId,
      read_at: readAt,
    },
    {
      onConflict: 'message_id,participant_id',
    }
  );

  if (error) {
    console.error('[chat/receipts] markRead error:', error);
    throw new Error('Failed to mark message as read');
  }

  return { readAt };
}
