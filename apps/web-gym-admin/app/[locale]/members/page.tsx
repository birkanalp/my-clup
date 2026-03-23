import { setRequestLocale } from 'next-intl/server';
import { MembersWorkspace } from '@/src/features/members/MembersWorkspace';

type Props = { params: Promise<{ locale: string }> };

export default async function MembersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MembersWorkspace />;
}
