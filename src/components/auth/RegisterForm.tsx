'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { DistrictOptions } from '@/components/auth/DistrictOptions';
import { registerUser, AuthApiError } from '@/lib/auth-client';

/**
 * Registration form.
 *
 * Mirrors the server's Zod rules for instant feedback, but never trusts them —
 * the API re-validates everything. Server-side per-field errors are merged onto
 * the matching inputs, and a non-field failure (e.g. rate limiting) surfaces as
 * a single banner.
 */
export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
    districtSlug: '',
    houseNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the field's error as soon as the user edits it.
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setBanner('');

    try {
      await registerUser({
        username: values.username,
        displayName: values.displayName,
        email: values.email,
        password: values.password,
        districtSlug: values.districtSlug,
        houseNumber: Number(values.houseNumber),
      });
      router.push('/');
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof AuthApiError) {
        setErrors(error.fields);
        // Only show the banner when the failure isn't already tied to a field.
        setBanner(Object.keys(error.fields).length > 0 ? '' : error.message);
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
        label="Username"
        name="username"
        required
        autoComplete="username"
        placeholder="e.g. mirai"
        hint="Lowercase letters, numbers, hyphens or underscores. This becomes your @handle."
        value={values.username}
        error={errors.username}
        onChange={(event) => update('username', event.target.value)}
      />

      <Field
        label="Display name"
        name="displayName"
        required
        autoComplete="name"
        placeholder="How you appear across the city"
        value={values.displayName}
        error={errors.displayName}
        onChange={(event) => update('displayName', event.target.value)}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={values.email}
        error={errors.email}
        onChange={(event) => update('email', event.target.value)}
      />

      <Field
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="At least 8 characters"
        hint="Use a password you don't reuse elsewhere."
        value={values.password}
        error={errors.password}
        onChange={(event) => update('password', event.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="districtSlug" className="text-sm font-semibold text-ink">
          District
          <span aria-hidden="true" className="ml-1 text-brand">
            *
          </span>
        </label>
        <select
          id="districtSlug"
          name="districtSlug"
          required
          value={values.districtSlug}
          onChange={(event) => update('districtSlug', event.target.value)}
          className={
            'h-11 w-full rounded-md border bg-surface px-3.5 text-[0.95rem] text-ink transition-colors focus:border-focus focus:outline-none ' +
            (errors.districtSlug ? 'border-danger' : 'border-line-strong')
          }
        >
          <option value="">Choose where you&apos;ll live…</option>
          <DistrictOptions />
        </select>
        {errors.districtSlug ? (
          <p role="alert" className="text-xs font-semibold text-danger">
            {errors.districtSlug}
          </p>
        ) : null}
      </div>

      <Field
        label="House number"
        name="houseNumber"
        type="number"
        required
        min={1}
        max={9999}
        placeholder="e.g. 12"
        hint="Your street is set by your district."
        value={values.houseNumber}
        error={errors.houseNumber}
        onChange={(event) => update('houseNumber', event.target.value)}
      />

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? 'Creating your account…' : 'Claim your username'}
      </Button>
    </form>
  );
}
