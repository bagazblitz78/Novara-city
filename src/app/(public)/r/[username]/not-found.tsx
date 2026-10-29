import { EmptyState } from '@/components/ui/Feedback';
import { ButtonLink } from '@/components/ui/Button';

/**
 * 404 for /r/[username] — shown when the handle doesn't exist or the account
 * is no longer active. Invoked automatically via notFound() in the page.
 */
export default function NotFound() {
  return (
    <div className="container-city py-24">
      <EmptyState
        title="No resident lives at that address"
        description="This username doesn't exist yet, or the account is no longer active."
        action={
          <ButtonLink href="/register" className="mt-2">
            Claim this username
          </ButtonLink>
        }
      />
    </div>
  );
}
