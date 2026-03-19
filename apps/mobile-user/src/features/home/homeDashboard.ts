export type MembershipTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

export type QuickActionKey = 'bookClass' | 'openChat' | 'showQr' | 'renewMembership';

export type QuickActionConfig = {
  key: QuickActionKey;
  icon: string;
  labelKey:
    | 'quickActions.bookClass'
    | 'quickActions.openChat'
    | 'quickActions.showQr'
    | 'quickActions.renewMembership';
  hintKey:
    | 'quickActions.bookClassHint'
    | 'quickActions.openChatHint'
    | 'quickActions.showQrHint'
    | 'quickActions.renewMembershipHint';
  disabled: boolean;
  route?: '/' | '/chat' | '/membership' | '/membership/renew';
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
      disabled: true,
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
  ];
}
