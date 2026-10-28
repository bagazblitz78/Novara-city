import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/Feedback';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Claim your username',
  description: 'Claim your unique username in Novara City.',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="container-city py-16 lg:py-24">
      <EmptyState
        title="Registration arrives with milestone M3"
        description="Username reservation, password rules and the arrival ritual are built on top of the backend foundation. This page will become the real registration form — no mock submissions in the meantime."
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
