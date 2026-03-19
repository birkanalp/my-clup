# @myclup/supabase

Shared Supabase package for MyClup: database type generation, server-side clients, SQL conventions, and RLS guidance.

## ⚠️ Server-Only Boundary

**Client apps must NOT import `@myclup/supabase`.**

| Allowed                          | Forbidden                           |
| -------------------------------- | ----------------------------------- |
| Next.js BFF routes, API handlers | `apps/mobile-user`                  |
| Server actions, server modules   | `apps/mobile-admin`                 |
| Build scripts, migrations        | `apps/web-gym-admin` (UI code)      |
|                                  | `apps/web-platform-admin` (UI code) |
|                                  | `apps/web-site` (UI code)           |

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
import { createServerClient } from '@myclup/supabase';

// In API route or server module — read from env
const client = createServerClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
});

// Client bypasses RLS; enforce tenant and permission checks in app logic
const { data, error } = await client.from('gyms').select('*').eq('id', gymId);
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

### RLS Verification Plan

After applying migrations with `supabase db push`, verify tables and RLS are in place:

1. **Verify tables exist** (psql or Supabase SQL editor):

   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('gyms', 'branches', 'profiles', 'user_role_assignments', 'gym_staff', 'audit_events');
   ```

   Expected: 6 rows.

2. **Verify RLS is enabled** on tenant-owned tables:

   ```sql
   SELECT relname, relrowsecurity FROM pg_class
   WHERE relname IN ('gyms', 'branches', 'profiles', 'user_role_assignments', 'gym_staff', 'audit_events')
   AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
   ```

   Expected: `relrowsecurity = true` for each.

3. **Verify policies exist**:
   ```sql
   SELECT schemaname, tablename, policyname FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename IN ('gyms', 'branches', 'profiles', 'user_role_assignments', 'gym_staff', 'audit_events');
   ```
   Expected: One or more policies per table.

Run these checks before marking schema changes ready for merge.

---

## Environment Variables

| Variable                        | Where                 | Purpose                                                        |
| ------------------------------- | --------------------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | BFF / server / client | Supabase project URL                                           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | BFF / client          | Anonymous key for client-side auth; RLS enforces tenant safety |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server only           | Service role key (bypasses RLS)                                |

Never expose `SUPABASE_SERVICE_ROLE_KEY` to client bundles. The anon key is safe for client use; RLS policies restrict data access.

---

## Supabase Auth Setup

MyClup uses Supabase Auth for authentication. All auth flows go through Supabase; the BFF validates sessions and derives tenant scope server-side.

### Environment Variables (Auth)

| Variable                        | Required     | Purpose                                                         |
| ------------------------------- | ------------ | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes          | Supabase project URL (e.g. `https://xxx.supabase.co`)           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes          | Anonymous key for client auth; used by Supabase Auth client     |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes (server) | Service role key for server-side user admin, token verification |

For mobile apps, use `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as the Expo equivalents.

### Auth Providers (Supabase Dashboard)

Enable and configure providers in **Supabase Dashboard → Authentication → Providers**:

| Provider             | Use case                       | Notes                                                 |
| -------------------- | ------------------------------ | ----------------------------------------------------- |
| **Email / Password** | Classic sign-up, gym staff     | Default; enable in Dashboard                          |
| **Magic Link**       | Passwordless email login       | Enable "Email" provider, use magic link flow          |
| **Phone OTP**        | SMS verification, mobile-first | Enable "Phone" provider; configure Twilio or built-in |
| **OAuth**            | Social login                   | Google, Apple, Facebook, etc.                         |

### OAuth Provider Configuration

For OAuth providers, configure in Supabase Dashboard. Add the following env placeholders for server-side token exchange (obtain values from Supabase Auth providers config):

| Variable                 | Provider  | Purpose                                                    |
| ------------------------ | --------- | ---------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`       | Google    | OAuth client ID (optional if configured in Dashboard only) |
| `GOOGLE_CLIENT_SECRET`   | Google    | OAuth client secret for token exchange                     |
| `APPLE_CLIENT_ID`        | Apple     | Apple OAuth (Sign in with Apple)                           |
| `APPLE_CLIENT_SECRET`    | Apple     | Apple secret (for token exchange)                          |
| `FACEBOOK_CLIENT_ID`     | Facebook  | Facebook OAuth                                             |
| `FACEBOOK_CLIENT_SECRET` | Facebook  | Facebook secret                                            |
| `TWITTER_CLIENT_ID`      | Twitter/X | Twitter OAuth                                              |
| `TWITTER_CLIENT_SECRET`  | Twitter/X | Twitter secret                                             |

Supabase hosts the OAuth redirect URLs. Obtain redirect URI from Dashboard → Authentication → URL Configuration.

### Future-Ready (Not Yet Implemented)

| Feature                 | Description                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **Passkeys / WebAuthn** | Passwordless sign-in via device biometrics or security keys                          |
| **Guest-to-Account**    | Upgrade anonymous sessions to full accounts (e.g. link guest cart to signed-up user) |
| **SSO (SAML/OIDC)**     | Enterprise single sign-on for gym chains                                             |
| **Provider linking**    | Link multiple auth providers (email + Google) to one account                         |

When implementing these, follow Supabase Auth docs and extend this section. No secrets in repo; use env vars only.
