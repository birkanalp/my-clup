/**
 * Conversation list row with optional unread badge.
 */
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Conversation } from '@myclup/contracts/chat';

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

export function ConversationRow({
  conversation,
  unreadCount = 0,
  onPress,
}: ConversationRowProps) {
  const { t } = useTranslation('chat');
  const titleKey = getConversationTitleKey(conversation);
  const title = t(titleKey);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {conversation.type}
        </Text>
      </View>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
