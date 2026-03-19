import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MembershipCard } from './MembershipCard';
import { useMembership } from './useMembership';

export function MembershipOverviewScreen() {
  const router = useRouter();
  const { t } = useTranslation('membership');
  const { data, error, loading, refresh } = useMembership();

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.stateText}>{t('state.loadingMembership')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateText}>{t('state.errorMembership')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void refresh()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>{t('cta.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('header.title')}</Text>
        <Text style={styles.heroSubtitle}>{t('header.subtitle')}</Text>
      </View>

      {data.membership ? (
        <>
          <MembershipCard data={data} />
          {data.renewalReason ? (
            <View style={styles.noticeBanner}>
              <Text style={styles.noticeText}>
                {data.renewalReason === 'expired'
                  ? t('message.expired')
                  : t('message.expiringSoon')}
              </Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            {data.canRenew ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/membership/renew')}
                style={[styles.actionButton, styles.primaryButton]}
              >
                <Text style={styles.primaryButtonText}>{t('cta.renewNow')}</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/membership/payments')}
              style={[styles.actionButton, styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>{t('cta.viewPayments')}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t('message.noMembership')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    gap: 18,
  },
  hero: {
    gap: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0f172a',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  stateText: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: 999,
    backgroundColor: '#0f766e',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0f766e',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#dbeafe',
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  noticeBanner: {
    borderRadius: 16,
    backgroundColor: '#fff7ed',
    padding: 14,
  },
  noticeText: {
    color: '#9a3412',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
});
