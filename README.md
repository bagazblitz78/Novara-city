# Novara City

> **Your Life. Your City.**

Novara City is a modern virtual-city platform: claim a unique username, move into a
district, get a real address, and take part in civic life — open registration, no
social-media gatekeeping.

**Status:** early development — foundation only. Features listed below are planned and
not yet implemented unless marked otherwise.

---

## Vision

A clean, professional, responsive, secure and maintainable virtual society that can grow
into a large online city.

- **Open arrival** — anyone can register and claim a unique `@username`.
- **Districts & addresses** — every resident belongs somewhere, e.g.
  `Novara · Harbor Point · 12 Alder Row`.
- **Citizen Card** — a public, shareable resident profile at `/r/username`.
- **City Pulse** — live city statistics built from real data.
- **Two voices** — official City Hall announcements alongside the community feed.
- **Safety first** — reporting, moderation roles and a full audit trail.

## Planned features

| Area | Feature |
|---|---|
| Public | Landing page, City Pulse, resident directory, City Hall announcements |
| Identity | Registration, login, sessions, profiles, avatars, Citizen Cards |
| Community | Feed, posts, comments |
| Safety | Reports, moderation queue, roles (`resident` / `moderator` / `admin`), audit log |
| Admin | Dashboard, user management, announcement publishing |

**Deferred to later releases:** interactive isometric city map, radio & newspaper,
voting & elections, groups & clubs, direct messages, notifications, organizations and
the virtual economy.

## Tech stack

- **Next.js** (App Router) + **TypeScript** — modular monolith
- **Tailwind CSS** with design tokens + **Radix UI** primitives
- **Prisma** ORM — **SQLite** for local development, **PostgreSQL** in production
- **Zod** validation, custom session authentication (Argon2id)
- **Vitest** (unit + integration) and **Playwright** (e2e), enforced in CI

## Getting started

> Full instructions land with the backend milestone. Prerequisites: **Node.js ≥ 20** and
> **npm**.

```bash
git clone https://github.com/bagazblitz78/Novara-city.git
cd Novara-city
cp .env.example .env      # Windows: copy .env.example .env
npm install
npm run dev               # http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env` — it is gitignored.

| Variable | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | SQLite file locally, PostgreSQL URL in production | `file:./dev.db` |
| `APP_URL` | Public base URL of the app | `http://localhost:3000` |
| `SESSION_SECRET` | Signs session cookies — generate a fresh random value per environment | *(required)* |
| `PORT` | HTTP port | `3000` |
| `UPLOAD_DIR` | Local upload directory | `./uploads` |
| `UPLOAD_MAX_BYTES` | Max image upload size | `2097152` |
| `LOG_LEVEL` | pino log level | `info` |

## Project structure

```
src/
  app/        Routes (public, auth, app, admin) and API route handlers
  components/ ui primitives, layout, feature components
  server/     services, guards, queries — all business logic
  lib/        db, session, validation, logger, storage, errors
  styles/     design tokens and global styles
prisma/       schema, migrations, seed data
tests/        unit, integration, e2e
docs/         architecture, API, security, deployment
```

## Development

```bash
npm run lint        # ESLint
npm run format      # Prettier
npm run typecheck   # tsc --noEmit
npm test            # unit + integration
npm run build       # production build
```

## Security

- `.env` is gitignored; only `.env.example` (placeholders) is tracked.
- Session cookies are `HttpOnly`, `Secure`, `SameSite=Lax`; only hashed tokens are stored.
- Passwords are hashed with Argon2id; all input is Zod-validated server-side.
- Authorisation is enforced on the server for every request.

See `docs/security.md` once published. To report a vulnerability, please open a
private security advisory rather than a public issue.

## License

Not yet chosen — a license will be added only after an explicit decision.

## Repository

- **Remote:** https://github.com/bagazblitz78/Novara-city
- **Author:** bagazblitz78 \<bagasiqbal767@gmail.com\>
