import { z } from "zod";

/** Aligns with @myclup/types User */
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Aligns with @myclup/types UserLocalePreference */
const UserLocalePreferenceSchema = z.object({
  locale: z.enum(["tr", "en"]),
  fallbackLocale: z.enum(["tr", "en"]).optional(),
});

/** Aligns with @myclup/types UserProfile */
const UserProfileSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().url().nullable(),
  localePreference: UserLocalePreferenceSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Aligns with @myclup/types TenantScope */
const TenantScopeSchema = z.object({
  gymId: z.string(),
  branchId: z.string().nullable(),
});

/** Aligns with @myclup/types RoleAssignment role union */
const RoleSchema = z.enum([
  "platform_admin",
  "platform_support",
  "platform_finance",
  "gym_owner",
  "gym_manager",
  "gym_staff",
  "gym_instructor",
  "gym_receptionist",
  "gym_sales",
  "branch_manager",
  "branch_instructor",
  "branch_staff",
]);

/** Aligns with @myclup/types RoleAssignment */
const RoleAssignmentSchema = z.object({
  userId: z.string(),
  role: RoleSchema,
  gymId: z.string().nullable(),
  branchId: z.string().nullable(),
  grantedAt: z.string(),
  grantedBy: z.string(),
});

/** Request schema. whoami is GET; no body. */
export const WhoamiRequestSchema = z.object({});

/** Response schema: user, profile, tenantScope, roles */
export const WhoamiResponseSchema = z.object({
  user: UserSchema,
  profile: UserProfileSchema,
  tenantScope: TenantScopeSchema,
  roles: z.array(RoleAssignmentSchema),
});

export type WhoamiRequest = z.infer<typeof WhoamiRequestSchema>;
export type WhoamiResponse = z.infer<typeof WhoamiResponseSchema>;

export const whoamiContract = {
  path: "/api/v1/auth/whoami",
  method: "GET" as const,
  request: WhoamiRequestSchema,
  response: WhoamiResponseSchema,
} as const;
