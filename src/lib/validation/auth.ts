import { z } from 'zod';

/**
 * Authentication input contracts.
 *
 * Usernames are normalised to lowercase and constrained to a safe, readable
 * charset so they work cleanly in URLs (/r/username) and cannot smuggle
 * confusable characters. The same rules are mirrored in the client-side form,
 * but the server contract is authoritative — the client copy is only UX.
 */

const USERNAME_MAX = 24;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters.')
  .max(USERNAME_MAX, `Username must be at most ${USERNAME_MAX} characters.`)
  .regex(
    /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/,
    'Use lowercase letters, numbers, hyphens or underscores; start and end with a letter or number.',
  );

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required.')
  .max(254, 'Email is too long.')
  .email('Enter a valid email address.');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(200, 'Password must be at most 200 characters.');

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Display name is required.')
  .max(50, 'Display name must be at most 50 characters.');

export const districtSlugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Choose a district from the list.');

export const houseNumberSchema = z.coerce
  .number()
  .int('House number must be a whole number.')
  .min(1, 'House number must be 1 or more.')
  .max(9_999, 'House number must be 9,999 or less.');

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  districtSlug: districtSlugSchema,
  houseNumber: houseNumberSchema,
});

export const loginSchema = z.object({
  // Login accepts whatever the user typed; normalisation happens in the service.
  identifier: z.string().trim().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
