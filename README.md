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
scripts/audit.mjs   UI audit (links, buttons, i18n, 375px) across the three apps — see "UI audit" below
scripts/contrast.mjs, make-icons.mjs   colour contrast check, favicon / PWA icons — see "Design system"
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
pnpm audit:quick         # UI audit of the pages this branch touches (~1–4 min): after every stage of work
pnpm audit:ui            # full UI audit (~9 min): before opening a PR
```

Cross-app links (e.g. admin → doctor's public profile in the patient app) use
`NEXT_PUBLIC_PATIENT_URL / NEXT_PUBLIC_DOCTOR_URL / NEXT_PUBLIC_ADMIN_URL`.
Each app has a committed `.env` with the local ports; override with `.env.local`.

## Design system

Everything visual comes from `packages/ui`: the tokens in `styles/theme.css` (colour scales, type,
radius, shadow, motion), the components in `src/ui`, the empty-state illustrations in
`src/illustrations` and the logo in `src/layout/Logo.tsx`. No UI library: Tailwind v4, lucide and
`next/font` (Manrope for headings, Inter for text, both with Cyrillic).

- **`/design`** in the patient app (`pnpm dev --filter patient`, then http://localhost:3000/design)
  shows every token and component in all its variants. It exists in development only.
- Each app has an accent on top of the same base: patient brand blue, doctor teal, admin indigo
  (`data-accent` on `<html>`; use the `accent-*` colours, not `teal-*` / `indigo-*`).
- `node scripts/contrast.mjs` checks the text and icon colours against WCAG AA.
- `node scripts/make-icons.mjs` redraws the favicon and the PWA icons from the logo.
- Photos and their licences are listed in `docs/IMAGES.md`.

## UI audit

`scripts/audit.mjs` opens the apps in headless Chrome and checks what a person would notice: pages that
do not load, links that lead nowhere, buttons that do nothing, message keys showing instead of text,
console errors, and layouts that overflow a 375px screen. It has two modes.

| | `pnpm audit:quick` | `pnpm audit:ui` (full) |
|---|---|---|
| When | after every stage of work | before opening a PR |
| Pages | the pages the branch touches + 3 main pages per app (48 at most) | every seed and every page reachable from one (108 today) |
| Languages | uz, plus one page per app in ru | uz, plus ru and en at 375px |
| Viewports | 1280px and 375px | 1280px and 375px |
| Buttons | pressed on every page checked | pressed on every page checked |
| Links | checked, not followed | checked and followed |
| Guest pass, language switcher | only when the change reaches them | always |
| Target | ≤ 5 min | ≤ 12 min |
| Measured (M-series MacBook, 5 workers) | 1m 08s for a small change, 3m 36s for an 89-file one | 8m 38s |

**The usual routine: `pnpm audit:quick` after each stage, `pnpm audit:ui` once before the PR.**
Both end with the time they took and the last time of the other mode (`quick: 1m 08s, full: 8m 38s`),
and exit with 0 when clean, 2 when something was found. The report is `scripts/audit-output/report.md`;
`screenshots/` holds only the pages that were flagged.

How quick picks its pages: the files changed since the branch left `main` (committed or not) are
followed through the import graph to the routes that load them (`scripts/audit-routes.mjs`). A changed
message is followed through the code that reads that key. Pages the change is most specific to come
first; a file every page imports counts for little. What did not fit is listed in the report as not
checked, and so is a changed route that has an `[id]` but no seed URL in `scripts/audit-pages.mjs`.
The report's first table says, per page, which changed files led to it.

Good to know:

- The audit runs against production builds. It builds what it needs (`turbo run build`, cached) and
  starts the apps itself; nothing has to be running. `pnpm dev` may stay up: the audit leaves it alone
  and serves the production build on ports 4000–4002 for the duration.
- Pages are checked in parallel (`--workers`, default 5), each check in a browser context of its own,
  so the result does not depend on the order. If Chrome dies mid-run it is restarted and the checks
  that were running are repeated; the report says how often that happened.
- Map tiles and demo photos from other servers (OpenStreetMap, pravatar, picsum) are answered with a
  one-pixel image, so a run neither depends on the network nor loads a free tile server.
- ru and en are loaded at 375px only. Nothing else about a page depends on the language: the message
  keys are the same in every locale (`pnpm check-messages`).
- Options: `--apps patient,doctor`, `--base <branch>` (quick: compare with something other than
  `main`), `--max-pages <n>`, `--workers <n>`, `--no-probe`, `--no-build`, `--guest`, `--keep`.
  Through pnpm: `pnpm audit:quick --base develop`.
- No system Chrome: see `docs/SETUP.md`.
- `node scripts/shot.mjs <url> <name>` takes 375px and 1280px screenshots of one page.

## Demo navigation

- Each app's `/login` has a single demo button for its own role ("enter as patient / doctor / admin").
- Doctor login links to the patient app's `/register?role=doctor` (role pre-selected) and `/forgot-password`;
  admin login has no register link.
- Patient app: doctor search (`/patient/doctors`) and doctor profiles (`/patient/doctors/[id]`) are open to guests,
  with a plain header (logo, language, login) instead of the app shell. Everything else under `/patient` needs the
  mock session cookie: `src/proxy.ts` sends guests to `/login?returnTo=<page>` (so "book" and "chat" ask for login),
  and login, register and the demo button all land back on `returnTo`. Logging out clears the cookie.
- List pages accept `?state=empty|loading|error` to preview empty, loading and error states (no UI for it; the audit seeds these URLs).
- `NEXT_PUBLIC_DEMO=true` shows a "demo mode" badge on the login pages; nothing else in the UI mentions demo mode.
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
