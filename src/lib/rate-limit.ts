import { prisma } from '@/lib/db';

/**
 * Database-backed fixed-window rate limiter.
 *
 * Counters live in the `rate_limits` table so they stay correct across server
 * instances and restarts — an in-memory limiter would reset on every deploy
 * and be trivially bypassed by hitting a second instance. The primary key is
 * the composite `key`, so concurrent increments collapse into a single row.
 *
 * This is a fixed window: simple, cheap, and adequate for auth endpoints. It
 * can allow a brief burst across a window boundary, which is an acceptable
 * trade for login protection.
 */

export type RateLimitResult = {
  allowed: boolean;
  /** Remaining attempts allowed in the current window. */
  remaining: number;
  /** Seconds until the window resets. */
  resetSeconds: number;
};

/**
 * Consumes one attempt against a named bucket.
 *
 * @param bucket   Logical scope, e.g. 'login' or 'register'.
 * @param identity Offending party, e.g. IP address or username.
 * @param limit    Max attempts permitted per window.
 * @param windowMs Window length in milliseconds.
 */
export async function consumeRateLimit(
  bucket: string,
  identity: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const key = `${bucket}:${identity}`;
  const now = Date.now();
  const nowDate = new Date(now);
  const expiresAt = new Date(now + windowMs);

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  // Window rolled over (or row expired) → start a fresh window.
  if (!existing || existing.expiresAt.getTime() <= now) {
    await prisma.rateLimit.upsert({
      where: { key },
      update: { windowStart: nowDate, count: 1, expiresAt },
      create: { key, windowStart: nowDate, count: 1, expiresAt },
    });
    return { allowed: true, remaining: limit - 1, resetSeconds: Math.ceil(windowMs / 1000) };
  }

  if (existing.count >= limit) {
    const resetSeconds = Math.max(1, Math.ceil((existing.expiresAt.getTime() - now) / 1000));
    return { allowed: false, remaining: 0, resetSeconds };
  }

  const updated = await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  const resetSeconds = Math.max(1, Math.ceil((updated.expiresAt.getTime() - now) / 1000));
  return { allowed: true, remaining: limit - updated.count, resetSeconds };
}

/** Clears a bucket for an identity — called after a successful login. */
export async function clearRateLimit(bucket: string, identity: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key: `${bucket}:${identity}` } });
}

/** Removes expired windows. Wired to a periodic sweep, safe to call anytime. */
export async function pruneRateLimits(): Promise<number> {
  const result = await prisma.rateLimit.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  return result.count;
}
