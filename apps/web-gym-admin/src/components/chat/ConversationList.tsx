'use client';

import { useTranslations } from 'next-intl';
import type { Conversation } from '@myclup/contracts/chat';

export type ConversationFilter = 'all' | 'unread' | 'assigned' | 'branch';

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  filter: ConversationFilter;
  onFilterChange: (filter: ConversationFilter) => void;
  branchOptions: { id: string; name: string }[];
  selectedBranchId: string | null;
  onBranchChange: (branchId: string | null) => void;
  isLoading?: boolean;
};

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  branchOptions,
  selectedBranchId,
  onBranchChange,
  isLoading,
}: Props) {
  const t = useTranslations('chat');

  const filteredConversations = filterByBranch(
    filter === 'assigned' || filter === 'unread' ? [] : conversations,
    selectedBranchId
  );

  const showBranchFilter = branchOptions.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 280 }}>
      <div style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>{t('list.title')}</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          {(['all', 'unread', 'assigned'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                border: `1px solid ${filter === f ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: 4,
                background: filter === f ? '#eff6ff' : 'white',
                cursor: 'pointer',
              }}
            >
              {f === 'all'
                ? t('list.filterAll')
                : f === 'unread'
                  ? t('label.unread')
                  : t('list.filterAssigned')}
            </button>
          ))}
          {showBranchFilter && (
            <select
              value={selectedBranchId ?? ''}
              onChange={(e) => onBranchChange(e.target.value || null)}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: 4,
              }}
            >
              <option value="">{t('list.filterBranch')}</option>
              {branchOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: '1rem', color: '#6b7280' }}>{t('label.loading')}</div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ padding: '1rem', color: '#6b7280' }}>{t('list.empty')}</div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filteredConversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    border: 'none',
                    borderBottom: '1px solid #e5e7eb',
                    background: selectedId === c.id ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{getConversationLabel(c, t)}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      display: 'block',
                      marginTop: 2,
                    }}
                  >
                    {c.type}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function filterByBranch(items: Conversation[], branchId: string | null): Conversation[] {
  if (!branchId) return items;
  return items.filter((c) => c.branchId === branchId);
}

function getConversationLabel(conv: Conversation, t: (k: string) => string): string {
  switch (conv.type) {
    case 'support':
      return t('conversation.withGym');
    case 'instructor':
      return t('conversation.withInstructor');
    case 'direct':
      return t('conversation.direct');
    default:
      return conv.type;
  }
}
