# moraski.dev — Orbital Portfolio

A personal portfolio built as an interactive orbital map. The public site is a "mission control" solar system where the star is me, experiences orbit on inner rings, projects on the outer ring, achievements scatter the asteroid belt, and a comet carries a Schrödinger's cat experiment. An admin panel behind auth manages all content.

## The Map

The home page renders an SVG solar system with real-time animation:

- **Ring 0** — The star (operator profile from Settings)
- **Ring 1** — Current experiences (stations, `endDate = null`)
- **Ring 2** — Past experiences (satellites)
- **Ring 3** — Projects (probes or planets, configurable)
- **Belt** — Achievements (asteroids)
- **Comet** — One featured achievement on an eccentric Kepler orbit, carrying the cat

Bodies are clickable — a dossier panel slides open with full details, tech stack, links, and markdown content. Zoom, pan, drag, keyboard navigation, and a `prefers-reduced-motion` static fallback are all built in.

Conventional pages (`/about`, `/projects`, `/experiences`, `/blog`, `/achievements`, `/contact`) use the same aesthetic with a shared orbital header.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Public UI | Inline styles, Space Mono + IBM Plex Sans, dark-only |
| Admin UI | Tailwind CSS v4 + `next-themes` (dark/light) |
| ORM | Prisma 7 |
| Database | PostgreSQL 17 |
| Auth | NextAuth v5 (credentials, JWT) |
| Markdown | Self-contained orbital renderer (public) + `@uiw/react-md-editor` (admin) |
| Charts | Recharts (admin analytics) |
| Package manager | pnpm |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (for PostgreSQL)
- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd <repo-name>
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Set at minimum:

```env
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5432/portfolio"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD="your-strong-password"
```

SMTP fields are optional — if omitted, contact messages are stored in the database only.

### 3. Start the database

```bash
pnpm docker:up
```

### 4. Push schema and seed

```bash
pnpm db:push
pnpm db:seed
```

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the orbital map.
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin panel.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm docker:up` | Start PostgreSQL container |
| `pnpm docker:down` | Stop PostgreSQL container |
| `pnpm db:push` | Push Prisma schema to database |
| `pnpm db:seed` | Seed admin user and default settings |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── (public)/              # Public orbital pages
│   │   ├── page.tsx           # Orbital map (home)
│   │   ├── about/
│   │   ├── projects/
│   │   ├── projects/[slug]/
│   │   ├── experiences/
│   │   ├── blog/
│   │   ├── blog/[slug]/
│   │   ├── achievements/
│   │   ├── achievements/[slug]/
│   │   └── contact/
│   ├── admin/                 # Protected CMS dashboard
│   │   ├── page.tsx           # Analytics dashboard
│   │   ├── projects/
│   │   ├── blog/
│   │   ├── achievements/
│   │   ├── experiences/
│   │   ├── messages/
│   │   └── settings/
│   └── api/                   # API routes (auth, media, contact, tracking)
├── actions/                   # Server actions (CRUD)
├── components/
│   ├── orbital/               # Orbital map + shared orbital components
│   ├── ui/                    # Shared UI (GlassCard, NeonButton, etc.)
│   └── admin/                 # Admin forms and charts
├── lib/                       # prisma.ts, auth.ts, mail.ts, utils.ts
└── proxy.ts                   # Auth guard + analytics proxy
prisma/
├── schema.prisma
└── seed.ts
```

## Admin Panel

Log in at `/admin/login` with the credentials from `.env`.

| Section | What you manage |
|---------|----------------|
| Dashboard | Visitor stats, daily views chart |
| Projects | Title, slug, description (markdown), tech stack, images, status, body type, launched date, GitHub/live URLs |
| Blog | Posts in markdown with cover image and publish toggle |
| Achievements | Milestones with markdown, images, and publish toggle |
| Experiences | Role, company, date range, tech stack, description |
| Messages | Contact form submissions, read/unread |
| Settings | Name, bio, about page, "Why a solar system?" content, social links, resume PDF, comet achievement |

## Schema Highlights

- **Soft deletes** — all models use `deletedAt` instead of hard deletes
- **Media in DB** — images and PDFs stored as `Bytes` in PostgreSQL, served via `/api/media/[id]`
- **Project.slug** — auto-generated from title, manual override in admin
- **Project.status** — `ACTIVE` / `IN_DEV` / `ARCHIVED` (affects map glyph rendering)
- **Project.bodyType** — `PROBE` (triangle) or `PLANET` (ringed circle) on the map
- **SiteSettings.cometAchievementId** — FK pointing to the achievement that becomes the comet

## The Cat

The comet's dossier contains a Schrödinger's cat apparatus. Press OBSERVE to collapse the wavefunction — the outcome is genuinely random via `Math.random()`. Press RESEAL to return to superposition. It uses `omSuperA`/`omSuperB` CSS keyframes for the oscillation and `omScan`/`omFlick` for the measurement sweep.
