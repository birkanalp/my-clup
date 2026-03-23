import { setRequestLocale } from 'next-intl/server';
import { ListingWorkspace } from '@/src/features/listing/ListingWorkspace';

type Props = { params: Promise<{ locale: string }> };

export default async function ListingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ListingWorkspace />;
}
