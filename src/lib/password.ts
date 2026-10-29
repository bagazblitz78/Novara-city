import { hash, verify } from '@node-rs/argon2';

/**
 * Password hashing for Novara City.
 *
 * Argon2id is the memory-hard winner of the Password Hashing Competition and
 * the current OWASP recommendation. Parameters follow the OWASP baseline
 * (19 MiB memory, 2 iterations, parallelism 1) which resists GPU cracking
 * while staying well under a request-time budget on modest hardware.
 *
 * @node-rs/argon2 ships prebuilt native binaries, so there is no compiler
 * toolchain requirement and no runtime install script to trust.
 */

// Argon2id as a numeric constant (value 2, matching the library's Algorithm
// enum). A plain `const` avoids relying on ambient const-enum emission, which
// `isolatedModules` forbids.
const ARGON2ID = 2;

const OPTIONS = {
  algorithm: ARGON2ID,
  memoryCost: 19_456, // 19 MiB (OWASP minimum)
  timeCost: 2,
  parallelism: 1,
} as const;

/** Hashes a plaintext password. The output is an encoded, self-describing string. */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, OPTIONS);
}

/**
 * Verifies a plaintext password against a stored hash.
 *
 * Returns false for any malformed or non-Argon2id input rather than throwing,
 * so a corrupted hash can never crash a login attempt or leak internals.
 */
export async function verifyPassword(stored: string, password: string): Promise<boolean> {
  try {
    return await verify(stored, password, OPTIONS);
  } catch {
    return false;
  }
}
