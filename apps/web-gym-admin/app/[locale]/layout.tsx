import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/src/i18n/routing';
import { AppLanguageSwitcher } from '@/src/components/AppLanguageSwitcher';
import { ChatApiProvider } from '@/src/contexts/ChatApiContext';
import { ChatNav } from '@/src/components/ChatNav';

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
  const t = await getTranslations('common');

  return (
    <NextIntlClientProvider messages={messages}>
      <ChatApiProvider>
        <header
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #dbe4ee',
            background:
              'linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.94) 100%)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'grid', gap: '0.2rem' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                  fontWeight: 700,
                }}
              >
                {t('adminShell.eyebrow')}
              </span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                {t('adminShell.title')}
              </div>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}
            >
              <ChatNav />
              <AppLanguageSwitcher />
            </div>
          </div>
        </header>
        <>{children}</>
      </ChatApiProvider>
    </NextIntlClientProvider>
  );
}
