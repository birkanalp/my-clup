import { createApi } from '@myclup/api-client';
import type {
  ListCampaignsResponse,
  CreateCampaignRequest,
  CreateCampaignResponse,
  SendCampaignResponse,
} from '@myclup/contracts/campaigns';
import type { ReportSummaryResponse } from '@myclup/contracts/reports';
import type {
  GetListingResponse,
  UpdateListingRequest,
  UpdateListingResponse,
  UpdateListingVisibilityResponse,
} from '@myclup/contracts/listing';
import type { ListAddonsResponse } from '@myclup/contracts/addons';
import type {
  ListMembersResponse,
  GetMemberResponse,
  UpdateMemberStatusRequest,
  UpdateMemberStatusResponse,
} from '@myclup/contracts/members';
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
  campaigns: {
    async list(): Promise<ListCampaignsResponse> {
      return fetchJson<ListCampaignsResponse>(`${getBaseUrl()}/api/v1/campaigns`);
    },
    async create(input: CreateCampaignRequest): Promise<CreateCampaignResponse> {
      return fetchJson<CreateCampaignResponse>(`${getBaseUrl()}/api/v1/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    },
    async send(id: string, locale: string): Promise<SendCampaignResponse> {
      return fetchJson<SendCampaignResponse>(`${getBaseUrl()}/api/v1/campaigns/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      });
    },
  },
  reports: {
    async getSummary(from: string, to: string): Promise<ReportSummaryResponse> {
      const params = new URLSearchParams({ from, to });
      return fetchJson<ReportSummaryResponse>(`${getBaseUrl()}/api/v1/reports/summary?${params}`);
    },
  },
  listing: {
    async get(): Promise<GetListingResponse> {
      return fetchJson<GetListingResponse>(`${getBaseUrl()}/api/v1/listing`);
    },
    async update(input: UpdateListingRequest): Promise<UpdateListingResponse> {
      return fetchJson<UpdateListingResponse>(`${getBaseUrl()}/api/v1/listing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
    },
    async setVisibility(isPublished: boolean): Promise<UpdateListingVisibilityResponse> {
      return fetchJson<UpdateListingVisibilityResponse>(`${getBaseUrl()}/api/v1/listing/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished }),
      });
    },
  },
  addons: {
    async list(): Promise<ListAddonsResponse> {
      return fetchJson<ListAddonsResponse>(`${getBaseUrl()}/api/v1/addons`);
    },
  },
  members: {
    async list(params?: {
      status?: string;
      search?: string;
      cursor?: string;
    }): Promise<ListMembersResponse> {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      if (params?.cursor) query.set('cursor', params.cursor);
      const qs = query.toString();
      return fetchJson<ListMembersResponse>(
        `${getBaseUrl()}/api/v1/members${qs ? `?${qs}` : ''}`
      );
    },
    async get(memberId: string): Promise<GetMemberResponse> {
      return fetchJson<GetMemberResponse>(`${getBaseUrl()}/api/v1/members/${memberId}`);
    },
    async updateStatus(
      memberId: string,
      input: UpdateMemberStatusRequest
    ): Promise<UpdateMemberStatusResponse> {
      return fetchJson<UpdateMemberStatusResponse>(
        `${getBaseUrl()}/api/v1/members/${memberId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      );
    },
  },
};

export function getApi() {
  return api;
}
