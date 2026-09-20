# Setup

## Requirements

- Node.js 20+ (tested with 24)
- pnpm 10 — via corepack (recommended) or a global install
- Google Chrome (only for `pnpm audit:ui`)

## 1. pnpm

The repo pins `packageManager: pnpm@10.x` in `package.json`, so corepack picks the right version:

```bash
corepack enable
pnpm --version
```

On Windows `corepack enable` needs write access to the Node.js install dir. Without admin rights,
put the shims in your user npm folder instead (it is already on PATH):

```powershell
mkdir "$env:APPDATA\npm" -Force
corepack enable --install-directory "$env:APPDATA\npm"
```

Alternative without corepack: `npm install -g pnpm@10`.

## 2. Install and run

```bash
pnpm install
pnpm dev                     # patient :3000, doctor :3001, admin :3002
pnpm dev --filter doctor     # a single app
```

Each app reads its sibling URLs from its committed `.env`
(`NEXT_PUBLIC_PATIENT_URL`, `NEXT_PUBLIC_DOCTOR_URL`, `NEXT_PUBLIC_ADMIN_URL`).
To change hosts or ports, add a `.env.local` next to it (git-ignored). Ports in `.env`
must match the `-p` flags in each app's `package.json`.

## 3. Checks

```bash
pnpm lint
pnpm build
pnpm check-messages
pnpm audit:ui            # needs `pnpm build` first; writes scripts/audit-output/report.md
```

Without a system Chrome, install Chrome for Testing and point `CHROME_PATH` at it:
`npx -p @puppeteer/browsers browsers install chrome@<version>` (the version `puppeteer-core` pins is in
`node_modules/puppeteer-core/lib/puppeteer/revisions.js`).

## PWA (patient app)

Install prompts require the manifest, icons and a service worker — all present — plus HTTPS
(localhost is exempt). The service worker only registers in production builds
(`pnpm build && pnpm --filter patient start`); in `next dev` it stays off so it cannot interfere with HMR.
