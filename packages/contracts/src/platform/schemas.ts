import { z } from 'zod';

export const platformGymRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  is_active: z.boolean(),
  is_published: z.boolean(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  created_at: z.string(),
});

export const platformGymsListResponseSchema = z.object({
  gyms: z.array(platformGymRowSchema),
});

export const platformUserRoleRowSchema = z.object({
  role: z.string(),
  gym_id: z.string().uuid().nullable(),
});

export const platformUserRowSchema = z.object({
  user_id: z.string().uuid(),
  display_name: z.string(),
  locale: z.string(),
  roles: z.array(platformUserRoleRowSchema),
});

export const platformUsersListResponseSchema = z.object({
  users: z.array(platformUserRowSchema),
});

export const platformAuditRowSchema = z.object({
  id: z.string().uuid(),
  event_type: z.string(),
  actor_id: z.string().uuid().nullable(),
  target_type: z.string(),
  target_id: z.string().nullable(),
  created_at: z.string(),
});

export const platformAuditListResponseSchema = z.object({
  events: z.array(platformAuditRowSchema),
});

export const platformBillingSummaryResponseSchema = z.object({
  invoices_total: z.number().int().nonnegative(),
  invoices_open: z.number().int().nonnegative(),
  invoices_paid: z.number().int().nonnegative(),
});

export const platformMembershipsSummaryResponseSchema = z.object({
  instances_total: z.number().int().nonnegative(),
  instances_active: z.number().int().nonnegative(),
  instances_cancelled: z.number().int().nonnegative(),
});

export const platformLocaleStatSchema = z.object({
  locale: z.string(),
  count: z.number().int().nonnegative(),
});

export const platformLocalesSummaryResponseSchema = z.object({
  locales: z.array(platformLocaleStatSchema),
});

export const platformConversationsSummaryResponseSchema = z.object({
  conversations_total: z.number().int().nonnegative(),
});

export type PlatformGymsListResponse = z.infer<typeof platformGymsListResponseSchema>;
export type PlatformUsersListResponse = z.infer<typeof platformUsersListResponseSchema>;
export type PlatformAuditListResponse = z.infer<typeof platformAuditListResponseSchema>;
export type PlatformBillingSummaryResponse = z.infer<typeof platformBillingSummaryResponseSchema>;
export type PlatformMembershipsSummaryResponse = z.infer<typeof platformMembershipsSummaryResponseSchema>;
export type PlatformLocalesSummaryResponse = z.infer<typeof platformLocalesSummaryResponseSchema>;
export type PlatformConversationsSummaryResponse = z.infer<typeof platformConversationsSummaryResponseSchema>;
