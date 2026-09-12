import { defineConfig } from "eslint/config";
import base from "./eslint.config.mjs";

/** ESLint config for shared packages: no Next.js `pages/` dir, and React may not be a direct dependency. */
export default defineConfig([
  ...base,
  {
    settings: {
      react: { version: "19" },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
]);
