import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getPlatformConversationsSummary } from '@/src/server/platform/data';
import { assertPlatformPageAuth } from '@/src/server/platform/page-auth';

type Props = { params: Promise<{ locale: string }> };

export default async function ModerationPage({ params }: Props) {
  const { locale } = await params;
  await assertPlatformPageAuth(locale);
  setRequestLocale(locale);
  const t = await getTranslations('common');
  const dp = (key: string) => t(`platformAdminWeb.dataPreview.${key}`);
  const { conversations_total } = await getPlatformConversationsSummary();

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{t('platformAdminWeb.moderationPage.title')}</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>{t('platformAdminWeb.moderationPage.subtitle')}</p>
        <p style={{ marginTop: '1.25rem', color: '#0f172a', fontWeight: 600 }}>
          {dp('moderationSummary')}: {conversations_total}
        </p>
      </div>
    </main>
  );
}
