/**
 * Hook to get current user ID from Supabase session.
 */
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function useCurrentUser(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      if (!supabase) {
        setUserId(null);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const id = data.session?.user?.id ?? null;
      if (mounted) setUserId(id);
    }

    fetchUser();

    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange(() => {
      fetchUser();
    }) ?? { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return userId;
}
