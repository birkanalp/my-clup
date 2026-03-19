import { z } from 'zod';
import {
  CancelBookingRequestSchema,
  CancelBookingResponseSchema,
  CreateBookingRequestSchema,
  CreateBookingResponseSchema,
  JoinWaitlistRequestSchema,
  JoinWaitlistResponseSchema,
  ListBookingsRequestSchema,
  ListBookingsResponseSchema,
  ListBookingSessionsRequestSchema,
  ListBookingSessionsResponseSchema,
  ListInstructorAvailabilityRequestSchema,
  ListInstructorAvailabilityResponseSchema,
  BookingSessionSchema,
  UpdateAttendanceRequestSchema,
  UpdateAttendanceResponseSchema,
} from './schemas';

const GetByIdRequestSchema = z.object({});

export const listBookingSessionsContract = {
  path: '/api/v1/bookings/sessions',
  method: 'GET' as const,
  request: ListBookingSessionsRequestSchema,
  response: ListBookingSessionsResponseSchema,
} as const;

export const getBookingSessionContract = {
  path: '/api/v1/bookings/sessions/:id',
  method: 'GET' as const,
  request: GetByIdRequestSchema,
  response: BookingSessionSchema,
} as const;

export const listBookingsContract = {
  path: '/api/v1/bookings',
  method: 'GET' as const,
  request: ListBookingsRequestSchema,
  response: ListBookingsResponseSchema,
} as const;

export const createBookingContract = {
  path: '/api/v1/bookings',
  method: 'POST' as const,
  request: CreateBookingRequestSchema,
  response: CreateBookingResponseSchema,
} as const;

export const cancelBookingContract = {
  path: '/api/v1/bookings/:id/cancel',
  method: 'POST' as const,
  request: CancelBookingRequestSchema,
  response: CancelBookingResponseSchema,
} as const;

export const joinWaitlistContract = {
  path: '/api/v1/bookings/waitlists',
  method: 'POST' as const,
  request: JoinWaitlistRequestSchema,
  response: JoinWaitlistResponseSchema,
} as const;

export const updateAttendanceContract = {
  path: '/api/v1/bookings/:id/attendance',
  method: 'PATCH' as const,
  request: UpdateAttendanceRequestSchema,
  response: UpdateAttendanceResponseSchema,
} as const;

export const listInstructorAvailabilityContract = {
  path: '/api/v1/bookings/instructor-availability',
  method: 'GET' as const,
  request: ListInstructorAvailabilityRequestSchema,
  response: ListInstructorAvailabilityResponseSchema,
} as const;
