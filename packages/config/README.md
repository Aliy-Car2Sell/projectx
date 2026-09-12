# @projectx/config

Shared tooling config for the monorepo.

- `@projectx/config/eslint` — ESLint flat config (eslint-config-next core-web-vitals + typescript)
- `@projectx/config/eslint-package` — same, for shared packages (no `pages/` rule)
- `@projectx/config/postcss` — PostCSS config with `@tailwindcss/postcss`
- `@projectx/config/tsconfig/base.json` — TypeScript base for packages
- `@projectx/config/tsconfig/nextjs.json` — TypeScript base for Next.js apps

Tailwind v4 has no JS preset: design tokens live in `@projectx/ui/styles/theme.css`.
