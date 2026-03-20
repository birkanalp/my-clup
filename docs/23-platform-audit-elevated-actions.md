# Platform admin — audited elevated actions and impersonation (#183)

## 1. Principles

- **No silent cross-tenant access.** Any platform user acting on behalf of a tenant must go through an **explicit, time-bounded impersonation** or support workflow that is **audit-logged** before and after.
- **Server-side only.** UI badges are not authorization. Every elevated action validates **Supabase identity**, **platform role**, and **scope** on the BFF.
- **Audit events** must use `writeAuditEvent` with typed payloads (`packages/supabase/src/audit`) for: impersonation start/end, role grants, billing overrides visible to platform, and moderation actions that affect member-visible state.

## 2. Required audit metadata

- `actor_id`, `event_type`, `target_type`, `target_id`, `tenant_context` (gym/branch), structured `payload` with **reason** and **ticket reference** when applicable.

## 3. UI obligations

- **PlatformStubPage** routes in `web-platform-admin` are placeholders until APIs exist; shipping real mutations requires **integration tests** proving audit rows are written and RLS prevents gym users from reading platform-only audit slices.

## 4. Conflicts

On ambiguity, **`docs/07-technical-plan.md`** and **`docs/18-analytics-observability-spec.md`** take precedence over this note.
