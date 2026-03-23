import { describe, it, expect } from 'vitest';
import { platformGymsListResponseSchema, platformGymRowSchema } from './schemas';

describe('platform schemas', () => {
  it('accepts a minimal gyms list response', () => {
    const row = {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Test Gym',
      slug: 'test-gym',
      is_active: true,
      is_published: false,
      city: 'Istanbul',
      country: 'TR',
      created_at: '2026-01-01T00:00:00.000Z',
    };
    expect(platformGymRowSchema.safeParse(row).success).toBe(true);
    const parsed = platformGymsListResponseSchema.safeParse({ gyms: [row] });
    expect(parsed.success).toBe(true);
  });
});
