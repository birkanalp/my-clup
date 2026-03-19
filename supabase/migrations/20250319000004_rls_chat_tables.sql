-- Task 17.1: RLS for chat tables
-- Epic #17, Issue #97
-- Tenant isolation via gym_id; membership validation before message access
-- Per .cursor/rules/chat-first-realtime-safety.mdc

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_assignments ENABLE ROW LEVEL SECURITY;

-- conversations: SELECT when user is participant (membership-based access)
CREATE POLICY "conversations_select_participant"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
    )
  );

-- conversation_participants: SELECT when user is participant or has gym access (staff can see participants)
CREATE POLICY "conversation_participants_select_own_conversations"
  ON public.conversation_participants FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
    )
    OR
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.gym_id IN (
        SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
        UNION
        SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_role_assignments
      WHERE user_id = auth.uid() AND role = 'platform_admin' AND gym_id IS NULL
    )
  );

-- messages: SELECT when user is participant (membership validation before message access)
CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
    )
  );

-- messages: INSERT when user is participant and is sender
CREATE POLICY "messages_insert_participant_sender"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND conversation_id IN (
      SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
    )
  );

-- message_attachments: SELECT when user can read the message
CREATE POLICY "message_attachments_select_participant"
  ON public.message_attachments FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT m.id FROM public.messages m
      WHERE m.conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
      )
    )
  );

-- message_attachments: INSERT when user is message sender
CREATE POLICY "message_attachments_insert_sender"
  ON public.message_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    message_id IN (
      SELECT id FROM public.messages WHERE sender_id = auth.uid()
    )
  );

-- message_receipts: SELECT when user is participant
CREATE POLICY "message_receipts_select_participant"
  ON public.message_receipts FOR SELECT
  TO authenticated
  USING (
    message_id IN (
      SELECT m.id FROM public.messages m
      WHERE m.conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
      )
    )
  );

-- message_receipts: INSERT/UPDATE when user is participant (mark own read state)
CREATE POLICY "message_receipts_insert_own"
  ON public.message_receipts FOR INSERT
  TO authenticated
  WITH CHECK (participant_id = auth.uid());

CREATE POLICY "message_receipts_update_own"
  ON public.message_receipts FOR UPDATE
  TO authenticated
  USING (participant_id = auth.uid())
  WITH CHECK (participant_id = auth.uid());

-- conversation_assignments: SELECT when user has gym access (staff)
CREATE POLICY "conversation_assignments_select_gym_access"
  ON public.conversation_assignments FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT c.id FROM public.conversations c
      WHERE c.gym_id IN (
        SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
        UNION
        SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_role_assignments
      WHERE user_id = auth.uid() AND role = 'platform_admin' AND gym_id IS NULL
    )
  );

-- Write operations (INSERT/UPDATE/DELETE) for conversations, participants, assignments: service role only
-- Application logic enforces tenant scope and membership; RLS restricts reads to authorized users
