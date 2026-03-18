-- RLS for audit_events
-- audit_events: insert-only for service role; no public read
-- RLS enabled with no SELECT/UPDATE/DELETE policies = no one can read/update/delete
-- Service role bypasses RLS, so only server-side code can insert

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- No policies for anon or authenticated = full deny for normal users
-- Service role bypasses RLS and is used by server to insert audit events
