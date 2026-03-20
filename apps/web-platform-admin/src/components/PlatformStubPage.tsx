import { setRequestLocale, getTranslations } from 'next-intl/server';

type StubProps = {
  params: Promise<{ locale: string }>;
  titleKey: string;
  subtitleKey: string;
};

export async function PlatformStubPage({ params, titleKey, subtitleKey }: StubProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{t(titleKey)}</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>{t(subtitleKey)}</p>
      </div>
    </main>
  );
}
