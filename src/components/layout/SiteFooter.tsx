import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';

const COLUMNS = [
  {
    title: 'The city',
    links: [
      { href: '/#how', label: 'How it works' },
      { href: '/#districts', label: 'Districts' },
      { href: '/rules', label: 'Rules' },
    ],
  },
  {
    title: 'Residents',
    links: [
      { href: '/register', label: 'Claim a username' },
      { href: '/login', label: 'Log in' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-city grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            A virtual city with real addresses. Claim a username, move into a district, and take
            part in civic life.
          </p>
          <p className="mt-4 font-display text-sm font-semibold text-ink">Your Life. Your City.</p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
              {column.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="container-city flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Novara City. All rights reserved.</p>
          <p>
            In active development — features ship milestone by milestone, and this site states only
            what is live.
          </p>
        </div>
      </div>
    </footer>
  );
}
