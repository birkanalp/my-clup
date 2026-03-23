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
  members: {
    listMembers: (...args: Parameters<ReturnType<typeof sharedApi>['members']['listMembers']>) =>
      sharedApi().members.listMembers(...args),
    getMember: (...args: Parameters<ReturnType<typeof sharedApi>['members']['getMember']>) =>
      sharedApi().members.getMember(...args),
    updateMemberStatus: (
      ...args: Parameters<ReturnType<typeof sharedApi>['members']['updateMemberStatus']>
    ) => sharedApi().members.updateMemberStatus(...args),
  },
  membership: {
    listMembershipPlans: (
      ...args: Parameters<ReturnType<typeof sharedApi>['membership']['listMembershipPlans']>
    ) => sharedApi().membership.listMembershipPlans(...args),
    createMembershipPlan: (
      ...args: Parameters<ReturnType<typeof sharedApi>['membership']['createMembershipPlan']>
    ) => sharedApi().membership.createMembershipPlan(...args),
    updateMembershipPlan: (
      ...args: Parameters<ReturnType<typeof sharedApi>['membership']['updateMembershipPlan']>
    ) => sharedApi().membership.updateMembershipPlan(...args),
    deactivateMembershipPlan: (
      ...args: Parameters<ReturnType<typeof sharedApi>['membership']['deactivateMembershipPlan']>
    ) => sharedApi().membership.deactivateMembershipPlan(...args),
  },
  billing: {
    getBillingSummary: (
      ...args: Parameters<ReturnType<typeof sharedApi>['billing']['getBillingSummary']>
    ) => sharedApi().billing.getBillingSummary(...args),
    listInvoices: (...args: Parameters<ReturnType<typeof sharedApi>['billing']['listInvoices']>) =>
      sharedApi().billing.listInvoices(...args),
    getInvoiceDetail: (
      ...args: Parameters<ReturnType<typeof sharedApi>['billing']['getInvoiceDetail']>
    ) => sharedApi().billing.getInvoiceDetail(...args),
    recordInvoicePayment: (
      ...args: Parameters<ReturnType<typeof sharedApi>['billing']['recordInvoicePayment']>
    ) => sharedApi().billing.recordInvoicePayment(...args),
  },
  chat: chatApi,
};

export function getApi() {
  return api;
}
