# MyClup — Claude Code Instructions

This file governs how Claude Code operates inside this repository. It supplements the global `~/.claude/CLAUDE.md` and overrides it where conflicts exist. Always read this file first before working on any task.

---

## 1. Required Reading Before Any Implementation

Before proposing or writing any code, read these documents in order:

1. `docs/07-technical-plan.md` — architecture and technical decisions (highest authority)
2. `AGENT.md` — engineering defaults and repo-wide rules
3. `docs/08-agentic-workflow.md` — workflow, issue, handoff, review, and release rules
4. `docs/00-master-plan.md` — roadmap intent and prioritization context
5. Product plans `docs/01` through `docs/06` — feature and scope details

**Conflict resolution order**: if docs disagree, the order above wins. When the order does not resolve the conflict safely, stop and ask.

Never propose implementation without grounding it in the source docs. Never invent architecture or workflow behavior when the docs already define it.

---

## 2. Stack — Non-Negotiable Defaults

Do not substitute these without updating `docs/07-technical-plan.md`:

- **Package manager**: `pnpm` (never npm or yarn in this repo)
- **Monorepo orchestrator**: `turborepo`
- **Language**: `TypeScript` (strict mode throughout)
- **Backend surface**: Next.js BFF / API routes
- **Database / Auth / Realtime / Storage**: Supabase
- **Mobile**: Expo + React Native + NativeWind
- **Web styling**: Tailwind CSS
- **AI runtime**: Ollama (Qwen small instruct; version from env config)
- **Analytics**: Google Analytics 4
- **E2E testing**: Playwright
- **Containerization**: Docker

---

## 3. Monorepo Structure and Package Ownership

### App boundaries

```
apps/
  mobile-user/         # Expo member app
  mobile-admin/        # Expo gym/instructor app
  web-gym-admin/       # Next.js gym panel
  web-platform-admin/  # Next.js platform admin
  web-site/            # Next.js marketing/SEO site
```

### Shared package ownership

| Package | Owns — strictly |
|---------|-----------------|
| `packages/contracts` | API schemas, Zod validation, request/response contracts |
| `packages/types` | Framework-agnostic domain types |
| `packages/api-client` | The single shared network client — never bypass or duplicate |
| `packages/utils` | Pure, framework-agnostic helpers and formatters |
| `packages/ui-web` | Web presentation primitives — no business logic, no API calls |
| `packages/ui-native` | Native presentation primitives — no business logic, no tenant checks |
| `packages/supabase` | DB types, shared clients, RLS helpers, server helpers |

### Hard rules

- Never duplicate types, schemas, or contracts inside apps — import from the shared package
- Never create a second network client alongside `api-client` — extend it instead
- Never add business logic to `ui-web` or `ui-native`
- Never add framework-specific code to `utils` or `types`
- Never create a new shared package unless the reuse is real and immediate
- Never move app-specific flows into shared packages speculatively

---

## 4. Shared Contracts — Define Before Implement

When web, mobile, and backend share an API boundary:

1. Define or update the contract in `packages/contracts` or `packages/types` **first**
2. Use `/api/v1` for all versioned API routes
3. Forms validate against shared Zod schemas — never local redefinitions

**Contract change checklist** — all must happen together:
- [ ] Schema updated in `packages/contracts` (or type in `packages/types`)
- [ ] Server/API implementation updated
- [ ] Typed client in `packages/api-client` updated
- [ ] All affected app call sites updated
- [ ] Tests updated or added

---

## 5. Tenant Safety — Always Server-Side

- Tenant model: `gym` is root tenant; `branch` is operational scope
- Every write path must verify role and tenant scope **on the server**
- Never trust `tenant_id` or `branch_id` from the client — derive or validate from server context
- Row Level Security is mandatory for tenant-owned data
- Cross-tenant access is denied by default — requires audit trail
- Permission checks must never rely on UI-only logic

**Sensitive flows requiring audit logging:**
role changes, billing overrides, membership manual extension, refunds, admin impersonation, cross-tenant support access

