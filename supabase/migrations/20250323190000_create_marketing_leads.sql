-- Public marketing / website contact leads (server-side insert only via service role).
CREATE TABLE public.marketing_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL DEFAULT '',
  locale text NOT NULL DEFAULT 'en',
  source text NOT NULL DEFAULT 'web_site_contact',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX marketing_leads_created_at_idx ON public.marketing_leads (created_at DESC);

COMMENT ON TABLE public.marketing_leads IS 'Inbound leads from public website; no direct client reads; RLS denies anon/auth.';

ALTER TABLE public.marketing_leads ENABLE ROW LEVEL SECURITY;
