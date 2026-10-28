import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';
import { env } from '@/lib/env';

/**
 * Database access for Novara City.
 *
 * The same call sites work on both engines: the driver adapter is chosen from
 * DATABASE_URL, so local development talks SQLite and production talks
 * PostgreSQL without any code change.
 *
 * Relative `file:` URLs resolve against the project root, which is exactly
 * where Prisma's CLI writes the file — verified during the backend milestone.
 */
function createAdapter() {
  if (env.DATABASE_URL.startsWith('postgres')) {
    return new PrismaPg({ connectionString: env.DATABASE_URL });
  }
  return new PrismaBetterSqlite3({ url: env.DATABASE_URL });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: createAdapter() });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
