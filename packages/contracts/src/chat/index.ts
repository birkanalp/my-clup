/**
 * @myclup/contracts/chat — Chat API contracts.
 *
 * Entities: Conversation, ConversationParticipant, Message, MessageAttachment,
 * MessageReceipt, ConversationAssignment, TypingState.
 *
 * @see docs/07-technical-plan.md §7.3
 * @see docs/epic-17-task-decomposition.md Task 17.2
 */

export {
  AssignConversationInputSchema,
  ConversationAssignmentSchema,
  ConversationMetadataSchema,
  ConversationParticipantSchema,
  ConversationSchema,
  ConversationTypeSchema,
  CreateConversationInputSchema,
  CreateMessageInputSchema,
  CursorPageParamsSchema,
  GetConversationResponseSchema,
  ListConversationsResponseSchema,
  ListMessagesResponseSchema,
  MessageAttachmentSchema,
  MessageReceiptSchema,
  MessageReceiptUpdateSchema,
  MessageSchema,
  TypingStateSchema,
  createCursorPageResultSchema,
} from './schemas';
export type {
  AssignConversationInput,
  Conversation,
  ConversationAssignment,
  ConversationMetadata,
  ConversationParticipant,
  ConversationType,
  CreateConversationInput,
  CreateMessageInput,
  CursorPageParams,
  CursorPageResult,
  GetConversationResponse,
  Message,
  MessageAttachment,
  MessageReceipt,
  MessageReceiptUpdate,
  TypingState,
} from './schemas';

export {
  assignConversationContract,
  createConversationContract,
  getConversationContract,
  listConversationsContract,
  listMessagesContract,
  markReadContract,
  sendMessageContract,
} from './contracts';
