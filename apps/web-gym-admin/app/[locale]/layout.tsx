import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { ChatApiProvider } from '@/src/contexts/ChatApiContext';
import { GymAdminShell } from '@/src/components/GymAdminShell';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
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
      <ChatApiProvider>
        <GymAdminShell>{children}</GymAdminShell>
      </ChatApiProvider>
    </NextIntlClientProvider>
  );
}
