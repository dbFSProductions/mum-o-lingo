// Service worker: makes Mum-o-lingo work with no signal once installed.
//
// App shell is precached. The Azure SDK is cached on first use rather than up
// front, so the initial load stays light. Azure API calls are never cached —
// they're POSTs and must always go to the network.

// Bumped with VERSION in js/version.js — Settings shows the two side by side,
// so forgetting one of them shows up as two different numbers on screen.
const VERSION = "mumolingo-v27";
const SHELL = [
  "./",
  "./index.html",
  "./app.css",
  "./manifest.webmanifest",
  "./js/app.js",
  "./js/version.js",
  "./js/store.js",
  "./js/audio.js",
  "./js/speech.js",
  "./js/content.js",
  "./js/card-assistant.js",
  "./vendor/fonts/nunito-latin.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

/* Precache from the network, never from the browser's own HTTP cache.
   Pages serves every asset with `max-age=600`, so for ten minutes after a
   deploy a plain `cache.add()` can still be handed the *previous* copy of a
   file. That fills a brand-new cache with a mix — a new index.html sitting
   next to the old app.js — and cache-first then serves that mix until the
   next version bump, which no amount of reloading fixes. `reload` bypasses the
   HTTP cache, so a version's cache is all of one version. Xerra was bitten by
   this for real; don't undo it for "fewer requests". */
const fromNetwork = (url) => new Request(url, { cache: "reload" });

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      // Individual failures shouldn't abort the whole install.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(fromNetwork(url)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return; // Azure et al go straight out

  /* The document names the scripts the page will load, so it is the one file
     that must never be staler than the cache behind it: network-first, with
     the cache as the offline fallback. A deploy then lands on the first
     reload rather than the second. */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache same-origin successes on the fly (this is how the vendored
        // Azure SDK becomes available offline after its first load).
        if (response.ok) {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
