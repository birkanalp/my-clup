-- profiles: user profile data linked to auth.users
-- Per docs/07-technical-plan.md §5.1, §6.4
-- Localization: locale, fallback_locale support per mandatory i18n rules

CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  locale TEXT NOT NULL DEFAULT 'tr',
  fallback_locale TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for common lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- RLS in 20250318000009_rls_profiles.sql
