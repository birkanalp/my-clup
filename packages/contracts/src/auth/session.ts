import { z } from "zod";

/** Request schema. session check is typically GET; no body. */
export const SessionRequestSchema = z.object({});

/** Response schema: session validity */
export const SessionResponseSchema = z.object({
  valid: z.boolean(),
});

export type SessionRequest = z.infer<typeof SessionRequestSchema>;
export type SessionResponse = z.infer<typeof SessionResponseSchema>;

export const sessionContract = {
  path: "/api/v1/auth/session",
  method: "GET" as const,
  request: SessionRequestSchema,
  response: SessionResponseSchema,
} as const;
