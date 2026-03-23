import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PlatformPreviewTable } from '@/src/components/PlatformPreviewTable';
import { getPlatformLocalesSummary } from '@/src/server/platform/data';
import { assertPlatformPageAuth } from '@/src/server/platform/page-auth';

type Props = { params: Promise<{ locale: string }> };

export default async function LocalesPage({ params }: Props) {
  const { locale } = await params;
  await assertPlatformPageAuth(locale);
  setRequestLocale(locale);
  const t = await getTranslations('common');
  const dp = (key: string) => t(`platformAdminWeb.dataPreview.${key}`);
  const { locales } = await getPlatformLocalesSummary();

  const rows = locales.map((row) => ({
    locale: row.locale,
    count: String(row.count),
  }));

  const columnsFixed = [
    { key: 'locale', label: dp('locale') },
    { key: 'count', label: t('platformAdminWeb.localesPage.tableCount') },
  ];

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{t('platformAdminWeb.localesPage.title')}</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>{t('platformAdminWeb.localesPage.subtitle')}</p>
        <p style={{ color: '#64748b', marginTop: '0.75rem' }}>{dp('localeDistribution')}</p>
        <PlatformPreviewTable columns={columnsFixed} rows={rows} emptyLabel={dp('empty')} />
      </div>
    </main>
  );
}
