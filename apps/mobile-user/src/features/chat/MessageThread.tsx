import { useCallback, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@myclup/ui-native';
import type { Message } from '@myclup/contracts/chat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { AppStateBlock } from '../../components/AppStateBlock';
import { AppText } from '../../components/AppText';
import { appTheme } from '../../theme/appTheme';

type MessageThreadProps = {
  conversationId?: string;
  messages: Message[];
  currentUserId: string | null;
  loading: boolean;
  error: Error | null;
  onSendMessage: (content: string) => Promise<void>;
  typingLabel: string | null;
  onTypingChange: (typing: boolean) => void;
};

export function MessageThread({
  messages,
  currentUserId,
  loading,
  error,
  onSendMessage,
  typingLabel,
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
      <AppStateBlock
        icon="message-alert-outline"
        title={t('thread.errorTitle')}
        description={t('thread.errorBody')}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {loading && messages.length === 0 ? (
        <AppStateBlock
          loading
          title={t('thread.loadingTitle')}
          description={t('thread.loadingBody')}
        />
      ) : (
        <Card style={styles.threadCard}>
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
                <AppStateBlock
                  icon="message-text-outline"
                  title={t('thread.emptyTitle')}
                  description={t('thread.emptyBody')}
                />
              </View>
            }
            contentContainerStyle={[
              styles.listContent,
              messages.length === 0 && styles.listContentEmpty,
            ]}
          />
        </Card>
      )}
      {typingLabel ? (
        <View style={styles.typingBar}>
          <AppText variant="caption" tone="soft" style={styles.typingText}>
            {typingLabel}
          </AppText>
        </View>
      ) : null}
      <MessageInput onSend={handleSend} onTypingChange={onTypingChange} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    gap: appTheme.spacing.sm,
  },
  threadCard: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: appTheme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  empty: {
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.xl,
  },
  listContent: {
    paddingVertical: appTheme.spacing.sm,
    flexGrow: 1,
  },
  listContentEmpty: {
    justifyContent: 'center',
  },
  typingBar: {
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: appTheme.radii.md,
  },
  typingText: {
    fontStyle: 'italic',
  },
});
