import { PlatformStubPage } from '@/src/components/PlatformStubPage';

type Props = { params: Promise<{ locale: string }> };

export default async function PlatformBillingPage({ params }: Props) {
  return await PlatformStubPage({
    params,
    titleKey: 'platformAdminWeb.billingPage.title',
    subtitleKey: 'platformAdminWeb.billingPage.subtitle',
  });
}
