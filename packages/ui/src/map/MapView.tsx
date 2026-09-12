"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { cn } from "@projectx/utils";
import type { MapPin } from "./LeafletMap";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

function MapPlaceholder() {
  const t = useTranslations("common");
  return (
    <div className="h-full w-full flex items-center justify-center bg-primary-soft/40 text-muted text-sm animate-pulse rounded-xl">
      {t("mapLoading")}
    </div>
  );
}

/** Client-only OpenStreetMap wrapper. Give it an explicit height via className. */
export function MapView({
  pins,
  center,
  zoom,
  fit,
  onClick,
  className,
}: {
  pins: MapPin[];
  center?: { lat: number; lng: number };
  zoom?: number;
  fit?: boolean;
  onClick?: (lat: number, lng: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-line bg-surface", className)}>
      <LeafletMap pins={pins} center={center} zoom={zoom} fit={fit} onClick={onClick} />
    </div>
  );
}

export type { MapPin };
