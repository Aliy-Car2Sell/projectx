/*
 * Minimal service worker for the patient PWA.
 * It does one thing: when a page navigation fails because there is no network,
 * it shows /offline.html ("Internet yo'q"). Nothing else is cached, so the app
 * always serves fresh content while online.
 */
const CACHE = "projectx-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(OFFLINE_URL);
      return cached || new Response("Internet yo'q", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }),
  );
});
