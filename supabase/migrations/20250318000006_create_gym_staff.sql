-- gym_staff: gym-scoped staff assignment per server-side-auth-permissions-and-tenant-safety
-- Roles modeled through assignment tables, not hard-coded user types
CREATE TABLE public.gym_staff (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, gym_id, COALESCE(branch_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- Ensure branch belongs to gym when branch_id is set
ALTER TABLE public.gym_staff
  ADD CONSTRAINT gym_staff_branch_gym_match
  CHECK (
    branch_id IS NULL
    OR EXISTS (SELECT 1 FROM public.branches b WHERE b.id = gym_staff.branch_id AND b.gym_id = gym_staff.gym_id)
  );

CREATE INDEX idx_gym_staff_gym_id ON public.gym_staff(gym_id);
CREATE INDEX idx_gym_staff_branch_id ON public.gym_staff(branch_id) WHERE branch_id IS NOT NULL;
CREATE INDEX idx_gym_staff_user_id ON public.gym_staff(user_id);
