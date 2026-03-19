Convert a feature request into a precise engineering task specification aligned with the MyClup workflow and technical plan.

Ground the work in the source docs. Do not invent architecture. Output a task spec and a GitHub Issue body draft.

Feature or request to scope: $ARGUMENTS

## Step 1: Ground in Source Docs

Read and cite:

- `docs/07-technical-plan.md` — architecture and technical constraints
- `AGENT.md` — engineering defaults
- `docs/08-agentic-workflow.md` — workflow rules
- Relevant product plan (`docs/01` through `docs/06`)

## Step 2: Task Specification

```markdown
## Task: [Title]

### Summary

[What is being built and why — grounded in the docs]

### Source Documentation

- `docs/[X]` §[Section]: [constraint or requirement]

### Affected Apps

- [ ] apps/mobile-user
- [ ] apps/mobile-admin
- [ ] apps/web-gym-admin
- [ ] apps/web-platform-admin
- [ ] apps/web-site

### Affected Packages

- [ ] packages/contracts — [what changes]
- [ ] packages/types — [what changes]
- [ ] packages/api-client — [what changes]
- [ ] packages/ui-web / packages/ui-native — [what changes]
- [ ] packages/supabase — [what changes]

### Dependencies

- Depends on: [task, contract, or issue]
- Blocked by: (none / list)

### Required APIs

- [endpoint: method + path + contract]

### Required Database Entities

- [table: purpose, tenant-scoped?]

### UI Surfaces Impacted

- [screen or page name + app]

### Chat Implications

[None / or: conversation type, permission checks, realtime, read-state]

### AI Implications

[None / or: service boundary, schema, feature flag, timeout/retry]

### Localization Implications

[None / or: what must be translated, locale-aware formatting needed]

### Acceptance Criteria

- [ ] [Criterion 1 — specific and testable]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

### Required Tests

- [ ] Unit: [what]
- [ ] Integration: [what]
- [ ] E2E (Playwright): [if applicable]
- [ ] Mobile (RNTL): [if applicable]
- [ ] RLS: [if tenant schema changes]

### Risk Assessment

**Risk level**: [low | medium | high]
**Reason**: [1 sentence]
```

## Step 3: Suggested Labels

```
owner:[agent based on primary work]
state:scoped
type:[feature | bug | tech-debt | docs | infra]
priority:[p0 | p1 | p2]
surface:[most relevant surface or "shared"]
```

## Rules

- No architecture invention — every decision must be traceable to a doc
- Scope must be conservative — no speculative additions
- Always include testing requirements
- Always include localization implications for client-facing work
- Note RLS and permission requirements when tenant-owned data is involved
