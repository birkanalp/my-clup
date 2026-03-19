/**
 * Hook to subscribe to Supabase Realtime for new messages and typing indicators.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Message } from '@myclup/contracts/chat';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';

type RealtimePayload = {
  new?: Record<string, unknown>;
};

export function useChatRealtime(
  conversationId: string | null,
  currentUserId: string | null,
  onNewMessage: (msg: Message) => void,
  onTyping?: (userId: string, isTyping: boolean) => void
) {
  const [typingUserIds, setTypingUserIds] = useState<Set<string>>(new Set());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channelRef = useRef<any>(null);

  const subscribe = useCallback(async () => {
    if (!conversationId || !supabase) return;
    try {
      const { channelName } = await api.chat.conversations.subscribe(conversationId);
      const channel = supabase.channel(channelName);

      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePayload) => {
          const row = payload.new;
          if (row && typeof row === 'object') {
            const msg: Message = {
              id: String(row.id),
              conversationId: String(row.conversation_id),
              senderId: String(row.sender_id),
              content: String(row.content),
              dedupeKey: row.dedupe_key ? String(row.dedupe_key) : null,
              createdAt: String(row.created_at),
              attachments: Array.isArray(row.attachments) ? row.attachments : undefined,
            };
            onNewMessage(msg);
          }
        }
      );

      if (onTyping) {
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const ids = new Set<string>();
          for (const presences of Object.values(state)) {
            for (const p of presences as { user_id?: string; typing?: boolean }[]) {
              if (p?.user_id && p.user_id !== currentUserId && p?.typing) {
                ids.add(p.user_id);
              }
            }
          }
          setTypingUserIds(ids);
        });
      }

      channel.subscribe();
      channelRef.current = channel;
    } catch {
      // Subscription validation failed; channel not set
    }
  }, [conversationId, currentUserId, onNewMessage, onTyping]);

  useEffect(() => {
    subscribe();
    return () => {
      if (channelRef.current) {
        supabase?.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setTypingUserIds(new Set());
    };
  }, [subscribe]);

  const broadcastTyping = useCallback(
    (isTyping: boolean) => {
      if (!channelRef.current || !currentUserId) return;
      channelRef.current.track({ user_id: currentUserId, typing: isTyping });
    },
    [currentUserId]
  );

  return { typingUserIds, broadcastTyping };
}
