Generate a test plan for the feature or change described.

Cover unit, integration, E2E, mobile, and RLS security tests. Apply special-case requirements for chat, auth, and AI features.

Feature or change to plan tests for: $ARGUMENTS

## Test Plan: [Feature Name]

### Test Categories Required

- [ ] Unit — shared utilities, schemas, parsing, domain logic
- [ ] Integration — auth, permissions, memberships, bookings, chat, tenant flows
- [ ] E2E (Playwright) — critical web journeys
- [ ] Mobile (React Native Testing Library) — if applicable
- [ ] RLS security — if tenant schema or cross-tenant access changes

---

### Unit Tests

| Test case | What it tests | Expected outcome |
|-----------|---------------|------------------|
| [name] | [description] | [pass condition] |

---

### Integration Tests

| Test case | What it tests | Expected outcome |
|-----------|---------------|------------------|
| [name] | [description] | [pass condition] |

---

### E2E Tests (Playwright)

| Test case | Critical journey | Expected outcome |
|-----------|------------------|------------------|
| [name] | [user flow] | [pass condition] |

---

### RLS Security Tests

| Test case | Scenario | Expected outcome |
|-----------|----------|------------------|
| [name] | Cross-tenant access attempt | Access denied |
| [name] | Wrong gym user accessing data | 403 / empty |

---

### Edge Cases

- [Edge case 1]: [expected behavior]
- [Edge case 2]: [expected behavior]

---

## Special Cases

### If this is a Chat Feature, also include:

- **Send**: message creation, idempotency (dedupe key), tenant-scoped delivery
- **Read state**: `MessageReceipt` per participant; read state updates correctly
- **Reconnect**: Realtime subscription restore; message sync after reconnect
- **Tenant isolation**: No messages from other gyms; RLS denies cross-tenant queries

### If this is an Auth Feature, also include:

- **Role checks**: user with correct role can access; incorrect role is denied
- **Permission denial**: unauthorized action returns 403 or equivalent
- **Cross-tenant rejection**: user from gym A cannot access gym B data (RLS + server validation)

### If this is an AI Feature, also include:

- **Schema validation**: AI output passes Zod schema; invalid output triggers fallback
- **Timeout fallback**: AI timeout returns fallback or graceful degradation; no unhandled exception
- **Feature flag**: when disabled, AI path is skipped and fallback is used
- **Retry**: retry policy is exercised on transient failure

---

## Baseline Scenarios Reference

These must be covered in the overall test strategy (not necessarily this single feature):

- Login flows
- Member lifecycle
- Class booking and cancellation
- Chat send, read, and reconnect
- AI workout formatting returns valid schema
- Multi-role user across gyms and branches
- Admin-only elevated operations remain audited

---

## Rules

- Permission-sensitive logic: explicit tests required, never skip
- Contract changes: downstream validation tests across all affected apps
- Schema changes affecting tenant data: RLS review + RLS tests required
- Chat changes: realtime and read-state verification required
- Shared packages: unit coverage where logic exists
