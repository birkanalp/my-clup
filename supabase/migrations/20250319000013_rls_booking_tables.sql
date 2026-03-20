-- Task 19.2: RLS for scheduling and booking tables
-- Epic #19, Issue #146

ALTER TABLE public.booking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "booking_sessions_select_tenant_access"
  ON public.booking_sessions FOR SELECT
  TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
      UNION
      SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    )
    OR EXISTS (
      SELECT 1 FROM public.user_role_assignments
      WHERE user_id = auth.uid() AND role = 'platform_admin' AND gym_id IS NULL
    )
  );

CREATE POLICY "bookings_select_tenant_or_member_access"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    member_id = auth.uid()
    OR gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
      UNION
      SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    )
    OR EXISTS (
      SELECT 1 FROM public.user_role_assignments
      WHERE user_id = auth.uid() AND role = 'platform_admin' AND gym_id IS NULL
    )
  );

CREATE POLICY "booking_waitlist_select_tenant_or_member_access"
  ON public.booking_waitlist_entries FOR SELECT
  TO authenticated
  USING (
    member_id = auth.uid()
    OR gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
      UNION
      SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    )
    OR EXISTS (
      SELECT 1 FROM public.user_role_assignments
      WHERE user_id = auth.uid() AND role = 'platform_admin' AND gym_id IS NULL
    )
  );

CREATE POLICY "instructor_availability_select_tenant_access"
  ON public.instructor_availability FOR SELECT
  TO authenticated
  USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
      UNION
      SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    )
    OR EXISTS (
      SELECT 1 FROM public.user_role_assignments
      WHERE user_id = auth.uid() AND role = 'platform_admin' AND gym_id IS NULL
    )
  );

CREATE POLICY "booking_sessions_write_staff_access"
  ON public.booking_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = booking_sessions.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_instructor'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = booking_sessions.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_instructor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = booking_sessions.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_instructor'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = booking_sessions.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_instructor')
    )
  );

CREATE POLICY "bookings_write_staff_or_member_access"
  ON public.bookings FOR ALL
  TO authenticated
  USING (
    member_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = bookings.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_staff', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_staff', 'branch_instructor'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = bookings.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_staff', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_staff', 'branch_instructor')
    )
  )
  WITH CHECK (
    member_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = bookings.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_staff', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_staff', 'branch_instructor'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = bookings.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_staff', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_staff', 'branch_instructor')
    )
  );

CREATE POLICY "booking_waitlist_write_staff_or_member_access"
  ON public.booking_waitlist_entries FOR ALL
  TO authenticated
  USING (
    member_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = booking_waitlist_entries.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_staff', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_staff', 'branch_instructor'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = booking_waitlist_entries.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_staff', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_staff', 'branch_instructor')
    )
  )
  WITH CHECK (
    member_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = booking_waitlist_entries.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_staff', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_staff', 'branch_instructor'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = booking_waitlist_entries.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_staff', 'gym_instructor', 'gym_receptionist', 'branch_manager', 'branch_staff', 'branch_instructor')
    )
  );

CREATE POLICY "instructor_availability_write_staff_access"
  ON public.instructor_availability FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = instructor_availability.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_instructor', 'branch_manager', 'branch_instructor'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = instructor_availability.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_instructor', 'branch_manager', 'branch_instructor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = instructor_availability.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_instructor', 'branch_manager', 'branch_instructor'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = instructor_availability.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_instructor', 'branch_manager', 'branch_instructor')
    )
  );
