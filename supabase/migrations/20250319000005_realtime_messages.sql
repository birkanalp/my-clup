-- Task 17.5: Enable Supabase Realtime for messages table
-- Epic #17, Issue #101
-- Per docs/07-technical-plan.md §7.1: Live updates via Supabase Realtime
-- RLS on messages restricts delivery to conversation participants

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
