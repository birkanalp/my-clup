/**
 * Chat conversation assignment server module.
 *
 * Assign conversation to staff. Unassigns current assignment, inserts new one.
 * Audit: assignment changes preserve auditability.
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import type { NextRequest } from 'next/server';
import type { AssignConversationInput, ConversationAssignment } from '@myclup/contracts/chat';
import {
  getCurrentUser,
  createServerClient,
  requirePermission,
  NotFoundError,
  writeAuditEvent,
  AUDIT_EVENT_TYPES,
} from '@myclup/supabase';

function dbToAssignment(row: {
  id: string;
  conversation_id: string;
  assigned_to_user_id: string;
  assigned_at: string;
  assigned_by_user_id: string | null;
  unassigned_at: string | null;
}): ConversationAssignment {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    assignedToUserId: row.assigned_to_user_id,
    assignedAt: row.assigned_at,
    assignedByUserId: row.assigned_by_user_id,
    unassignedAt: row.unassigned_at,
  };
}

/**
 * Assign conversation to a staff user.
 * Requires chat:write permission in the conversation's gym.
 */
export async function assignConversation(
  req: NextRequest,
  conversationId: string,
  input: AssignConversationInput
): Promise<ConversationAssignment | null> {
  const currentUser = await getCurrentUser(req);
  if (!currentUser) return null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !serviceRoleKey) return null;

  const client = createServerClient({
    supabaseUrl,
    serviceRoleKey,
  });

  const userId = currentUser.user.id;

  const { data: conv } = await client
    .from('conversations')
    .select('id, gym_id, branch_id')
    .eq('id', conversationId)
    .single();

  if (!conv) {
    throw new NotFoundError('Conversation not found');
  }

  const scope = { gymId: conv.gym_id, branchId: conv.branch_id };
  await requirePermission(client, userId, scope, 'chat:write');

  const now = new Date().toISOString();

  // Fetch current assignment(s) before unassign to capture "from whom" for audit
  const { data: previousAssignments } = await client
    .from('conversation_assignments')
    .select('assigned_to_user_id')
    .eq('conversation_id', conversationId)
    .is('unassigned_at', null);
  const assignedFromUserId = previousAssignments?.[0]?.assigned_to_user_id ?? null;

  // Unassign current active assignment(s)
  await client
    .from('conversation_assignments')
    .update({ unassigned_at: now })
    .eq('conversation_id', conversationId)
    .is('unassigned_at', null);

  const { data: inserted, error } = await client
    .from('conversation_assignments')
    .insert({
      conversation_id: conversationId,
      assigned_to_user_id: input.assignedToUserId,
      assigned_at: now,
      assigned_by_user_id: userId,
    })
    .select(
      'id, conversation_id, assigned_to_user_id, assigned_at, assigned_by_user_id, unassigned_at'
    )
    .single();

  if (error || !inserted) {
    console.error('[chat/assign] error:', error);
    throw new Error('Failed to assign conversation');
  }

  await writeAuditEvent(client, {
    event_type: AUDIT_EVENT_TYPES.chat_assignment,
    actor_id: userId,
    target_type: 'conversation_assignments',
    target_id: (inserted as { id: string }).id,
    payload: {
      assigned_by_user_id: userId,
      assigned_to_user_id: input.assignedToUserId,
      assigned_at: now,
      assigned_from_user_id: assignedFromUserId ?? undefined,
      assignment_id: (inserted as { id: string }).id,
    },
    tenant_context: { gym_id: conv.gym_id, branch_id: conv.branch_id ?? undefined },
  });

  return dbToAssignment(inserted as Parameters<typeof dbToAssignment>[0]);
}
