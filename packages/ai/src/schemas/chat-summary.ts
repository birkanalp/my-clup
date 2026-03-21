import { z } from 'zod';

/** Staff-facing conversation digest — no raw message IDs required in v1. */
export const ChatConversationSummarySchema = z.object({
  locale: z.string().min(2),
  summary: z.string().min(1).max(8000),
  topics: z.array(z.string().min(1)).max(20),
  openQuestions: z.array(z.string().min(1)).max(10).optional(),
  suggestedStaffReplies: z.array(z.string().min(1)).max(5).optional(),
});

export type ChatConversationSummary = z.infer<typeof ChatConversationSummarySchema>;
