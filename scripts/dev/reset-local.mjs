import { ensureDockerReady, runCommand } from './local-supabase.mjs';

async function main() {
  await ensureDockerReady();
  runCommand('pnpm', ['exec', 'supabase', 'db', 'reset', '--local', '--yes'], {
    stdio: 'inherit',
  });
  runCommand('node', ['./scripts/dev/sync-local-env.mjs'], { stdio: 'inherit' });
  runCommand('node', ['./scripts/dev/seed-local-data.mjs'], { stdio: 'inherit' });

  console.log('\nLocal database has been reset and reseeded.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
