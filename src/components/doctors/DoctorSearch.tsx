"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { List, Map as MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import type { CategoryKey, CityKey, DoctorProfile, SpecialtyKey } from "@/types";
import { cityKeys, specialtyKeys } from "@/lib/mock/doctors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { MapView } from "@/components/map/MapView";
import { DoctorCard } from "./DoctorCard";
import type { DemoState } from "@/components/demo/state";
import { ErrorState } from "@/components/ui/EmptyState";
import { RetryButton } from "@/components/ui/RetryButton";

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

export function DoctorSearch({ doctors, state = "normal" }: { doctors: DoctorProfile[]; state?: DemoState }) {
  const t = useTranslations();
  const td = useTranslations("patient.doctors");
  const [filters, setFilters] = useState<Filters>(initialFilters);
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
        <span className="text-sm font-medium text-heading">{td("experience")}</span>
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
        <span className="text-sm font-medium text-heading">{td("rating")}</span>
        <div className="flex flex-wrap gap-2">
          {([0, 4, 4.5] as const).map((v) => (
            <Chip key={v} active={filters.minRating === v} onClick={() => set("minRating", v)}>
              {v === 0 ? td("anyRating") : v === 4 ? td("rating4") : td("rating45")}
            </Chip>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-heading">{td("sortBy")}</span>
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
        icon={<Search className="h-7 w-7" />}
        title={td("noResults")}
        description={td("noResultsDesc")}
        action={
          <Button variant="secondary" onClick={() => setFilters(initialFilters)}>
            {td("resetFilters")}
          </Button>
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
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          type="search"
        />
        <Button variant="secondary" className="lg:hidden relative" onClick={() => setSheetOpen(true)} icon={<SlidersHorizontal className="h-4 w-4" />}>
          <span className="hidden sm:inline">{t("common.filter")}</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center px-1">
              {activeCount}
            </span>
          )}
        </Button>
        <div className="lg:hidden inline-flex rounded-lg border border-line bg-card p-0.5">
          <button
            type="button"
            aria-label={t("common.list")}
            onClick={() => setView("list")}
            className={cn("h-10 w-10 rounded-md flex items-center justify-center", view === "list" ? "bg-primary text-white" : "text-muted")}
          >
            <List className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label={t("common.map")}
            onClick={() => setView("map")}
            className={cn("h-10 w-10 rounded-md flex items-center justify-center", view === "map" ? "bg-primary text-white" : "text-muted")}
          >
            <MapIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="text-sm text-muted">{td("found", { count: results.length })}</div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1.2fr)_minmax(0,1fr)]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="bg-card rounded-xl shadow-card border border-line/60 p-4 sticky top-20">
            <h2 className="font-bold text-heading mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> {td("filters")}
            </h2>
            {filterPanel}
          </div>
        </aside>

        {/* List */}
        <div className={cn(view === "map" && "hidden lg:block")}>{body}</div>

        {/* Map */}
        <div className={cn(view === "list" && "hidden lg:block")}>
          <div className="lg:sticky lg:top-20">
            <MapView pins={pins} className="h-[60vh] lg:h-[calc(100vh-7rem)]" />
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
