import type { UserRole } from "@projectx/types";

/** Quick questions offered per app, in display order. Texts live in the `help.<role>.topics.<key>` messages. */
export const helpTopics: Record<UserRole, { key: string; href?: string }[]> = {
  patient: [
    { key: "book", href: "/patient/doctors" },
    { key: "upload", href: "/patient/records" },
    { key: "cancel", href: "/patient/appointments" },
    { key: "language", href: "/patient/profile" },
    { key: "operator" },
  ],
  doctor: [
    { key: "schedule", href: "/doctor/schedule" },
    { key: "summary", href: "/doctor/appointments" },
    { key: "record", href: "/doctor/patients" },
    { key: "language", href: "/doctor/profile" },
    { key: "operator" },
  ],
  admin: [
    { key: "applications", href: "/admin/applications" },
    { key: "block", href: "/admin/doctors" },
    { key: "reviews", href: "/admin/reviews" },
    { key: "language", href: "/admin/profile" },
    { key: "operator" },
  ],
};

export interface HelpQuestion {
  role: UserRole;
  /** A quick-question chip, or undefined when the user typed `text` freely. */
  topic?: string;
  text: string;
}

export interface HelpAnswer {
  text: string;
  steps?: string[];
  link?: { href: string; label: string };
}

/**
 * Where answers come from. HelpChat only knows this signature, so the mock below can be swapped
 * for a backend / AI call (`<HelpChat source={...} />`) without touching the UI.
 */
export type HelpSource = (q: HelpQuestion) => Promise<HelpAnswer>;

type Translator = { (key: string): string; raw(key: string): unknown; has(key: string): boolean };

/** MVP source: canned answers from the translations; free text is "handed to an operator". */
export function mockHelpSource(t: Translator): HelpSource {
  return async ({ role, topic }) => {
    await new Promise((r) => setTimeout(r, 350)); // feels like a reply, and exercises the pending state
    const def = topic ? helpTopics[role].find((x) => x.key === topic) : undefined;
    if (!def) return { text: t("handoff") };
    const base = `${role}.topics.${def.key}`;
    const steps = t.has(`${base}.steps`) ? (t.raw(`${base}.steps`) as string[]) : undefined;
    return {
      text: t(`${base}.a`),
      steps,
      link: def.href && t.has(`${base}.link`) ? { href: def.href, label: t(`${base}.link`) } : undefined,
    };
  };
}
