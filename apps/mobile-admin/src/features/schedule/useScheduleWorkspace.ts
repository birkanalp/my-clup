import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BookingRecord, BookingSession, InstructorAvailability } from '@myclup/api-client';
import { api } from '../../lib/api';

type ScheduleApi = Pick<typeof api, 'bookings'>;

export function useScheduleWorkspace(apiClient: ScheduleApi = api) {
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [availability, setAvailability] = useState<InstructorAvailability[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [actionError, setActionError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, sessions]
  );

  const loadBookings = useCallback(
    async (sessionId: string) => {
      setBookingLoading(true);
      setBookings([]);
      setActionError(null);
      try {
        const response = await apiClient.bookings.listBookings({ limit: 50, sessionId });
        setBookings(response.items);
      } catch (loadError) {
        setBookings([]);
        setActionError(loadError instanceof Error ? loadError : new Error(String(loadError)));
      } finally {
        setBookingLoading(false);
      }
    },
    [apiClient]
  );

  const loadWorkspace = useCallback(async () => {
    setError(null);
    try {
      const [sessionResponse, availabilityResponse] = await Promise.all([
        apiClient.bookings.listSessions({ limit: 24 }),
        apiClient.bookings.listInstructorAvailability({ limit: 12 }),
      ]);

      setSessions(sessionResponse.items);
      setAvailability(availabilityResponse.items);

      const nextSessionId = sessionResponse.items[0]?.id ?? null;
      setSelectedSessionId((current) =>
        current && sessionResponse.items.some((session) => session.id === current)
          ? current
          : nextSessionId
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error(String(loadError)));
      setSessions([]);
      setAvailability([]);
    }
  }, [apiClient]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      await loadWorkspace();
      setLoading(false);
    })();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!selectedSessionId) {
      setBookings([]);
      return;
    }
    void loadBookings(selectedSessionId);
  }, [loadBookings, selectedSessionId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadWorkspace();
    if (selectedSessionId) {
      await loadBookings(selectedSessionId);
    }
    setRefreshing(false);
  }, [loadBookings, loadWorkspace, selectedSessionId]);

  const updateAttendance = useCallback(
    async (bookingId: string, attendanceStatus: 'checked_in' | 'missed' | 'completed') => {
      setActionError(null);
      try {
        await apiClient.bookings.updateAttendance(bookingId, {
          attendanceStatus,
          checkedInAt: attendanceStatus === 'checked_in' ? new Date().toISOString() : undefined,
        });
        await refresh();
      } catch (updateError) {
        setActionError(updateError instanceof Error ? updateError : new Error(String(updateError)));
      }
    },
    [apiClient, refresh]
  );

  return {
    sessions,
    availability,
    bookings,
    selectedSession,
    selectedSessionId,
    loading,
    bookingLoading,
    error,
    actionError,
    refreshing,
    setSelectedSessionId,
    refresh,
    updateAttendance,
  };
}
