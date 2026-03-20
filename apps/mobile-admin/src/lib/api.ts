/**
 * API client for mobile-admin.
 * Uses createApi from api-client with Supabase session for auth headers.
 */
import { createApi } from '@myclup/api-client';
import { supabase } from './supabase';

const baseUrl =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) ||
  'http://localhost:3001';

export const api = createApi({
  baseUrl: String(baseUrl).replace(/\/$/, ''),
  getAuthHeaders: async (): Promise<Record<string, string>> => {
    if (!supabase) return {};
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
