import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

/* Self-hosted OFL fonts — licences ship in src/fonts/OFL-*.txt. */
const fraunces = localFont({
  src: '../fonts/fraunces-latin.woff2',
  variable: '--font-fraunces',
  weight: '300 900',
  display: 'swap',
});

const publicSans = localFont({
  src: '../fonts/public-sans-latin.woff2',
  variable: '--font-public-sans',
  weight: '300 800',
  display: 'swap',
});

const siteUrl = process.env.APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Novara City — Your Life. Your City.',
    template: '%s · Novara City',
  },
  description:
    'Novara City is a modern virtual city. Claim a unique username, move into a district, get a real address, and take part in civic life.',
  applicationName: 'Novara City',
  authors: [{ name: 'bagazblitz78', url: 'https://github.com/bagazblitz78' }],
  openGraph: {
    type: 'website',
    siteName: 'Novara City',
    title: 'Novara City — Your Life. Your City.',
    description:
      'Claim a unique username, move into a district, get a real address, and take part in civic life.',
    url: siteUrl,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Novara City — Your Life. Your City.',
    description:
      'Claim a unique username, move into a district, get a real address, and take part in civic life.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
