import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@myclup/utils';
import { Card, ScreenContainer } from '@myclup/ui-native';
import { useMembership } from '../membership/useMembership';
import { formatIsoDate } from '../membership/helpers';
import { useConversations } from '../chat/useConversations';
import { AppButton } from '../../components/AppButton';
import { AppIcon } from '../../components/AppIcon';
import { AppSectionHeader } from '../../components/AppSectionHeader';
import { AppStateBlock } from '../../components/AppStateBlock';
import { AppStatusBadge } from '../../components/AppStatusBadge';
import { AppText } from '../../components/AppText';
import { appTheme } from '../../theme/appTheme';
import { buildQuickActions, getConversationTitleKey, getMembershipTone } from './homeDashboard';

export function HomeDashboardScreen() {
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');
  const { t: tMembership } = useTranslation('membership');
  const { t: tChat } = useTranslation('chat');

  const {
    data: membershipData,
    error: membershipError,
    loading: membershipLoading,
    refresh: refreshMembership,
  } = useMembership();
  const {
    items: conversations,
    error: messagesError,
    loading: messagesLoading,
    refresh: refreshMessages,
  } = useConversations();

  const recentConversations = useMemo(
    () =>
      [...conversations]
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .slice(0, 3),
    [conversations]
  );

  const dashboardDate = membershipData.membership?.validUntil
    ? formatIsoDate(
        membershipData.membership.validUntil,
        membershipData.locale,
        tMembership('label.notAvailable')
      )
    : null;

  const quickActions = useMemo(
    () =>
      buildQuickActions().map((action) => {
        const route = action.route;

        return {
          ...action,
          disabled: action.key === 'renewMembership' ? !membershipData.canRenew : action.disabled,
          title: tCommon(action.labelKey),
          hint: tCommon(action.hintKey),
          buttonLabel:
            action.disabled || (action.key === 'renewMembership' && !membershipData.canRenew)
              ? tCommon('quickActions.comingSoon')
              : tCommon(action.labelKey),
          onPress:
            route && (action.key !== 'renewMembership' || membershipData.canRenew)
              ? () => router.push(route)
              : undefined,
        };
      }),
    [membershipData.canRenew, router, tCommon]
  );

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <AppStatusBadge label={tCommon('shell.eyebrow')} tone="primary" />
            <AppText variant="caption" tone="inverse" style={styles.heroKicker}>
              {tCommon('shell.subtitle')}
            </AppText>
          </View>
          <View style={styles.heroBody}>
            <AppText variant="title" tone="inverse" style={styles.heroTitle}>
              {tCommon('dashboard.heroTitle')}
            </AppText>
            <AppText variant="subtitle" tone="inverse" style={styles.heroSubtitle}>
              {tCommon('dashboard.heroSubtitle')}
            </AppText>
          </View>
          <View style={styles.heroActions}>
            <AppButton
              label={tCommon('cta.openMembership')}
              icon="credit-card-outline"
              onPress={() => router.push('/membership')}
              variant="secondary"
            />
            <AppButton
              label={tCommon('cta.openChat')}
              icon="chat-outline"
              onPress={() => router.push('/chat')}
            />
          </View>
        </Card>

        <View style={styles.sectionGap}>
          <AppSectionHeader
            title={tCommon('dashboard.membershipTitle')}
            subtitle={tCommon('dashboard.membershipSubtitle')}
          />
          {membershipLoading ? (
            <AppStateBlock
              loading
              title={tCommon('state.loading')}
              description={tCommon('messagesDashboard.loadingTitle')}
            />
          ) : membershipError ? (
            <AppStateBlock
              icon="alert-circle-outline"
              title={tCommon('membershipDashboard.errorTitle')}
              description={tCommon('membershipDashboard.errorBody')}
              actionLabel={tCommon('cta.retry')}
              onAction={() => void refreshMembership()}
            />
          ) : membershipData.membership ? (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View style={styles.summaryTitleBlock}>
                  <AppText variant="subtitle" style={styles.summaryTitle}>
                    {membershipData.plan?.name ?? tMembership('label.activeMembership')}
                  </AppText>
                  <AppText variant="body" tone="muted">
                    {tCommon('membershipDashboard.active')}
                  </AppText>
                </View>
                <AppStatusBadge
                  label={tMembership(`status.${membershipData.membership.status}`)}
                  tone={getMembershipTone(membershipData.membership.status)}
                />
              </View>

              {dashboardDate ? (
                <DashboardRow
                  label={tCommon('membershipDashboard.renewalDue')}
                  value={dashboardDate}
                />
              ) : null}

              {membershipData.membership.remainingSessions !== null ? (
                <DashboardRow
                  label={tCommon('membershipDashboard.remainingSessions')}
                  value={formatNumber(
                    membershipData.membership.remainingSessions,
                    membershipData.locale
                  )}
                />
              ) : null}

              {membershipData.renewalReason ? (
                <View style={styles.reminderPill}>
                  <AppIcon name="alert-outline" size={18} color={appTheme.colors.warningText} />
                  <AppText variant="body" style={styles.reminderText}>
                    {membershipData.renewalReason === 'expired'
                      ? tMembership('message.expired')
                      : tMembership('message.expiringSoon')}
                  </AppText>
                </View>
              ) : null}

              <AppButton
                label={tCommon('cta.openMembership')}
                icon="credit-card-outline"
                onPress={() => router.push('/membership')}
              />
            </Card>
          ) : (
            <AppStateBlock
              icon="card-account-details-outline"
              title={tCommon('state.noMembership')}
              description={tCommon('membershipDashboard.noActive')}
              actionLabel={tCommon('cta.openMembership')}
              onAction={() => router.push('/membership')}
            />
          )}
        </View>

        <View style={styles.sectionGap}>
          <AppSectionHeader
            title={tCommon('dashboard.messagesTitle')}
            subtitle={tCommon('dashboard.messagesSubtitle')}
          />
          {messagesLoading ? (
            <AppStateBlock
              loading
              title={tCommon('state.loading')}
              description={tCommon('messagesDashboard.loadingTitle')}
            />
          ) : messagesError ? (
            <AppStateBlock
              icon="message-alert-outline"
              title={tCommon('messagesDashboard.errorTitle')}
              description={tCommon('messagesDashboard.errorBody')}
              actionLabel={tCommon('cta.retry')}
              onAction={() => void refreshMessages()}
            />
          ) : recentConversations.length === 0 ? (
            <AppStateBlock
              icon="message-text-outline"
              title={tCommon('messagesDashboard.emptyTitle')}
              description={tCommon('messagesDashboard.emptyBody')}
              actionLabel={tCommon('cta.openChat')}
              onAction={() => router.push('/chat')}
            />
          ) : (
            <Card style={styles.messageListCard}>
              {recentConversations.map((conversation, index) => (
                <ConversationSummaryRow
                  key={conversation.id}
                  conversation={conversation}
                  isLast={index === recentConversations.length - 1}
                  locale={membershipData.locale}
                  onPress={() => router.push('/chat')}
                  tChat={tChat}
                  tCommon={tCommon}
                />
              ))}
            </Card>
          )}
        </View>

        <View style={styles.sectionGap}>
          <AppSectionHeader
            title={tCommon('dashboard.quickActionsTitle')}
            subtitle={tCommon('dashboard.quickActionsSubtitle')}
          />
          <View style={styles.quickGrid}>
            {quickActions.map(({ key, ...action }) => (
              <QuickActionCard key={key} {...action} />
            ))}
          </View>
        </View>

        <View style={styles.sectionGap}>
          <AppSectionHeader
            title={tCommon('dashboard.paymentsTitle')}
            subtitle={tCommon('dashboard.paymentsSubtitle')}
          />
          <Card style={styles.placeholderCard}>
            <View style={styles.placeholderHeader}>
              <AppIcon name="cash-clock" size={20} color={appTheme.colors.primary} />
              <AppText variant="subtitle" style={styles.placeholderTitle}>
                {tCommon('dashboard.paymentsTitle')}
              </AppText>
            </View>
            <AppText variant="body" tone="muted">
              {tCommon('paymentsDashboard.body')}
            </AppText>
          </Card>
        </View>

        <View style={styles.sectionGap}>
          <AppSectionHeader
            title={tCommon('dashboard.notificationsTitle')}
            subtitle={tCommon('dashboard.notificationsSubtitle')}
          />
          <Card style={styles.placeholderCard}>
            <View style={styles.placeholderHeader}>
              <AppIcon name="bell-badge-outline" size={20} color={appTheme.colors.primary} />
              <AppText variant="subtitle" style={styles.placeholderTitle}>
                {tCommon('dashboard.notificationsTitle')}
              </AppText>
            </View>
            <AppText variant="body" tone="muted">
              {tCommon('notificationsDashboard.body')}
            </AppText>
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

type ConversationSummaryRowProps = {
  conversation: {
    id: string;
    type: string;
    unreadCount?: number;
    updatedAt: string;
  };
  isLast: boolean;
  locale: string;
  onPress: () => void;
  tChat: (key: string) => string;
  tCommon: (key: string, params?: Record<string, string | number>) => string;
};

function ConversationSummaryRow({
  conversation,
  isLast,
  locale,
  onPress,
  tChat,
  tCommon,
}: ConversationSummaryRowProps) {
  const updatedAt = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(conversation.updatedAt));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.messageRow,
        isLast ? null : styles.messageRowDivider,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.messageRowHeader}>
        <AppText variant="subtitle" style={styles.messageTitle}>
          {tChat(getConversationTitleKey(conversation.type))}
        </AppText>
        {conversation.unreadCount && conversation.unreadCount > 0 ? (
          <AppStatusBadge
            label={tCommon('messagesDashboard.unreadCount', { count: conversation.unreadCount })}
            tone="primary"
          />
        ) : null}
      </View>
      <AppText variant="body" tone="muted">
        {tCommon('messagesDashboard.updatedAt', { date: updatedAt })}
      </AppText>
    </Pressable>
  );
}

