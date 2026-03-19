Generate the correct monorepo placement for a new feature, module, or code addition.

Determine the correct app(s), whether a shared package is needed, and output directory structure with dependency graph and import boundaries.

Feature or module to place: $ARGUMENTS

## Step 1: Which App(s)?

| User type                       | App                       |
| ------------------------------- | ------------------------- |
| Member-facing                   | `apps/mobile-user`        |
| Staff / gym operations (mobile) | `apps/mobile-admin`       |
| Gym admin panel (web)           | `apps/web-gym-admin`      |
| Platform admin (web)            | `apps/web-platform-admin` |
| Public website / discovery      | `apps/web-site`           |

## Step 2: Shared Package Required?

Create or extend a shared package **only when** reuse is real and immediate (≥2 consumers).

| Content type                 | Place in shared package? | Location              |
| ---------------------------- | ------------------------ | --------------------- |
| API schema, Zod validation   | Yes                      | `packages/contracts`  |
| Domain type used across apps | Yes                      | `packages/types`      |
| API client method            | Yes                      | `packages/api-client` |
| Pure formatter, helper       | Yes if shared            | `packages/utils`      |
| Reusable web component       | Yes if shared            | `packages/ui-web`     |
| Reusable native component    | Yes if shared            | `packages/ui-native`  |
| App-specific orchestration   | No                       | Stay in app           |
| App-specific screen          | No                       | Stay in app           |

## Output

### Directory Structure

```
[apps/ or packages/ as applicable]
  [path]/
    [file or folder — with brief description]
    ...
```

### File Responsibilities

| Path              | Responsibility                  |
| ----------------- | ------------------------------- |
| `path/to/file.ts` | [What it does and what it owns] |

### Dependency Graph

```
[consumer] → [dependency]
[consumer] → [dependency]
```

Allowed flow: `types` ← `contracts` ← `api-client`; `types` + `utils` ← `ui-web`/`ui-native`; apps ← all packages.

### Import Boundaries

**Allowed:**

- [Consumer] may import from [Dependency]

**Forbidden:**

- `ui-web` / `ui-native` must not import `api-client`, `contracts`, or business modules
- `utils` must not import React, Next.js, or Expo
- Apps must not duplicate shared contracts or types locally

### Decision Notes

[Explain key placement decisions — especially if a shared package was or was not created and why]

## Rules Applied

- [ ] No new packages created unless reuse is real and immediate
- [ ] Business logic stays in apps or server routes — not in `ui-web` or `ui-native`
- [ ] UI packages receive data via props only
- [ ] All API access goes through `api-client` — no direct Supabase/fetch from UI packages
- [ ] Structure is compatible with `pnpm` workspace and Turborepo task graph
- [ ] No circular dependencies
