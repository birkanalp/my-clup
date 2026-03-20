import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/src/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('common');
  const cardStyle = {
    padding: '1.25rem',
    borderRadius: 20,
    textDecoration: 'none',
    color: '#0f172a',
  } as const;

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'grid',
          gap: '1rem',
        }}
      >
        <section
          style={{
            padding: '1.5rem',
            borderRadius: 24,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {t('adminShell.eyebrow')}
          </div>
          <h1 style={{ margin: '0.65rem 0 0.5rem', fontSize: '2rem' }}>{t('adminShell.title')}</h1>
          <p style={{ margin: 0, maxWidth: 720, color: '#cbd5e1' }}>{t('adminShell.subtitle')}</p>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
          }}
        >
          <Link
            href="/schedule"
            style={{
              ...cardStyle,
              border: '1px solid #dbe4ee',
              background: '#ffffff',
            }}
          >
            <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('adminShell.schedule')}</div>
            <p style={{ margin: '0.4rem 0 0', color: '#475569' }}>
              {t('scheduleWorkspace.heroSubtitle')}
            </p>
          </Link>

          <Link
            href="/chat"
            style={{
              ...cardStyle,
              border: '1px solid #dbe4ee',
              background: '#ffffff',
            }}
          >
            <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('adminShell.chat')}</div>
            <p style={{ margin: '0.4rem 0 0', color: '#475569' }}>{t('adminShell.chatSubtitle')}</p>
          </Link>

          {process.env.NODE_ENV === 'development' ? (
            <Link
              href="/dev-login"
              style={{
                ...cardStyle,
                border: '1px dashed #0f766e',
                background: '#f0fdfa',
              }}
            >
              <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>Local dev login</div>
              <p style={{ margin: '0.4rem 0 0', color: '#475569' }}>
                Mint a local bearer token for the gym-admin BFF during development.
              </p>
            </Link>
          ) : null}
        </section>
      </div>
    </main>
  );
}
