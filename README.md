# ProjectX — frontend monorepo

Healthcare platform for Uzbekistan (see `docs/ProjectXspecv0.4.md`).
Current stage: **UI-only mockup** — every screen is a Next.js page filled with mock data.
No backend, database or auth yet (`apps/api` comes next).

One backend, one app per audience ("Yandex model"): users never pick a role — each
audience has its own app on its own hostname.

## Structure

```
apps/
  patient/     Next.js, mobile-first, PWA            -> http://localhost:3000
  doctor/      Next.js (desktop-first later)         -> http://localhost:3001
  admin/       Next.js, desktop                      -> http://localhost:3002
packages/
  ui/          Design system + shared feature components, Tailwind tokens (styles/theme.css)
  i18n/        uz / ru / en messages (common + one bundle per app), next-intl helpers
  types/       Domain types (future Prisma models / API DTOs)
  mock/        Mock data — temporary, deleted once apps/api exists
  utils/       cn(), date formatting, appUrl() for cross-app links
  config/      Shared eslint / tsconfig / postcss
scripts/audit.mjs   UI audit (links, buttons, i18n, 375px) across the three apps
docs/               Spec, setup, audit reports
```

Routes keep their prefix inside each app for now: `apps/patient` serves `/`, `/login`,
`/register`, `/patient/...`; `apps/doctor` serves `/login`, `/doctor/...` (its `/` redirects
to `/login`); `apps/admin` likewise with `/admin/...`.

## Stack

- pnpm workspaces + Turborepo
- Next.js 16 (App Router, TypeScript, Turbopack), Tailwind CSS v4 (tokens in `packages/ui/styles/theme.css`)
- next-intl — locale stored in the `NEXT_LOCALE` cookie, switcher in the header
- lucide-react icons, Leaflet + react-leaflet (OpenStreetMap tiles, client-only)
- patient app: web manifest + minimal service worker (offline page)

## Commands

```bash
corepack enable          # once: makes pnpm available (see docs/SETUP.md)
pnpm install

pnpm dev                 # all three apps (3000 / 3001 / 3002)
pnpm dev --filter patient
pnpm dev --filter doctor
pnpm dev --filter admin

pnpm build               # builds every app
pnpm lint                # lints apps + packages
pnpm check-messages      # uz/ru/en keys in sync per bundle
pnpm audit:ui            # UI audit against the built apps (starts them if needed)
```

Cross-app links (e.g. admin → doctor's public profile in the patient app) use
`NEXT_PUBLIC_PATIENT_URL / NEXT_PUBLIC_DOCTOR_URL / NEXT_PUBLIC_ADMIN_URL`.
Each app has a committed `.env` with the local ports; override with `.env.local`.

## Demo navigation

- Each app's `/login` has a single demo button for its own role ("enter as patient / doctor / admin").
- Doctor login links to the patient app's `/register?role=doctor` (role pre-selected) and `/forgot-password`;
  admin login has no register link.
- Patient app: doctor search (`/patient/doctors`) and doctor profiles (`/patient/doctors/[id]`) are open to guests,
  with a plain header (logo, language, login) instead of the app shell. Everything else under `/patient` needs the
  mock session cookie: `src/proxy.ts` sends guests to `/login?returnTo=<page>` (so "book" and "chat" ask for login),
  and login, register and the demo button all land back on `returnTo`. Logging out clears the cookie.
- List pages accept `?state=empty|loading|error` to preview empty, loading and error states.
- `/doctor?state=pending` shows the "profile under review" banner.

## Where things live

| Path | Purpose |
|---|---|
| `packages/i18n/messages/{common,patient,doctor,admin}/*.json` | All UI text. `common` is loaded by every app; `patient.*`, `doctor.*`, `admin.*` only by their app |
| `packages/i18n/src/request.ts` | `createRequestConfig("patient")` — each app's `src/i18n/request.ts` is one line |
| `packages/types/src/index.ts` | Domain types that will map to Prisma models |
| `packages/mock/src/` | Mock data (doctors, appointments, records, chats, reviews, users, notifications) |
| `packages/utils/src/` | `cn()`, date formatting, `appUrl()` |
| `packages/ui/src/ui/` | Button, Card, Input, Select, Badge, Avatar, Modal, Tabs, EmptyState, StarRating, StatusBadge, PageHeader, Skeleton, Chip, Toast… |
| `packages/ui/src/layout/` | AppShell (header, sidebar, bottom nav), AuthShell, language switcher, notifications, nav config |
| `packages/ui/src/{auth,chat,map,profile,records,reviews,documents,demo}/` | Feature components used by two or more apps |
| `apps/<app>/src/components/` | Components used by that app only |
| `apps/patient/src/app/manifest.ts`, `public/sw.js`, `public/offline.html` | PWA |
| `packages/i18n/scripts/merge-messages.mjs` | Deep-merge a partial JSON into a bundle: `node scripts/merge-messages.mjs <bundle> <locale> <partial.json>` |
