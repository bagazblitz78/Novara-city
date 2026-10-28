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

| Area      | Feature                                                                          |
| --------- | -------------------------------------------------------------------------------- |
| Public    | Landing page, City Pulse, resident directory, City Hall announcements            |
| Identity  | Registration, login, sessions, profiles, avatars, Citizen Cards                  |
| Community | Feed, posts, comments                                                            |
| Safety    | Reports, moderation queue, roles (`resident` / `moderator` / `admin`), audit log |
| Admin     | Dashboard, user management, announcement publishing                              |

**Deferred to later releases:** interactive isometric city map, radio & newspaper,
voting & elections, groups & clubs, direct messages, notifications, organizations and
the virtual economy.

## Tech stack

- **Next.js** (App Router) + **TypeScript** — modular monolith
- **Tailwind CSS** with design tokens; accessible headless primitives as features need them
- **Prisma** ORM — **SQLite** for local development, **PostgreSQL** in production
- **Zod** validation, custom session authentication (Argon2id)
- Linting and formatting enforced locally and in CI; automated tests arrive with the backend milestone

## Getting started

> Prerequisites: **Node.js ≥ 20** and **npm**.

```bash
git clone https://github.com/bagazblitz78/Novara-city.git
cd Novara-city
cp .env.example .env      # Windows: copy .env.example .env
npm install
npm run dev               # http://localhost:3000
```

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env` — it is gitignored.

| Variable           | Purpose                                                               | Default                 |
| ------------------ | --------------------------------------------------------------------- | ----------------------- |
| `DATABASE_URL`     | SQLite file locally, PostgreSQL URL in production                     | `file:./dev.db`         |
| `APP_URL`          | Public base URL of the app                                            | `http://localhost:3000` |
| `SESSION_SECRET`   | Signs session cookies — generate a fresh random value per environment | _(required)_            |
| `PORT`             | HTTP port                                                             | `3000`                  |
| `UPLOAD_DIR`       | Local upload directory                                                | `./uploads`             |
| `UPLOAD_MAX_BYTES` | Max image upload size                                                 | `2097152`               |
| `LOG_LEVEL`        | pino log level                                                        | `info`                  |

## Project structure

```
src/
  app/        Routes (public, auth, app, admin) and API route handlers
  components/ ui primitives, layout, feature components
  lib/        shared helpers (validation, formatting, reference data)
  fonts/      self-hosted OFL fonts with their licences
  styles/     design tokens and global styles
```

`server/` (business logic), `prisma/` (schema), `tests/` and `docs/` are created together
with their milestones.

## Development

```bash
npm run lint            # ESLint
npm run format          # Prettier write
npm run format:check    # Prettier check
npm run typecheck       # tsc --noEmit
npm run build           # production build
npm run dev             # local dev server
```

Automated tests (`npm test`) are added with the backend milestone.

## Security

Repository hygiene is in place from the first commit:

- `.env` is gitignored; only `.env.example` (placeholders) is tracked.
- No credentials, tokens, private keys or generated build output are committed.

Application-level controls are designed and land with their milestones (do not read them
as shipped yet):

- **Authentication (M3):** `HttpOnly` + `Secure` + `SameSite=Lax` session cookies with
  only hashed tokens stored, Argon2id password hashing, rate limiting and CSRF defence.
- **Every request:** Zod-validated input and server-side authorisation checks.

To report a vulnerability, please open a private security advisory rather than a public
issue.

## License

Not yet chosen — a license will be added only after an explicit decision.

## Repository

- **Remote:** https://github.com/bagazblitz78/Novara-city
- **Author:** bagazblitz78 \<bagasiqbal767@gmail.com\>
