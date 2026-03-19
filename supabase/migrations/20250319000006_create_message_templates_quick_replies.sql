-- Task 17.6: Message templates and quick replies
-- Epic #17, Issue #102
-- Separate tables; locale-aware variants. Per .cursor/rules/chat-first-realtime-safety.mdc

-- message_templates: gym-scoped templates for broadcast and chat
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  key TEXT NOT NULL,
  default_locale TEXT NOT NULL DEFAULT 'tr',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, branch_id, key)
);

-- message_template_variants: locale-specific body
CREATE TABLE public.message_template_variants (
  template_id UUID NOT NULL REFERENCES public.message_templates(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (template_id, locale)
);

-- quick_replies: gym-scoped quick reply presets
CREATE TABLE public.quick_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  key TEXT NOT NULL,
  default_locale TEXT NOT NULL DEFAULT 'tr',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, branch_id, key)
);

-- quick_reply_variants: locale-specific label and body
CREATE TABLE public.quick_reply_variants (
  quick_reply_id UUID NOT NULL REFERENCES public.quick_replies(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (quick_reply_id, locale)
);

CREATE INDEX idx_message_templates_gym ON public.message_templates(gym_id);
CREATE INDEX idx_quick_replies_gym ON public.quick_replies(gym_id);

COMMENT ON TABLE public.message_templates IS 'Chat templates; locale variants in message_template_variants';
COMMENT ON TABLE public.quick_replies IS 'Quick replies; locale variants in quick_reply_variants';
