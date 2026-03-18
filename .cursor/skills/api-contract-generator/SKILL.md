---
name: api-contract-generator
description: Generate typed API contracts for shared backend-client communication. Use when adding or changing API endpoints. Outputs Zod schemas, TypeScript types, endpoint handler signature, and api-client usage. All contracts go in packages/contracts; versioned at /api/v1.
---

# API Contract Generator

## Purpose

For a requested API endpoint, generate typed contracts reusable by web, mobile, and server. All contracts live in `packages/contracts`. API versioning: `/api/v1`.

## Placement

- **Contracts**: `packages/contracts`
- **Domain types** (if shared across contracts): `packages/types`
- **Client implementation**: `packages/api-client` (consumes contracts)
- **Endpoint path**: `/api/v1/[resource]` or `/api/v1/[resource]/[action]`

## Output Structure

Emit the following for each endpoint. Use framework-agnostic patterns; contracts must work in web, mobile, and server.

### 1. Zod Schemas

```typescript
import { z } from 'zod';

// Request schema
export const CreateBookingRequestSchema = z.object({
  classId: z.string().uuid(),
  memberId: z.string().uuid(),
  slotId: z.string().uuid(),
});

// Response schema
export const CreateBookingResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  createdAt: z.string().datetime(),
});
```

### 2. TypeScript Types

```typescript
export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;
export type CreateBookingResponse = z.infer<typeof CreateBookingResponseSchema>;
```

Or, for shared domain types, define in `packages/types` and reference in contracts.

### 3. Contract Definition

```typescript
export const createBookingContract = {
  path: '/api/v1/bookings',
  method: 'POST' as const,
  request: CreateBookingRequestSchema,
  response: CreateBookingResponseSchema,
};
```

### 4. Example Endpoint Handler Signature

```typescript
// Next.js API route or BFF handler
async function handleCreateBooking(
  req: { body: unknown },
  context: { userId: string; tenantId: string }
): Promise<CreateBookingResponse> {
  const parsed = CreateBookingRequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(parsed.error);
  // ... server logic, tenant checks, persistence
  return response;
}
```

### 5. Example Client Usage

```typescript
// packages/api-client
import { createBookingContract } from '@myclup/contracts';

async function createBooking(input: CreateBookingRequest): Promise<CreateBookingResponse> {
  const res = await fetch(createBookingContract.path, {
    method: createBookingContract.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  return createBookingContract.response.parse(data);
}
```

## Rules

- **Single source of truth**: Schemas and types live only in `packages/contracts` (or `packages/types` for domain types). No duplication in apps.
- **Zod for boundaries**: Use Zod for request/response validation. Infer types with `z.infer<>`.
- **Locale**: If the contract returns user-facing text, include `locale` in the request or response where applicable.
- **Versioned path**: All versioned endpoints use `/api/v1`.
- **Reusable**: Contracts must be importable by Next.js API routes, `packages/api-client`, and app code. No React/Expo/Next-specific code inside contracts.
- **Handler validation**: Server must validate with the shared schema before processing; never trust raw request body.

## File Layout

```
packages/contracts/
  src/
    bookings/
      create-booking.ts    # schema + types + contract
      list-bookings.ts
    ...
  package.json
```

Group by domain or resource. Export from package index for clean imports.
