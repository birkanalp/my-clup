import { z } from 'zod';

const UuidSchema = z.string().uuid();
const IsoDatetimeSchema = z.string().datetime();

export const BookingSessionKindSchema = z.enum(['class', 'appointment', 'personal_training']);
export type BookingSessionKind = z.infer<typeof BookingSessionKindSchema>;

export const BookingSessionStatusSchema = z.enum(['scheduled', 'cancelled', 'completed']);
export type BookingSessionStatus = z.infer<typeof BookingSessionStatusSchema>;

export const BookingStatusSchema = z.enum([
  'booked',
  'cancelled',
  'waitlisted',
  'attended',
  'no_show',
]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const AttendanceStatusSchema = z.enum([
  'pending',
  'checked_in',
  'completed',
  'missed',
  'cancelled',
]);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

export const WaitlistStatusSchema = z.enum(['waiting', 'promoted', 'expired', 'cancelled']);
export type WaitlistStatus = z.infer<typeof WaitlistStatusSchema>;

export const AvailabilityStatusSchema = z.enum(['available', 'blocked', 'tentative']);
export type AvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;

export const BookingInstructorRefSchema = z.object({
  userId: UuidSchema,
  displayName: z.string().min(1).nullable(),
});
export type BookingInstructorRef = z.infer<typeof BookingInstructorRefSchema>;

export const BookingSessionSchema = z
  .object({
    id: UuidSchema,
    gymId: UuidSchema,
    branchId: UuidSchema.nullable(),
    kind: BookingSessionKindSchema,
    status: BookingSessionStatusSchema,
    title: z.string().min(1),
    startsAt: IsoDatetimeSchema,
    endsAt: IsoDatetimeSchema,
    timezone: z.string().min(1),
    instructor: BookingInstructorRefSchema.nullable(),
    capacity: z.number().int().nonnegative(),
    bookedCount: z.number().int().nonnegative(),
    waitlistCount: z.number().int().nonnegative(),
    availableSpots: z.number().int().nonnegative(),
    locationLabel: z.string().min(1).nullable(),
    createdAt: IsoDatetimeSchema,
    updatedAt: IsoDatetimeSchema,
  })
  .superRefine((value, ctx) => {
    if (value.endsAt <= value.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'endsAt must be after startsAt',
      });
    }

    if (value.bookedCount > value.capacity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['bookedCount'],
        message: 'bookedCount cannot exceed capacity',
      });
    }

    if (value.availableSpots !== Math.max(value.capacity - value.bookedCount, 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['availableSpots'],
        message: 'availableSpots must reflect capacity minus bookedCount',
      });
    }
  });
export type BookingSession = z.infer<typeof BookingSessionSchema>;

export const CursorPageParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type CursorPageParams = z.infer<typeof CursorPageParamsSchema>;

export const ListBookingSessionsRequestSchema = CursorPageParamsSchema.extend({
  gymId: UuidSchema.optional(),
  branchId: UuidSchema.optional(),
  memberId: UuidSchema.optional(),
  instructorUserId: UuidSchema.optional(),
  kind: BookingSessionKindSchema.optional(),
  status: BookingSessionStatusSchema.optional(),
  startsFrom: IsoDatetimeSchema.optional(),
  startsUntil: IsoDatetimeSchema.optional(),
}).superRefine((value, ctx) => {
  if (value.startsFrom && value.startsUntil && value.startsUntil < value.startsFrom) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['startsUntil'],
      message: 'startsUntil must be after startsFrom',
    });
  }
});
export type ListBookingSessionsRequest = z.infer<typeof ListBookingSessionsRequestSchema>;

export const createCursorPageResultSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });

export type CursorPageResult<T> = {
  items: T[];
  nextCursor: string | null;
};

export const ListBookingSessionsResponseSchema = createCursorPageResultSchema(BookingSessionSchema);
export type ListBookingSessionsResponse = z.infer<typeof ListBookingSessionsResponseSchema>;

export const BookingRecordSchema = z
  .object({
    id: UuidSchema,
    sessionId: UuidSchema,
    memberId: UuidSchema,
    gymId: UuidSchema,
    branchId: UuidSchema.nullable(),
    status: BookingStatusSchema,
    attendanceStatus: AttendanceStatusSchema,
    bookedAt: IsoDatetimeSchema,
    cancelledAt: IsoDatetimeSchema.nullable(),
    waitlistedAt: IsoDatetimeSchema.nullable(),
    checkInAt: IsoDatetimeSchema.nullable(),
    waitlistPosition: z.number().int().positive().nullable(),
    notes: z.string().max(500).nullable(),
    createdAt: IsoDatetimeSchema,
    updatedAt: IsoDatetimeSchema,
  })
  .superRefine((value, ctx) => {
    if (value.status === 'waitlisted' && value.waitlistPosition === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['waitlistPosition'],
        message: 'waitlistPosition is required when status is waitlisted',
      });
    }

    if (value.status !== 'waitlisted' && value.waitlistPosition !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['waitlistPosition'],
        message: 'waitlistPosition must be null when status is not waitlisted',
      });
    }

    if (value.status === 'cancelled' && value.cancelledAt === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cancelledAt'],
        message: 'cancelledAt is required when status is cancelled',
      });
    }

    if (
      value.attendanceStatus === 'checked_in' &&
      (value.checkInAt === null || value.status === 'cancelled')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['checkInAt'],
        message: 'checked_in attendance requires checkInAt and a non-cancelled booking',
      });
    }
  });
