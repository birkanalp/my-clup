import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScheduleWorkspace } from './ScheduleWorkspace';

const messages = {
  common: {
    adminShell: {
      eyebrow: 'Gym admin',
      title: 'Operations workspace',
      subtitle: 'Operate schedules from one place.',
      home: 'Overview',
      schedule: 'Schedule',
      chat: 'Chat',
      chatSubtitle: 'Follow the latest member conversations.',
    },
    scheduleWorkspace: {
      heroTitle: 'Schedule',
      heroSubtitle: 'Operations calendar.',
      sessionsTitle: 'Sessions',
      sessionsSubtitle: 'Upcoming sessions',
      participantsTitle: 'Participants',
      participantsSubtitle: 'Roster',
      availabilityTitle: 'Availability',
      availabilitySubtitle: 'Instructor coverage',
      loadingBody: 'Loading workspace...',
      loadingBookings: 'Loading bookings...',
      emptyTitle: 'No sessions',
      emptyBody: 'Nothing scheduled yet.',
      errorTitle: 'Schedule unavailable',
      errorBody: 'Unable to load schedule',
      noParticipants: 'No participants',
      noAvailability: 'No availability',
      unassigned: 'Unassigned',
      bookingStatusLabel: 'Booking status',
      capacityPill: '{booked} / {capacity} booked',
      waitlistPill: '{count} waitlist',
      stats: {
        booked: 'Booked',
        available: 'Available',
        waitlist: 'Waitlist',
        instructor: 'Instructor',
      },
      actions: {
        checkIn: 'Check in',
        markMissed: 'Mark missed',
        cancelBooking: 'Cancel booking',
      },
      sessionStatus: {
        scheduled: 'Scheduled',
        cancelled: 'Cancelled',
        completed: 'Completed',
      },
      bookingStatus: {
        booked: 'Booked',
        cancelled: 'Cancelled',
        waitlisted: 'Waitlisted',
        attended: 'Attended',
        no_show: 'No show',
        pending: 'Pending',
        checked_in: 'Checked in',
        missed: 'Missed',
        completed: 'Completed',
      },
      availabilityStatus: {
        available: 'Available',
        blocked: 'Blocked',
        tentative: 'Tentative',
      },
    },
  },
};

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

const baseApi = {
  bookings: {
    listSessions: vi.fn(),
    listInstructorAvailability: vi.fn(),
    listBookings: vi.fn(),
    updateAttendance: vi.fn(),
    cancelBooking: vi.fn(),
  },
} as const;

describe('ScheduleWorkspace', () => {
  it('shows loading state before data resolves', () => {
    const api = {
      bookings: {
        ...baseApi.bookings,
        listSessions: vi.fn(() => new Promise(() => undefined)),
        listInstructorAvailability: vi.fn(() => new Promise(() => undefined)),
      },
    };

    renderWithIntl(<ScheduleWorkspace api={api as never} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading workspace...');
  });

  it('renders empty state when no sessions exist', async () => {
    const api = {
      bookings: {
        ...baseApi.bookings,
        listSessions: vi.fn().mockResolvedValue({ items: [], nextCursor: null }),
        listInstructorAvailability: vi.fn().mockResolvedValue({ items: [] }),
      },
    };

    renderWithIntl(<ScheduleWorkspace api={api as never} />);
    expect(await screen.findByText('No sessions')).toBeInTheDocument();
  });

  it('renders error state when schedule loading fails', async () => {
    const api = {
      bookings: {
        ...baseApi.bookings,
        listSessions: vi.fn().mockRejectedValue(new Error('boom')),
        listInstructorAvailability: vi.fn().mockResolvedValue({ items: [] }),
      },
    };

    renderWithIntl(<ScheduleWorkspace api={api as never} />);
    expect(await screen.findByText('Schedule unavailable')).toBeInTheDocument();
  });

  it('triggers attendance update from participant actions', async () => {
    const user = userEvent.setup();
    const api = {
      bookings: {
        ...baseApi.bookings,
        listSessions: vi.fn().mockResolvedValue({
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
        listInstructorAvailability: vi.fn().mockResolvedValue({ items: [] }),
        listBookings: vi.fn().mockResolvedValue({
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
        }),
        updateAttendance: vi.fn().mockResolvedValue({ booking: {} }),
        cancelBooking: vi.fn().mockResolvedValue({ booking: {} }),
      },
    };

    renderWithIntl(<ScheduleWorkspace api={api as never} />);
    await screen.findByRole('button', { name: /Morning Class/i });
    await user.click(await screen.findByRole('button', { name: 'Check in' }));

    await waitFor(() => {
      expect(api.bookings.updateAttendance).toHaveBeenCalledWith(
        'booking-1',
        expect.objectContaining({ attendanceStatus: 'checked_in' })
      );
    });
  });
});
