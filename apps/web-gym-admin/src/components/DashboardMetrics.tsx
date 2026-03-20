'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ANALYTICS_SCHEMA_VERSION,
  McGa4Event,
  createNoopAnalyticsEmitter,
} from '@myclup/analytics';
import { getApi } from '@/src/lib/api';

export function DashboardMetrics() {
  const t = useTranslations('common');
  const locale = useLocale();
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analytics = createNoopAnalyticsEmitter();
    analytics.track(McGa4Event.screen_view, {
      schema_version: ANALYTICS_SCHEMA_VERSION,
      surface: 'web_gym_admin',
      locale,
      screen_name: 'gym_admin_dashboard',
      screen_class: 'WebGymAdminHome',
    });

    void getApi()
      .bookings.listSessions({ limit: 200 })
      .then((res) => {
        setSessionCount(res.items?.length ?? 0);
        setError(null);
      })
      .catch((e: unknown) => {
        setSessionCount(null);
        setError(e instanceof Error ? e.message : t('gymAdminWeb.metricsError'));
      });
  }, [locale, t]);

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '1.25rem',
      }}
    >
      <div
        style={{
          padding: '1.1rem',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b' }}>
          {t('gymAdminWeb.metrics.sessionsLabel')}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 6, color: '#0f172a' }}>
          {sessionCount === null ? '—' : sessionCount}
        </div>
        {error ? (
          <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: 8 }}>{error}</div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 8 }}>
            {t('gymAdminWeb.metrics.sessionsHint')}
          </div>
        )}
      </div>
    </section>
  );
}
