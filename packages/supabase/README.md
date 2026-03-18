# @myclup/supabase

Shared Supabase package for MyClup: database type generation, server-side clients, SQL conventions, and RLS guidance.

## ⚠️ Server-Only Boundary

**Client apps must NOT import `@myclup/supabase`.**

| Allowed | Forbidden |
|---------|-----------|
| Next.js BFF routes, API handlers | `apps/mobile-user` |
| Server actions, server modules | `apps/mobile-admin` |
| Build scripts, migrations | `apps/web-gym-admin` (UI code) |
| | `apps/web-platform-admin` (UI code) |
| | `apps/web-site` (UI code) |

All Supabase access from client surfaces goes through the Next.js BFF and `@myclup/api-client`. Never call Supabase directly from client code.

---

## Package Structure

```
packages/supabase/
├── src/
│   ├── index.ts              # Main entry (client factory, re-exports)
│   ├── client/
│   │   ├── index.ts          # Client exports
│   │   └── create-server-client.ts
│   └── generated/            # ← Generated DB types live here
│       └── database.types.ts
├── dist/                     # Compiled output (from tsc build)
├── README.md
├── package.json
└── tsconfig.json
```

### Entry Points

- **`@myclup/supabase`** — Main: `createServerClient`, `Database`, `Json`
- **`@myclup/supabase/client`** — Client factory only
- **`@myclup/supabase/generated`** — Raw DB types (advanced use)

---

## Generated Database Types

**Location**: `src/generated/database.types.ts`

Until a Supabase project is provisioned, this file contains a placeholder schema. When the database exists:

```bash
# From repo root or packages/supabase
pnpm exec supabase gen types typescript --project-id <project-ref> > packages/supabase/src/generated/database.types.ts
```

Or use the placeholder script (logs the command):

```bash
pnpm --filter @myclup/supabase generate:types
```

**Convention**: Commit generated types to version control. Regenerate when schema changes.

---

## Server Client Usage

```typescript
import { createServerClient } from "@myclup/supabase";

// In API route or server module — read from env
const client = createServerClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
});

// Client bypasses RLS; enforce tenant and permission checks in app logic
const { data, error } = await client.from("gyms").select("*").eq("id", gymId);
```

**Important**: The service role key bypasses Row Level Security. Always verify tenant scope and user permissions server-side before any write or sensitive read.

---

## SQL Conventions

- **Schema**: Prefer `public` schema unless a separate schema is justified
- **Migrations**: Use `supabase/migrations/` at repo root (or as documented in project setup)

### Applying Migrations

When a Supabase project is linked (`supabase link --project-ref <id>`):

```bash
# From repo root
pnpm exec supabase db push
```

Migrations create `gyms`, `branches`, `profiles`, `user_role_assignments`, `gym_staff`, `audit_events` and RLS policies (Task 15.1).
- **Naming**: snake_case for tables and columns
- **IDs**: Use `uuid` for primary keys; `gen_random_uuid()` default
- **Timestamps**: `created_at`, `updated_at` (timestamptz)
- **Tenant columns**: All tenant-owned tables must have `gym_id` (and optionally `branch_id`)

---

## RLS (Row Level Security) Conventions

- **Mandatory** for tenant-owned data
- **Policies**: Explicit `USING` and `WITH CHECK` expressions; avoid permissive defaults
- **Tenant isolation**: Every policy on tenant tables must filter by `gym_id` (and `branch_id` when applicable)
- **Service role**: Bypasses RLS; server code using service role must enforce checks in application logic
- **Anon/authenticated**: Used only for client-side Supabase access where BFF delegates; RLS must restrict to authorized rows
- **Cross-tenant**: Denied by default; platform admin elevated access requires audit trail

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | BFF / server | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key (bypasses RLS) |

Never expose `SUPABASE_SERVICE_ROLE_KEY` to client bundles.
