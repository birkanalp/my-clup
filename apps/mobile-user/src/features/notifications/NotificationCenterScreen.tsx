import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card, ScreenContainer } from '@myclup/ui-native';
import { useConversations } from '../chat/useConversations';
import { useMembership } from '../membership/useMembership';
import { AppButton } from '../../components/AppButton';
import { AppIcon } from '../../components/AppIcon';
import { AppSectionHeader } from '../../components/AppSectionHeader';
import { AppStateBlock } from '../../components/AppStateBlock';
import { AppStatusBadge } from '../../components/AppStatusBadge';
import { AppText } from '../../components/AppText';
import { appTheme } from '../../theme/appTheme';
import { buildNotificationSignals } from './notificationCenter';

export function NotificationCenterScreen() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const {
    data: membershipData,
    error: membershipError,
    loading: membershipLoading,
    refresh: refreshMembership,
  } = useMembership();
  const {
    items: conversations,
    error: conversationsError,
    loading: conversationsLoading,
    refresh: refreshConversations,
  } = useConversations();

  const notificationSignals = useMemo(
    () =>
      buildNotificationSignals({
        renewalReason: membershipData.renewalReason,
        conversations,
      }),
    [conversations, membershipData.renewalReason]
  );

  const unreadConversationCount = useMemo(
    () => conversations.reduce((total, conversation) => total + (conversation.unreadCount ?? 0), 0),
    [conversations]
  );
  const hasError = Boolean(membershipError || conversationsError);
  const isLoading = membershipLoading || conversationsLoading;

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <AppStatusBadge label={t('dashboard.notificationsTitle')} tone="primary" />
            <AppText variant="caption" tone="inverse" style={styles.heroMeta}>
              {t('shell.subtitle')}
            </AppText>
          </View>
          <View style={styles.heroBody}>
            <AppText variant="title" tone="inverse">
              {t('notifications.heroTitle')}
            </AppText>
            <AppText variant="subtitle" tone="inverse">
              {t('notifications.heroSubtitle')}
            </AppText>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <AppText variant="value" tone="inverse">
                {unreadConversationCount}
              </AppText>
              <AppText variant="caption" tone="inverse">
                {t('notifications.stats.unreadMessages')}
              </AppText>
            </View>
            <View style={styles.heroStat}>
              <AppText variant="value" tone="inverse">
                {membershipData.renewalReason
                  ? t('notifications.stats.actionNeeded')
                  : t('notifications.stats.clear')}
              </AppText>
              <AppText variant="caption" tone="inverse">
                {t('notifications.stats.membership')}
              </AppText>
            </View>
          </View>
        </Card>

        <View style={styles.sectionGap}>
          <AppSectionHeader
            title={t('notifications.centerTitle')}
            subtitle={t('notifications.centerSubtitle')}
          />
          {isLoading ? (
            <AppStateBlock
              loading
              title={t('notifications.loadingTitle')}
              description={t('notifications.loadingBody')}
            />
          ) : hasError ? (
            <AppStateBlock
              icon="alert-circle-outline"
              title={t('notifications.errorTitle')}
              description={t('notifications.errorBody')}
              actionLabel={t('cta.retry')}
              onAction={() => {
                void refreshMembership();
                void refreshConversations();
              }}
            />
          ) : (
            <View style={styles.cardStack}>
              {notificationSignals.map((signal) => (
                <Card key={signal.key} style={styles.signalCard}>
                  <View style={styles.signalHeader}>
                    <View style={styles.signalIconWrap}>
                      <AppIcon name={signal.icon} size={20} color={appTheme.colors.primary} />
                    </View>
                    <View style={styles.signalCopy}>
                      <AppText variant="subtitle" style={styles.signalTitle}>
                        {t(signal.titleKey)}
                      </AppText>
                      <AppText variant="body" tone="muted">
                        {t(signal.bodyKey, { count: unreadConversationCount })}
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.signalFooter}>
                    <AppStatusBadge
                      label={t(`notifications.status.${signal.tone}`)}
                      tone={signal.tone}
                    />
                    {signal.actionRoute && signal.actionLabelKey ? (
                      <AppButton
                        label={t(signal.actionLabelKey)}
                        variant="secondary"
                        onPress={() => {
                          if (signal.actionRoute) {
                            router.push(signal.actionRoute);
                          }
                        }}
                      />
                    ) : null}
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionGap}>
          <AppSectionHeader
            title={t('notifications.quickLinksTitle')}
            subtitle={t('notifications.quickLinksSubtitle')}
          />
          <View style={styles.quickLinks}>
            <AppButton
              label={t('cta.openMembership')}
              icon="credit-card-outline"
              variant="secondary"
              onPress={() => router.push('/membership')}
            />
            <AppButton
              label={t('cta.openChat')}
              icon="chat-outline"
              variant="secondary"
              onPress={() => router.push('/chat')}
            />
            <AppButton
              label={t('cta.openProfile')}
              icon="account-circle-outline"
              variant="secondary"
              onPress={() => router.push('/profile')}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    padding: 0,
  },
  content: {
    paddingHorizontal: appTheme.spacing.xl,
    paddingTop: appTheme.spacing.md,
    paddingBottom: 36,
    gap: appTheme.spacing.xl,
  },
  heroCard: {
    backgroundColor: appTheme.colors.primary,
    borderColor: 'rgba(255,255,255,0.16)',
    gap: appTheme.spacing.lg,
  },
  heroTopRow: {
    gap: 8,
  },
  heroMeta: {
    opacity: 0.88,
  },
  heroBody: {
    gap: 10,
  },
  heroStats: {
    flexDirection: 'row',
    gap: appTheme.spacing.md,
    flexWrap: 'wrap',
  },
  heroStat: {
    minWidth: 132,
    gap: 4,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
    borderRadius: appTheme.radii.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  sectionGap: {
    gap: appTheme.spacing.md,
  },
  cardStack: {
    gap: appTheme.spacing.md,
  },
  signalCard: {
    gap: appTheme.spacing.md,
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: appTheme.spacing.md,
  },
  signalIconWrap: {
    width: 42,
    height: 42,
    borderRadius: appTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  signalCopy: {
    flex: 1,
    gap: 4,
  },
  signalTitle: {
    fontWeight: '800',
  },
  signalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: appTheme.spacing.md,
    flexWrap: 'wrap',
  },
  quickLinks: {
    gap: appTheme.spacing.sm,
  },
});
