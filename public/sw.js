const CACHE_NAME = "infinia-bharat-news-v2";

const STATIC_CACHE = [
  "/",
  "/site.webmanifest",
];

// ======================================================
// INSTALL
// ======================================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE);
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
                name !== CACHE_NAME
            )
            .map((name) =>
              caches.delete(name)
            )
        );
      })
  );

  self.clients.claim();
});

// ======================================================
// FETCH
// ======================================================

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only GET
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // ====================================================
  // EXTERNAL REQUESTS
  // ====================================================

  if (
    url.origin !==
    self.location.origin
  ) {
    return;
  }

  // ====================================================
  // NEVER CACHE API / FIREBASE
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
  // NEXT INTERNAL REQUESTS
  // ====================================================

  // Let Next.js handle RSC / data requests.
  if (
    url.searchParams.has("_rsc") ||
    url.pathname.startsWith(
      "/_next/"
    )
  ) {
    return;
  }

  // ====================================================
  // HTML PAGES
  //
  // Network first
  // Offline -> cached page
  // ====================================================

  if (
    request.mode === "navigate"
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (
            response &&
            response.status === 200
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
              });
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

          return (
            caches.match("/")
          );
        })
    );

    return;
  }

  // ====================================================
  // STATIC ASSETS
  //
  // Cache first
  // ====================================================

  if (
    url.pathname.startsWith(
      "/_next/static/"
    ) ||
    url.pathname.startsWith(
      "/icons/"
    ) ||
    url.pathname.match(
      /\.(png|jpg|jpeg|webp|svg|gif|ico|woff2?)$/i
    )
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) => {
          if (cached) {
            return cached;
          }

          return fetch(request).then(
            (response) => {
              if (
                response &&
                response.status === 200
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
                  });
              }

              return response;
            }
          );
        }
      )
    );

    return;
  }
});