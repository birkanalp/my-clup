import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  ScreenContainer,
  SectionHeader,
  StateBlock,
  StatusBadge,
} from '@myclup/ui-native';
import { api } from '../../lib/api';
import { useScheduleWorkspace } from './useScheduleWorkspace';

type ScheduleApi = Pick<typeof api, 'bookings'>;

type Props = {
  apiClient?: ScheduleApi;
};

function getTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'checked_in' || status === 'attended' || status === 'completed') {
    return 'success';
  }
  if (status === 'waitlisted' || status === 'pending') {
    return 'warning';
  }
  if (status === 'cancelled' || status === 'missed' || status === 'no_show') {
    return 'danger';
  }
  return 'neutral';
}

export function ScheduleWorkspaceScreen({ apiClient = api }: Props) {
  const { t, i18n } = useTranslation('common');
  const {
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
  } = useScheduleWorkspace(apiClient);

  const locale = i18n.resolvedLanguage ?? i18n.language ?? 'en';
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

  if (loading) {
    return (
      <ScreenContainer>
        <StateBlock
          kind="loading"
          title={t('scheduleWorkspace.loadingBody')}
          testID="schedule-loading"
        />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <StateBlock
          kind="error"
          title={t('scheduleWorkspace.errorTitle')}
          description={error.message}
          actionLabel={t('cta.retry')}
          onAction={() => void refresh()}
          testID="schedule-error"
        />
      </ScreenContainer>
    );
  }

  if (sessions.length === 0) {
    return (
      <ScreenContainer>
        <StateBlock
          kind="empty"
          title={t('scheduleWorkspace.emptyTitle')}
          description={t('scheduleWorkspace.emptyBody')}
          actionLabel={t('cta.retry')}
          onAction={() => void refresh()}
          testID="schedule-empty"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="schedule-screen">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} />}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.heroCard}>
          <Text style={styles.eyebrow}>{t('adminShell.eyebrow')}</Text>
          <Text style={styles.heroTitle}>{t('scheduleWorkspace.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('scheduleWorkspace.heroSubtitle')}</Text>
        </Card>

        {actionError ? (
          <Card style={styles.alertCard}>
            <Text style={styles.alertText}>{actionError.message}</Text>
          </Card>
        ) : null}

        <Card>
          <SectionHeader
            title={t('scheduleWorkspace.sessionsTitle')}
            subtitle={t('scheduleWorkspace.sessionsSubtitle')}
          />

          <View style={styles.sessionList}>
            {sessions.map((session) => {
              const active = session.id === selectedSessionId;
              return (
                <Pressable
                  key={session.id}
                  accessibilityRole="button"
                  onPress={() => setSelectedSessionId(session.id)}
                  style={[styles.sessionCard, active && styles.sessionCardActive]}
                >
                  <View style={styles.sessionRow}>
                    <View style={styles.sessionTextWrap}>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.sessionMeta}>
                        {dateFormatter.format(new Date(session.startsAt))} ·{' '}
                        {timeFormatter.format(new Date(session.startsAt))}
                      </Text>
                    </View>
                    <StatusBadge
                      label={t(`scheduleWorkspace.sessionStatus.${session.status}`)}
                      tone={getTone(session.status)}
                    />
                  </View>
                  <View style={styles.pillRow}>
                    <Text style={styles.pillText}>
                      {t('scheduleWorkspace.capacityPill', {
                        booked: session.bookedCount,
                        capacity: session.capacity,
                      })}
                    </Text>
                    <Text style={styles.pillText}>
                      {t('scheduleWorkspace.waitlistPill', {
                        count: session.waitlistCount,
                      })}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Card>

        {selectedSession ? (
          <Card>
            <SectionHeader
              title={selectedSession.title}
              subtitle={fullDateFormatter.format(new Date(selectedSession.startsAt))}
            />

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>{t('scheduleWorkspace.stats.booked')}</Text>
                <Text style={styles.statValue}>{selectedSession.bookedCount}</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>{t('scheduleWorkspace.stats.available')}</Text>
                <Text style={styles.statValue}>{selectedSession.availableSpots}</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>{t('scheduleWorkspace.stats.waitlist')}</Text>
                <Text style={styles.statValue}>{selectedSession.waitlistCount}</Text>
              </View>
            </View>

            <View style={styles.subsection}>
              <SectionHeader
                title={t('scheduleWorkspace.participantsTitle')}
                subtitle={t('scheduleWorkspace.participantsSubtitle')}
              />

              {bookingLoading ? (
                <StateBlock
                  kind="loading"
                  title={t('scheduleWorkspace.loadingBookings')}
                  testID="schedule-bookings-loading"
                />
              ) : bookings.length === 0 ? (
                <StateBlock
                  kind="empty"
                  title={t('scheduleWorkspace.noParticipants')}
                  testID="schedule-bookings-empty"
                />
              ) : (
                <View style={styles.bookingList}>
                  {bookings.map((booking) => {
                    const participantStatus =
                      booking.attendanceStatus !== 'pending'
                        ? booking.attendanceStatus
                        : booking.status;

                    return (
                      <View key={booking.id} style={styles.bookingCard}>
                        <View style={styles.bookingHeader}>
                          <View style={styles.sessionTextWrap}>
                            <Text style={styles.bookingMember}>{booking.memberId}</Text>
                            <Text style={styles.bookingCaption}>
                              {t('scheduleWorkspace.bookingStatusLabel')}
                            </Text>
                          </View>
                          <StatusBadge
                            label={t(`scheduleWorkspace.bookingStatus.${participantStatus}`)}
                            tone={getTone(participantStatus)}
                          />
                        </View>
                        <View style={styles.actionRow}>
                          <Button
                            accessibilityLabel={t('scheduleWorkspace.actions.checkIn')}
                            onPress={() => void updateAttendance(booking.id, 'checked_in')}
                          >
                            {t('scheduleWorkspace.actions.checkIn')}
                          </Button>
                          <Button
                            accessibilityLabel={t('scheduleWorkspace.actions.markMissed')}
                            onPress={() => void updateAttendance(booking.id, 'missed')}
                            variant="secondary"
                          >
                            {t('scheduleWorkspace.actions.markMissed')}
                          </Button>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </Card>
        ) : null}

        <Card>
          <SectionHeader
            title={t('scheduleWorkspace.availabilityTitle')}
            subtitle={t('scheduleWorkspace.availabilitySubtitle')}
          />

          {availability.length === 0 ? (
            <StateBlock
              kind="empty"
              title={t('scheduleWorkspace.noAvailability')}
              testID="schedule-availability-empty"
            />
          ) : (
            <View style={styles.availabilityList}>
              {availability.map((slot) => (
                <View key={slot.id} style={styles.availabilityRow}>
                  <View style={styles.sessionTextWrap}>
                    <Text style={styles.sessionTitle}>
                      {slot.instructorUserId || t('scheduleWorkspace.unassigned')}
                    </Text>
                    <Text style={styles.sessionMeta}>
                      {dateFormatter.format(new Date(slot.startsAt))} ·{' '}
                      {timeFormatter.format(new Date(slot.startsAt))}
                    </Text>
                  </View>
                  <StatusBadge
                    label={t(`scheduleWorkspace.availabilityStatus.${slot.status}`)}
                    tone={getTone(slot.status)}
                  />
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#0f172a',
  },
  eyebrow: {
    color: '#5eead4',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 12,
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 8,
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  alertCard: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  alertText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
  },
  sessionList: {
    marginTop: 16,
    gap: 12,
  },
  sessionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
    gap: 12,
  },
  sessionCardActive: {
    borderColor: '#0f766e',
    backgroundColor: '#f0fdfa',
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sessionTextWrap: {
    flex: 1,
    gap: 4,
  },
  sessionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  sessionMeta: {
    color: '#475569',
    fontSize: 13,
    lineHeight: 18,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pillText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBlock: {
    minWidth: 96,
    flexGrow: 1,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 4,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
  },
  subsection: {
    marginTop: 18,
    gap: 14,
  },
  bookingList: {
    gap: 12,
  },
  bookingCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
    gap: 14,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  bookingMember: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  bookingCaption: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  availabilityList: {
    marginTop: 16,
    gap: 12,
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 14,
  },
});
