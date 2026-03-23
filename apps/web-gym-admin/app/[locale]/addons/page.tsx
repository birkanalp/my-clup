import { setRequestLocale } from 'next-intl/server';
import { AddonsWorkspace } from '@/src/features/addons/AddonsWorkspace';

type Props = { params: Promise<{ locale: string }> };

export default async function AddonsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AddonsWorkspace />;
}
