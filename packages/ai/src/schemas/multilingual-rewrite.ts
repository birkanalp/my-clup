import { z } from 'zod';

export const MultilingualRewriteOutputSchema = z.object({
  sourceLocale: z.string().min(2),
  targetLocale: z.string().min(2),
  rewrittenText: z.string().min(1).max(16000),
  toneNote: z.string().max(500).optional(),
});

export type MultilingualRewriteOutput = z.infer<typeof MultilingualRewriteOutputSchema>;
