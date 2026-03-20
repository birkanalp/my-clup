import type { WhoamiResponse } from '@myclup/contracts/auth';

export type StaffRole = WhoamiResponse['roles'][number]['role'];

export type GymNavKey =
  | 'dashboard'
  | 'members'
  | 'membershipPlans'
  | 'billing'
  | 'schedule'
  | 'chat'
  | 'campaigns'
  | 'reports'
  | 'listing';

export function rolesFromWhoami(assignments: WhoamiResponse['roles']): StaffRole[] {
  return assignments.map((a) => a.role);
}

const PLATFORM: StaffRole[] = ['platform_admin', 'platform_support', 'platform_finance'];

function hasAnyRole(roles: Set<StaffRole>, allowed: StaffRole[]): boolean {
  return allowed.some((r) => roles.has(r));
}

/**
 * Role-aware primary navigation for gym admin web (sidebar).
 */
export function getGymAdminSidebarVisibility(roles: StaffRole[]): Record<GymNavKey, boolean> {
  if (roles.length === 0) {
    return {
      dashboard: true,
      members: false,
      membershipPlans: false,
      billing: false,
      schedule: true,
      chat: true,
      campaigns: false,
      reports: false,
      listing: false,
    };
  }

  const set = new Set(roles);
  if (hasAnyRole(set, PLATFORM)) {
    const all: Record<GymNavKey, boolean> = {
      dashboard: true,
      members: true,
      membershipPlans: true,
      billing: true,
      schedule: true,
      chat: true,
      campaigns: true,
      reports: true,
      listing: true,
    };
    return all;
  }

  const ops: StaffRole[] = [
    'gym_owner',
    'gym_manager',
    'branch_manager',
    'gym_staff',
    'gym_receptionist',
    'gym_sales',
    'gym_instructor',
    'branch_instructor',
    'branch_staff',
  ];

  const financeOps: StaffRole[] = ['gym_owner', 'gym_manager', 'branch_manager', 'gym_staff'];

  const campaignOps: StaffRole[] = [
    'gym_owner',
    'gym_manager',
    'gym_sales',
    'gym_receptionist',
    'branch_manager',
  ];

  const reportOps: StaffRole[] = ['gym_owner', 'gym_manager', 'branch_manager'];

  const listingOps: StaffRole[] = ['gym_owner', 'gym_manager', 'branch_manager'];

  return {
    dashboard: hasAnyRole(set, ops),
    members: hasAnyRole(set, ops),
    membershipPlans: hasAnyRole(set, financeOps),
    billing: hasAnyRole(set, financeOps),
    schedule: hasAnyRole(set, ops),
    chat: hasAnyRole(set, ops),
    campaigns: hasAnyRole(set, campaignOps),
    reports: hasAnyRole(set, reportOps),
    listing: hasAnyRole(set, listingOps),
  };
}
