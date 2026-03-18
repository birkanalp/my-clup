---
name: test-plan-generator
description: Generate test plans for new features. Use when scoping tests, implementing features, or reviewing coverage. Outputs unit, integration, E2E, and RLS tests. Special rules for chat, auth, and AI features.
---

# Test Plan Generator

## Purpose

Given a feature scope, produce a test plan covering unit, integration, E2E, and RLS security tests. Apply special-case requirements for chat, auth, and AI features.

## Test Categories

| Category | Scope | Tool |
|----------|-------|------|
| **Unit** | Shared utilities, schemas, parsing, domain logic | Jest |
| **Integration** | Auth, permissions, memberships, bookings, chat, tenant flows | Test framework + Supabase fixtures |
| **E2E** | Critical web journeys | Playwright |
| **Mobile** | Component and flow tests | React Native Testing Library |
| **RLS** | Cross-tenant denial, tenant isolation | RLS verification tests |

## Output Template

Emit this structure for each feature:

```markdown
# Test Plan: [Feature Name]

## Test Categories

- [ ] Unit
- [ ] Integration
- [ ] E2E
- [ ] Mobile (if applicable)
- [ ] RLS (if tenant/schema change)

## Unit Tests

| Test case | Description | Expected outcome |
|-----------|-------------|------------------|
| [name] | [what it tests] | [pass condition] |

## Integration Tests

| Test case | Description | Expected outcome |
|-----------|-------------|------------------|
| [name] | [what it tests] | [pass condition] |

## E2E Tests

| Test case | Description | Expected outcome |
|-----------|-------------|------------------|
| [name] | [critical journey] | [pass condition] |

## RLS Security Tests

| Test case | Description | Expected outcome |
|-----------|-------------|------------------|
| [name] | [cross-tenant scenario] | Access denied |

## Edge Cases

- [Edge case 1]: [expected behavior]
- [Edge case 2]: [expected behavior]
- ...
```

## Special Cases

### Chat Features

Must include tests for:

- **Send**: Message creation, idempotency (dedupe), tenant-scoped delivery
- **Read state**: MessageReceipt per participant, read state updates
- **Reconnect**: Realtime subscription restore, message sync after reconnect
- **Tenant isolation**: No messages from other gyms; RLS denies cross-tenant queries

### Auth Features

Must include tests for:

- **Role checks**: User with correct role can access; incorrect role denied
- **Permission denial**: Unauthorized action returns 403 or equivalent
- **Cross-tenant access rejection**: User from gym A cannot access gym B data; RLS and server validation

### AI Features

Must include tests for:

- **Schema validation**: AI output passes Zod schema; invalid output triggers fallback
- **Timeout fallback**: AI timeout returns fallback or graceful degradation; no unhandled exception
- **Feature flag**: When disabled, AI path is skipped; fallback used
- **Retry**: Retry policy exercised on transient failure

## Baseline Scenarios (Reference)

These must be covered in the overall test strategy:

- Login flows
- Member lifecycle
- Class booking and cancellation
- Chat send, read, and reconnect
- AI workout formatting returns valid schema
- Multi-role user across gyms and branches
- Admin-only elevated operations remain audited

## Rules

- **Permission-sensitive logic**: Requires explicit tests; never skip
- **Contract changes**: Trigger downstream validation tests across affected apps
- **Schema changes affecting tenant data**: RLS review and RLS tests required
- **Chat changes**: Realtime and read-state verification required
- **Shared packages**: Unit coverage where logic exists
