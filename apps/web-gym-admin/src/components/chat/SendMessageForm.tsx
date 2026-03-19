'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
};

export function SendMessageForm({ onSend, disabled }: Props) {
  const t = useTranslations('chat');
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || sending || disabled) return;
      setSending(true);
      try {
        await onSend(trimmed);
        setValue('');
      } finally {
        setSending(false);
      }
    },
    [value, sending, disabled, onSend]
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        borderTop: '1px solid #e5e7eb',
        background: 'white',
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('input.placeholder')}
        disabled={disabled || sending}
        style={{
          flex: 1,
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          fontSize: '0.875rem',
        }}
      />
      <button
        type="submit"
        disabled={!value.trim() || sending || disabled}
        style={{
          padding: '0.5rem 1rem',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: disabled || sending ? 'not-allowed' : 'pointer',
          fontWeight: 500,
        }}
      >
        {sending ? t('status.sending') : t('input.send')}
      </button>
    </form>
  );
}
