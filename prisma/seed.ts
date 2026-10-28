import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { DISTRICTS } from '../src/lib/districts';

/**
 * Idempotent seed data.
 *
 * All content is synthetic and original — no real people, addresses or
 * third-party material. Resident accounts are seeded by the authentication
 * milestone, once password hashing exists.
 */
const url = process.env.DATABASE_URL ?? 'file:./dev.db';

const adapter = url.startsWith('postgres')
  ? new PrismaPg({ connectionString: url })
  : new PrismaBetterSqlite3({ url });

const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  for (const [index, district] of DISTRICTS.entries()) {
    await prisma.district.upsert({
      where: { slug: district.slug },
      update: {
        name: district.name,
        tagline: district.tagline,
        description: district.description,
        color: district.color,
        orderIndex: index,
      },
      create: {
        slug: district.slug,
        name: district.name,
        tagline: district.tagline,
        description: district.description,
        color: district.color,
        orderIndex: index,
      },
    });
  }

  const count = await prisma.district.count();
  console.log(
    `Seeded ${count} districts into ${url.startsWith('postgres') ? 'PostgreSQL' : 'SQLite'}.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
