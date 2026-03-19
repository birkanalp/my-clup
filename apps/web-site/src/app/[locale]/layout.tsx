import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myclup.com';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'common' });
  const baseUrl = getBaseUrl();

  const canonicalPath = `/${locale}`;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  const alternateLanguages: Record<string, string> = {};
  for (const loc of routing.locales) {
    alternateLanguages[loc] = `${baseUrl}/${loc}`;
  }

  return {
    title: t('meta.siteTitle'),
    description: t('meta.siteDescription'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'x-default': `${baseUrl}/${routing.defaultLocale}`,
        ...alternateLanguages,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <header className="border-b border-gray-200 px-4 py-3">
        <LocaleSwitcher />
      </header>
      <main className="min-h-screen">{children}</main>
    </NextIntlClientProvider>
  );
}
