# Architecture Review — Task #41: config-typescript Shared Package

**Status**: Approved

---

## Boundary Implications

| Package / App | Affected | Extends to use |
|---------------|----------|----------------|
| `packages/config-typescript` | **Owns** shared tsconfig shape | — |
| `packages/contracts` | Consumer | base or node |
| `packages/types` | Consumer | base |
| `packages/utils` | Consumer | base |
| `packages/api-client` | Consumer | base or node |
| `packages/supabase` | Consumer | base or node |
| `packages/ui-web` | Consumer | base (+ next if library build) |
| `packages/ui-native` | Consumer | base (+ expo if library build) |
| `apps/*` (Next.js x3, Expo x2) | Future consumer | next or expo presets |

`config-typescript` is a shared config package consumed by all packages and apps. It must not contain app-specific overrides; those stay in each consuming package's `tsconfig.json`. The task correctly scopes out app-specific overrides and ESLint/Prettier.

---

## Contract Ownership

`config-typescript` does not own domain contracts. It owns:

- **tsconfig shape** — base, node, next, expo presets
- **Package exports** — so consumers can `"extends": "@myclup/config-typescript/base"` (or `/node`, `/next`, `/expo`)

Standard pattern: add `exports` in `package.json` so `extends` resolves via Node resolution, e.g.:

```json
{
  "exports": {
    "./base": "./tsconfig.base.json",
    "./node": "./tsconfig.node.json",
    "./next": "./tsconfig.next.json",
    "./expo": "./tsconfig.expo.json"
  }
}
```

---

## Integration Points

1. **Base preset** — Strict mode, `moduleResolution`, `target`, `lib`. Used by `contracts`, `types`, `utils`, and as foundation for node/next/expo.
2. **Node preset** — Extends base; adds Node-specific `types`, `module` for packages like `contracts`, `api-client`, `supabase`.
3. **Next preset** — Extends base; compatible with Next.js tsconfig expectations (`jsx`, `moduleResolution`, etc.).
4. **Expo preset** — Extends base; compatible with Expo/React Native.

Verification chain (per task): `packages/contracts` extends config → `pnpm exec tsc --noEmit` passes in contracts.

---

## Constraints (from docs and rules)

| Source | Constraint |
|--------|------------|
| `docs/07-technical-plan.md` §2.4 | `config-typescript` owns shared TypeScript base configs |
| `AGENT.md` §8 | Use strict TypeScript |
| `.cursor/rules/monorepo-boundaries-and-stack.mdc` | TypeScript is mandatory; config-typescript is allowed package |

- **Strict mode** is mandatory. Base config must enable `strict: true` (and recommended strict flags).
- **No business logic** — config package only. No drift into ESLint/Prettier (correctly out of scope).
- **Path aliases** — "where needed" is appropriate; base config can omit aliases; consuming packages add their own `paths` for `@myclup/*` if required.

---

## Blockers

None. Architecture prerequisites are satisfied. Task scope aligns with technical plan and rules.

---

## Preset Usage Guidance (for implementer)

| Consumer type | Recommended preset |
|---------------|--------------------|
| Framework-agnostic libs (contracts, types, utils) | base or node |
| api-client, supabase | node |
| ui-web (library build) | base (or next if building for Next.js) |
| ui-native | base (or expo if building for Expo) |
| Next.js apps | next |
| Expo apps | expo |

---

*Product Architecture Agent — enforces docs/07-technical-plan.md as source of truth*
