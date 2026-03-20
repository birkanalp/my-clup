import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { buildPublicMetadata } from '@/lib/siteMetadata';
import { LeadCaptureForm } from '@/components/LeadCaptureForm';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    pathSuffix: '/contact',
    titleKey: 'publicSite.contact.title',
    descriptionKey: 'publicSite.contact.subtitle',
  });
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return null;
  }
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 font-sans">
      <h1 className="text-3xl font-bold text-gray-900">{t('publicSite.contact.title')}</h1>
      <p className="mt-4 text-lg text-gray-600">{t('publicSite.contact.subtitle')}</p>
      <LeadCaptureForm />
    </div>
  );
}
