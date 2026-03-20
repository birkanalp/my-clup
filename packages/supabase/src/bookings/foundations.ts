import type { BookingRecord, BookingSession } from '@myclup/contracts/bookings';

export type BookingFollowUpEventType =
  | 'upcoming_session_reminder'
  | 'missed_session_follow_up'
  | 'rebook_invitation';

export interface BookingCapacityReport {
  sessionId: string;
  gymId: string;
  branchId: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  fillRate: number;
  attendedCount: number;
  missedCount: number;
  cancelledCount: number;
  attendanceRate: number;
  upcomingReminderCount: number;
  rebookEligibleCount: number;
}

export interface BookingFollowUpEvent {
  type: BookingFollowUpEventType;
  key: string;
  gymId: string;
  branchId: string | null;
  memberId: string;
  sessionId: string;
  bookingId: string;
  sessionTitle: string;
  scheduledFor: string;
  sessionStartsAt: string;
  attendanceStatus: BookingRecord['attendanceStatus'];
  bookingStatus: BookingRecord['status'];
  suggestedSessionIds: string[];
}

export interface BookingFollowUpBuilderInput {
  bookings: BookingRecord[];
  sessions: BookingSession[];
  now?: string;
  reminderLeadHours?: number;
  reminderLookaheadHours?: number;
  followUpLookbackHours?: number;
  suggestionLimit?: number;
}

function toEpoch(value: string) {
  return new Date(value).getTime();
}

function clampRate(value: number) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function compareSessionSimilarity(source: BookingSession, candidate: BookingSession) {
  let score = 0;
  if (source.kind === candidate.kind) score += 4;
  if (source.instructor?.userId && source.instructor.userId === candidate.instructor?.userId) {
    score += 3;
  }
  if (source.title === candidate.title) score += 2;
  if (source.branchId && source.branchId === candidate.branchId) score += 1;
  return score;
}

function getSuggestedSessions(
  session: BookingSession,
  sessions: BookingSession[],
  suggestionLimit: number
) {
  return sessions
    .filter(
      (candidate) =>
        candidate.id !== session.id &&
        candidate.gymId === session.gymId &&
        candidate.status === 'scheduled' &&
        toEpoch(candidate.startsAt) > toEpoch(session.startsAt)
    )
    .sort((left, right) => {
      const scoreDiff =
        compareSessionSimilarity(session, right) - compareSessionSimilarity(session, left);
      if (scoreDiff !== 0) return scoreDiff;
      return toEpoch(left.startsAt) - toEpoch(right.startsAt);
    })
    .slice(0, suggestionLimit)
    .map((candidate) => candidate.id);
}

export function buildBookingCapacityReports(
  sessions: BookingSession[],
  bookings: BookingRecord[],
  now = new Date().toISOString()
): BookingCapacityReport[] {
  return sessions.map((session) => {
    const sessionBookings = bookings.filter((booking) => booking.sessionId === session.id);
    const attendedCount = sessionBookings.filter(
      (booking) =>
        booking.attendanceStatus === 'checked_in' || booking.attendanceStatus === 'completed'
    ).length;
    const missedCount = sessionBookings.filter(
      (booking) => booking.attendanceStatus === 'missed' || booking.status === 'no_show'
    ).length;
    const cancelledCount = sessionBookings.filter(
      (booking) => booking.status === 'cancelled'
    ).length;
    const upcomingReminderCount = sessionBookings.filter(
      (booking) =>
        booking.status === 'booked' &&
        booking.attendanceStatus === 'pending' &&
        toEpoch(session.startsAt) > toEpoch(now)
    ).length;
    const rebookEligibleCount = sessionBookings.filter(
      (booking) =>
        booking.status === 'cancelled' ||
        booking.attendanceStatus === 'missed' ||
        booking.status === 'no_show'
    ).length;
    const activeAttendanceBase = Math.max(session.bookedCount - cancelledCount, 0);

    return {
      sessionId: session.id,
      gymId: session.gymId,
      branchId: session.branchId,
      title: session.title,
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      capacity: session.capacity,
      bookedCount: session.bookedCount,
      waitlistCount: session.waitlistCount,
      fillRate: clampRate(session.capacity === 0 ? 0 : session.bookedCount / session.capacity),
      attendedCount,
      missedCount,
      cancelledCount,
      attendanceRate: clampRate(
        activeAttendanceBase === 0 ? 0 : attendedCount / activeAttendanceBase
      ),
      upcomingReminderCount,
      rebookEligibleCount,
    };
  });
}

