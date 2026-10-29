import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to Novara City.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="container-city py-16 lg:py-24">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in with your username or email to return to the city.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 shadow-sm sm:p-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New to Novara?{' '}
          <Link
            href="/register"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Claim your username
          </Link>
        </p>
      </div>
    </div>
  );
}
