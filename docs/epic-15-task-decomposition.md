# Epic #15 — Authentication, Identity, Tenant Model, and Permissions
## Task Decomposition for GitHub Issues

**Part of Epic #15**

This document specifies implementation-ready task issues for the orchestrator to create. Do not create issues from this file directly—use it as the source for GitHub Issue creation.

**Epic dependency**: Epic #13 and Epic #14 (Monorepo, Tooling, Shared Backend Platform) must be complete.

---

## Task Dependency Graph

```
Epic #13, #14 (complete)
       │
       ├──► Task 15.1: Database schema (tenant, profiles, roles, audit)
       │
       ├──► Task 15.2: Auth and profile contracts (parallel with 15.1)
       │
       └──► Task 15.3: Supabase Auth provider configuration (parallel with 15.1, 15.2)
                     │
                     │
       ┌─────────────┴─────────────┐
       │                           │
       ▼                           ▼
Task 15.4: Server-side auth        Task 15.6: Audit logging service
helpers (15.1, 15.3)               (15.1)
       │                           │
       │                           │
       └──────────────┬────────────┘
                      │
                      ▼
            Task 15.5: Permission resolution and enforcement (15.1, 15.4)
                      │
                      ▼
            Task 15.7: Auth API routes and BFF session handling (15.2, 15.4, 15.5)
                      │
                      ▼
            Task 15.8: api-client auth methods (15.2, 15.7)
```

---

## Overlap Warnings

- **Tasks 15.1, 15.2, 15.3** may run in parallel (no file overlap; different packages).
- **Tasks 15.4 and 15.6** may run in parallel (both depend on 15.1; 15.4 touches `packages/supabase` auth helpers, 15.6 touches audit module).
- **Task 15.5** must complete before 15.7 (permission helpers are used by auth routes).
- **Do not start 15.7** until 15.4 and 15.5 are done; BFF session handling depends on both.

---

## Task 15.1: Database Schema for Tenant Model, Profiles, Roles, and Audit

### Summary

Create Supabase migrations for the auth, identity, tenant, and permission foundation. Define tables for gyms, branches, user profiles, role assignments, and audit events. Implement RLS policies for tenant isolation. Regenerate `database.types.ts`.

### Source Documentation

- `docs/07-technical-plan.md` §§4.2, 5.1, 5.2, 5.3, 5.4
- `docs/00-master-plan.md` §§4, 5.1, 7
- `AGENT.md` §§4, 5
- `.cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc`
- `.cursor/skills/database-schema-planner/SKILL.md`
- `packages/types/src/tenant.ts`, `user.ts`, `role.ts`

### Scope

- Add `supabase/migrations/` layout if not present
- Migrations for:
  - `gyms` (id, name, slug, is_active, created_at, updated_at)
  - `branches` (id, gym_id, name, is_active, created_at, updated_at)
  - `profiles` (user_id FK to auth.users, display_name, avatar_url, locale, fallback_locale, created_at, updated_at)
  - `user_role_assignments` (user_id, role enum, gym_id nullable, branch_id nullable, granted_at, granted_by) — platform/gym/branch roles
  - `gym_staff` (user_id, gym_id, branch_id nullable, role, created_at, updated_at) — gym-scoped staff assignment per rule
  - `audit_events` (id, event_type, actor_id, target_type, target_id, payload jsonb, tenant_context jsonb, created_at)
- RLS policies: tenant-owned tables filter by gym_id (and branch_id where applicable); profiles readable by owner; audit_events insert-only for service role
- Indexes: gym_id, branch_id, user_id on assignment tables; event_type, actor_id, created_at on audit_events
- Regenerate `packages/supabase/src/generated/database.types.ts`
- Align `packages/types` with schema if any new columns or enums are introduced

### Out of Scope

- Member, membership, chat, or other domain tables
- OAuth provider configuration (Task 15.3)
- Application logic for auth or permissions
- Full RLS test suite (can be follow-up; RLS policies must be reviewed)

### Affected Packages

- `packages/supabase` (migrations, generated types)
- `packages/types` (alignment only if needed)

### Dependencies

- Epic #13, #14 complete
- Supabase project provisioned and linked

### Acceptance Criteria

- [ ] Migrations create `gyms`, `branches`, `profiles`, `user_role_assignments`, `gym_staff`, `audit_events`
- [ ] `profiles.user_id` references `auth.users(id)` with ON DELETE CASCADE
- [ ] `branches.gym_id` references `gyms(id)`
- [ ] RLS enabled on all tenant-owned tables; policies enforce gym_id (and branch_id) scope
- [ ] `audit_events` is insert-only for service role; no public read
- [ ] `packages/supabase/src/generated/database.types.ts` regenerated
- [ ] Migration runs successfully (`supabase db push` or equivalent)
- [ ] `pnpm typecheck` passes across monorepo

