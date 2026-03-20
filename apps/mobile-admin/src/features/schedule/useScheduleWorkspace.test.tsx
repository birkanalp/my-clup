import { beforeEach, describe, expect, it, vi } from 'vitest';
import TestRenderer, { act } from 'react-test-renderer';
import { useScheduleWorkspace } from './useScheduleWorkspace';

type HarnessProps = {
  apiClient: {
    bookings: {
      listSessions: ReturnType<typeof vi.fn>;
      listInstructorAvailability: ReturnType<typeof vi.fn>;
      listBookings: ReturnType<typeof vi.fn>;
      updateAttendance: ReturnType<typeof vi.fn>;
    };
  };
  onValue: (value: ReturnType<typeof useScheduleWorkspace>) => void;
};

function HookHarness({ apiClient, onValue }: HarnessProps) {
  const value = useScheduleWorkspace(apiClient as never);
  onValue(value);
  return null;
}

describe('useScheduleWorkspace', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('starts in loading state while schedule data is pending', async () => {
    const apiClient = {
      bookings: {
        listSessions: vi.fn(() => new Promise(() => undefined)),
        listInstructorAvailability: vi.fn(() => new Promise(() => undefined)),
        listBookings: vi.fn(),
        updateAttendance: vi.fn(),
      },
    };

    let latestValue: ReturnType<typeof useScheduleWorkspace> | undefined;

    await act(async () => {
      TestRenderer.create(
        <HookHarness apiClient={apiClient} onValue={(value) => void (latestValue = value)} />
      );
    });

    expect(latestValue?.loading).toBe(true);
    expect(latestValue?.sessions).toEqual([]);
  });

  it('resolves empty state when no sessions exist', async () => {
    const apiClient = {
      bookings: {
        listSessions: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
        listInstructorAvailability: vi.fn().mockResolvedValue({ items: [] }),
        listBookings: vi.fn(),
        updateAttendance: vi.fn(),
      },
    };

    let latestValue: ReturnType<typeof useScheduleWorkspace> | undefined;

    await act(async () => {
      TestRenderer.create(
        <HookHarness apiClient={apiClient} onValue={(value) => void (latestValue = value)} />
      );
      await Promise.resolve();
    });

    expect(latestValue?.loading).toBe(false);
    expect(latestValue?.sessions).toEqual([]);
    expect(latestValue?.error).toBeNull();
  });

  it('captures loading errors', async () => {
    const apiClient = {
      bookings: {
        listSessions: vi.fn().mockRejectedValue(new Error('boom')),
        listInstructorAvailability: vi.fn().mockResolvedValue({ items: [] }),
        listBookings: vi.fn(),
        updateAttendance: vi.fn(),
      },
    };

    let latestValue: ReturnType<typeof useScheduleWorkspace> | undefined;

    await act(async () => {
      TestRenderer.create(
        <HookHarness apiClient={apiClient} onValue={(value) => void (latestValue = value)} />
      );
      await Promise.resolve();
    });

    expect(latestValue?.loading).toBe(false);
    expect(latestValue?.error?.message).toBe('boom');
  });

  it('loads roster and dispatches attendance updates', async () => {
    const apiClient = {
      bookings: {
        listSessions: vi
          .fn()
          .mockResolvedValueOnce({
            items: [
              {
                id: 'session-1',
                gymId: 'gym-1',
                branchId: null,
                kind: 'class',
                status: 'scheduled',
                title: 'Morning Class',
                startsAt: '2025-03-19T12:00:00.000Z',
                endsAt: '2025-03-19T13:00:00.000Z',
                timezone: 'Europe/Istanbul',
                instructor: { userId: 'coach-1', displayName: 'Coach Ada' },
                capacity: 12,
                bookedCount: 4,
                waitlistCount: 1,
                availableSpots: 8,
                locationLabel: null,
                createdAt: '2025-03-19T10:00:00.000Z',
                updatedAt: '2025-03-19T10:00:00.000Z',
              },
            ],
            nextCursor: null,
          })
          .mockResolvedValueOnce({
            items: [
              {
                id: 'session-1',
                gymId: 'gym-1',
                branchId: null,
                kind: 'class',
                status: 'scheduled',
                title: 'Morning Class',
                startsAt: '2025-03-19T12:00:00.000Z',
                endsAt: '2025-03-19T13:00:00.000Z',
                timezone: 'Europe/Istanbul',
                instructor: { userId: 'coach-1', displayName: 'Coach Ada' },
                capacity: 12,
                bookedCount: 4,
                waitlistCount: 1,
                availableSpots: 8,
                locationLabel: null,
                createdAt: '2025-03-19T10:00:00.000Z',
                updatedAt: '2025-03-19T10:00:00.000Z',
              },
            ],
            nextCursor: null,
          }),
        listInstructorAvailability: vi
          .fn()
          .mockResolvedValueOnce({ items: [] })
          .mockResolvedValueOnce({ items: [] }),
        listBookings: vi
          .fn()
          .mockResolvedValueOnce({
            items: [
              {
                id: 'booking-1',
                sessionId: 'session-1',
                memberId: 'member-1',
                gymId: 'gym-1',
                branchId: null,
                status: 'booked',
                attendanceStatus: 'pending',
                bookedAt: '2025-03-19T11:00:00.000Z',
                cancelledAt: null,
                waitlistedAt: null,
                checkInAt: null,
                waitlistPosition: null,
                notes: null,
                createdAt: '2025-03-19T11:00:00.000Z',
                updatedAt: '2025-03-19T11:00:00.000Z',
              },
            ],
            nextCursor: null,
          })
          .mockResolvedValueOnce({
            items: [
              {
                id: 'booking-1',
                sessionId: 'session-1',
                memberId: 'member-1',
                gymId: 'gym-1',
                branchId: null,
                status: 'booked',
                attendanceStatus: 'checked_in',
                bookedAt: '2025-03-19T11:00:00.000Z',
                cancelledAt: null,
                waitlistedAt: null,
                checkInAt: '2025-03-19T12:05:00.000Z',
                waitlistPosition: null,
                notes: null,
                createdAt: '2025-03-19T11:00:00.000Z',
                updatedAt: '2025-03-19T12:05:00.000Z',
              },
            ],
            nextCursor: null,
          }),
        updateAttendance: vi.fn().mockResolvedValue({ booking: {} }),
      },
    };

    let latestValue: ReturnType<typeof useScheduleWorkspace> | undefined;

    await act(async () => {
      TestRenderer.create(
        <HookHarness apiClient={apiClient} onValue={(value) => void (latestValue = value)} />
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(latestValue?.selectedSession?.id).toBe('session-1');
    expect(latestValue?.bookings).toHaveLength(1);

    await act(async () => {
      await latestValue?.updateAttendance('booking-1', 'checked_in');
    });

    expect(apiClient.bookings.updateAttendance).toHaveBeenCalledWith(
      'booking-1',
      expect.objectContaining({ attendanceStatus: 'checked_in' })
    );
  });
});
