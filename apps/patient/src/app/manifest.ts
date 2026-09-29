import type { MetadataRoute } from "next";

/**
 * Web app manifest for the patient PWA ("Add to Home Screen").
 * Colors mirror packages/ui/styles/theme.css (--color-primary-500 / --color-neutral-50).
 * Icons are drawn from the logo by `node scripts/make-icons.mjs`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ProjectX",
    short_name: "ProjectX",
    description: "Doktor toping, qabulga yoziling, tibbiy kartochkangizni yuriting.",
    id: "/patient",
    start_url: "/patient",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f9fc",
    theme_color: "#1a9be6",
    lang: "uz",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
