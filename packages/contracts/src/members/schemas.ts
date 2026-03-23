import { z } from 'zod';

const UuidSchema = z.string().uuid();
const IsoDatetimeSchema = z.string().datetime();

export const MemberStatusSchema = z.enum(['active', 'expired', 'suspended', 'no_membership']);
export type MemberStatus = z.infer<typeof MemberStatusSchema>;

export const GymMemberSchema = z.object({
  id: UuidSchema,
  displayName: z.string(),
  email: z.string().email(),
  membershipStatus: MemberStatusSchema,
  membershipPlanName: z.string().nullable(),
  membershipValidUntil: IsoDatetimeSchema.nullable(),
  membershipInstanceId: UuidSchema.nullable(),
  joinedAt: IsoDatetimeSchema,
});
export type GymMember = z.infer<typeof GymMemberSchema>;

export const GymMemberDetailSchema = GymMemberSchema.extend({
  membershipPlanId: UuidSchema.nullable(),
  remainingSessions: z.number().int().nonnegative().nullable(),
  locale: z.string(),
});
export type GymMemberDetail = z.infer<typeof GymMemberDetailSchema>;

export const ListGymMembersRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
  status: MemberStatusSchema.optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListGymMembersRequest = z.infer<typeof ListGymMembersRequestSchema>;

export const ListGymMembersResponseSchema = z.object({
  items: z.array(GymMemberSchema),
  nextCursor: z.string().nullable(),
});
export type ListGymMembersResponse = z.infer<typeof ListGymMembersResponseSchema>;

export const GetGymMemberRequestSchema = z.object({});
export type GetGymMemberRequest = z.infer<typeof GetGymMemberRequestSchema>;

export const GetGymMemberResponseSchema = GymMemberDetailSchema;
export type GetGymMemberResponse = z.infer<typeof GetGymMemberResponseSchema>;

export const MemberStatusUpdateSchema = z.enum(['suspended', 'active']);
export type MemberStatusUpdate = z.infer<typeof MemberStatusUpdateSchema>;

export const UpdateMemberStatusRequestSchema = z.object({
  status: MemberStatusUpdateSchema,
  reason: z.string().max(500).optional(),
});
export type UpdateMemberStatusRequest = z.infer<typeof UpdateMemberStatusRequestSchema>;

export const UpdateMemberStatusResponseSchema = z.object({
  memberId: UuidSchema,
  previousStatus: MemberStatusSchema,
  newStatus: MemberStatusSchema,
  updatedAt: IsoDatetimeSchema,
});
export type UpdateMemberStatusResponse = z.infer<typeof UpdateMemberStatusResponseSchema>;
