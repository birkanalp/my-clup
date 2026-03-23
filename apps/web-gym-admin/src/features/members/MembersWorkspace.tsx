'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import type { MemberSummary } from '@myclup/contracts/members';
import { getApi } from '@/src/lib/api';

type ApiShape = ReturnType<typeof getApi>;

type Props = {
  api?: ApiShape;
};

type StatusFilter = 'all' | 'active' | 'expired' | 'frozen' | 'cancelled';

function statusTone(status: string | null): { background: string; color: string } {
  if (status === 'active') return { background: '#dcfce7', color: '#166534' };
  if (status === 'expired') return { background: '#e2e8f0', color: '#334155' };
  if (status === 'frozen') return { background: '#dbeafe', color: '#1d4ed8' };
  if (status === 'cancelled') return { background: '#fee2e2', color: '#991b1b' };
  return { background: '#f1f5f9', color: '#64748b' };
}

export function MembersWorkspace({ api = getApi() }: Props) {
  const t = useTranslations('common');
  const locale = useLocale();

  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorHistory, setCursorHistory] = useState<Array<string | undefined>>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMembers = useCallback(
    async (opts: { search: string; status: StatusFilter; cursor?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const params: { status?: string; search?: string; cursor?: string } = {};
        if (opts.search.trim()) params.search = opts.search.trim();
        if (opts.status !== 'all') params.status = opts.status;
        if (opts.cursor) params.cursor = opts.cursor;
        const result = await api.members.list(params);
        setMembers(result.items);
        setTotal(result.total);
        setNextCursor(result.nextCursor);
      } catch {
        setError(t('gymAdminWeb.members.errorBody'));
      } finally {
        setLoading(false);
      }
    },
    [api, t]
  );

  useEffect(() => {
    setCursor(undefined);
    setCursorHistory([]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void loadMembers({ search, status: statusFilter, cursor: undefined });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, statusFilter, loadMembers]);

  const handleNextPage = useCallback(() => {
    if (!nextCursor) return;
    setCursorHistory((prev) => [...prev, cursor]);
    setCursor(nextCursor);
    void loadMembers({ search, status: statusFilter, cursor: nextCursor });
  }, [nextCursor, cursor, search, statusFilter, loadMembers]);

  const handlePrevPage = useCallback(() => {
    if (cursorHistory.length === 0) return;
    const prev = cursorHistory[cursorHistory.length - 1];
    setCursorHistory((h) => h.slice(0, -1));
    setCursor(prev);
    void loadMembers({ search, status: statusFilter, cursor: prev });
  }, [cursorHistory, search, statusFilter, loadMembers]);

  function renderStatusLabel(status: string | null): string {
    if (status === 'active') return t('gymAdminWeb.members.statusActive');
    if (status === 'expired') return t('gymAdminWeb.members.statusExpired');
    if (status === 'frozen') return t('gymAdminWeb.members.statusFrozen');
    if (status === 'cancelled') return t('gymAdminWeb.members.statusCancelled');
    return t('gymAdminWeb.members.statusUnknown');
  }

  const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('gymAdminWeb.members.filterAll') },
    { value: 'active', label: t('gymAdminWeb.members.filterActive') },
    { value: 'expired', label: t('gymAdminWeb.members.filterExpired') },
    { value: 'frozen', label: t('gymAdminWeb.members.filterFrozen') },
    { value: 'cancelled', label: t('gymAdminWeb.members.filterCancelled') },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1024, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          {t('gymAdminWeb.members.heroTitle')}
        </h1>
        <p style={{ color: '#475569', marginTop: '0.25rem', marginBottom: 0 }}>
          {t('gymAdminWeb.members.heroSubtitle')}
        </p>
      </div>

      {/* Search and filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('gymAdminWeb.members.searchPlaceholder')}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            fontSize: '0.875rem',
            minWidth: 220,
            flex: '1 1 220px',
          }}
        />
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: 9999,
                border: '1px solid',
                borderColor: statusFilter === f.value ? '#0f172a' : '#cbd5e1',
                background: statusFilter === f.value ? '#0f172a' : 'transparent',
                color: statusFilter === f.value ? '#fff' : '#334155',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 500,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total count */}
      {!loading && !error && (
        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          {t('gymAdminWeb.members.totalCount', { count: total })}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ color: '#64748b' }}>{t('gymAdminWeb.members.loadingBody')}</p>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ color: '#991b1b', background: '#fee2e2', padding: '1rem', borderRadius: 6 }}>
          <strong>{t('gymAdminWeb.members.errorTitle')}</strong>
          <p style={{ margin: '0.25rem 0 0' }}>{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && members.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
          <p style={{ fontWeight: 600 }}>{t('gymAdminWeb.members.emptyTitle')}</p>
          <p style={{ margin: '0.25rem 0 0' }}>{t('gymAdminWeb.members.emptyBody')}</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && members.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.members.tableColName')}
                </th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.members.tableColEmail')}
                </th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.members.tableColStatus')}
                </th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.members.tableColPlan')}
                </th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.members.tableColExpiry')}
                </th>
                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                  {t('gymAdminWeb.members.tableColActions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const tone = statusTone(member.membershipStatus);
                const expiry = member.membershipValidUntil
                  ? new Date(member.membershipValidUntil).toLocaleDateString()
                  : '—';
                return (
                  <tr key={member.memberId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.625rem 0.75rem', fontWeight: 500 }}>
                      {member.displayName}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#475569' }}>
                      {member.email ?? '—'}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      <span
                        style={{
                          ...tone,
                          padding: '0.125rem 0.5rem',
                          borderRadius: 9999,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {renderStatusLabel(member.membershipStatus)}
                      </span>
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#475569' }}>
                      {member.membershipPlanName ?? '—'}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', color: '#475569' }}>{expiry}</td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      <Link
                        href={`/${locale}/members/${member.memberId}`}
                        style={{
                          background: '#0f172a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '0.25rem 0.625rem',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        {t('gymAdminWeb.members.actionViewDetail')}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (cursorHistory.length > 0 || nextCursor !== null) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {cursorHistory.length > 0 && (
            <button
              onClick={handlePrevPage}
              style={{
                background: 'transparent',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {t('gymAdminWeb.members.prevPage')}
            </button>
          )}
          {nextCursor !== null && (
            <button
              onClick={handleNextPage}
              style={{
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {t('gymAdminWeb.members.nextPage')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
