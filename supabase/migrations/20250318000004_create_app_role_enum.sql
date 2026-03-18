-- app_role: enum for platform, gym, and branch roles
-- Per packages/types/src/role.ts and docs/07-technical-plan.md §5.4

CREATE TYPE public.app_role AS ENUM (
  'platform_admin',
  'platform_support',
  'platform_finance',
  'gym_owner',
  'gym_manager',
  'gym_staff',
  'gym_instructor',
  'gym_receptionist',
  'gym_sales',
  'branch_manager',
  'branch_instructor',
  'branch_staff'
);
