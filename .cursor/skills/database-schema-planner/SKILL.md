---
name: database-schema-planner
description: Design database schemas for Supabase with multi-tenant safety. Use when planning tables, migrations, or schema for a domain feature. Outputs entity overview, table schemas, relationships, RLS requirements, migration notes. Supports gym tenant isolation, branch scope, role-based access.
---

# Database Schema Planner

## Purpose

For a given domain feature, design database schemas compatible with Supabase Postgres and MyClup multi-tenant safety. Produce tables, relationships, indexes, RLS considerations, tenant boundaries, and migration notes. **Highlight auditing requirements for sensitive operations.**

## Tenant Model

- **Root tenant**: `gym` — all tenant-owned data scoped by `gym_id`
- **Operational scope**: `branch` — optional `branch_id` for branch-level isolation
- **Cross-tenant**: Denied by default; platform admin access must be audited
- **Roles**: Model via assignment tables (e.g., `gym_staff`, `user_role_assignments`), not hard-coded user types

## Sensitive Operations Requiring Audit

These flows must write to an audit table:

- Role changes
- Billing overrides
- Membership manual extension
- Refunds
- Admin impersonation
- Cross-tenant support access

If the schema touches any of these, include an `audit_events` (or equivalent) write path and note it in the output.

## Output Template

Emit this structure for each domain feature:

```markdown
# Database Schema: [Feature Name]

## Entity Overview

| Entity   | Table        | Tenant-scoped | Branch-scoped |
| -------- | ------------ | ------------- | ------------- |
| [Entity] | [table_name] | yes/no        | yes/no        |

## Table Schemas

\`\`\`sql
-- table_name
CREATE TABLE public.[table_name] (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
gym_id UUID NOT NULL REFERENCES public.gyms(id),
branch_id UUID REFERENCES public.branches(id), -- if branch-scoped
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
-- ... domain columns
);

CREATE INDEX idx*[table]\_gym_id ON public.[table_name](gym_id);
CREATE INDEX idx*[table]\_branch_id ON public.[table_name](branch_id) WHERE branch_id IS NOT NULL;
\`\`\`

## Relationship Diagram (Text)

\`\`\`
[Parent] 1 ----< N [Child]
[Entity] N ---- 1 [Gym]
...
\`\`\`

## RLS Requirements

- **Policy**: [table] — Users can [SELECT|INSERT|UPDATE|DELETE] only when [condition using gym_id/branch_id and auth.uid()]
- **Service role**: [Note if platform admin needs bypass — must be audited]
- **Cross-tenant**: Denied by default
- **Verification**: RLS policy must check `gym_id` (and `branch_id` if applicable) against caller's accessible scope

## Migration Notes

- [Migration order / dependencies]
- [Breaking changes if any]
- [Rollback considerations]
- [RLS tests required before production]
```

## Rules

- **Tenant columns**: Tenant-owned tables must have `gym_id` (and optionally `branch_id`). Platform-wide tables (e.g., `gyms`, `auth.users`) do not.
- **RLS mandatory**: Every tenant-owned table needs RLS policies. Do not propose schema without RLS.
- **Indexes**: Index `gym_id`, `branch_id`, and frequently filtered columns. Support tenant-scoped queries.
- **Audit**: If the feature touches sensitive flows, add audit table reference and document required audit events.
- **Supabase**: Use `public` schema, `gen_random_uuid()`, `TIMESTAMPTZ` for timestamps. Align with Supabase Postgres conventions.
- **Referential integrity**: Use foreign keys. Respect tenant boundaries — child `gym_id` must match parent.
- **No hard-coded roles**: Use `gym_staff`, `user_role_assignments`, or similar. Roles are data, not columns.
