// service worker updated
// Cache only static frontend assets.
const CACHE_NAME = "fasttools-v3";
const BACKEND_ORIGIN = "https://fasttools.onrender.com";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./config.js",
  "./api.js",
  "./app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      )
    )
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isBackendRequest = url.origin === BACKEND_ORIGIN;
  const isApiPath = url.pathname.startsWith("/api/");
  const isPost = req.method === "POST";

  // Always bypass POST, backend, and API requests.
  if (isPost || isBackendRequest || isApiPath || !isSameOrigin) {
    event.respondWith(fetch(req));
    return;
  }

  const cacheablePaths = new Set(["/", "/index.html", "/styles.css", "/config.js", "/api.js", "/app.js"]);
  if (!cacheablePaths.has(url.pathname)) {
    event.respondWith(fetch(req));
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      });
    })
  );
});
