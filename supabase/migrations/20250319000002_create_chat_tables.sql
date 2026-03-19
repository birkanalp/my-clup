-- Task 17.1: Chat subsystem tables
-- Epic #17, Issue #97
-- Per docs/07-technical-plan.md §7: conversations, participants, messages, attachments, receipts, assignments

-- conversations: conversation metadata, tenant-scoped by gym_id
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  type public.conversation_type NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure branch belongs to gym when branch_id is set
ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_branch_gym_match
  CHECK (
    branch_id IS NULL
    OR EXISTS (SELECT 1 FROM public.branches b WHERE b.id = conversations.branch_id AND b.gym_id = conversations.gym_id)
  );

-- conversation_participants: membership in a conversation
CREATE TABLE public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- messages: durable message content, idempotent via dedupe_key
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  dedupe_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint for idempotency: one message per (conversation_id, dedupe_key) when dedupe_key is set
CREATE UNIQUE INDEX idx_messages_dedupe
  ON public.messages(conversation_id, dedupe_key)
  WHERE dedupe_key IS NOT NULL;

-- message_attachments: attachment metadata (storage in Supabase Storage)
CREATE TABLE public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  filename TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- message_receipts: per-participant read state
CREATE TABLE public.message_receipts (
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, participant_id)
);

-- conversation_assignments: staff assignment for support/instructor chats
CREATE TABLE public.conversation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  unassigned_at TIMESTAMPTZ
);

COMMENT ON TABLE public.conversations IS 'Chat conversations; tenant-scoped by gym_id';
COMMENT ON TABLE public.conversation_participants IS 'Conversation membership; validates access before message access';
COMMENT ON TABLE public.messages IS 'Durable messages; dedupe_key enables idempotent creation';
COMMENT ON TABLE public.message_attachments IS 'Attachment metadata; files in Supabase Storage';
COMMENT ON TABLE public.message_receipts IS 'Per-participant read state';
COMMENT ON TABLE public.conversation_assignments IS 'Staff assignment; auditability for reassignment';
