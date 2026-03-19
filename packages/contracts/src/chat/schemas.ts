/**
 * Chat entity schemas and input schemas.
 * Aligns with packages/supabase chat tables (Task 17.1).
 */
import { z } from 'zod';

/** Aligns with DB conversation_type enum. */
export const ConversationTypeSchema = z.enum([
  'direct',
  'support',
  'instructor',
  'group',
  'broadcast',
  'internal_staff',
]);
export type ConversationType = z.infer<typeof ConversationTypeSchema>;

/** Conversation metadata (jsonb). */
export const ConversationMetadataSchema = z.record(z.unknown());
export type ConversationMetadata = z.infer<typeof ConversationMetadataSchema>;

/** Conversation entity. */
export const ConversationSchema = z.object({
  id: z.string().uuid(),
  gymId: z.string().uuid(),
  branchId: z.string().uuid().nullable(),
  type: ConversationTypeSchema,
  metadata: ConversationMetadataSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Conversation = z.infer<typeof ConversationSchema>;

/** ConversationParticipant entity. */
export const ConversationParticipantSchema = z.object({
  conversationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.string(),
  joinedAt: z.string().datetime(),
});
export type ConversationParticipant = z.infer<typeof ConversationParticipantSchema>;

/** MessageAttachment entity. */
export const MessageAttachmentSchema = z.object({
  id: z.string().uuid(),
  messageId: z.string().uuid(),
  storagePath: z.string(),
  mimeType: z.string().nullable(),
  filename: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;

/** Message entity. */
export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string(),
  dedupeKey: z.string().nullable(),
  createdAt: z.string().datetime(),
  attachments: z.array(MessageAttachmentSchema).optional(),
});
export type Message = z.infer<typeof MessageSchema>;

/** MessageReceipt entity. */
export const MessageReceiptSchema = z.object({
  messageId: z.string().uuid(),
  participantId: z.string().uuid(),
  readAt: z.string().datetime(),
});
export type MessageReceipt = z.infer<typeof MessageReceiptSchema>;

/** ConversationAssignment entity. */
export const ConversationAssignmentSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  assignedToUserId: z.string().uuid(),
  assignedAt: z.string().datetime(),
  assignedByUserId: z.string().uuid().nullable(),
  unassignedAt: z.string().datetime().nullable(),
});
export type ConversationAssignment = z.infer<typeof ConversationAssignmentSchema>;

/** TypingState — ephemeral; not persisted. */
export const TypingStateSchema = z.object({
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
  isTyping: z.boolean(),
});
export type TypingState = z.infer<typeof TypingStateSchema>;

/** Input: Create conversation. */
export const CreateConversationInputSchema = z.object({
  gymId: z.string().uuid(),
  branchId: z.string().uuid().nullable().optional(),
  type: ConversationTypeSchema,
  metadata: ConversationMetadataSchema.optional(),
  participantUserIds: z.array(z.string().uuid()).min(1),
});
export type CreateConversationInput = z.infer<typeof CreateConversationInputSchema>;

/** Input: Send message (idempotent via dedupe_key). */
export const CreateMessageInputSchema = z.object({
  content: z.string(),
  dedupeKey: z.string().min(1),
  attachmentPaths: z.array(z.string()).optional(),
});
export type CreateMessageInput = z.infer<typeof CreateMessageInputSchema>;

/** Input: Mark message as read. */
export const MessageReceiptUpdateSchema = z.object({
  readAt: z.string().datetime().optional(),
});
export type MessageReceiptUpdate = z.infer<typeof MessageReceiptUpdateSchema>;

/** Input: Assign conversation to staff. */
export const AssignConversationInputSchema = z.object({
  assignedToUserId: z.string().uuid(),
});
export type AssignConversationInput = z.infer<typeof AssignConversationInputSchema>;

/** Query params for cursor-based pagination. */
export const CursorPageParamsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export type CursorPageParams = z.infer<typeof CursorPageParamsSchema>;

/** Cursor-based page result schema factory. */
export const createCursorPageResultSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });

export type CursorPageResult<T> = {
  items: T[];
  nextCursor: string | null;
};

/** Get conversation response (conversation + participants + assignment). */
export const GetConversationResponseSchema = ConversationSchema.extend({
  participants: z.array(ConversationParticipantSchema),
  assignment: ConversationAssignmentSchema.nullable().optional(),
});
export type GetConversationResponse = z.infer<typeof GetConversationResponseSchema>;

/** List conversations response (cursor-paginated). */
export const ListConversationsResponseSchema = createCursorPageResultSchema(ConversationSchema);

/** List messages response (cursor-paginated). */
export const ListMessagesResponseSchema = createCursorPageResultSchema(MessageSchema);

/** Chat Realtime channel validation response (Task 17.5). */
export const ChatSubscribeResponseSchema = z.object({
  channelName: z.string(),
  gymId: z.string().uuid(),
  conversationId: z.string().uuid(),
});
export type ChatSubscribeResponse = z.infer<typeof ChatSubscribeResponseSchema>;
