import type { ConversationWithUnread } from '../chat/useConversations';
import type { MembershipScreenData, RenewalReason } from '../membership/types';

export type NotificationCardKey = 'membership' | 'chat' | 'booking' | 'app';
export type NotificationCardState = 'action' | 'info' | 'placeholder';

export type NotificationCard = {
  key: NotificationCardKey;
  state: NotificationCardState;
  route: '/membership' | '/membership/renew' | '/chat' | null;
  unreadCount?: number;
  updatedAt?: string;
  renewalReason?: RenewalReason;
};

export type NotificationCenterDigest = {
  actionableCount: number;
  cards: NotificationCard[];
};

type NotificationCenterInput = {
  membershipData: MembershipScreenData;
  conversations: ConversationWithUnread[];
};

export function buildNotificationCenterDigest({
  membershipData,
  conversations,
}: NotificationCenterInput): NotificationCenterDigest {
  const unreadCount = conversations.reduce(
    (count, conversation) => count + Math.max(conversation.unreadCount ?? 0, 0),
    0
  );
  const latestConversation = [...conversations].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  )[0];

  const cards: NotificationCard[] = [
    buildMembershipCard(membershipData),
    buildChatCard(unreadCount, latestConversation?.updatedAt),
    {
      key: 'booking',
      state: 'placeholder',
      route: null,
    },
    {
      key: 'app',
      state: 'placeholder',
      route: null,
    },
  ];

  return {
    actionableCount: cards.filter((card) => card.state === 'action').length,
    cards,
  };
}

function buildMembershipCard(membershipData: MembershipScreenData): NotificationCard {
  if (!membershipData.membership) {
    return {
      key: 'membership',
      state: 'placeholder',
      route: '/membership',
    };
  }

  if (membershipData.renewalReason) {
    return {
      key: 'membership',
      state: 'action',
      route: '/membership/renew',
      renewalReason: membershipData.renewalReason,
    };
  }

  return {
    key: 'membership',
    state: 'info',
    route: '/membership',
  };
}

function buildChatCard(unreadCount: number, updatedAt?: string): NotificationCard {
  if (unreadCount > 0) {
    return {
      key: 'chat',
      state: 'action',
      route: '/chat',
      unreadCount,
      updatedAt,
    };
  }

  if (updatedAt) {
    return {
      key: 'chat',
      state: 'info',
      route: '/chat',
      updatedAt,
    };
  }

  return {
    key: 'chat',
    state: 'placeholder',
    route: '/chat',
  };
}
