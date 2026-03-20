# Add-On Platform — Shared Contracts

Product scope: `docs/06-addon-packages-plan.md`.

## Contracts

- **`@myclup/contracts/addons`** — Zod schemas for activation requests and entitlement rows.
- **`@myclup/types`** — Parallel string unions (`AddonPackageId`, `AddonEntitlementStatus`) for non-schema code.

## Package catalog IDs

| ID              | Module              |
| --------------- | ------------------- |
| `sms_messaging` | SMS notifications   |
| `ai_chatbot`    | AI member assistant |
| `e_signature`   | E-sign flows        |
| `ads_campaigns` | Paid acquisition    |

Extend the enum in **contracts and types together** when adding a catalog entry.

## Surfaces

- **Platform admin** — activation, billing, governance (issues #195, #196).
- **Gym admin web** — `apps/web-gym-admin` **Add-on packages** page (configuration shell; issue #198).
- **Downstream** — issue #200 families (chatbot, SMS, e-sign, ads) consume the same entitlement record shape.

## Localization and audit

- User-facing package names and descriptions must use i18n resources per locale.
- Activation, suspension, and billing changes require `audit_events` with actor, gym scope, and package id (see `docs/18-analytics-observability-spec.md` audit section).
