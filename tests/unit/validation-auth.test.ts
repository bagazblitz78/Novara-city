import { describe, expect, it } from 'vitest';
import { registerSchema, loginSchema, usernameSchema } from '@/lib/validation/auth';

describe('usernameSchema', () => {
  it('accepts valid usernames', () => {
    for (const username of ['abc', 'kaori_98', 'a-b-c', '123abc', 'aaa']) {
      expect(usernameSchema.safeParse(username).success).toBe(true);
    }
  });

  it('normalises to lowercase', () => {
    const result = usernameSchema.parse('MiRaI');
    expect(result).toBe('mirai');
  });

  it('rejects too-short, too-long, leading/trailing separators, and bad chars', () => {
    for (const bad of [
      'ab',
      'a'.repeat(25),
      '-abc',
      'abc-',
      '_abc',
      'abc_',
      'has space',
      'emoji🎉',
      'a..b',
    ]) {
      expect(usernameSchema.safeParse(bad).success, `expected "${bad}" to be rejected`).toBe(false);
    }
  });
});

describe('registerSchema', () => {
  const valid = {
    username: 'mirai',
    email: 'mirai@example.com',
    password: 'a-strong-passphrase',
    displayName: 'Mirai',
    districtSlug: 'harbor-point',
    houseNumber: 12,
  };

  it('accepts a fully valid payload', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('coerces houseNumber from a numeric string', () => {
    const result = registerSchema.safeParse({ ...valid, houseNumber: '12' as unknown as number });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.houseNumber).toBe(12);
  });

  it('rejects an out-of-range house number', () => {
    expect(registerSchema.safeParse({ ...valid, houseNumber: 0 }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, houseNumber: 10000 }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, houseNumber: 1.5 }).success).toBe(false);
  });

  it('rejects a short password and invalid email', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects a malformed district slug', () => {
    expect(registerSchema.safeParse({ ...valid, districtSlug: 'Bad Slug!' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts username or email identifiers', () => {
    expect(loginSchema.safeParse({ identifier: 'mirai', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ identifier: 'a@b.com', password: 'x' }).success).toBe(true);
  });

  it('rejects an empty identifier or password', () => {
    expect(loginSchema.safeParse({ identifier: '', password: 'x' }).success).toBe(false);
    expect(loginSchema.safeParse({ identifier: 'mirai', password: '' }).success).toBe(false);
  });
});
