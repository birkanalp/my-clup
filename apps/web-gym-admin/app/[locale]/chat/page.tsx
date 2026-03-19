import { setRequestLocale } from 'next-intl/server';
import { ChatCenter } from '@/src/components/chat/ChatCenter';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ChatPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <ChatCenter />
    </main>
  );
}
