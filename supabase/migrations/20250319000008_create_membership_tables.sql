-- Task 18.2: Membership lifecycle tables
-- Epic #18, Issue #119

CREATE TYPE IF NOT EXISTS public.membership_plan_type AS ENUM (
  'time_based',
  'session_based',
  'personal_training'
);

CREATE TYPE IF NOT EXISTS public.membership_plan_status AS ENUM ('active', 'inactive');

CREATE TYPE IF NOT EXISTS public.membership_status AS ENUM (
  'active',
  'frozen',
  'cancelled',
  'expired'
);

CREATE TABLE IF NOT EXISTS public.membership_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  name text NOT NULL,
  type public.membership_plan_type NOT NULL,
  status public.membership_plan_status NOT NULL DEFAULT 'active',
  duration_days integer NULL CHECK (duration_days IS NULL OR duration_days > 0),
  session_count integer NULL CHECK (session_count IS NULL OR session_count > 0),
  freeze_rule jsonb NOT NULL DEFAULT '{"maxDays":0,"maxCountPerPeriod":0,"period":"month"}'::jsonb,
  branch_restriction_enabled boolean NOT NULL DEFAULT false,
  allowed_branch_ids uuid[] NOT NULL DEFAULT '{}',
  pricing_tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  discount_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  trial_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.membership_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.membership_plans(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  status public.membership_status NOT NULL DEFAULT 'active',
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NULL,
  remaining_sessions integer NULL CHECK (remaining_sessions IS NULL OR remaining_sessions >= 0),
  entitled_branch_ids uuid[] NOT NULL DEFAULT '{}',
  freeze_start_at timestamptz NULL,
  freeze_end_at timestamptz NULL,
  cancelled_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_membership_plans_gym_branch
  ON public.membership_plans (gym_id, branch_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_membership_instances_gym_branch_status
  ON public.membership_instances (gym_id, branch_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_membership_instances_member
  ON public.membership_instances (member_id, updated_at DESC);
