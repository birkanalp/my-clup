import { setRequestLocale } from 'next-intl/server';
import { ScheduleWorkspace } from '@/src/features/schedule/ScheduleWorkspace';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SchedulePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main style={{ padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <ScheduleWorkspace />
      </div>
    </main>
  );
}
