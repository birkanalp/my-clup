-- Task 17.1: Indexes for chat tables
-- Epic #17, Issue #97
-- Cursor pagination, tenant lookup, unread counts

-- conversations: tenant and branch lookup
CREATE INDEX idx_conversations_gym_id ON public.conversations(gym_id);
CREATE INDEX idx_conversations_branch_id ON public.conversations(branch_id) WHERE branch_id IS NOT NULL;
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);

-- conversation_participants: user's conversations, conversation's participants
CREATE INDEX idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);

-- messages: cursor pagination by created_at, conversation lookup
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_conversation_created_at ON public.messages(conversation_id, created_at DESC);

-- message_attachments: by message
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);

-- message_receipts: unread lookup (messages without receipt for participant)
CREATE INDEX idx_message_receipts_message_id ON public.message_receipts(message_id);
CREATE INDEX idx_message_receipts_participant_id ON public.message_receipts(participant_id);

-- conversation_assignments: active assignments, by conversation
CREATE INDEX idx_conversation_assignments_conversation_id ON public.conversation_assignments(conversation_id);
CREATE INDEX idx_conversation_assignments_assigned_to ON public.conversation_assignments(assigned_to_user_id)
  WHERE unassigned_at IS NULL;