**Server check sequence before any write or elevated op:**
1. Verify `user.id` (Supabase identity)
2. Verify tenant scope (gym, branch) and user access
3. Verify role permits the action
4. For sensitive flows: record audit event before/after

---

## 6. Localization — Mandatory on All Client Surfaces

Every client-facing feature is incomplete without localization. This applies to: `mobile-user`, `mobile-admin`, `web-gym-admin`, `web-platform-admin`, `web-site`.

- All user-facing text must come from translation resources — no hardcoded strings in screens, pages, or shared components
- Dates, times, numbers, currencies, and measurement units must use shared locale utilities
- Missing translations must fall back: requested locale → default locale → safe placeholder
- User language preference must be modeled and respected
- Legal, consent, campaign, and chatbot content needs per-locale variants
- Consider RTL layout readiness in component design even if v1 is LTR-first

**Localization review checklist** (before a client-facing task is done):
- [ ] No hardcoded strings in screens, pages, or shared components
- [ ] Translation keys exist for all new user-facing text
- [ ] Locale-aware formatting for dates, times, numbers, currencies, units
- [ ] Fallback behavior defined and tested

---

## 7. Chat — Core Subsystem Rules

Chat is a flagship capability, not a side feature. Any chat-related change must enforce:

- **Storage**: durable messages → Postgres
- **Live delivery**: Supabase Realtime only — do not introduce a second realtime mechanism
- **Attachments**: Supabase Storage
- **Read state**: tracked per participant; read receipts required
- **Pagination**: cursor-based for conversation history
- **Message creation**: must be idempotent
- **Search**: server-side only; no client-side cross-conversation search
- **Tenant isolation**: enforced on every conversation query
- **Membership validation**: required before message access

**Block merge if:**
- Tenant isolation is missing on conversation or message access
- Message creation is not idempotent
- Read state or permission checks are missing
- A second realtime mechanism is introduced
- Durable messages are stored outside Postgres or attachments outside Supabase Storage

---

## 8. AI — Server-Side Only

- AI requests go through the shared server-side service boundary — no client app may call Ollama directly
- All AI outputs must be validated against Zod schemas
- Prompt templates must be versioned in code
- Every AI call requires: timeout, retry policy, feature flag to disable
- AI user-facing text must include explicit locale control
- Logging and tracing are required on every AI call

**AI implementation checklist:**
- [ ] AI call goes through shared server-side boundary
- [ ] Prompt template is versioned in code
- [ ] Output Zod schema is defined and enforced
- [ ] Timeout configured
- [ ] Retry policy configured
- [ ] Feature flag exists to disable the flow
- [ ] Locale passed for user-facing input/output
- [ ] Logging and tracing present
- [ ] Graceful fallback behavior implemented

---

## 9. Website — SEO and Public Content

The website (`apps/web-site`) is multilingual and SEO-first from day one:

- Locale-prefixed routing is required
- Every public page needs: localized metadata, canonical URL handling, `hreflang` alternate links
- Sitemap generation and structured data where relevant
- Legal and policy pages must be versioned per locale
- Missing public translations fall back safely to default locale
- Do not share marketing UI primitives with admin panels without justification

---

## 10. Testing Requirements

Testing is part of delivery — a task is not done until required tests are written and passing.

| Layer | Scope | Tool |
|-------|-------|------|
| Unit | Shared utilities, schemas, parsing, non-trivial domain logic | Jest |
| Integration | Auth, permissions, memberships, bookings, chat, tenant-sensitive flows | Jest + Supabase fixtures |
| E2E | Critical web journeys | Playwright |
| Mobile | Component and flow tests | React Native Testing Library |
| RLS | Cross-tenant denial scenarios | RLS verification tests |

**Do not merge if:**
- Required tests are missing or failing
- A schema change affecting tenant-owned data has no RLS review
- Permission-sensitive logic has no explicit tests
- A chat change lacks realtime and read-state verification
- A critical flow ships without appropriate tests

---

## 11. Auditability and Observability

