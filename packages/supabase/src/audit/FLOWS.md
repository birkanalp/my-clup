# Audit Flows: When to Call writeAuditEvent

Per `docs/07-technical-plan.md` §9.2 and `.cursor/rules/server-side-auth-permissions-and-tenant-safety.mdc`, the following flows **must** call `writeAuditEvent` before or after the sensitive operation.

## Mandatory Audit Flows

| Flow                     | Event Type             | When to Call                                          | Notes                                                                   |
| ------------------------ | ---------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| **Role change**          | `role_change`          | After successful role assignment create/update/delete | `user_role_assignments` or `gym_staff`; include previous_role, new_role |
| **Billing override**     | `billing_override`     | After manual billing state change                     | Override of subscription, payment status, etc.                          |
| **Membership extension** | `membership_extension` | After manual membership end-date extension            | Manual extension of validity period                                     |
| **Refund**               | `refund`               | After refund is processed                             | Include payment_id, amount_cents                                        |
| **Admin impersonation**  | `admin_impersonation`  | Before impersonation start; after impersonation end   | `action: "start"` or `action: "end"`                                    |
| **Cross-tenant support** | `cross_tenant_support` | Before/after platform support accesses another tenant | target_gym_id, target_branch_id (optional)                              |
| **Chat assignment**      | `chat_assignment`      | After successful conversation assign/reassign         | assigned_by, assigned_to, assigned_at, assigned_from (reassignment)     |

## Chat Moderation Hook Points

Per `.cursor/rules/chat-first-realtime-safety.mdc`, staff-assigned chat reassignments and important moderation actions must preserve auditability. The following moderation hook points are documented for future implementation; each **must** call `writeAuditEvent` when implemented:

| Hook Point            | When to Audit                                      | Target Entity               | Payload Notes                                    |
| --------------------- | -------------------------------------------------- | --------------------------- | ------------------------------------------------ |
| **Conversation flag** | After staff flags a conversation for review        | `conversations`             | flag_reason, flagged_by, conversation_id         |
| **Message flag**      | After staff flags a message                        | `messages`                  | message_id, flag_reason, conversation_id         |
| **Participant mute**  | After staff mutes a participant in a conv          | `conversation_participants` | participant_id, muted_until, reason              |
| **Message delete**    | After staff soft-deletes a message                 | `messages`                  | message_id, deleted_by, reason (moderation only) |
| **Reassignment**      | Implemented: `assignConversation` in web-gym-admin | `conversation_assignments`  | See chat_assignment flow above                   |

Full moderation UI and platform admin oversight views are out of scope for Epic 17; these hooks define integration points when those features are built.

## Call Pattern

For flows that alter state:

1. Perform tenant and permission checks (server-side).
2. Execute the sensitive operation.
3. On success, call `writeAuditEvent` with the appropriate event type and validated payload.

For flows with clear before/after semantics (e.g. impersonation):

- Call `writeAuditEvent` with `action: "start"` before granting elevated access.
- Call `writeAuditEvent` with `action: "end"` when ending the elevated session.

## Actor and Tenant Context

- **actor_id**: Use `getCurrentUser(req)` to obtain the authenticated user; pass `user.id` as `actor_id`. For system-initiated events, pass `null`.
- **tenant_context**: Include `gym_id` and optionally `branch_id` from the resolved tenant scope (e.g. from `resolveTenantScope` or request context).
- **target_type** / **target_id**: The primary entity affected (e.g. `membership`, membership UUID).

## Example

```ts
import { createServerClient } from '@myclup/supabase/client';
import { writeAuditEvent, AUDIT_EVENT_TYPES } from '@myclup/supabase/audit';

const client = createServerClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
});

await writeAuditEvent(client, {
  event_type: AUDIT_EVENT_TYPES.role_change,
  actor_id: currentUser.id,
  target_type: 'user_role_assignments',
  target_id: assignmentId,
  payload: {
    assignment_type: 'user_role_assignments',
    previous_role: 'gym_staff',
    new_role: 'gym_manager',
    reason: 'Promotion',
  },
  tenant_context: { gym_id: gymId, branch_id: branchId ?? undefined },
});
```
