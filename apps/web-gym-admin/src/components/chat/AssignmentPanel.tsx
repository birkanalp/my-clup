'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { GetConversationResponse } from '@myclup/contracts/chat';

type Props = {
  conversation: GetConversationResponse;
  onAssign: (assignedToUserId: string) => Promise<void>;
};

export function AssignmentPanel({ conversation, onAssign }: Props) {
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignment = conversation.assignment;

  const handleAssign = async () => {
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onAssign(userId.trim());
      setUserId('');
    } catch (e) {
      setError(e instanceof Error ? e.message : tCommon('label.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t('assignment.title')}</span>
      {assignment ? (
        <span style={{ color: '#666', fontSize: '0.875rem' }}>
          {t('assignment.assignedTo')}: {assignment.assignedToUserId}
        </span>
      ) : (
        <span style={{ color: '#888', fontSize: '0.875rem' }}>{t('assignment.unassigned')}</span>
      )}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: 'auto' }}>
        <input
          type="text"
          placeholder={t('assignment.assignTo')}
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{
            padding: '0.35rem 0.5rem',
            border: '1px solid #ccc',
            borderRadius: 4,
            fontSize: '0.875rem',
            minWidth: 180,
          }}
          aria-label={t('assignment.assignTo')}
        />
        <button
          type="button"
          onClick={handleAssign}
          disabled={loading || !userId.trim()}
          style={{
            padding: '0.35rem 0.75rem',
            border: '1px solid #333',
            borderRadius: 4,
            background: '#333',
            color: '#fff',
            fontSize: '0.875rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {assignment ? t('assignment.reassign') : t('assignment.assignTo')}
        </button>
      </div>
      {error && <span style={{ color: '#c00', fontSize: '0.75rem', width: '100%' }}>{error}</span>}
    </div>
  );
}
