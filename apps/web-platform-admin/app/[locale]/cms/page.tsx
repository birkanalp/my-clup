import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getPlatformConversationsSummary } from '@/src/server/platform/data';
import { assertPlatformPageAuth } from '@/src/server/platform/page-auth';

type Props = { params: Promise<{ locale: string }> };

export default async function CmsPage({ params }: Props) {
  const { locale } = await params;
  await assertPlatformPageAuth(locale);
  setRequestLocale(locale);
  const t = await getTranslations('common');
  const dp = (key: string) => t(`platformAdminWeb.dataPreview.${key}`);
  const { conversations_total } = await getPlatformConversationsSummary();

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{t('platformAdminWeb.cmsPage.title')}</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>{t('platformAdminWeb.cmsPage.subtitle')}</p>
        <p style={{ color: '#64748b', marginTop: '1rem', whiteSpace: 'pre-line' }}>
          {t('platformAdminWeb.cmsPage.body')}
        </p>
        <p style={{ marginTop: '1.25rem', color: '#0f172a', fontWeight: 600 }}>
          {dp('cmsStatLabel')}: {conversations_total}
        </p>
      </div>
    </main>
  );
}
