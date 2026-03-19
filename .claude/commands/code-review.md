Perform a blocking code review of the change set or PR described.

Verify compliance with MyClup rules and emit a structured review decision. Block approval if any critical rule is violated.

Change set to review: $ARGUMENTS

If no argument is provided, review the current working changes (git diff or recently modified files).

## Verification Checklist

Go through each category and note findings:

### Architecture

- Does this stay within `docs/07-technical-plan.md` boundaries?
- Are package boundaries respected?
- Is business logic outside UI packages?

### Contract Updates

- Did any API endpoint change without updating `packages/contracts`?
- Are Zod schemas updated and used for validation?
- Is `packages/api-client` updated where needed?

### Localization

- Are there hardcoded user-facing strings in screens, pages, or shared components?
- Are translation keys defined for all new user-facing text?
- Are dates, times, numbers, currencies formatted with locale utilities?

### Test Coverage

- Are required tests written and passing?
- Do permission-sensitive flows have explicit tests?
- Do chat changes have realtime and read-state verification?
- Do AI changes have schema validation tests?

### Tenant Safety

- Are permission checks server-side only?
- Is `tenant_id`/`branch_id` derived or validated server-side (never trusted from client)?
- Are tenant-owned table changes covered by RLS review?
- Does cross-tenant access have audit logging?

### Chat Safety

- Is tenant isolation enforced on conversation queries?
- Is conversation membership validated server-side before message access?
- Is message creation idempotent?

### AI Validation

- Is AI server-side only?
- Are all AI outputs validated with Zod schemas?
- Is a feature flag present?

### Scope Discipline

- Are there changes to files outside the declared issue scope?
- If yes, is there orchestrator approval?

---

## Review Decision

Use exactly one:

**APPROVE** — all checks pass; recommend `state:reviewed`

**REQUEST_CHANGES** — fixable issues found; specify what must change; keep ownership with the fixing agent

**BLOCK** — critical rule violation; apply `state:blocked`; identify who resolves

---

## Review Comment

```markdown
## Review Result

**Decision**: [APPROVE | REQUEST_CHANGES | BLOCK]

**Findings**:

- [finding 1 — cite specific rule or file:line]
- [finding 2]

### Label Changes

- Remove: `owner:review`
- Add: [state:reviewed | state:blocked]

### Action Required

[What must be fixed, or confirmation that next step is release/orchestration]
```

---

## Critical Blockers (must BLOCK if any exist)

- Missing translation support on client-facing features
- API changes without contract updates
- Schema changes affecting tenant data without RLS review
- Chat changes without read-state or permission checks
- AI changes without Zod schema validation
- Critical flows without tests
- Out-of-scope file changes without approval
- Architecture drift from `docs/07-technical-plan.md`
- Permission logic only in UI
- Client-provided tenant trusted without server validation
- Cross-tenant access without audit logging