### Required Tests

- Migration applies cleanly
- Unit or integration stub that verifies tables exist and RLS is enabled (or documented RLS verification plan)
- RLS policy review before merge (per review gates)

### Localization Impact

- None (schema only; locale columns in profiles use schema types)

### Risk Level

- High (foundational; RLS errors affect tenant safety)

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`
- `type:infra`
- `priority:p0`
- `surface:shared`

---

## Task 15.2: Auth and Profile Contracts

### Summary

Define shared API contracts (Zod schemas and contract objects) for auth and profile operations. Covers session validation response, whoami, profile update, and login-related request shapes. Ensures all auth API boundaries use shared schemas.

### Source Documentation

- `docs/07-technical-plan.md` §§4.4, 6.1–6.4
- `docs/00-master-plan.md` §5.1
- `AGENT.md` §§4, 5
- `.cursor/rules/shared-contracts-first.mdc`
- `.cursor/skills/api-contract-generator/SKILL.md`
- `packages/types` (User, UserProfile, TenantScope, RoleAssignment)

### Scope

- Add `packages/contracts/src/auth/` (or `auth/`) domain folder
- Define Zod schemas and contract objects for:
  - `GET /api/v1/auth/whoami` — response: user, profile, tenantScope (optional), roles
  - `GET /api/v1/auth/session` — response: session validity, user id, expires_at (if applicable)
  - `PATCH /api/v1/auth/profile` — request: displayName, avatarUrl, localePreference; response: updated profile
- Reference `@myclup/types` for User, UserProfile, TenantScope, SupportedLocale where applicable
- Export from `packages/contracts` index
- Document auth contract ownership in README

### Out of Scope

- Login/signup request contracts for Supabase Auth (client calls Supabase directly; BFF does not proxy login)
- OAuth-specific request bodies
- API route implementation

### Affected Packages

- `packages/contracts`
- `packages/types` (reference only)

### Dependencies

- Epic #14 Task 14.1 (contract package structure) complete

### Acceptance Criteria

- [ ] `auth/whoami` contract: path, method, response schema with user, profile, optional tenantScope, roles
- [ ] `auth/session` contract: path, method, response schema for session validity
- [ ] `auth/profile` contract: path, method, request and response schemas for profile update
- [ ] All schemas validate with Zod; inferred types exported
- [ ] Contract pattern matches api-contract-generator: `{ path, method, request?, response }`
- [ ] `pnpm build` and `pnpm typecheck` pass for `packages/contracts`

### Required Tests

- Unit tests for each contract schema: valid input passes, invalid input rejects

### Localization Impact

- None (profile locale preference is a field; no user-facing strings)

### Risk Level

- Medium (contracts drive all auth API consumers)

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`
- `type:feature`
- `priority:p0`
- `surface:shared`

---

## Task 15.3: Supabase Auth Provider Configuration

### Summary

Configure Supabase Auth for first-class login methods: email/password, email magic link, phone OTP, and OAuth (Google, Apple, Facebook, X/Twitter). Document configuration, environment variables, and future-ready extensions. Ensure architecture supports passkeys, guest upgrade, and SSO later.

### Source Documentation

- `docs/07-technical-plan.md` §§6.1, 6.2, 6.3, 6.4
- `docs/00-master-plan.md` §5.1
- `AGENT.md` §5

### Scope

- Document Supabase Auth provider setup: which providers to enable in Supabase Dashboard or via config
- Document required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client), `SUPABASE_SERVICE_ROLE_KEY` (server)
- Add OAuth provider env placeholders to `.env.example`: `SUPABASE_GOOGLE_CLIENT_ID`, `SUPABASE_APPLE_*`, etc. (as documented by Supabase)
- Optionally: migration or config file for Supabase Auth settings if project uses config-as-code
- Document future-ready patterns: passkeys, guest-to-account, SSO, provider linking (design notes only; no implementation)
- Update `packages/supabase/README.md` or `docs/` with auth setup instructions

### Out of Scope

- Implementing passkeys, guest upgrade, or SSO
- Client-side login UI or flows
- Custom auth logic outside Supabase Auth

### Affected Packages

- None (documentation and `.env.example`)
- Repo root or `docs/`

### Dependencies

