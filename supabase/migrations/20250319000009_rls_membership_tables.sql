-- Task 18.2: RLS for membership lifecycle tables
-- Epic #18, Issue #119

ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_instances ENABLE ROW LEVEL SECURITY;

-- Read policy: tenant-scoped gym access or platform_admin
CREATE POLICY "membership_plans_select_tenant_access"
  ON public.membership_plans FOR SELECT
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

CREATE POLICY "membership_instances_select_tenant_access"
  ON public.membership_instances FOR SELECT
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

-- Write policy: manager/owner/sales at gym scope or platform_admin
CREATE POLICY "membership_plans_write_staff_access"
  ON public.membership_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = membership_plans.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = membership_plans.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = membership_plans.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = membership_plans.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  );

CREATE POLICY "membership_instances_write_staff_access"
  ON public.membership_instances FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = membership_instances.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = membership_instances.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = membership_instances.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = membership_instances.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  );
