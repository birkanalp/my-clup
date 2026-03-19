Design a Supabase Postgres database schema for the domain feature described.

Apply MyClup multi-tenant safety: `gym` is the root tenant, `branch` is the operational scope. All tenant-owned tables require RLS. Sensitive operations require audit logging.

Feature to design: $ARGUMENTS

## Database Schema: [Feature Name]

### Entity Overview

| Entity | Table | Tenant-scoped (gym_id) | Branch-scoped (branch_id) | Notes |
| ------ | ----- | ---------------------- | ------------------------- | ----- |

### Table Schemas

For each table, provide:

```sql
CREATE TABLE public.[table_name] (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id),
  branch_id UUID REFERENCES public.branches(id),  -- if branch-scoped
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  -- domain columns
);

CREATE INDEX idx_[table]_gym_id ON public.[table_name](gym_id);
CREATE INDEX idx_[table]_branch_id ON public.[table_name](branch_id) WHERE branch_id IS NOT NULL;
-- additional indexes for frequently filtered columns
```

### Relationship Diagram

```
[Parent] 1 ----< N [Child]
[Entity] N ---- 1 [Gym]
```

### RLS Requirements

For each table, specify:

- Policy: which operations (SELECT, INSERT, UPDATE, DELETE)
- Condition: using `gym_id`/`branch_id` and `auth.uid()`
- Service role bypass: note if platform admin needs bypass — must be audited
- Cross-tenant: denied by default

Example:

```sql
ALTER TABLE public.[table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "[table]_gym_isolation" ON public.[table_name]
  FOR ALL USING (
    gym_id IN (
      SELECT gym_id FROM public.gym_staff WHERE user_id = auth.uid()
    )
  );
```

### Sensitive Operations Requiring Audit

If this schema touches any of these flows, include an audit write path:

- Role changes
- Billing overrides
- Membership manual extension
- Refunds
- Admin impersonation
- Cross-tenant support access

```sql
-- audit_events write example
INSERT INTO public.audit_events (actor_id, gym_id, action, target_table, target_id, payload)
VALUES (auth.uid(), $gym_id, 'role_changed', '[table]', $record_id, $payload::jsonb);
```

### Migration Notes

- Migration order and dependencies
- Breaking changes (if any)
- Rollback considerations
- RLS tests required before production

### Rules Applied

- [ ] `gym_id` on every tenant-owned table
- [ ] `branch_id` where branch-level isolation is needed
- [ ] RLS policies defined for every tenant-owned table
- [ ] Indexes on `gym_id`, `branch_id`, and frequently filtered columns
- [ ] Audit table reference for sensitive operations
- [ ] No hard-coded role types — use assignment tables
- [ ] Referential integrity via foreign keys
- [ ] `gen_random_uuid()` for PKs, `TIMESTAMPTZ` for timestamps
