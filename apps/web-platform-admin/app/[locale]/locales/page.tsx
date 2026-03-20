import { PlatformStubPage } from '@/src/components/PlatformStubPage';

type Props = { params: Promise<{ locale: string }> };

export default async function LocalesPage({ params }: Props) {
  return await PlatformStubPage({
    params,
    titleKey: 'platformAdminWeb.localesPage.title',
    subtitleKey: 'platformAdminWeb.localesPage.subtitle',
  });
}
