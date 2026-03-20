import { PlatformStubPage } from '@/src/components/PlatformStubPage';

type Props = { params: Promise<{ locale: string }> };

export default async function CmsPage({ params }: Props) {
  return await PlatformStubPage({
    params,
    titleKey: 'platformAdminWeb.cmsPage.title',
    subtitleKey: 'platformAdminWeb.cmsPage.subtitle',
    bodyKey: 'platformAdminWeb.cmsPage.body',
  });
}
