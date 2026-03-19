/**
 * Hook to fetch messages and send with optimistic UI.
 */
import { useState, useEffect, useCallback } from 'react';
import type { Message } from '@myclup/contracts/chat';
import { api } from '../../lib/api';

export type OptimisticMessage = Message & { _optimistic?: boolean; _sending?: boolean };

export function useMessages(conversationId: string | null, currentUserId: string | null) {
  const [items, setItems] = useState<OptimisticMessage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(
    async (cursor?: string) => {
      if (!conversationId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.chat.messages.list(conversationId, { cursor, limit: 50 });
        const ordered = [...res.items].reverse();
        setItems(ordered);
        setNextCursor(res.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        setItems([]);
        setNextCursor(null);
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  useEffect(() => {
    if (conversationId) load();
  }, [conversationId, load]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return null;
      const dedupeKey = `mobile-user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic: OptimisticMessage = {
        id: `opt-${dedupeKey}`,
        conversationId,
        senderId: currentUserId ?? 'unknown',
        content: content.trim(),
        dedupeKey,
        createdAt: new Date().toISOString(),
        _optimistic: true,
        _sending: true,
      };
      setItems((prev) => [...prev, optimistic]);
      setSending(true);
      try {
        const msg = await api.chat.messages.send(conversationId, {
          content: content.trim(),
          dedupeKey,
        });
        setItems((prev) =>
          prev.map((m) =>
            m._optimistic && m.dedupeKey === dedupeKey
              ? { ...msg, _optimistic: false, _sending: false }
              : m
          )
        );
        return msg;
      } catch (e) {
        setItems((prev) => prev.filter((m) => !(m._optimistic && m.dedupeKey === dedupeKey)));
        throw e;
      } finally {
        setSending(false);
      }
    },
    [conversationId, currentUserId]
  );

  const appendMessage = useCallback((msg: Message) => {
    setItems((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  const refresh = useCallback(() => load(), [load]);

  return { items, nextCursor, loading, error, sending, sendMessage, appendMessage, refresh };
}
