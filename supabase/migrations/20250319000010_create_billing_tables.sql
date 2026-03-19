-- Task 18.3: Billing, invoices, receivables, reminders tables
-- Epic #18, Issue #120

CREATE TYPE IF NOT EXISTS public.invoice_status AS ENUM ('draft', 'open', 'paid', 'void', 'overdue');
CREATE TYPE IF NOT EXISTS public.payment_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');
CREATE TYPE IF NOT EXISTS public.payment_method AS ENUM ('cash', 'card', 'bank_transfer', 'online');
CREATE TYPE IF NOT EXISTS public.receivable_status AS ENUM ('open', 'partial', 'settled', 'overdue');
CREATE TYPE IF NOT EXISTS public.installment_status AS ENUM ('active', 'completed', 'defaulted');

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  member_id uuid NOT NULL,
  membership_instance_id uuid NULL REFERENCES public.membership_instances(id) ON DELETE SET NULL,
  status public.invoice_status NOT NULL DEFAULT 'open',
  currency text NOT NULL,
  subtotal_amount numeric(12,2) NOT NULL CHECK (subtotal_amount >= 0),
  discount_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount numeric(12,2) NOT NULL CHECK (total_amount >= 0),
  due_at timestamptz NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz NULL,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  locale text NOT NULL DEFAULT 'tr',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  member_id uuid NOT NULL,
  invoice_id uuid NULL REFERENCES public.invoices(id) ON DELETE SET NULL,
  currency text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  method public.payment_method NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'succeeded',
  paid_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  member_id uuid NOT NULL,
  invoice_id uuid NULL REFERENCES public.invoices(id) ON DELETE SET NULL,
  currency text NOT NULL,
  amount_due numeric(12,2) NOT NULL CHECK (amount_due >= 0),
  amount_paid numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  due_at timestamptz NOT NULL,
  status public.receivable_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.installment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  member_id uuid NOT NULL,
  invoice_id uuid NULL REFERENCES public.invoices(id) ON DELETE SET NULL,
  total_amount numeric(12,2) NOT NULL CHECK (total_amount > 0),
  installment_count integer NOT NULL CHECK (installment_count > 0),
  remaining_installments integer NOT NULL CHECK (remaining_installments >= 0),
  next_due_at timestamptz NULL,
  status public.installment_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value numeric(12,2) NOT NULL CHECK (value > 0),
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gym_id, code)
);

CREATE TABLE IF NOT EXISTS public.payment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  branch_id uuid NULL REFERENCES public.branches(id) ON DELETE SET NULL,
  member_id uuid NOT NULL,
  receivable_id uuid NULL REFERENCES public.receivables(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('sms', 'email', 'push', 'whatsapp')),
  locale text NOT NULL CHECK (locale IN ('tr', 'en')),
  status text NOT NULL CHECK (status IN ('queued', 'sent', 'failed')) DEFAULT 'queued',
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_scope ON public.invoices (gym_id, branch_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_scope ON public.payments (gym_id, branch_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_receivables_scope ON public.receivables (gym_id, branch_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_installments_scope ON public.installment_plans (gym_id, branch_id, status, updated_at DESC);
