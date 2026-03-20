import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDate, formatTime } from '@myclup/utils';
import { Card, ScreenContainer } from '@myclup/ui-native';
import type { BookingSession } from '@myclup/contracts/bookings';
import { useBookingSessions } from '../../src/features/booking/useBookingSessions';
import { AppStateBlock } from '../../src/components/AppStateBlock';
import { AppText } from '../../src/components/AppText';
import { appTheme } from '../../src/theme/appTheme';

export default function BookingScheduleScreen() {
  const { t } = useTranslation('common');
  const { sessions, loading, error, refresh, locale } = useBookingSessions();

  const renderItem = ({ item }: { item: BookingSession }) => (
    <Card style={styles.sessionCard}>
      <AppText variant="subtitle" style={styles.sessionTitle}>
        {item.title}
      </AppText>
      <AppText variant="caption" tone="muted">
        {formatDate(new Date(item.startsAt), locale)} ·{' '}
        {formatTime(new Date(item.startsAt), locale)} — {formatTime(new Date(item.endsAt), locale)}
      </AppText>
      {item.locationLabel ? (
        <AppText variant="caption" tone="muted" style={styles.meta}>
          {item.locationLabel}
        </AppText>
      ) : null}
    </Card>
  );

  return (
    <ScreenContainer style={styles.screen}>
      <View style={styles.header}>
        <AppText variant="title">{t('memberBooking.title')}</AppText>
        <AppText variant="subtitle" tone="muted" style={styles.subtitle}>
          {t('memberBooking.subtitle')}
        </AppText>
      </View>
      {loading && sessions.length === 0 ? (
        <AppStateBlock
          loading
          title={t('memberBooking.loadingTitle')}
          description={t('memberBooking.loadingBody')}
        />
      ) : null}
      {error && !loading ? (
        <AppStateBlock
          title={t('memberBooking.errorTitle')}
          description={t('memberBooking.errorBody')}
        />
      ) : null}
      {!loading && !error && sessions.length === 0 ? (
        <AppStateBlock
          title={t('memberBooking.emptyTitle')}
          description={t('memberBooking.emptyBody')}
        />
      ) : null}
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.sm,
    gap: 4,
  },
  subtitle: {
    marginTop: 4,
  },
  list: {
    padding: appTheme.spacing.md,
    gap: 12,
  },
  sessionCard: {
    marginBottom: 8,
  },
  sessionTitle: {
    marginBottom: 4,
  },
  meta: {
    marginTop: 4,
  },
});
