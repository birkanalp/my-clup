import { NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/i18n/navigation';
import { buildPublicMetadata } from '@/lib/siteMetadata';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    pathSuffix: '',
    titleKey: 'meta.siteTitle',
    descriptionKey: 'meta.siteDescription',
  });
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <NextIntlClientProvider messages={messages}>
      <header className="border-b border-gray-200 px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap gap-3 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-teal-700">
              {t('publicSite.nav.home')}
            </Link>
            <Link href="/about" className="hover:text-teal-700">
              {t('publicSite.nav.about')}
            </Link>
            <Link href="/contact" className="hover:text-teal-700">
              {t('publicSite.nav.contact')}
            </Link>
            <Link href="/discover" className="hover:text-teal-700">
              {t('discoveryWeb.title')}
            </Link>
            <Link href="/legal/privacy" className="hover:text-teal-700">
              {t('publicSite.nav.privacy')}
            </Link>
            <Link href="/legal/terms" className="hover:text-teal-700">
              {t('publicSite.nav.terms')}
            </Link>
          </nav>
          <LocaleSwitcher />
        </div>
      </header>
      <main className="min-h-screen">{children}</main>
    </NextIntlClientProvider>
  );
}
