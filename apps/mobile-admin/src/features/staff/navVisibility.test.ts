import { describe, expect, it } from 'vitest';
import { getTabVisibility, rolesFromWhoami } from './navVisibility';

describe('rolesFromWhoami', () => {
  it('collects role strings', () => {
    expect(
      rolesFromWhoami([
        {
          userId: 'u',
          role: 'gym_instructor',
          gymId: 'g',
          branchId: null,
          grantedAt: '2024-01-01T00:00:00Z',
          grantedBy: 'a',
        },
      ])
    ).toEqual(['gym_instructor']);
  });
});

describe('getTabVisibility', () => {
  it('enables all tabs for platform admin', () => {
    const v = getTabVisibility(['platform_admin']);
    expect(v).toEqual({
      members: true,
      schedule: true,
      chat: true,
      workouts: true,
      sales: true,
    });
  });

  it('shows sales tab for gym_sales', () => {
    const v = getTabVisibility(['gym_sales']);
    expect(v.sales).toBe(true);
    expect(v.members).toBe(true);
  });

  it('shows workouts for instructors', () => {
    const v = getTabVisibility(['branch_instructor']);
    expect(v.workouts).toBe(true);
    expect(v.sales).toBe(false);
  });

  it('uses minimal tabs when role list is empty', () => {
    const v = getTabVisibility([]);
    expect(v).toEqual({
      members: false,
      schedule: true,
      chat: true,
      workouts: false,
      sales: false,
    });
  });
});
