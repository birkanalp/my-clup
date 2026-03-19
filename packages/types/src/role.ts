/**
 * Permission model supports platform, gym, branch, feature, and action levels.
 * Per docs/07-technical-plan.md §5.4
 */

export type PlatformRole = 'platform_admin' | 'platform_support' | 'platform_finance';

export type GymRole =
  | 'gym_owner'
  | 'gym_manager'
  | 'gym_staff'
  | 'gym_instructor'
  | 'gym_receptionist'
  | 'gym_sales';

export type BranchRole = 'branch_manager' | 'branch_instructor' | 'branch_staff';

export type FeaturePermission =
  | 'members:read'
  | 'members:write'
  | 'bookings:read'
  | 'bookings:write'
  | 'payments:read'
  | 'payments:write'
  | 'chat:read'
  | 'chat:write'
  | 'classes:read'
  | 'classes:write'
  | 'reports:read'
  | 'settings:write'
  | 'roles:write'
  | 'billing:override';

export interface RoleAssignment {
  userId: string;
  role: PlatformRole | GymRole | BranchRole;
  gymId: string | null; // null for platform-level roles
  branchId: string | null; // null for gym-wide roles
  grantedAt: string;
  grantedBy: string;
}
