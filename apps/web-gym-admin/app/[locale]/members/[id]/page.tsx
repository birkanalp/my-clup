import { setRequestLocale } from 'next-intl/server';
import { MemberDetailWorkspace } from '@/src/features/members/MemberDetailWorkspace';

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function MemberDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <MemberDetailWorkspace memberId={id} />;
}
