import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getResidentProfile } from '@/server/auth/service';
import { getDistrict } from '@/lib/districts';
import { Badge } from '@/components/ui/Badge';

/**
 * Public Citizen Card at /r/username.
 *
 * Renders a resident's public profile: handle, display name, district and
 * address. Only active accounts are shown; unknown or deactivated handles 404.
 */

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getResidentProfile(username);
  if (!profile) return { title: 'Resident not found' };

  return {
    title: `@${profile.username}`,
    description: `${profile.displayName} — resident of Novara City.`,
    robots: { index: true, follow: true },
  };
}

export default async function ResidentPage({ params }: Props) {
  const { username } = await params;
  const profile = await getResidentProfile(username);
  if (!profile) notFound();

  const district = getDistrict(profile.districtSlug);
  const residentSince = profile.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="container-city py-16 lg:py-24">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-lg border border-line bg-surface shadow-md">
          <div className="h-20 w-full rounded-t-lg bg-brand-soft" />

          <div className="px-6 pb-8 sm:px-8">
            <div className="-mt-10 flex items-end justify-between gap-4">
              <span
                aria-hidden="true"
                className="grid h-20 w-20 place-items-center rounded-full border-4 border-surface bg-brand font-display text-2xl text-white"
              >
                {profile.displayName.charAt(0).toUpperCase()}
              </span>

              {profile.role !== 'resident' ? <Badge variant="civic">{profile.role}</Badge> : null}
            </div>

            <h1 className="mt-4 font-display text-3xl">{profile.displayName}</h1>
            <p className="mt-1 text-sm font-semibold text-brand">@{profile.username}</p>

            <dl className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                  Address
                </dt>
                <dd className="mt-2 text-sm text-ink">
                  {district?.name ?? profile.street} · {profile.houseNumber} {profile.street}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                  District
                </dt>
                <dd className="mt-2 text-sm text-ink">{district?.name ?? profile.districtSlug}</dd>
              </div>

              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                  Resident since
                </dt>
                <dd className="mt-2 text-sm text-ink">{residentSince}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
