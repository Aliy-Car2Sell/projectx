"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { List, Map as MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import type { CategoryKey, CityKey, DoctorProfile, SpecialtyKey } from "@projectx/types";
import { cityKeys, specialtyKeys } from "@projectx/mock/doctors";
import { cn } from "@projectx/utils";
import { Button } from "@projectx/ui/Button";
import { Chip } from "@projectx/ui/Chip";
import { EmptyState } from "@projectx/ui/EmptyState";
import { Input } from "@projectx/ui/Input";
import { Modal } from "@projectx/ui/Modal";
import { Select } from "@projectx/ui/Select";
import { ListSkeleton } from "@projectx/ui/Skeleton";
import { MapView } from "@projectx/ui/map/MapView";
import { DoctorCard } from "./DoctorCard";
import type { DemoState } from "@projectx/ui/demo/state";
import { ErrorState } from "@projectx/ui/EmptyState";
import { RetryButton } from "@projectx/ui/RetryButton";

type Filters = {
  q: string;
  specialty: SpecialtyKey | "";
  city: CityKey | "";
  minExp: 0 | 3 | 5 | 10;
  category: CategoryKey | "";
  minRating: 0 | 4 | 4.5;
  sort: "nearest" | "rating";
};

const initialFilters: Filters = { q: "", specialty: "", city: "", minExp: 0, category: "", minRating: 0, sort: "nearest" };

