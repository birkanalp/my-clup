import type { ConversationWithUnread } from '../chat/useConversations';
import type { RenewalReason } from '../membership/types';

export type NotificationSignalTone = 'primary' | 'success' | 'warning' | 'neutral';

export type NotificationSignal = {
  key: 'membership' | 'chat' | 'booking' | 'updates';
  icon: string;
  titleKey: string;
  bodyKey: string;
  tone: NotificationSignalTone;
  actionRoute?: '/membership' | '/membership/renew' | '/chat';
  actionLabelKey?: string;
};

type BuildNotificationSignalsInput = {
  renewalReason: RenewalReason;
  conversations: ConversationWithUnread[];
};

export function buildNotificationSignals({
  renewalReason,
  conversations,
}: BuildNotificationSignalsInput): NotificationSignal[] {
  const unreadThreads = conversations.filter((conversation) => (conversation.unreadCount ?? 0) > 0);
  const unreadCount = unreadThreads.reduce(
    (total, conversation) => total + (conversation.unreadCount ?? 0),
    0
  );
  const signals: NotificationSignal[] = [];

  if (renewalReason) {
    signals.push({
      key: 'membership',
      icon: renewalReason === 'expired' ? 'alert-circle-outline' : 'clock-alert-outline',
      titleKey:
        renewalReason === 'expired'
          ? 'notifications.membershipExpiredTitle'
          : 'notifications.membershipExpiringTitle',
      bodyKey:
        renewalReason === 'expired'
          ? 'notifications.membershipExpiredBody'
          : 'notifications.membershipExpiringBody',
      tone: 'warning',
      actionRoute: '/membership/renew',
      actionLabelKey: 'cta.renewNow',
    });
  }

  if (unreadCount > 0) {
    signals.push({
      key: 'chat',
      icon: 'chat-processing-outline',
      titleKey: 'notifications.chatUnreadTitle',
      bodyKey:
        unreadThreads.length > 1
          ? 'notifications.chatUnreadBodyMany'
          : 'notifications.chatUnreadBodySingle',
      tone: 'primary',
      actionRoute: '/chat',
      actionLabelKey: 'cta.openChat',
    });
  }

  if (signals.length === 0) {
    signals.push({
      key: 'updates',
      icon: 'bell-check-outline',
      titleKey: 'notifications.caughtUpTitle',
      bodyKey: 'notifications.caughtUpBody',
      tone: 'success',
    });
  }

  signals.push({
    key: 'booking',
    icon: 'calendar-clock-outline',
    titleKey: 'notifications.bookingPlaceholderTitle',
    bodyKey: 'notifications.bookingPlaceholderBody',
    tone: 'neutral',
  });

  if (!signals.some((signal) => signal.key === 'updates')) {
    signals.push({
      key: 'updates',
      icon: 'bell-badge-outline',
      titleKey: 'notifications.updatesPlaceholderTitle',
      bodyKey: 'notifications.updatesPlaceholderBody',
      tone: 'neutral',
    });
  }

  return signals;
}
