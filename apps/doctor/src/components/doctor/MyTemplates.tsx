"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Copy, LayoutTemplate, Pencil, Plus, Save, Trash2 } from "lucide-react";
import type { SpecialtyKey, SummaryTemplate } from "@projectx/types";
import { getSummaryTemplates } from "@projectx/mock/templates";
import { Button } from "@projectx/ui/Button";
import { Card, CardHeader } from "@projectx/ui/Card";
import { Input } from "@projectx/ui/Input";
import { Modal } from "@projectx/ui/Modal";
import { Select } from "@projectx/ui/Select";
import { Toast, useToast } from "@projectx/ui/Toast";
import { copyTemplate, groupTemplates, useSummaryTemplates } from "@projectx/ui/summary/templates";

const iconButton = "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-heading disabled:opacity-30 disabled:pointer-events-none";

/**
 * Doctor profile: "my templates". A template is always started as a copy of an existing one,
 * then its parts are renamed, reordered, added or removed. Kept in the browser.
 */
export function MyTemplates({ specialty }: { specialty: SpecialtyKey }) {
  const t = useTranslations("doctor.templates");
  const tc = useTranslations("common");
  const ts = useTranslations("specialties");
  const locale = useLocale();
  const builtIn = useMemo(() => getSummaryTemplates(locale), [locale]);
  const { all, custom, save, remove } = useSummaryTemplates(builtIn);
  const groups = groupTemplates(all, specialty);
  const [sourceId, setSourceId] = useState("");
  const [draft, setDraft] = useState<SummaryTemplate | null>(null);
  const { toast, show } = useToast();
  const source = all.find((x) => x.id === sourceId) ?? groups.own[0];

  const titles = draft?.sections.map((s) => s.title.trim().toLowerCase()) ?? [];
  const problem = !draft
    ? null
    : !draft.name.trim()
      ? t("errors.name")
      : draft.sections.length === 0
        ? t("errors.noSections")
        : titles.some((x) => !x)
          ? t("errors.sectionTitle")
          : new Set(titles).size !== titles.length
            ? t("errors.duplicate")
            : null;

  const setSection = (i: number, patch: Partial<SummaryTemplate["sections"][number]>) =>
    setDraft((d) => d && { ...d, sections: d.sections.map((s, k) => (k === i ? { ...s, ...patch } : s)) });
  const move = (i: number, by: -1 | 1) =>
    setDraft((d) => {
      if (!d) return d;
      const sections = [...d.sections];
      [sections[i], sections[i + by]] = [sections[i + by], sections[i]];
      return { ...d, sections };
    });

  return (
    <Card>
      <CardHeader title={t("title")} subtitle={t("desc")} action={<LayoutTemplate className="h-5 w-5 text-primary-text" />} />

      {custom.length === 0 ? (
        <p className="text-sm text-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-line">
          {custom.map((tpl) => (
            <li key={tpl.id} className="flex items-center gap-2 py-2">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-heading">{tpl.name}</div>
                <div className="truncate text-sm text-muted">{tpl.sections.map((s) => s.title).join(" · ")}</div>
              </div>
              <button type="button" className={iconButton} aria-label={`${tc("edit")}: ${tpl.name}`} onClick={() => setDraft(tpl)}>
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={iconButton}
                aria-label={`${tc("delete")}: ${tpl.name}`}
                onClick={() => {
                  if (!window.confirm(t("deleteConfirm", { name: tpl.name }))) return;
                  remove(tpl.id);
                  show(t("deleted"));
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Select
            label={t("copyFrom")}
            value={source?.id ?? ""}
            onChange={(e) => setSourceId(e.target.value)}
            groups={[
              { label: t("mine"), options: groups.mine.map((x) => ({ value: x.id, label: x.name })) },
              { label: ts(specialty), options: groups.own.map((x) => ({ value: x.id, label: x.name })) },
              { label: t("others"), options: groups.others.map((x) => ({ value: x.id, label: x.name })) },
            ]}
          />
        </div>
        <Button variant="secondary" icon={<Copy className="h-4 w-4" />} disabled={!source} onClick={() => source && setDraft(copyTemplate(source, t("copyName", { name: source.name })))}>
          {t("copy")}
        </Button>
      </div>

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={t("editTitle")}
        closeLabel={tc("close")}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              {tc("cancel")}
            </Button>
            <Button
              icon={<Save className="h-4 w-4" />}
              disabled={Boolean(problem)}
              onClick={() => {
                if (!draft || problem) return;
                save({ ...draft, name: draft.name.trim(), sections: draft.sections.map((s) => ({ ...s, title: s.title.trim(), placeholder: s.placeholder.trim() })) });
                setDraft(null);
                show(t("saved"));
              }}
            >
              {tc("save")}
            </Button>
          </>
        }
      >
        {draft && (
          <div className="flex flex-col gap-4">
            <Input label={t("name")} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
            <div>
              <div className="text-sm font-medium text-heading">{t("sections")}</div>
              <ol className="mt-1.5 flex flex-col gap-2">
                {draft.sections.map((s, i) => (
                  // Parts have no id of their own and their title is being typed: the position is the key.
                  <li key={i} className="rounded-lg border border-line p-2">
                    <div className="flex items-center gap-1">
                      <span className="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-muted">{i + 1}</span>
                      <Input aria-label={t("sectionTitle")} placeholder={t("sectionTitle")} value={s.title} onChange={(e) => setSection(i, { title: e.target.value })} wrapperClassName="min-w-0 flex-1" />
                      <button type="button" className={iconButton} aria-label={t("moveUp")} disabled={i === 0} onClick={() => move(i, -1)}>
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button type="button" className={iconButton} aria-label={t("moveDown")} disabled={i === draft.sections.length - 1} onClick={() => move(i, 1)}>
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button type="button" className={iconButton} aria-label={t("removeSection")} onClick={() => setDraft({ ...draft, sections: draft.sections.filter((_, k) => k !== i) })}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      aria-label={t("sectionHint")}
                      placeholder={t("sectionHint")}
                      value={s.placeholder}
                      onChange={(e) => setSection(i, { placeholder: e.target.value })}
                      wrapperClassName="mt-2 pl-7"
                      hint={s.role === "diagnosis" ? t("diagnosisNote") : undefined}
                    />
                  </li>
                ))}
              </ol>
              <Button type="button" variant="secondary" size="sm" className="mt-2" icon={<Plus className="h-4 w-4" />} onClick={() => setDraft({ ...draft, sections: [...draft.sections, { title: "", placeholder: "" }] })}>
                {t("addSection")}
              </Button>
            </div>
            {problem && <p className="text-sm text-danger">{problem}</p>}
          </div>
        )}
      </Modal>
      <Toast message={toast} />
    </Card>
  );
}
