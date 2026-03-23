import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getPlatformMembershipsSummary } from '@/src/server/platform/data';
import { assertPlatformPageAuth } from '@/src/server/platform/page-auth';

type Props = { params: Promise<{ locale: string }> };

export default async function MembershipsPage({ params }: Props) {
  const { locale } = await params;
  await assertPlatformPageAuth(locale);
  setRequestLocale(locale);
  const t = await getTranslations('common');
  const dp = (key: string) => t(`platformAdminWeb.dataPreview.${key}`);
  const summary = await getPlatformMembershipsSummary();

  const stats = [
    { label: dp('instancesTotal'), value: String(summary.instances_total) },
    { label: dp('instancesActive'), value: String(summary.instances_active) },
    { label: dp('instancesCancelled'), value: String(summary.instances_cancelled) },
  ];

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>
          {t('platformAdminWeb.membershipsOversightPage.title')}
        </h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>
          {t('platformAdminWeb.membershipsOversightPage.subtitle')}
        </p>
        <p style={{ color: '#64748b', marginTop: '1rem', whiteSpace: 'pre-line' }}>
          {t('platformAdminWeb.membershipsOversightPage.body')}
        </p>
        <dl
          style={{
            marginTop: '1.5rem',
            display: 'grid',
            gap: '0.75rem',
            padding: '1rem',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            background: '#f8fafc',
          }}
        >
          {stats.map((s) => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <dt style={{ color: '#64748b', margin: 0 }}>{s.label}</dt>
              <dd style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}
