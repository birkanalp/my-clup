import type { WhoamiResponse } from '@myclup/contracts/auth';

export type StaffRole = WhoamiResponse['roles'][number]['role'];

export function rolesFromWhoami(assignments: WhoamiResponse['roles']): StaffRole[] {
  return assignments.map((a) => a.role);
}

const PLATFORM_ROLES: StaffRole[] = ['platform_admin', 'platform_support', 'platform_finance'];

export type TabVisibility = {
  members: boolean;
  schedule: boolean;
  chat: boolean;
  workouts: boolean;
  sales: boolean;
};

/**
 * Role-aware tab visibility for staff mobile shell.
 * When whoami is unavailable (empty role list), show a safe minimal set.
 */
export function getTabVisibility(roleList: StaffRole[]): TabVisibility {
  if (roleList.length === 0) {
    return {
      members: false,
      schedule: true,
      chat: true,
      workouts: false,
      sales: false,
    };
  }

  const roles = new Set(roleList);
  const isPlatform = [...roles].some((r) => PLATFORM_ROLES.includes(r));

  if (isPlatform) {
    return {
      members: true,
      schedule: true,
      chat: true,
      workouts: true,
      sales: true,
    };
  }

  const memberFacingRoles: StaffRole[] = [
    'gym_owner',
    'gym_manager',
    'gym_staff',
    'gym_receptionist',
    'gym_sales',
    'branch_manager',
    'branch_staff',
    'gym_instructor',
    'branch_instructor',
  ];

  return {
    members: [...roles].some((r) => memberFacingRoles.includes(r)),
    schedule: true,
    chat: true,
    workouts: [...roles].some((r) =>
      [
        'gym_instructor',
        'branch_instructor',
        'gym_owner',
        'gym_manager',
        'branch_manager',
      ].includes(r)
    ),
    sales: [...roles].some((r) =>
      ['gym_sales', 'gym_receptionist', 'gym_owner', 'gym_manager'].includes(r)
    ),
  };
}
