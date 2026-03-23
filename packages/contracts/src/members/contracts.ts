import {
  GetGymMemberRequestSchema,
  GetGymMemberResponseSchema,
  ListGymMembersRequestSchema,
  ListGymMembersResponseSchema,
  UpdateMemberStatusRequestSchema,
  UpdateMemberStatusResponseSchema,
} from './schemas';

export const listGymMembersContract = {
  path: '/api/v1/members',
  method: 'GET' as const,
  request: ListGymMembersRequestSchema,
  response: ListGymMembersResponseSchema,
} as const;

export const getGymMemberContract = {
  path: '/api/v1/members/:id',
  method: 'GET' as const,
  request: GetGymMemberRequestSchema,
  response: GetGymMemberResponseSchema,
} as const;

export const updateMemberStatusContract = {
  path: '/api/v1/members/:id/status',
  method: 'PATCH' as const,
  request: UpdateMemberStatusRequestSchema,
  response: UpdateMemberStatusResponseSchema,
} as const;
