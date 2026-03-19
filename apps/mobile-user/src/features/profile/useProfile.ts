import { useCallback, useEffect, useState } from 'react';
import type { ProfilePatchRequest, WhoamiResponse } from '@myclup/api-client';
import { api } from '../../lib/api';

export function useProfile() {
  const [data, setData] = useState<WhoamiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.whoami();
      setData(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error(String(loadError)));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveProfile = useCallback(async (input: ProfilePatchRequest) => {
    setSaving(true);
    setError(null);
    try {
      const updatedProfile = await api.auth.updateProfile(input);
      setData((currentValue) =>
        currentValue
          ? {
              ...currentValue,
              profile: updatedProfile,
            }
          : currentValue
      );

      return updatedProfile;
    } catch (saveError) {
      const normalizedError = saveError instanceof Error ? saveError : new Error(String(saveError));
      setError(normalizedError);
      throw normalizedError;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    data,
    error,
    loading,
    refresh: load,
    saveProfile,
    saving,
  };
}