When adding or changing user-visible features, decide and implement:
- [ ] Analytics events — needed? add with shared naming convention
- [ ] Audit events — touches role/membership/payments/impersonation/tenant overrides/chat moderation? audit log it
- [ ] Operational logs — needs server-side visibility? add structured logging
- [ ] Error visibility — can fail in ways that need tracing? ensure failures are observable

Critical backend failures must be traceable. Prepare error monitoring abstraction for provider integration.

---

## 12. GitHub Issue-Driven Delivery

Every implementation task must be a GitHub Issue before work begins. No feature implementation starts without a scoped and assigned issue.

**Mandatory issue fields:**
Summary, Source doc reference, Acceptance criteria, Owning agent, Collaborating agents, Files/packages in scope, Dependencies, Required tests, Localization impact, Risk level

**Label governance:**
- Exactly one active `owner:*` label at a time
- Exactly one active `state:*` label at a time
- Replace labels on transition — do not stack them

**Owner labels:** `owner:orchestrator` `owner:backend` `owner:web` `owner:mobile` `owner:ai` `owner:qa` `owner:review` `owner:release`

**Lifecycle labels:** `state:proposed` → `state:clarified` → `state:scoped` → `state:assigned` → `state:in-progress` → `state:implemented` → `state:tested` → `state:reviewed` → `state:approved` → `state:integrated` → `state:done` (or `state:blocked`)

**Handoff comment must include:**
- What was completed
- What remains
- Changed files or packages
- Test status
- Localization implications
- Known risks

---

## 13. Branch and PR Conventions

When delivering implementation work:

1. Branch name: `feat/issue-<number>-<slug>` or `chore/issue-<number>-<slug>`
2. Commit messages must reference the issue number
3. Push branch and create a GitHub PR before handing off to QA
4. PR title: `<type>(issue-<number>): <short description>`
5. PR body must include: `Closes #<number>`, Epic reference, Summary, Acceptance criteria checklist, Validation commands and results
6. Add PR link as a comment on the issue

A task is **not implementation-complete** until the PR exists.

---

## 14. Definition of Done

A task is done only when **all** of the following are true:
- [ ] Implementation is complete
- [ ] Required tests written and passing
- [ ] Localization requirements satisfied
- [ ] Review findings resolved
- [ ] Acceptance criteria met
- [ ] Integration complete
- [ ] Approval recorded when required

**Review must block merge if:**
- Client-facing strings are not localized
- API changes lack contract updates
- Schema changes lack RLS review
- Chat changes lack read-state or permission checks
- AI changes lack schema validation
- Critical flows lack tests
- Out-of-scope file changes lack orchestrator approval
- Architecture drifts from `docs/07-technical-plan.md`

---

## 15. Scope Discipline

- Work only inside files and packages declared in the issue scope
- If you need to change files outside declared scope: add an issue comment with justification and stop until orchestrator approves
- Parallel execution is safe only when: file ownership does not overlap, package ownership does not overlap, contracts are already aligned, integration points are explicit
- When scopes overlap: sequence the work or escalate to orchestrator

---

## 16. Claude Code Behavior Rules

### Before implementing

- Read relevant source docs (section 1 above) and summarize the applicable constraints
- Identify where similar work exists in the codebase and follow that pattern
- Know which files will be touched before touching them
- If a requirement is ambiguous, look at more code before asking

### While implementing

- Implement completely — no stubs, no placeholder comments, no half-wired features
- When creating a file, follow existing naming and folder conventions exactly
- When updating code, check ripple effects: types, imports, usages, tests
- When debugging, trace the actual code path — do not guess
- When fixing a bug, find and fix the root cause

### Communication

- Push back when an approach violates the rules in this file or creates technical debt
- State which document or rule is being violated when blocking or redirecting
- When uncertain about conflict resolution, ask instead of guessing
- Keep responses concise and directly actionable

### Things to never do in this repo

- Call Supabase with elevated privileges from client code
- Call Ollama from any client app
- Use `any` without documented justification
- Hardcode user-facing strings in feature screens or components
- Duplicate contracts, types, or clients inside app folders
- Trust UI state for authorization decisions
- Create a new shared package without clear cross-app reuse need
- Ship client-facing features without translation keys and locale fallback
