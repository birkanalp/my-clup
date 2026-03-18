-- Task 15.1: gyms table (root tenant)
-- Epic #15, Issue #69
-- Per docs/07-technical-plan.md §5.1: gym is the root tenant

CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for slug lookups (tenant discovery)
CREATE INDEX idx_gyms_slug ON public.gyms(slug);

-- RLS enabled; policies added in 20250318000008 (after gym_staff, user_role_assignments exist)
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.gyms IS 'Root tenant entity. Branch is operational scope.';
