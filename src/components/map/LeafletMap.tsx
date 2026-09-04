"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  href?: string;
  active?: boolean;
};

/** Inline SVG pin so we don't depend on Leaflet's image assets. */
function pinIcon(active?: boolean) {
  const color = active ? "#7C3AED" : "#1A9BE6";
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40"><path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 24 16 24s16-13 16-24C32 7.2 24.8 0 16 0z" fill="${color}"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -36],
  });
}

function FitBounds({ pins }: { pins: MapPin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
  }, [map, pins]);
  return null;
}

function ClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LeafletMap({
  pins,
  center,
  zoom = 12,
  fit = true,
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
  const c = center ?? (pins[0] ? { lat: pins[0].lat, lng: pins[0].lng } : { lat: 41.2995, lng: 69.2401 });
  return (
    <MapContainer center={[c.lat, c.lng]} zoom={zoom} className={className} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {fit && <FitBounds pins={pins} />}
      {onClick && <ClickHandler onClick={onClick} />}
      {pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(p.active)}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 700 }}>{p.title}</div>
              {p.subtitle && <div style={{ color: "#6B7280", fontSize: 12 }}>{p.subtitle}</div>}
              {p.href && (
                <a href={p.href} style={{ color: "#1A9BE6", fontWeight: 600, fontSize: 13, display: "inline-block", marginTop: 6 }}>
                  →
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
