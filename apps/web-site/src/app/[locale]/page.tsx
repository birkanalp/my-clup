import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return null;
  }
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 font-sans">
      <h1 className="text-3xl font-bold text-gray-900">{t('meta.siteTitle')}</h1>
      <p className="mt-4 text-lg text-gray-600">{t('meta.siteDescription')}</p>
      <p className="mt-6 text-sm text-gray-500">{t('label.loading')}</p>
    </div>
  );
}
