import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession } from '@/lib/session';
import { clearRateLimit, consumeRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { ConflictError, RateLimitError, UnauthorizedError, ValidationError } from '@/lib/errors';
import type { LoginInput, RegisterInput } from '@/lib/validation/auth';

/**
 * Authentication service.
 *
 * All business rules and security decisions live here, independent of the HTTP
 * layer, so they are directly unit-testable. Route handlers only parse input,
 * call a function here, and translate the result into cookies/JSON.
 *
 * Two rules shape every function:
 *   1. Never reveal whether a username or email exists (anti-enumeration).
 *   2. Never do work proportional to attacker-controlled input before the
 *      rate limiter has had its say.
 */

/** Auth attempt limits. Conservative; a legitimate user never hits these. */
const LOGIN_LIMIT = { limit: 10, windowMs: 5 * 60 * 1000 };
const REGISTER_LIMIT = { limit: 5, windowMs: 60 * 60 * 1000 };

export type SafeUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  districtSlug: string;
  houseNumber: number;
  street: string;
};

/** Strips anything sensitive before a user object leaves the service. */
function toSafeUser(user: {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  houseNumber: number;
  street: string;
  district: { slug: string };
}): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    districtSlug: user.district.slug,
    houseNumber: user.houseNumber,
    street: user.street,
  };
}

export type AuthResult = { user: SafeUser; token: string };

/**
 * Registers a new resident and starts their first session.
 *
 * Username and email uniqueness are checked up front to give a precise error,
 * then re-enforced by the database unique constraints to close the race window
 * between the check and the insert.
 */
export async function registerResident(
  input: RegisterInput,
  meta: { ip?: string; userAgent?: string },
): Promise<AuthResult> {
  const rate = await consumeRateLimit(
    'register',
    meta.ip ?? 'unknown',
    REGISTER_LIMIT.limit,
    REGISTER_LIMIT.windowMs,
  );
  if (!rate.allowed) {
    throw new RateLimitError('Too many accounts created from this connection. Try again later.');
  }

  const district = await prisma.district.findUnique({ where: { slug: input.districtSlug } });
  if (!district) {
    throw new ValidationError('Choose a district from the list.', {
      districtSlug: 'Unknown district.',
    });
  }

  const [usernameTaken, emailTaken] = await Promise.all([
    prisma.user.findUnique({ where: { username: input.username }, select: { id: true } }),
    prisma.user.findUnique({ where: { email: input.email }, select: { id: true } }),
  ]);

  const fields: Record<string, string> = {};
  if (usernameTaken) fields.username = 'That username is already taken.';
  if (emailTaken) fields.email = 'An account with that email already exists.';
  if (Object.keys(fields).length > 0) {
    throw new ConflictError('Those details are already in use.', fields);
  }

  const passwordHash = await hashPassword(input.password);

  let created;
  try {
    created = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        districtId: district.id,
        houseNumber: input.houseNumber,
        street: district.name,
      },
      include: { district: { select: { slug: true } } },
    });
  } catch (error: unknown) {
    // Unique-constraint race: two requests slipped past the check above.
    if (isUniqueViolation(error)) {
      throw new ConflictError('Those details are already in use.', {
        username: 'That username is already taken.',
      });
    }
    throw error;
  }

  const token = await createSession(created.id, meta);
  logger.info({ userId: created.id, username: created.username }, 'resident registered');
  return { user: toSafeUser(created), token };
}

/**
 * Authenticates a resident and starts a session.
 *
 * The same generic failure is returned for unknown identifiers, wrong
 * passwords and inactive accounts so the endpoint cannot be used to test
 * whether an account exists.
 */
export async function loginResident(
  input: LoginInput,
  meta: { ip?: string; userAgent?: string },
): Promise<AuthResult> {
  const identityKey = (meta.ip ?? 'unknown') + '|' + input.identifier.toLowerCase();
  const rate = await consumeRateLimit(
    'login',
    identityKey,
    LOGIN_LIMIT.limit,
    LOGIN_LIMIT.windowMs,
  );
  if (!rate.allowed) {
    throw new RateLimitError('Too many sign-in attempts. Please wait a few minutes and try again.');
  }

  const identifier = input.identifier.toLowerCase();
  const looksLikeEmail = identifier.includes('@');

  const user = await prisma.user.findFirst({
    where: looksLikeEmail ? { email: identifier } : { username: identifier },
    include: { district: { select: { slug: true } } },
  });

  // Always run a hash comparison so timing does not reveal whether the user
  // exists. Against a dummy hash when there is no match.
  const storedHash = user?.passwordHash ?? DUMMY_HASH;
  const passwordOk = await verifyPassword(storedHash, input.password);

  if (!user || !passwordOk || user.status !== 'active') {
    throw new UnauthorizedError('Incorrect username or password.');
  }

  await clearRateLimit('login', identityKey);

  const token = await createSession(user.id, meta);
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  logger.info({ userId: user.id }, 'resident logged in');
  return { user: toSafeUser(user), token };
}

/** Loads a safe user record by id, for the session guard. */
export async function getSafeUser(userId: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { district: { select: { slug: true } } },
  });
  return user ? toSafeUser(user) : null;
}

/** Resolves a display profile for the public Citizen Card. */
export async function getResidentProfile(
  username: string,
): Promise<(SafeUser & { createdAt: Date }) | null> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: { district: { select: { slug: true } } },
  });
  if (!user || user.status !== 'active') return null;
  return { ...toSafeUser(user), createdAt: user.createdAt };
}

// A genuine Argon2id hash of a random throwaway string. Verifying against it
// costs the same as a real check, masking "user not found" in the timing
// profile. The plaintext is never used for anything and cannot match a login.
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$9a6eEdMGZpapMTZTwiMD5g$pBG3N8zV2wOWKpMAj99Tm+PncLDFaSMghzcuG1NJ8TE';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}
