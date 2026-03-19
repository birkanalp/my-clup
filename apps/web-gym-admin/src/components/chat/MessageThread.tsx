'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { Message } from '@myclup/contracts/chat';

type Props = {
  messages: Message[];
  currentUserId: string | null;
  isLoading?: boolean;
};

export function MessageThread({ messages, currentUserId, isLoading }: Props) {
  const t = useTranslations('chat');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {t('label.loading')}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
        }}
      >
        {t('empty.noMessages')}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {messages.map((msg) => {
        const isOwn = msg.senderId === currentUserId;
        return (
          <div
            key={msg.id}
            style={{
              alignSelf: isOwn ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              padding: '0.5rem 0.75rem',
              borderRadius: 12,
              background: isOwn ? '#3b82f6' : '#f3f4f6',
              color: isOwn ? 'white' : '#1f2937',
            }}
          >
            <div>{msg.content}</div>
            <div
              style={{
                fontSize: '0.7rem',
                opacity: 0.8,
                marginTop: 2,
              }}
            >
              {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
