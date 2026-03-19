Prepare a structured GitHub handoff for the current issue stage.

Given the current issue state and completed work described, produce a handoff comment and label recommendations aligned to the MyClup workflow governance.

Issue and completed work: $ARGUMENTS

## Step 1: Validate Handoff Eligibility

Reject the handoff if any of these are missing:
- Scope evidence (files/packages changed)
- Test evidence (when tests were required for this stage)
- Acceptance criteria evidence for the current stage

If missing, output a REJECTED HANDOFF with what's needed before the handoff can proceed.

## Step 2: Produce Handoff Output

### 1. Handoff Summary Comment (copy-paste ready)

```markdown
## Handoff: [stage] → [next stage]

### Completed
- [What was implemented or validated]
- [Files/packages changed]

### Test Status
- [Tests written: list]
- [Tests passing: yes / no / partial — if partial, what's missing]

### Localization Impact
- [What was localized]
- [Keys changed or added]
- [Fallback behavior]
- [Anything remaining]

### Remaining Work
- [What the next owner must do]

### Known Risks
- [Risk 1]
- [Risk 2 — or "None"]
```

### 2. Label Recommendations

| Action | Label |
|--------|-------|
| Remove | `owner:[current]` |
| Add | `owner:[next]` |
| Replace lifecycle | `state:[new-state]` |

### 3. Next Agent Verification Checklist

For the next agent to confirm before starting:
- [ ] [Prerequisite 1]
- [ ] [Prerequisite 2]

## Lifecycle State Reference

| Situation | State |
|-----------|-------|
| Implementation complete | `state:implemented` |
| QA validation complete | `state:tested` |
| Review complete | `state:reviewed` |
| Approval recorded | `state:approved` |
| Merged/integrated | `state:integrated` |
| Workflow complete | `state:done` |
| Cannot proceed | `state:blocked` |

## Owner Progression

```
orchestrator → business-analyst → product-architecture → orchestrator
orchestrator → backend/web/mobile/ai (implementation)
implementation → qa → review → release/orchestrator
```

## Rules

- Exactly one owner label at a time — remove before adding
- Exactly one lifecycle label at a time — replace, don't stack
- Do not advance to next owner if current stage is incomplete
- Use `state:blocked` with explicit blocker note when work cannot continue
