/**
 * API client for web-gym-admin.
 *
 * Uses fetch to call BFF routes. Same-origin requests include cookies.
 * TODO: Migrate to @myclup/api-client when it supports path/query params and templates.
 */

import { chatApi } from './chat-api';
import { withDevAccessToken } from './devAccessToken';

const getBaseUrl = () =>
  typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? '');

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: withDevAccessToken(init?.headers),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

type WhoamiResponse = {
  user: { id: string };
  profile: unknown;
  tenantScope: { gymId: string; branchId: string | null };
  roles: unknown[];
};

const api = {
  auth: {
    async whoami(): Promise<WhoamiResponse> {
      return fetchJson<WhoamiResponse>(`${getBaseUrl()}/api/v1/auth/whoami`);
    },
  },
  chat: chatApi,
};

export function getApi() {
  return api;
}
