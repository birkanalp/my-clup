-- RLS for user_role_assignments and gym_staff
-- user_role_assignments: users can read their own assignments; writes via service role
-- gym_staff: users can read their own staff rows; gym-scoped read for staff in same gym; writes via service role

ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_staff ENABLE ROW LEVEL SECURITY;

-- user_role_assignments: users can only read their own rows
CREATE POLICY "user_role_assignments_select_own"
  ON public.user_role_assignments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- gym_staff: users can read their own staff assignments
CREATE POLICY "gym_staff_select_own"
  ON public.gym_staff FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- gym_staff: gym/branch admins can read staff in their scope
-- Users with gym_staff or user_role_assignments for a gym can read other staff in that gym
CREATE POLICY "gym_staff_select_gym_scope"
  ON public.gym_staff FOR SELECT
  TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
      UNION
      SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    )
  );
