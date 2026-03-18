---
name: github-blocker-escalation-writer
description: Write precise blocker comments when an issue cannot move forward safely. Use when work is blocked, scope is unclear, dependency is missing, or decision is needed. Outputs copy-paste ready GitHub comment with blocker summary, root cause, escalation owner, recommended label changes. Favors early escalation over silent guessing.
---

# GitHub Blocker Escalation Writer

## Purpose

When work cannot safely continue, produce a clear blocker comment for the GitHub Issue. Align with `github-label-handoff-governance` blocked-state protocol. **Escalate early** — do not guess, assume, or proceed when blocked.

## When to Use

- Scope ambiguity or conflicting requirements
- Missing dependency (contract, API, approval)
- Architecture or technical uncertainty
- Review or approval blocked
- Test or tooling failure blocking progress
- Permission, access, or environment block
- Any situation where proceeding risks rework or violation of rules

## Output Template (Copy-paste ready)

```markdown
## Blocker

### Summary
[1–2 sentences: what is blocking and at what stage.]

### Root Cause
[Why this blocker exists. Underlying reason, not symptom.]

### Why Work Cannot Safely Continue
[Specific risk if work proceeds: rework, scope violation, architecture drift, test gap, etc.]

### Decision or Dependency Needed
- **Decision**: [What must be decided, by whom, with what options]
- **Dependency**: [What must exist first — task, approval, artifact]
- **Unblock condition**: [Concrete condition that resolves the blocker]

### Who Should Resolve
**Unblock owner**: `owner:[role]` — [orchestrator | pm | architect | backend | …]

[Role that can make the decision or provide the dependency.]

### Recommended Temporary Label Changes
| Action | Label | Reason |
|--------|-------|--------|
| Add | `state:blocked` | Work halted until unblocked |
| Set | `owner:[unblock-owner]` | Ownership for unblock decision |
| Remove | `state:in-progress` (if present) | No active implementation |

---
*Escalated per github-label-handoff-governance. Do not proceed until unblocked.*
```

## Unblock Owner Mapping

| Blocker type | Typical unblock owner |
|--------------|------------------------|
| Scope / requirements | pm, orchestrator |
| Architecture / design | architect |
| Contract / API dependency | architect, backend |
| Review / approval | review, human |
| Environment / access | orchestrator, release |
| Test / tooling | qa, backend |
| Cross-team / sequencing | orchestrator |

## Escalation Principle

**Favor early escalation over silent guessing.**

- If uncertain about scope → escalate; do not assume
- If dependency is missing → escalate; do not stub or skip
- If architecture is unclear → escalate; do not invent
- If approval is needed → escalate; do not proceed without it
- If blocked by another task → escalate with clear dependency; do not work around

## Rules

- **Always apply `state:blocked`** when emitting a blocker comment
- **Be specific**: Name the decision, dependency, or condition
- **Name the unblock owner**: Exactly one role that can resolve
- **No vague blockers**: "Waiting on something" is insufficient; specify what and who
- **Cite governance**: Blocker comment satisfies github-label-handoff-governance blocked-state protocol
