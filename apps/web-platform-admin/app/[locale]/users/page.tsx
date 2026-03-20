import { PlatformStubPage } from '@/src/components/PlatformStubPage';

type Props = { params: Promise<{ locale: string }> };

export default async function UsersPage({ params }: Props) {
  return await PlatformStubPage({
    params,
    titleKey: 'platformAdminWeb.usersPage.title',
    subtitleKey: 'platformAdminWeb.usersPage.subtitle',
  });
}
