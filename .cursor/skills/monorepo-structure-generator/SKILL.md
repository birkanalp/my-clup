---
name: monorepo-structure-generator
description: Generate Turborepo-compatible folder structures for MyClup features. Use when adding a feature, module, or new code to the monorepo. Outputs directory structure, file responsibilities, dependency graph, and import boundaries. Keeps UI logic separate from business logic.
---

# Monorepo Structure Generator

## Purpose

Given a feature or module, generate the correct placement in the MyClup monorepo. Determine correct location, whether a shared package is required, and enforce valid dependency flow. **Never mix UI logic with business logic packages.**

## Fixed Top-Level Structure

Use only these paths. Do not invent new apps or packages without explicit justification.

### Apps

| Path | Stack | Role |
|------|-------|------|
| `apps/mobile-user` | Expo, NativeWind | Member app: memberships, bookings, chat, progress, discovery |
| `apps/mobile-admin` | Expo, NativeWind | Staff app: operations, classes, chat, check-in, workouts |
| `apps/web-gym-admin` | Next.js, Tailwind | Gym operating panel |
| `apps/web-platform-admin` | Next.js, Tailwind | Platform admin |
| `apps/web-site` | Next.js, Tailwind | Public marketing/SEO site |

### Shared Packages

| Path | Owns | May import |
|------|------|------------|
| `packages/contracts` | Zod schemas, API contracts, validation | `types` |
| `packages/types` | Framework-agnostic domain types | — |
| `packages/api-client` | Typed API access, BFF calls | `contracts`, `types` |
| `packages/utils` | Pure helpers, formatters | `types` only if needed |
| `packages/ui-web` | Web UI primitives | `types` (for props), `utils` |
| `packages/ui-native` | Native UI primitives | `types` (for props), `utils` |
| `packages/supabase` | DB types, clients, RLS | `types` |

**Config packages**: `config-typescript`, `config-eslint`, `config-prettier`, `config-tailwind` — extend as needed.

## Decision Flow

### Step 1: Which App(s)?

- Member-facing? → `mobile-user`
- Staff / gym operations? → `mobile-admin` or `web-gym-admin`
- Platform admin? → `web-platform-admin`
- Public website / discovery? → `web-site`

### Step 2: Shared Package Required?

Create or extend a shared package **only when** reuse is real and immediate (≥2 consumers).

| Content type | Place in shared package? | Location |
|--------------|--------------------------|----------|
| API schema, Zod validation | Yes | `packages/contracts` |
| Domain type used across apps | Yes | `packages/types` |
| API client method | Yes | `packages/api-client` |
| Pure formatter, helper | Yes if shared | `packages/utils` |
| Reusable web component | Yes if shared | `packages/ui-web` |
| Reusable native component | Yes if shared | `packages/ui-native` |
| App-specific orchestration | No | Stay in app |
| App-specific screen | No | Stay in app |

### Step 3: Dependency Rules

- **No cycles**: dependencies flow downward only
- **UI packages** (`ui-web`, `ui-native`) must **not** import `api-client`, `contracts`, or app modules. They receive data via props.
- **Apps** may import: `api-client`, `contracts`, `types`, `utils`, `ui-web`/`ui-native`, `supabase` (server-side only)
- **Business logic** lives in apps or server routes, never in `ui-web` or `ui-native`

## Output Template

Emit this structure for each feature:

```markdown
# Monorepo Placement: [Feature Name]

## Directory Structure

\`\`\`
[apps/ or packages/ as applicable]
  [path]/
    [file or folder]
    ...
\`\`\`

## File Responsibilities

| Path | Responsibility |
|------|----------------|
| `path/to/file.ts` | [What it does] |
| ... | |

## Dependency Graph

\`\`\`
[consumer] → [dependency]
[consumer] → [dependency]
...
\`\`\`

Allowed flow: `types` ← `contracts` ← `api-client`; `types`, `utils` ← `ui-web`, `ui-native`; apps ← all packages.

## Import Boundaries

**Allowed:**
- [Consumer] may import from [Dependency]
- ...

**Forbidden:**
- [Package] must not import [Package] — [reason]
- ui-web / ui-native must not import api-client, contracts, or business modules
- utils must not import React, Next.js, or Expo
```

## Rules

- **No new packages** unless reuse is real and immediate. Prefer app-local until proven.
- **No business logic in UI packages** — orchestration, API calls, tenant checks stay in apps or server.
- **No mixing**: `ui-web` and `ui-native` own presentation only. Data flows in via props.
- **Single network layer**: All API access goes through `api-client`. No direct fetch/Supabase from UI packages.
- **Turborepo**: Generated structure must be compatible with `pnpm` workspace and Turborepo task graph.
