import { z } from 'zod';

/**
 * Environment contract for Novara City.
 *
 * Every value has a development default so `next build` works on a fresh
 * clone. Production safety is enforced separately by `assertSecureEnv()`,
 * which runs when the server boots — not during the build.
 */

const DEV_SESSION_SECRET = 'dev-only-session-secret-do-not-use-in-production';
const PLACEHOLDER_SESSION_SECRET = 'replace-with-a-long-random-secret';
const FORBIDDEN_IN_PRODUCTION = [DEV_SESSION_SECRET, PLACEHOLDER_SESSION_SECRET];

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1).default('file:./dev.db'),
  SESSION_SECRET: z.string().min(32).default(DEV_SESSION_SECRET),
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(2_097_152),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;

/**
 * Throws when the process is running in production with a development or
 * placeholder signing secret. Called once at server start-up.
 */
export function assertSecureEnv(): void {
  if (env.NODE_ENV !== 'production') return;

  if (FORBIDDEN_IN_PRODUCTION.includes(env.SESSION_SECRET)) {
    throw new Error(
      'SESSION_SECRET must be replaced with a strong random value in production. ' +
        'Generate one with: openssl rand -base64 48',
    );
  }

  if (!env.DATABASE_URL.startsWith('postgres')) {
    throw new Error('DATABASE_URL must point at PostgreSQL in production.');
  }
}

/** True when the configured database is PostgreSQL rather than SQLite. */
export function isPostgres(): boolean {
  return env.DATABASE_URL.startsWith('postgres');
}
