import { NextRequest, NextResponse } from 'next/server';
import { revokeSessionByToken } from '@/lib/session';
import { SESSION_COOKIE, readSessionCookie, sessionCookieAttributes } from '@/lib/cookies';
import { withApiErrorHandling } from '@/server/api/http';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/auth/logout
 *
 * Revokes the current session server-side and clears the cookie. Idempotent:
 * signing out twice (or with no session) still succeeds.
 */
export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const token = readSessionCookie(request);
    if (token) await revokeSessionByToken(token);

    const response = NextResponse.json({ ok: true });
    // maxAge 0 (with the same attributes used when setting) expires the cookie.
    response.cookies.set(SESSION_COOKIE, '', {
      ...sessionCookieAttributes(),
      maxAge: 0,
    });
    return response;
  });
}
