import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/Feedback';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to Novara City.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="container-city py-16 lg:py-24">
      <EmptyState
        title="Logging in arrives with milestone M3"
        description="The authentication system — accounts, sessions and password hashing — is the milestone after the backend foundation. Nothing is faked here: when sign-in works, this page becomes the real form."
        action={
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" variant="secondary">
              Back to the city
            </ButtonLink>
            <ButtonLink href="/rules">Read the rules</ButtonLink>
          </div>
        }
      />
    </div>
  );
}
