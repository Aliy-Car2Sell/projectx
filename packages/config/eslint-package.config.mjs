import { defineConfig } from "eslint/config";
import base from "./eslint.config.mjs";

/** ESLint config for shared packages (no Next.js `pages/` dir, so that rule is off). */
export default defineConfig([
  ...base,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]);
