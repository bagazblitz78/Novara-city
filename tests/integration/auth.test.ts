import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { prisma } from '@/lib/db';
import { registerResident, loginResident, getSafeUser } from '@/server/auth/service';
import { requireAuth } from '@/server/auth/guards';
import { loadSession, revokeAllSessions } from '@/lib/session';
import { consumeRateLimit, clearRateLimit } from '@/lib/rate-limit';
import { UnauthorizedError, ConflictError, ValidationError } from '@/lib/errors';

/**
 * End-to-end auth flow against a real database (SQLite locally, PostgreSQL in
 * CI). Each test uses unique usernames so they can run in any order and
 * concurrently; rows are cleaned up afterwards.
 */

let counter = 0;
function unique(prefix: string): string {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter}`;
}

async function makeDistrict(): Promise<{ id: string; slug: string }> {
  const slug = unique('dist');
  const created = await prisma.district.create({
    data: {
      slug,
      name: 'Test District',
      tagline: 'Integration test district.',
      description: 'A synthetic district used only by the auth integration tests.',
      color: '#123456',
    },
  });
  return { id: created.id, slug: created.slug };
}

function registerInput(districtSlug: string, overrides: Record<string, unknown> = {}) {
  return {
    username: unique('user'),
    email: `${unique('e')}@example.com`,
    password: 'a-strong-passphrase',
    displayName: 'Test Resident',
    districtSlug,
    houseNumber: 12,
    ...overrides,
  } as Parameters<typeof registerResident>[0];
}

describe('auth flow', () => {
  let district: { id: string; slug: string };
  let districtSlug: string;
  let ip: string;

  beforeEach(async () => {
    district = await makeDistrict();
    districtSlug = district.slug;
    // Each test gets its own simulated client IP so the per-IP register/login
    // rate limits (5/hr, 10/5min) can't bleed across tests and mask the
    // behaviour under test. Real deployments have one IP per visitor.
    ip = `itest-${unique('ip')}`;
  });

  afterEach(async () => {
    // The User→District relation is `onDelete: Restrict` (a district can't be
    // removed while residents live there), so delete residents first. Their
    // sessions cascade from User; rate-limit rows are keyed by this IP.
    await prisma.user.deleteMany({ where: { districtId: district.id } });
    await prisma.district.deleteMany({ where: { id: district.id } });
    await prisma.rateLimit.deleteMany({ where: { key: { contains: ip } } });
  });

  it('registers a resident and returns a safe user plus session token', async () => {
    const input = registerInput(districtSlug);
    const { user, token } = await registerResident(input, { ip });

    expect(user.username).toBe(input.username);
    expect(user.email).toBe(input.email);
    expect(user.districtSlug).toBe(districtSlug);
    expect(user.houseNumber).toBe(12);
    expect(user.role).toBe('resident');
    // The raw password/hash must never appear in the safe user object.
    expect(JSON.stringify(user)).not.toContain('a-strong-passphrase');
    expect(token).toMatch(/^[0-9a-f]{64}$/);

    // A live session resolves back to the same user.
    const session = await loadSession(token);
    expect(session?.userId).toBe(user.id);
  });

  it('logs in with the correct password and rejects the wrong one', async () => {
    const input = registerInput(districtSlug);
    await registerResident(input, { ip });

    const { user } = await loginResident(
      { identifier: input.username, password: input.password },
      { ip },
    );
    expect(user.username).toBe(input.username);

    await expect(
      loginResident({ identifier: input.username, password: 'wrong-password' }, { ip }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('logs in by email as well as by username', async () => {
    const input = registerInput(districtSlug);
    await registerResident(input, { ip });

    const { user } = await loginResident(
      { identifier: input.email, password: input.password },
      { ip },
    );
    expect(user.username).toBe(input.username);
  });

  it('rejects a duplicate username and email with field errors', async () => {
    const input = registerInput(districtSlug);
    await registerResident(input, { ip });

    try {
      await registerResident(
        registerInput(districtSlug, {
          username: input.username,
          email: `${unique('x')}@example.com`,
        }),
        { ip },
      );
      throw new Error('expected a conflict');
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictError);
      expect((error as ConflictError).fields?.username).toBeDefined();
    }
  });

  it('rejects registration into an unknown district', async () => {
    await expect(
      registerResident(registerInput('no-such-district'), { ip }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('does not leak whether a username exists on failed login', async () => {
    const unknown = await loginResident(
      { identifier: unique('ghost'), password: 'whatever' },
      { ip },
    ).catch((e) => e);
    const wrongPw = await loginResident(
      { identifier: registerInput(districtSlug).username, password: 'nope' },
      { ip },
    ).catch((e) => e);

    // Both are the same generic UnauthorizedError, indistinguishable to a caller.
    expect(unknown).toBeInstanceOf(UnauthorizedError);
    expect(wrongPw).toBeInstanceOf(UnauthorizedError);
    expect((unknown as Error).message).toBe((wrongPw as Error).message);
  });

  it('requireAuth resolves the user from a valid session token', async () => {
    const input = registerInput(districtSlug);
    const { token } = await registerResident(input, { ip });

    const fakeRequest = {
      cookies: { get: () => ({ value: token }) },
    } as unknown as Parameters<typeof requireAuth>[0];

    const { user } = await requireAuth(fakeRequest);
    expect(user.username).toBe(input.username);
  });

  it('requireAuth throws for an absent or invalid token', async () => {
    const noCookie = { cookies: { get: () => undefined } } as unknown as Parameters<
      typeof requireAuth
    >[0];
    await expect(requireAuth(noCookie)).rejects.toBeInstanceOf(UnauthorizedError);

    const badCookie = {
      cookies: { get: () => ({ value: 'f'.repeat(64) }) },
    } as unknown as Parameters<typeof requireAuth>[0];
    await expect(requireAuth(badCookie)).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('revoking all sessions invalidates previously issued tokens', async () => {
    const input = registerInput(districtSlug);
    const { user, token } = await registerResident(input, { ip });

    expect(await loadSession(token)).not.toBeNull();
    await revokeAllSessions(user.id);
    expect(await loadSession(token)).toBeNull();
  });

  it('getSafeUser never returns the password hash', async () => {
    const input = registerInput(districtSlug);
    const { user } = await registerResident(input, { ip });

    const loaded = await getSafeUser(user.id);
    expect(loaded).not.toBeNull();
    expect(JSON.stringify(loaded)).not.toContain('passwordHash');
    expect(JSON.stringify(loaded)).not.toContain('$argon2id$');
  });
});

describe('rate limiting', () => {
  it('allows up to the limit then blocks, and clears on demand', async () => {
    const key = unique('itest-rl');
    const limit = 3;
    const windowMs = 60_000;

    for (let i = 0; i < limit; i += 1) {
      const result = await consumeRateLimit('itest', key, limit, windowMs);
      expect(result.allowed).toBe(true);
    }

    const blocked = await consumeRateLimit('itest', key, limit, windowMs);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);

    await clearRateLimit('itest', key);
    const afterClear = await consumeRateLimit('itest', key, limit, windowMs);
    expect(afterClear.allowed).toBe(true);

    await clearRateLimit('itest', key);
  });
});
