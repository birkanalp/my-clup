import { z } from 'zod';

/**
 * Cursor-based pagination request fragment (query/body).
 * `limit` is optional; when present it must be a positive integer ≤ 100.
 */
export const PaginationRequestSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce
    .number()
    .int('limit must be an integer')
    .positive('limit must be positive')
    .max(100, 'limit must be at most 100')
    .optional(),
});

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>;

/**
 * Cursor pagination metadata returned with list endpoints.
 */
export const PaginationResponseSchema = z.object({
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
  total: z.number().int().nonnegative().optional(),
});

export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;
