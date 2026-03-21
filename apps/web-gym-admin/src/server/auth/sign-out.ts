/**
 * Sign-out server module.
 *
 * Clears the Supabase SSR session cookies.
 *
 * ⚠️ SERVER-ONLY: Never import in client components or pages.
 */

import { createAnonSsrServerClient } from '@myclup/supabase';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export async function signOut(): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return;
  }

  const cookieStore = await cookies();

  const client = createAnonSsrServerClient({
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });

  await client.auth.signOut();
}
