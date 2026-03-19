/**
 * Chat API contract definitions.
 *
 * Contracts for: list conversations, get conversation, create conversation,
 * list messages (cursor pagination), send message, mark read, assign conversation.
 *
 * @see docs/07-technical-plan.md §7.3
 * @see docs/epic-17-task-decomposition.md Task 17.2
 */

import { z } from 'zod';
import {
  AssignConversationInputSchema,
  ChatSubscribeResponseSchema,
  ConversationAssignmentSchema,
  ConversationSchema,
  CreateConversationInputSchema,
  CreateMessageInputSchema,
  CursorPageParamsSchema,
  GetConversationResponseSchema,
  ListConversationsResponseSchema,
  ListMessagesResponseSchema,
  MessageReceiptUpdateSchema,
  MessageSchema,
} from './schemas';
import {
  ListQuickRepliesParamsSchema,
  ListQuickRepliesResponseSchema,
  ListTemplatesParamsSchema,
  ListTemplatesResponseSchema,
  SendTemplateInputSchema,
} from './templates-schemas';

/** Empty request for GET by path param. */
const GetByIdRequestSchema = z.object({});

// --- List conversations ---

export const listConversationsContract = {
  path: '/api/v1/chat/conversations',
  method: 'GET' as const,
  request: CursorPageParamsSchema,
  response: ListConversationsResponseSchema,
} as const;

// --- Get conversation ---

export const getConversationContract = {
  path: '/api/v1/chat/conversations/:id',
  method: 'GET' as const,
  request: GetByIdRequestSchema,
  response: GetConversationResponseSchema,
} as const;

// --- Create conversation ---

export const createConversationContract = {
  path: '/api/v1/chat/conversations',
  method: 'POST' as const,
  request: CreateConversationInputSchema,
  response: ConversationSchema,
} as const;

// --- List messages (cursor pagination) ---

export const listMessagesContract = {
  path: '/api/v1/chat/conversations/:id/messages',
  method: 'GET' as const,
  request: CursorPageParamsSchema,
  response: ListMessagesResponseSchema,
} as const;

// --- Send message (idempotent via dedupe_key) ---

export const sendMessageContract = {
  path: '/api/v1/chat/conversations/:id/messages',
  method: 'POST' as const,
  request: CreateMessageInputSchema,
  response: MessageSchema,
} as const;

// --- Mark read ---

export const markReadContract = {
  path: '/api/v1/chat/messages/:id/receipts',
  method: 'PATCH' as const,
  request: MessageReceiptUpdateSchema,
  response: MessageReceiptUpdateSchema,
} as const;

// --- Assign conversation ---

export const assignConversationContract = {
  path: '/api/v1/chat/conversations/:id/assign',
  method: 'POST' as const,
  request: AssignConversationInputSchema,
  response: ConversationAssignmentSchema,
} as const;

// --- Validate chat subscription (channel validation for Realtime) ---

export const validateChatSubscribeContract = {
  path: '/api/v1/chat/conversations/:id/subscribe',
  method: 'GET' as const,
  request: GetByIdRequestSchema,
  response: ChatSubscribeResponseSchema,
} as const;

// --- Task 17.6: Templates and quick replies ---

export const listTemplatesContract = {
  path: '/api/v1/chat/templates',
  method: 'GET' as const,
  request: ListTemplatesParamsSchema,
  response: ListTemplatesResponseSchema,
} as const;

export const sendTemplateContract = {
  path: '/api/v1/chat/conversations/:id/messages/template',
  method: 'POST' as const,
  request: SendTemplateInputSchema,
  response: MessageSchema,
} as const;

export const listQuickRepliesContract = {
  path: '/api/v1/chat/quick-replies',
  method: 'GET' as const,
  request: ListQuickRepliesParamsSchema,
  response: ListQuickRepliesResponseSchema,
} as const;
