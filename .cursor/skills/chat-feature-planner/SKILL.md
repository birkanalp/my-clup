---
name: chat-feature-planner
description: Design chat features compatible with Postgres persistence, Supabase Realtime, cursor pagination, and tenant isolation. Use when planning chat UI, realtime, or message flows. Outputs conversation/message model impact, realtime logic, permissions, storage, localization. Prevents cross-tenant leaks, unauthorized access, client-side permission enforcement.
---

# Chat Feature Planner

## Purpose

Design features that interact with the chat subsystem. Ensure compatibility with Postgres message persistence, Supabase Realtime, cursor-based pagination, and tenant isolation. **Prevent** cross-tenant message leaks, unauthorized conversation access, and client-side permission enforcement.

## Core Constraints

- **Storage**: Durable messages in Postgres; attachments in Supabase Storage
- **Realtime**: Supabase Realtime only; no second mechanism
- **Pagination**: Cursor-based for conversation history
- **Tenant isolation**: Enforced on every query; cross-tenant denied by default
- **Permissions**: Server-side only; never trust UI for access control

## Supported Conversation Types

- Direct
- Member-to-gym support
- Member-to-instructor
- Group
- Broadcast (separate from group messaging)
- Internal staff

## Output Template

Emit this structure for each chat feature:

```markdown
# Chat Feature Plan: [Feature Name]

## Conversation Model Impact

- **New fields?** [List if any]
- **New conversation types?** [Direct | Support | Instructor | Group | Broadcast | Internal staff]
- **Tenant scoping**: `gym_id` on conversation; `branch_id` if branch-scoped
- **Membership**: ConversationParticipant required before access

## Message Model Impact

- **New message types or metadata?** [List]
- **Idempotency**: Message creation must be idempotent (dedupe key)
- **Read state**: MessageReceipt per participant; required
- **Attachments**: Via MessageAttachment; stored in Supabase Storage

## Realtime Subscription Logic

- **Channels**: [Which Supabase Realtime channel(s)]
- **Filters**: [Tenant/gym_id, conversation_id — server-validated]
- **Optimistic UI**: Allowed; reconcile with server-confirmed messages
- **Presence/typing**: Ephemeral; do not persist

## Permissions Checks

- **Server-side**: [List required checks — identity, membership, tenant scope]
- **Before message access**: Validate ConversationParticipant + tenant
- **Before write**: Validate role, tenant, membership
- **Forbidden**: Client-side permission enforcement; trusting UI state

## Storage Implications

- **Messages**: Postgres only
- **Attachments**: Supabase Storage; metadata in MessageAttachment
- **Labels, templates, quick replies**: Separate tables; not in raw message records
- **Assignment**: ConversationAssignment; auditable for reassignment

## Localization Implications

- **Templates, automated replies, chatbot content**: Locale-aware variants required
- **UI strings**: Translation keys; no hardcoded text
- **Member-facing content**: Respect user locale preference
```

## Prohibited Patterns

- **Cross-tenant message leaks**: Realtime or API must filter by `gym_id`; RLS on Postgres; never return messages from other tenants
- **Unauthorized conversation access**: Validate ConversationParticipant membership server-side before any message fetch or subscription
- **Client-side permission enforcement**: All auth, tenant, and role checks must happen server-side; UI can hide buttons but cannot gate data access
- **Client-side search**: Cross-conversation message search must be server-side
- **Second realtime mechanism**: Use only Supabase Realtime
- **Persistent presence/typing**: Ephemeral only
- **Non-idempotent message creation**: Dedupe key required
- **Business logic in UI packages**: Orchestration stays in app or server

## Required Contracts

| Contract                  | Purpose                       |
| ------------------------- | ----------------------------- |
| `Conversation`            | Metadata, tenant, type        |
| `ConversationParticipant` | Membership                    |
| `Message`                 | Content, sender, conversation |
| `MessageAttachment`       | Attachment metadata           |
| `MessageReceipt`          | Per-participant read state    |
| `ConversationAssignment`  | Staff assignment              |
| `TypingState`             | Ephemeral                     |

Assignment, labels, templates, and quick replies must remain separate from raw message records.
