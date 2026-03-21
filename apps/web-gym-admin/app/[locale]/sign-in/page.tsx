import { setRequestLocale } from 'next-intl/server';
import { SignInForm } from '@/src/features/auth/SignInForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SignInPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SignInForm />;
}
