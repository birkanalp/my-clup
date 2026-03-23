import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PlatformPreviewTable } from '@/src/components/PlatformPreviewTable';
import { listRecentAuditEvents } from '@/src/server/platform/data';
import { assertPlatformPageAuth } from '@/src/server/platform/page-auth';

type Props = { params: Promise<{ locale: string }> };

export default async function AuditPage({ params }: Props) {
  const { locale } = await params;
  await assertPlatformPageAuth(locale);
  setRequestLocale(locale);
  const t = await getTranslations('common');
  const dp = (key: string) => t(`platformAdminWeb.dataPreview.${key}`);
  const { events } = await listRecentAuditEvents();

  const rows = events.map((e) => ({
    time: e.created_at.slice(0, 19).replace('T', ' '),
    eventType: e.event_type,
    actor: e.actor_id ?? '—',
    target: `${e.target_type}${e.target_id ? `:${e.target_id.slice(0, 8)}…` : ''}`,
  }));

  const columns = [
    { key: 'time', label: dp('time') },
    { key: 'eventType', label: dp('eventType') },
    { key: 'actor', label: dp('actor') },
    { key: 'target', label: dp('target') },
  ];

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{t('platformAdminWeb.auditPage.title')}</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>{t('platformAdminWeb.auditPage.subtitle')}</p>
        <PlatformPreviewTable columns={columns} rows={rows} emptyLabel={dp('empty')} />
      </div>
    </main>
  );
}
