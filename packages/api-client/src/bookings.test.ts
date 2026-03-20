import { describe, expect, it, vi } from 'vitest';
import { createApi } from './index';
import {
  BookingSessionSchema,
  ListBookingsResponseSchema,
  ListBookingSessionsResponseSchema,
  ListInstructorAvailabilityResponseSchema,
} from '@myclup/contracts/bookings';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const validDatetime = '2025-03-19T12:00:00.000Z';

function mockFetch(status: number, body: unknown): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : String(status),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  }) as unknown as typeof fetch;
}

describe('bookings api', () => {
  it('lists booking sessions with query params', async () => {
    const payload = {
      items: [
        {
          id: validUuid,
          gymId: validUuid,
          branchId: null,
          kind: 'class' as const,
          status: 'scheduled' as const,
          title: 'Morning Class',
          startsAt: validDatetime,
          endsAt: '2025-03-19T13:00:00.000Z',
          timezone: 'Europe/Istanbul',
          instructor: null,
          capacity: 12,
          bookedCount: 4,
          waitlistCount: 1,
          availableSpots: 8,
          locationLabel: null,
          createdAt: validDatetime,
          updatedAt: validDatetime,
        },
      ],
      nextCursor: null,
    };
    const mockFetchFn = mockFetch(200, payload);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.bookings.listSessions({ limit: 20, gymId: validUuid });
    expect(ListBookingSessionsResponseSchema.safeParse(result).success).toBe(true);
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.stringContaining(`/api/v1/bookings/sessions?limit=20&gymId=${validUuid}`),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('gets booking session detail with path param', async () => {
    const payload = {
      id: validUuid,
      gymId: validUuid,
      branchId: null,
      kind: 'class' as const,
      status: 'scheduled' as const,
      title: 'Morning Class',
      startsAt: validDatetime,
      endsAt: '2025-03-19T13:00:00.000Z',
      timezone: 'Europe/Istanbul',
      instructor: null,
      capacity: 12,
      bookedCount: 4,
      waitlistCount: 1,
      availableSpots: 8,
      locationLabel: null,
      createdAt: validDatetime,
      updatedAt: validDatetime,
    };
    const mockFetchFn = mockFetch(200, payload);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.bookings.getSession(validUuid);
    expect(BookingSessionSchema.safeParse(result).success).toBe(true);
    expect(mockFetchFn).toHaveBeenCalledWith(
      `http://localhost:3001/api/v1/bookings/sessions/${validUuid}`,
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('lists bookings on versioned endpoint', async () => {
    const payload = { items: [], nextCursor: null };
    const mockFetchFn = mockFetch(200, payload);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.bookings.listBookings({
      limit: 20,
      memberId: validUuid,
      status: 'booked',
    });
    expect(ListBookingsResponseSchema.safeParse(result).success).toBe(true);
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.stringContaining(`/api/v1/bookings?limit=20&memberId=${validUuid}&status=booked`),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('creates and cancels booking with path param support', async () => {
    const bookingPayload = {
      booking: {
        id: validUuid,
        sessionId: validUuid,
        memberId: validUuid,
        gymId: validUuid,
        branchId: null,
        status: 'booked' as const,
        attendanceStatus: 'pending' as const,
        bookedAt: validDatetime,
        cancelledAt: null,
        waitlistedAt: null,
        checkInAt: null,
        waitlistPosition: null,
        notes: null,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      },
    };
    const cancelledPayload = {
      booking: {
        ...bookingPayload.booking,
        status: 'cancelled' as const,
        attendanceStatus: 'cancelled' as const,
        cancelledAt: validDatetime,
      },
    };
    const mockFetchFn = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(bookingPayload),
        text: () => Promise.resolve(JSON.stringify(bookingPayload)),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve(cancelledPayload),
        text: () => Promise.resolve(JSON.stringify(cancelledPayload)),
      }) as unknown as typeof fetch;

    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });
    await api.bookings.createBooking({ sessionId: validUuid, memberId: validUuid });
    await api.bookings.cancelBooking(validUuid, { reason: 'member_requested' });

    expect((mockFetchFn as ReturnType<typeof vi.fn>).mock.calls[0]?.[0]).toBe(
      'http://localhost:3001/api/v1/bookings'
    );
    expect((mockFetchFn as ReturnType<typeof vi.fn>).mock.calls[1]?.[0]).toBe(
      `http://localhost:3001/api/v1/bookings/${validUuid}/cancel`
    );
  });

  it('lists instructor availability from versioned endpoint', async () => {
    const payload = {
      items: [
        {
          id: validUuid,
          instructorUserId: validUuid,
          gymId: validUuid,
          branchId: null,
          startsAt: validDatetime,
          endsAt: '2025-03-19T13:00:00.000Z',
          status: 'available' as const,
          note: null,
          createdAt: validDatetime,
          updatedAt: validDatetime,
        },
      ],
    };
    const mockFetchFn = mockFetch(200, payload);
    const api = createApi({ baseUrl: 'http://localhost:3001', fetch: mockFetchFn });

    const result = await api.bookings.listInstructorAvailability({
      limit: 100,
      instructorUserId: validUuid,
    });
    expect(ListInstructorAvailabilityResponseSchema.safeParse(result).success).toBe(true);
    expect(mockFetchFn).toHaveBeenCalledWith(
      expect.stringContaining(
        `/api/v1/bookings/instructor-availability?limit=100&instructorUserId=${validUuid}`
      ),
      expect.objectContaining({ method: 'GET' })
    );
  });
});
