Extract implementation context from MyClup documentation before coding begins.

Read the source documents in precedence order, extract relevant constraints, and produce a structured analysis. Do NOT propose implementation — only extract and organize context.

Topic or feature to analyze: $ARGUMENTS

## Step 1: Read Source Documents

Read these in order and note what's relevant to the topic:

| Doc | What to extract |
|-----|-----------------|
| `docs/07-technical-plan.md` | Architecture, stack, package boundaries |
| `AGENT.md` | Engineering defaults, prohibited patterns |
| `docs/08-agentic-workflow.md` | Workflow, lifecycle, review/release gates |
| `docs/00-master-plan.md` | Product vision, roadmap context |
| `docs/01` through `docs/06` | Surface-specific scope and feature details |

## Step 2: Produce Structured Context

```markdown
## Doc Context: [Topic/Feature]

### Task Summary
[What is being built and why, grounded in the docs]

### Source Documents Referenced
- `docs/[X]` §[Section]: [what constraint or requirement it defines]

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
- [ ] packages/ui-web — [what changes]
- [ ] packages/ui-native — [what changes]
- [ ] packages/supabase — [what changes]
- [ ] packages/utils — [what changes]

### Architectural Constraints
[List constraints from docs/07-technical-plan.md that apply]

### Security and Tenant Constraints
[Server-side checks required, RLS implications, audit requirements]

### Localization Implications
[What must be localized, which content types, fallback behavior]

### Chat Implications (if relevant)
[Conversation types, permission checks, realtime behavior, read-state]

### AI Implications (if relevant)
[Service boundary, schema validation, timeout/retry, feature flag]

### Required Tests
[Which test layers are required and why]

### Risks
[Architecture drift risk, security risk, scope risk]

### Conflicts (if any)
[Doc A says X, Doc B says Y — resolved by: Doc A wins per precedence order]

### Gaps
[Any required doc that is missing or unclear — needs human clarification]
```

## Rules

- Never propose implementation in this command
- Cite doc and section for every constraint stated
- Apply conflict resolution: `docs/07-technical-plan.md` → `AGENT.md` → `docs/08-agentic-workflow.md` → `docs/00-master-plan.md` → product-specific docs
- If scope is unclear or a required doc is missing or contradictory, state the gap explicitly and flag for human input
