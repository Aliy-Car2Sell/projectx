# ProjectX — frontend mockup

Patient–doctor platform for Uzbekistan (see `docs/ProjectX-spec-v0.3.md`).
This stage is a **UI-only mockup**: every screen is a Next.js page filled with mock data.
No backend, database or auth yet.

## Stack

- Next.js 16 (App Router, TypeScript), Tailwind CSS v4 (design tokens in `src/app/globals.css`)
- next-intl — uz / ru / en, locale stored in the `NEXT_LOCALE` cookie, switcher in the header
- lucide-react icons, Leaflet + react-leaflet (OpenStreetMap tiles, client-only)

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
node scripts/check-messages.mjs   # verify uz/ru/en translation keys are in sync
```

## Demo navigation

- `/login` has three demo buttons: enter as patient, doctor or admin.
- `/patient/...`, `/doctor/...`, `/admin/...` are separate route groups with their own shell
  (bottom navigation on phones, icon sidebar on tablets, full sidebar on desktop).
- List pages accept `?state=empty|loading|error` to preview empty, loading and error states.
- `/doctor?state=pending` shows the "profile under review" banner.

## Where things live

| Path | Purpose |
|---|---|
| `messages/*.json` | All UI text (no hard-coded strings in components) |
| `src/types/` | Domain types that will map to Prisma models |
| `src/lib/mock/` | Mock data (doctors, appointments, records, chats, reviews, users) — replace with API calls later |
| `src/lib/dates.ts` | Locale-safe date formatting based on translated month names |
| `src/components/ui/` | Design system: Button, Card, Input, Select, Badge, Avatar, Modal (bottom sheet on mobile), Tabs, EmptyState, StarRating, StatusBadge, PageHeader, Skeleton, Chip/Switch |
| `src/components/layout/` | AppShell (header, sidebar, bottom nav), language switcher, nav config |
| `src/components/{doctors,booking,appointments,records,chat,reviews,doctor,admin}/` | Feature components |
| `scripts/merge-messages.mjs` | Deep-merge a partial JSON into a locale file |
