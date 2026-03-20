import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ForbiddenError } from '@myclup/supabase';

vi.mock('@myclup/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@myclup/supabase')>();
  return {
    ...actual,
    getCurrentUser: vi.fn(),
    createServerClient: vi.fn(),
    resolveTenantScope: vi.fn(),
    checkPermission: vi.fn(),
    requirePermission: vi.fn(),
    listBookingSessions: vi.fn(),
    getBookingSession: vi.fn(),
    listBookings: vi.fn(),
    createBooking: vi.fn(),
    getBooking: vi.fn(),
    cancelBooking: vi.fn(),
    joinWaitlist: vi.fn(),
    updateAttendance: vi.fn(),
    listInstructorAvailability: vi.fn(),
    writeAuditEvent: vi.fn(),
  };
});

import * as supabase from '@myclup/supabase';
import {
  createNewBooking,
  createWaitlistEntry,
  listAllBookings,
  listSessions,
  patchAttendance,
} from './index';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const mockGetCurrentUser = vi.mocked(supabase.getCurrentUser);
const mockCreateServerClient = vi.mocked(supabase.createServerClient);
const mockResolveTenantScope = vi.mocked(supabase.resolveTenantScope);
const mockCheckPermission = vi.mocked(supabase.checkPermission);
const mockRequirePermission = vi.mocked(supabase.requirePermission);
const mockListBookingSessions = vi.mocked(supabase.listBookingSessions);
const mockGetBookingSession = vi.mocked(supabase.getBookingSession);
const mockListBookings = vi.mocked(supabase.listBookings);
const mockCreateBooking = vi.mocked(supabase.createBooking);
const mockGetBooking = vi.mocked(supabase.getBooking);
const mockJoinWaitlist = vi.mocked(supabase.joinWaitlist);
const mockUpdateAttendance = vi.mocked(supabase.updateAttendance);
const mockWriteAuditEvent = vi.mocked(supabase.writeAuditEvent);

const mockUser = {
  user: {
    id: validUuid,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2025-01-01T00:00:00.000Z',
  },
  profile: {
    userId: validUuid,
    displayName: 'Test',
    avatarUrl: null,
    locale: 'tr',
    fallbackLocale: 'en',
  },
} as unknown as supabase.CurrentUser;

