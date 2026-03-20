'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/src/i18n/navigation';
import { AppLanguageSwitcher } from '@/src/components/AppLanguageSwitcher';
import { getApi } from '@/src/lib/api';
import {
  getGymAdminSidebarVisibility,
  rolesFromWhoami,
  type GymNavKey,
} from '@/src/features/gym-admin/navVisibility';
import type { WhoamiResponse } from '@myclup/contracts/auth';

type Props = {
  children: React.ReactNode;
};

const NAV_ORDER: { key: GymNavKey; href: string }[] = [
  { key: 'dashboard', href: '/' },
  { key: 'members', href: '/members' },
  { key: 'schedule', href: '/schedule' },
  { key: 'chat', href: '/chat' },
  { key: 'membershipPlans', href: '/membership-plans' },
  { key: 'billing', href: '/billing' },
  { key: 'campaigns', href: '/campaigns' },
  { key: 'reports', href: '/reports' },
  { key: 'listing', href: '/listing' },
];

export function GymAdminShell({ children }: Props) {
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [whoami, setWhoami] = useState<WhoamiResponse | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const skipAuth = pathname?.includes('/dev-login') ?? false;

  useEffect(() => {
    if (skipAuth) {
      setAuthReady(true);
      return;
    }

    let cancelled = false;
    void getApi()
      .auth.whoami()
      .then((res) => {
        if (!cancelled) {
          setWhoami(res as WhoamiResponse);
          setAuthReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          router.replace(`/dev-login`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [skipAuth, router]);

  const visibility = useMemo(() => {
    const roles = whoami ? rolesFromWhoami(whoami.roles) : [];
    return getGymAdminSidebarVisibility(roles);
  }, [whoami]);

  const linkLabel = (key: GymNavKey) => t(`gymAdminWeb.sidebar.${key}`);

  const linkStyle = (href: string) => {
    const active = href === '/' ? pathname === '/' : pathname?.startsWith(href);
    return {
      display: 'block',
      padding: '0.55rem 0.85rem',
      textDecoration: 'none',
      color: active ? '#0f766e' : '#334155',
      fontWeight: active ? 700 : 500,
      borderRadius: 10,
      background: active ? 'rgba(15,118,110,0.1)' : 'transparent',
      fontSize: '0.95rem',
    } as const;
  };

  if (skipAuth) {
    return <>{children}</>;
  }

  if (!authReady) {
    return (
      <div
        style={{
          minHeight: '50vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'sans-serif',
          color: '#475569',
        }}
      >
        {t('gymAdminWeb.authChecking')}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside
        style={{
          width: 260,
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
            {t('adminShell.eyebrow')}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: 6 }}>
            {t('gymAdminWeb.productName')}
          </div>
          {whoami ? (
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 8 }}>
              {whoami.profile.displayName}
            </div>
          ) : null}
        </div>

        <nav style={{ display: 'grid', gap: 4 }}>
          {NAV_ORDER.filter((item) => visibility[item.key]).map((item) => (
            <Link key={item.key} href={item.href} style={linkStyle(item.href)}>
              {linkLabel(item.key)}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'grid', gap: 12, padding: '0 0.25rem' }}>
          {process.env.NODE_ENV === 'development' ? (
            <Link href="/dev-login" style={{ ...linkStyle('/dev-login'), fontSize: '0.85rem' }}>
              {t('gymAdminWeb.devLoginNav')}
            </Link>
          ) : null}
          <AppLanguageSwitcher />
        </div>
      </aside>
      <div style={{ flex: 1, minWidth: 0, background: '#ffffff' }}>{children}</div>
    </div>
  );
}
