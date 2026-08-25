const CACHE_NAME = "infinia-bharat-news-v4";

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
      .then((cache) => cache.addAll(STATIC_CACHE))
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
                name.startsWith("infinia-bharat-news-") &&
                name !== CACHE_NAME
            )
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
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

  // Only same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Don't interfere with API routes
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Don't interfere with Next.js internals / RSC
  if (
    url.pathname.startsWith("/_next/") ||
    url.searchParams.has("_rsc")
  ) {
    return;
  }

  // ====================================================
  // PAGE NAVIGATION — NETWORK FIRST
  // ====================================================

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clone))
              .catch(() => {});
          }

          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);

          if (cached) {
            return cached;
          }

          const home = await caches.match("/");

          if (home) {
            return home;
          }

          return new Response(
            "You are offline. Please check your internet connection.",
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
  // STATIC ASSETS — CACHE FIRST
  // ====================================================

  const isStaticAsset =
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|webp|svg|gif|ico|woff|woff2)$/i.test(
      url.pathname
    );

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          if (response && response.ok) {
            const clone = response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clone))
              .catch(() => {});
          }

          return response;
        });
      })
    );

    return;
  }
});

// ======================================================
// PUSH NOTIFICATIONS
// ======================================================

self.addEventListener("push", (event) => {
  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error(
      "Push notification data parse failed:",
      error
    );

    data = {
      title: "INFINIA BHARAT NEWS",
      body: event.data
        ? event.data.text()
        : "नई खबर उपलब्ध है",
    };
  }

  const title =
    data.title || "INFINIA BHARAT NEWS";

  const options = {
    body:
      data.body ||
      "नई खबर पढ़ने के लिए क्लिक करें।",

    icon:
      data.icon ||
      "/icons/favicon-192x192.webp",

    badge:
      data.badge ||
      "/icons/favicon-192x192.webp",

    tag:
      data.tag || "infinia-news",

    renotify: true,

    requireInteraction: false,

    data: {
      url:
        data.url ||
        "https://infiniabharatnews.vercel.app/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

// ======================================================
// NOTIFICATION CLICK
// ======================================================

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    const targetUrl =
      event.notification?.data?.url ||
      "https://infiniabharatnews.vercel.app/";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then((clientList) => {
          for (const client of clientList) {
            if (
              client.url.startsWith(
                "https://infiniabharatnews.vercel.app"
              )
            ) {
              client.navigate(targetUrl);
              return client.focus();
            }
          }

          return clients.openWindow(targetUrl);
        })
    );
  }
);