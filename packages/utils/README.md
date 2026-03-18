# @myclup/utils

Framework-agnostic helpers and pure functions for the MyClup platform. No React, Expo, or Next.js imports.

## Package Boundaries

### What Belongs in `utils`

- **Locale-aware formatters**: `formatDate`, `formatTime`, `formatNumber`, `formatCurrency`, `formatUnit` — pure functions that accept `locale` (from `@myclup/types`) for consistent formatting across surfaces
- **Domain-safe helpers**: `parseISODate`, `isValidLocale` — pure parsing/validation with no side effects
- **Pure functions**: Framework-agnostic helpers that have no framework dependencies

### What Belongs in `packages/contracts`

- API request/response schemas (Zod)
- Input/output validation schemas
- Contract objects (`path`, `method`, `request`, `response`)

Use `packages/contracts` when defining shared API boundaries. Do not duplicate validation logic in `utils`.

### What Belongs in `packages/types`

- Framework-agnostic domain types
- Enums, branded types, interfaces
- `SupportedLocale`, `TenantId`, etc.

Use `packages/types` for type definitions. `utils` consumes types but does not define new shared domain types.

### What Belongs in Apps (App-Local)

- Framework-specific hooks (e.g. `useLocale()`)
- UI component logic
- App-specific orchestration
- Next.js/Expo/React-specific utilities

Do not move app-specific flows into `utils` "just in case."

## Anti-Patterns

| Anti-Pattern | Instead |
|--------------|---------|
| Importing React, Expo, or Next.js in `utils` | Keep `utils` framework-agnostic; app code uses utils |
| Duplicating contract validation in utils | Use shared schemas from `packages/contracts` |
| Putting business logic in utils | Business logic lives in server modules or app layers |
| Creating utils "for future reuse" | Add to utils only when reuse is real and immediate |
| Hardcoding locale in formatters | Always pass `locale` (SupportedLocale) for user-facing output |

## Exports

```ts
import {
  formatDate,
  formatTime,
  formatNumber,
  formatCurrency,
  formatUnit,
  parseISODate,
  isValidLocale,
} from "@myclup/utils";
```

All locale-aware formatters accept `locale: SupportedLocale` from `@myclup/types`.
