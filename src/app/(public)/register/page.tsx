import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Claim your username',
  description: 'Claim your unique username in Novara City.',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="container-city py-16 lg:py-24">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl">Claim your username</h1>
          <p className="mt-2 text-sm text-muted">
            Pick a unique handle, choose a district, and get your address.
          </p>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6 shadow-sm sm:p-8">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Already a resident?{' '}
          <Link
            href="/login"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
