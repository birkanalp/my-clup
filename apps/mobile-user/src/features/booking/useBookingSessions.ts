import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BookingSession } from '@myclup/contracts/bookings';
import { api } from '../../lib/api';
import { resolveSupportedLocale } from '../membership/helpers';

export function useBookingSessions() {
  const { i18n } = useTranslation('common');
  const locale = useMemo(
    () => resolveSupportedLocale(i18n.resolvedLanguage),
    [i18n.resolvedLanguage]
  );
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.bookings.listSessions({ limit: 30 });
      setSessions(res.items);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('bookings_load_failed'));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { sessions, loading, error, refresh: load, locale };
}
