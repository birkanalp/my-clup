/**
 * Chat conversations server module.
 *
 * List, get, create conversations. Enforces tenant isolation via gym_id derived
 * from authenticated user's role assignments. Never trust client-provided tenant.
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { NextRequest } from 'next/server';
import type {
  Conversation,
  CreateConversationInput,
  CursorPageParams,
  CursorPageResult,
  GetConversationResponse,
} from '@myclup/contracts/chat';
import { CursorPageParamsSchema } from '@myclup/contracts/chat';
import type { Json } from '@myclup/supabase';
import {
  getCurrentUser,
  createServerClient,
  resolveTenantScope,
  requirePermission,
  ForbiddenError,
  NotFoundError,
} from '@myclup/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getClient() {
  return createServerClient({
    supabaseUrl: SUPABASE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

/** Parse and validate cursor pagination from URL search params. */
function parseCursorParams(req: NextRequest): CursorPageParams {
  const sp = req.nextUrl.searchParams;
  const limitParam = sp.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 20;
  const cursor = sp.get('cursor') ?? undefined;
  const parsed = CursorPageParamsSchema.safeParse({ cursor, limit });
  if (!parsed.success) {
    return { cursor: undefined, limit: 20 };
  }
  return parsed.data;
}

/** Map DB row to contract Conversation. */
function toConversation(row: {
  id: string;
  gym_id: string;
  branch_id: string | null;
  type: string;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}): Conversation {
  return {
    id: row.id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    type: row.type as Conversation['type'],
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * List conversations for the authenticated user.
 * Returns only conversations where the user is a participant.
 * Tenant isolation: RLS + server enforces user is participant.
 */
export async function listConversations(
  req: NextRequest
): Promise<CursorPageResult<Conversation> | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const params = parseCursorParams(req);
  const client = getClient();
  const userId = currentUser.user.id;

  // Get conversation IDs where user is participant
  const { data: participantRows, error: partErr } = await client
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);

  if (partErr || !participantRows?.length) {
    return { items: [], nextCursor: null };
  }

  const conversationIds = participantRows.map((r) => r.conversation_id);

  let query = client
    .from('conversations')
    .select('id, gym_id, branch_id, type, metadata, created_at, updated_at')
    .in('id', conversationIds)
    .order('updated_at', { ascending: false })
    .limit(params.limit + 1);

  if (params.cursor) {
    const { data: cursorRow } = await client
      .from('conversations')
      .select('updated_at')
      .eq('id', params.cursor)
      .single();
    if (cursorRow?.updated_at) {
      query = query.lt('updated_at', cursorRow.updated_at);
    }
  }

  const { data: rows, error } = await query;

  if (error || !rows) {
    return { items: [], nextCursor: null };
  }

  const hasMore = rows.length > params.limit;
  const items = (hasMore ? rows.slice(0, params.limit) : rows).map(toConversation);
  const nextCursor = hasMore ? (rows[params.limit - 1]?.id ?? null) : null;

  return { items, nextCursor };
}

/**
 * Get a single conversation with participants and assignment.
 * Validates membership: user must be participant or have gym staff access.
 */
export async function getConversation(
  req: NextRequest,
  conversationId: string
): Promise<GetConversationResponse | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const userId = currentUser.user.id;

  const { data: conv, error: convErr } = await client
    .from('conversations')
    .select('id, gym_id, branch_id, type, metadata, created_at, updated_at')
    .eq('id', conversationId)
    .single();

  if (convErr || !conv) throw new NotFoundError('Conversation not found');

  // Validate access: user must be participant or have gym access
  const { data: participant } = await client
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .maybeSingle();

  const isParticipant = !!participant;

  if (!isParticipant) {
    const scopes = await resolveTenantScope(client, userId, conv.gym_id);
    if (scopes.length === 0) {
      throw new ForbiddenError('User is not a participant and has no gym access');
    }
    await requirePermission(
      client,
      userId,
      { gymId: conv.gym_id, branchId: conv.branch_id },
      'chat:read'
    );
  }

  const { data: participantRows } = await client
    .from('conversation_participants')
    .select('conversation_id, user_id, role, joined_at')
    .eq('conversation_id', conversationId);

  const { data: assignmentRow } = await client
    .from('conversation_assignments')
    .select(
      'id, conversation_id, assigned_to_user_id, assigned_at, assigned_by_user_id, unassigned_at'
    )
    .eq('conversation_id', conversationId)
    .is('unassigned_at', null)
    .order('assigned_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    ...toConversation(conv),
    participants: (participantRows ?? []).map((p) => ({
      conversationId: p.conversation_id,
      userId: p.user_id,
      role: p.role,
      joinedAt: p.joined_at,
    })),
    assignment: assignmentRow
      ? {
          id: assignmentRow.id,
          conversationId: assignmentRow.conversation_id,
          assignedToUserId: assignmentRow.assigned_to_user_id,
          assignedAt: assignmentRow.assigned_at,
          assignedByUserId: assignmentRow.assigned_by_user_id,
          unassignedAt: assignmentRow.unassigned_at,
        }
      : null,
  };
}

/**
 * Create a new conversation.
 * Validates that gymId is in the user's permitted scopes. Never trust client-provided tenant.
 */
export async function createConversation(
  req: NextRequest,
  input: CreateConversationInput
): Promise<Conversation | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return null;

  const client = getClient();
  const userId = currentUser.user.id;

  // Validate tenant scope: user must have access to the gym
  const scopes = await resolveTenantScope(client, userId, input.gymId);
  if (scopes.length === 0) {
    throw new ForbiddenError('User does not have access to the specified gym');
  }
  await requirePermission(
    client,
    userId,
    { gymId: input.gymId, branchId: input.branchId ?? null },
    'chat:write'
  );

  const { data: conv, error } = await client
    .from('conversations')
    .insert({
      gym_id: input.gymId,
      branch_id: input.branchId ?? null,
      type: input.type,
      metadata: (input.metadata ?? {}) as Json,
    })
    .select('id, gym_id, branch_id, type, metadata, created_at, updated_at')
    .single();

  if (error || !conv) return null;

  const participants = input.participantUserIds.map((uid, i) => ({
    conversation_id: conv.id,
    user_id: uid,
    role: i === 0 ? 'creator' : 'member',
  }));

  const { error: partErr } = await client.from('conversation_participants').insert(participants);
  if (partErr) {
    console.error('[chat] failed to insert participants:', partErr);
    return null;
  }

  return toConversation(conv);
}
