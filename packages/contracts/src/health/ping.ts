import { z } from 'zod';

/** Request schema for health ping endpoint. No body required. */
export const PingRequestSchema = z.object({});

/** Response schema for health ping endpoint. */
export const PingResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
});

/** Inferred request type. */
export type PingRequest = z.infer<typeof PingRequestSchema>;

/** Inferred response type. */
export type PingResponse = z.infer<typeof PingResponseSchema>;

/** Contract definition: path, method, request and response schemas. */
export const pingContract = {
  path: '/api/v1/health/ping',
  method: 'GET' as const,
  request: PingRequestSchema,
  response: PingResponseSchema,
} as const;
