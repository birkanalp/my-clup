import { describe, expect, it } from 'vitest';
import {
  AvailabilityStatusSchema,
  BookingRecordSchema,
  BookingSessionKindSchema,
  BookingSessionSchema,
  BookingStatusSchema,
  AttendanceStatusSchema,
  CancelBookingRequestSchema,
  CreateBookingRequestSchema,
  InstructorAvailabilitySchema,
  JoinWaitlistRequestSchema,
  JoinWaitlistResponseSchema,
  listInstructorAvailabilityContract,
  ListBookingsResponseSchema,
  ListBookingSessionsRequestSchema,
  ListBookingSessionsResponseSchema,
  ListInstructorAvailabilityRequestSchema,
  ListInstructorAvailabilityResponseSchema,
  UpdateAttendanceRequestSchema,
  WaitlistEntrySchema,
  WaitlistStatusSchema,
  cancelBookingContract,
  createBookingContract,
  getBookingSessionContract,
  joinWaitlistContract,
  listBookingsContract,
  listBookingSessionsContract,
  updateAttendanceContract,
} from './index';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const validDatetime = '2026-03-19T12:00:00.000Z';

describe('booking contracts', () => {
  it('accepts supported session kinds', () => {
    expect(BookingSessionKindSchema.parse('class')).toBe('class');
    expect(BookingSessionKindSchema.parse('appointment')).toBe('appointment');
    expect(BookingSessionKindSchema.parse('personal_training')).toBe('personal_training');
  });

  it('accepts supported booking and attendance statuses', () => {
    expect(BookingStatusSchema.parse('waitlisted')).toBe('waitlisted');
    expect(AttendanceStatusSchema.parse('checked_in')).toBe('checked_in');
    expect(WaitlistStatusSchema.parse('waiting')).toBe('waiting');
    expect(AvailabilityStatusSchema.parse('available')).toBe('available');
  });

  it('validates a booking session and enforces availability math', () => {
    const value = {
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      kind: 'class' as const,
      status: 'scheduled' as const,
      title: 'Morning Mobility',
      startsAt: validDatetime,
      endsAt: '2026-03-19T13:00:00.000Z',
      timezone: 'Europe/Istanbul',
      instructor: null,
      capacity: 20,
      bookedCount: 12,
      waitlistCount: 3,
      availableSpots: 8,
      locationLabel: 'Studio A',
      createdAt: validDatetime,
      updatedAt: validDatetime,
    };

    expect(BookingSessionSchema.parse(value)).toEqual(value);
  });

  it('rejects a waitlisted booking without a waitlist position', () => {
    const result = BookingRecordSchema.safeParse({
      id: validUuid,
      sessionId: validUuid,
      memberId: validUuid,
      gymId: validUuid,
      branchId: null,
      status: 'waitlisted',
      attendanceStatus: 'pending',
      bookedAt: validDatetime,
      cancelledAt: null,
      waitlistedAt: validDatetime,
      checkInAt: null,
      waitlistPosition: null,
      notes: null,
      createdAt: validDatetime,
      updatedAt: validDatetime,
    });

    expect(result.success).toBe(false);
  });

  it('validates list session filters with a bounded date range', () => {
    expect(
      ListBookingSessionsRequestSchema.parse({
        startsFrom: validDatetime,
        startsUntil: '2026-03-20T12:00:00.000Z',
        limit: 10,
      })
    ).toEqual({
      startsFrom: validDatetime,
      startsUntil: '2026-03-20T12:00:00.000Z',
      limit: 10,
    });
  });

  it('validates create booking and attendance update inputs', () => {
    expect(
      CreateBookingRequestSchema.parse({
        sessionId: validUuid,
        memberId: validUuid,
        source: 'member_app',
      }).source
    ).toBe('member_app');

    expect(
      UpdateAttendanceRequestSchema.parse({
        attendanceStatus: 'checked_in',
        checkedInAt: validDatetime,
      }).attendanceStatus
    ).toBe('checked_in');

    expect(
      JoinWaitlistRequestSchema.parse({
        sessionId: validUuid,
        memberId: validUuid,
      }).sessionId
    ).toBe(validUuid);
  });

  it('validates waitlist entries and instructor availability payloads', () => {
    expect(
      WaitlistEntrySchema.parse({
        id: validUuid,
        sessionId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'waiting',
        position: 1,
        promotedAt: null,
        expiredAt: null,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      }).position
    ).toBe(1);

    expect(
      InstructorAvailabilitySchema.parse({
        id: validUuid,
        instructorUserId: validUuid,
        gymId: validUuid,
        branchId: null,
        startsAt: validDatetime,
        endsAt: '2026-03-19T13:00:00.000Z',
        status: 'available',
        note: null,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      }).status
    ).toBe('available');
  });

  it('validates paginated responses', () => {
    expect(
      ListBookingSessionsResponseSchema.parse({
        items: [
          {
            id: validUuid,
            gymId: validUuid,
            branchId: null,
            kind: 'appointment',
            status: 'scheduled',
            title: 'PT Session',
            startsAt: validDatetime,
            endsAt: '2026-03-19T13:00:00.000Z',
            timezone: 'UTC',
            instructor: null,
            capacity: 1,
            bookedCount: 1,
            waitlistCount: 0,
            availableSpots: 0,
            locationLabel: null,
            createdAt: validDatetime,
            updatedAt: validDatetime,
          },
        ],
        nextCursor: null,
      }).items
    ).toHaveLength(1);

    expect(
      ListBookingsResponseSchema.parse({
        items: [
          {
            id: validUuid,
            sessionId: validUuid,
            memberId: validUuid,
            gymId: validUuid,
            branchId: null,
            status: 'booked',
            attendanceStatus: 'pending',
            bookedAt: validDatetime,
            cancelledAt: null,
            waitlistedAt: null,
            checkInAt: null,
            waitlistPosition: null,
            notes: null,
            createdAt: validDatetime,
            updatedAt: validDatetime,
          },
        ],
        nextCursor: 'cursor-1',
      }).nextCursor
    ).toBe('cursor-1');

    expect(
      ListInstructorAvailabilityResponseSchema.parse({
        items: [
          {
            id: validUuid,
            instructorUserId: validUuid,
            gymId: validUuid,
            branchId: null,
            startsAt: validDatetime,
            endsAt: '2026-03-19T13:00:00.000Z',
            status: 'blocked',
            note: null,
            createdAt: validDatetime,
            updatedAt: validDatetime,
          },
        ],
      }).items
    ).toHaveLength(1);

    expect(
      JoinWaitlistResponseSchema.parse({
        entry: {
          id: validUuid,
          sessionId: validUuid,
          memberId: validUuid,
          gymId: validUuid,
          branchId: null,
          status: 'waiting',
          position: 1,
          promotedAt: null,
          expiredAt: null,
          createdAt: validDatetime,
          updatedAt: validDatetime,
        },
      }).entry.status
    ).toBe('waiting');
  });

  it('validates cancel input', () => {
    expect(CancelBookingRequestSchema.parse({ reason: 'Member request' }).reason).toBe(
      'Member request'
    );
  });

  it('exposes the expected contract paths', () => {
    expect(listBookingSessionsContract.path).toBe('/api/v1/bookings/sessions');
    expect(getBookingSessionContract.path).toBe('/api/v1/bookings/sessions/:id');
    expect(listBookingsContract.path).toBe('/api/v1/bookings');
    expect(createBookingContract.path).toBe('/api/v1/bookings');
    expect(cancelBookingContract.path).toBe('/api/v1/bookings/:id/cancel');
    expect(joinWaitlistContract.path).toBe('/api/v1/bookings/waitlists');
    expect(updateAttendanceContract.path).toBe('/api/v1/bookings/:id/attendance');
    expect(listInstructorAvailabilityContract.path).toBe(
      '/api/v1/bookings/instructor-availability'
    );
  });

  it('validates instructor availability list filters', () => {
    expect(
      ListInstructorAvailabilityRequestSchema.parse({
        instructorUserId: validUuid,
        startsFrom: validDatetime,
        startsUntil: '2026-03-20T12:00:00.000Z',
      }).instructorUserId
    ).toBe(validUuid);
  });
});
