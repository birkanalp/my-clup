import { setRequestLocale } from 'next-intl/server';
import { CampaignsWorkspace } from '@/src/features/campaigns/CampaignsWorkspace';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CampaignsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CampaignsWorkspace />;
}
