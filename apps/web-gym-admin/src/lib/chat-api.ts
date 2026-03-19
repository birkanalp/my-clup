/**
 * Chat API client for web-gym-admin.
 *
 * Uses fetch to call BFF routes. Same-origin requests include cookies.
 * TODO: Migrate to @myclup/api-client when chat methods support path/query params.
 */

import type {
  Conversation,
  ConversationAssignment,
  CreateMessageInput,
  GetConversationResponse,
  Message,
} from '@myclup/contracts/chat';

const getBaseUrl = () =>
  typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? '');

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...init });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API failed: ${res.status} ${body}`);
  }
  return res.json() as Promise<T>;
}

function buildUrl(path: string, query?: Record<string, string | undefined>): string {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  if (!query || Object.keys(query).length === 0) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== '') params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export const chatApi = {
  conversations: {
    async list(params?: { cursor?: string; limit?: number }) {
      const q: Record<string, string> = {};
      if (params?.cursor) q.cursor = params.cursor;
      if (params?.limit) q.limit = String(params.limit);
      return fetchJson<{ items: Conversation[]; nextCursor: string | null }>(
        buildUrl('/api/v1/chat/conversations', q)
      );
    },
    async get(id: string) {
      return fetchJson<GetConversationResponse>(buildUrl(`/api/v1/chat/conversations/${id}`));
    },
    async assign(conversationId: string, input: { assignedToUserId: string }) {
      return fetchJson<ConversationAssignment>(
        buildUrl(`/api/v1/chat/conversations/${conversationId}/assign`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        }
      );
    },
  },
  messages: {
    async list(conversationId: string, params?: { cursor?: string; limit?: number }) {
      const q: Record<string, string> = {};
      if (params?.cursor) q.cursor = params.cursor;
      if (params?.limit) q.limit = String(params.limit);
      return fetchJson<{ items: Message[]; nextCursor: string | null }>(
        buildUrl(`/api/v1/chat/conversations/${conversationId}/messages`, q)
      );
    },
    async send(conversationId: string, payload: CreateMessageInput) {
      return fetchJson<Message>(buildUrl(`/api/v1/chat/conversations/${conversationId}/messages`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },
    async sendTemplate(
      conversationId: string,
      payload: {
        templateId: string;
        locale?: string;
        variables?: Record<string, string>;
        dedupeKey: string;
      }
    ) {
      return fetchJson<Message>(
        buildUrl(`/api/v1/chat/conversations/${conversationId}/messages/template`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
    },
  },
  templates: {
    async list(params: { gymId: string; locale?: string; branchId?: string | null }) {
      const q: Record<string, string> = { gymId: params.gymId };
      if (params.locale) q.locale = params.locale;
      if (params.branchId) q.branchId = params.branchId;
      return fetchJson<{ items: { id: string; key: string; body: string }[] }>(
        buildUrl('/api/v1/chat/templates', q)
      );
    },
  },
  quickReplies: {
    async list(params: { gymId: string; locale?: string; branchId?: string | null }) {
      const q: Record<string, string> = { gymId: params.gymId };
      if (params.locale) q.locale = params.locale;
      if (params.branchId) q.branchId = params.branchId;
      return fetchJson<{ items: { id: string; label: string; body: string }[] }>(
        buildUrl('/api/v1/chat/quick-replies', q)
      );
    },
  },
};
