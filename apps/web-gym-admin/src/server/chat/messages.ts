/**
 * Chat messages server module.
 *
 * List messages (cursor pagination), send message (idempotent via dedupe_key).
 * Validates membership before message access.
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { NextRequest } from 'next/server';
import type {
  CreateMessageInput,
  CursorPageParams,
  CursorPageResult,
  Message,
} from '@myclup/contracts/chat';
import { CursorPageParamsSchema } from '@myclup/contracts/chat';
import {
  getCurrentUser,
  createServerClient,
  resolveTenantScope,
  ForbiddenError,
  NotFoundError,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function dbToMessage(row: {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  dedupe_key: string | null;
  created_at: string;
  message_attachments?: Array<{
    id: string;
    message_id: string;
    storage_path: string;
    mime_type: string | null;
    filename: string | null;
    created_at: string;
  }>;
}): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    dedupeKey: row.dedupe_key,
    createdAt: row.created_at,
    attachments: row.message_attachments?.map((a) => ({
      id: a.id,
      messageId: a.message_id,
      storagePath: a.storage_path,
      mimeType: a.mime_type,
      filename: a.filename,
      createdAt: a.created_at,
    })),
  };
}

/**
 * Parse cursor pagination params from URL search params.
 */
function parseCursorParams(req: NextRequest): CursorPageParams {
  const params = req.nextUrl.searchParams;
  const limitParam = params.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 20;
  const cursor = params.get('cursor') ?? undefined;
  const parsed = CursorPageParamsSchema.safeParse({ cursor, limit });
  if (!parsed.success) {
    return { cursor: undefined, limit: 20 };
  }
  return parsed.data;
}

/**
 * List messages for a conversation. Cursor-based pagination.
 * Validates membership before access.
 */
export async function listMessages(
  req: NextRequest,
  conversationId: string
): Promise<CursorPageResult<Message> | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });

  const userId = currentUser.user.id;

  // Validate membership: user must be a participant
  const { data: participant } = await client
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .single();

  if (!participant) {
    throw new ForbiddenError('Not a participant in this conversation');
  }

  // Fetch conversation to verify tenant scope
  const { data: conv } = await client
    .from('conversations')
    .select('gym_id')
    .eq('id', conversationId)
    .single();

  if (!conv) {
    throw new NotFoundError('Conversation not found');
  }

  const scopes = await resolveTenantScope(client, userId, conv.gym_id);
  if (scopes.length === 0) {
    throw new ForbiddenError('No access to this gym');
  }

  const params = parseCursorParams(req);
  const pageSize = params.limit + 1;

  let query = client
    .from('messages')
    .select('id, conversation_id, sender_id, content, dedupe_key, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(pageSize);

  if (params.cursor) {
    // Cursor is created_at of the last message; fetch messages before that
    const { data: cursorMsg } = await client
      .from('messages')
      .select('created_at')
      .eq('id', params.cursor)
      .eq('conversation_id', conversationId)
      .single();

    if (cursorMsg) {
      query = query.lt('created_at', cursorMsg.created_at);
    }
  }

  const { data: rows, error } = await query;

  if (error) {
    console.error('[chat/messages] list error:', error);
    throw new Error('Failed to list messages');
  }

  const items = (rows ?? [])
    .slice(0, params.limit)
    .map((r: unknown) => dbToMessage(r as Parameters<typeof dbToMessage>[0]));
  const hasMore = (rows ?? []).length > params.limit;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

/**
 * Send a message. Idempotent via dedupe_key.
 * If a message with the same (conversation_id, dedupe_key) exists, return it.
 */
export async function sendMessage(
  req: NextRequest,
  conversationId: string,
  input: CreateMessageInput
): Promise<Message | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });

  const userId = currentUser.user.id;

  // Validate membership
  const { data: participant } = await client
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .single();

  if (!participant) {
    throw new ForbiddenError('Not a participant in this conversation');
  }

  const { data: conv } = await client
    .from('conversations')
    .select('gym_id')
    .eq('id', conversationId)
    .single();

  if (!conv) {
    throw new NotFoundError('Conversation not found');
  }

  const scopes = await resolveTenantScope(client, userId, conv.gym_id);
  if (scopes.length === 0) {
    throw new ForbiddenError('No access to this gym');
  }

  // Idempotency: check for existing message with same dedupe_key
  const { data: existing } = await client
    .from('messages')
    .select(
      `
      id,
      conversation_id,
      sender_id,
      content,
      dedupe_key,
      created_at
    `
    )
    .eq('conversation_id', conversationId)
    .eq('dedupe_key', input.dedupeKey)
    .single();

  if (existing) {
    return dbToMessage({
      ...existing,
      message_attachments: [],
    });
  }

  const { data: inserted, error } = await client
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content: input.content,
      dedupe_key: input.dedupeKey,
    })
    .select(
      `
      id,
      conversation_id,
      sender_id,
      content,
      dedupe_key,
      created_at
    `
    )
    .single();

  if (error) {
    // Handle unique constraint violation (race condition)
    if (error.code === '23505') {
      const { data: raceExisting } = await client
        .from('messages')
        .select(
          `
          id,
          conversation_id,
          sender_id,
          content,
          dedupe_key,
          created_at
        `
        )
        .eq('conversation_id', conversationId)
        .eq('dedupe_key', input.dedupeKey)
        .single();
      if (raceExisting) {
        return dbToMessage({ ...raceExisting, message_attachments: [] });
      }
    }
    console.error('[chat/messages] send error:', error);
    throw new Error('Failed to send message');
  }

  return dbToMessage({ ...inserted, message_attachments: [] });
}
