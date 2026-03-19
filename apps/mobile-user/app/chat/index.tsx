import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@myclup/ui-native';
import { ConversationList } from '../../src/features/chat/ConversationList';
import { useConversations } from '../../src/features/chat/useConversations';

export default function ChatIndexScreen() {
  const router = useRouter();
  const { items, loading, error, refresh, loadMore, nextCursor } = useConversations();

  const handleSelect = (id: string) => {
    router.push(`/chat/${id}` as const);
  };

  return (
    <ScreenContainer style={styles.container}>
      <ConversationList
        items={items}
        loading={loading}
        error={error}
        onRefresh={refresh}
        onLoadMore={loadMore}
        onSelectConversation={handleSelect}
        nextCursor={nextCursor}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
