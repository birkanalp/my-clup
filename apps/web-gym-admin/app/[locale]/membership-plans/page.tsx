import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MembershipPlansPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('membership');
  const tCommon = await getTranslations('common');

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <p style={{ marginBottom: '0.75rem' }}>
        <Link href="/" style={{ color: '#0f766e', textDecoration: 'none', fontWeight: 600 }}>
          {tCommon('button.back')} · {tCommon('adminShell.home')}
        </Link>
      </p>
      <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>{t('gymAdmin.plans.title')}</h1>
      <p style={{ margin: '0 0 1.25rem', color: '#475569' }}>{t('gymAdmin.plans.subtitle')}</p>
      <section
        style={{
          padding: '1.25rem',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          background: '#f8fafc',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>
          {t('gymAdmin.plans.cardTitle')}
        </div>
        <p style={{ margin: 0, color: '#64748b' }}>{t('gymAdmin.plans.placeholder')}</p>
      </section>
    </main>
  );
}
