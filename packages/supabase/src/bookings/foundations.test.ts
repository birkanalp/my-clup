import { describe, expect, it } from 'vitest';
import type { BookingRecord, BookingSession } from '@myclup/contracts/bookings';
import { buildBookingCapacityReports, buildBookingFollowUpEvents } from './foundations';

const sessionA: BookingSession = {
  id: '550e8400-e29b-41d4-a716-446655440010',
  gymId: '550e8400-e29b-41d4-a716-446655440000',
  branchId: null,
  kind: 'class',
  status: 'scheduled',
  title: 'Morning Class',
  startsAt: '2025-03-19T12:00:00.000Z',
  endsAt: '2025-03-19T13:00:00.000Z',
  timezone: 'Europe/Istanbul',
  instructor: {
    userId: '550e8400-e29b-41d4-a716-446655440001',
    displayName: 'Coach Ada',
  },
  capacity: 10,
  bookedCount: 6,
  waitlistCount: 2,
  availableSpots: 4,
  locationLabel: null,
  createdAt: '2025-03-18T12:00:00.000Z',
  updatedAt: '2025-03-18T12:00:00.000Z',
};

const sessionB: BookingSession = {
  ...sessionA,
  id: '550e8400-e29b-41d4-a716-446655440011',
  startsAt: '2025-03-20T12:00:00.000Z',
  endsAt: '2025-03-20T13:00:00.000Z',
};

const sessionC: BookingSession = {
  ...sessionA,
  id: '550e8400-e29b-41d4-a716-446655440012',
  title: 'Evening PT',
  kind: 'personal_training',
  startsAt: '2025-03-20T18:00:00.000Z',
  endsAt: '2025-03-20T19:00:00.000Z',
};

const bookingBase: BookingRecord = {
  id: '550e8400-e29b-41d4-a716-446655440020',
  sessionId: sessionA.id,
  memberId: '550e8400-e29b-41d4-a716-446655440030',
  gymId: sessionA.gymId,
  branchId: null,
  status: 'booked',
  attendanceStatus: 'pending',
  bookedAt: '2025-03-18T13:00:00.000Z',
  cancelledAt: null,
  waitlistedAt: null,
  checkInAt: null,
  waitlistPosition: null,
  notes: null,
  createdAt: '2025-03-18T13:00:00.000Z',
  updatedAt: '2025-03-18T13:00:00.000Z',
};

describe('booking foundations', () => {
  it('builds capacity and attendance report summaries from canonical records', () => {
    const reports = buildBookingCapacityReports(
      [sessionA],
      [
        bookingBase,
        {
          ...bookingBase,
          id: '550e8400-e29b-41d4-a716-446655440021',
          attendanceStatus: 'checked_in',
        },
        {
          ...bookingBase,
          id: '550e8400-e29b-41d4-a716-446655440022',
          status: 'cancelled',
          attendanceStatus: 'cancelled',
          cancelledAt: '2025-03-19T10:00:00.000Z',
        },
        {
          ...bookingBase,
          id: '550e8400-e29b-41d4-a716-446655440023',
          attendanceStatus: 'missed',
          status: 'no_show',
        },
      ],
      '2025-03-19T09:00:00.000Z'
    );

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      sessionId: sessionA.id,
      fillRate: 0.6,
      attendedCount: 1,
      missedCount: 1,
      cancelledCount: 1,
      upcomingReminderCount: 1,
      rebookEligibleCount: 2,
    });
  });

  it('emits reminder, missed follow-up, and rebook events from shared booking data', () => {
    const events = buildBookingFollowUpEvents({
      sessions: [sessionA, sessionB, sessionC],
      bookings: [
        {
          ...bookingBase,
          id: '550e8400-e29b-41d4-a716-446655440026',
          sessionId: sessionB.id,
        },
        {
          ...bookingBase,
          id: '550e8400-e29b-41d4-a716-446655440024',
          attendanceStatus: 'missed',
          status: 'booked',
        },
        {
          ...bookingBase,
          id: '550e8400-e29b-41d4-a716-446655440025',
          attendanceStatus: 'cancelled',
          status: 'cancelled',
          cancelledAt: '2025-03-19T09:30:00.000Z',
        },
      ],
      now: '2025-03-19T14:00:00.000Z',
    });

    expect(events.map((event) => event.type)).toEqual([
      'upcoming_session_reminder',
      'missed_session_follow_up',
      'rebook_invitation',
      'rebook_invitation',
    ]);
    expect(events[1].suggestedSessionIds).toContain(sessionB.id);
    expect(events[2].suggestedSessionIds).toContain(sessionB.id);
  });
});
