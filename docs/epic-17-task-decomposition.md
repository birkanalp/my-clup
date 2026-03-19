# Epic #17 — Chat, Notifications, and Communication Platform

## Task Decomposition for GitHub Issues

**Part of Epic #17**

This document specifies implementation-ready task issues for the orchestrator to create. Use it as the source for GitHub Issue creation.

**Epic dependency**: Epic #14, #15, #16 must be complete.

**Created GitHub Issues**: #97 (17.1), #98 (17.2), #99 (17.3), #100 (17.4), #101 (17.5), #102 (17.6), #103 (17.7), #104 (17.8), #105 (17.9), #106 (17.10), #107 (17.11)

---

## Task Dependency Graph

```
Epic #14, #15, #16 (complete)
       │
       ├──► Task 17.1: Chat database schema and RLS (backend)
       │
       └──► Task 17.2: Chat contracts (Conversation, Message, etc.) (backend, parallel with 17.1)
                     │
                     │
       ┌─────────────┴─────────────┐
       │                           │
       ▼                           ▼
Task 17.3: Chat API routes      Task 17.4: api-client chat methods
(depends on 17.1, 17.2)         (depends on 17.2)
       │                           │
       └──────────────┬────────────┘
                      │
                      ▼
            Task 17.5: Realtime delivery, presence, typing (depends on 17.3)
                      │
                      ▼
            Task 17.6: Broadcast, template, quick-reply workflows (depends on 17.3)
                      │
                      ▼
            Task 17.7: Audit and moderation hooks (depends on 17.1, 17.3)
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
Task 17.8:         Task 17.9:     Task 17.10:
Mobile-user chat   Mobile-admin   Web-gym-admin chat
(depends on 17.4, 17.5)          (depends on 17.4, 17.5)
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼
            Task 17.11: Chat integration tests, RLS verification (depends on 17.3, 17.5)
```

---

## Overlap Warnings

- **Tasks 17.1 and 17.2** may run in parallel (schema vs contracts; no file overlap).
- **Tasks 17.3 and 17.4** may partially overlap; 17.4 needs 17.2 contracts; 17.3 needs 17.1 schema. Prefer 17.3 first, then 17.4.
- **Tasks 17.8, 17.9, 17.10** may run in parallel (different apps; no file overlap).
- **Task 17.11** must wait for 17.3 and 17.5 to be implementable.

---

## Task 17.1: Chat Database Schema and RLS

### Summary

Create Supabase migrations for the chat subsystem. Define tables for conversations, participants, messages, receipts, attachments, and assignments. Implement RLS for tenant isolation. Regenerate database types.

### Source Documentation

- `docs/07-technical-plan.md` §7 (Chat and Realtime Architecture)
- `docs/00-master-plan.md` §§3.3, 6 (Chat Strategy)
- `AGENT.md` §7
- `.cursor/rules/chat-first-realtime-safety.mdc`
- `.cursor/skills/chat-feature-planner/SKILL.md`
- `.cursor/skills/database-schema-planner/SKILL.md`

### Scope

**In scope:**
- Migrations for: `conversations`, `conversation_participants`, `messages`, `message_attachments`, `message_receipts`, `conversation_assignments`
- `conversations`: id, gym_id, branch_id nullable, type (direct|support|instructor|group|broadcast|internal_staff), metadata jsonb, created_at, updated_at
- `conversation_participants`: conversation_id, user_id, role, joined_at
- `messages`: id, conversation_id, sender_id, content, dedupe_key (idempotency), created_at
- `message_attachments`: message_id, storage_path, mime_type, filename
- `message_receipts`: message_id, participant_id, read_at
- `conversation_assignments`: conversation_id, assigned_to_user_id, assigned_at, assigned_by_user_id
- RLS: tenant isolation via gym_id; membership validation before message access
- Indexes for cursor pagination, tenant lookup, unread counts

**Out of scope:**
- Realtime channel setup (Task 17.5)
- Broadcast/template tables (Task 17.6)
- API implementation

### Affected Packages

- `packages/supabase` (migrations, generated types)

### Dependencies

- Epic #14, #15, #16 complete

### Acceptance Criteria

- [ ] Migrations create all chat tables with correct FKs and constraints
- [ ] RLS policies enforce gym_id (and branch_id) on all tenant-owned tables
- [ ] Message creation supports dedupe_key for idempotency
- [ ] `packages/supabase/src/generated/database.types.ts` regenerated
- [ ] Migration runs successfully

### Required Tests

- Migration applies cleanly
- RLS policy review before merge

### Localization Impact

- None (schema only)