export type BookingRecord = z.infer<typeof BookingRecordSchema>;

export const ListBookingsRequestSchema = CursorPageParamsSchema.extend({
  memberId: UuidSchema.optional(),
  sessionId: UuidSchema.optional(),
  status: BookingStatusSchema.optional(),
  attendanceStatus: AttendanceStatusSchema.optional(),
});
export type ListBookingsRequest = z.infer<typeof ListBookingsRequestSchema>;

export const ListBookingsResponseSchema = createCursorPageResultSchema(BookingRecordSchema);
export type ListBookingsResponse = z.infer<typeof ListBookingsResponseSchema>;

export const WaitlistEntrySchema = z.object({
  id: UuidSchema,
  sessionId: UuidSchema,
  memberId: UuidSchema,
  gymId: UuidSchema,
  branchId: UuidSchema.nullable(),
  status: WaitlistStatusSchema,
  position: z.number().int().positive(),
  promotedAt: IsoDatetimeSchema.nullable(),
  expiredAt: IsoDatetimeSchema.nullable(),
  createdAt: IsoDatetimeSchema,
  updatedAt: IsoDatetimeSchema,
});
export type WaitlistEntry = z.infer<typeof WaitlistEntrySchema>;

export const InstructorAvailabilitySchema = z
  .object({
    id: UuidSchema,
    instructorUserId: UuidSchema,
    gymId: UuidSchema,
    branchId: UuidSchema.nullable(),
    startsAt: IsoDatetimeSchema,
    endsAt: IsoDatetimeSchema,
    status: AvailabilityStatusSchema,
    note: z.string().max(500).nullable(),
    createdAt: IsoDatetimeSchema,
    updatedAt: IsoDatetimeSchema,
  })
  .superRefine((value, ctx) => {
    if (value.endsAt <= value.startsAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endsAt'],
        message: 'endsAt must be after startsAt',
      });
    }
  });
export type InstructorAvailability = z.infer<typeof InstructorAvailabilitySchema>;

export const ListInstructorAvailabilityRequestSchema = z
  .object({
    gymId: UuidSchema.optional(),
    branchId: UuidSchema.optional(),
    instructorUserId: UuidSchema.optional(),
    startsFrom: IsoDatetimeSchema.optional(),
    startsUntil: IsoDatetimeSchema.optional(),
    limit: z.number().int().min(1).max(100).default(100),
  })
  .superRefine((value, ctx) => {
    if (value.startsFrom && value.startsUntil && value.startsUntil < value.startsFrom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startsUntil'],
        message: 'startsUntil must be after startsFrom',
      });
    }
  });
export type ListInstructorAvailabilityRequest = z.infer<
  typeof ListInstructorAvailabilityRequestSchema
>;

export const ListInstructorAvailabilityResponseSchema = z.object({
  items: z.array(InstructorAvailabilitySchema),
});
export type ListInstructorAvailabilityResponse = z.infer<
  typeof ListInstructorAvailabilityResponseSchema
>;

export const CreateBookingSourceSchema = z.enum(['member_app', 'staff_mobile', 'gym_admin_web']);
export type CreateBookingSource = z.infer<typeof CreateBookingSourceSchema>;

export const CreateBookingRequestSchema = z.object({
  sessionId: UuidSchema,
  memberId: UuidSchema,
  source: CreateBookingSourceSchema.optional(),
  note: z.string().max(500).optional(),
});
export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;

export const CreateBookingResponseSchema = z.object({
  booking: BookingRecordSchema,
});
export type CreateBookingResponse = z.infer<typeof CreateBookingResponseSchema>;

export const CancelBookingRequestSchema = z.object({
  reason: z.string().max(500).optional(),
});
export type CancelBookingRequest = z.infer<typeof CancelBookingRequestSchema>;

export const CancelBookingResponseSchema = z.object({
  booking: BookingRecordSchema,
});
export type CancelBookingResponse = z.infer<typeof CancelBookingResponseSchema>;

export const JoinWaitlistRequestSchema = z.object({
  sessionId: UuidSchema,
  memberId: UuidSchema,
});
export type JoinWaitlistRequest = z.infer<typeof JoinWaitlistRequestSchema>;

export const JoinWaitlistResponseSchema = z.object({
  entry: WaitlistEntrySchema,
});
export type JoinWaitlistResponse = z.infer<typeof JoinWaitlistResponseSchema>;

export const UpdateAttendanceRequestSchema = z.object({
  attendanceStatus: AttendanceStatusSchema,
  checkedInAt: IsoDatetimeSchema.nullable().optional(),
  note: z.string().max(500).optional(),
});
export type UpdateAttendanceRequest = z.infer<typeof UpdateAttendanceRequestSchema>;

export const UpdateAttendanceResponseSchema = z.object({
  booking: BookingRecordSchema,
});
export type UpdateAttendanceResponse = z.infer<typeof UpdateAttendanceResponseSchema>;
