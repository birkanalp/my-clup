import { PlatformStubPage } from '@/src/components/PlatformStubPage';

type Props = { params: Promise<{ locale: string }> };

export default async function SupportPage({ params }: Props) {
  return await PlatformStubPage({
    params,
    titleKey: 'platformAdminWeb.supportPage.title',
    subtitleKey: 'platformAdminWeb.supportPage.subtitle',
  });
}