export function buildBookingFollowUpEvents({
  bookings,
  sessions,
  now = new Date().toISOString(),
  reminderLeadHours = 2,
  reminderLookaheadHours = 24,
  followUpLookbackHours = 72,
  suggestionLimit = 3,
}: BookingFollowUpBuilderInput): BookingFollowUpEvent[] {
  const sessionById = new Map(sessions.map((session) => [session.id, session]));
  const nowEpoch = toEpoch(now);
  const reminderLeadMs = reminderLeadHours * 60 * 60 * 1000;
  const reminderLookaheadMs = reminderLookaheadHours * 60 * 60 * 1000;
  const followUpLookbackMs = followUpLookbackHours * 60 * 60 * 1000;

  return bookings.flatMap((booking) => {
    const session = sessionById.get(booking.sessionId);
    if (!session) return [];

    const sessionStartsAt = toEpoch(session.startsAt);
    const sessionEndedAt = toEpoch(session.endsAt);
    const suggestedSessionIds = getSuggestedSessions(session, sessions, suggestionLimit);
    const events: BookingFollowUpEvent[] = [];

    if (
      booking.status === 'booked' &&
      booking.attendanceStatus === 'pending' &&
      sessionStartsAt > nowEpoch &&
      sessionStartsAt - nowEpoch <= reminderLookaheadMs
    ) {
      events.push({
        type: 'upcoming_session_reminder',
        key: `${booking.id}:upcoming_session_reminder`,
        gymId: booking.gymId,
        branchId: booking.branchId,
        memberId: booking.memberId,
        sessionId: booking.sessionId,
        bookingId: booking.id,
        sessionTitle: session.title,
        scheduledFor: new Date(Math.max(nowEpoch, sessionStartsAt - reminderLeadMs)).toISOString(),
        sessionStartsAt: session.startsAt,
        attendanceStatus: booking.attendanceStatus,
        bookingStatus: booking.status,
        suggestedSessionIds: [],
      });
    }

    if (
      (booking.attendanceStatus === 'missed' || booking.status === 'no_show') &&
      sessionEndedAt <= nowEpoch &&
      nowEpoch - sessionEndedAt <= followUpLookbackMs
    ) {
      events.push({
        type: 'missed_session_follow_up',
        key: `${booking.id}:missed_session_follow_up`,
        gymId: booking.gymId,
        branchId: booking.branchId,
        memberId: booking.memberId,
        sessionId: booking.sessionId,
        bookingId: booking.id,
        sessionTitle: session.title,
        scheduledFor: now,
        sessionStartsAt: session.startsAt,
        attendanceStatus: booking.attendanceStatus,
        bookingStatus: booking.status,
        suggestedSessionIds,
      });
    }

    if (
      (booking.status === 'cancelled' || booking.attendanceStatus === 'missed') &&
      suggestedSessionIds.length > 0
    ) {
      events.push({
        type: 'rebook_invitation',
        key: `${booking.id}:rebook_invitation`,
        gymId: booking.gymId,
        branchId: booking.branchId,
        memberId: booking.memberId,
        sessionId: booking.sessionId,
        bookingId: booking.id,
        sessionTitle: session.title,
        scheduledFor: now,
        sessionStartsAt: session.startsAt,
        attendanceStatus: booking.attendanceStatus,
        bookingStatus: booking.status,
        suggestedSessionIds,
      });
    }

    return events;
  });
}
