'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/src/i18n/navigation';
import { AppLanguageSwitcher } from '@/src/components/AppLanguageSwitcher';

const NAV: { href: string; key: string }[] = [
  { href: '/', key: 'dashboard' },
  { href: '/gyms', key: 'gyms' },
  { href: '/users', key: 'users' },
  { href: '/support', key: 'support' },
  { href: '/moderation', key: 'moderation' },
  { href: '/billing', key: 'billing' },
  { href: '/memberships', key: 'memberships' },
  { href: '/cms', key: 'cms' },
  { href: '/locales', key: 'locales' },
  { href: '/audit', key: 'audit' },
];

export function PlatformAdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations('common');
  const pathname = usePathname();

  const linkStyle = (href: string) => {
    const active = href === '/' ? pathname === '/' : pathname?.startsWith(href);
    return {
      display: 'block',
      padding: '0.55rem 0.85rem',
      textDecoration: 'none',
      color: active ? '#1d4ed8' : '#334155',
      fontWeight: active ? 700 : 500,
      borderRadius: 10,
      background: active ? 'rgba(29,78,216,0.08)' : 'transparent',
      fontSize: '0.95rem',
    } as const;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside
        style={{
          width: 270,
          flexShrink: 0,
          borderRight: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem 0.75rem',
          gap: '1rem',
        }}
      >
        <div style={{ padding: '0 0.5rem' }}>
          <div
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#64748b',
              fontWeight: 700,
            }}
          >
            {t('platformAdminWeb.eyebrow')}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
            {t('platformAdminWeb.productName')}
          </div>
        </div>
        <nav style={{ display: 'grid', gap: 4 }}>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} style={linkStyle(item.href)}>
              {t(`platformAdminWeb.sidebar.${item.key}`)}
            </Link>
          ))}
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <AppLanguageSwitcher />
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0, background: '#fff' }}>{children}</div>
    </div>
  );
}