- Epic #13 (Supabase project provisioned)
- Epic #14 (env strategy)

### Acceptance Criteria

- [ ] Documentation describes how to enable each login method in Supabase
- [ ] `.env.example` includes auth-related variables with descriptions
- [ ] OAuth redirect URLs and callback handling documented for web and mobile
- [ ] Future-ready section notes: passkeys, guest-to-account, SSO, provider linking
- [ ] No secrets committed; only placeholder keys in example

### Required Tests

- None (documentation task); manual verification that Supabase project can be configured per doc

### Localization Impact

- None

### Risk Level

- Low

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`
- `type:docs`
- `priority:p0`
- `surface:shared`

---

## Task 15.4: Server-Side Auth Helpers

### Summary

Implement server-side auth utilities in `packages/supabase` or a shared server module: getCurrentUser, getSession, createUserScopedClient. These helpers validate the incoming Supabase session, fetch profile, and provide a user-scoped client for RLS-respecting queries. Support both cookie-based (Next.js) and Bearer-token flows.

### Source Documentation

- `docs/07-technical-plan.md` §§4.3, 4.4, 6.4
- `AGENT.md` §§4, 5
- `.cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc`
- `packages/supabase/README.md`

### Scope

- Add auth helper module (e.g. `packages/supabase/src/auth/` or server-only module in BFF):
  - `getSession(req)` — extract and validate Supabase session from request (cookie or Authorization header)
  - `getCurrentUser(req)` — return user + profile or null if unauthenticated
  - `createUserScopedClient(session)` — create Supabase client with user JWT (respects RLS)
- Support Next.js `NextRequest` / `Request` and `Authorization: Bearer <token>` for mobile
- Integrate with `@supabase/ssr` for Next.js cookie handling where applicable
- Document: server-only boundary, usage in API routes, never trust client-supplied tenant_id
- Ensure profile is loaded from `profiles`; lazy-create profile on first login if missing (optional, or defer to Task 15.7)

### Out of Scope

- Permission checks (Task 15.5)
- Audit logging (Task 15.6)
- API route handlers (Task 15.7)

### Affected Packages

- `packages/supabase` (auth helpers)
- Possibly `apps/web-gym-admin` or shared BFF (if auth module lives in app)

### Dependencies

- Task 15.1 (profiles table)
- Task 15.3 (Supabase Auth configured)

### Acceptance Criteria

- [ ] `getSession(req)` returns validated Supabase session or null
- [ ] `getCurrentUser(req)` returns `{ user, profile }` or null
- [ ] `createUserScopedClient(session)` returns Supabase client with user context (RLS applies)
- [ ] Cookie-based flow works for Next.js server components / API routes
- [ ] Bearer-token flow works for mobile client calls
- [ ] Documented usage and security boundaries
- [ ] `pnpm typecheck` passes

### Required Tests

- Unit tests with mocked request/session: getSession returns session when valid, null when invalid
- Integration test (or stub): getCurrentUser returns profile when session valid and profile exists

### Localization Impact

- None

### Risk Level

- High (all BFF auth flows depend on this)

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`
- `type:infra`
- `priority:p0`
- `surface:shared`

---

## Task 15.5: Permission Resolution and Enforcement Helpers

### Summary

Implement permission resolution and enforcement helpers used by the BFF. Resolve tenant scope from user role assignments, check feature and action permissions, and provide typed helpers for write-path authorization. Never trust client-supplied tenant_id; always derive from server context.

### Source Documentation

- `docs/07-technical-plan.md` §§5.3, 5.4
- `AGENT.md` §4
- `.cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc`
- `packages/types/src/role.ts` (PlatformRole, GymRole, BranchRole, FeaturePermission)

### Scope

- Add permission helper module (e.g. `packages/supabase/src/auth/permissions.ts` or server module):
  - `resolveTenantScope(userId, gymId?, branchId?)` — return allowed TenantScope[] from user_role_assignments and gym_staff
  - `checkPermission(userId, scope, permission)` — verify user has feature/action permission in scope
  - `requirePermission(userId, scope, permission)` — throws if not permitted (for use in write paths)
- Map PlatformRole, GymRole, BranchRole to FeaturePermission sets (e.g. gym_owner has members:read, members:write, etc.)
- Document: always call from server after getCurrentUser; never from client
- Support gym-wide and branch-scoped roles per `packages/types` role model

### Out of Scope

- Audit logging (separate; Task 15.6)
- API route implementation (Task 15.7)
- UI permission checks (clients call BFF; BFF enforces)

### Affected Packages

