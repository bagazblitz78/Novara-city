'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { loginUser, AuthApiError } from '@/lib/auth-client';

/**
 * Login form.
 *
 * Accepts either a username or email in a single field. The server returns one
 * generic failure for unknown identifiers and wrong passwords, so this form
 * never distinguishes between the two.
 */
export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setBanner('');
    setErrors({});

    try {
      await loginUser({ identifier, password });
      router.push('/');
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof AuthApiError) {
        if (Object.keys(error.fields).length > 0) {
          setErrors(error.fields);
        } else {
          setBanner(error.message);
        }
      } else {
        setBanner('Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {banner ? (
        <div
          role="alert"
          className="rounded-md border border-danger bg-sunken px-4 py-3 text-sm font-semibold text-danger"
        >
          {banner}
        </div>
      ) : null}

      <Field
        label="Username or email"
        name="identifier"
        required
        autoComplete="username"
        placeholder="you or you@example.com"
        value={identifier}
        error={errors.identifier}
        onChange={(event) => setIdentifier(event.target.value)}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        error={errors.password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
