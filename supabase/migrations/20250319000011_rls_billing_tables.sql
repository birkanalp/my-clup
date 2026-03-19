-- Task 18.3: RLS for billing tables
-- Epic #18, Issue #120

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- Read access: tenant-scoped staff or platform_admin.
CREATE POLICY "billing_invoices_select_tenant_access"
  ON public.invoices FOR SELECT
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

CREATE POLICY "billing_payments_select_tenant_access"
  ON public.payments FOR SELECT
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

CREATE POLICY "billing_receivables_select_tenant_access"
  ON public.receivables FOR SELECT
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

CREATE POLICY "billing_installments_select_tenant_access"
  ON public.installment_plans FOR SELECT
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

CREATE POLICY "billing_discount_codes_select_tenant_access"
  ON public.discount_codes FOR SELECT
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

CREATE POLICY "billing_reminders_select_tenant_access"
  ON public.payment_reminders FOR SELECT
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

-- Write access: owners/managers/sales (tenant scoped) and platform_admin.
CREATE POLICY "billing_invoices_write_staff_access"
  ON public.invoices FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = invoices.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = invoices.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = invoices.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = invoices.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  );

CREATE POLICY "billing_payments_write_staff_access"
  ON public.payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = payments.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = payments.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = payments.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = payments.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  );

CREATE POLICY "billing_receivables_write_staff_access"
  ON public.receivables FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = receivables.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = receivables.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = receivables.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.gym_staff gs
      WHERE gs.user_id = auth.uid()
        AND gs.gym_id = receivables.gym_id
        AND gs.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager')
    )
  );

CREATE POLICY "billing_installments_write_staff_access"
  ON public.installment_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = installment_plans.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = installment_plans.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
  );

CREATE POLICY "billing_discount_codes_write_staff_access"
  ON public.discount_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = discount_codes.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = discount_codes.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
  );

CREATE POLICY "billing_reminders_write_staff_access"
  ON public.payment_reminders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = payment_reminders.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_role_assignments ura
      WHERE ura.user_id = auth.uid()
        AND (
          (ura.gym_id = payment_reminders.gym_id AND ura.role IN ('gym_owner', 'gym_manager', 'gym_sales', 'branch_manager'))
          OR (ura.role = 'platform_admin' AND ura.gym_id IS NULL)
        )
    )
  );
