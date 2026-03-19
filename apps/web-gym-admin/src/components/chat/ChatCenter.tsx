'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useChatApi } from '@/src/contexts/ChatApiContext';
import type { Conversation, GetConversationResponse, Message } from '@myclup/contracts/chat';
import type { ConversationFilter } from './ConversationList';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { SendMessageForm } from './SendMessageForm';
import { AssignmentPanel } from './AssignmentPanel';
import { TemplateSelector } from './TemplateSelector';
import { QuickReplySelector } from './QuickReplySelector';

export function ChatCenter() {
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const api = useChatApi();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<GetConversationResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [branchFilter, setBranchFilter] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!api) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.chat.conversations.list();
      setConversations(res.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadConversation = useCallback(
    async (id: string) => {
      if (!api) return;
      setSelectedId(id);
      setError(null);
      try {
        const [conv, msgRes] = await Promise.all([
          api.chat.conversations.get(id),
          api.chat.messages.list(id),
        ]);
        setConversation(conv);
        setMessages(msgRes.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load conversation');
      }
    },
    [api]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!api) return;
    api.auth
      .whoami()
      .then((r: { user: { id: string } }) => setCurrentUserId(r.user.id))
      .catch(() => {});
  }, [api]);

  const branchOptions = conversations
    .filter((c): c is Conversation & { branchId: string } => !!c.branchId)
    .reduce<{ id: string; name: string }[]>((acc, c) => {
      const id = c.branchId;
      return acc.some((b) => b.id === id) ? acc : [...acc, { id, name: id }];
    }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!api || !selectedId) return;
      const dedupeKey = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      try {
        const msg = await api.chat.messages.send(selectedId, { content, dedupeKey });
        setMessages((prev) => [msg, ...prev]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to send message');
      }
    },
    [api, selectedId]
  );

  const handleAssign = useCallback(
    async (assignedToUserId: string) => {
      if (!api || !selectedId) return;
      try {
        await api.chat.conversations.assign(selectedId, { assignedToUserId });
        if (conversation) {
          const [updated] = await Promise.all([api.chat.conversations.get(selectedId)]);
          setConversation(updated);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to assign');
      }
    },
    [api, selectedId, conversation]
  );

  const handleSendTemplate = useCallback(
    async (templateId: string, dedupeKey: string) => {
      if (!api || !selectedId) return;
      try {
        const msg = await api.chat.messages.sendTemplate(selectedId, {
          templateId,
          dedupeKey,
        });
        setMessages((prev) => [msg, ...prev]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to send template');
      }
    },
    [api, selectedId]
  );

  const handleSendQuickReply = useCallback(
    async (body: string, dedupeKey: string) => {
      if (!api || !selectedId) return;
      try {
        const msg = await api.chat.messages.send(selectedId, { content: body, dedupeKey });
        setMessages((prev) => [msg, ...prev]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to send');
      }
    },
    [api, selectedId]
  );

  if (!api) {
    return (
      <div style={{ padding: '1rem' }} role="status">
        {tCommon('label.loading')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 8rem)' }}>
      <h1 style={{ margin: '0 0 1rem 0' }}>{t('list.title')}</h1>

      {error && (
        <div
          style={{
            padding: '0.5rem 1rem',
            marginBottom: '1rem',
            background: '#fee',
            border: '1px solid #c00',
            borderRadius: 4,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: '1rem' }}>
        <aside
          style={{
            width: 320,
            border: '1px solid #eee',
            borderRadius: 8,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={loadConversation}
            filter={filter}
            onFilterChange={setFilter}
            branchOptions={branchOptions}
            selectedBranchId={branchFilter}
            onBranchChange={setBranchFilter}
            isLoading={loading}
          />
        </aside>

        <section
          style={{
            flex: 1,
            border: '1px solid #eee',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {selectedId && conversation ? (
            <>
              <AssignmentPanel conversation={conversation} onAssign={handleAssign} />
              <MessageThread messages={messages} currentUserId={currentUserId} />
              <div style={{ padding: '0.5rem', borderTop: '1px solid #eee' }}>
                <TemplateSelector
                  gymId={conversation.gymId}
                  branchId={conversation.branchId}
                  onSelect={handleSendTemplate}
                />
                <QuickReplySelector
                  gymId={conversation.gymId}
                  branchId={conversation.branchId}
                  onSelect={handleSendQuickReply}
                />
                <SendMessageForm onSend={handleSendMessage} />
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
              }}
            >
              {t('list.empty')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
