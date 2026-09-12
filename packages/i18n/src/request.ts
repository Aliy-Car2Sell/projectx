import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "./locale";

/** Message bundles under ./messages: `common` is always loaded, plus one per app. */
export type MessageBundle = "patient" | "doctor" | "admin";

type Messages = Record<string, unknown>;

async function loadBundle(bundle: string, locale: string): Promise<Messages> {
  return (await import(`../messages/${bundle}/${locale}.json`)).default as Messages;
}

/**
 * next-intl request config shared by every app.
 * Each app's `src/i18n/request.ts` does: `export default createRequestConfig("patient")`.
 */
export function createRequestConfig(bundles: MessageBundle | MessageBundle[]) {
  const list = Array.isArray(bundles) ? bundles : [bundles];
  return getRequestConfig(async () => {
    const locale = await getUserLocale();
    const parts = await Promise.all(["common", ...list].map((b) => loadBundle(b, locale)));
    return { locale, messages: Object.assign({}, ...parts) as Messages };
  });
}
