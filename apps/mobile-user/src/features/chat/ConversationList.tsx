import type { Conversation } from '@myclup/contracts/chat';
import { View, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ConversationRow } from './ConversationRow';
import { AppStateBlock } from '../../components/AppStateBlock';
import { appTheme } from '../../theme/appTheme';

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
      <AppStateBlock
        icon="message-alert-outline"
        title={t('list.error')}
        description={t('list.errorBody')}
        actionLabel={t('list.retry')}
        onAction={onRefresh}
      />
    );
  }

  if (!loading && items.length === 0) {
    return (
      <AppStateBlock
        icon="message-text-outline"
        title={t('list.empty')}
        description={t('list.emptyBody')}
      />
    );
  }

  if (loading && items.length === 0) {
    return (
      <AppStateBlock loading title={t('list.loadingTitle')} description={t('list.loadingBody')} />
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
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      onEndReached={nextCursor ? onLoadMore : undefined}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        loading && items.length > 0 ? (
          <View style={styles.footer}>
            <ActivityIndicator size="small" color={appTheme.colors.primary} />
          </View>
        ) : null
      }
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    gap: appTheme.spacing.sm,
    paddingBottom: 16,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
