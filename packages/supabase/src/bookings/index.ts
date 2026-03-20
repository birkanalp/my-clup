import type {
  BookingRecord,
  BookingSession,
  BookingStatus,
  CancelBookingRequest,
  CancelBookingResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  InstructorAvailability,
  JoinWaitlistRequest,
  JoinWaitlistResponse,
  ListBookingsRequest,
  ListBookingsResponse,
  ListBookingSessionsRequest,
  ListBookingSessionsResponse,
  ListInstructorAvailabilityRequest,
  ListInstructorAvailabilityResponse,
  UpdateAttendanceRequest,
  UpdateAttendanceResponse,
  WaitlistEntry,
} from '@myclup/contracts/bookings';
import type { ServerSupabaseClient } from '../client';
import { NotFoundError } from '../auth';

type ScopeFilter = {
  gymIds?: string[];
  branchScopes?: Array<{ gymId: string; branchId: string | null }>;
};

type BookingSessionRow = {
  id: string;
  gym_id: string;
  branch_id: string | null;
  kind: BookingSession['kind'];
  status: BookingSession['status'];
  title: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  instructor_user_id: string | null;
  instructor_display_name: string | null;
  capacity: number;
  booked_count: number;
  waitlist_count: number;
  location_label: string | null;
  created_at: string;
  updated_at: string;
};

type BookingRow = {
  id: string;
  session_id: string;
  member_id: string;
  gym_id: string;
  branch_id: string | null;
  status: BookingStatus;
  attendance_status: BookingRecord['attendanceStatus'];
  booked_at: string;
  cancelled_at: string | null;
  waitlisted_at: string | null;
  check_in_at: string | null;
  waitlist_position: number | null;
  notes: string | null;
  source: CreateBookingRequest['source'] | null;
  created_at: string;
  updated_at: string;
};

type WaitlistRow = {
  id: string;
  session_id: string;
  member_id: string;
  gym_id: string;
  branch_id: string | null;
  status: WaitlistEntry['status'];
  position: number;
  promoted_at: string | null;
  expired_at: string | null;
  created_at: string;
  updated_at: string;
};

type InstructorAvailabilityRow = {
  id: string;
  instructor_user_id: string;
  gym_id: string;
  branch_id: string | null;
  starts_at: string;
  ends_at: string;
  status: InstructorAvailability['status'];
  note: string | null;
  created_at: string;
  updated_at: string;
};

type InternalListBookingSessionsRequest = ListBookingSessionsRequest & ScopeFilter;
type InternalListBookingsRequest = ListBookingsRequest & ScopeFilter;
type InternalListInstructorAvailabilityRequest = ListInstructorAvailabilityRequest & ScopeFilter;

function table(client: ServerSupabaseClient, name: string) {
  return (client as unknown as { from: (tableName: string) => unknown }).from(name) as {
    [key: string]: (...args: unknown[]) => unknown;
  };
}

function buildScopeClause(
  branchScopes?: Array<{ gymId: string; branchId: string | null }>
): string | null {
  if (!branchScopes || branchScopes.length === 0) return null;
  return branchScopes
    .map((scope) =>
      scope.branchId
        ? `and(gym_id.eq.${scope.gymId},branch_id.eq.${scope.branchId})`
        : `and(gym_id.eq.${scope.gymId},branch_id.is.null)`
    )
    .join(',');
}

function applyScopeFilter(
  query: {
    or: (clause: string) => unknown;
    eq: (column: string, value: unknown) => unknown;
    in: (column: string, values: unknown[]) => unknown;
  },
  scopeFilter: ScopeFilter
) {
  if (scopeFilter.branchScopes && scopeFilter.branchScopes.length > 0) {
    const clause = buildScopeClause(scopeFilter.branchScopes);
    if (clause) {
      return query.or(clause);
    }
  }

  if (scopeFilter.gymIds && scopeFilter.gymIds.length > 0) {
    if (scopeFilter.gymIds.length === 1) {
      return query.eq('gym_id', scopeFilter.gymIds[0]);
    }
    return query.in('gym_id', scopeFilter.gymIds);
  }

  return query;
}

