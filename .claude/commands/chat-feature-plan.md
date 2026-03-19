Design a chat feature compatible with the MyClup chat subsystem architecture.

Chat is a core platform subsystem. All chat features must respect Postgres persistence, Supabase Realtime, cursor pagination, tenant isolation, and server-side permission enforcement.

Feature to design: $ARGUMENTS

Produce the following plan:

## Chat Feature Plan: [Feature Name]

### Conversation Model Impact

- **New fields?** List any new columns or fields on `Conversation`
- **New conversation type?** Direct | Support | Instructor | Group | Broadcast | Internal staff
- **Tenant scoping**: `gym_id` on conversation; `branch_id` if branch-scoped
- **Membership**: `ConversationParticipant` required before any message access

### Message Model Impact

- **New message types or metadata?** List changes
- **Idempotency**: Message creation must use a dedupe key
- **Read state**: `MessageReceipt` per participant — required, not optional
- **Attachments**: via `MessageAttachment`; stored in Supabase Storage

### Realtime Subscription Logic

- **Channels**: which Supabase Realtime channel(s)
- **Filters**: tenant/gym_id + conversation_id — server-validated
- **Optimistic UI**: allowed; reconcile with server-confirmed messages
- **Presence/typing**: ephemeral only — do not persist

### Permission Checks (Server-Side Only)

- Required checks before message access: identity, `ConversationParticipant` membership, tenant scope
- Required checks before write: role, tenant, membership
- Forbidden: client-side permission enforcement, trusting UI state

### Storage Implications

- Messages: Postgres only
- Attachments: Supabase Storage; metadata in `MessageAttachment`
- Labels, templates, quick replies: separate tables; not in raw message records
- Assignment: `ConversationAssignment`; must be auditable for reassignment

### Localization Implications

- Templates, automated replies, chatbot content: locale-aware variants required
- UI strings: translation keys; no hardcoded text
- Member-facing content: respect user locale preference

### Contract Impact

List which shared contracts need new fields or updates:

| Contract                  | Change |
| ------------------------- | ------ |
| `Conversation`            |        |
| `ConversationParticipant` |        |
| `Message`                 |        |
| `MessageAttachment`       |        |
| `MessageReceipt`          |        |
| `ConversationAssignment`  |        |
| `TypingState`             |        |

### Review Checklist

- [ ] Tenant isolation enforced on every conversation query
- [ ] Message creation is idempotent
- [ ] Search is server-side (no client-side cross-conversation search)
- [ ] Read state and permission checks implemented
- [ ] Assignment changes are auditable
- [ ] Locale-aware variants for templates/automated replies
- [ ] No second realtime mechanism introduced
- [ ] Durable messages in Postgres; attachments in Supabase Storage
