import { setRequestLocale, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';

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
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/contact"
          className="rounded-full bg-teal-700 px-5 py-2.5 font-semibold text-white hover:bg-teal-800"
        >
          {t('publicSite.homeCta')}
        </Link>
        <Link
          href="/about"
          className="rounded-full border border-gray-300 px-5 py-2.5 font-semibold text-gray-800 hover:border-teal-600"
        >
          {t('publicSite.nav.about')}
        </Link>
      </div>
    </div>
  );
}
