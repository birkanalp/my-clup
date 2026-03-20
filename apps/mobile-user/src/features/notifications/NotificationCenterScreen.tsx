import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card, ScreenContainer } from '@myclup/ui-native';
import { AppButton } from '../../components/AppButton';
import { AppIcon } from '../../components/AppIcon';
import { AppSectionHeader } from '../../components/AppSectionHeader';
import { AppStateBlock } from '../../components/AppStateBlock';
import { AppStatusBadge } from '../../components/AppStatusBadge';
import { AppText } from '../../components/AppText';
import { appTheme } from '../../theme/appTheme';
import { useConversations } from '../chat/useConversations';
import { useMembership } from '../membership/useMembership';
import {
  buildNotificationCenterDigest,
  type NotificationCard,
  type NotificationCardKey,
} from './notificationCenter';

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

  const digest = useMemo(
    () => buildNotificationCenterDigest({ membershipData, conversations }),
    [conversations, membershipData]
  );

  const loading = membershipLoading || conversationsLoading;
  const error = membershipError ?? conversationsError;

  if (loading) {
    return (
      <ScreenContainer style={styles.screen}>
        <AppStateBlock
          loading
          title={t('notificationsCenter.loadingTitle')}
          description={t('notificationsCenter.loadingBody')}
        />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer style={styles.screen}>
        <AppStateBlock
          icon="bell-alert-outline"
          title={t('notificationsCenter.errorTitle')}
          description={t('notificationsCenter.errorBody')}
          actionLabel={t('cta.retry')}
          onAction={() => {
            void refreshMembership();
            void refreshConversations();
          }}
        />
      </ScreenContainer>
    );
  }

  const liveCards = digest.cards.filter((card) => card.key === 'membership' || card.key === 'chat');
  const plannedCards = digest.cards.filter((card) => card.key === 'booking' || card.key === 'app');

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <AppStatusBadge
              label={t('notificationsCenter.heroBadge', { count: digest.actionableCount })}
              tone={digest.actionableCount > 0 ? 'warning' : 'primary'}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('notificationsCenter.backHome')}
              onPress={() => router.push('/')}
              style={({ pressed }) => [styles.backButton, pressed ? styles.pressed : null]}
            >
              <AppIcon name="arrow-left" size={16} color={appTheme.colors.primary} />
              <AppText variant="label" tone="primary">
                {t('notificationsCenter.backHome')}
              </AppText>
            </Pressable>
          </View>

          <View style={styles.heroBody}>
            <AppText variant="title" style={styles.heroTitle}>
              {t('notificationsCenter.title')}
            </AppText>
            <AppText variant="body" tone="muted">
              {t('notificationsCenter.subtitle')}
            </AppText>
          </View>
        </Card>

        <View style={styles.section}>
          <AppSectionHeader
            title={t('notificationsCenter.liveTitle')}
            subtitle={t('notificationsCenter.liveSubtitle')}
          />
          <View style={styles.cardGrid}>
            {liveCards.map((card) => (
              <NotificationCardView
                key={card.key}
                card={card}
                locale={membershipData.locale}
                onRoute={(route) => {
                  if (route) {
                    router.push(route);
                  }
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <AppSectionHeader
            title={t('notificationsCenter.plannedTitle')}
            subtitle={t('notificationsCenter.plannedSubtitle')}
          />
          <View style={styles.cardGrid}>
            {plannedCards.map((card) => (
              <NotificationCardView
                key={card.key}
                card={card}
                locale={membershipData.locale}
                onRoute={(route) => {
                  if (route) {
                    router.push(route);
                  }
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function NotificationCardView({
  card,
  locale,
  onRoute,
}: {
  card: NotificationCard;
  locale: string;
  onRoute: (route: '/membership' | '/membership/renew' | '/chat' | null) => void;
}) {
  const { t } = useTranslation('common');
  const config = getNotificationCardConfig(card.key);
  const meta = buildMeta(card, locale, t);
  const tone = card.state === 'action' ? 'warning' : card.state === 'info' ? 'primary' : 'neutral';

  return (
    <Card style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={styles.iconBubble}>
          <AppIcon name={config.icon} size={18} color={appTheme.colors.primary} />
        </View>
        <AppStatusBadge label={t(config.statusKey(card))} tone={tone} />
      </View>

      <View style={styles.notificationBody}>
        <AppText variant="subtitle" style={styles.notificationTitle}>
          {t(config.titleKey)}
        </AppText>
        <AppText variant="body" tone="muted">
          {t(config.bodyKey(card), {
            count: card.unreadCount ?? 0,
          })}
        </AppText>
        {meta ? (
          <AppText variant="caption" tone="soft">
            {meta}
          </AppText>
        ) : null}
      </View>

      {card.route ? (
        <AppButton
          label={t(config.actionKey(card))}
          icon={config.actionIcon}
          onPress={() => onRoute(card.route)}
          variant={card.state === 'action' ? 'primary' : 'secondary'}
        />
      ) : null}
    </Card>
  );
}

function buildMeta(
  card: NotificationCard,
  locale: string,
  t: (key: string, params?: Record<string, string | number>) => string
) {
  if (card.key === 'membership' && card.renewalReason && card.route === '/membership/renew') {
    return t(`notificationsCenter.cards.membership.meta.${card.renewalReason}`);
  }

  if (card.key === 'chat' && card.updatedAt) {
    const formatted = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(card.updatedAt));

    return t('notificationsCenter.cards.chat.meta.updatedAt', { date: formatted });
  }

  return null;
}

function getNotificationCardConfig(key: NotificationCardKey) {
  switch (key) {
    case 'membership':
      return {
        icon: 'credit-card-refresh-outline',
        titleKey: 'notificationsCenter.cards.membership.title',
        statusKey: (card: NotificationCard) =>
          `notificationsCenter.cards.membership.status.${card.state}`,
        bodyKey: (card: NotificationCard) => {
          if (card.renewalReason === 'expired') {
            return 'notificationsCenter.cards.membership.body.expired';
          }

          if (card.renewalReason === 'expiring_soon') {
            return 'notificationsCenter.cards.membership.body.expiringSoon';
          }

          if (card.state === 'placeholder') {
            return 'notificationsCenter.cards.membership.body.placeholder';
          }

          return 'notificationsCenter.cards.membership.body.stable';
        },
        actionKey: (card: NotificationCard) =>
          card.route === '/membership/renew'
            ? 'notificationsCenter.cards.membership.action.renew'
            : 'notificationsCenter.cards.membership.action.open',
        actionIcon: 'credit-card-outline',
      };
    case 'chat':
      return {
        icon: 'message-badge-outline',
        titleKey: 'notificationsCenter.cards.chat.title',
        statusKey: (card: NotificationCard) =>
          `notificationsCenter.cards.chat.status.${card.state}`,
        bodyKey: (card: NotificationCard) =>
          card.state === 'action'
            ? 'notificationsCenter.cards.chat.body.unread'
            : card.state === 'info'
              ? 'notificationsCenter.cards.chat.body.stable'
              : 'notificationsCenter.cards.chat.body.placeholder',
        actionKey: () => 'notificationsCenter.cards.chat.action.open',
        actionIcon: 'chat-outline',
      };
    case 'booking':
      return {
        icon: 'calendar-clock-outline',
        titleKey: 'notificationsCenter.cards.booking.title',
        statusKey: () => 'notificationsCenter.cards.booking.status.placeholder',
        bodyKey: () => 'notificationsCenter.cards.booking.body.placeholder',
        actionKey: () => 'notificationsCenter.cards.booking.action.disabled',
        actionIcon: 'calendar-plus-outline',
      };
    case 'app':
      return {
        icon: 'bell-ring-outline',
        titleKey: 'notificationsCenter.cards.app.title',
        statusKey: () => 'notificationsCenter.cards.app.status.placeholder',
        bodyKey: () => 'notificationsCenter.cards.app.body.placeholder',
        actionKey: () => 'notificationsCenter.cards.app.action.disabled',
        actionIcon: 'bell-outline',
      };
  }
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
    gap: appTheme.spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: appTheme.spacing.md,
  },
  heroBody: {
    gap: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
    borderRadius: appTheme.radii.pill,
    backgroundColor: appTheme.colors.primarySoft,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  section: {
    gap: appTheme.spacing.md,
  },
  cardGrid: {
    gap: appTheme.spacing.md,
  },
  notificationCard: {
    gap: appTheme.spacing.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: appTheme.spacing.md,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: appTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.primarySoft,
  },
  notificationBody: {
    gap: 8,
  },
  notificationTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.9,
  },
});
