"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarRange, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@projectx/utils";
import { fmtDate, today } from "@projectx/utils/dates";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { periodStart, printPeriods, rangePreset, type PrintPeriod, type RecordFilter, type RecordQuery } from "./groupRecords";

const chipClass = "min-h-[36px] shrink-0";

/** "1-mart – 29-sen" for a hand-picked range; an open end shows as "…". */
export function useRangeLabel() {
  const t = useTranslations("records.range");
  const tc = useTranslations("common");
  const locale = useLocale();
  return (from: string, to: string) => {
    const preset = rangePreset(from, to, today());
    if (preset !== "custom") return t(`presets.${preset}`);
    const f = (d: string) => (d ? fmtDate(locale, tc, d, "numeric") : "…");
    return `${f(from)} – ${f(to)}`;
  };
}

/**
 * Sticky notebook controls. Phones: row 1 = section chips (scroll sideways) + search / date icons,
 * the search field opens under it, row 2 = the main actions side by side at full width.
 * Desktop: one row, the search field opening inline in place of its icon; where the column is too
 * narrow for that (doctor's patient card, tablets) the actions move to a second row. `compactActions` go into row 1 as icon buttons on phones (the doctor has three
 * actions; only two fit side by side).
 */
export function RecordsToolbar({
  filters,
  filter,
  onFilter,
  query,
  onSearch,
  onRange,
  actions,
  compactActions,
}: {
  filters: RecordFilter[];
  filter: RecordFilter;
  onFilter: (f: RecordFilter) => void;
  query: RecordQuery;
  onSearch: (q: string) => void;
  onRange: (from: string, to: string) => void;
  actions: React.ReactNode;
  compactActions?: React.ReactNode;
}) {
  const t = useTranslations("records");
  const rangeLabel = useRangeLabel();
  // The field keeps its own text so typing never waits for the URL; a back/forward step resyncs it.
  const [text, setText] = useState(query.q);
  const [prevQ, setPrevQ] = useState(query.q);
  if (query.q !== prevQ) {
    setPrevQ(query.q);
    setText(query.q);
  }
  const [searchOpen, setSearchOpen] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const showSearch = searchOpen || Boolean(text);
  const hasRange = Boolean(query.from || query.to);

  const type = (v: string) => {
    setText(v);
    onSearch(v.trim());
  };

  useEffect(() => {
    // Two fields exist (inline on desktop, own row on phones); focus the one that is on screen.
    if (searchOpen) inputRefs.current.find((el) => el?.offsetParent)?.focus();
  }, [searchOpen]);

  const field = (className: string, slot: number) => (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input
        ref={(el) => {
          inputRefs.current[slot] = el;
        }}
        type="search"
        value={text}
        onChange={(e) => type(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            type("");
            setSearchOpen(false);
          }
        }}
        placeholder={t("search.placeholder")}
        aria-label={t("search.label")}
        className="min-h-[40px] w-full rounded-full border border-line bg-card pl-9 pr-9 text-base text-heading placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {showSearch && (
        <button
          type="button"
          onClick={() => {
            type("");
            setSearchOpen(false);
          }}
          aria-label={t("search.clear")}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-heading"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const iconButton = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors";

  return (
    <div className="sticky top-14 md:top-16 z-20 -mx-5 px-5 md:mx-0 md:px-0 py-2 bg-surface/95 backdrop-blur flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3">
      {/* Wide enough for the open search field; in a narrow column (doctor's patient card) the actions wrap below. */}
      <div className="flex min-w-0 flex-1 items-center gap-2 md:min-w-[26rem]">
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto scrollbar-none" role="group" aria-label={t("filterLabel")}>
          {filters.map((f) => (
            <Chip key={f} active={filter === f} onClick={() => onFilter(f)} className={chipClass}>
              {t(`filters.${f}`)}
            </Chip>
          ))}
        </div>
        {!showSearch && (
          <button type="button" onClick={() => setSearchOpen(true)} aria-label={t("search.label")} aria-expanded={false} className={cn(iconButton, "border-line bg-card text-heading hover:border-primary")}>
            <Search className="h-4 w-4" />
          </button>
        )}
        {showSearch && field("hidden md:block md:w-52 lg:w-60 shrink-0", 0)}
        <div className="shrink-0 md:relative">
          <button
            type="button"
            onClick={() => setRangeOpen((v) => !v)}
            aria-expanded={rangeOpen}
            aria-haspopup="dialog"
            aria-label={`${t("range.label")}: ${rangeLabel(query.from, query.to)}`}
            className={cn(
              iconButton,
              "md:w-auto md:gap-1.5 md:px-3 text-sm font-medium",
              hasRange ? "border-primary bg-primary-soft text-primary-text" : "border-line bg-card text-heading hover:border-primary",
            )}
          >
            <CalendarRange className="h-4 w-4" />
            <span className="hidden md:inline whitespace-nowrap">{rangeLabel(query.from, query.to)}</span>
            <ChevronDown className={cn("hidden md:block h-4 w-4 transition-transform", rangeOpen && "rotate-180")} />
          </button>
          {rangeOpen && <RangePanel query={query} onClose={() => setRangeOpen(false)} onRange={onRange} />}
        </div>
        {compactActions && <div className="flex shrink-0 items-center md:hidden">{compactActions}</div>}
      </div>

      {showSearch && field("md:hidden", 1)}

      <div className="grid grid-cols-2 gap-2 md:ml-auto md:flex md:items-center md:shrink-0 [&>*]:w-full md:[&>*]:w-auto">{actions}</div>
    </div>
  );
}

