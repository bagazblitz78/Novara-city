import { spawnSync } from 'node:child_process';

/**
 * Runs the automated test suite against a real database.
 *
 * DATABASE_URL decides the engine:
 *   • unset           → local SQLite file `./test.db` (created/reset first)
 *   • postgresql://…  → PostgreSQL (CI parity job), schema auto-selected by
 *                       prisma.config.ts from the URL.
 *
 * Using a child process keeps this cross-platform: no shell-specific env
 * prefixing, which would not work under cmd.exe on Windows.
 */
const env = { ...process.env };

if (!env.DATABASE_URL) {
  env.DATABASE_URL = 'file:./test.db';
}

const engine = env.DATABASE_URL.startsWith('postgres') ? 'PostgreSQL' : 'SQLite';
console.log(`\n[test] provisioning ${engine} test database…`);

/**
 * Provisioning is deliberately NON-DESTRUCTIVE:
 *   • a fresh CI database is empty, so a plain `db push` is enough;
 *   • locally the schema is already in sync, so it is a no-op;
 *   • tests clean up after themselves, so wiping is not needed for isolation.
 *
 * Set RESET_TEST_DB=1 to force a wipe. That adds --force-reset
 * --accept-data-loss, which destroys all rows in the target database and must
 * never be pointed at anything but a disposable development/test database.
 */
const pushArgs = ['prisma', 'db', 'push'];
if (env.RESET_TEST_DB === '1') {
  console.warn('[test] RESET_TEST_DB=1 — this DESTROYS all data in the test database');
  pushArgs.push('--force-reset', '--accept-data-loss');
}

const push = spawnSync('npx', pushArgs, {
  stdio: 'inherit',
  shell: true,
  env,
});

if (push.status !== 0) {
  console.error('[test] database provisioning failed');
  process.exit(push.status ?? 1);
}

const run = spawnSync('npx', ['vitest', 'run'], {
  stdio: 'inherit',
  shell: true,
  env,
});

process.exit(run.status ?? 1);
