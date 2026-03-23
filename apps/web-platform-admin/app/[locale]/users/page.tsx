import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PlatformPreviewTable } from '@/src/components/PlatformPreviewTable';
import { listPlatformUsersWithRoles } from '@/src/server/platform/data';
import { assertPlatformPageAuth } from '@/src/server/platform/page-auth';

type Props = { params: Promise<{ locale: string }> };

export default async function UsersPage({ params }: Props) {
  const { locale } = await params;
  await assertPlatformPageAuth(locale);
  setRequestLocale(locale);
  const t = await getTranslations('common');
  const dp = (key: string) => t(`platformAdminWeb.dataPreview.${key}`);
  const { users } = await listPlatformUsersWithRoles();

  const rows = users.map((u) => ({
    displayName: u.display_name,
    userId: u.user_id,
    locale: u.locale,
    roles: u.roles.map((r) => `${r.role}${r.gym_id ? ` @ ${r.gym_id.slice(0, 8)}…` : ''}`).join('; ') || '—',
  }));

  const columns = [
    { key: 'displayName', label: dp('displayName') },
    { key: 'userId', label: dp('userId') },
    { key: 'locale', label: dp('locale') },
    { key: 'roles', label: dp('roles') },
  ];

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{t('platformAdminWeb.usersPage.title')}</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>{t('platformAdminWeb.usersPage.subtitle')}</p>
        <PlatformPreviewTable columns={columns} rows={rows} emptyLabel={dp('empty')} />
      </div>
    </main>
  );
}