/** Quick periods plus "Range" with two date inputs. Closes on Escape or a tap outside. */
function RangePanel({ query, onRange, onClose }: { query: RecordQuery; onRange: (from: string, to: string) => void; onClose: () => void }) {
  const t = useTranslations("records.range");
  const now = today();
  const preset = rangePreset(query.from, query.to, now);
  const [custom, setCustom] = useState(preset === "custom");
  const [from, setFrom] = useState(query.from);
  const [to, setTo] = useState(query.to);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: PointerEvent) => {
      // The toggle button sits outside the panel; let its own click close it.
      if (ref.current && !ref.current.parentElement?.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);

  const pick = (p: PrintPeriod) => {
    onRange(periodStart(p, now) ?? "", "");
    onClose();
  };
  const invalid = Boolean(from && to && from > to);

  return (
    <div ref={ref} role="dialog" aria-label={t("label")} className="absolute inset-x-4 top-full z-30 rounded-lg border border-line bg-card p-3 shadow-lg md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-80">
      <div className="grid grid-cols-2 gap-2">
        {printPeriods.map((p) => (
          <Chip key={p} active={!custom && preset === p} onClick={() => pick(p)} className="min-h-[40px]">
            {t(`presets.${p}`)}
          </Chip>
        ))}
        <Chip active={custom} onClick={() => setCustom(true)} className="col-span-2 min-h-[40px]">
          {t("custom")}
        </Chip>
      </div>
      {custom && (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (invalid) return;
            onRange(from, to);
            onClose();
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              {t("from")}
              <input type="date" value={from} max={to || now} onChange={(e) => setFrom(e.target.value)} className="min-h-[40px] w-full rounded-md border border-line bg-card px-2 text-sm text-heading focus:border-primary focus:outline-none" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-muted">
              {t("to")}
              <input type="date" value={to} min={from || undefined} max={now} onChange={(e) => setTo(e.target.value)} className="min-h-[40px] w-full rounded-md border border-line bg-card px-2 text-sm text-heading focus:border-primary focus:outline-none" />
            </label>
          </div>
          {invalid && <p className="text-xs text-danger-700">{t("invalid")}</p>}
          <Button type="submit" size="sm" disabled={invalid || (!from && !to)}>
            {t("apply")}
          </Button>
        </form>
      )}
    </div>
  );
}
