/* UMANG service worker — static asset caching + offline fallback.
 *
 * What is cached:
 *   - /_next/static/*  (content-hashed bundles, fonts): cache-first, safe forever
 *   - icons + manifest: stale-while-revalidate
 *   - page HTML shells: network-first, cached copy used only when offline
 * What is never cached:
 *   - /api/*, audio clips (range requests), cross-origin requests, non-GET requests
 * Page HTML is rendered without any user data — profiles, applications, tickets and
 * phone numbers live only in this browser's localStorage, never in Cache Storage.
 * When a cached page is shown offline, the app displays an "offline — may be out of date" banner.
 */
const VERSION = "umang-v1";
const STATIC = `${VERSION}-static`;
const PAGES = `${VERSION}-pages`;
const PRECACHE = ["/offline", "/choose-role", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/audio/") || url.pathname === "/sw.js") return;

  // Hashed build output: immutable.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(STATIC).then((c) => c.put(req, res.clone()));
            return res;
          }),
      ),
    );
    return;
  }

  // Icons and manifest: serve cached, refresh in background.
  if (url.pathname.startsWith("/icons/") || url.pathname === "/manifest.webmanifest") {
    event.respondWith(
      caches.open(STATIC).then((cache) =>
        cache.match(req).then((hit) => {
          const fresh = fetch(req)
            .then((res) => {
              if (res.ok) cache.put(req, res.clone());
              return res;
            })
            .catch(() => hit);
          return hit || fresh;
        }),
      ),
    );
    return;
  }

  // Full page loads: network first, fall back to the cached shell, then the offline page.
  // RSC/prefetch requests (client navigations) are left to the network; if they fail,
  // Next.js falls back to a full page load, which lands here.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(() =>
          caches
            .open(PAGES)
            .then((c) => c.match(url.pathname))
            .then((hit) => hit || caches.match("/offline")),
        ),
    );
  }
});
