import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('common');
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>MyClup Gym Admin</h1>
      <p>{t('label.loading')}</p>
      <p>API: GET /api/v1/health/ping</p>
      {process.env.NODE_ENV === 'development' ? (
        <p>
          <Link href={`/${locale}/dev-login`}>Open local dev login</Link>
        </p>
      ) : null}
    </main>
  );
}
