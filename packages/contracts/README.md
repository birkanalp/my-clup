# @myclup/contracts

Shared API schemas, Zod validation, and request/response contracts. Single source of truth for cross-app API boundaries.

## Ownership

| Concern                           | Location             |
| --------------------------------- | -------------------- |
| API schemas                       | `packages/contracts` |
| Zod validation                    | `packages/contracts` |
| Request/response contracts        | `packages/contracts` |
| Domain types (framework-agnostic) | `packages/types`     |

- **Contract changes** must trigger updates in server implementation, `packages/api-client`, and affected app call sites.
- **No duplication**: Apps must not redefine or copy contracts locally.
- **API versioning**: All versioned endpoints use `/api/v1`.

## File Layout

```
packages/contracts/
├── src/
│   ├── common/          # Shared schemas and utilities
│   │   └── index.ts
│   ├── health/          # Health check contracts
│   │   ├── ping.ts
│   │   └── index.ts
│   └── index.ts         # Main package entry
├── package.json
├── tsconfig.json
└── README.md
```

Domain folders follow the pattern: `src/<domain>/` (e.g. `src/bookings/`, `src/chat/`). Each domain exports its contracts via an `index.ts`.

## Contract Pattern

Every contract file defines:

1. **Zod schema** — Request and response validation
2. **Inferred types** — `z.infer<typeof Schema>`
3. **Contract object** — `{ path, method, request, response }`

Example:

```typescript
import { z } from 'zod';

export const PingRequestSchema = z.object({});
export const PingResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
});

export type PingRequest = z.infer<typeof PingRequestSchema>;
export type PingResponse = z.infer<typeof PingResponseSchema>;

export const pingContract = {
  path: '/api/v1/health/ping',
  method: 'GET' as const,
  request: PingRequestSchema,
  response: PingResponseSchema,
} as const;
```

## Package Entry Points

| Import                     | Contents                                       |
| -------------------------- | ---------------------------------------------- |
| `@myclup/contracts`        | All contracts (re-exports from domain folders) |
| `@myclup/contracts/health` | Health contracts only                          |
| `@myclup/contracts/common` | Common schemas and utilities                   |

## Usage

**Server (Next.js API route):**

```typescript
import { pingContract } from '@myclup/contracts';

const data = pingContract.response.parse(responseBody);
```

**Client (api-client or app):**

```typescript
import { pingContract, PingResponse } from '@myclup/contracts';

const res = await fetch(pingContract.path, { method: pingContract.method });
const data = pingContract.response.parse(await res.json());
```

## Scripts

- `pnpm build` — Compile TypeScript to `dist/`
- `pnpm typecheck` — Type check without emit
- `pnpm test` — Run unit tests
- `pnpm lint` — ESLint and Prettier check
