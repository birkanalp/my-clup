/**
 * @myclup/api-client — Shared typed API client for all product surfaces.
 *
 * Web and mobile apps must use this package for BFF calls. No app may introduce
 * a second network client.
 *
 * Auth configuration:
 *   const api = createApi({
 *     baseUrl: process.env.NEXT_PUBLIC_API_URL,
 *     getAuthHeaders: async () => {
 *       const { data } = await supabase.auth.getSession();
 *       const token = data.session?.access_token;
 *       return token ? { Authorization: `Bearer ${token}` } : {};
 *     },
 *   });
 *   const user = await api.auth.whoami();
 */
export {
  createApiClient,
  ApiError,
  type ApiClientConfig,
  type ApiContract,
  type RequestOptions,
} from './client';
export { createHealthApi } from './health';
export { createAuthApi } from './auth';
export { createChatApi } from './chat';
export { createBookingsApi } from './bookings';
export { createMembershipApi } from './membership';
export type { PingResponse } from '@myclup/contracts/health';
export type {
  WhoamiResponse,
  SessionResponse,
  ProfilePatchRequest,
  ProfilePatchResponse,
} from '@myclup/contracts/auth';
export type {
  AssignConversationInput,
  Conversation,
  ConversationAssignment,
  CreateConversationInput,
  CreateMessageInput,
  CursorPageParams,
  CursorPageResult,
  GetConversationResponse,
  Message,
  MessageReceiptUpdate,
  TypingState,
} from '@myclup/contracts/chat';
export type {
  BookingRecord,
  BookingSession,
  CancelBookingRequest,
  CancelBookingResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  InstructorAvailability,
  JoinWaitlistRequest,
  JoinWaitlistResponse,
  ListBookingsRequest,
  ListBookingsResponse,
  ListBookingSessionsRequest,
  ListBookingSessionsResponse,
  ListInstructorAvailabilityRequest,
  ListInstructorAvailabilityResponse,
  UpdateAttendanceRequest,
  UpdateAttendanceResponse,
  WaitlistEntry,
} from '@myclup/contracts/bookings';
export type {
  CancelMembershipRequest,
  CancelMembershipResponse,
  FreezeMembershipRequest,
  FreezeMembershipResponse,
  GetMembershipInstanceResponse,
  ListMembershipInstancesRequest,
  ListMembershipInstancesResponse,
  ListMembershipPlansRequest,
  ListMembershipPlansResponse,
  MembershipInstance,
  MembershipPlan,
  RenewMembershipRequest,
  RenewMembershipResponse,
  ValidateMembershipAccessRequest,
  ValidateMembershipAccessResponse,
} from '@myclup/contracts/membership';
export type {
  Invoice,
  ListInvoicesRequest,
  ListInvoicesResponse,
  ListPaymentsRequest,
  ListPaymentsResponse,
  Payment,
} from '@myclup/contracts/billing';

import { createApiClient } from './client';
import { createHealthApi } from './health';
import { createAuthApi } from './auth';
import { createChatApi } from './chat';
import { createBookingsApi } from './bookings';
import { createMembershipApi } from './membership';
import type { ApiClientConfig } from './client';

/**
 * Creates the full API surface with base URL and optional headers.
 * Use this in web and mobile apps to get typed domain methods.
 *
 * @example
 * const api = createApi({
 *   baseUrl: "https://api.example.com",
 *   getAuthHeaders: async () => ({ Authorization: `Bearer ${token}` }),
 * });
 * const result = await api.health.ping();
 * const user = await api.auth.whoami();
 * const conversations = await api.chat.conversations.list();
 */
export function createApi(config: ApiClientConfig) {
  const client = createApiClient(config);
  return {
    health: createHealthApi(client.request),
    auth: createAuthApi(client.request),
    chat: createChatApi(client.request),
    bookings: createBookingsApi(client.request),
    membership: createMembershipApi(client.request),
  };
}
