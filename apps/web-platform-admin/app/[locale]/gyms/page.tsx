import { setRequestLocale, getTranslations } from 'next-intl/server';
import { PlatformPreviewTable } from '@/src/components/PlatformPreviewTable';
import { listPlatformGyms } from '@/src/server/platform/data';
import { assertPlatformPageAuth } from '@/src/server/platform/page-auth';

type Props = { params: Promise<{ locale: string }> };

export default async function GymsPage({ params }: Props) {
  const { locale } = await params;
  await assertPlatformPageAuth(locale);
  setRequestLocale(locale);
  const t = await getTranslations('common');
  const dp = (key: string) => t(`platformAdminWeb.dataPreview.${key}`);
  const { gyms } = await listPlatformGyms();

  const rows = gyms.map((g) => ({
    name: g.name,
    slug: g.slug,
    active: g.is_active ? dp('yes') : dp('no'),
    published: g.is_published ? dp('yes') : dp('no'),
    city: g.city ?? '—',
    country: g.country ?? '—',
    created: g.created_at.slice(0, 10),
  }));

  const columns = [
    { key: 'name', label: dp('name') },
    { key: 'slug', label: dp('slug') },
    { key: 'active', label: dp('active') },
    { key: 'published', label: dp('published') },
    { key: 'city', label: dp('city') },
    { key: 'country', label: dp('country') },
    { key: 'created', label: dp('createdAt') },
  ];

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{t('platformAdminWeb.gymsPage.title')}</h1>
        <p style={{ color: '#475569', marginTop: '0.5rem' }}>{t('platformAdminWeb.gymsPage.subtitle')}</p>
        <PlatformPreviewTable columns={columns} rows={rows} emptyLabel={dp('empty')} />
      </div>
    </main>
  );
}
