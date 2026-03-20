import { createApi } from '@myclup/api-client';
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

/** Same-origin BFF fetch with cookies + dev bearer token (localStorage). */
const bffFetch: typeof fetch = (input, init) =>
  fetch(input, {
    credentials: 'include',
    ...init,
    headers: withDevAccessToken(init?.headers),
  });

type WhoamiResponse = {
  user: { id: string };
  profile: unknown;
  tenantScope: { gymId: string; branchId: string | null };
  roles: unknown[];
};

const sharedApi = () =>
  createApi({
    baseUrl: getBaseUrl(),
    fetch: bffFetch,
  });

const api = {
  auth: {
    async whoami(): Promise<WhoamiResponse> {
      return fetchJson<WhoamiResponse>(`${getBaseUrl()}/api/v1/auth/whoami`);
    },
  },
  bookings: {
    listSessions: (...args: Parameters<ReturnType<typeof sharedApi>['bookings']['listSessions']>) =>
      sharedApi().bookings.listSessions(...args),
    getSession: (...args: Parameters<ReturnType<typeof sharedApi>['bookings']['getSession']>) =>
      sharedApi().bookings.getSession(...args),
    listBookings: (...args: Parameters<ReturnType<typeof sharedApi>['bookings']['listBookings']>) =>
      sharedApi().bookings.listBookings(...args),
    cancelBooking: (
      ...args: Parameters<ReturnType<typeof sharedApi>['bookings']['cancelBooking']>
    ) => sharedApi().bookings.cancelBooking(...args),
    updateAttendance: (
      ...args: Parameters<ReturnType<typeof sharedApi>['bookings']['updateAttendance']>
    ) => sharedApi().bookings.updateAttendance(...args),
    listInstructorAvailability: (
      ...args: Parameters<ReturnType<typeof sharedApi>['bookings']['listInstructorAvailability']>
    ) => sharedApi().bookings.listInstructorAvailability(...args),
  },
  chat: chatApi,
};

export function getApi() {
  return api;
}
