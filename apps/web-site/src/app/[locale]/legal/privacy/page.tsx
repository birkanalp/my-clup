import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { buildPublicMetadata } from '@/lib/siteMetadata';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    pathSuffix: '/legal/privacy',
    titleKey: 'publicSite.legal.privacyTitle',
    descriptionKey: 'publicSite.legal.privacyBody',
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return null;
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <article className="mx-auto max-w-3xl px-6 py-12 font-sans">
      <h1 className="text-3xl font-bold text-gray-900">{t('publicSite.legal.privacyTitle')}</h1>
      <p className="mt-6 whitespace-pre-wrap text-gray-700">{t('publicSite.legal.privacyBody')}</p>
    </article>
  );
}
