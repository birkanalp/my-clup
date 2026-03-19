import {
  AssignMembershipInstanceRequestSchema,
  AssignMembershipInstanceResponseSchema,
  CancelMembershipRequestSchema,
  CancelMembershipResponseSchema,
  CreateMembershipPlanRequestSchema,
  CreateMembershipPlanResponseSchema,
  DeactivateMembershipPlanResponseSchema,
  FreezeMembershipRequestSchema,
  FreezeMembershipResponseSchema,
  GetMembershipInstanceRequestSchema,
  GetMembershipInstanceResponseSchema,
  ListMembershipInstancesRequestSchema,
  ListMembershipInstancesResponseSchema,
  ListMembershipPlansRequestSchema,
  ListMembershipPlansResponseSchema,
  RenewMembershipRequestSchema,
  RenewMembershipResponseSchema,
  UpdateMembershipPlanRequestSchema,
  UpdateMembershipPlanResponseSchema,
  ValidateMembershipAccessRequestSchema,
  ValidateMembershipAccessResponseSchema,
} from './schemas';

export const listMembershipPlansContract = {
  path: '/api/v1/memberships/plans',
  method: 'GET' as const,
  request: ListMembershipPlansRequestSchema,
  response: ListMembershipPlansResponseSchema,
} as const;

export const createMembershipPlanContract = {
  path: '/api/v1/memberships/plans',
  method: 'POST' as const,
  request: CreateMembershipPlanRequestSchema,
  response: CreateMembershipPlanResponseSchema,
} as const;

export const updateMembershipPlanContract = {
  path: '/api/v1/memberships/plans/:id',
  method: 'PUT' as const,
  request: UpdateMembershipPlanRequestSchema,
  response: UpdateMembershipPlanResponseSchema,
} as const;

export const deactivateMembershipPlanContract = {
  path: '/api/v1/memberships/plans/:id',
  method: 'DELETE' as const,
  response: DeactivateMembershipPlanResponseSchema,
} as const;

export const listMembershipInstancesContract = {
  path: '/api/v1/memberships/instances',
  method: 'GET' as const,
  request: ListMembershipInstancesRequestSchema,
  response: ListMembershipInstancesResponseSchema,
} as const;

export const assignMembershipInstanceContract = {
  path: '/api/v1/memberships/instances',
  method: 'POST' as const,
  request: AssignMembershipInstanceRequestSchema,
  response: AssignMembershipInstanceResponseSchema,
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
