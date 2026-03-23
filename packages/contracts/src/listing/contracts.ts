import {
  GetListingResponseSchema,
  UpdateListingRequestSchema,
  UpdateListingResponseSchema,
  UpdateListingVisibilityRequestSchema,
  UpdateListingVisibilityResponseSchema,
} from './schemas';
import { z } from 'zod';

export const getListingContract = {
  path: '/api/v1/listing',
  method: 'GET' as const,
  request: z.object({}),
  response: GetListingResponseSchema,
} as const;

export const updateListingContract = {
  path: '/api/v1/listing',
  method: 'PATCH' as const,
  request: UpdateListingRequestSchema,
  response: UpdateListingResponseSchema,
} as const;

export const updateListingVisibilityContract = {
  path: '/api/v1/listing/visibility',
  method: 'PATCH' as const,
  request: UpdateListingVisibilityRequestSchema,
  response: UpdateListingVisibilityResponseSchema,
} as const;
