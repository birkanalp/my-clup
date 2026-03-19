import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { Message } from '@myclup/contracts/chat';
import { MessageThread } from '../../src/features/chat/MessageThread';
import { useMessages } from '../../src/features/chat/useMessages';
import { useChatRealtime } from '../../src/features/chat/useChatRealtime';
import { useCurrentUser } from '../../src/features/chat/useCurrentUser';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation('chat');
  const conversationId = id ?? '';
  const currentUserId = useCurrentUser();

  const {
    items: messages,
    loading,
    error,
    sendMessage,
    appendMessage,
  } = useMessages(conversationId || null, currentUserId);

  const handleNewMessage = useCallback(
    (msg: Message) => {
      if (msg.conversationId === conversationId) {
        appendMessage(msg);
      }
    },
    [conversationId, appendMessage]
  );

  const { typingUserIds, broadcastTyping } = useChatRealtime(
    conversationId || null,
    currentUserId,
    handleNewMessage
  );

  const handleTypingChange = useCallback(
    (typing: boolean) => {
      broadcastTyping(typing);
    },
    [broadcastTyping]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      await sendMessage(content);
    },
    [sendMessage]
  );

  if (!conversationId) {
    return null;
  }

  return (
    <MessageThread
      conversationId={conversationId}
      messages={messages}
      currentUserId={currentUserId}
      loading={loading}
      error={error}
      onSendMessage={handleSendMessage}
      typingLabel={typingUserIds.size > 0 ? t('label.typingSomeone') : null}
      onTypingChange={handleTypingChange}
    />
  );
}
