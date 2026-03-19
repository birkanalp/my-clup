/**
 * Conversation list with pull-to-refresh and unread badges.
 */
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ConversationRow } from './ConversationRow';
import type { Conversation } from '@myclup/contracts/chat';

type ConversationWithUnread = Conversation & { unreadCount?: number };

type ConversationListProps = {
  items: ConversationWithUnread[];
  loading: boolean;
  error: Error | null;
  onRefresh: () => void;
  onLoadMore: () => void;
  onSelectConversation: (id: string) => void;
  nextCursor: string | null;
};

export function ConversationList({
  items,
  loading,
  error,
  onRefresh,
  onLoadMore,
  onSelectConversation,
  nextCursor,
}: ConversationListProps) {
  const { t } = useTranslation('chat');

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  if (!loading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{t('list.empty')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ConversationRow
          conversation={item}
          unreadCount={item.unreadCount ?? 0}
          onPress={() => onSelectConversation(item.id)}
        />
      )}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
      onEndReached={nextCursor ? onLoadMore : undefined}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        loading && items.length > 0 ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" />
          </View>
        ) : null
      }
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
});
