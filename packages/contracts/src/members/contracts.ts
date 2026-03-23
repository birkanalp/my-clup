import {
  GetMemberRequestSchema,
  GetMemberResponseSchema,
  ListMembersRequestSchema,
  ListMembersResponseSchema,
  UpdateMemberStatusRequestSchema,
  UpdateMemberStatusResponseSchema,
} from './schemas';

export const listMembersContract = {
  path: '/api/v1/members',
  method: 'GET' as const,
  request: ListMembersRequestSchema,
  response: ListMembersResponseSchema,
} as const;

export const getMemberContract = {
  path: '/api/v1/members/:id',
  method: 'GET' as const,
  request: GetMemberRequestSchema,
  response: GetMemberResponseSchema,
} as const;

export const updateMemberStatusContract = {
  path: '/api/v1/members/:id/status',
  method: 'PATCH' as const,
  request: UpdateMemberStatusRequestSchema,
  response: UpdateMemberStatusResponseSchema,
} as const;
