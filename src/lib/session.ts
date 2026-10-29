import { prisma } from '@/lib/db';
import { generateSessionToken, hashSessionToken } from '@/lib/token';

/**
 * Server-side session storage.
 *
 * The raw token only exists in the response cookie; the database stores its
 * SHA-256 hash. A stolen database dump therefore yields no usable sessions.
 * Sessions expire, can be revoked individually, and carry light metadata for
 * the future "your devices" screen.
 */

/** Absolute session lifetime: 30 days. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** How stale `lastSeenAt` may get before we write a refresh (15 min). */
const TOUCH_INTERVAL_MS = 15 * 60 * 1000;

export type SessionMeta = {
  ip?: string | null;
  userAgent?: string | null;
};

/**
 * Creates a session for a user and returns the raw token to place in a cookie.
 * The raw token is returned exactly once and cannot be recovered afterwards.
 */
export async function createSession(userId: string, meta: SessionMeta = {}): Promise<string> {
  const token = generateSessionToken();
  const now = new Date();

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  return token;
}

export type LoadedSession = {
  id: string;
  userId: string;
  issuedAt: Date;
  expiresAt: Date;
};

/**
 * Resolves a raw cookie token to a live session, or null if it is unknown,
 * revoked or expired. Expired rows are treated as absent immediately, without
 * waiting for a background sweep.
 */
export async function loadSession(token: string): Promise<LoadedSession | null> {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      id: true,
      userId: true,
      issuedAt: true,
      expiresAt: true,
      revokedAt: true,
      lastSeenAt: true,
    },
  });

  if (!session || session.revokedAt) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;

  // Opportunistic sliding activity marker, throttled to avoid a write per request.
  if (Date.now() - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    void prisma.session
      .update({ where: { id: session.id }, data: { lastSeenAt: new Date() } })
      .catch(() => undefined);
  }

  return {
    id: session.id,
    userId: session.userId,
    issuedAt: session.issuedAt,
    expiresAt: session.expiresAt,
  };
}

/** Revokes a single session by its raw token (used by logout). */
export async function revokeSessionByToken(token: string): Promise<void> {
  if (!token) return;
  await prisma.session.updateMany({
    where: { tokenHash: hashSessionToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Revokes every session for a user (used after password change / compromise). */
export async function revokeAllSessions(userId: string): Promise<number> {
  const result = await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
