# Epic #14 — Shared Backend Platform, Contracts, and API Layer

## Task Decomposition for GitHub Issues

**Part of Epic #14**

This document specifies implementation-ready task issues for the orchestrator to create. Do not create issues from this file directly—use it as the source for GitHub Issue creation.

**Epic dependency**: Epic #13 (Monorepo, Tooling, and Delivery Foundations) must be complete.

---

## Task Dependency Graph

```
Epic #13 (complete)
       │
       ├──► Task 14.1: Contract ownership and entry points
       │
       ├──► Task 14.2: Supabase shared client (parallel with 14.1)
       │
       └──► Task 14.3: Shared utility boundaries (parallel with 14.1, 14.2)
                     │
                     │
       ┌─────────────┴─────────────┐
       │                           │
       ▼                           ▼
Task 14.4: Typed API client      Task 14.5: /api/v1 route conventions
(depends on 14.1)                (depends on 14.1)
```

---

## Task 14.1: Define Shared Contract Ownership and Package Entry Points

### Summary

Establish `packages/contracts` as the single source of truth for API schemas, Zod validation, and request/response contracts. Define package structure, exports, domain grouping, and ownership boundaries so all product surfaces can consume shared contracts.

### Source Documentation

- `docs/07-technical-plan.md` §§2.4, 2.5, 4.4
- `AGENT.md` §3
- `.cursor/rules/shared-contracts-first.mdc`
- `.cursor/rules/monorepo-boundaries-and-stack.mdc`
- `.cursor/skills/api-contract-generator/SKILL.md`

### Scope

- Add Zod as a dependency to `packages/contracts`
- Define and document package entry points and `exports` in `package.json`
- Establish domain-based folder structure (e.g. `src/common/`, `src/health/`)
- Add at least one example contract (e.g. health/ping) to prove the pattern: Zod schema, inferred types, contract object (`path`, `method`, `request`, `response`)
- Document contract ownership rules and file layout in `packages/contracts/README.md` or equivalent
- Ensure `packages/types` remains the source for framework-agnostic domain types; reference types from `@myclup/types` where contracts need them

### Out of Scope

- Full domain contracts (bookings, members, chat, etc.)—those belong to later epics
- API route implementation
- `api-client` implementation

### Affected Packages

- `packages/contracts`
- `packages/types` (reference only; no changes unless exports need adjustment)

### Dependencies

- Epic #13 complete

### Acceptance Criteria

- [ ] `packages/contracts` has `zod` as a dependency
- [ ] `packages/contracts` has a clear `exports` map (including subpath exports if used)
- [ ] Domain-based folder structure exists (e.g. `src/common/`, `src/health/`)
- [ ] At least one example contract exists: health check or ping with request/response schema and contract object
- [ ] Contract pattern matches api-contract-generator skill: Zod schema → inferred type → contract `{ path, method, request, response }`
- [ ] README or in-repo doc describes ownership, file layout, and when to add to `contracts` vs `types`
- [ ] `pnpm build` and `pnpm typecheck` pass for `packages/contracts`

### Required Tests

- Unit test(s) that verify the example contract schema validates valid input and rejects invalid input

### Localization Impact

- None (foundational contracts; locale-aware contracts will be added in domain epics)

### Risk Level

- High (foundational; affects all future API work)

### Recommended Labels

- `owner:architect` or `owner:backend`
- `state:scoped`
- `type:infra`
- `priority:p0`
- `surface:shared`

---

## Task 14.2: Define Supabase Shared Client and Generated Type Responsibilities

### Summary

Establish `packages/supabase` as the home for database type generation outputs, shared Supabase clients, SQL conventions, RLS guidance, and server helper utilities. Define ownership boundaries so apps and BFF never bypass this package for Supabase access.

### Source Documentation

- `docs/07-technical-plan.md` §§2.4, 4.2, 5.1, 5.3
- `AGENT.md` §4
- `.cursor/rules/monorepo-boundaries-and-stack.mdc`
- `.cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc`

### Scope

- Add package structure to `packages/supabase`: `src/` with entry points for clients, types, and server helpers
- Document where generated DB types will live (e.g. `src/generated/` or `dist/generated/`)
- Add shared server-side Supabase client factory or helper (scoped for BFF use; not for client apps)
- Document SQL conventions and RLS expectations in README or in-repo doc
- Add `package.json` scripts for type generation (placeholder or real, depending on Supabase project setup)
- Define boundary: client apps must not import `@myclup/supabase` directly; BFF and server modules only

