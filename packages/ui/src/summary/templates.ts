"use client";

import { useCallback, useMemo } from "react";
import type { DoctorSummary, SpecialtyKey, SummarySection, SummaryTemplate } from "@projectx/types";
import { useDemoState } from "../session/store";

export const BLANK_TEMPLATE_ID = "tpl-blank";
const none: SummaryTemplate[] = [];

/** Ready-made templates plus the doctor's own ("my templates", kept in the browser). */
export function useSummaryTemplates(builtIn: SummaryTemplate[]) {
  const [custom, setCustom] = useDemoState<SummaryTemplate[]>("templates", none);
  const [lastUsed, setLastUsed] = useDemoState<string>("templates.last", BLANK_TEMPLATE_ID);
  const all = useMemo(() => [...custom, ...builtIn], [custom, builtIn]);

  const save = useCallback((tpl: SummaryTemplate) => setCustom((prev) => (prev.some((x) => x.id === tpl.id) ? prev.map((x) => (x.id === tpl.id ? tpl : x)) : [...prev, tpl])), [setCustom]);
  const remove = useCallback((id: string) => setCustom((prev) => prev.filter((x) => x.id !== id)), [setCustom]);

  return { all, custom, save, remove, lastUsed, setLastUsed };
}

/** Select groups: the doctor's own, then their specialty (with the blank one), then everyone else's. */
export function groupTemplates(all: SummaryTemplate[], specialty: SpecialtyKey) {
  return {
    mine: all.filter((x) => x.custom),
    own: all.filter((x) => !x.custom && (x.specialty === specialty || x.specialty === "general")),
    others: all.filter((x) => !x.custom && x.specialty !== specialty && x.specialty !== "general"),
  };
}

/** A copy of `source` for the doctor to change. */
export function copyTemplate(source: SummaryTemplate, name: string): SummaryTemplate {
  return { ...source, id: `tpl-local-${Date.now()}`, name, custom: true, sections: source.sections.map((s) => ({ ...s })) };
}

/** Filled-in parts in template order; untouched ones are left out. */
export function filledSections(tpl: SummaryTemplate, bodies: string[]): SummarySection[] {
  return tpl.sections.map((s, i) => ({ title: s.title, body: (bodies[i] ?? "").trim() })).filter((s) => s.body);
}

const bodyOf = (tpl: SummaryTemplate, bodies: string[], role: "diagnosis" | "recommendations") => {
  const i = tpl.sections.findIndex((s) => s.role === role);
  return i >= 0 ? (bodies[i] ?? "").trim() : "";
};

/**
 * The summary a filled-in template produces. The diagnosis part becomes the record's title
 * (the template's name when it has none); the blank template stays the plain two-field summary.
 */
export function buildSummary(tpl: SummaryTemplate, bodies: string[], rest: Pick<DoctorSummary, "severity" | "createdAt">): DoctorSummary {
  const sections = filledSections(tpl, bodies);
  const diagnosis = bodyOf(tpl, bodies, "diagnosis").split("\n")[0] || tpl.name;
  const plain = tpl.id === BLANK_TEMPLATE_ID;
  return {
    ...rest,
    diagnosis,
    recommendations: plain ? bodyOf(tpl, bodies, "recommendations") : sectionsToText(sections),
    sections: plain ? undefined : sections,
    templateId: tpl.id,
  };
}

/** Plain-text form of a structured summary (search, print fallback, the audit diff). */
export function sectionsToText(sections: SummarySection[]): string {
  return sections.map((s) => `${s.title}: ${s.body}`).join("\n");
}

/** Text to put into a template's parts when reopening a summary: by title first, then by role. */
export function bodiesFor(tpl: SummaryTemplate, summary: DoctorSummary | undefined): string[] {
  if (!summary) return tpl.sections.map(() => "");
  return tpl.sections.map((s) => {
    const same = summary.sections?.find((x) => x.title === s.title);
    if (same) return same.body;
    if (summary.sections) return "";
    return s.role === "diagnosis" ? summary.diagnosis : s.role === "recommendations" ? summary.recommendations : "";
  });
}