### Risk Level

- High

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`, `type:infra`, `priority:p0`, `surface:shared`

---

## Task 17.2: Chat Contracts (Conversation, Message, Receipt, Assignment)

### Summary

Define shared API contracts (Zod schemas, types) for chat operations. Covers Conversation, ConversationParticipant, Message, MessageAttachment, MessageReceipt, ConversationAssignment, TypingState. Ensures all chat API boundaries use shared schemas from `packages/contracts`.

### Source Documentation

- `docs/07-technical-plan.md` §7.3 (Required Chat Contracts and Types)
- `AGENT.md` §4
- `.cursor/rules/shared-contracts-first.mdc`
- `.cursor/skills/api-contract-generator/SKILL.md`
- `.cursor/skills/chat-feature-planner/SKILL.md`

### Scope

**In scope:**
- `packages/contracts/src/chat/` (or equivalent)
- Zod schemas: CreateConversationInput, CreateMessageInput (with dedupe_key), MessageReceiptUpdate, ConversationAssignment
- Types: Conversation, ConversationParticipant, Message, MessageAttachment, MessageReceipt, ConversationAssignment, TypingState
- Contract objects for: list conversations, get conversation, send message, list messages (cursor pagination), mark read, assign conversation

**Out of scope:**
- API route implementation
- Realtime contracts (can be minimal or in same package)

### Affected Packages

- `packages/contracts`
- `packages/types` (if domain types needed)

### Dependencies

- Epic #14 complete
- None blocking 17.1

### Acceptance Criteria

- [ ] All chat contract schemas in `packages/contracts`
- [ ] Message creation includes dedupe_key for idempotency
- [ ] Cursor-based pagination contract for message history
- [ ] `pnpm build` and `pnpm typecheck` pass

### Required Tests

- Unit tests for schema validation

### Localization Impact

- None (contracts only; locale in message content handled at API layer)

### Risk Level

- Medium

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p0`, `surface:shared`

---

## Task 17.3: Chat API Routes and Server Logic

### Summary

Implement Next.js BFF API routes for chat CRUD operations. Enforce tenant isolation, membership validation, and server-side permission checks. Support cursor-based message pagination and idempotent message creation.

### Source Documentation

- `docs/07-technical-plan.md` §7
- `AGENT.md` §7
- `.cursor/rules/chat-first-realtime-safety.mdc`
- `.cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc`

### Scope

**In scope:**
- `/api/v1/chat/conversations` — list, create
- `/api/v1/chat/conversations/[id]` — get, participants
- `/api/v1/chat/conversations/[id]/messages` — list (cursor), send (idempotent)
- `/api/v1/chat/messages/[id]/receipts` — mark read
- `/api/v1/chat/conversations/[id]/assign` — assign to staff
- Server-side: tenant scope verification, ConversationParticipant validation before message access

**Out of scope:**
- Realtime subscription (Task 17.5)
- Broadcast/template endpoints (Task 17.6)

### Affected Packages

- `apps/web-gym-admin` or shared API layer
- `packages/supabase`

### Dependencies

- #17.1, #17.2

### Acceptance Criteria

- [ ] All chat routes implemented with contract validation
- [ ] Tenant isolation enforced on every query
- [ ] Membership validated before message access
- [ ] Message creation is idempotent (dedupe_key)
- [ ] Cursor-based pagination for message history
- [ ] Permission checks server-side only

### Required Tests

- Integration tests for auth, tenant isolation, membership checks

### Localization Impact

- None (API only)

### Risk Level

- High

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p0`, `surface:shared`

---

## Task 17.4: api-client Chat Methods

### Summary

Add typed chat methods to `packages/api-client` for conversation list, get, send message, list messages (cursor), mark read, and assign. All methods use contracts from `packages/contracts`.

### Source Documentation

- `docs/07-technical-plan.md` §2.4, §4.4
- `AGENT.md` §4
- `.cursor/rules/shared-contracts-first.mdc`

### Scope

**In scope:**
- `conversations.list()`, `conversations.get(id)`, `conversations.create()`
- `messages.list(conversationId, cursor)`, `messages.send(conversationId, payload)`
- `messages.markRead(messageId)`
- `conversations.assign(conversationId, userId)`

**Out of scope:**
- Realtime subscription (handled in apps)
- Broadcast/template client methods (Task 17.6)

### Affected Packages

- `packages/api-client`

### Dependencies

- #17.2

### Acceptance Criteria

- [ ] All chat operations exposed via typed api-client methods
- [ ] Methods use contract request/response types
- [ ] `pnpm build` passes

### Required Tests

- Unit or integration stub for api-client chat usage

### Localization Impact

- None

### Risk Level

- Low

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p0`, `surface:shared`

