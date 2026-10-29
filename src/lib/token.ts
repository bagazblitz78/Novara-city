import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Opaque session-token minting and hashing.
 *
 * A session token is a high-entropy random string handed to the browser in a
 * cookie. The database only ever stores a SHA-256 hash of it, so a database
 * leak alone cannot be replayed as a live session. SHA-256 (rather than
 * Argon2) is correct here because the token already has 256 bits of entropy —
 * there is nothing to brute force, and verification happens on every request.
 */

/** 32 random bytes → 64 hex characters. */
const TOKEN_BYTES = 32;

/** Mints a new opaque session token. Returns it once; it is never recoverable later. */
export function generateSessionToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

/** SHA-256 hex digest of a session token. This is what gets persisted. */
export function hashSessionToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/**
 * Constant-time comparison of two hex digests. Used when comparing any secret
 * material so timing cannot reveal how many leading bytes matched.
 */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
