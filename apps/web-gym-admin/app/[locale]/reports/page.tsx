import { setRequestLocale } from 'next-intl/server';
import { ReportsWorkspace } from '@/src/features/reports/ReportsWorkspace';

type Props = { params: Promise<{ locale: string }> };

export default async function ReportsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ReportsWorkspace />;
}
