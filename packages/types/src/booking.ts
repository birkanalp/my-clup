export type BookingSessionKind = 'class' | 'appointment' | 'personal_training';

export type BookingSessionStatus = 'scheduled' | 'cancelled' | 'completed';

export type BookingStatus = 'booked' | 'cancelled' | 'waitlisted' | 'attended' | 'no_show';

export type AttendanceStatus = 'pending' | 'checked_in' | 'completed' | 'missed' | 'cancelled';

export type WaitlistStatus = 'waiting' | 'promoted' | 'expired' | 'cancelled';

export type AvailabilityStatus = 'available' | 'blocked' | 'tentative';

export interface BookingInstructorRef {
  userId: string;
  displayName: string | null;
}

export interface BookingSession {
  id: string;
  gymId: string;
  branchId: string | null;
  kind: BookingSessionKind;
  status: BookingSessionStatus;
  title: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  instructor: BookingInstructorRef | null;
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  availableSpots: number;
  locationLabel: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListBookingSessionsRequest {
  gymId?: string;
  branchId?: string;
  memberId?: string;
  instructorUserId?: string;
  kind?: BookingSessionKind;
  startsFrom?: string;
  startsUntil?: string;
  cursor?: string;
  limit?: number;
}

export interface ListBookingSessionsResponse {
  items: BookingSession[];
  nextCursor: string | null;
}

export interface BookingRecord {
  id: string;
  sessionId: string;
  memberId: string;
  gymId: string;
  branchId: string | null;
  status: BookingStatus;
  attendanceStatus: AttendanceStatus;
  bookedAt: string;
  cancelledAt: string | null;
  waitlistedAt: string | null;
  checkInAt: string | null;
  waitlistPosition: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistEntry {
  id: string;
  sessionId: string;
  memberId: string;
  gymId: string;
  branchId: string | null;
  status: WaitlistStatus;
  position: number;
  promotedAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorAvailability {
  id: string;
  instructorUserId: string;
  gymId: string;
  branchId: string | null;
  startsAt: string;
  endsAt: string;
  status: AvailabilityStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListBookingsRequest {
  memberId?: string;
  sessionId?: string;
  status?: BookingStatus;
  attendanceStatus?: AttendanceStatus;
  cursor?: string;
  limit?: number;
}

export interface ListBookingsResponse {
  items: BookingRecord[];
  nextCursor: string | null;
}

export interface ListInstructorAvailabilityRequest {
  gymId?: string;
  branchId?: string;
  instructorUserId?: string;
  startsFrom?: string;
  startsUntil?: string;
  limit?: number;
}

export interface ListInstructorAvailabilityResponse {
  items: InstructorAvailability[];
}

export interface CreateBookingRequest {
  sessionId: string;
  memberId: string;
  source?: 'member_app' | 'staff_mobile' | 'gym_admin_web';
  note?: string;
}

export interface CreateBookingResponse {
  booking: BookingRecord;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface CancelBookingResponse {
  booking: BookingRecord;
}

export interface JoinWaitlistRequest {
  sessionId: string;
  memberId: string;
}

export interface JoinWaitlistResponse {
  entry: WaitlistEntry;
}

export interface UpdateAttendanceRequest {
  attendanceStatus: AttendanceStatus;
  checkedInAt?: string | null;
  note?: string;
}

export interface UpdateAttendanceResponse {
  booking: BookingRecord;
}
