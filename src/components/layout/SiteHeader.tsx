'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonLink, buttonClasses } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/components/auth/AuthContext';

const NAV = [
  { href: '/#how', label: 'How it works' },
  { href: '/#districts', label: 'Districts' },
  { href: '/rules', label: 'Rules' },
];

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="container-city flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" aria-label="Novara City — home" className="rounded-md text-ink">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-sunken hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <span aria-hidden="true" className="h-8 w-24 animate-pulse rounded-md bg-sunken" />
          ) : user ? (
            <>
              <Link
                href={`/r/${user.username}`}
                className="rounded-md px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-sunken"
              >
                @{user.username}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className={buttonClasses('secondary', 'sm')}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-sunken"
              >
                Log in
              </Link>
              <ButtonLink href="/register" size="sm">
                Claim your username
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className={buttonClasses('ghost', 'sm', 'md:hidden')}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-line bg-surface md:hidden"
        >
          <div className="container-city flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-semibold text-ink hover:bg-sunken"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
              {loading ? (
                <span
                  aria-hidden="true"
                  className="h-11 w-full animate-pulse rounded-md bg-sunken"
                />
              ) : user ? (
                <>
                  <Link
                    href={`/r/${user.username}`}
                    onClick={() => setOpen(false)}
                    className={buttonClasses('secondary', 'md')}
                  >
                    @{user.username}
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className={buttonClasses('ghost', 'md')}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={buttonClasses('secondary', 'md')}
                  >
                    Log in
                  </Link>
                  <ButtonLink href="/register" size="md">
                    Claim your username
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