type QuickActionCardProps = {
  icon: string;
  title: string;
  hint: string;
  buttonLabel: string;
  disabled: boolean;
  onPress?: () => void;
};

function QuickActionCard({
  icon,
  title,
  hint,
  buttonLabel,
  disabled,
  onPress,
}: QuickActionCardProps) {
  return (
    <Card style={[styles.quickCard, disabled ? styles.quickCardDisabled : null]}>
      <View style={styles.quickCardIcon}>
        <AppIcon name={icon} size={20} color={appTheme.colors.primary} />
      </View>
      <AppText variant="subtitle" style={styles.quickCardTitle}>
        {title}
      </AppText>
      <AppText variant="body" tone="muted" style={styles.quickCardHint}>
        {hint}
      </AppText>
      <AppButton
        label={buttonLabel}
        onPress={onPress}
        disabled={disabled}
        variant={disabled ? 'ghost' : 'secondary'}
        icon={disabled ? undefined : icon}
      />
    </Card>
  );
}

function DashboardRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dashboardRow}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <AppText variant="value" style={styles.dashboardValue}>
        {value}
      </AppText>
    </View>
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
  heroKicker: {
    opacity: 0.86,
  },
  heroBody: {
    gap: 10,
  },
  heroTitle: {
    maxWidth: 320,
  },
  heroSubtitle: {
    opacity: 0.92,
  },
  heroActions: {
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    flexWrap: 'wrap',
  },
  sectionGap: {
    gap: appTheme.spacing.md,
  },
  summaryCard: {
    gap: appTheme.spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: appTheme.spacing.md,
  },
  summaryTitleBlock: {
    flex: 1,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  dashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: appTheme.spacing.md,
  },
  dashboardValue: {
    textAlign: 'right',
  },
  reminderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.sm,
    borderRadius: appTheme.radii.md,
    backgroundColor: appTheme.colors.warningSoft,
  },
  reminderText: {
    color: appTheme.colors.warningText,
    flex: 1,
  },
  messageListCard: {
    gap: 0,
    paddingVertical: 0,
  },
  messageRow: {
    paddingVertical: appTheme.spacing.md,
    gap: 6,
  },
  messageRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: appTheme.colors.border,
  },
  messageRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: appTheme.spacing.sm,
  },
  messageTitle: {
    flex: 1,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.md,
  },
  quickCard: {
    width: '48%',
    gap: appTheme.spacing.md,
  },
  quickCardDisabled: {
    opacity: 0.8,
  },
  quickCardIcon: {
    width: 40,
    height: 40,
    borderRadius: appTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  quickCardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
  quickCardHint: {
    minHeight: 40,
  },
  placeholderCard: {
    gap: appTheme.spacing.md,
  },
  placeholderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  placeholderTitle: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.9,
  },
});
