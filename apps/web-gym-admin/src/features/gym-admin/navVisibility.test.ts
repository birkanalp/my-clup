import { describe, expect, it } from 'vitest';
import { getGymAdminSidebarVisibility } from './navVisibility';

describe('getGymAdminSidebarVisibility', () => {
  it('enables all items for platform admin', () => {
    const v = getGymAdminSidebarVisibility(['platform_admin']);
    expect(Object.values(v).every(Boolean)).toBe(true);
  });

  it('hides campaigns for instructor-only', () => {
    const v = getGymAdminSidebarVisibility(['gym_instructor']);
    expect(v.schedule).toBe(true);
    expect(v.campaigns).toBe(false);
    expect(v.reports).toBe(false);
  });

  it('shows campaigns for sales', () => {
    const v = getGymAdminSidebarVisibility(['gym_sales']);
    expect(v.campaigns).toBe(true);
  });

  it('minimal nav when roles unknown', () => {
    const v = getGymAdminSidebarVisibility([]);
    expect(v.dashboard).toBe(true);
    expect(v.members).toBe(false);
    expect(v.schedule).toBe(true);
  });
});
