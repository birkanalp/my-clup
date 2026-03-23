import { z } from 'zod';

export const AddonPackageIdSchema = z.enum([
  'sms_messaging',
  'ai_chatbot',
  'e_signature',
  'ads_campaigns',
]);

export const AddonEntitlementStatusSchema = z.enum(['inactive', 'active', 'suspended']);

export const ActivateAddonRequestSchema = z.object({
  gymId: z.string().uuid(),
  packageId: AddonPackageIdSchema,
  activatedByUserId: z.string().uuid(),
  locale: z.string().min(2),
});

export const AddonEntitlementRecordSchema = z.object({
  id: z.string().uuid(),
  gymId: z.string().uuid(),
  packageId: AddonPackageIdSchema,
  status: AddonEntitlementStatusSchema,
  activatedAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const AddonPackageWithStatusSchema = z.object({
  packageId: AddonPackageIdSchema,
  status: AddonEntitlementStatusSchema,
  activatedAt: z.string().nullable(),
  usageStats: z
    .object({
      creditsUsed: z.number().int().nonnegative().optional(),
      creditsTotal: z.number().int().nonnegative().optional(),
    })
    .nullable(),
});

export const ListAddonsResponseSchema = z.object({
  items: z.array(AddonPackageWithStatusSchema),
});

export const listAddonsContract = {
  path: '/api/v1/addons',
  method: 'GET' as const,
  request: z.object({}),
  response: ListAddonsResponseSchema,
} as const;

export type ActivateAddonRequest = z.infer<typeof ActivateAddonRequestSchema>;
export type AddonEntitlementRecord = z.infer<typeof AddonEntitlementRecordSchema>;
export type AddonPackageWithStatus = z.infer<typeof AddonPackageWithStatusSchema>;
export type ListAddonsResponse = z.infer<typeof ListAddonsResponseSchema>;
