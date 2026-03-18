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

## Environment Setup

1. Copy `.env.example` to `.env.local` and fill in values.
2. See [docs/contributing.md](docs/contributing.md) for variable categories and localization config.
3. Never commit `.env`, `.env.local`, or `.env.*.local` — they are gitignored.