function toBookingSession(row: BookingSessionRow): BookingSession {
  return {
    id: row.id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    kind: row.kind,
    status: row.status,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    timezone: row.timezone,
    instructor: row.instructor_user_id
      ? {
          userId: row.instructor_user_id,
          displayName: row.instructor_display_name,
        }
      : null,
    capacity: row.capacity,
    bookedCount: row.booked_count,
    waitlistCount: row.waitlist_count,
    availableSpots: Math.max(row.capacity - row.booked_count, 0),
    locationLabel: row.location_label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toBookingRecord(row: BookingRow): BookingRecord {
  return {
    id: row.id,
    sessionId: row.session_id,
    memberId: row.member_id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    status: row.status,
    attendanceStatus: row.attendance_status,
    bookedAt: row.booked_at,
    cancelledAt: row.cancelled_at,
    waitlistedAt: row.waitlisted_at,
    checkInAt: row.check_in_at,
    waitlistPosition: row.waitlist_position,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toWaitlistEntry(row: WaitlistRow): WaitlistEntry {
  return {
    id: row.id,
    sessionId: row.session_id,
    memberId: row.member_id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    status: row.status,
    position: row.position,
    promotedAt: row.promoted_at,
    expiredAt: row.expired_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toInstructorAvailability(row: InstructorAvailabilityRow): InstructorAvailability {
  return {
    id: row.id,
    instructorUserId: row.instructor_user_id,
    gymId: row.gym_id,
    branchId: row.branch_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getSessionRow(client: ServerSupabaseClient, sessionId: string) {
  const { data, error } = await table(client, 'booking_sessions')
    .select(
      'id, gym_id, branch_id, kind, status, title, starts_at, ends_at, timezone, instructor_user_id, instructor_display_name, capacity, booked_count, waitlist_count, location_label, created_at, updated_at'
    )
    .eq('id', sessionId)
    .maybeSingle();

  if (error) throw new Error(`getBookingSession failed: ${error.message}`);
  if (!data) throw new NotFoundError('booking_session_not_found');
  return data as BookingSessionRow;
}

async function getBookingRow(client: ServerSupabaseClient, bookingId: string) {
  const { data, error } = await table(client, 'bookings')
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, attendance_status, booked_at, cancelled_at, waitlisted_at, check_in_at, waitlist_position, notes, source, created_at, updated_at'
    )
    .eq('id', bookingId)
    .maybeSingle();

  if (error) throw new Error(`getBooking failed: ${error.message}`);
  if (!data) throw new NotFoundError('booking_not_found');
  return data as BookingRow;
}

async function getActiveBookingForMember(
  client: ServerSupabaseClient,
  sessionId: string,
  memberId: string
) {
  const { data, error } = await table(client, 'bookings')
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, attendance_status, booked_at, cancelled_at, waitlisted_at, check_in_at, waitlist_position, notes, source, created_at, updated_at'
    )
    .eq('session_id', sessionId)
    .eq('member_id', memberId)
    .in('status', ['booked', 'waitlisted', 'attended'])
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (error) throw new Error(`getActiveBookingForMember failed: ${error.message}`);
  return (data as BookingRow | null) ?? null;
}

async function shiftWaitlistPositions(
  client: ServerSupabaseClient,
  sessionId: string,
  removedPosition: number
) {
  const { data, error } = await table(client, 'booking_waitlist_entries')
    .select('id, position, member_id')
    .eq('session_id', sessionId)
    .eq('status', 'waiting')
    .gt('position', removedPosition)
    .order('position', { ascending: true });

  if (error) throw new Error(`shiftWaitlistPositions failed: ${error.message}`);

  for (const row of (data as Array<{ id: string; position: number; member_id: string }> | null) ??
    []) {
    await table(client, 'booking_waitlist_entries')
      .update({ position: row.position - 1, updated_at: new Date().toISOString() })
      .eq('id', row.id);

    await table(client, 'bookings')
      .update({ waitlist_position: row.position - 1, updated_at: new Date().toISOString() })
      .eq('session_id', sessionId)
      .eq('member_id', row.member_id)
      .eq('status', 'waitlisted');
  }
}

async function promoteNextWaitlistEntry(client: ServerSupabaseClient, session: BookingSessionRow) {
  const { data, error } = await table(client, 'booking_waitlist_entries')
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, position, promoted_at, expired_at, created_at, updated_at'
    )
    .eq('session_id', session.id)
    .eq('status', 'waiting')
    .order('position', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`promoteNextWaitlistEntry failed: ${error.message}`);
  if (!data) return null;

  const now = new Date().toISOString();
  const entry = data as WaitlistRow;

  await table(client, 'booking_waitlist_entries')
    .update({ status: 'promoted', promoted_at: now, updated_at: now })
    .eq('id', entry.id);

  const { data: promotedBooking, error: bookingError } = await table(client, 'bookings')
    .update({
      status: 'booked',
      waitlist_position: null,
      updated_at: now,
    })
    .eq('session_id', session.id)
    .eq('member_id', entry.member_id)
    .eq('status', 'waitlisted')
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, attendance_status, booked_at, cancelled_at, waitlisted_at, check_in_at, waitlist_position, notes, source, created_at, updated_at'
    )
    .single();

  if (bookingError || !promotedBooking) {
    throw new Error(`promoteNextWaitlistEntry booking update failed: ${bookingError?.message}`);
  }

  await table(client, 'booking_sessions')
    .update({
      booked_count: session.booked_count,
      waitlist_count: Math.max(session.waitlist_count - 1, 0),
      updated_at: now,
    })
    .eq('id', session.id);

  await shiftWaitlistPositions(client, session.id, entry.position);

  return {
    entry: toWaitlistEntry({
      ...entry,
      status: 'promoted',
      promoted_at: now,
      updated_at: now,
    }),
    booking: toBookingRecord(promotedBooking as BookingRow),
  };
}

export async function listBookingSessions(
  client: ServerSupabaseClient,
  input: InternalListBookingSessionsRequest
): Promise<ListBookingSessionsResponse> {
  const limit = input.limit ?? 20;
  let query = table(client, 'booking_sessions')
    .select(
      'id, gym_id, branch_id, kind, status, title, starts_at, ends_at, timezone, instructor_user_id, instructor_display_name, capacity, booked_count, waitlist_count, location_label, created_at, updated_at'
    )
    .order('starts_at', { ascending: true })
    .limit(limit + 1);

  query = applyScopeFilter(query, input);
  if (input.kind) query = query.eq('kind', input.kind);
  if (input.status) query = query.eq('status', input.status);
  if (input.instructorUserId) query = query.eq('instructor_user_id', input.instructorUserId);
  if (input.startsFrom) query = query.gte('starts_at', input.startsFrom);
  if (input.startsUntil) query = query.lte('starts_at', input.startsUntil);
  if (input.cursor) query = query.gt('starts_at', input.cursor);

  const { data, error } = await query;
  if (error) throw new Error(`listBookingSessions failed: ${error.message}`);

  const rows = (data as BookingSessionRow[] | null) ?? [];
  const hasMore = rows.length > limit;
  const items = (hasMore ? rows.slice(0, limit) : rows).map(toBookingSession);
  return {
    items,
    nextCursor: hasMore ? (rows[limit - 1]?.starts_at ?? null) : null,
  };
}

export async function getBookingSession(
  client: ServerSupabaseClient,
  sessionId: string
): Promise<BookingSession> {
  return toBookingSession(await getSessionRow(client, sessionId));
}

export async function listBookings(
  client: ServerSupabaseClient,
  input: InternalListBookingsRequest
): Promise<ListBookingsResponse> {
  const limit = input.limit ?? 20;
  let query = table(client, 'bookings')
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, attendance_status, booked_at, cancelled_at, waitlisted_at, check_in_at, waitlist_position, notes, source, created_at, updated_at'
    )
    .order('updated_at', { ascending: false })
    .limit(limit + 1);

  query = applyScopeFilter(query, input);
  if (input.memberId) query = query.eq('member_id', input.memberId);
  if (input.sessionId) query = query.eq('session_id', input.sessionId);
  if (input.status) query = query.eq('status', input.status);
  if (input.attendanceStatus) query = query.eq('attendance_status', input.attendanceStatus);
  if (input.cursor) {
    const { data: cursorRow } = await table(client, 'bookings')
      .select('updated_at')
      .eq('id', input.cursor)
      .maybeSingle();
    if ((cursorRow as { updated_at?: string } | null)?.updated_at) {
      query = query.lt('updated_at', cursorRow.updated_at);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`listBookings failed: ${error.message}`);

  const rows = (data as BookingRow[] | null) ?? [];
  const hasMore = rows.length > limit;
  const items = (hasMore ? rows.slice(0, limit) : rows).map(toBookingRecord);
  return {
    items,
    nextCursor: hasMore ? (rows[limit - 1]?.id ?? null) : null,
  };
}

export async function getBooking(
  client: ServerSupabaseClient,
  bookingId: string
): Promise<BookingRecord> {
  return toBookingRecord(await getBookingRow(client, bookingId));
}

export async function createBooking(
  client: ServerSupabaseClient,
  input: CreateBookingRequest
): Promise<CreateBookingResponse> {
  const session = await getSessionRow(client, input.sessionId);
  if (session.status !== 'scheduled') {
    throw new Error('booking_session_unavailable');
  }

  const existing = await getActiveBookingForMember(client, input.sessionId, input.memberId);
  if (existing) {
    return { booking: toBookingRecord(existing) };
  }

  if (session.booked_count >= session.capacity) {
    throw new Error('booking_session_full');
  }

  const now = new Date().toISOString();
  const { data, error } = await table(client, 'bookings')
    .insert({
      session_id: session.id,
      member_id: input.memberId,
      gym_id: session.gym_id,
      branch_id: session.branch_id,
      status: 'booked',
      attendance_status: 'pending',
      booked_at: now,
      notes: input.note ?? null,
      source: input.source ?? null,
    })
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, attendance_status, booked_at, cancelled_at, waitlisted_at, check_in_at, waitlist_position, notes, source, created_at, updated_at'
    )
    .single();

  if (error || !data) throw new Error(`createBooking failed: ${error?.message}`);

  await table(client, 'booking_sessions')
    .update({ booked_count: session.booked_count + 1, updated_at: now })
    .eq('id', session.id);

  return { booking: toBookingRecord(data as BookingRow) };
}

export async function cancelBooking(
  client: ServerSupabaseClient,
  bookingId: string,
  input: CancelBookingRequest
): Promise<CancelBookingResponse> {
  const current = await getBookingRow(client, bookingId);
  const session = await getSessionRow(client, current.session_id);
  const now = new Date().toISOString();

  const { data, error } = await table(client, 'bookings')
    .update({
      status: 'cancelled',
      attendance_status: 'cancelled',
      cancelled_at: now,
      notes: input.reason ?? current.notes,
      updated_at: now,
    })
    .eq('id', bookingId)
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, attendance_status, booked_at, cancelled_at, waitlisted_at, check_in_at, waitlist_position, notes, source, created_at, updated_at'
    )
    .single();

  if (error || !data) throw new Error(`cancelBooking failed: ${error?.message}`);

  if (current.status === 'booked' || current.status === 'attended') {
    await table(client, 'booking_sessions')
      .update({ booked_count: Math.max(session.booked_count - 1, 0), updated_at: now })
      .eq('id', session.id);
    await promoteNextWaitlistEntry(client, {
      ...session,
      booked_count: Math.max(session.booked_count - 1, 0),
    });
  }

  if (current.status === 'waitlisted' && current.waitlist_position !== null) {
    await table(client, 'booking_waitlist_entries')
      .update({ status: 'cancelled', updated_at: now })
      .eq('session_id', current.session_id)
      .eq('member_id', current.member_id)
      .eq('status', 'waiting');

    await table(client, 'booking_sessions')
      .update({ waitlist_count: Math.max(session.waitlist_count - 1, 0), updated_at: now })
      .eq('id', session.id);

    await shiftWaitlistPositions(client, current.session_id, current.waitlist_position);
  }

  return { booking: toBookingRecord(data as BookingRow) };
}

export async function joinWaitlist(
  client: ServerSupabaseClient,
  input: JoinWaitlistRequest
): Promise<JoinWaitlistResponse> {
  const session = await getSessionRow(client, input.sessionId);
  const existing = await getActiveBookingForMember(client, input.sessionId, input.memberId);
  if (existing?.status === 'waitlisted') {
    const { data, error } = await table(client, 'booking_waitlist_entries')
      .select(
        'id, session_id, member_id, gym_id, branch_id, status, position, promoted_at, expired_at, created_at, updated_at'
      )
      .eq('session_id', input.sessionId)
      .eq('member_id', input.memberId)
      .in('status', ['waiting', 'promoted'])
      .order('created_at', { ascending: false })
      .maybeSingle();
    if (error) throw new Error(`joinWaitlist failed: ${error.message}`);
    if (data) return { entry: toWaitlistEntry(data as WaitlistRow) };
  }
  if (existing) {
    throw new Error('booking_exists');
  }

  const { count, error: countError } = await table(client, 'booking_waitlist_entries')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', input.sessionId)
    .eq('status', 'waiting');
  if (countError) throw new Error(`joinWaitlist count failed: ${countError.message}`);

  const now = new Date().toISOString();
  const position = (count ?? 0) + 1;

  const { data: booking, error: bookingError } = await table(client, 'bookings')
    .insert({
      session_id: session.id,
      member_id: input.memberId,
      gym_id: session.gym_id,
      branch_id: session.branch_id,
      status: 'waitlisted',
      attendance_status: 'pending',
      booked_at: now,
      waitlisted_at: now,
      waitlist_position: position,
      source: 'member_app',
    })
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, attendance_status, booked_at, cancelled_at, waitlisted_at, check_in_at, waitlist_position, notes, source, created_at, updated_at'
    )
    .single();
  if (bookingError || !booking)
    throw new Error(`joinWaitlist booking failed: ${bookingError?.message}`);

  const { data, error } = await table(client, 'booking_waitlist_entries')
    .insert({
      session_id: session.id,
      member_id: input.memberId,
      gym_id: session.gym_id,
      branch_id: session.branch_id,
      status: 'waiting',
      position,
    })
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, position, promoted_at, expired_at, created_at, updated_at'
    )
    .single();
  if (error || !data) throw new Error(`joinWaitlist failed: ${error?.message}`);

  await table(client, 'booking_sessions')
    .update({ waitlist_count: session.waitlist_count + 1, updated_at: now })
    .eq('id', session.id);

  return { entry: toWaitlistEntry(data as WaitlistRow) };
}

