import { describe, expect, it } from 'vitest';
import {
  ActivateAddonRequestSchema,
  AddonEntitlementRecordSchema,
  AddonPackageIdSchema,
} from './entitlements';

describe('Addon entitlements contracts', () => {
  it('parses activation request', () => {
    const parsed = ActivateAddonRequestSchema.parse({
      gymId: '11111111-1111-4111-8111-111111111111',
      packageId: 'ai_chatbot',
      activatedByUserId: '22222222-2222-4222-8222-222222222222',
      locale: 'en',
    });
    expect(parsed.packageId).toBe('ai_chatbot');
  });

  it('rejects unknown package id', () => {
    expect(
      ActivateAddonRequestSchema.safeParse({
        gymId: '11111111-1111-4111-8111-111111111111',
        packageId: 'unknown',
        activatedByUserId: '22222222-2222-4222-8222-222222222222',
        locale: 'en',
      }).success
    ).toBe(false);
  });

  it('parses entitlement record', () => {
    const row = AddonEntitlementRecordSchema.parse({
      id: '33333333-3333-4333-8333-333333333333',
      gymId: '11111111-1111-4111-8111-111111111111',
      packageId: 'sms_messaging',
      status: 'active',
      activatedAt: '2026-03-21T00:00:00.000Z',
      updatedAt: '2026-03-21T00:00:00.000Z',
    });
    expect(row.status).toBe('active');
  });

  it('AddonPackageIdSchema lists expected ids', () => {
    expect(AddonPackageIdSchema.options.length).toBe(4);
  });
});
