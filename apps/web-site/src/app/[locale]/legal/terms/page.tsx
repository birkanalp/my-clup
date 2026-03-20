import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { buildPublicMetadata } from '@/lib/siteMetadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    pathSuffix: '/legal/terms',
    titleKey: 'publicSite.legal.termsTitle',
    descriptionKey: 'publicSite.legal.termsBody',
  });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return null;
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 font-sans">
      <h1 className="text-3xl font-bold text-gray-900">{t('publicSite.legal.termsTitle')}</h1>
      <p className="mt-6 whitespace-pre-wrap text-gray-700">{t('publicSite.legal.termsBody')}</p>
    </article>
  );
}
