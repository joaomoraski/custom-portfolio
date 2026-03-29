# Project: Custom Portfolio

A full-stack personal portfolio with a CMS-style admin dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database:** PostgreSQL via Docker + Prisma 7 (with `@prisma/adapter-pg`)
- **Auth:** NextAuth v5 beta (`next-auth@5.0.0-beta.30`) — Credentials provider, JWT session strategy
- **Styling:** Tailwind CSS v4 + `@tailwindcss/typography` + `next-themes` (dark/light mode, class strategy)
- **Markdown:** `react-markdown` + `remark-gfm` + `rehype-highlight` + `rehype-raw`
- **Markdown Editor:** `@uiw/react-md-editor`
- **Package Manager:** `pnpm`

## Project Structure

```
src/
  app/
    (public)/          # Public-facing pages (home, projects, blog, achievements, contact)
    admin/
      (protected)/     # Protected admin pages (dashboard, blog, projects, achievements, messages, settings)
      login/           # Login page (outside protected layout)
  actions/             # Server Actions for all CRUD operations
  components/
    admin/             # Admin-specific forms (ProjectForm, PostForm)
    ui/                # Shared UI components (GlassCard, NeonButton, ImageUploader, MarkdownRenderer, ImageCarousel...)
  lib/
    auth.ts            # NextAuth config
    prisma.ts          # Prisma client singleton (uses PrismaPg adapter)
    utils.ts           # cn(), formatDate(), slugify()
    mail.ts            # Optional Nodemailer email (only sends if SMTP env vars are set)
  generated/
    prisma/            # Auto-generated Prisma client (DO NOT edit manually)
      index.ts         # Barrel export — must exist for module resolution
prisma/
  schema.prisma        # Database schema
  seed.ts              # Seeds admin user + SiteSettings from env vars
src/proxy.ts           # Next.js 16 proxy (formerly middleware) — handles auth redirect + analytics
```

## Key Conventions

- **Soft deletes:** All models have `deletedAt DateTime?`. Never use `prisma.*.delete()` — set `deletedAt: new Date()` instead. All queries filter `where: { deletedAt: null }`.
- **Multiple images:** `Project`, `BlogPost`, and `Achievement` all use `imageIds String[]` (array of Media IDs), not a single `coverImageId`.
- **Cache invalidation:** Every server action that mutates data must call `revalidatePath(...)` for all affected routes.
- **Prisma config:** Datasource URL is configured in `prisma.config.ts` only. The `schema.prisma` datasource block does NOT contain a `url` field (Prisma 7 change).
- **Admin auth:** The proxy (`src/proxy.ts`) uses `getToken()` from `next-auth/jwt` — never import Prisma into proxy/edge code.
- **First admin user:** Created by `pnpm db:seed` using `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars. No user registration UI exists.
- **Media storage:** Images and PDFs are stored as `Bytes` in PostgreSQL via the `Media` model. Access via `/api/media/[id]`.

## Environment Variables

See `.env.example`. Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. SMTP vars are optional (email notifications for contact form).

## Common Commands

```bash
pnpm docker:up       # Start PostgreSQL container
pnpm db:push         # Sync schema to DB (dev)
pnpm db:seed         # Seed admin user + site settings
pnpm db:generate     # Regenerate Prisma client (always run after schema changes)
pnpm dev             # Start dev server
pnpm build           # Production build
```

> ⚠️ After every `pnpm db:generate`, verify that `src/generated/prisma/index.ts` exists with `export * from "./client";`. It is NOT auto-created by Prisma.

## UI Theme

Dark-first glassmorphism design. Key classes:
- Background: `dark:bg-black/5 dark:backdrop-blur-xl dark:border-white/10`
- Accent colors: purple (`purple-500`) + cyan (`cyan-400`) neon glows
- Cards: `GlassCard` component (`src/components/ui/glass-card.tsx`)
- Buttons: `NeonButton` component with variants: `purple`, `cyan`, `ghost`, `danger`
- Rounded everywhere: `rounded-xl`
