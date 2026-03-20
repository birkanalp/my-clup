export type MembershipTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export type QuickActionKey =
  | 'bookClass'
  | 'openChat'
  | 'showQr'
  | 'renewMembership'
  | 'discoverGyms'
  | 'trackProgress';

export type QuickActionConfig = {
  key: QuickActionKey;
  icon: string;
  labelKey:
    | 'quickActions.bookClass'
    | 'quickActions.openChat'
    | 'quickActions.showQr'
    | 'quickActions.renewMembership'
    | 'quickActions.discoverGyms'
    | 'quickActions.trackProgress';
  hintKey:
    | 'quickActions.bookClassHint'
    | 'quickActions.openChatHint'
    | 'quickActions.showQrHint'
    | 'quickActions.renewMembershipHint'
    | 'quickActions.discoverGymsHint'
    | 'quickActions.trackProgressHint';
  disabled: boolean;
  route?:
    | '/'
    | '/booking'
    | '/chat'
    | '/membership'
    | '/membership/renew'
    | '/discovery'
    | '/progress';
};

export function getMembershipTone(status: string): MembershipTone {
  switch (status) {
    case 'active':
      return 'success';
    case 'expired':
    case 'cancelled':
      return 'danger';
    case 'frozen':
    case 'pending':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function getConversationTitleKey(type: string) {
  switch (type) {
    case 'support':
      return 'conversation.withGym';
    case 'instructor':
      return 'conversation.withInstructor';
    default:
      return 'conversation.direct';
  }
}

export function buildQuickActions(): QuickActionConfig[] {
  return [
    {
      key: 'bookClass',
      icon: 'calendar-plus-outline',
      labelKey: 'quickActions.bookClass',
      hintKey: 'quickActions.bookClassHint',
      disabled: false,
      route: '/booking',
    },
    {
      key: 'openChat',
      icon: 'chat-outline',
      labelKey: 'quickActions.openChat',
      hintKey: 'quickActions.openChatHint',
      disabled: false,
      route: '/chat',
    },
    {
      key: 'showQr',
      icon: 'qrcode-scan',
      labelKey: 'quickActions.showQr',
      hintKey: 'quickActions.showQrHint',
      disabled: false,
      route: '/membership',
    },
    {
      key: 'renewMembership',
      icon: 'refresh',
      labelKey: 'quickActions.renewMembership',
      hintKey: 'quickActions.renewMembershipHint',
      disabled: false,
      route: '/membership/renew',
    },
    {
      key: 'discoverGyms',
      icon: 'map-search-outline',
      labelKey: 'quickActions.discoverGyms',
      hintKey: 'quickActions.discoverGymsHint',
      disabled: false,
      route: '/discovery',
    },
    {
      key: 'trackProgress',
      icon: 'chart-timeline-variant',
      labelKey: 'quickActions.trackProgress',
      hintKey: 'quickActions.trackProgressHint',
      disabled: false,
      route: '/progress',
    },
  ];
}
