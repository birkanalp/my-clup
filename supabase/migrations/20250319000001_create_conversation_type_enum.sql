-- Task 17.1: conversation_type enum for chat subsystem
-- Epic #17, Issue #97
-- Per docs/07-technical-plan.md §7.2: direct, member-to-gym support, member-to-instructor,
-- group, broadcast, internal staff

CREATE TYPE public.conversation_type AS ENUM (
  'direct',
  'support',
  'instructor',
  'group',
  'broadcast',
  'internal_staff'
);

COMMENT ON TYPE public.conversation_type IS 'Chat conversation types per technical plan §7.2';