- `packages/supabase` or shared server module
- `packages/types` (reference role and permission types)

### Dependencies

- Task 15.1 (user_role_assignments, gym_staff tables)
- Task 15.4 (getCurrentUser)

### Acceptance Criteria

- [ ] `resolveTenantScope` returns valid scope(s) for user; filters by gymId/branchId when provided
- [ ] `checkPermission` returns boolean; respects role→permission mapping
- [ ] `requirePermission` throws `ForbiddenError` (or equivalent) when check fails
- [ ] Role→permission mapping documented or configurable
- [ ] Platform admin has full access; gym/branch roles scoped per assignment
- [ ] `pnpm typecheck` passes

### Required Tests

- Unit tests: resolveTenantScope with mocked assignments; checkPermission for various roles
- Integration test: user with gym_staff role can access gym scope; cross-tenant denied

### Localization Impact

- None

### Risk Level

- High (permission bypass is a security issue)

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`
- `type:infra`
- `priority:p0`
- `surface:shared`

---

## Task 15.6: Audit Logging Service

### Summary

Implement audit logging service that writes to `audit_events` for sensitive operations. Provide a typed `writeAuditEvent` helper and document which flows must call it. Integrate with server auth context for actor and tenant.

### Source Documentation

- `docs/07-technical-plan.md` §9.2
- `docs/00-master-plan.md` §8
- `.cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc`
- `.cursor/rules/auditability-analytics-and-observability.mdc`

### Scope

- Add audit service module (e.g. `packages/supabase/src/audit/` or server module):
  - `writeAuditEvent(params)` — insert into audit_events with event_type, actor_id, target_type, target_id, payload, tenant_context
  - Define event types for: role_change, billing_override, membership_extension, refund, admin_impersonation, cross_tenant_support
  - Use service role client for insert (audit table has no public read)
  - Document: every sensitive flow must call writeAuditEvent before/after
- Integrate actor_id from getCurrentUser where applicable
- Add typed event payload schemas (Zod) for each event type

### Out of Scope

- Implementing the sensitive flows themselves (role change, impersonation, etc.)
- Analytics or product events (different from audit)
- Audit log UI or query API

### Affected Packages

- `packages/supabase` (audit service)
- `packages/contracts` (optional: audit event schemas if shared)

### Dependencies

- Task 15.1 (audit_events table)

### Acceptance Criteria

- [ ] `writeAuditEvent` exists and inserts into audit_events
- [ ] Event types cover: role_change, billing_override, membership_extension, refund, admin_impersonation, cross_tenant_support
- [ ] Payload and tenant_context are JSON-serializable; no PII in logs beyond required audit fields
- [ ] Documentation lists which flows must call writeAuditEvent
- [ ] `pnpm typecheck` passes

### Required Tests

- Unit test: writeAuditEvent inserts row; integration test with Supabase (or mocked) verifies insert

### Localization Impact

- None

### Risk Level

- Medium (audit gaps affect compliance)

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`
- `type:feature`
- `priority:p0`
- `surface:shared`

---

## Task 15.7: Auth API Routes and BFF Session Handling

### Summary

Implement auth-related API routes and BFF session handling. Provide `GET /api/v1/auth/whoami`, `GET /api/v1/auth/session`, and `PATCH /api/v1/auth/profile`. Integrate auth middleware for protected routes. Ensure profile creation on first authenticated request when missing.

### Source Documentation

- `docs/07-technical-plan.md` §§4.3, 4.4, 6.4
- `AGENT.md` §§4, 5
- `.cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc`

### Scope

- Add API routes in Next.js BFF (e.g. `apps/web-gym-admin/app/api/v1/auth/` or shared BFF app):
  - `GET /api/v1/auth/whoami` — returns user, profile, tenantScope, roles per contract
  - `GET /api/v1/auth/session` — returns session validity
  - `PATCH /api/v1/auth/profile` — updates profile; validates with contract
- Use getCurrentUser, resolveTenantScope, permission checks
- Lazy-create profile when user exists in auth.users but no profiles row (first login)
- Document middleware or pattern for protecting routes: require auth, optionally require tenant scope
- Next.js middleware for Supabase session refresh (cookie-based) if applicable
- Return 401 when unauthenticated; 403 when authenticated but lacking permission

### Out of Scope

- Client-side login UI (separate epic/task)
- OAuth callback routes (Supabase handles; redirect to app)
- Full RBAC UI (admin panel role management)

### Affected Apps / Packages