export async function updateAttendance(
  client: ServerSupabaseClient,
  bookingId: string,
  input: UpdateAttendanceRequest
): Promise<UpdateAttendanceResponse> {
  const current = await getBookingRow(client, bookingId);
  const now = new Date().toISOString();

  const nextStatus: BookingStatus =
    input.attendanceStatus === 'checked_in' || input.attendanceStatus === 'completed'
      ? 'attended'
      : input.attendanceStatus === 'missed'
        ? 'no_show'
        : input.attendanceStatus === 'cancelled'
          ? 'cancelled'
          : current.status;

  const { data, error } = await table(client, 'bookings')
    .update({
      status: nextStatus,
      attendance_status: input.attendanceStatus,
      check_in_at:
        input.attendanceStatus === 'checked_in' ? (input.checkedInAt ?? now) : current.check_in_at,
      notes: input.note ?? current.notes,
      updated_at: now,
    })
    .eq('id', bookingId)
    .select(
      'id, session_id, member_id, gym_id, branch_id, status, attendance_status, booked_at, cancelled_at, waitlisted_at, check_in_at, waitlist_position, notes, source, created_at, updated_at'
    )
    .single();

  if (error || !data) throw new Error(`updateAttendance failed: ${error?.message}`);
  return { booking: toBookingRecord(data as BookingRow) };
}

export async function listInstructorAvailability(
  client: ServerSupabaseClient,
  input: InternalListInstructorAvailabilityRequest
): Promise<ListInstructorAvailabilityResponse> {
  let query = table(client, 'instructor_availability')
    .select(
      'id, instructor_user_id, gym_id, branch_id, starts_at, ends_at, status, note, created_at, updated_at'
    )
    .order('starts_at', { ascending: true })
    .limit(input.limit ?? 100);

  query = applyScopeFilter(query, input);
  if (input.instructorUserId) query = query.eq('instructor_user_id', input.instructorUserId);
  if (input.startsFrom) query = query.gte('starts_at', input.startsFrom);
  if (input.startsUntil) query = query.lte('starts_at', input.startsUntil);

  const { data, error } = await query;
  if (error) throw new Error(`listInstructorAvailability failed: ${error.message}`);

  return {
    items: ((data as InstructorAvailabilityRow[] | null) ?? []).map(toInstructorAvailability),
  };
}
