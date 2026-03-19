Generate an implementation-ready GitHub Issue body for the feature or task described.

Read the relevant source docs first. Output must be paste-ready for GitHub. Acceptance criteria must use checklist syntax. Use only apps and packages defined in the technical plan.

Feature or task: $ARGUMENTS

## Output: GitHub Issue Body

```markdown
## Summary

[1–3 sentences: what this task implements and why it's needed.]

## Source Documentation

- `docs/[X]` §[Section]: [relevant constraint or requirement]
- `docs/[Y]` §[Section]: [relevant constraint or requirement]

## Scope

**Owning Agent**: `owner:[agent]`
**Collaborating Agents**: `owner:[agent]` (if any — otherwise "None")

**Affected Apps**:

- [ ] apps/mobile-user
- [ ] apps/mobile-admin
- [ ] apps/web-gym-admin
- [ ] apps/web-platform-admin
- [ ] apps/web-site

**Files or Packages in Scope**:

- `packages/[package]/src/...`
- `apps/[app]/src/...`

## Dependencies

- Depends on: #[issue] — [description]
- Blocked by: (none / list)

## Acceptance Criteria

- [ ] [Criterion 1 — specific and testable]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Required Tests

- [ ] Unit: [what to test]
- [ ] Integration: [what to test]
- [ ] E2E (Playwright): [critical journey — if applicable]
- [ ] Mobile (RNTL): [if applicable]
- [ ] RLS: [cross-tenant denial — if tenant schema changes]

## Localization Impact

- Client-facing strings: [Yes / No — if yes, list translation keys or areas]
- Locale-aware formatting: [Yes / No]
- Fallback behavior: [describe]

## Risk Level

**Risk**: [low | medium | high]

[1 sentence explaining why.]
```

## Suggested Labels

```
owner:[agent]
state:scoped
type:[feature | bug | tech-debt | docs | infra]
priority:[p0 | p1 | p2]
surface:[mobile-user | mobile-admin | web-gym-admin | web-platform-admin | web-site | shared]
```

## Rules Applied

- Acceptance criteria use checklist syntax
- Only apps and packages from the technical plan are referenced
- Scope is conservative — no speculative additions
- Source docs are cited
- Testing and localization are never omitted for client-facing work
