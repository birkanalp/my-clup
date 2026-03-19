Generate a typed API contract for the endpoint or feature described.

All contracts live in `packages/contracts`. API versioning: `/api/v1`. Types shared across contracts go in `packages/types`. Client implementation goes in `packages/api-client`.

For the endpoint/feature: $ARGUMENTS

Produce the following:

## 1. File Placement

Specify the exact file path(s) under `packages/contracts/src/` grouped by domain/resource.

## 2. Zod Schemas

```typescript
import { z } from 'zod';

// Request schema
export const [Resource]RequestSchema = z.object({
  // fields with types
});

// Response schema
export const [Resource]ResponseSchema = z.object({
  // fields with types
});
```

If the contract returns user-facing text, include `locale` in the request or response.

## 3. TypeScript Types

```typescript
export type [Resource]Request = z.infer<typeof [Resource]RequestSchema>;
export type [Resource]Response = z.infer<typeof [Resource]ResponseSchema>;
```

## 4. Contract Definition

```typescript
export const [resource]Contract = {
  path: '/api/v1/[resource]',
  method: 'POST' as const, // or GET, PUT, DELETE, PATCH
  request: [Resource]RequestSchema,
  response: [Resource]ResponseSchema,
};
```

## 5. Handler Signature (Next.js BFF)

```typescript
async function handle[Resource](
  req: { body: unknown },
  context: { userId: string; gymId: string; branchId?: string }
): Promise<[Resource]Response> {
  const parsed = [Resource]RequestSchema.safeParse(req.body);
  if (!parsed.success) throw new ValidationError(parsed.error);
  // server-side tenant check
  // server-side permission check
  // domain logic
  // return response
}
```

## 6. Client Usage (packages/api-client)

```typescript
import { [resource]Contract } from '@myclup/contracts';

async function [resource](input: [Resource]Request): Promise<[Resource]Response> {
  const res = await apiRequest(
    [resource]Contract.path,
    { method: [resource]Contract.method, body: input }
  );
  return [resource]Contract.response.parse(res);
}
```

## 7. Change Checklist

- [ ] Schema updated in `packages/contracts`
- [ ] Server/API implementation updated
- [ ] Typed client updated in `packages/api-client`
- [ ] All affected app call sites updated
- [ ] Tests updated or added
- [ ] Forms using this contract updated to validate against new schema
