import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ConversationList } from '../../src/features/chat/ConversationList';
import { useConversations } from '../../src/features/chat/useConversations';

export default function ChatIndexScreen() {
  const router = useRouter();
  const { items, loading, error, refresh, loadMore, nextCursor } = useConversations();

  const handleSelect = (id: string) => {
    router.push(`/chat/${id}` as const);
  };

  return (
    <View style={styles.container}>
      <ConversationList
        items={items}
        loading={loading}
        error={error}
        onRefresh={refresh}
        onLoadMore={loadMore}
        onSelectConversation={handleSelect}
        nextCursor={nextCursor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
