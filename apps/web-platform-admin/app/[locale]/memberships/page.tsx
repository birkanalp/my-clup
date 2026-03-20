import { PlatformStubPage } from '@/src/components/PlatformStubPage';

type Props = { params: Promise<{ locale: string }> };

export default async function MembershipsOversightPage({ params }: Props) {
  return await PlatformStubPage({
    params,
    titleKey: 'platformAdminWeb.membershipsOversightPage.title',
    subtitleKey: 'platformAdminWeb.membershipsOversightPage.subtitle',
    bodyKey: 'platformAdminWeb.membershipsOversightPage.body',
  });
}
