# Blocking Review — Tasks #39 and #40 (Epic #13)

**Reviewer**: review-agent  
**Date**: 2025-03-18  
**Epic**: #13 Monorepo, Tooling, and Delivery Foundations

---

## Task #39 — Turborepo Configuration

### Scope Check
- **Declared scope**: turbo.json, package.json (root)
- **Files reviewed**: turbo.json, package.json (root)
- **Out-of-scope changes**: None

### Correctness vs docs/07-technical-plan.md
| Requirement | Status |
|-------------|--------|
| §2.1 Package manager: pnpm | ✅ `"packageManager": "pnpm@9.15.0"` |
| §2.1 Monorepo orchestrator: turborepo | ✅ turbo ^2.3.0, scripts delegate to turbo |
| §2.1 Language: TypeScript | ✅ (implicit; no deviation) |
| §11.1 Turborepo task graph for lint, typecheck, test, and build | ✅ All four tasks present in turbo.json |
| §11.1 Pipeline defaults | ✅ build outputs: dist/**, .next/**, out/**, build/**, .expo/**; test: coverage/** |

### Alignment with monorepo-boundaries-and-stack rule
- Fixed stack: pnpm ✅, turborepo ✅, TypeScript ✅
- No substitution of stack defaults.

### Workflow Readiness
- Turbo discovers all 16 packages (5 apps, 11 packages).
- Pipeline runs successfully (`pnpm run build` completes; packages have no build script yet—expected for scaffold).

### Quality Evidence
- Minimal, correct configuration; no QA-blocking issues.

---

## Task #39 — Decision

**Decision**: **APPROVED**

**Reasons**: Implementation is correct, scoped, and aligned with technical plan and monorepo rule. No architecture drift. Pipeline ready for downstream tasks.

### Label Changes
- **Remove**: `owner:review`
- **Add**: `state:reviewed`

---

## Task #40 — Top-Level App and Package Directory Structure

### Scope Check
- **Declared scope**: apps/*/package.json, packages/*/package.json
- **Files reviewed**: All 5 app package.json, all 11 package package.json, pnpm-workspace.yaml
- **Out-of-scope additions**: None (no extra apps or packages)

### Layout vs docs/07-technical-plan.md §2.2
| §2.2 Required | Present |
|---------------|---------|
| apps/mobile-user | ✅ |
| apps/mobile-admin | ✅ |
| apps/web-gym-admin | ✅ |
| apps/web-platform-admin | ✅ |
| apps/web-site | ✅ |
| packages/api-client | ✅ |
| packages/contracts | ✅ |
| packages/types | ✅ |
| packages/utils | ✅ |
| packages/ui-web | ✅ |
| packages/ui-native | ✅ |
| packages/config-typescript | ✅ |
| packages/config-eslint | ✅ |
| packages/config-prettier | ✅ |
| packages/config-tailwind | ✅ |
| packages/supabase | ✅ |

### Package Ownership Boundaries
- All packages use `@myclup/*` namespace.
- ui-web, ui-native depend on config-tailwind (Tailwind/NativeWind per §3.2, §3.3).
- api-client, contracts, types, utils, supabase depend on config-typescript.
- No business logic in UI packages.
- No forbidden packages (shared-admin, fetch-wrapper, etc.).

### Alignment with monorepo-boundaries-and-stack
- Top-level layout matches allowed boundaries exactly.
- Package ownership table respected.

### Workflow Readiness
- pnpm-workspace.yaml correctly defines `apps/*` and `packages/*`.
- Turbo discovers all packages.

### Quality Evidence
- Consistent naming, appropriate dependencies; no out-of-scope additions.

---

## Task #40 — Decision

**Decision**: **APPROVED**

**Reasons**: Structure exactly matches technical plan §2.2. Package ownership boundaries respected. No architecture drift or out-of-scope additions.

### Label Changes
- **Remove**: `owner:review`
- **Add**: `state:reviewed`

---

## Orchestration Trigger (Epic #13)

After applying label changes to both tasks, add this comment to Epic #13:

```markdown
ORCHESTRATION_TRIGGER
task_completed: 39,40
status: reviewed
epic: 13
```

---

## GitHub Comment Templates

### Task #39 — Approval Comment
```markdown
## Review Result

**Decision**: approved

**Reasons**: Turborepo configuration is correct and aligned with docs/07-technical-plan.md §2.1, §11.1. Stack defaults (pnpm, turborepo) are respected per monorepo-boundaries-and-stack rule. Pipeline task graph (build, lint, typecheck, test) matches technical plan. No out-of-scope changes.

### Label Changes
- **Remove**: `owner:review`
- **Add**: `state:reviewed`

### Action Required
Orchestrator to finalize completion and activate next dependency-ready task(s).
```

### Task #40 — Approval Comment
```markdown
## Review Result

**Decision**: approved

**Reasons**: Top-level directory structure exactly matches docs/07-technical-plan.md §2.2. All five apps and eleven packages present; package ownership boundaries respected; no forbidden packages or out-of-scope additions. Alignment with monorepo-boundaries-and-stack confirmed.

### Label Changes
- **Remove**: `owner:review`
- **Add**: `state:reviewed`

### Action Required
Orchestrator to finalize completion and activate next dependency-ready task(s).
```
