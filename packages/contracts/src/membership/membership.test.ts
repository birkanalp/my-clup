import { describe, expect, it } from 'vitest';
import {
  cancelMembershipContract,
  freezeMembershipContract,
  CancelMembershipRequestSchema,
  FreezeMembershipRequestSchema,
  getMembershipInstanceContract,
  listMembershipPlansContract,
  MembershipInstanceSchema,
  MembershipPlanSchema,
  renewMembershipContract,
  RenewMembershipRequestSchema,
  validateMembershipAccessContract,
  ValidateMembershipAccessRequestSchema,
} from './index';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const validDatetime = '2025-03-19T12:00:00.000Z';

describe('membership contracts', () => {
  describe('MembershipPlanSchema', () => {
    it('validates a time-based membership plan', () => {
      const plan = {
        id: validUuid,
        gymId: validUuid,
        branchId: null,
        name: 'Unlimited Monthly',
        type: 'time_based' as const,
        status: 'active' as const,
        durationDays: 30,
        sessionCount: null,
        freezeRule: {
          maxDays: 10,
          maxCountPerPeriod: 1,
          period: 'month' as const,
        },
        branchRestrictionEnabled: true,
        allowedBranchIds: [validUuid],
        pricingTiers: [{ label: 'Standard', amount: 1200, currency: 'TRY' }],
        discountRules: [{ code: 'WELCOME10', type: 'percentage' as const, value: 10 }],
        trialEnabled: false,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      };

      expect(MembershipPlanSchema.parse(plan)).toEqual(plan);
    });

    it('rejects zero-session session-based plan', () => {
      const result = MembershipPlanSchema.safeParse({
        id: validUuid,
        gymId: validUuid,
        branchId: null,
        name: '10 Session Plan',
        type: 'session_based',
        status: 'active',
        durationDays: null,
        sessionCount: 0,
        freezeRule: { maxDays: 5, maxCountPerPeriod: 1, period: 'month' },
        branchRestrictionEnabled: false,
        allowedBranchIds: [],
        pricingTiers: [{ label: 'Tier', amount: 500, currency: 'TRY' }],
        discountRules: [],
        trialEnabled: false,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('MembershipInstanceSchema', () => {
    it('accepts frozen instance with null validUntil', () => {
      const instance = {
        id: validUuid,
        planId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'frozen' as const,
        validFrom: validDatetime,
        validUntil: null,
        remainingSessions: null,
        entitledBranchIds: [validUuid, '6ba7b810-9dad-11d1-80b4-00c04fd430c8'],
        freezeStartAt: validDatetime,
        freezeEndAt: validDatetime,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      };

      expect(MembershipInstanceSchema.parse(instance)).toEqual(instance);
    });
  });

  describe('lifecycle request schemas', () => {
    it('validates renew request with added sessions', () => {
      expect(
        RenewMembershipRequestSchema.parse({
          membershipInstanceId: validUuid,
          renewedUntil: validDatetime,
          addedSessionCount: 5,
        })
      ).toEqual({
        membershipInstanceId: validUuid,
        renewedUntil: validDatetime,
        addedSessionCount: 5,
      });
    });

    it('validates freeze request', () => {
      expect(
        FreezeMembershipRequestSchema.parse({
          membershipInstanceId: validUuid,
          freezeStartAt: validDatetime,
          freezeEndAt: validDatetime,
        })
      ).toEqual({
        membershipInstanceId: validUuid,
        freezeStartAt: validDatetime,
        freezeEndAt: validDatetime,
      });
    });

    it('rejects invalid cancel request payload', () => {
      const result = CancelMembershipRequestSchema.safeParse({
        membershipInstanceId: 'not-uuid',
        cancelledAt: validDatetime,
      });
      expect(result.success).toBe(false);
    });

    it('validates membership access request', () => {
      expect(
        ValidateMembershipAccessRequestSchema.parse({
          membershipInstanceId: validUuid,
          branchId: validUuid,
          at: validDatetime,
        })
      ).toEqual({
        membershipInstanceId: validUuid,
        branchId: validUuid,
        at: validDatetime,
      });
    });
  });

  describe('contract objects', () => {
    it('list plans contract has correct path and method', () => {
      expect(listMembershipPlansContract.path).toBe('/api/v1/memberships/plans');
      expect(listMembershipPlansContract.method).toBe('GET');
    });

    it('instance contract keeps :id placeholder', () => {
      expect(getMembershipInstanceContract.path).toBe('/api/v1/memberships/instances/:id');
      expect(getMembershipInstanceContract.method).toBe('GET');
    });

    it('renew/freeze/cancel use POST', () => {
      expect(renewMembershipContract.method).toBe('POST');
      expect(freezeMembershipContract.method).toBe('POST');
      expect(cancelMembershipContract.method).toBe('POST');
    });

    it('access validation contract uses GET', () => {
      expect(validateMembershipAccessContract.path).toBe(
        '/api/v1/memberships/instances/:id/access'
      );
      expect(validateMembershipAccessContract.method).toBe('GET');
    });
  });
});
