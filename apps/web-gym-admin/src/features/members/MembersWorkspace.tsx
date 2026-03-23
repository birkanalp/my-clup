'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/src/i18n/navigation';
import { getApi } from '@/src/lib/api';
import type { GymMember, MemberStatus } from '@myclup/api-client';

type StatusFilter = MemberStatus | 'all';

function StatusBadge({ status, t }: { status: MemberStatus; t: ReturnType<typeof useTranslations> }) {
  const colorMap: Record<MemberStatus, string> = {
    active: '#16a34a',
    expired: '#d97706',
    suspended: '#dc2626',
    no_membership: '#6b7280',
  };
  const labelMap: Record<MemberStatus, string> = {
    active: t('statusActive'),
    expired: t('statusExpired'),
    suspended: t('statusSuspended'),
    no_membership: t('statusNoMembership'),
  };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: '0.75rem',
        fontWeight: 600,
        background: colorMap[status] + '20',
        color: colorMap[status],
        border: `1px solid ${colorMap[status]}40`,
      }}
    >
      {labelMap[status]}
    </span>
  );
}

export function MembersWorkspace() {
  const t = useTranslations('common.gymAdminWeb.members');
  const router = useRouter();
  const api = getApi();

  const [members, setMembers] = useState<GymMember[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchMembers = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, unknown> = { limit: 20 };
        if (search) params.search = search;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (cursor) params.cursor = cursor;
        const res = await api.members.listMembers(params);
        if (cursor) {
          setMembers((prev) => [...prev, ...res.items]);
        } else {
          setMembers(res.items);
        }
        setNextCursor(res.nextCursor);
      } catch {
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    },
    [api.members, search, statusFilter, t]
  );

  useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  const statusOptions: StatusFilter[] = ['all', 'active', 'expired', 'suspended', 'no_membership'];
  const statusLabels: Record<StatusFilter, string> = {
    all: t('filterAll'),
    active: t('filterActive'),
    expired: t('filterExpired'),
    suspended: t('filterSuspended'),
    no_membership: t('filterNoMembership'),
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
          alignItems: 'center',
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: '0.875rem',
            flex: '1 1 200px',
            minWidth: 0,
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: 8,
                border: '1px solid',
                borderColor: statusFilter === s ? '#0f766e' : '#cbd5e1',
                background: statusFilter === s ? '#0f766e' : '#fff',
                color: statusFilter === s ? '#fff' : '#374151',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                fontWeight: statusFilter === s ? 600 : 400,
              }}
            >
              {statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
      )}

      {loading && members.length === 0 ? (
        <p style={{ color: '#64748b' }}>{t('loading')}</p>
      ) : members.length === 0 ? (
        <p style={{ color: '#64748b' }}>{t('noResults')}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                {[
                  t('colName'),
                  t('colStatus'),
                  t('colPlan'),
                  t('colValidUntil'),
                  t('colJoined'),
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '0.75rem 1rem',
                      fontWeight: 600,
                      color: '#374151',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr
                  key={m.membershipInstanceId ?? m.id}
                  onClick={() => router.push(`/members/${m.id}`)}
                  style={{
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background = '';
                  }}
                >
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{m.displayName}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <StatusBadge status={m.membershipStatus} t={t} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                    {m.membershipPlanName ?? '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                    {m.membershipValidUntil
                      ? new Date(m.membershipValidUntil).toLocaleDateString()
                      : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                    {new Date(m.joinedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {nextCursor && (
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            onClick={() => void fetchMembers(nextCursor)}
            disabled={loading}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: '#fff',
              cursor: loading ? 'default' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {t('loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
