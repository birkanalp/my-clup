-- Task 19.2: Scheduling and booking service tables
-- Epic #19, Issue #146

CREATE TYPE IF NOT EXISTS public.booking_session_kind AS ENUM (
  'class',
  'appointment',
  'personal_training'
);

CREATE TYPE IF NOT EXISTS public.booking_session_status AS ENUM (
  'scheduled',
  'cancelled',
  'completed'
);

CREATE TYPE IF NOT EXISTS public.booking_status AS ENUM (
  'booked',
  'cancelled',
  'waitlisted',
  'attended',
  'no_show'
);

CREATE TYPE IF NOT EXISTS public.attendance_status AS ENUM (
  'pending',
  'checked_in',
  'completed',
  'missed',
  'cancelled'
);

CREATE TYPE IF NOT EXISTS public.waitlist_status AS ENUM (
  'waiting',
  'promoted',
  'expired',
  'cancelled'
);

CREATE TYPE IF NOT EXISTS public.availability_status AS ENUM (
  'available',
  'blocked',
  'tentative'
);

CREATE TABLE IF NOT EXISTS public.booking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  kind public.booking_session_kind NOT NULL,
  status public.booking_session_status NOT NULL DEFAULT 'scheduled',
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  timezone text NOT NULL,
  instructor_user_id uuid NULL,
  instructor_display_name text NULL,
  capacity integer NOT NULL CHECK (capacity >= 0),
  booked_count integer NOT NULL DEFAULT 0 CHECK (booked_count >= 0),
  waitlist_count integer NOT NULL DEFAULT 0 CHECK (waitlist_count >= 0),
  location_label text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at),
  CHECK (booked_count <= capacity)
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.booking_sessions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  status public.booking_status NOT NULL DEFAULT 'booked',
  attendance_status public.attendance_status NOT NULL DEFAULT 'pending',
  booked_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz NULL,
  waitlisted_at timestamptz NULL,
  check_in_at timestamptz NULL,
  waitlist_position integer NULL CHECK (waitlist_position IS NULL OR waitlist_position > 0),
  notes text NULL,
  source text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_session_member_active
  ON public.bookings (session_id, member_id)
  WHERE status IN ('booked', 'waitlisted', 'attended');

CREATE TABLE IF NOT EXISTS public.booking_waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.booking_sessions(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  status public.waitlist_status NOT NULL DEFAULT 'waiting',
  position integer NOT NULL CHECK (position > 0),
  promoted_at timestamptz NULL,
  expired_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_waitlist_session_member_active
  ON public.booking_waitlist_entries (session_id, member_id)
  WHERE status IN ('waiting', 'promoted');

CREATE TABLE IF NOT EXISTS public.instructor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_user_id uuid NOT NULL,
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status public.availability_status NOT NULL DEFAULT 'available',
  note text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_booking_sessions_scope_starts_at
  ON public.booking_sessions (gym_id, branch_id, starts_at ASC);

CREATE INDEX IF NOT EXISTS idx_bookings_scope_updated_at
  ON public.bookings (gym_id, branch_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_member_updated_at
  ON public.bookings (member_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_booking_waitlist_scope_position
  ON public.booking_waitlist_entries (gym_id, branch_id, session_id, position ASC);

CREATE INDEX IF NOT EXISTS idx_instructor_availability_scope_starts_at
  ON public.instructor_availability (gym_id, branch_id, starts_at ASC);
