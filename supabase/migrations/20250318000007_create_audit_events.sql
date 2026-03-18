-- audit_events: immutable audit log for sensitive operations
-- Per server-side-auth-permissions-and-tenant-safety: role changes, billing overrides,
-- membership extension, refunds, admin impersonation, cross-tenant support must be audited
CREATE TABLE public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  payload JSONB DEFAULT '{}',
  tenant_context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_event_type ON public.audit_events(event_type);
CREATE INDEX idx_audit_events_actor_id ON public.audit_events(actor_id);
CREATE INDEX idx_audit_events_created_at ON public.audit_events(created_at);

-- Enable RLS
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- audit_events: insert-only for service role; no public read
-- No SELECT for anon or authenticated; only service role can insert
CREATE POLICY audit_events_insert_service_role
  ON public.audit_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Deny all other access (no SELECT/UPDATE/DELETE for any role except via service role for insert)
-- Default: no policies for SELECT/UPDATE/DELETE means no access
COMMENT ON TABLE public.audit_events IS 'Insert-only audit log; service role writes; no read access for anon/authenticated';
