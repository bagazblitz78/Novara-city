import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/password';
import { generateSessionToken, hashSessionToken, safeEqual } from '@/lib/token';

describe('password hashing (Argon2id)', () => {
  it('verifies a correct password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    await expect(verifyPassword(hash, 'correct horse battery staple')).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    await expect(verifyPassword(hash, 'incorrect horse')).resolves.toBe(false);
  });

  it('produces a unique hash per call (randomised salt)', async () => {
    const [a, b] = await Promise.all([hashPassword('same input'), hashPassword('same input')]);
    expect(a).not.toBe(b);
    await expect(verifyPassword(a, 'same input')).resolves.toBe(true);
    await expect(verifyPassword(b, 'same input')).resolves.toBe(true);
  });

  it('uses Argon2id', async () => {
    const hash = await hashPassword('argon2id check');
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });

  it('returns false instead of throwing on a malformed hash', async () => {
    await expect(verifyPassword('not-a-real-hash', 'anything')).resolves.toBe(false);
  });
});

describe('session tokens', () => {
  it('mints high-entropy, unique tokens', () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
    // 32 bytes → 64 hex characters.
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('hashes deterministically and irreversibly', () => {
    const token = generateSessionToken();
    const h1 = hashSessionToken(token);
    const h2 = hashSessionToken(token);
    expect(h1).toBe(h2);
    expect(h1).not.toContain(token);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it('distinguishes different tokens', () => {
    expect(hashSessionToken(generateSessionToken())).not.toBe(
      hashSessionToken(generateSessionToken()),
    );
  });
});

describe('safeEqual', () => {
  it('matches identical strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
  });

  it('rejects different strings of equal length', () => {
    expect(safeEqual('abc', 'abd')).toBe(false);
  });

  it('rejects different lengths without throwing', () => {
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});
