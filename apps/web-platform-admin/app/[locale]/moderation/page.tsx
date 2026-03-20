import { PlatformStubPage } from '@/src/components/PlatformStubPage';

type Props = { params: Promise<{ locale: string }> };

export default async function ModerationPage({ params }: Props) {
  return await PlatformStubPage({
    params,
    titleKey: 'platformAdminWeb.moderationPage.title',
    subtitleKey: 'platformAdminWeb.moderationPage.subtitle',
  });
}
