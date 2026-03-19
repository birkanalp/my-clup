import { z } from 'zod';

const UuidSchema = z.string().uuid();
const IsoDatetimeSchema = z.string().datetime();

export const MembershipPlanTypeSchema = z.enum([
  'time_based',
  'session_based',
  'personal_training',
]);
export type MembershipPlanType = z.infer<typeof MembershipPlanTypeSchema>;

export const MembershipPlanStatusSchema = z.enum(['active', 'inactive']);
export type MembershipPlanStatus = z.infer<typeof MembershipPlanStatusSchema>;

export const MembershipStatusSchema = z.enum(['active', 'frozen', 'cancelled', 'expired']);
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;

export const FreezePeriodSchema = z.enum(['month', 'year']);
export type FreezePeriod = z.infer<typeof FreezePeriodSchema>;

export const FreezeRuleSchema = z.object({
  maxDays: z.number().int().min(0),
  maxCountPerPeriod: z.number().int().min(0),
  period: FreezePeriodSchema,
});
export type FreezeRule = z.infer<typeof FreezeRuleSchema>;

export const PricingTierSchema = z.object({
  id: UuidSchema.optional(),
  label: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
});
export type PricingTier = z.infer<typeof PricingTierSchema>;

export const DiscountRuleTypeSchema = z.enum(['percentage', 'fixed']);
export type DiscountRuleType = z.infer<typeof DiscountRuleTypeSchema>;

export const DiscountRuleSchema = z.object({
  code: z.string().min(1),
  type: DiscountRuleTypeSchema,
  value: z.number().positive(),
  expiresAt: IsoDatetimeSchema.nullable().optional(),
});
export type DiscountRule = z.infer<typeof DiscountRuleSchema>;

const MembershipPlanObjectSchema = z.object({
  id: UuidSchema,
  gymId: UuidSchema,
  branchId: UuidSchema.nullable(),
  name: z.string().min(1),
  type: MembershipPlanTypeSchema,
  status: MembershipPlanStatusSchema,
  durationDays: z.number().int().positive().nullable(),
  sessionCount: z.number().int().positive().nullable(),
  freezeRule: FreezeRuleSchema,
  branchRestrictionEnabled: z.boolean(),
  allowedBranchIds: z.array(UuidSchema),
  pricingTiers: z.array(PricingTierSchema).min(1),
  discountRules: z.array(DiscountRuleSchema),
  trialEnabled: z.boolean(),
  createdAt: IsoDatetimeSchema,
  updatedAt: IsoDatetimeSchema,
});

export const MembershipPlanSchema = MembershipPlanObjectSchema.superRefine((value, ctx) => {
  if (value.type === 'time_based' && value.durationDays === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['durationDays'],
      message: 'durationDays is required for time_based plans',
    });
  }

  if (value.type === 'session_based' && value.sessionCount === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['sessionCount'],
      message: 'sessionCount is required for session_based plans',
    });
  }
});
export type MembershipPlan = z.infer<typeof MembershipPlanSchema>;

export const MembershipInstanceSchema = z.object({
  id: UuidSchema,
  planId: UuidSchema,
  memberId: UuidSchema,
  gymId: UuidSchema,
  branchId: UuidSchema.nullable(),
  status: MembershipStatusSchema,
  validFrom: IsoDatetimeSchema,
  validUntil: IsoDatetimeSchema.nullable(),
  remainingSessions: z.number().int().nonnegative().nullable(),
  entitledBranchIds: z.array(UuidSchema),
  freezeStartAt: IsoDatetimeSchema.nullable().optional(),
  freezeEndAt: IsoDatetimeSchema.nullable().optional(),
  createdAt: IsoDatetimeSchema,
  updatedAt: IsoDatetimeSchema,
});
export type MembershipInstance = z.infer<typeof MembershipInstanceSchema>;

export const RenewMembershipRequestSchema = z.object({
  membershipInstanceId: UuidSchema,
  renewedUntil: IsoDatetimeSchema,
  addedSessionCount: z.number().int().positive().optional(),
});
export type RenewMembershipRequest = z.infer<typeof RenewMembershipRequestSchema>;

export const RenewMembershipResponseSchema = z.object({
  membership: MembershipInstanceSchema,
});
export type RenewMembershipResponse = z.infer<typeof RenewMembershipResponseSchema>;

export const FreezeMembershipRequestSchema = z.object({
  membershipInstanceId: UuidSchema,
  freezeStartAt: IsoDatetimeSchema,
  freezeEndAt: IsoDatetimeSchema,
  reason: z.string().max(500).optional(),
});
export type FreezeMembershipRequest = z.infer<typeof FreezeMembershipRequestSchema>;

export const FreezeMembershipResponseSchema = z.object({
  membership: MembershipInstanceSchema,
  frozenDays: z.number().int().nonnegative(),
});
export type FreezeMembershipResponse = z.infer<typeof FreezeMembershipResponseSchema>;

export const CancelMembershipRequestSchema = z.object({
  membershipInstanceId: UuidSchema,
  cancelledAt: IsoDatetimeSchema,
  reason: z.string().max(500).optional(),
});
export type CancelMembershipRequest = z.infer<typeof CancelMembershipRequestSchema>;

