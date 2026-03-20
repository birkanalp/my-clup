'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { BookingRecord, BookingSession, InstructorAvailability } from '@myclup/api-client';
import { getApi } from '@/src/lib/api';

type ApiShape = ReturnType<typeof getApi>;

type Props = {
  api?: ApiShape;
};

function getStatusTone(status: string) {
  if (status === 'checked_in' || status === 'attended' || status === 'completed') {
    return { background: '#dcfce7', color: '#166534' };
  }
  if (status === 'waitlisted' || status === 'pending') {
    return { background: '#fef3c7', color: '#92400e' };
  }
  if (status === 'cancelled' || status === 'missed' || status === 'no_show') {
    return { background: '#fee2e2', color: '#991b1b' };
  }
  return { background: '#e2e8f0', color: '#334155' };
}

export function ScheduleWorkspace({ api = getApi() }: Props) {
  const t = useTranslations('common');
  const locale = useLocale();
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [availability, setAvailability] = useState<InstructorAvailability[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, sessions]
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    [locale]
  );

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale]
  );

  const fullDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale]
  );

  const loadBookings = useCallback(
    async (sessionId: string) => {
      setBookingLoading(true);
      setBookings([]);
      setActionError(null);
      try {
        const response = await api.bookings.listBookings({ limit: 50, sessionId });
        setBookings(response.items);
      } catch (loadError) {
        setBookings([]);
        setActionError(
          loadError instanceof Error ? loadError.message : t('scheduleWorkspace.errorBody')
        );
      } finally {
        setBookingLoading(false);
      }
    },
    [api, t]
  );

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessionResponse, availabilityResponse] = await Promise.all([
        api.bookings.listSessions({ limit: 24 }),
        api.bookings.listInstructorAvailability({ limit: 12 }),
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
      setError(loadError instanceof Error ? loadError.message : t('scheduleWorkspace.errorBody'));
    } finally {
      setLoading(false);
    }
  }, [api, t]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!selectedSessionId) {
      setBookings([]);
      return;
    }
    void loadBookings(selectedSessionId);
  }, [loadBookings, selectedSessionId]);

  const groupedSessions = useMemo(() => {
    return sessions.reduce<Array<{ label: string; items: BookingSession[] }>>((groups, session) => {
      const label = dateFormatter.format(new Date(session.startsAt));
      const currentGroup = groups.find((group) => group.label === label);
      if (currentGroup) {
        currentGroup.items.push(session);
        return groups;
      }
      return [...groups, { label, items: [session] }];
    }, []);
  }, [dateFormatter, sessions]);

  const refreshSelected = useCallback(async () => {
    await loadWorkspace();
    if (selectedSessionId) {
      await loadBookings(selectedSessionId);
    }
  }, [loadBookings, loadWorkspace, selectedSessionId]);

  const handleAttendance = useCallback(
    (bookingId: string, attendanceStatus: 'checked_in' | 'missed' | 'completed') => {
      setActionError(null);
      startTransition(() => {
        void api.bookings
          .updateAttendance(bookingId, {
            attendanceStatus,
            checkedInAt: attendanceStatus === 'checked_in' ? new Date().toISOString() : undefined,
          })
          .then(refreshSelected)
          .catch((updateError: unknown) => {
            setActionError(
              updateError instanceof Error ? updateError.message : t('scheduleWorkspace.errorBody')
            );
          });
      });
    },
    [api, refreshSelected, t]
  );

  const handleCancellation = useCallback(
    (bookingId: string) => {
      setActionError(null);
      startTransition(() => {
        void api.bookings
          .cancelBooking(bookingId, { reason: 'operator_cancelled' })
          .then(refreshSelected)
          .catch((cancelError: unknown) => {
            setActionError(
              cancelError instanceof Error ? cancelError.message : t('scheduleWorkspace.errorBody')
            );
          });
      });
    },
    [api, refreshSelected, t]
  );

  if (loading) {
    return <div role="status">{t('scheduleWorkspace.loadingBody')}</div>;
  }

  if (error) {
    return (
      <section
        style={{
          padding: '1.25rem',
          borderRadius: 20,
          background: '#fff1f2',
          border: '1px solid #fecdd3',
        }}
      >
        <h1 style={{ margin: 0 }}>{t('scheduleWorkspace.errorTitle')}</h1>
        <p style={{ marginBottom: 0, color: '#475569' }}>{error}</p>
      </section>
    );
  }

  if (sessions.length === 0) {
    return (
      <section
        style={{
          padding: '1.5rem',
          borderRadius: 24,
          border: '1px solid #dbe4ee',
          background: '#ffffff',
        }}
      >
        <h1 style={{ margin: 0 }}>{t('scheduleWorkspace.emptyTitle')}</h1>
        <p style={{ marginBottom: 0, color: '#475569' }}>{t('scheduleWorkspace.emptyBody')}</p>
      </section>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <section
        style={{
          padding: '1.5rem',
          borderRadius: 24,
          background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
          color: '#f8fafc',
        }}
      >
        <div style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {t('adminShell.eyebrow')}
        </div>
        <h1 style={{ margin: '0.65rem 0 0.35rem', fontSize: '2rem' }}>
          {t('scheduleWorkspace.heroTitle')}
        </h1>
        <p style={{ margin: 0, maxWidth: 760, color: '#dbeafe' }}>
          {t('scheduleWorkspace.heroSubtitle')}
        </p>
      </section>

      {actionError && (
        <div
          style={{
            padding: '0.9rem 1rem',
            borderRadius: 16,
            border: '1px solid #fecdd3',
            background: '#fff1f2',
            color: '#9f1239',
          }}
        >
          {actionError}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        <section
          style={{
            border: '1px solid #dbe4ee',
            borderRadius: 24,
            background: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '1.15rem 1.15rem 0.9rem', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0 }}>{t('scheduleWorkspace.sessionsTitle')}</h2>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>
              {t('scheduleWorkspace.sessionsSubtitle')}
            </p>
          </div>

          <div style={{ padding: '0.9rem', display: 'grid', gap: '0.9rem' }}>
            {groupedSessions.map((group) => (
              <div key={group.label} style={{ display: 'grid', gap: '0.6rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                  {group.label}
                </div>
                {group.items.map((session) => {
                  const active = session.id === selectedSessionId;
                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => setSelectedSessionId(session.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        border: active ? '1px solid #2563eb' : '1px solid #e2e8f0',
                        borderRadius: 18,
                        background: active ? '#eff6ff' : '#f8fafc',
                        padding: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{session.title}</div>
                          <div
                            style={{ marginTop: '0.25rem', color: '#475569', fontSize: '0.92rem' }}
                          >
                            {timeFormatter.format(new Date(session.startsAt))} -{' '}
                            {timeFormatter.format(new Date(session.endsAt))}
                          </div>
                        </div>
                        <div
                          style={{
                            alignSelf: 'start',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 999,
                            fontSize: '0.75rem',
                            ...getStatusTone(session.status),
                          }}
                        >
                          {t(`scheduleWorkspace.sessionStatus.${session.status}`)}
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: '0.7rem',
                          display: 'flex',
                          gap: '0.6rem',
                          flexWrap: 'wrap',
                          color: '#475569',
                          fontSize: '0.88rem',
                        }}
                      >
                        <span>
                          {t('scheduleWorkspace.capacityPill', {
                            booked: session.bookedCount,
                            capacity: session.capacity,
                          })}
                        </span>
                        <span>
                          {t('scheduleWorkspace.waitlistPill', { count: session.waitlistCount })}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            border: '1px solid #dbe4ee',
            borderRadius: 24,
            background: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {selectedSession ? (
            <>
              <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0 }}>{selectedSession.title}</h2>
                    <p style={{ margin: '0.35rem 0 0', color: '#475569' }}>
                      {fullDateFormatter.format(new Date(selectedSession.startsAt))}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '0.4rem 0.7rem',
                      borderRadius: 999,
                      fontSize: '0.78rem',
                      height: 'fit-content',
                      ...getStatusTone(selectedSession.status),
                    }}
                  >
                    {t(`scheduleWorkspace.sessionStatus.${selectedSession.status}`)}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '0.75rem',
                  }}
                >
                  {[
                    {
                      label: t('scheduleWorkspace.stats.booked'),
                      value: String(selectedSession.bookedCount),
                    },
                    {
                      label: t('scheduleWorkspace.stats.available'),
                      value: String(selectedSession.availableSpots),
                    },
                    {
                      label: t('scheduleWorkspace.stats.waitlist'),
                      value: String(selectedSession.waitlistCount),
                    },
                    {
                      label: t('scheduleWorkspace.stats.instructor'),
                      value:
                        selectedSession.instructor?.displayName ??
                        t('scheduleWorkspace.unassigned'),
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: '0.9rem',
                        borderRadius: 18,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{stat.label}</div>
                      <div style={{ marginTop: '0.3rem', fontSize: '1.15rem', fontWeight: 700 }}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ marginTop: 0 }}>{t('scheduleWorkspace.participantsTitle')}</h3>
                <p style={{ marginTop: '-0.2rem', color: '#64748b' }}>
                  {t('scheduleWorkspace.participantsSubtitle')}
                </p>

                {bookingLoading ? (
                  <div role="status">{t('scheduleWorkspace.loadingBookings')}</div>
                ) : bookings.length === 0 ? (
                  <div style={{ padding: '1rem 0', color: '#64748b' }}>
                    {t('scheduleWorkspace.noParticipants')}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {bookings.map((booking) => {
                      const participantStatus =
                        booking.attendanceStatus !== 'pending'
                          ? booking.attendanceStatus
                          : booking.status;

                      return (
                        <article
                          key={booking.id}
                          style={{
                            padding: '0.95rem',
                            borderRadius: 18,
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '1rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700 }}>{booking.memberId}</div>
                              <div
                                style={{
                                  marginTop: '0.3rem',
                                  color: '#64748b',
                                  fontSize: '0.88rem',
                                }}
                              >
                                {t('scheduleWorkspace.bookingStatusLabel')}:{' '}
                                <span
                                  style={{
                                    padding: '0.18rem 0.45rem',
                                    borderRadius: 999,
                                    ...getStatusTone(participantStatus),
                                  }}
                                >
                                  {t(`scheduleWorkspace.bookingStatus.${participantStatus}`)}
                                </span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleAttendance(booking.id, 'checked_in')}
                                style={{
                                  padding: '0.55rem 0.8rem',
                                  borderRadius: 999,
                                  border: '1px solid #bfdbfe',
                                  background: '#eff6ff',
                                  cursor: 'pointer',
                                }}
                              >
                                {t('scheduleWorkspace.actions.checkIn')}
                              </button>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleAttendance(booking.id, 'missed')}
                                style={{
                                  padding: '0.55rem 0.8rem',
                                  borderRadius: 999,
                                  border: '1px solid #fde68a',
                                  background: '#fef3c7',
                                  cursor: 'pointer',
                                }}
                              >
                                {t('scheduleWorkspace.actions.markMissed')}
                              </button>
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleCancellation(booking.id)}
                                style={{
                                  padding: '0.55rem 0.8rem',
                                  borderRadius: 999,
                                  border: '1px solid #fecdd3',
                                  background: '#fff1f2',
                                  cursor: 'pointer',
                                }}
                              >
                                {t('scheduleWorkspace.actions.cancelBooking')}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </section>

        <section
          style={{
            border: '1px solid #dbe4ee',
            borderRadius: 24,
            background: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '1.15rem 1.15rem 0.9rem', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ margin: 0 }}>{t('scheduleWorkspace.availabilityTitle')}</h2>
            <p style={{ margin: '0.35rem 0 0', color: '#64748b' }}>
              {t('scheduleWorkspace.availabilitySubtitle')}
            </p>
          </div>

          <div style={{ padding: '0.9rem', display: 'grid', gap: '0.75rem' }}>
            {availability.length === 0 ? (
              <div style={{ color: '#64748b' }}>{t('scheduleWorkspace.noAvailability')}</div>
            ) : (
              availability.map((slot) => (
                <article
                  key={slot.id}
                  style={{
                    padding: '0.9rem',
                    borderRadius: 18,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{slot.instructorUserId}</div>
                      <div style={{ marginTop: '0.25rem', color: '#475569', fontSize: '0.88rem' }}>
                        {fullDateFormatter.format(new Date(slot.startsAt))}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: 999,
                        fontSize: '0.76rem',
                        ...getStatusTone(slot.status),
                      }}
                    >
                      {t(`scheduleWorkspace.availabilityStatus.${slot.status}`)}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
