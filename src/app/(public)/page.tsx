import Link from 'next/link';
import { DISTRICTS } from '@/lib/districts';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/layout/SectionHeading';

const STEPS = [
  {
    title: 'Claim your username',
    body: 'Your handle is unique across the city and stays yours. No invite, no social account, no waiting list — registration is open to everyone.',
  },
  {
    title: 'Move into a district',
    body: "Choose one of Novara's eight districts and you are issued a real address, like Harbor Point · 12 Alder Row, shown on your profile.",
  },
  {
    title: 'Take part in civic life',
    body: 'Write to the community feed, join conversations, follow announcements from City Hall, and watch the city grow around its residents.',
  },
];

const PRINCIPLES = [
  {
    title: 'Open registration',
    body: 'Anyone can arrive. Onboarding is a designed ritual rather than a gate kept by a social platform.',
  },
  {
    title: 'A real address',
    body: 'Every resident belongs to a district and carries an address, so the city reads as a place instead of a list of accounts.',
  },
  {
    title: 'Your Citizen Card',
    body: 'A public, shareable profile at /r/username showing your district, address and how long you have lived here.',
  },
  {
    title: 'Two voices, one city',
    body: 'Official announcements from City Hall are kept clearly separate from the community feed, so nothing gets confused.',
  },
];

function DistrictIndex() {
  return (
    <div className="rounded-lg border border-line bg-surface shadow-md">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-muted">District index</h2>
        <Badge variant="outline">8 districts</Badge>
      </div>
      <ul>
        {DISTRICTS.map((district, index) => (
          <li
            key={district.slug}
            className={
              'flex items-start gap-3 px-5 py-3' +
              (index === DISTRICTS.length - 1 ? '' : ' border-b border-line')
            }
          >
            <span
              aria-hidden="true"
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: district.color }}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{district.name}</p>
              <p className="truncate text-xs text-muted">{district.tagline}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="border-b border-line">
        <div className="container-city grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="brand">A virtual city</Badge>
              <Badge variant="outline">v0.1 · in development</Badge>
            </div>

            <h1 className="mt-6 font-display text-5xl leading-[1.03] sm:text-6xl lg:text-7xl">
              Your Life.
              <br />
              Your City.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Novara City is an open, web-native city. Claim a unique
              <span className="font-semibold text-ink"> @username</span>, move into a district, get
              a real address, and take part in civic life from the very first day.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/register" size="lg">
                Claim your username
              </ButtonLink>
              <ButtonLink href="/rules" variant="secondary" size="lg">
                Read the rules
              </ButtonLink>
            </div>

            <p className="mt-5 text-sm text-muted">
              The account system is being built now — it is the milestone that follows this one.
            </p>
          </div>

          <DistrictIndex />
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how" className="scroll-mt-24 border-b border-line">
        <div className="container-city py-16 lg:py-24">
          <SectionHeading
            eyebrow="How it works"
            title="Arriving in Novara takes three steps"
            lede="The whole journey, from visitor to resident, in the order you will actually experience it."
          />

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-lg border border-line bg-surface p-6"
              >
                <span className="font-display text-4xl font-semibold text-brand/25">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- Districts ---------------- */}
      <section id="districts" className="scroll-mt-24 border-b border-line bg-sunken">
        <div className="container-city py-16 lg:py-24">
          <SectionHeading
            eyebrow="Districts"
            title="Eight places to live, each with its own address"
            lede="Districts exist in the data from day one, so every resident already belongs somewhere before the map is drawn."
          />

          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DISTRICTS.map((district) => (
              <li
                key={district.slug}
                className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-full"
                  style={{ backgroundColor: district.color }}
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg">{district.name}</h3>
                  <p className="mt-1 text-xs font-semibold" style={{ color: district.color }}>
                    {district.tagline}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                    {district.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Principles ---------------- */}
      <section className="border-b border-line">
        <div className="container-city py-16 lg:py-24">
          <SectionHeading
            eyebrow="What the city is built on"
            title="A city that behaves like a place, not a feed"
          />

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
            {PRINCIPLES.map((principle) => (
              <div key={principle.title} className="border-t-2 border-ink pt-5">
                <h3 className="text-xl">{principle.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Closing CTA ---------------- */}
      <section className="bg-brand-soft">
        <div className="container-city flex flex-col items-start gap-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-4xl">Take your place in Novara City.</h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Usernames are unique and issued first come, first served. Read the rules now so you
              know what city life expects of you.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/register" size="lg">
              Claim your username
            </ButtonLink>
            <Link
              href="/rules"
              className="inline-flex h-12 items-center justify-center rounded-md border border-line-strong bg-surface px-7 font-semibold text-ink transition-colors hover:bg-sunken"
            >
              Read the rules
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