export const CancelMembershipResponseSchema = z.object({
  membership: MembershipInstanceSchema,
  cancelled: z.literal(true),
});
export type CancelMembershipResponse = z.infer<typeof CancelMembershipResponseSchema>;

export const AccessValidationResultSchema = z.enum(['allowed', 'denied']);
export type AccessValidationResult = z.infer<typeof AccessValidationResultSchema>;

export const AccessValidationReasonSchema = z.enum([
  'active',
  'expired',
  'cancelled',
  'frozen',
  'branch_not_entitled',
]);
export type AccessValidationReason = z.infer<typeof AccessValidationReasonSchema>;

export const ValidateMembershipAccessRequestSchema = z.object({
  membershipInstanceId: UuidSchema,
  branchId: UuidSchema,
  at: IsoDatetimeSchema.optional(),
});
export type ValidateMembershipAccessRequest = z.infer<typeof ValidateMembershipAccessRequestSchema>;

export const ValidateMembershipAccessResponseSchema = z.object({
  membershipInstanceId: UuidSchema,
  result: AccessValidationResultSchema,
  reason: AccessValidationReasonSchema,
  status: MembershipStatusSchema,
  checkedAt: IsoDatetimeSchema,
});
export type ValidateMembershipAccessResponse = z.infer<
  typeof ValidateMembershipAccessResponseSchema
>;

export const ListMembershipPlansRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
  includeInactive: z.boolean().optional(),
});
export type ListMembershipPlansRequest = z.infer<typeof ListMembershipPlansRequestSchema>;

export const ListMembershipPlansResponseSchema = z.object({
  items: z.array(MembershipPlanSchema),
});
export type ListMembershipPlansResponse = z.infer<typeof ListMembershipPlansResponseSchema>;

const MembershipPlanWriteSchema = MembershipPlanObjectSchema.pick({
  name: true,
  type: true,
  durationDays: true,
  sessionCount: true,
  freezeRule: true,
  branchRestrictionEnabled: true,
  allowedBranchIds: true,
  pricingTiers: true,
  discountRules: true,
  trialEnabled: true,
});

export const CreateMembershipPlanRequestSchema = MembershipPlanWriteSchema.extend({
  gymId: UuidSchema,
  branchId: UuidSchema.nullable().optional(),
});
export type CreateMembershipPlanRequest = z.infer<typeof CreateMembershipPlanRequestSchema>;

export const CreateMembershipPlanResponseSchema = MembershipPlanSchema;
export type CreateMembershipPlanResponse = z.infer<typeof CreateMembershipPlanResponseSchema>;

export const UpdateMembershipPlanRequestSchema = MembershipPlanWriteSchema.partial();
export type UpdateMembershipPlanRequest = z.infer<typeof UpdateMembershipPlanRequestSchema>;

export const UpdateMembershipPlanResponseSchema = MembershipPlanSchema;
export type UpdateMembershipPlanResponse = z.infer<typeof UpdateMembershipPlanResponseSchema>;

export const DeactivateMembershipPlanRequestSchema = z.object({});
export type DeactivateMembershipPlanRequest = z.infer<typeof DeactivateMembershipPlanRequestSchema>;

export const DeactivateMembershipPlanResponseSchema = z.object({
  planId: UuidSchema,
  deactivated: z.literal(true),
});
export type DeactivateMembershipPlanResponse = z.infer<
  typeof DeactivateMembershipPlanResponseSchema
>;

export const GetMembershipInstanceRequestSchema = z.object({});
export type GetMembershipInstanceRequest = z.infer<typeof GetMembershipInstanceRequestSchema>;

export const GetMembershipInstanceResponseSchema = MembershipInstanceSchema;
export type GetMembershipInstanceResponse = z.infer<typeof GetMembershipInstanceResponseSchema>;

export const ListMembershipInstancesRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
  memberId: UuidSchema.optional(),
  status: MembershipStatusSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListMembershipInstancesRequest = z.infer<typeof ListMembershipInstancesRequestSchema>;

export const ListMembershipInstancesResponseSchema = z.object({
  items: z.array(MembershipInstanceSchema),
  nextCursor: z.string().nullable(),
});
export type ListMembershipInstancesResponse = z.infer<typeof ListMembershipInstancesResponseSchema>;

export const AssignMembershipInstanceRequestSchema = z.object({
  planId: UuidSchema,
  memberId: UuidSchema,
  gymId: UuidSchema,
  branchId: UuidSchema.nullable().optional(),
  validFrom: IsoDatetimeSchema,
  validUntil: IsoDatetimeSchema.nullable(),
  remainingSessions: z.number().int().nonnegative().nullable().optional(),
  entitledBranchIds: z.array(UuidSchema).default([]),
});
export type AssignMembershipInstanceRequest = z.infer<typeof AssignMembershipInstanceRequestSchema>;

export const AssignMembershipInstanceResponseSchema = MembershipInstanceSchema;
export type AssignMembershipInstanceResponse = z.infer<
  typeof AssignMembershipInstanceResponseSchema
>;
