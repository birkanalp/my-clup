Validate whether the feature, issue, or milestone described is ready for release.

Human approval remains mandatory. This command prepares the readiness report and surfaces any blockers.

Feature, issue number, or milestone to check: $ARGUMENTS

## Release Readiness Check

### Gate Checklist

Work through each gate and mark status:

- [ ] **Review passed** — `state:reviewed` set; no open review blockers
- [ ] **Required tests passed** — test evidence present; no failing tests
- [ ] **Migration concerns understood** — any schema migrations are safe and reversible (or rollback is planned)
- [ ] **Environment concerns understood** — env vars, feature flags, infra dependencies are in place
- [ ] **Approval recorded** — who approved and when

### Release-Sensitive Area Check

Does this release touch any of these areas?

- [ ] Auth flows
- [ ] Billing or payment
- [ ] Tenant safety / cross-tenant access
- [ ] Chat reliability
- [ ] AI fallback behavior
- [ ] Locale behavior
- [ ] SEO behavior (web-site)

If yes, confirm explicit review and signoff for each affected area.

### Blocking Conditions

Release must NOT proceed if any of these apply:

- Required tests are missing or failing
- Approval is missing
- Review blockers are unresolved
- Migration safety is not understood
- Critical security or tenant-safety gaps exist
- Localization coverage is missing on client-facing work
- Contract drift exists between client and server
- Sensitive flows (role changes, billing, impersonation) lack audit logging

---

## Output: Release Readiness Comment

```markdown
## Release Readiness

**Status**: [READY | NOT READY]

### Summary

[1–2 sentences: what is being released and gate status.]

### Gate Checklist

- [ ] Prior review passed
- [ ] Required tests passed
- [ ] Migration concerns understood
- [ ] Environment concerns understood
- [ ] Approval recorded

### Blockers

[List specific blockers or "None"]

### Rollback / Risk Notes

[Describe rollback plan or risk mitigation, if relevant]

### Recommended State Transition

- If READY: `state:reviewed` → `state:approved` → `state:integrated` → `state:done`
- If NOT READY: keep `state:blocked` until blockers resolved
```

## Rules

- Be specific about blockers — "something might be wrong" is not a valid blocker
- Include deployment considerations only when relevant
- Do not treat code review approval as release approval
- `state:approved` belongs to the release or human signoff stage
- `state:done` applies only after all prior gates are satisfied
