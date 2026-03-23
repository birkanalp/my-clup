import { z } from 'zod';

export const contactLeadRequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  message: z.string().max(5000).optional().default(''),
  locale: z.string().trim().min(2).max(32),
});

export const contactLeadResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    id: z.string().uuid(),
  }),
  z.object({
    ok: z.literal(false),
    error: z.enum(['validation_error', 'config_missing', 'persist_failed']),
  }),
]);

export type ContactLeadRequest = z.infer<typeof contactLeadRequestSchema>;
export type ContactLeadResponse = z.infer<typeof contactLeadResponseSchema>;

export const contactLeadContract = {
  path: '/api/v1/public/contact-leads',
  method: 'POST' as const,
  request: contactLeadRequestSchema,
  response: contactLeadResponseSchema,
} as const;
