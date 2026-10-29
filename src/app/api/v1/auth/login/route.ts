import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation/auth';
import { loginResident } from '@/server/auth/service';
import { readJsonBody, withApiErrorHandling } from '@/server/api/http';
import { SESSION_COOKIE, sessionCookieAttributes, readUserAgent } from '@/lib/cookies';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/auth/login
 *
 * Authenticates a resident and starts a session. Returns the same generic
 * error for unknown usernames and wrong passwords, and is rate limited per
 * IP + identifier.
 */
export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const json = await readJsonBody(request);
    const input = loginSchema.parse(json);

    const { user, token } = await loginResident(input, {
      ip: clientIp(request),
      userAgent: readUserAgent(request),
    });

    const response = NextResponse.json({ user });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieAttributes());
    return response;
  });
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}
