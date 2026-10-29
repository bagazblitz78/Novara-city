import type { NextRequest } from 'next/server';
import { SESSION_TTL_MS } from '@/lib/session';

/**
 * Session cookie transport.
 *
 * The cookie carries the raw token; the server stores only its hash. Flags:
 *   HttpOnly  — JS cannot read it, so an XSS bug cannot exfiltrate the session.
 *   Secure    — only sent over HTTPS (skipped on http:// localhost for dev).
 *   SameSite=Lax — not attached to cross-site POSTs, blunt CSRF defence.
 *   Path=/    — available to the whole app.
 */

export const SESSION_COOKIE = 'novara_session';

/** Cookie attributes applied to the session cookie (minus name/value). */
export interface SessionCookieAttributes {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
}

/**
 * Options for setting the session cookie.
 *
 * Returns a structured object (not a raw Set-Cookie string) so route handlers
 * pass it straight to `NextResponse.cookies.set(name, value, options)` and let
 * Next serialize the header correctly.
 */
export function sessionCookieAttributes(): SessionCookieAttributes {
  return {
    httpOnly: true,
    // Secure cookies are dropped over plain http://, which would break local
    // dev, so it is gated on NODE_ENV rather than the request protocol.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

/** Reads the raw session token from the request cookie, if present. */
export function readSessionCookie(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE)?.value;
}

/**
 * Reads the User-Agent header as `string | undefined`.
 *
 * `headers.get()` returns `string | null`, but downstream session metadata is
 * typed to accept only `undefined`, so normalise null → undefined here.
 */
export function readUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') ?? undefined;
}
