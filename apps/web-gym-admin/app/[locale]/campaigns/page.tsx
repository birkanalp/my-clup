import { setRequestLocale, getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CampaignsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{t('gymAdminWeb.campaignsPage.title')}</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>
          {t('gymAdminWeb.campaignsPage.subtitle')}
        </p>
        <p style={{ color: '#64748b', marginTop: '1.25rem' }}>
          {t('gymAdminWeb.campaignsPage.placeholder')}
        </p>
      </div>
    </main>
  );
}
