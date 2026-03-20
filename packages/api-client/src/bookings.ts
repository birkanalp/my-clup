import type {
  BookingSession,
  CancelBookingRequest,
  CancelBookingResponse,
  CreateBookingRequest,
  CreateBookingResponse,
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
} from '@myclup/contracts/bookings';
import {
  cancelBookingContract,
  createBookingContract,
  getBookingSessionContract,
  joinWaitlistContract,
  listBookingsContract,
  listBookingSessionsContract,
  listInstructorAvailabilityContract,
  updateAttendanceContract,
} from '@myclup/contracts/bookings';
import type { ApiContract, RequestOptions } from './client';

type RequestFn = <T>(
  contract: ApiContract<unknown, T>,
  requestData?: unknown,
  options?: RequestOptions
) => Promise<T>;

export function createBookingsApi(request: RequestFn) {
  return {
    async listSessions(params?: ListBookingSessionsRequest): Promise<ListBookingSessionsResponse> {
      return request(
        listBookingSessionsContract as ApiContract<
          ListBookingSessionsRequest,
          ListBookingSessionsResponse
        >,
        params
      );
    },

    async getSession(id: string): Promise<BookingSession> {
      return request(getBookingSessionContract as ApiContract<unknown, BookingSession>, undefined, {
        pathParams: { id },
      });
    },

    async listBookings(params?: ListBookingsRequest): Promise<ListBookingsResponse> {
      return request(
        listBookingsContract as ApiContract<ListBookingsRequest, ListBookingsResponse>,
        params
      );
    },

    async createBooking(input: CreateBookingRequest): Promise<CreateBookingResponse> {
      return request(
        createBookingContract as ApiContract<CreateBookingRequest, CreateBookingResponse>,
        input
      );
    },

    async cancelBooking(id: string, input: CancelBookingRequest): Promise<CancelBookingResponse> {
      return request(
        cancelBookingContract as ApiContract<CancelBookingRequest, CancelBookingResponse>,
        input,
        { pathParams: { id } }
      );
    },

    async joinWaitlist(input: JoinWaitlistRequest): Promise<JoinWaitlistResponse> {
      return request(
        joinWaitlistContract as ApiContract<JoinWaitlistRequest, JoinWaitlistResponse>,
        input
      );
    },

    async updateAttendance(
      id: string,
      input: UpdateAttendanceRequest
    ): Promise<UpdateAttendanceResponse> {
      return request(
        updateAttendanceContract as ApiContract<UpdateAttendanceRequest, UpdateAttendanceResponse>,
        input,
        { pathParams: { id } }
      );
    },

    async listInstructorAvailability(
      params?: ListInstructorAvailabilityRequest
    ): Promise<ListInstructorAvailabilityResponse> {
      return request(
        listInstructorAvailabilityContract as ApiContract<
          ListInstructorAvailabilityRequest,
          ListInstructorAvailabilityResponse
        >,
        params
      );
    },
  };
}
