import { useEffect, useState } from 'react';
import type { WhoamiResponse } from '@myclup/contracts/auth';
import { api } from '../../lib/api';

export function useStaffWhoami(enabled: boolean): {
  whoami: WhoamiResponse | null;
  loading: boolean;
  error: Error | null;
} {
  const [whoami, setWhoami] = useState<WhoamiResponse | null>(null);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setWhoami(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void api.auth
      .whoami()
      .then((res) => {
        if (!cancelled) {
          setWhoami(res);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setWhoami(null);
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { whoami, loading, error };
}
