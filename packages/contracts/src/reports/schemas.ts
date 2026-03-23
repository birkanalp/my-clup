import { z } from 'zod';

export const ReportPeriodSchema = z.enum(['last_30_days', 'last_3_months', 'this_year']);
export type ReportPeriod = z.infer<typeof ReportPeriodSchema>;

export const ReportSummaryRequestSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  gymId: z.string().uuid().optional(),
});
export type ReportSummaryRequest = z.infer<typeof ReportSummaryRequestSchema>;

export const ReportSummaryResponseSchema = z.object({
  revenue: z.object({
    totalCollected: z.number().nonnegative(),
    outstanding: z.number().nonnegative(),
    currency: z.string().min(3).max(3),
  }),
  members: z.object({
    activeCount: z.number().int().nonnegative(),
    newThisPeriod: z.number().int().nonnegative(),
    expiredThisPeriod: z.number().int().nonnegative(),
  }),
  bookings: z.object({
    totalSessions: z.number().int().nonnegative(),
    avgAttendanceRate: z.number().min(0).max(1),
  }),
  periodFrom: z.string().datetime(),
  periodTo: z.string().datetime(),
});
export type ReportSummaryResponse = z.infer<typeof ReportSummaryResponseSchema>;