describe('bookings server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key');
    mockCreateServerClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [{ role: 'gym_manager', gym_id: validUuid }] }),
        }),
      }),
    } as never);
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockResolveTenantScope.mockResolvedValue([{ gymId: validUuid, branchId: null }]);
    mockCheckPermission.mockResolvedValue(true);
    mockRequirePermission.mockResolvedValue(undefined);
    mockWriteAuditEvent.mockResolvedValue(validUuid);
  });

  it('returns null when unauthenticated on list sessions', async () => {
    mockGetCurrentUser.mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/v1/bookings/sessions');
    const result = await listSessions(req);
    expect(result).toBeNull();
  });

  it('lists booking sessions with resolved scope filters', async () => {
    mockListBookingSessions.mockResolvedValue({ items: [], nextCursor: null });
    const req = new NextRequest(`http://localhost/api/v1/bookings/sessions?gymId=${validUuid}`);
    const result = await listSessions(req);
    expect(result?.items).toEqual([]);
    expect(mockListBookingSessions).toHaveBeenCalled();
  });

  it('creates booking after permission check', async () => {
    mockGetBookingSession.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      kind: 'class',
      status: 'scheduled',
      title: 'Morning Class',
      startsAt: '2025-03-19T12:00:00.000Z',
      endsAt: '2025-03-19T13:00:00.000Z',
      timezone: 'Europe/Istanbul',
      instructor: null,
      capacity: 10,
      bookedCount: 4,
      waitlistCount: 0,
      availableSpots: 6,
      locationLabel: null,
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockCreateBooking.mockResolvedValue({
      booking: {
        id: validUuid,
        sessionId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'booked',
        attendanceStatus: 'pending',
        bookedAt: '2025-03-19T12:00:00.000Z',
        cancelledAt: null,
        waitlistedAt: null,
        checkInAt: null,
        waitlistPosition: null,
        notes: null,
        createdAt: '2025-03-19T12:00:00.000Z',
        updatedAt: '2025-03-19T12:00:00.000Z',
      },
    });

    const req = new NextRequest('http://localhost/api/v1/bookings');
    const result = await createNewBooking(req, { sessionId: validUuid, memberId: validUuid });
    expect(result?.booking.status).toBe('booked');
    expect(mockRequirePermission).toHaveBeenCalled();
  });

  it('lists bookings across authorized scopes', async () => {
    mockListBookings.mockResolvedValue({ items: [], nextCursor: null });
    const req = new NextRequest('http://localhost/api/v1/bookings');
    const result = await listAllBookings(req);
    expect(result?.items).toEqual([]);
  });

  it('creates waitlist entry after scope enforcement', async () => {
    mockGetBookingSession.mockResolvedValue({
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      kind: 'class',
      status: 'scheduled',
      title: 'Morning Class',
      startsAt: '2025-03-19T12:00:00.000Z',
      endsAt: '2025-03-19T13:00:00.000Z',
      timezone: 'Europe/Istanbul',
      instructor: null,
      capacity: 10,
      bookedCount: 10,
      waitlistCount: 0,
      availableSpots: 0,
      locationLabel: null,
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockJoinWaitlist.mockResolvedValue({
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
        createdAt: '2025-03-19T12:00:00.000Z',
        updatedAt: '2025-03-19T12:00:00.000Z',
      },
    });

    const req = new NextRequest('http://localhost/api/v1/bookings/waitlists');
    const result = await createWaitlistEntry(req, { sessionId: validUuid, memberId: validUuid });
    expect(result?.entry.status).toBe('waiting');
  });

  it('updates attendance for authorized booking scope', async () => {
    mockGetBooking.mockResolvedValue({
      id: validUuid,
      sessionId: validUuid,
      memberId: validUuid,
      gymId: validUuid,
      branchId: null,
      status: 'booked',
      attendanceStatus: 'pending',
      bookedAt: '2025-03-19T12:00:00.000Z',
      cancelledAt: null,
      waitlistedAt: null,
      checkInAt: null,
      waitlistPosition: null,
      notes: null,
      createdAt: '2025-03-19T12:00:00.000Z',
      updatedAt: '2025-03-19T12:00:00.000Z',
    });
    mockUpdateAttendance.mockResolvedValue({
      booking: {
        id: validUuid,
        sessionId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'attended',
        attendanceStatus: 'checked_in',
        bookedAt: '2025-03-19T12:00:00.000Z',
        cancelledAt: null,
        waitlistedAt: null,
        checkInAt: '2025-03-19T12:05:00.000Z',
        waitlistPosition: null,
        notes: null,
        createdAt: '2025-03-19T12:00:00.000Z',
        updatedAt: '2025-03-19T12:05:00.000Z',
      },
    });

    const req = new NextRequest('http://localhost/api/v1/bookings/test/attendance');
    const result = await patchAttendance(req, validUuid, {
      attendanceStatus: 'checked_in',
      checkedInAt: '2025-03-19T12:05:00.000Z',
    });
    expect(result?.booking.attendanceStatus).toBe('checked_in');
  });

  it('writes cross-tenant audit for platform admin reads', async () => {
    mockCreateServerClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [{ role: 'platform_admin', gym_id: null }] }),
        }),
      }),
    } as never);
    mockListBookingSessions.mockResolvedValue({ items: [], nextCursor: null });
    const req = new NextRequest(`http://localhost/api/v1/bookings/sessions?gymId=${validUuid}`);
    await listSessions(req);
    expect(mockWriteAuditEvent).toHaveBeenCalled();
  });

  it('throws forbidden when no allowed scope remains', async () => {
    mockCheckPermission.mockResolvedValue(false);
    const req = new NextRequest('http://localhost/api/v1/bookings');
    await expect(listAllBookings(req)).rejects.toThrow(ForbiddenError);
  });
});
