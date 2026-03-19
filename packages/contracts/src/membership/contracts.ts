import {
  CancelMembershipRequestSchema,
  CancelMembershipResponseSchema,
  FreezeMembershipRequestSchema,
  FreezeMembershipResponseSchema,
  GetMembershipInstanceRequestSchema,
  GetMembershipInstanceResponseSchema,
  ListMembershipPlansRequestSchema,
  ListMembershipPlansResponseSchema,
  RenewMembershipRequestSchema,
  RenewMembershipResponseSchema,
  ValidateMembershipAccessRequestSchema,
  ValidateMembershipAccessResponseSchema,
} from './schemas';

export const listMembershipPlansContract = {
  path: '/api/v1/memberships/plans',
  method: 'GET' as const,
  request: ListMembershipPlansRequestSchema,
  response: ListMembershipPlansResponseSchema,
} as const;

export const getMembershipInstanceContract = {
  path: '/api/v1/memberships/instances/:id',
  method: 'GET' as const,
  request: GetMembershipInstanceRequestSchema,
  response: GetMembershipInstanceResponseSchema,
} as const;

export const renewMembershipContract = {
  path: '/api/v1/memberships/instances/:id/renew',
  method: 'POST' as const,
  request: RenewMembershipRequestSchema,
  response: RenewMembershipResponseSchema,
} as const;

export const freezeMembershipContract = {
  path: '/api/v1/memberships/instances/:id/freeze',
  method: 'POST' as const,
  request: FreezeMembershipRequestSchema,
  response: FreezeMembershipResponseSchema,
} as const;

export const cancelMembershipContract = {
  path: '/api/v1/memberships/instances/:id/cancel',
  method: 'POST' as const,
  request: CancelMembershipRequestSchema,
  response: CancelMembershipResponseSchema,
} as const;

export const validateMembershipAccessContract = {
  path: '/api/v1/memberships/instances/:id/access',
  method: 'GET' as const,
  request: ValidateMembershipAccessRequestSchema,
  response: ValidateMembershipAccessResponseSchema,
} as const;
