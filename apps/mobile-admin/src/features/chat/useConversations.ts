import { useState, useEffect, useCallback } from 'react';
import type { Conversation } from '@myclup/contracts/chat';
import { api } from '../../lib/api';

export type ConversationWithUnread = Conversation & { unreadCount?: number };

export function useConversations() {
  const [items, setItems] = useState<ConversationWithUnread[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async (cursor?: string, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.chat.conversations.list({ cursor, limit: 20 });
      setItems((prev) =>
        append
          ? ([...prev, ...res.items] as ConversationWithUnread[])
          : (res.items as ConversationWithUnread[])
      );
      setNextCursor(res.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      if (!append) {
        setItems([]);
        setNextCursor(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(undefined, false), [load]);
  const loadMore = useCallback(() => {
    if (nextCursor && !loading) load(nextCursor, true);
  }, [nextCursor, loading, load]);

  return { items, nextCursor, loading, error, refresh, loadMore };
}
