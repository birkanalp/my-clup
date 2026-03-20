# my-clup

Gym membership, class, coaching, communication, and discovery platform. Expo + Next.js monorepo with Supabase backend.

## Quick Start

- **Node**: 20+ (see `.nvmrc`)
- **Package manager**: pnpm 9+

```bash
pnpm install
pnpm run build
pnpm run lint
pnpm run typecheck
pnpm run test
```

See [docs/contributing.md](docs/contributing.md) for setup, environment, and workflow.

## Local Stack

For a full local test loop with Supabase containers and seeded demo accounts:

```bash
pnpm install
pnpm dev:local
pnpm dev:web-gym-admin
```

Then open `http://localhost:3001/en/dev-login` for the web demo session. Expo apps can use:

```bash
pnpm dev:mobile-user
pnpm dev:mobile-admin
```

## Environment Setup

1. Copy `.env.example` to `.env.local` and fill in values.
2. See [docs/contributing.md](docs/contributing.md) for variable categories and localization config.
3. Never commit `.env`, `.env.local`, or `.env.*.local` — they are gitignored.
