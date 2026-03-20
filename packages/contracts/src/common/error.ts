import { z } from 'zod';

/**
 * Standard JSON error envelope for BFF / API routes.
 */
export const ApiErrorResponseSchema = z.object({
  code: z.string().min(1, 'code must be non-empty'),
  message: z.string().min(1, 'message must be non-empty'),
  details: z.unknown().optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
