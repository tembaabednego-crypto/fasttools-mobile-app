const CACHE_NAME = "fasttools-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./config.js",
  "./api.js",
  "./app.js",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
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
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isHtml =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html") ||
    url.pathname.endsWith(".html");
  const isStaticCode =
    url.pathname.endsWith(".js") || url.pathname.endsWith(".css") || url.pathname.endsWith(".json");

  // Never interfere with cross-origin requests (e.g., API calls to Render).
  if (!sameOrigin) return;

  event.respondWith(
    (async () => {
      // Network-first for HTML/JS/CSS so deploys update immediately.
      if (isHtml || isStaticCode) {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, fresh.clone());
          return fresh;
        } catch (_) {
          const cached = await caches.match(req);
          if (cached) return cached;
          return fetch(req);
        }
      }

      // Cache-first for other same-origin assets.
      const cached = await caches.match(req);
      if (cached) return cached;
      const fresh = await fetch(req);
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, fresh.clone());
      return fresh;
    })()
  );
});
