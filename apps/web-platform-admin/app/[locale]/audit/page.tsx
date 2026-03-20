import { PlatformStubPage } from '@/src/components/PlatformStubPage';

type Props = { params: Promise<{ locale: string }> };

export default async function AuditPage({ params }: Props) {
  return await PlatformStubPage({
    params,
    titleKey: 'platformAdminWeb.auditPage.title',
    subtitleKey: 'platformAdminWeb.auditPage.subtitle',
  });
}
