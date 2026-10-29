import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation/auth';
import { registerResident } from '@/server/auth/service';
import { readJsonBody, withApiErrorHandling } from '@/server/api/http';
import { SESSION_COOKIE, sessionCookieAttributes, readUserAgent } from '@/lib/cookies';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/auth/register
 *
 * Creates a resident account, assigns them a district address, and starts a
 * session. The response sets the session cookie and returns the safe user
 * object. Rate limited per IP; input Zod-validated server-side.
 */
export async function POST(request: NextRequest) {
  return withApiErrorHandling(async () => {
    const json = await readJsonBody(request);
    const input = registerSchema.parse(json);

    const { user, token } = await registerResident(input, {
      ip: clientIp(request),
      userAgent: readUserAgent(request),
    });

    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieAttributes());
    return response;
  });
}

/** Best-effort client IP for rate limiting (trusts a proxy header if set). */
function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}