export function DoctorSearch({
  doctors,
  state = "normal",
  initial,
}: {
  doctors: DoctorProfile[];
  state?: DemoState;
  /** What the visitor asked for on the landing page (`?q=` from its search field, `?specialty=` from its chips). */
  initial?: { q?: string; specialty?: SpecialtyKey };
}) {
  const t = useTranslations();
  const td = useTranslations("patient.doctors");
  const [filters, setFilters] = useState<Filters>({ ...initialFilters, q: initial?.q ?? "", specialty: initial?.specialty ?? "" });
  const [view, setView] = useState<"list" | "map">("list");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const results = useMemo(() => {
    if (state === "empty") return [];
    const q = filters.q.trim().toLowerCase();
    return doctors
      .filter((d) => {
        if (q) {
          const hay = `${d.firstName} ${d.lastName} ${d.clinicName} ${t(`specialties.${d.specialty}`)}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (filters.specialty && d.specialty !== filters.specialty) return false;
        if (filters.city && d.city !== filters.city) return false;
        if (filters.minExp && d.experienceYears < filters.minExp) return false;
        if (filters.category && d.category !== filters.category) return false;
        if (filters.minRating && d.rating < filters.minRating) return false;
        return true;
      })
      .sort((a, b) =>
        filters.sort === "rating" ? b.rating - a.rating : (a.distanceKm ?? 999) - (b.distanceKm ?? 999),
      );
  }, [doctors, filters, state, t]);

  const activeCount = [filters.specialty, filters.city, filters.minExp, filters.category, filters.minRating].filter(Boolean).length;
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters((f) => ({ ...f, [k]: v }));

  const pins = results.map((d) => ({
    id: d.id,
    lat: d.lat,
    lng: d.lng,
    title: `${d.firstName} ${d.lastName}`,
    subtitle: `${t(`specialties.${d.specialty}`)} · ${d.clinicName}`,
    href: `/patient/doctors/${d.id}`,
    active: d.id === activeId,
  }));

  const filterPanel = (
    <div className="flex flex-col gap-4">
      <Select
        label={td("specialty")}
        value={filters.specialty}
        onChange={(e) => set("specialty", e.target.value as Filters["specialty"])}
        placeholder={t("common.all")}
        options={specialtyKeys.map((k) => ({ value: k, label: t(`specialties.${k}`) }))}
      />
      <Select
        label={td("city")}
        value={filters.city}
        onChange={(e) => set("city", e.target.value as Filters["city"])}
        placeholder={t("common.all")}
        options={cityKeys.map((k) => ({ value: k, label: t(`cities.${k}`) }))}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-neutral-800">{td("experience")}</span>
        <div className="flex flex-wrap gap-2">
          {([0, 3, 5, 10] as const).map((v) => (
            <Chip key={v} active={filters.minExp === v} onClick={() => set("minExp", v)}>
              {v === 0 ? td("anyExperience") : td(`exp${v}`)}
            </Chip>
          ))}
        </div>
      </div>
      <Select
        label={td("category")}
        value={filters.category}
        onChange={(e) => set("category", e.target.value as Filters["category"])}
        placeholder={t("common.all")}
        options={(["highest", "first", "second", "none"] as CategoryKey[]).map((k) => ({ value: k, label: t(`categories.${k}`) }))}
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-neutral-800">{td("rating")}</span>
        <div className="flex flex-wrap gap-2">
          {([0, 4, 4.5] as const).map((v) => (
            <Chip key={v} active={filters.minRating === v} onClick={() => set("minRating", v)}>
              {v === 0 ? td("anyRating") : v === 4 ? td("rating4") : td("rating45")}
            </Chip>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-neutral-800">{td("sortBy")}</span>
        <div className="flex flex-wrap gap-2">
          <Chip active={filters.sort === "nearest"} onClick={() => set("sort", "nearest")}>
            {td("nearest")}
          </Chip>
          <Chip active={filters.sort === "rating"} onClick={() => set("sort", "rating")}>
            {td("topRated")}
          </Chip>
        </div>
      </div>
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={() => setFilters({ ...initialFilters, q: filters.q })} icon={<X className="h-4 w-4" />}>
          {td("resetFilters")}
        </Button>
      )}
    </div>
  );

  let body: React.ReactNode;
  if (state === "loading") body = <ListSkeleton rows={5} />;
  else if (state === "error")
    body = <ErrorState title={t("states.errorTitle")} description={t("states.errorDesc")} action={<RetryButton />} />;
  else if (results.length === 0)
    body = (
      <EmptyState
        illustration="search"
        title={td("noResults")}
        description={td("noResultsDesc")}
        action={
          state === "empty" ? undefined : (
            <Button variant="secondary" onClick={() => setFilters(initialFilters)}>
              {td("resetFilters")}
            </Button>
          )
        }
      />
    );
  else
    body = (
      <div className="flex flex-col gap-3">
        {results.map((d) => (
          <div key={d.id} onMouseEnter={() => setActiveId(d.id)} onMouseLeave={() => setActiveId(null)}>
            <DoctorCard doctor={d} highlighted={activeId === d.id} />
          </div>
        ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {/* Search bar + controls */}
      <div className="flex gap-2">
        <Input
          wrapperClassName="flex-1 min-w-0"
          placeholder={td("searchPlaceholder")}
          aria-label={td("searchPlaceholder")}
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
          leftIcon={<Search className="h-5 w-5" />}
          type="search"
        />
        <Button variant="secondary" size="lg" className="lg:hidden relative min-h-[48px] px-4" onClick={() => setSheetOpen(true)} icon={<SlidersHorizontal />}>
          <span className="hidden sm:inline">{t("common.filter")}</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] rounded-pill bg-primary-700 text-white text-[11px] font-bold flex items-center justify-center px-1 ring-2 ring-surface">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted">{td("found", { count: results.length })}</div>
        {/* Phones show one at a time: the list or the map. */}
        <div className="flex gap-2 lg:hidden">
          <Chip active={view === "list"} onClick={() => setView("list")} className="min-h-[36px] px-3.5">
            <List /> {t("common.list")}
          </Chip>
          <Chip active={view === "map"} onClick={() => setView("map")} className="min-h-[36px] px-3.5">
            <MapIcon /> {t("common.map")}
          </Chip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[264px_minmax(0,1fr)] xl:grid-cols-[264px_minmax(0,1.15fr)_minmax(0,1fr)] xl:gap-5">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="bg-card rounded-lg shadow-sm border border-neutral-200/70 p-5 sticky top-24">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-heading">
              <SlidersHorizontal className="h-5 w-5 text-primary-700" /> {td("filters")}
            </h2>
            {filterPanel}
          </div>
        </aside>

        {/* List */}
        <div className={cn(view === "map" && "hidden lg:block")}>{body}</div>

        {/* Map: beside the list from xl up, under it on narrower desktops */}
        <div className={cn("lg:col-start-2 xl:col-start-3", view === "list" && "hidden lg:block")}>
          <div className="xl:sticky xl:top-24">
            <MapView pins={pins} className="h-[60vh] lg:h-[420px] xl:h-[calc(100vh-8rem)]" />
          </div>
        </div>
      </div>

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={td("filters")}
        closeLabel={t("common.close")}
        footer={
          <Button fullWidth onClick={() => setSheetOpen(false)}>
            {t("common.apply")} ({results.length})
          </Button>
        }
      >
        {filterPanel}
      </Modal>
    </div>
  );
}
