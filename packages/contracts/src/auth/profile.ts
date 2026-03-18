import { z } from "zod";

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

/** PATCH request: partial profile fields */
export const ProfilePatchRequestSchema = z.object({
  displayName: z.string().min(1).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  localePreference: UserLocalePreferenceSchema.optional(),
});

/** Response schema: full UserProfile */
export const ProfilePatchResponseSchema = UserProfileSchema;

export type ProfilePatchRequest = z.infer<typeof ProfilePatchRequestSchema>;
export type ProfilePatchResponse = z.infer<typeof ProfilePatchResponseSchema>;

export const profilePatchContract = {
  path: "/api/v1/auth/profile",
  method: "PATCH" as const,
  request: ProfilePatchRequestSchema,
  response: ProfilePatchResponseSchema,
} as const;
