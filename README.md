# Portfolio CMS

A personal portfolio and CMS built with Next.js 16 — featuring a themed UI (dark gradient + glassmorphism + neon accents), full content management via an admin dashboard, visitor analytics, and a markdown-powered blog and achievements section.

## Features

- **Public portfolio** — About, Projects, Blog, Achievements, Contact pages
- **Admin dashboard** — CMS for all content, visitor analytics, contact inbox
- **Theme** — `black → purple → blue` gradient, glassmorphism cards, neon accents, dark/light mode
- **Markdown** — full editor (admin) and rendered output (public) for blog posts and achievements
- **Image/PDF storage** — media stored in PostgreSQL, served via API route
- **Contact form** — saved to DB; optional email notification via SMTP
- **Visitor tracking** — page views logged and charted in the admin dashboard
- **Single admin user** — created from env vars at seed time, no registration endpoint

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + `next-themes` |
| ORM | Prisma 7 |
| Database | PostgreSQL 16 |
| Auth | NextAuth v5 (credentials, JWT) |
| Markdown | `@uiw/react-md-editor` + `react-markdown` |
| Charts | Recharts |
| Package manager | pnpm |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (for PostgreSQL)
- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd custom-portfolio
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set at minimum:

```env
DATABASE_URL="postgresql://portfolio:portfolio@localhost:5432/portfolio"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
ADMIN_EMAIL="your@email.com"
ADMIN_PASSWORD="your-strong-password"
```

SMTP fields are optional — if omitted, contact messages are only stored in the database.

### 3. Start the database

```bash
pnpm docker:up
```

### 4. Push schema and seed

```bash
pnpm db:push    # creates tables
pnpm db:seed    # creates admin user + default site settings
```

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.
Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login) to access the admin dashboard.

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
| `pnpm db:migrate` | Create and apply a migration |
| `pnpm db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public-facing pages
│   │   ├── page.tsx       # About / Home
│   │   ├── projects/
│   │   ├── blog/
│   │   ├── achievements/
│   │   └── contact/
│   ├── admin/             # Protected CMS dashboard
│   │   ├── page.tsx       # Analytics dashboard
│   │   ├── projects/
│   │   ├── blog/
│   │   ├── achievements/
│   │   ├── messages/
│   │   └── settings/
│   └── api/               # API routes (auth, media, contact, tracking)
├── actions/               # Server actions (CRUD for all content)
├── components/
│   ├── ui/                # Shared UI (GlassCard, NeonButton, MarkdownEditor…)
│   ├── layout/            # Navbar, Footer
│   └── admin/             # Admin-only components (forms, charts)
├── lib/                   # prisma.ts, auth.ts, mail.ts, utils.ts
└── proxy.ts               # Next.js 16 proxy: admin auth guard + analytics
prisma/
├── schema.prisma
└── seed.ts
docker-compose.yml
```

## Admin Dashboard

Log in at `/admin/login` with the credentials set in your `.env`.

| Section | What you can manage |
|---------|-------------------|
| Dashboard | Visitor stats, daily views chart |
| Projects | Create/edit/delete projects with image, tech stack, links |
| Blog | Write posts in Markdown with cover image and publish toggle |
| Achievements | Same as blog — share milestones with Markdown and photos |
| Messages | View contact form submissions, mark read/unread |
| Settings | Name, bio, about page, social links, resume PDF upload |

## Changing the Admin Password

Update `ADMIN_PASSWORD` in `.env`, then re-run:

```bash
pnpm db:seed
```

The seed script uses `upsert`, so it updates the existing user safely.

## Optional: Email Notifications

To receive an email when someone submits the contact form, add to `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
CONTACT_EMAIL="recipient@example.com"
```

If these are not set, the app works normally — messages are just stored in the database.
