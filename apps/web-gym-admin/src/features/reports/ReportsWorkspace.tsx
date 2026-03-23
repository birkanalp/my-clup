'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ReportPeriod, ReportSummaryResponse } from '@myclup/contracts/reports';
import { getApi } from '@/src/lib/api';

type ApiShape = ReturnType<typeof getApi>;

type Props = {
  api?: ApiShape;
};

const PERIODS: ReportPeriod[] = ['last_30_days', 'last_3_months', 'this_year'];

function computeRange(period: ReportPeriod): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString();

  if (period === 'last_30_days') {
    const from = new Date(now);
    from.setDate(from.getDate() - 30);
    return { from: from.toISOString(), to };
  }

  if (period === 'last_3_months') {
    const from = new Date(now);
    from.setMonth(from.getMonth() - 3);
    return { from: from.toISOString(), to };
  }

  const from = new Date(now.getFullYear(), 0, 1).toISOString();
  return { from, to };
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatAttendance(rate: number): string {
  return (rate * 100).toFixed(1) + '%';
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        minWidth: 140,
        flex: '1 1 140px',
      }}
    >
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
        {value}
      </p>
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: '0 0 0.75rem',
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>{children}</div>
    </div>
  );
}

export function ReportsWorkspace({ api = getApi() }: Props) {
  const t = useTranslations('common');

  const [period, setPeriod] = useState<ReportPeriod>('last_30_days');
  const [summary, setSummary] = useState<ReportSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periodLabel = useCallback(
    (p: ReportPeriod): string => {
      const map: Record<ReportPeriod, string> = {
        last_30_days: t('gymAdminWeb.reports.periodLast30Days'),
        last_3_months: t('gymAdminWeb.reports.periodLast3Months'),
        this_year: t('gymAdminWeb.reports.periodThisYear'),
      };
      return map[p];
    },
    [t]
  );

  const loadSummary = useCallback(
    async (selectedPeriod: ReportPeriod) => {
      setLoading(true);
      setError(null);
      const { from, to } = computeRange(selectedPeriod);
      try {
        const result = await api.reports.getSummary(from, to);
        setSummary(result);
      } catch {
        setError(t('gymAdminWeb.reports.errorBody'));
      } finally {
        setLoading(false);
      }
    },
    [api, t]
  );

  useEffect(() => {
    void loadSummary(period);
  }, [loadSummary, period]);

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1024, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
          {t('gymAdminWeb.reports.heroTitle')}
        </h1>
        <p style={{ color: '#475569', marginTop: '0.25rem', marginBottom: 0 }}>
          {t('gymAdminWeb.reports.heroSubtitle')}
        </p>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {PERIODS.map((p) => {
          const active = p === period;
          return (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                background: active ? '#0f172a' : 'transparent',
                color: active ? '#fff' : '#334155',
                border: active ? 'none' : '1px solid #cbd5e1',
                borderRadius: 6,
                padding: '0.375rem 0.875rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              {periodLabel(p)}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <p style={{ color: '#64748b' }}>{t('gymAdminWeb.reports.loadingBody')}</p>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ color: '#991b1b', background: '#fee2e2', padding: '1rem', borderRadius: 6 }}>
          <strong>{t('gymAdminWeb.reports.errorTitle')}</strong>
          <p style={{ margin: '0.25rem 0 0' }}>{error}</p>
        </div>
      )}

      {/* Metric sections */}
      {!loading && !error && summary && (
        <div>
          <SectionBlock title={t('gymAdminWeb.reports.sectionRevenue')}>
            <MetricCard
              label={t('gymAdminWeb.reports.metricTotalCollected')}
              value={formatCurrency(summary.revenue.totalCollected, summary.revenue.currency)}
            />
            <MetricCard
              label={t('gymAdminWeb.reports.metricOutstanding')}
              value={formatCurrency(summary.revenue.outstanding, summary.revenue.currency)}
            />
          </SectionBlock>

          <SectionBlock title={t('gymAdminWeb.reports.sectionMembers')}>
            <MetricCard
              label={t('gymAdminWeb.reports.metricActiveMembers')}
              value={String(summary.members.activeCount)}
            />
            <MetricCard
              label={t('gymAdminWeb.reports.metricNewMembers')}
              value={String(summary.members.newThisPeriod)}
            />
            <MetricCard
              label={t('gymAdminWeb.reports.metricExpiredMembers')}
              value={String(summary.members.expiredThisPeriod)}
            />
          </SectionBlock>

          <SectionBlock title={t('gymAdminWeb.reports.sectionBookings')}>
            <MetricCard
              label={t('gymAdminWeb.reports.metricTotalSessions')}
              value={String(summary.bookings.totalSessions)}
            />
            <MetricCard
              label={t('gymAdminWeb.reports.metricAvgAttendance')}
              value={formatAttendance(summary.bookings.avgAttendanceRate)}
            />
          </SectionBlock>
        </div>
      )}
    </div>
  );
}
