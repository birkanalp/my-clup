import { ensureDockerReady, runCommand } from './local-supabase.mjs';

async function main() {
  await ensureDockerReady();
  runCommand('pnpm', ['exec', 'supabase', 'start'], { stdio: 'inherit' });
  runCommand('node', ['./scripts/dev/sync-local-env.mjs'], { stdio: 'inherit' });
  runCommand('node', ['./scripts/dev/seed-local-data.mjs'], { stdio: 'inherit' });

  console.log('\nLocal stack is ready.');
  console.log('Web admin: pnpm dev:web-gym-admin');
  console.log('Mobile user: pnpm dev:mobile-user');
  console.log('Mobile admin: pnpm dev:mobile-admin');
  console.log('Web demo login: http://localhost:3001/en/dev-login');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
