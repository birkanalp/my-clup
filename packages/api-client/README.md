# @myclup/api-client

Shared typed API client for all MyClup product surfaces. Web and mobile apps must consume BFF endpoints through this package. **No app may introduce a second network client.**

## Installation

The package is part of the monorepo. Add it as a dependency:

```json
{
  "dependencies": {
    "@myclup/api-client": "workspace:*"
  }
}
```

## Configuration

### Web (Next.js, React)

```typescript
// apps/web-gym-admin or apps/web-site
import { createApi } from '@myclup/api-client';

const api = createApi({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  headers: {
    // Auth headers injected when session is available (Epic #15)
    // Authorization: `Bearer ${token}`,
  },
});

// Typed domain methods
const result = await api.health.ping();
```

**Base URL for web:**

- **Development**: `http://localhost:3001` (gym-admin Next.js BFF)
- **Production**: `https://your-domain.com` or your BFF origin
- Use `NEXT_PUBLIC_*` env vars for client-side config

### Mobile (Expo / React Native)

```typescript
// apps/mobile-user or apps/mobile-admin
import { createApi } from '@myclup/api-client';

const api = createApi({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3001',
  headers: {
    // Auth headers when token is available (Epic #15)
    // Authorization: `Bearer ${token}`,
  },
});

const result = await api.health.ping();
```

**Base URL for mobile:**

- **Development**: `http://localhost:3001` or your machine IP (e.g. `http://192.168.1.10:3001`) for device/simulator
- **Production**: `https://api.your-domain.com`
- Use `EXPO_PUBLIC_*` env vars for runtime config in Expo

## Usage

All domain methods are typed and validated against shared contracts from `@myclup/contracts`:

```typescript
const api = createApi({ baseUrl: 'https://api.example.com' });

// health.ping() — GET /api/v1/health/ping
const ping = await api.health.ping();
// ping: { status: "ok"; timestamp: string }
```

## Error Handling

- **Non-2xx response**: Throws `ApiError` with `status` and `body`
- **Invalid response shape**: Throws `ZodError` from `contract.response.parse()`

```typescript
try {
  await api.health.ping();
} catch (err) {
  if (err instanceof ApiError) {
    console.error(err.status, err.body);
  }
  throw err;
}
```

## Contract Consumption

The client uses contracts from `@myclup/contracts`:

1. Import contract (path, method, request/response schemas)
2. Fetch endpoint
3. Parse response with `contract.response.parse()`
4. Return typed result

New domain methods follow this pattern. See `src/health.ts` for the example implementation.
