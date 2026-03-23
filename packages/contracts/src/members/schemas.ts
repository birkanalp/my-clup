import { z } from 'zod';
import { MembershipStatusSchema } from '../membership/schemas';

const UuidSchema = z.string().uuid();
const IsoDatetimeSchema = z.string().datetime();

export const MemberSummarySchema = z.object({
  memberId: UuidSchema,
  displayName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  membershipStatus: MembershipStatusSchema.nullable(),
  membershipPlanName: z.string().nullable(),
  membershipValidUntil: IsoDatetimeSchema.nullable(),
  membershipInstanceId: UuidSchema.nullable(),
  joinedAt: IsoDatetimeSchema,
});
export type MemberSummary = z.infer<typeof MemberSummarySchema>;

export const MemberDetailSchema = z.object({
  memberId: UuidSchema,
  displayName: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  joinedAt: IsoDatetimeSchema,
  activeMembership: z
    .object({
      instanceId: UuidSchema,
      planName: z.string(),
      status: MembershipStatusSchema,
      validFrom: IsoDatetimeSchema,
      validUntil: IsoDatetimeSchema.nullable(),
      remainingSessions: z.number().int().nonnegative().nullable(),
    })
    .nullable(),
});
export type MemberDetail = z.infer<typeof MemberDetailSchema>;

export const MemberStatusValueSchema = z.enum(['active', 'suspended']);
export type MemberStatusValue = z.infer<typeof MemberStatusValueSchema>;

export const ListMembersRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
  status: MembershipStatusSchema.optional(),
  search: z.string().max(200).optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListMembersRequest = z.infer<typeof ListMembersRequestSchema>;

export const ListMembersResponseSchema = z.object({
  items: z.array(MemberSummarySchema),
  nextCursor: z.string().nullable(),
  total: z.number().int().nonnegative(),
});
export type ListMembersResponse = z.infer<typeof ListMembersResponseSchema>;

export const GetMemberRequestSchema = z.object({});
export type GetMemberRequest = z.infer<typeof GetMemberRequestSchema>;

export const GetMemberResponseSchema = MemberDetailSchema;
export type GetMemberResponse = z.infer<typeof GetMemberResponseSchema>;

export const UpdateMemberStatusRequestSchema = z.object({
  action: z.enum(['suspend', 'reactivate']),
  reason: z.string().max(500).optional(),
});
export type UpdateMemberStatusRequest = z.infer<typeof UpdateMemberStatusRequestSchema>;

export const UpdateMemberStatusResponseSchema = z.object({
  memberId: UuidSchema,
  action: z.enum(['suspend', 'reactivate']),
  membershipInstanceId: UuidSchema.nullable(),
  previousStatus: MembershipStatusSchema.nullable(),
  newStatus: MembershipStatusSchema.nullable(),
});
export type UpdateMemberStatusResponse = z.infer<typeof UpdateMemberStatusResponseSchema>;
