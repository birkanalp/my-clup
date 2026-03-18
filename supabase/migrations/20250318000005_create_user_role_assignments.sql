-- user_role_assignments: platform/gym/branch role assignments
-- Per docs/07-technical-plan.md §5.4; role modeling via assignment tables

CREATE TABLE public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for tenant-scoped queries
CREATE INDEX idx_user_role_assignments_user_id ON public.user_role_assignments(user_id);
CREATE INDEX idx_user_role_assignments_gym_id ON public.user_role_assignments(gym_id) WHERE gym_id IS NOT NULL;
CREATE INDEX idx_user_role_assignments_branch_id ON public.user_role_assignments(branch_id) WHERE branch_id IS NOT NULL;

-- RLS in 20250318000010_rls_user_role_assignments_gym_staff.sql
