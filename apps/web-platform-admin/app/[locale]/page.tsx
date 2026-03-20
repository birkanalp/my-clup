import { setRequestLocale, getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('common');

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.85rem', margin: 0 }}>{t('platformAdminWeb.dashboardTitle')}</h1>
        <p style={{ color: '#475569', marginTop: '0.65rem', maxWidth: 720 }}>
          {t('platformAdminWeb.dashboardSubtitle')}
        </p>
        <section
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            color: '#475569',
          }}
        >
          {t('platformAdminWeb.metricsPlaceholder')}
        </section>
      </div>
    </main>
  );
}