- `apps/web-gym-admin` (or shared BFF app; confirm layout from Epic #14)
- `packages/contracts` (consumed)
- `packages/supabase` (auth helpers, permission helpers)

### Dependencies

- Task 15.2 (contracts)
- Task 15.4 (auth helpers)
- Task 15.5 (permission helpers)

### Acceptance Criteria

- [ ] `GET /api/v1/auth/whoami` returns user, profile, tenantScope, roles when authenticated
- [ ] `GET /api/v1/auth/whoami` returns 401 when unauthenticated
- [ ] `GET /api/v1/auth/session` returns session validity
- [ ] `PATCH /api/v1/auth/profile` updates profile and returns updated profile
- [ ] Profile created on first whoami when missing
- [ ] Response shapes validate against contract schemas
- [ ] `pnpm typecheck` and `pnpm build` pass

### Required Tests

- Integration tests: whoami returns 401 without session; whoami returns user+profile with valid session
- Integration test: profile update validates input and persists

### Localization Impact

- None (profile locale is stored; no client-facing strings in API)

### Risk Level

- High (auth routes are critical path)

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`
- `type:feature`
- `priority:p0`
- `surface:shared`

---

## Task 15.8: api-client Auth Methods

### Summary

Add typed auth methods to `packages/api-client` for whoami, session, and profile update. Ensure auth token is passed from client (Supabase session) to BFF via configured headers. Document how mobile and web configure the client with auth.

### Source Documentation

- `docs/07-technical-plan.md` §§4.4
- `AGENT.md` §3
- `.cursor/rules/shared-contracts-first.mdc`
- Epic #14 Task 14.4 (api-client pattern)

### Scope

- Add `auth` namespace to api-client:
  - `auth.whoami()` — GET whoami, returns typed WhoAmIResponse
  - `auth.getSession()` — GET session
  - `auth.updateProfile(input)` — PATCH profile
- Base client must accept `getAuthHeaders(): Promise<HeadersInit> | HeadersInit` (or equivalent) so callers inject session token
- Document: web apps use Supabase session from `@supabase/ssr` or client; mobile uses Supabase client `session.access_token`; pass as `Authorization: Bearer <token>`
- Validate responses with contract schemas

### Out of Scope

- Supabase Auth client usage (handled by apps)
- Login/signup flows (client → Supabase directly)
- Session persistence (Supabase client responsibility)

### Affected Packages

- `packages/api-client`
- `packages/contracts` (consumed)

### Dependencies

- Task 15.2 (contracts)
- Task 15.7 (API routes implemented)
- Epic #14 Task 14.4 (api-client base)

### Acceptance Criteria

- [ ] `auth.whoami()` calls GET /api/v1/auth/whoami with auth headers
- [ ] `auth.getSession()` calls GET /api/v1/auth/session
- [ ] `auth.updateProfile(input)` calls PATCH with validated input
- [ ] Client supports injectable auth headers (config or factory)
- [ ] Responses parsed with contract.response.parse()
- [ ] README documents auth configuration for web and mobile
- [ ] `pnpm typecheck` and `pnpm build` pass

### Required Tests

- Unit test: auth.whoami with mocked fetch returns typed response; invalid response throws
- Unit test: updateProfile sends correct body and parses response

### Localization Impact

- None

### Risk Level

- Medium (all clients use this for auth API access)

### Owning Agent

- `owner:backend`

### Recommended Labels

- `state:scoped`
- `type:feature`
- `priority:p0`
- `surface:shared`

---

## Prioritized Task List (Execution Order)

| Order | Task   | Summary                                              | Owner   |
|-------|--------|------------------------------------------------------|---------|
| 1     | 15.1   | Database schema (tenant, profiles, roles, audit)    | backend |
| 2     | 15.2   | Auth and profile contracts                           | backend |
| 3     | 15.3   | Supabase Auth provider configuration                 | backend |
| 4     | 15.4   | Server-side auth helpers                             | backend |
| 5     | 15.6   | Audit logging service                                | backend |
| 6     | 15.5   | Permission resolution and enforcement helpers       | backend |
| 7     | 15.7   | Auth API routes and BFF session handling            | backend |
| 8     | 15.8   | api-client auth methods                              | backend |

---

## Follow-Up Work (Out of Epic #15 Scope)

- Client-side login screens and auth flows (mobile-user, mobile-admin, web-gym-admin, web-platform-admin)
- Supabase client setup per app (session persistence, OAuth redirect handling)
- Gym/branch switcher UI
- Role management UI (platform admin, gym admin)
- Passkeys, guest-to-account, SSO, provider linking (future-ready design only in 15.3)
