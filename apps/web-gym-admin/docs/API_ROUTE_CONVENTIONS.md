# /api/v1 Route Conventions

This document defines conventions for all BFF API routes in MyClup Next.js apps. All routes must follow these rules.

## Path Format

- **Version prefix**: `/api/v1`
- **Resource segments**: `/api/v1/[resource]` or `/api/v1/[resource]/[action]`
- **Examples**:
  - `GET /api/v1/health/ping` — health check
  - `GET /api/v1/members` — list members (future)
  - `POST /api/v1/bookings` — create booking (future)

## HTTP Methods

| Method | Semantics |
|--------|-----------|
| `GET` | Read; no request body |
| `POST` | Create or action; request body validated with contract |
| `PUT` | Replace; request body validated |
| `PATCH` | Partial update; request body validated |
| `DELETE` | Remove; query params or body when needed |

## Validation Boundary

**Never trust raw request data.** All input must pass through Zod validation before use.

1. **Request body**: Parse JSON, then validate with `contract.request.parse()`. Never use `req.json()` result directly in business logic.
2. **Query params**: Validate with a Zod schema before use.
3. **Response**: Construct the response in server modules, then validate with `contract.response.parse()` before returning.

The reusable handler pattern enforces this: raw body → parse → validate → delegate to server module → validate response → return.

## Error Shapes

Standard error responses use JSON with consistent shape:

| Status | Shape | Use |
|--------|-------|-----|
| 400 | `{ "error": "validation_error", "details": [...] }` | Zod validation failure |
| 401 | `{ "error": "unauthorized" }` | Auth required (Epic #15) |
| 403 | `{ "error": "forbidden" }` | Permission denied (Epic #15) |
| 404 | `{ "error": "not_found" }` | Resource not found |
| 500 | `{ "error": "internal_error" }` | Unexpected server error |

## Handler Pattern

Route handlers must:

1. **Not contain business logic** — delegate to server modules (`src/server/`).
2. **Use the contract** — validate request (if body) and response with shared schemas from `@myclup/contracts`.
3. **Use the reusable wrapper** — `withContractRoute` (or equivalent) to enforce validation and standard error handling.

## Example

```ts
// Route handler: thin orchestration only
export const GET = withContractRoute(pingContract, async () => {
  return pingServer.ping();
});

// Server module: business logic
export async function ping(): Promise<RawPingResult> {
  return { status: "ok", timestamp: new Date().toISOString() };
}
```

## References

- `docs/07-technical-plan.md` §§4.1, 4.3, 4.4
- `AGENT.md` §4
- `.cursor/rules/shared-contracts-first.mdc`
- `packages/contracts` — source of truth for schemas
