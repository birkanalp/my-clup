import { z } from 'zod';

export const AmenitySchema = z.enum([
  'pool',
  'parking',
  'sauna',
  'personal_training',
  'group_classes',
  'locker_rooms',
  'showers',
  'cafe',
  'childcare',
  'wifi',
]);
export type Amenity = z.infer<typeof AmenitySchema>;

export const OperatingHoursDaySchema = z.object({
  open: z.boolean(),
  openTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable(),
  closeTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable(),
});
export type OperatingHoursDay = z.infer<typeof OperatingHoursDaySchema>;

export const OperatingHoursSchema = z.object({
  monday: OperatingHoursDaySchema,
  tuesday: OperatingHoursDaySchema,
  wednesday: OperatingHoursDaySchema,
  thursday: OperatingHoursDaySchema,
  friday: OperatingHoursDaySchema,
  saturday: OperatingHoursDaySchema,
  sunday: OperatingHoursDaySchema,
});
export type OperatingHours = z.infer<typeof OperatingHoursSchema>;

export const GymListingRecordSchema = z.object({
  gymId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  addressLine1: z.string().max(500).nullable(),
  addressLine2: z.string().max(500).nullable(),
  city: z.string().max(200).nullable(),
  country: z.string().max(100).nullable(),
  phone: z.string().max(50).nullable(),
  website: z.string().url().nullable().or(z.literal('')),
  amenities: z.array(AmenitySchema),
  operatingHours: OperatingHoursSchema.nullable(),
  isPublished: z.boolean(),
  updatedAt: z.string().datetime(),
});
export type GymListingRecord = z.infer<typeof GymListingRecordSchema>;

export const GetListingResponseSchema = GymListingRecordSchema;
export type GetListingResponse = z.infer<typeof GetListingResponseSchema>;

export const UpdateListingRequestSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  addressLine1: z.string().max(500).optional(),
  addressLine2: z.string().max(500).optional(),
  city: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
  amenities: z.array(AmenitySchema).optional(),
  operatingHours: OperatingHoursSchema.optional(),
});
export type UpdateListingRequest = z.infer<typeof UpdateListingRequestSchema>;

export const UpdateListingResponseSchema = GymListingRecordSchema;
export type UpdateListingResponse = z.infer<typeof UpdateListingResponseSchema>;

export const UpdateListingVisibilityRequestSchema = z.object({
  isPublished: z.boolean(),
});
export type UpdateListingVisibilityRequest = z.infer<typeof UpdateListingVisibilityRequestSchema>;

export const UpdateListingVisibilityResponseSchema = z.object({
  gymId: z.string().uuid(),
  isPublished: z.boolean(),
  updatedAt: z.string().datetime(),
});
export type UpdateListingVisibilityResponse = z.infer<typeof UpdateListingVisibilityResponseSchema>;
