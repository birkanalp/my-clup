import { z } from 'zod';

/** Request schema for POST /api/v1/auth/sign-in */
export const SignInRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Response schema for POST /api/v1/auth/sign-in */
export const SignInResponseSchema = z.object({
  ok: z.boolean(),
  /** Present only on error responses */
  error: z.string().optional(),
});

export type SignInRequest = z.infer<typeof SignInRequestSchema>;
export type SignInResponse = z.infer<typeof SignInResponseSchema>;

export const signInContract = {
  path: '/api/v1/auth/sign-in',
  method: 'POST' as const,
  request: SignInRequestSchema,
  response: SignInResponseSchema,
} as const;
