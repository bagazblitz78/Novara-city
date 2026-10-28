import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/layout/SectionHeading';

export const metadata: Metadata = {
  title: 'Rules',
  description:
    'The community rules of Novara City: what residents may expect from each other and from the moderation team.',
};

const RULES = [
  {
    title: 'Treat residents as neighbours',
    body: 'Novara is a shared city. Disagree with ideas, not people: no harassment, threats, slurs, or dogpiling, here or anywhere else you meet Novara residents.',
  },
  {
    title: 'One person, one identity',
    body: 'Your username represents you. Do not impersonate another resident, a city office, or an organisation. Nicknames are fine; deception is not.',
  },
  {
    title: 'Keep the feed readable',
    body: 'Post things that belong in a community feed: announcements, questions, projects, city life. Spam, unsolicited promotion and repeated reposts will be removed.',
  },
  {
    title: 'Protect private information',
    body: "Never publish someone else's personal details, and do not post your own sensitive information. What is written in Novara stays subject to the same standards as anywhere else online.",
  },
  {
    title: 'Report instead of retaliating',
    body: 'If something breaks these rules, file a report and let the moderation team handle it. Responding in kind escalates the situation and may break these rules yourself.',
  },
  {
    title: 'Accept moderation decisions',
    body: 'Moderators act to keep the city habitable. You can ask for a review of any decision, but do not contest it publicly in the feed.',
  },
];

const ENFORCEMENT = [
  {
    step: 'Warning',
    body: 'A first, minor breach is met with a clear explanation of what to change.',
  },
  {
    step: 'Suspension',
    body: 'Repeated or serious breaches temporarily restrict what an account can do.',
  },
  {
    step: 'Removal',
    body: 'Persistent abuse or illegal content ends the account. Appeals are still heard.',
  },
];

export default function RulesPage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="container-city py-14 lg:py-20">
          <SectionHeading
            eyebrow="Community standards"
            title="Rules of Novara City"
            lede="A city only works if its residents agree on how to live together. These rules apply to every account, including the moderation team."
          />
        </div>
      </section>

      <section>
        <div className="container-city py-14 lg:py-20">
          <ol className="grid gap-6 md:grid-cols-2">
            {RULES.map((rule, index) => (
              <li key={rule.title} className="rounded-lg border border-line bg-surface p-6">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                  Rule {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="mt-2 text-xl">{rule.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{rule.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 rounded-lg border border-line bg-sunken p-6 sm:p-8">
            <h2 className="font-display text-2xl">How the rules are enforced</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Enforcement is proportionate and recorded. Every action taken by a moderator is
              written to an audit log that administrators can review, so decisions are never
              invisible.
            </p>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {ENFORCEMENT.map((item) => (
                <li key={item.step} className="border-t-2 border-ink pt-4">
                  <h3 className="text-base font-semibold">{item.step}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/register">Claim your username</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to the city
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
