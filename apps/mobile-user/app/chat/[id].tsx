import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import type { Message } from '@myclup/contracts/chat';
import { MessageThread } from '../../src/features/chat/MessageThread';
import { useMessages } from '../../src/features/chat/useMessages';
import { useChatRealtime } from '../../src/features/chat/useChatRealtime';
import { useCurrentUser } from '../../src/features/chat/useCurrentUser';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id ?? '';
  const currentUserId = useCurrentUser();

  const { items: messages, loading, error, sendMessage, appendMessage } = useMessages(
    conversationId || null,
    currentUserId
  );

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

  const typingNames = typingUserIds.size > 0 ? ['Someone'] : [];

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
      typingNames={typingNames}
      onTypingChange={handleTypingChange}
    />
  );
}
