'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/src/i18n/navigation';

export function ChatNav() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const isChat = pathname?.startsWith('/chat');
  const isSchedule = pathname?.startsWith('/schedule');
  const isHome = !isChat && !isSchedule;

  const linkStyle = (active: boolean) =>
    ({
      padding: '0.45rem 0.85rem',
      textDecoration: 'none',
      color: active ? '#0f172a' : '#475569',
      fontWeight: active ? 700 : 500,
      borderRadius: 999,
      background: active ? '#e2e8f0' : 'transparent',
    }) as const;

  return (
    <nav style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Link href="/" style={linkStyle(isHome)}>
        {t('adminShell.home')}
      </Link>
      <Link href="/schedule" style={linkStyle(isSchedule)}>
        {t('adminShell.schedule')}
      </Link>
      <Link href="/chat" style={linkStyle(isChat)}>
        {t('adminShell.chat')}
      </Link>
    </nav>
  );
}
