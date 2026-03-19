/**
 * Message thread with optimistic send, Realtime updates, typing indicator.
 */
import { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Message } from '@myclup/contracts/chat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

type MessageThreadProps = {
  messages: Message[];
  currentUserId: string | null;
  loading: boolean;
  error: Error | null;
  onSendMessage: (content: string) => Promise<void>;
  typingNames: string[];
  onTypingChange: (typing: boolean) => void;
};

export function MessageThread({
  messages,
  currentUserId,
  loading,
  error,
  onSendMessage,
  typingNames,
  onTypingChange,
}: MessageThreadProps) {
  const { t } = useTranslation('chat');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(
    async (content: string) => {
      await onSendMessage(content);
    },
    [onSendMessage]
  );

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {loading && messages.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.senderId === currentUserId}
              showReadReceipt={item.senderId === currentUserId}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('empty.noMessages')}</Text>
            </View>
          }
          contentContainerStyle={[
            styles.listContent,
            messages.length === 0 && styles.listContentEmpty,
          ]}
        />
      )}
      {typingNames.length > 0 && (
        <View style={styles.typingBar}>
          <Text style={styles.typingText}>{t('label.typing', { name: typingNames[0] })}</Text>
        </View>
      )}
      <MessageInput onSend={handleSend} onTypingChange={onTypingChange} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
  },
  listContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  listContentEmpty: {
    justifyContent: 'center',
  },
  typingBar: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
  },
  typingText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
});
