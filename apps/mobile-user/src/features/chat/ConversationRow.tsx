import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Conversation } from '@myclup/contracts/chat';
import { AppIcon } from '../../components/AppIcon';
import { AppText } from '../../components/AppText';
import { appTheme } from '../../theme/appTheme';

type ConversationRowProps = {
  conversation: Conversation;
  unreadCount?: number;
  onPress: () => void;
};

function getConversationTitleKey(conversation: Conversation): string {
  switch (conversation.type) {
    case 'support':
      return 'conversation.withGym';
    case 'instructor':
      return 'conversation.withInstructor';
    default:
      return 'conversation.direct';
  }
}

function getConversationIcon(conversation: Conversation) {
  switch (conversation.type) {
    case 'support':
      return 'lifebuoy';
    case 'instructor':
      return 'account-star-outline';
    default:
      return 'chat-processing-outline';
  }
}

function formatUpdatedAt(iso: string, locale: string) {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ConversationRow({ conversation, unreadCount = 0, onPress }: ConversationRowProps) {
  const { t, i18n } = useTranslation('chat');

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.iconWrap}>
        <AppIcon
          name={getConversationIcon(conversation)}
          size={20}
          color={appTheme.colors.primary}
        />
      </View>
      <View style={styles.content}>
        <AppText style={styles.title} numberOfLines={1}>
          {t(getConversationTitleKey(conversation))}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {formatUpdatedAt(conversation.updatedAt, i18n.resolvedLanguage ?? 'en')}
        </AppText>
      </View>
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <AppText variant="caption" tone="inverse" style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: appTheme.spacing.md,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.md,
    borderWidth: 1,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: appTheme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appTheme.colors.primarySoft,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  badge: {
    minWidth: 26,
    height: 26,
    borderRadius: appTheme.radii.pill,
    backgroundColor: appTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    fontWeight: '700',
  },
});