---

## Task 17.5: Realtime Delivery, Presence, Typing

### Summary

Wire Supabase Realtime for chat message delivery, presence, and typing indicators. Ensure tenant-scoped channels, ephemeral presence/typing, and no second realtime mechanism.

### Source Documentation

- `docs/07-technical-plan.md` §7
- `.cursor/rules/chat-first-realtime-safety.mdc`
- `.cursor/skills/chat-feature-planner/SKILL.md`

### Scope

**In scope:**
- Supabase Realtime channel subscription for messages (filtered by gym_id, conversation_id)
- Presence channel for online status (ephemeral)
- Typing indicator (ephemeral, not persisted)
- Server validation of channel filters

**Out of scope:**
- Persisting presence/typing
- Second realtime mechanism
- Client UI components (in surface tasks)

### Affected Packages

- `packages/supabase` (realtime helpers if any)
- API layer for channel validation

### Dependencies

- #17.3

### Acceptance Criteria

- [ ] Message INSERT events delivered via Supabase Realtime
- [ ] Presence and typing are ephemeral
- [ ] Tenant isolation enforced on channel subscription
- [ ] No second realtime mechanism introduced

### Required Tests

- Realtime subscription integration test
- Tenant scope verification

### Localization Impact

- None

### Risk Level

- High

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p0`, `surface:shared`

---

## Task 17.6: Broadcast, Template, and Quick-Reply Workflows

### Summary

Define and implement broadcast, message template, and quick-reply workflows. Keep templates and quick replies in separate tables from raw message records. Support locale-aware template variants.

### Source Documentation

- `docs/07-technical-plan.md` §7.4
- `docs/00-master-plan.md` §6.2
- `.cursor/rules/chat-first-realtime-safety.mdc`
- `.cursor/rules/localization-is-mandatory.mdc`

### Scope

**In scope:**
- Tables: `message_templates`, `quick_replies` (with locale variants)
- Contracts for broadcast, template send, quick-reply usage
- API routes: list templates, send template, list quick replies
- Broadcast as separate workflow from group messaging

**Out of scope:**
- Full campaign/automation (later epic)
- AI-generated replies

### Affected Packages

- `packages/contracts`
- `packages/supabase`
- API layer

### Dependencies

- #17.3

### Acceptance Criteria

- [ ] Templates and quick replies in separate tables
- [ ] Locale-aware variants supported
- [ ] Broadcast workflow distinct from free-form group messaging
- [ ] API routes for templates and quick replies

### Required Tests

- Integration tests for template send, locale fallback

### Localization Impact

- High — templates and quick replies require locale variants and fallback

### Risk Level

- Medium

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p1`, `surface:shared`

---

## Task 17.7: Audit and Moderation Hooks

### Summary

Implement audit logging for staff-assigned chat reassignments and important chat moderation actions. Ensure assignment changes preserve auditability.

### Source Documentation

- `docs/07-technical-plan.md` §9
- `.cursor/rules/auditability-analytics-and-observability.mdc`
- `.cursor/rules/chat-first-realtime-safety.mdc`

### Scope

**In scope:**
- Audit events for: conversation assignment, reassignment
- Moderation hook points (flag, mute, etc.) — stubs if full moderation is later
- `audit_events` table usage for chat-related actions

**Out of scope:**
- Full moderation UI
- Platform admin oversight views (later)

### Affected Packages

- `packages/supabase`
- API layer (audit calls)

### Dependencies

- #17.1, #17.3

### Acceptance Criteria

- [ ] Assignment changes write to audit_events
- [ ] Reassignment captures who assigned, when, from whom
- [ ] Moderation hook points documented

### Required Tests

- Integration test for assignment audit log

### Localization Impact

- None

### Risk Level

