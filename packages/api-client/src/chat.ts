/**
 * Chat API namespace for the shared api-client.
 *
 * Provides typed methods for conversations (list, get, create, assign)
 * and messages (list, send, markRead). Uses path param substitution
 * for routes like /api/v1/chat/conversations/:id.
 *
 * Realtime subscription is handled in apps; broadcast/template methods
 * are out of scope (Task 17.6).
 */

import type {
  AssignConversationInput,
  Conversation,
  ConversationAssignment,
  CreateConversationInput,
  CreateMessageInput,
  CursorPageParams,
  GetConversationResponse,
  Message,
  MessageReceiptUpdate,
} from '@myclup/contracts/chat';
import {
  assignConversationContract,
  createConversationContract,
  getConversationContract,
  listConversationsContract,
  listMessagesContract,
  markReadContract,
  sendMessageContract,
} from '@myclup/contracts/chat';
import type { ApiContract } from './client';
import type { RequestOptions } from './client';

type RequestFn = <T>(
  contract: ApiContract<unknown, T>,
  requestData?: unknown,
  options?: RequestOptions
) => Promise<T>;

/** Cursor-paginated list response. */
type ListConversationsResponse = { items: Conversation[]; nextCursor: string | null };
type ListMessagesResponse = { items: Message[]; nextCursor: string | null };

/**
 * Creates the chat API namespace with typed methods.
 * All responses are validated against their contract schemas.
 */
export function createChatApi(request: RequestFn) {
  return {
    conversations: {
      /**
       * GET /api/v1/chat/conversations
       * List conversations with optional cursor pagination.
       */
      async list(params?: CursorPageParams): Promise<ListConversationsResponse> {
        return request(
          listConversationsContract as ApiContract<CursorPageParams, ListConversationsResponse>,
          params
        );
      },

      /**
       * GET /api/v1/chat/conversations/:id
       * Get a conversation by ID with participants and assignment.
       */
      async get(id: string): Promise<GetConversationResponse> {
        return request(
          getConversationContract as ApiContract<unknown, GetConversationResponse>,
          undefined,
          { pathParams: { id } }
        );
      },

      /**
       * POST /api/v1/chat/conversations
       * Create a new conversation.
       */
      async create(input: CreateConversationInput): Promise<Conversation> {
        return request(
          createConversationContract as ApiContract<CreateConversationInput, Conversation>,
          input
        );
      },

      /**
       * POST /api/v1/chat/conversations/:id/assign
       * Assign a conversation to staff.
       */
      async assign(
        conversationId: string,
        input: AssignConversationInput
      ): Promise<ConversationAssignment> {
        return request(
          assignConversationContract as ApiContract<
            AssignConversationInput,
            ConversationAssignment
          >,
          input,
          { pathParams: { id: conversationId } }
        );
      },
    },
    messages: {
      /**
       * GET /api/v1/chat/conversations/:id/messages
       * List messages with optional cursor pagination.
       */
      async list(conversationId: string, params?: CursorPageParams): Promise<ListMessagesResponse> {
        return request(
          listMessagesContract as ApiContract<CursorPageParams, ListMessagesResponse>,
          params,
          { pathParams: { id: conversationId } }
        );
      },

      /**
       * POST /api/v1/chat/conversations/:id/messages
       * Send a message (idempotent via dedupeKey).
       */
      async send(conversationId: string, payload: CreateMessageInput): Promise<Message> {
        return request(sendMessageContract as ApiContract<CreateMessageInput, Message>, payload, {
          pathParams: { id: conversationId },
        });
      },

      /**
       * PATCH /api/v1/chat/messages/:id/receipts
       * Mark a message as read.
       */
      async markRead(
        messageId: string,
        input?: MessageReceiptUpdate
      ): Promise<MessageReceiptUpdate> {
        return request(
          markReadContract as ApiContract<MessageReceiptUpdate, MessageReceiptUpdate>,
          input ?? {},
          { pathParams: { id: messageId } }
        );
      },
    },
  };
}
