import { PlatformStubPage } from '@/src/components/PlatformStubPage';

type Props = { params: Promise<{ locale: string }> };

export default async function GymsPage({ params }: Props) {
  return await PlatformStubPage({
    params,
    titleKey: 'platformAdminWeb.gymsPage.title',
    subtitleKey: 'platformAdminWeb.gymsPage.subtitle',
  });
}
