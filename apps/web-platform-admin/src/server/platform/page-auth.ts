import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requirePlatformOperator } from '@/src/server/platform/gate';

/** Ensures the current request has a platform role; otherwise redirects to sign-in. */
export async function assertPlatformPageAuth(locale: string): Promise<void> {
  const h = await headers();
  const gate = await requirePlatformOperator({ headers: h });
  if (!gate.ok) {
    redirect(`/${locale}/sign-in`);
  }
}
