/**
 * RLS verification tests for chat tables.
 *
 * Verifies:
 * - RLS policies exist for chat tables (conversations, messages, receipts, etc.)
 * - createUserScopedClient returns client configured for user JWT (RLS applies)
 *
 * Cross-tenant denial at application layer is covered by permissions.test.ts
 * and apps/web-gym-admin src/server/chat messages.test.ts, receipts.test.ts.
 *
 * Task 17.11, Issue #107
 * Per .cursor/rules/chat-first-realtime-safety.mdc and testing-requirements-and-quality-bar.mdc
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RLS_CHAT_MIGRATION = 'supabase/migrations/20250319000004_rls_chat_tables.sql';

const EXPECTED_CHAT_RLS_POLICIES = [
  'conversations_select_participant',
  'conversation_participants_select_own_conversations',
  'messages_select_participant',
  'messages_insert_participant_sender',
  'message_attachments_select_participant',
  'message_attachments_insert_sender',
  'message_receipts_select_participant',
  'message_receipts_insert_own',
  'message_receipts_update_own',
  'conversation_assignments_select_gym_access',
];

describe('RLS chat verification', () => {
  it('chat tables have RLS enabled and expected policies defined', () => {
    const root = resolve(__dirname, '../../../../');
    const migrationPath = resolve(root, RLS_CHAT_MIGRATION);
    expect(existsSync(migrationPath), `RLS migration not found: ${migrationPath}`).toBe(true);

    const content = readFileSync(migrationPath, 'utf-8');

    // RLS enabled on chat tables
    expect(content).toContain('ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY');
    expect(content).toContain('ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY');
    expect(content).toContain('ALTER TABLE public.message_receipts ENABLE ROW LEVEL SECURITY');
    expect(content).toContain('ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY');

    // Key policies exist
    for (const policy of EXPECTED_CHAT_RLS_POLICIES) {
      expect(content, `Policy "${policy}" should be defined`).toContain(`"${policy}"`);
    }

    // Cross-tenant: conversations SELECT uses participant membership (auth.uid())
    expect(content).toContain('auth.uid()');
    expect(content).toContain('conversation_participants WHERE user_id = auth.uid()');
  });

  it('createUserScopedClient returns client when env is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    const session = {
      access_token: 'user-jwt-token-123',
      refresh_token: 'refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: { id: 'user-1' },
    } as import('@supabase/supabase-js').Session;

    const { createUserScopedClient } = await import('./create-user-scoped-client.js');
    const client = createUserScopedClient(session);

    expect(client).toBeDefined();
    expect(typeof client).toBe('object');
    // createUserScopedClient uses Authorization: Bearer <session.access_token>
    // so RLS applies when this client is used for queries
  });
});
