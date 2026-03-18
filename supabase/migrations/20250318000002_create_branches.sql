-- Task 15.1: branches table (operational scope under gym)
-- Epic #15, Issue #69

CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_branches_gym_id ON public.branches(gym_id);

-- RLS enabled; policies added in 20250318000008 (after gym_staff, user_role_assignments exist)
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.branches IS 'Operational scope under gym. Branch-level roles apply here.';
