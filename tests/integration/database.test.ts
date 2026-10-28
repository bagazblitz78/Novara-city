import { afterEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/db';

describe('database connectivity', () => {
  afterEach(async () => {
    await prisma.district.deleteMany({ where: { slug: 'test-district' } });
  });

  it('round-trips a write and a read', async () => {
    const created = await prisma.district.create({
      data: {
        slug: 'test-district',
        name: 'Test District',
        tagline: 'Only used by the test suite.',
        description: 'A synthetic district created and removed by an automated test.',
        color: '#123456',
      },
    });

    const found = await prisma.district.findUnique({ where: { slug: 'test-district' } });

    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe('Test District');
    expect(found?.orderIndex).toBe(0);
  });

  it('enforces the unique slug constraint', async () => {
    await prisma.district.create({
      data: {
        slug: 'test-district',
        name: 'First',
        tagline: 'a',
        description: 'A synthetic district created and removed by an automated test.',
        color: '#123456',
      },
    });

    await expect(
      prisma.district.create({
        data: {
          slug: 'test-district',
          name: 'Second',
          tagline: 'b',
          description: 'A synthetic district created and removed by an automated test.',
          color: '#654321',
        },
      }),
    ).rejects.toThrow();
  });
});
