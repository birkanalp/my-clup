Break large engineering work into safe parallel tasks with explicit ownership, dependencies, and overlap warnings.

Feature or epic to split: $ARGUMENTS

Read `docs/07-technical-plan.md`, `AGENT.md`, and the relevant product plan doc before splitting. Ground every task in the source docs.

## Step 1: Identify Task Categories

Determine which categories are needed for this feature:

- **Contracts** — Zod schemas, types, API contracts
- **Backend** — API routes, server logic, Supabase, RLS
- **Mobile** — Expo screens and flows
- **Web** — Next.js pages and components
- **Testing** — Test plans not covered by implementation owners

## Step 2: Apply Dependency Order

1. Contracts first (no implementation before contracts are defined)
2. Backend after contracts
3. Mobile and web after backend, when scopes don't overlap
4. Testing after implementation, with explicit dependencies

## Step 3: Output Task List

For each task:

```markdown
### Task: [Title]

**Category**: [Contracts | Backend | Mobile | Web | Testing]
**Parent Epic**: [Epic title or "TBD"]
**Recommended owner label**: `owner:[agent]`
**Next handoff label**: `owner:[next-agent]`

**Files or packages in scope**:

- `packages/[package]/src/...`
- `apps/[app]/src/...`

**Dependencies**:

- Depends on: [Task name] — [reason]

**Acceptance criteria**:

- [ ] [criterion 1]
- [ ] [criterion 2]

**Required tests**:

- [ ] [test type]: [what to test]

**Localization impact**: [Yes/No — details]

**Complexity**: [small | medium | large]

**Parallelization safety**: [Safe | Unsafe — reason if unsafe]
```

## Step 4: Overlap Warning

For any two tasks marked as safe to parallelize, explicitly confirm:

- [ ] File ownership does not overlap
- [ ] Package ownership does not overlap
- [ ] Database/API contracts are already aligned
- [ ] Integration points are explicit in advance

If overlap exists: flag as UNSAFE TO PARALLELIZE and recommend sequencing or routing to product-architecture-agent.

## Step 5: Epic Structure Recommendation

```markdown
## Epic: [Feature Name]

**Description**: [What this epic delivers]
**Child tasks**: [List in dependency order]
**Suggested sequence**: [task 1 → task 2 → (task 3 ∥ task 4) → task 5]
```

## Rules

- Contracts before clients — always
- Explicit file scope only — no vague "touch the booking module"
- No overlapping ownership without sequencing
- Testing tasks must never be omitted
- Owner labels must align with canonical workflow
- Never bundle backend + mobile into one task if parallelizable
