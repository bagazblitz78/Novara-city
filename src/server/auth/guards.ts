import type { NextRequest } from 'next/server';
import { loadSession } from '@/lib/session';
import { getSafeUser } from '@/server/auth/service';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';
import { readSessionCookie } from '@/lib/cookies';
import type { SafeUser } from '@/server/auth/service';

/**
 * Route guards.
 *
 * Guards run on the server for every protected request — the UI is never the
 * source of truth for authorisation. They resolve the session cookie to a
 * fully-loaded user (with role and district) or throw a typed error that the
 * API layer converts into the correct HTTP status.
 */

export type AuthedRequest = { user: SafeUser };

/** Resolves the current user from the request, or null when signed out. */
export async function getCurrentUser(request: NextRequest): Promise<SafeUser | null> {
  const token = readSessionCookie(request);
  if (!token) return null;

  const session = await loadSession(token);
  if (!session) return null;

  return getSafeUser(session.userId);
}

/**
 * Requires any signed-in resident. Throws 401 when signed out, including when
 * the account behind the session has since been removed.
 */
export async function requireAuth(request: NextRequest): Promise<AuthedRequest> {
  const user = await getCurrentUser(request);
  if (!user) throw new UnauthorizedError();
  return { user };
}

const ROLE_RANK: Record<string, number> = { resident: 0, moderator: 1, admin: 2 };

/**
 * Requires a minimum role. Roles are ranked (resident < moderator < admin) so
 * a single check covers "this role or higher".
 */
export async function requireRole(
  request: NextRequest,
  role: 'moderator' | 'admin',
): Promise<AuthedRequest> {
  const { user } = await requireAuth(request);
  const have = ROLE_RANK[user.role] ?? -1;
  const need = ROLE_RANK[role] ?? Number.MAX_SAFE_INTEGER;
  if (have < need) {
    throw new ForbiddenError('You do not have permission to do that.');
  }
  return { user };
}
