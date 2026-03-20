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

export type ActivateAddonRequest = z.infer<typeof ActivateAddonRequestSchema>;
export type AddonEntitlementRecord = z.infer<typeof AddonEntitlementRecordSchema>;
