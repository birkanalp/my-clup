-- Task 17.6: RLS for message_templates and quick_replies
-- Epic #17, Issue #102
-- Tenant isolation: gym staff with gym access can read/write

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_template_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_reply_variants ENABLE ROW LEVEL SECURITY;

-- message_templates: SELECT when user has gym access
CREATE POLICY "message_templates_select_gym_access"
  ON public.message_templates FOR SELECT
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

CREATE POLICY "message_templates_insert_gym_access"
  ON public.message_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
      UNION
      SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    )
  );

-- message_template_variants: follow template access
CREATE POLICY "message_template_variants_select"
  ON public.message_template_variants FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM public.message_templates
      WHERE gym_id IN (
        SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
        UNION
        SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
      )
    )
  );

-- quick_replies: same as message_templates
CREATE POLICY "quick_replies_select_gym_access"
  ON public.quick_replies FOR SELECT
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

CREATE POLICY "quick_replies_insert_gym_access"
  ON public.quick_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
      UNION
      SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
    )
  );

-- quick_reply_variants
CREATE POLICY "quick_reply_variants_select"
  ON public.quick_reply_variants FOR SELECT
  TO authenticated
  USING (
    quick_reply_id IN (
      SELECT id FROM public.quick_replies
      WHERE gym_id IN (
        SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
        UNION
        SELECT gym_id FROM public.user_role_assignments WHERE user_id = auth.uid() AND gym_id IS NOT NULL
      )
    )
  );
