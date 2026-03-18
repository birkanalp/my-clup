-- RLS for gyms and branches
-- gyms: root tenant table; users can read gyms they have access to (via gym_staff or user_role_assignments)
-- branches: tenant-owned by gym_id; users can read branches of gyms they have access to

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- gyms: SELECT for users who have gym_staff or user_role_assignments for this gym, or are platform_admin
CREATE POLICY "gyms_select_accessible"
  ON public.gyms FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
      UNION
      SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_role_assignments
      WHERE user_id = auth.uid() AND role = 'platform_admin' AND gym_id IS NULL
    )
  );

-- gyms: write operations via service role only (application logic enforces)
-- No INSERT/UPDATE/DELETE policies for authenticated = denied

-- branches: SELECT for users who have access to the parent gym
CREATE POLICY "branches_select_accessible"
  ON public.branches FOR SELECT
  TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
      UNION
      SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    )
    OR
    EXISTS (
      SELECT 1 FROM public.user_role_assignments
      WHERE user_id = auth.uid() AND role = 'platform_admin' AND gym_id IS NULL
    )
  );
