const CACHE_NAME = "infinia-bharat-news-v3";

const STATIC_CACHE = [
  "/",
  "/site.webmanifest",
];

// ======================================================
// INSTALL
// ======================================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE);
      })
      .catch((error) => {
        console.error(
          "Service Worker cache install failed:",
          error
        );
      })
  );

  self.skipWaiting();
});

// ======================================================
// ACTIVATE
// ======================================================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) =>
                name.startsWith(
                  "infinia-bharat-news-"
                ) &&
                name !== CACHE_NAME
            )
            .map((name) =>
              caches.delete(name)
            )
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// ======================================================
// FETCH
// ======================================================

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Only handle same-origin requests
  if (
    url.origin !==
    self.location.origin
  ) {
    return;
  }

  // ====================================================
  // NEVER INTERCEPT API / FIREBASE
  // ====================================================

  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes(
      "firebaseio.com"
    ) ||
    url.hostname.includes(
      "googleapis.com"
    )
  ) {
    return;
  }

  // ====================================================
  // NEVER INTERCEPT NEXT INTERNAL REQUESTS
  // ====================================================

  if (
    url.pathname.startsWith(
      "/_next/"
    ) ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  // ====================================================
  // PAGE NAVIGATION
  // NETWORK FIRST
  // ====================================================

  if (
    request.mode === "navigate"
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (
            response &&
            response.ok
          ) {
            const clone =
              response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put(
                  request,
                  clone
                );
              })
              .catch(() => {});
          }

          return response;
        })
        .catch(async () => {
          const cached =
            await caches.match(
              request
            );

          if (cached) {
            return cached;
          }

          const home =
            await caches.match("/");

          if (home) {
            return home;
          }

          return new Response(
            "Offline",
            {
              status: 503,
              headers: {
                "Content-Type":
                  "text/plain; charset=utf-8",
              },
            }
          );
        })
    );

    return;
  }

  // ====================================================
  // STATIC ASSETS
  // CACHE FIRST
  // ====================================================

  const isStaticAsset =
    url.pathname.startsWith(
      "/icons/"
    ) ||
    /\.(png|jpg|jpeg|webp|svg|gif|ico|woff|woff2)$/i.test(
      url.pathname
    );

  if (isStaticAsset) {
    event.respondWith(
      caches
        .match(request)
        .then((cached) => {
          if (cached) {
            return cached;
          }

          return fetch(request)
            .then((response) => {
              if (
                response &&
                response.ok
              ) {
                const clone =
                  response.clone();

                caches
                  .open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(
                      request,
                      clone
                    );
                  })
                  .catch(() => {});
              }

              return response;
            });
        })
    );

    return;
  }

  // ====================================================
  // EVERYTHING ELSE
  // LET BROWSER HANDLE IT
  // ====================================================
});