- Medium

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p1`, `surface:shared`

---

## Task 17.8: Mobile-User Chat Experience

### Summary

Implement member-facing chat UI in `apps/mobile-user`. Conversation list, message thread, send message, read receipts, typing indicators. Uses api-client and Supabase Realtime.

### Source Documentation

- `docs/01-user-app-plan.md` §3.2, §4.4
- `docs/07-technical-plan.md` §7
- `.cursor/rules/localization-is-mandatory.mdc`

### Scope

**In scope:**
- Conversation list with unread badges
- 1:1 with gym, 1:1 with instructor
- Message thread, send, optimistic UI
- Read receipts, typing indicators
- Translation keys for all UI text

**Out of scope:**
- Group class chats (can be follow-up)
- Voice notes, advanced attachments (can be follow-up)

### Affected Packages

- `apps/mobile-user`
- `packages/ui-native` (if shared components)

### Dependencies

- #17.4, #17.5

### Acceptance Criteria

- [ ] Conversation list loads and shows unread
- [ ] Message send works with optimistic UI
- [ ] Realtime updates deliver new messages
- [ ] Read receipts and typing visible
- [ ] All strings from translation resources

### Required Tests

- Component tests for chat screens
- E2E or flow test for send message

### Localization Impact

- High — all UI strings must use translation keys

### Risk Level

- High

### Owning Agent

- `owner:mobile`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p0`, `surface:mobile-user`

---

## Task 17.9: Mobile-Admin Chat Experience

### Summary

Implement staff-facing chat UI in `apps/mobile-admin`. Unified inbox, conversation list, message thread, send, assignment, quick replies.

### Source Documentation

- `docs/02-user-admin-app-plan.md` §3.3, §4.4
- `docs/07-technical-plan.md` §7
- `.cursor/rules/localization-is-mandatory.mdc`

### Scope

**In scope:**
- Unified inbox
- Filter by unread, assigned
- 1:1 member conversations
- Message thread, send, quick replies
- Assignment display
- Translation keys for all UI text

**Out of scope:**
- Staff internal chats (can be follow-up)
- Broadcast send flow (Task 17.6)

### Affected Packages

- `apps/mobile-admin`
- `packages/ui-native`

### Dependencies

- #17.4, #17.5, #17.6

### Acceptance Criteria

- [ ] Inbox loads with filters
- [ ] Message send works
- [ ] Quick replies usable
- [ ] Assignment visible
- [ ] All strings from translation resources

### Required Tests

- Component tests
- Flow test for staff reply

### Localization Impact

- High — all UI strings from translation resources

### Risk Level

- High

### Owning Agent

- `owner:mobile`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p0`, `surface:mobile-admin`

---

## Task 17.10: Web-Gym-Admin Chat Experience

### Summary

Implement gym admin chat UI in `apps/web-gym-admin`. Chat center, conversation list, message thread, assignment, templates, quick replies.

### Source Documentation

- `docs/03-user-admin-panel-plan.md` §3.6, §5
- `docs/07-technical-plan.md` §7
- `.cursor/rules/localization-is-mandatory.mdc`

### Scope

**In scope:**
- Chat center section
- Conversation list, filters (unread, assigned, branch)
- Message thread, send
- Assignment, reassignment
- Templates and quick replies
- Translation keys for all UI text

**Out of scope:**
- Search across all chats (can be follow-up)
- Full broadcast UI (can be follow-up)

### Affected Packages

- `apps/web-gym-admin`
- `packages/ui-web`

### Dependencies

- #17.4, #17.5, #17.6

### Acceptance Criteria

- [ ] Chat center loads
- [ ] Conversation list with filters
- [ ] Message send works
- [ ] Assignment and reassignment work
- [ ] Templates and quick replies usable
- [ ] All strings from translation resources

### Required Tests

- Component tests
- E2E for staff chat flow

### Localization Impact

- High — all UI strings from translation resources

### Risk Level

- High

### Owning Agent

- `owner:web`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p0`, `surface:web-gym-admin`

---

## Task 17.11: Chat Integration Tests and RLS Verification

### Summary

Implement integration tests for chat flows: send, read, reconnect. RLS verification for cross-tenant denial. Realtime and read-state verification.

### Source Documentation

- `docs/07-technical-plan.md` §10
- `.cursor/rules/testing-requirements-and-quality-bar.mdc`
- `.cursor/rules/chat-first-realtime-safety.mdc`

### Scope

**In scope:**
- Integration tests: auth, tenant permissions, send message, list messages, mark read
- RLS verification: cross-tenant denial scenarios
- Realtime subscription and message delivery test
- Read state verification

**Out of scope:**
- E2E for every surface (covered in surface tasks)

### Affected Packages

- Test fixtures
- `packages/supabase` (test helpers)

### Dependencies

- #17.3, #17.5

### Acceptance Criteria

- [ ] Chat send, read, reconnect covered
- [ ] RLS denies cross-tenant access
- [ ] Realtime delivery verified
- [ ] Read state tracked correctly

### Required Tests

- This task delivers the tests

### Localization Impact

- None

### Risk Level

- Medium

### Owning Agent

- `owner:qa`

### Recommended Labels

- `state:scoped`, `type:feature`, `priority:p0`, `surface:shared`
