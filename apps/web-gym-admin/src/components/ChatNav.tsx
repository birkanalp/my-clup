'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/src/i18n/navigation';

export function ChatNav() {
  const t = useTranslations('chat');
  const pathname = usePathname();
  const isChat = pathname?.startsWith('/chat');

  return (
    <nav style={{ display: 'flex', gap: '0.5rem' }}>
      <Link
        href="/"
        style={{
          padding: '0.35rem 0.75rem',
          textDecoration: 'none',
          color: isChat ? '#666' : '#111',
          fontWeight: isChat ? 400 : 600,
        }}
      >
        Home
      </Link>
      <Link
        href="/chat"
        style={{
          padding: '0.35rem 0.75rem',
          textDecoration: 'none',
          color: isChat ? '#111' : '#666',
          fontWeight: isChat ? 600 : 400,
        }}
      >
        {t('nav.chatCenter')}
      </Link>
    </nav>
  );
}