### Out of Scope

- Full schema migrations or RLS policy implementation
- Supabase project provisioning (assume Epic #13 or environment setup provides project)
- Generated types from a live DB (can use placeholder types until DB exists)

### Affected Packages

- `packages/supabase`

### Dependencies

- Epic #13 complete

### Acceptance Criteria

- [ ] `packages/supabase` has a `src/` structure with documented entry points
- [ ] Documented location for generated DB types
- [ ] Server-side client helper or factory exists (or documented interface for when Supabase project is available)
- [ ] README or in-repo doc describes: generated types, server client usage, SQL/RLS conventions, and “server-only” boundary
- [ ] `package.json` has `main` and `types` (or `exports`) so BFF can import
- [ ] `pnpm typecheck` passes for `packages/supabase`

### Required Tests

- Unit test or integration stub that asserts the server client can be instantiated (or placeholder until Supabase is configured)

### Localization Impact

- None

### Risk Level

- High (tenant safety and RLS depend on this boundary)

### Recommended Labels

- `owner:backend`
- `state:scoped`
- `type:infra`
- `priority:p0`
- `surface:shared`

---

## Task 14.3: Prepare Shared Utility Boundaries for Locale-Aware and Domain-Safe Helpers

### Summary

Establish `packages/utils` boundaries for framework-agnostic helpers, locale-aware formatters (dates, times, numbers, currencies, units), and domain-safe pure functions. Ensure no framework-specific or business-orchestration code lives in utils.

### Source Documentation

- `docs/07-technical-plan.md` §§2.4, 2.6
- `AGENT.md` §8
- `.cursor/rules/localization-is-mandatory.mdc`
- `.cursor/rules/monorepo-boundaries-and-stack.mdc`

### Scope

- Add locale-aware formatting helpers (or stubs with documented signatures): `formatDate`, `formatTime`, `formatNumber`, `formatCurrency`, `formatUnit` accepting `locale` (from `@myclup/types` locale types)
- Add domain-safe helpers where immediately useful: e.g. `parseISODate`, `isValidLocale`
- Document what belongs in `utils` vs `contracts` vs app-local code
- Ensure `packages/utils` remains framework-agnostic (no React, Expo, Next.js imports)
- Export all helpers from package index

### Out of Scope

- Full translation/ICU integration (Epic #16)
- UI components or hooks

### Affected Packages

- `packages/utils`
- `packages/types` (for locale types)

### Dependencies

- Epic #13 complete

### Acceptance Criteria

- [ ] At least three locale-aware formatters exist with correct signatures (implementation may use `Intl` or placeholder)
- [ ] `parseISODate` and `isValidLocale` (or equivalent) exist
- [ ] README or in-repo doc describes utils boundaries and anti-patterns
- [ ] No framework-specific imports in `packages/utils`
- [ ] All helpers accept `locale`/`SupportedLocale` where user-facing formatting is involved
- [ ] `pnpm build` (if applicable), `pnpm typecheck`, and `pnpm test` pass for `packages/utils`

### Required Tests

- Unit tests for `parseISODate`, `isValidLocale`, and at least one locale formatter with known inputs/outputs

### Localization Impact

- Foundation for locale-aware formatting across all client surfaces; no user-facing strings in this task

### Risk Level

- Medium

### Recommended Labels

- `owner:backend`
- `state:scoped`
- `type:feature`
- `priority:p0`
- `surface:shared`

---

## Task 14.4: Establish Typed API Client Expectations for All Product Surfaces

### Summary

Implement the shared typed API client layer in `packages/api-client` so all product surfaces (mobile-user, mobile-admin, web-gym-admin, web-platform-admin, web-site) consume BFF endpoints through this single client. Define base fetch wrapper, contract consumption pattern, and surface-specific expectations.

### Source Documentation

- `docs/07-technical-plan.md` §§2.4, 4.1, 4.4
- `AGENT.md` §3
- `.cursor/rules/shared-contracts-first.mdc`
- `.cursor/skills/api-contract-generator/SKILL.md`

### Scope

- Add `packages/api-client` source structure and build configuration
- Implement base fetch wrapper: configurable base URL, auth headers injection point, error handling
- Implement contract-based request/response pattern: given a contract, call endpoint, parse response with Zod
- Add typed method for the example contract from Task 14.1 (e.g. `health.ping()`)
- Document how mobile and web apps configure the client (base URL, auth)
- Ensure no app may introduce a second network client; all BFF calls go through `api-client`

### Out of Scope

- Auth implementation (Epic #15)
- Domain-specific client methods beyond the example
- Surface-specific UI or data-fetching hooks

### Affected Packages

- `packages/api-client`
- `packages/contracts` (consumed)

### Dependencies

- Task 14.1 complete

### Acceptance Criteria

- [ ] `packages/api-client` has `src/` with base client and at least one typed domain method
- [ ] Base client supports configurable base URL and optional headers (e.g. for auth)
- [ ] Contract consumption: import contract from `@myclup/contracts`, fetch, validate response with `contract.response.parse()`
- [ ] Example method (e.g. `health.ping()`) is implemented and typed
- [ ] README documents configuration and usage for web and mobile
- [ ] `pnpm build` and `pnpm typecheck` pass; `api-client` depends on `contracts`

### Required Tests

- Unit test that mocks fetch and verifies the example method parses response correctly and throws on invalid response

### Localization Impact

- None (client does not localize; APIs return locale when needed per contract)

### Risk Level

- High (single network layer; regression affects all surfaces)

### Recommended Labels

- `owner:backend`
- `state:scoped`
- `type:feature`
- `priority:p0`
- `surface:shared`

---

## Task 14.5: Define /api/v1 Route Conventions and Validation Boundaries

### Summary

Establish Next.js BFF /api/v1 route conventions: path structure, Zod validation at the request boundary, error handling, and a reusable route handler pattern. Add a minimal example route to prove the pattern (e.g. in `web-gym-admin` or a shared BFF app).

### Source Documentation

- `docs/07-technical-plan.md` §§4.1, 4.3, 4.4
- `AGENT.md` §4
- `.cursor/rules/shared-contracts-first.mdc`
- `.cursor/skills/api-contract-generator/SKILL.md`

### Scope

- **Scaffold** minimal Next.js app in `apps/web-gym-admin` (Next.js dependency, app dir, API route support) if not present from Epic #13
- Document /api/v1 route conventions: path format (`/api/v1/[resource]` or `/api/v1/[resource]/[action]`), method semantics
- Create reusable route handler utility or pattern: parse body with contract schema, return validated response, standard error shapes
- Add at least one example route (e.g. `GET /api/v1/health` or `POST /api/v1/health/ping`) in a Next.js app that uses the contract from Task 14.1
- Document validation boundary: never trust raw request body; always validate with shared schema before processing
- Ensure route handler does not contain business logic; orchestration lives in server modules

### Out of Scope

- Full auth/session handling (Epic #15)
- Tenant/permission enforcement in routes (Epic #15)
- All domain routes (members, bookings, chat, etc.)

### Affected Apps

- `apps/web-gym-admin` (or the first Next.js BFF app created in Epic #13)

### Affected Packages

- `packages/contracts` (consumed)

### Dependencies

- Task 14.1 complete
- **Scope expansion (architecture review)**: Epic #13 did not scaffold a Next.js app. This task scope includes minimal Next.js scaffolding in `apps/web-gym-admin` (add Next.js, app dir, `/api/v1/health`) so route conventions can be implemented.

### Acceptance Criteria

- [ ] `apps/web-gym-admin` is a working Next.js app with app dir and API route support (scaffolded if not present)
- [ ] Route conventions documented (path structure, methods, error handling)
- [ ] Reusable handler pattern or utility exists (e.g. `withContractValidation` or equivalent)
- [ ] At least one example route exists and returns validated response from contract
- [ ] Raw request body is never used before Zod validation
- [ ] Route handler delegates to server module for any non-trivial logic
- [ ] `api-client` can call the example route and receive typed response

### Required Tests

- Integration test or E2E stub that calls the example route and asserts response shape (or unit test of handler with mocked deps)

### Localization Impact

- None (routes return locale in payload when contracts require it; no new user-facing strings)

### Risk Level

- High (validation boundary affects all future API security)

### Recommended Labels

- `owner:backend`
- `state:scoped`
- `type:infra`
- `priority:p0`
- `surface:shared`

---

## Recommended Execution Order

| Order | Task | Dependencies | Can Start With |
| ----- | ---- | ------------ | -------------- |
| 1     | 14.1 | Epic #13     | Epic #13 done  |
| 2     | 14.2 | Epic #13     | Epic #13 done  |
| 3     | 14.3 | Epic #13     | Epic #13 done  |
| 4     | 14.4 | Task 14.1    | After 14.1     |
| 5     | 14.5 | Task 14.1    | After 14.1     |

Tasks 14.1, 14.2, and 14.3 can run in parallel after Epic #13. Tasks 14.4 and 14.5 can run in parallel after Task 14.1 completes.

---

## Appendix: Copy-Paste GitHub Issue Bodies

Use these bodies when creating GitHub Issues. Each must be linked as a sub-issue of Epic #14.

### Issue: Task 14.1 — Contract Ownership and Entry Points

```markdown
## Summary

Establish `packages/contracts` as the single source of truth for API schemas, Zod validation, and request/response contracts. Define package structure, exports, domain grouping, and ownership boundaries.

**Part of Epic #14**

## Source Documentation

- docs/07-technical-plan.md §§2.4, 2.5, 4.4
- AGENT.md §3
- .cursor/rules/shared-contracts-first.mdc
- .cursor/rules/monorepo-boundaries-and-stack.mdc
- .cursor/skills/api-contract-generator/SKILL.md

## Scope

- Add Zod dependency to packages/contracts
- Define package entry points and exports
- Establish domain-based folder structure (e.g. src/common/, src/health/)
- Add at least one example contract (e.g. health/ping) with Zod schema, inferred types, contract object
- Document ownership rules and file layout

## Out of Scope

- Full domain contracts; API route implementation; api-client implementation

## Affected Packages

- packages/contracts

## Dependencies

- Epic #13 complete

## Acceptance Criteria

- [ ] packages/contracts has zod as a dependency
- [ ] packages/contracts has clear exports map
- [ ] Domain-based folder structure exists
- [ ] At least one example contract with schema + contract object
- [ ] Contract pattern: Zod schema → inferred type → { path, method, request, response }
- [ ] README describes ownership and file layout
- [ ] pnpm build and pnpm typecheck pass

## Required Tests

- Unit test verifying example contract schema validates/rejects correctly

## Localization Impact

None (foundational)

## Risk Level

High

## Recommended Labels

owner:architect or owner:backend, state:scoped, type:infra, priority:p0, surface:shared
```

---

### Issue: Task 14.2 — Supabase Shared Client

```markdown
## Summary

Establish `packages/supabase` for DB type generation, shared Supabase clients, SQL conventions, RLS guidance, and server helpers. Define server-only boundary.

**Part of Epic #14**

## Source Documentation

- docs/07-technical-plan.md §§2.4, 4.2, 5.1, 5.3
- AGENT.md §4
- .cursor/rules/monorepo-boundaries-and-stack.mdc
- .cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc

## Scope

- Add packages/supabase src/ structure
- Document generated DB types location
- Add server-side Supabase client factory/helper
- Document SQL and RLS conventions
- Define server-only boundary (no client app imports)

## Out of Scope

- Full schema migrations; Supabase project provisioning; generated types from live DB

## Affected Packages

- packages/supabase

## Dependencies

- Epic #13 complete

## Acceptance Criteria

- [ ] src/ structure with documented entry points
- [ ] Documented location for generated DB types
- [ ] Server client helper exists or interface documented
- [ ] README: generated types, server usage, SQL/RLS conventions
- [ ] package.json main/types for BFF import
- [ ] pnpm typecheck passes

## Required Tests

- Unit or stub asserting server client can be instantiated

## Localization Impact

None

## Risk Level

High

## Recommended Labels

owner:backend, state:scoped, type:infra, priority:p0, surface:shared
```

---

### Issue: Task 14.3 — Shared Utility Boundaries

```markdown
## Summary

Establish `packages/utils` boundaries for framework-agnostic helpers and locale-aware formatters (dates, times, numbers, currencies, units).

**Part of Epic #14**

## Source Documentation

- docs/07-technical-plan.md §§2.4, 2.6
- AGENT.md §8
- .cursor/rules/localization-is-mandatory.mdc
- .cursor/rules/monorepo-boundaries-and-stack.mdc

## Scope

- Add locale-aware formatters: formatDate, formatTime, formatNumber, formatCurrency, formatUnit (locale param)
- Add parseISODate, isValidLocale
- Document utils vs contracts vs app-local boundaries
- Ensure framework-agnostic (no React/Expo/Next)

## Out of Scope

- Full translation/ICU integration; UI components

## Affected Packages

- packages/utils, packages/types

## Dependencies

- Epic #13 complete

## Acceptance Criteria

- [ ] At least three locale-aware formatters with correct signatures
- [ ] parseISODate and isValidLocale exist
- [ ] README describes utils boundaries
- [ ] No framework-specific imports
- [ ] Helpers accept locale where user-facing
- [ ] pnpm typecheck and pnpm test pass

## Required Tests

- Unit tests for parseISODate, isValidLocale, one locale formatter

## Localization Impact

Foundation for locale-aware formatting across client surfaces

## Risk Level

Medium

## Recommended Labels

owner:backend, state:scoped, type:feature, priority:p0, surface:shared
```

---

### Issue: Task 14.4 — Typed API Client

```markdown
## Summary

Implement shared typed API client in `packages/api-client` so all surfaces consume BFF through this single client. Base fetch wrapper, contract consumption pattern.

**Part of Epic #14**

## Source Documentation

- docs/07-technical-plan.md §§2.4, 4.1, 4.4
- AGENT.md §3
- .cursor/rules/shared-contracts-first.mdc
- .cursor/skills/api-contract-generator/SKILL.md

## Scope

- Add api-client src/ and build config
- Base fetch wrapper: base URL, auth headers injection, error handling
- Contract-based request/response: given contract, fetch, parse with Zod
- Typed method for example contract (e.g. health.ping())
- Document web and mobile config

## Out of Scope

- Auth implementation; domain-specific methods beyond example

## Affected Packages

- packages/api-client, packages/contracts

## Dependencies

- Task 14.1 complete

## Acceptance Criteria

- [ ] src/ with base client and one typed domain method
- [ ] Configurable base URL and headers
- [ ] Contract consumption: contract.response.parse()
- [ ] Example method implemented and typed
- [ ] README for web and mobile config
- [ ] pnpm build and typecheck pass

## Required Tests

- Unit test with mocked fetch verifying example method parses response

## Localization Impact

None

## Risk Level

High

## Recommended Labels

owner:backend, state:scoped, type:feature, priority:p0, surface:shared
```

---

### Issue: Task 14.5 — /api/v1 Route Conventions

```markdown
## Summary

Establish Next.js BFF /api/v1 route conventions: path structure, Zod validation at boundary, error handling. Scaffold minimal Next.js app if needed. Add example route.

**Part of Epic #14**

## Source Documentation

- docs/07-technical-plan.md §§4.1, 4.3, 4.4
- AGENT.md §4
- .cursor/rules/shared-contracts-first.mdc
- .cursor/skills/api-contract-generator/SKILL.md

## Scope

- Scaffold minimal Next.js app in apps/web-gym-admin (Next.js, app dir, API routes) if not present
- Document /api/v1 conventions: path format, methods, error shapes
- Reusable route handler pattern (parse body with contract, return validated response)
- Example route (e.g. GET /api/v1/health) using contract from Task 14.1
- Document validation boundary: never trust raw body
- Delegate logic to server modules

## Out of Scope

- Auth/session; tenant/permission enforcement; all domain routes

## Affected Apps

- apps/web-gym-admin

## Affected Packages

- packages/contracts

## Dependencies

- Task 14.1 complete

## Acceptance Criteria

- [ ] apps/web-gym-admin is a working Next.js app with app dir and API route support
- [ ] Route conventions documented
- [ ] Reusable handler pattern exists
- [ ] At least one example route returns validated response
- [ ] Raw body never used before Zod validation
- [ ] Handler delegates to server module
- [ ] api-client can call example route

## Required Tests

- Integration or E2E stub calling example route, asserting response shape

## Localization Impact

None

## Risk Level

High

## Recommended Labels

owner:backend, state:scoped, type:infra, priority:p0, surface:shared
```

---

## Cross-Task Consistency Notes

- **Contract pattern**: All tasks that touch contracts (14.1, 14.4, 14.5) must use the same pattern: Zod schema → inferred type → contract object.
- **Locale**: Tasks 14.3 (utils) and future domain contracts will ensure locale is explicit where user-facing content is returned.
- **Tenant safety**: Task 14.2 establishes Supabase server boundary; actual RLS and tenant checks are Epic #15.
