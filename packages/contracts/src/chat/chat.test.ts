import { describe, it, expect } from 'vitest';
import {
  ConversationTypeSchema,
  ConversationSchema,
  ConversationParticipantSchema,
  MessageSchema,
  MessageAttachmentSchema,
  MessageReceiptSchema,
  ConversationAssignmentSchema,
  TypingStateSchema,
  CreateConversationInputSchema,
  CreateMessageInputSchema,
  MessageReceiptUpdateSchema,
  AssignConversationInputSchema,
  CursorPageParamsSchema,
  ListConversationsResponseSchema,
  ListMessagesResponseSchema,
  GetConversationResponseSchema,
  listConversationsContract,
  getConversationContract,
  createConversationContract,
  listMessagesContract,
  sendMessageContract,
  markReadContract,
  assignConversationContract,
  validateChatSubscribeContract,
  ChatSubscribeResponseSchema,
} from './index';

const validUuid = '550e8400-e29b-41d4-a716-446655440000';
const validDatetime = '2025-03-19T12:00:00.000Z';

describe('chat contracts', () => {
  describe('ConversationTypeSchema', () => {
    it('accepts all valid conversation types', () => {
      const types = [
        'direct',
        'support',
        'instructor',
        'group',
        'broadcast',
        'internal_staff',
      ] as const;
      for (const t of types) {
        expect(ConversationTypeSchema.parse(t)).toBe(t);
      }
    });

    it('rejects invalid type', () => {
      expect(ConversationTypeSchema.safeParse('invalid')).toEqual({
        success: false,
        error: expect.any(Object),
      });
    });
  });

  describe('CreateMessageInputSchema (idempotency via dedupeKey)', () => {
    it('requires dedupeKey', () => {
      const result = CreateMessageInputSchema.safeParse({ content: 'hi' });
      expect(result.success).toBe(false);
    });

    it('accepts valid input with dedupeKey', () => {
      const input = { content: 'Hello', dedupeKey: 'client-msg-123' };
      expect(CreateMessageInputSchema.parse(input)).toEqual(input);
    });

    it('rejects empty dedupeKey', () => {
      const result = CreateMessageInputSchema.safeParse({ content: 'hi', dedupeKey: '' });
      expect(result.success).toBe(false);
    });

    it('accepts optional attachmentPaths', () => {
      const input = {
        content: 'File',
        dedupeKey: 'msg-456',
        attachmentPaths: ['path/to/file.png'],
      };
      expect(CreateMessageInputSchema.parse(input).attachmentPaths).toEqual(['path/to/file.png']);
    });
  });

  describe('CreateConversationInputSchema', () => {
    it('validates minimal input', () => {
      const input = {
        gymId: validUuid,
        type: 'direct' as const,
        participantUserIds: [validUuid],
      };
      expect(CreateConversationInputSchema.parse(input)).toEqual(input);
    });

    it('rejects empty participantUserIds', () => {
      expect(
        CreateConversationInputSchema.safeParse({
          gymId: validUuid,
          type: 'direct',
          participantUserIds: [],
        })
      ).toMatchObject({ success: false });
    });
  });

  describe('MessageReceiptUpdateSchema', () => {
    it('accepts optional readAt', () => {
      expect(MessageReceiptUpdateSchema.parse({})).toEqual({});
      expect(MessageReceiptUpdateSchema.parse({ readAt: validDatetime }).readAt).toBe(
        validDatetime
      );
    });
  });

  describe('AssignConversationInputSchema', () => {
    it('validates assignedToUserId', () => {
      expect(AssignConversationInputSchema.parse({ assignedToUserId: validUuid })).toEqual({
        assignedToUserId: validUuid,
      });
    });

    it('rejects invalid uuid', () => {
      expect(
        AssignConversationInputSchema.safeParse({ assignedToUserId: 'not-uuid' })
      ).toMatchObject({
        success: false,
      });
    });
  });

  describe('CursorPageParamsSchema', () => {
    it('accepts cursor and limit', () => {
      expect(CursorPageParamsSchema.parse({ cursor: 'abc', limit: 10 })).toEqual({
        cursor: 'abc',
        limit: 10,
      });
    });

    it('defaults limit to 20', () => {
      expect(CursorPageParamsSchema.parse({})).toEqual({ limit: 20 });
    });

    it('rejects limit > 100', () => {
      expect(CursorPageParamsSchema.safeParse({ limit: 101 })).toMatchObject({ success: false });
    });
  });

  describe('ListConversationsResponseSchema', () => {
    const validConversation = {
      id: validUuid,
      gymId: validUuid,
      branchId: validUuid,
      type: 'direct' as const,
      metadata: {},
      createdAt: validDatetime,
      updatedAt: validDatetime,
    };

    it('validates cursor-paginated result', () => {
      const result = { items: [validConversation], nextCursor: 'cursor-123' };
      expect(ListConversationsResponseSchema.parse(result)).toEqual(result);
    });

    it('accepts null nextCursor for last page', () => {
      const result = { items: [], nextCursor: null };
      expect(ListConversationsResponseSchema.parse(result)).toEqual(result);
    });
  });

  describe('ListMessagesResponseSchema', () => {
    const validMessage = {
      id: validUuid,
      conversationId: validUuid,
      senderId: validUuid,
      content: 'Hi',
      dedupeKey: null,
      createdAt: validDatetime,
    };

    it('validates cursor-paginated messages', () => {
      const result = { items: [validMessage], nextCursor: null };
      expect(ListMessagesResponseSchema.parse(result)).toEqual(result);
    });
  });

  describe('GetConversationResponseSchema', () => {
    it('validates conversation with participants and assignment', () => {
      const response = {
        id: validUuid,
        gymId: validUuid,
        branchId: null,
        type: 'direct' as const,
        metadata: {},
        createdAt: validDatetime,
        updatedAt: validDatetime,
        participants: [
          {
            conversationId: validUuid,
            userId: validUuid,
            role: 'member',
            joinedAt: validDatetime,
          },
        ],
        assignment: null,
      };
      expect(GetConversationResponseSchema.parse(response)).toEqual(response);
    });
  });

  describe('Entity schemas', () => {
    it('ConversationSchema validates', () => {
      expect(
        ConversationSchema.parse({
          id: validUuid,
          gymId: validUuid,
          branchId: null,
          type: 'direct',
          metadata: {},
          createdAt: validDatetime,
          updatedAt: validDatetime,
        })
      ).toBeDefined();
    });

    it('ConversationParticipantSchema validates', () => {
      expect(
        ConversationParticipantSchema.parse({
          conversationId: validUuid,
          userId: validUuid,
          role: 'member',
          joinedAt: validDatetime,
        })
      ).toBeDefined();
    });

    it('MessageSchema validates', () => {
      expect(
        MessageSchema.parse({
          id: validUuid,
          conversationId: validUuid,
          senderId: validUuid,
          content: 'Hi',
          dedupeKey: null,
          createdAt: validDatetime,
        })
      ).toBeDefined();
    });

    it('MessageAttachmentSchema validates', () => {
      expect(
        MessageAttachmentSchema.parse({
          id: validUuid,
          messageId: validUuid,
          storagePath: 'bucket/path',
          mimeType: 'image/png',
          filename: 'img.png',
          createdAt: validDatetime,
        })
      ).toBeDefined();
    });

    it('MessageReceiptSchema validates', () => {
      expect(
        MessageReceiptSchema.parse({
          messageId: validUuid,
          participantId: validUuid,
          readAt: validDatetime,
        })
      ).toBeDefined();
    });

    it('ConversationAssignmentSchema validates', () => {
      expect(
        ConversationAssignmentSchema.parse({
          id: validUuid,
          conversationId: validUuid,
          assignedToUserId: validUuid,
          assignedAt: validDatetime,
          assignedByUserId: null,
          unassignedAt: null,
        })
      ).toBeDefined();
    });

    it('TypingStateSchema validates', () => {
      expect(
        TypingStateSchema.parse({
          userId: validUuid,
          conversationId: validUuid,
          isTyping: true,
        })
      ).toBeDefined();
    });

    it('ChatSubscribeResponseSchema validates channel params for Realtime subscription', () => {
      const response = {
        channelName: `chat:${validUuid}:${validUuid}`,
        gymId: validUuid,
        conversationId: validUuid,
      };
      expect(ChatSubscribeResponseSchema.parse(response)).toEqual(response);
    });
  });

  describe('contract objects', () => {
    it('listConversationsContract has correct path', () => {
      expect(listConversationsContract.path).toBe('/api/v1/chat/conversations');
      expect(listConversationsContract.method).toBe('GET');
    });

    it('getConversationContract has :id placeholder', () => {
      expect(getConversationContract.path).toBe('/api/v1/chat/conversations/:id');
    });

    it('createConversationContract uses POST', () => {
      expect(createConversationContract.path).toBe('/api/v1/chat/conversations');
      expect(createConversationContract.method).toBe('POST');
    });

    it('sendMessageContract uses CreateMessageInput', () => {
      expect(sendMessageContract.request).toBe(CreateMessageInputSchema);
    });

    it('listMessagesContract supports cursor pagination', () => {
      expect(listMessagesContract.request).toBeDefined();
    });

    it('markReadContract uses PATCH on message receipts', () => {
      expect(markReadContract.path).toBe('/api/v1/chat/messages/:id/receipts');
      expect(markReadContract.method).toBe('PATCH');
    });

    it('assignConversationContract uses POST', () => {
      expect(assignConversationContract.path).toBe('/api/v1/chat/conversations/:id/assign');
      expect(assignConversationContract.method).toBe('POST');
    });

    it('validateChatSubscribeContract returns channel params for Realtime', () => {
      expect(validateChatSubscribeContract.path).toBe('/api/v1/chat/conversations/:id/subscribe');
      expect(validateChatSubscribeContract.method).toBe('GET');
      expect(validateChatSubscribeContract.response).toBe(ChatSubscribeResponseSchema);
    });
  });
});
