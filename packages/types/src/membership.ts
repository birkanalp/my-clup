export type MembershipPlanType = 'time_based' | 'session_based' | 'personal_training';

export type MembershipPlanStatus = 'active' | 'inactive';

export type MembershipStatus = 'active' | 'frozen' | 'cancelled' | 'expired';

export type FreezePeriod = 'month' | 'year';

export interface FreezeRule {
  maxDays: number;
  maxCountPerPeriod: number;
  period: FreezePeriod;
}

export interface PricingTier {
  id?: string;
  label: string;
  amount: number;
  currency: string;
}

export type DiscountRuleType = 'percentage' | 'fixed';

export interface DiscountRule {
  code: string;
  type: DiscountRuleType;
  value: number;
  expiresAt?: string | null;
}

export interface MembershipPlan {
  id: string;
  gymId: string;
  branchId: string | null;
  name: string;
  type: MembershipPlanType;
  status: MembershipPlanStatus;
  durationDays: number | null;
  sessionCount: number | null;
  freezeRule: FreezeRule;
  branchRestrictionEnabled: boolean;
  allowedBranchIds: string[];
  pricingTiers: PricingTier[];
  discountRules: DiscountRule[];
  trialEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMembershipPlanRequest {
  gymId: string;
  branchId?: string | null;
  name: string;
  type: MembershipPlanType;
  durationDays?: number | null;
  sessionCount?: number | null;
  freezeRule: FreezeRule;
  branchRestrictionEnabled: boolean;
  allowedBranchIds: string[];
  pricingTiers: PricingTier[];
  discountRules: DiscountRule[];
  trialEnabled: boolean;
}

export type CreateMembershipPlanResponse = MembershipPlan;

export type UpdateMembershipPlanRequest = Partial<
  Omit<CreateMembershipPlanRequest, 'gymId' | 'branchId'>
>;

export type UpdateMembershipPlanResponse = MembershipPlan;

export interface DeactivateMembershipPlanResponse {
  planId: string;
  deactivated: true;
}

export interface MembershipInstance {
  id: string;
  planId: string;
  memberId: string;
  gymId: string;
  branchId: string | null;
  status: MembershipStatus;
  validFrom: string;
  validUntil: string | null;
  remainingSessions: number | null;
  entitledBranchIds: string[];
  freezeStartAt?: string | null;
  freezeEndAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RenewMembershipRequest {
  membershipInstanceId: string;
  renewedUntil: string;
  addedSessionCount?: number;
}

export interface ListMembershipInstancesRequest {
  gymId?: string;
  branchId?: string;
  memberId?: string;
  status?: MembershipStatus;
  cursor?: string;
  limit?: number;
}

export interface ListMembershipInstancesResponse {
  items: MembershipInstance[];
  nextCursor: string | null;
}

export interface AssignMembershipInstanceRequest {
  planId: string;
  memberId: string;
  gymId: string;
  branchId?: string | null;
  validFrom: string;
  validUntil: string | null;
  remainingSessions?: number | null;
  entitledBranchIds: string[];
}

export type AssignMembershipInstanceResponse = MembershipInstance;

export interface FreezeMembershipRequest {
  membershipInstanceId: string;
  freezeStartAt: string;
  freezeEndAt: string;
  reason?: string;
}

export interface CancelMembershipRequest {
  membershipInstanceId: string;
  cancelledAt: string;
  reason?: string;
}

export type AccessValidationResult = 'allowed' | 'denied';

export type AccessValidationReason =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'frozen'
  | 'branch_not_entitled';

export interface ValidateMembershipAccessRequest {
  membershipInstanceId: string;
  branchId: string;
  at?: string;
}

export interface ValidateMembershipAccessResponse {
  membershipInstanceId: string;
  result: AccessValidationResult;
  reason: AccessValidationReason;
  status: MembershipStatus;
  checkedAt: string;
}
