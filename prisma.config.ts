import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 CLI configuration.
 *
 * Prisma no longer loads `.env` by itself, hence the `dotenv/config` import.
 *
 * The schema is chosen from the configured database URL so that one command
 * set works for both engines:
 *   • SQLite URL     → prisma/schema.prisma          (local development)
 *   • PostgreSQL URL → prisma/schema.postgres.prisma (production / CI parity)
 *
 * Set PRISMA_SCHEMA to override the choice explicitly.
 */
const url = process.env.DATABASE_URL ?? 'file:./dev.db';
const defaultSchema = url.startsWith('postgres')
  ? 'prisma/schema.postgres.prisma'
  : 'prisma/schema.prisma';

export default defineConfig({
  schema: process.env.PRISMA_SCHEMA ?? defaultSchema,
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url,
  },
});
