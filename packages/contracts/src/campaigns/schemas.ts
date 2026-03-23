import { z } from 'zod';

const UuidSchema = z.string().uuid();
const IsoDatetimeSchema = z.string().datetime();

export const CampaignTargetSegmentSchema = z.enum(['all_members', 'expiring_soon', 'inactive']);
export type CampaignTargetSegment = z.infer<typeof CampaignTargetSegmentSchema>;

export const CampaignStatusSchema = z.enum(['draft', 'sent', 'failed']);
export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

export const CampaignRecordSchema = z.object({
  id: UuidSchema,
  gymId: UuidSchema,
  title: z.string().min(1).max(200),
  messageBody: z.string().min(1).max(2000),
  targetSegment: CampaignTargetSegmentSchema,
  status: CampaignStatusSchema,
  sentAt: IsoDatetimeSchema.nullable(),
  deliveryCount: z.number().int().nonnegative().nullable(),
  createdAt: IsoDatetimeSchema,
  updatedAt: IsoDatetimeSchema,
});
export type CampaignRecord = z.infer<typeof CampaignRecordSchema>;

export const ListCampaignsRequestSchema = z.object({
  gymId: UuidSchema.optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type ListCampaignsRequest = z.infer<typeof ListCampaignsRequestSchema>;

export const ListCampaignsResponseSchema = z.object({
  items: z.array(CampaignRecordSchema),
  nextCursor: z.string().nullable(),
  total: z.number().int().nonnegative(),
});
export type ListCampaignsResponse = z.infer<typeof ListCampaignsResponseSchema>;

export const CreateCampaignRequestSchema = z.object({
  gymId: UuidSchema,
  title: z.string().min(1).max(200),
  messageBody: z.string().min(1).max(2000),
  targetSegment: CampaignTargetSegmentSchema,
  locale: z.string().min(2),
});
export type CreateCampaignRequest = z.infer<typeof CreateCampaignRequestSchema>;

export const CreateCampaignResponseSchema = CampaignRecordSchema;
export type CreateCampaignResponse = z.infer<typeof CreateCampaignResponseSchema>;

export const SendCampaignRequestSchema = z.object({
  locale: z.string().min(2),
});
export type SendCampaignRequest = z.infer<typeof SendCampaignRequestSchema>;

export const SendCampaignResponseSchema = z.object({
  id: UuidSchema,
  status: CampaignStatusSchema,
  deliveryCount: z.number().int().nonnegative(),
  sentAt: IsoDatetimeSchema,
});
export type SendCampaignResponse = z.infer<typeof SendCampaignResponseSchema>;
