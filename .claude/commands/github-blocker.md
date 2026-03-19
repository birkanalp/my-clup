Write a precise GitHub blocker escalation comment for the issue described.

Use when work cannot safely continue. Escalate early — do not guess, assume, or proceed when blocked.

Blocker situation: $ARGUMENTS

## Output: Copy-paste ready GitHub comment

```markdown
## Blocker

### Summary
[1–2 sentences: what is blocking and at what stage.]

### Root Cause
[Why this blocker exists. Underlying reason, not symptom.]

### Why Work Cannot Safely Continue
[Specific risk if work proceeds: rework, scope violation, architecture drift, test gap, data corruption, security issue, etc.]

### Decision or Dependency Needed
- **Decision**: [What must be decided, by whom, with what options]
- **Dependency**: [What must exist first — task, approval, artifact, credential]
- **Unblock condition**: [Concrete condition that resolves the blocker]

### Who Should Resolve
**Unblock owner**: `owner:[role]`

[Name the one role that can make the decision or provide the dependency.]

### Recommended Label Changes

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
|--------------|----------------------|
| Scope / requirements ambiguity | `owner:orchestrator` |
| Architecture / design unclear | `owner:architect` |
| Contract / API dependency missing | `owner:backend` or `owner:architect` |
| Review / approval blocked | `owner:review` or human |
| Environment / credentials / access | `owner:release` |
| Test / tooling failure | `owner:qa` |
| Cross-team / sequencing | `owner:orchestrator` |

## Escalation Principle

**Favor early escalation over silent guessing.**

- Scope ambiguous → escalate; do not assume
- Dependency missing → escalate; do not stub or skip
- Architecture unclear → escalate; do not invent
- Approval needed → escalate; do not proceed without it
- Blocked by another task → escalate with clear dependency
