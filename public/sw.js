const CACHE_NAME = "infinia-bharat-news-v6";

const STATIC_CACHE = [
  "/",
  "/site.webmanifest",
];

// ======================================================
// CONSTANTS
// ======================================================

const SITE_URL =
  "https://infiniabharatnews.vercel.app";

const DEFAULT_ICON =
  `${SITE_URL}/icons/favicon-192x192.webp`;

const DEFAULT_BADGE =
  `${SITE_URL}/icons/favicon-192x192.webp`;

// ======================================================
// INSTALL
// ======================================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(STATIC_CACHE)
      )
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
      .then(() =>
        self.clients.claim()
      )
  );
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

  // Same origin only
  if (
    url.origin !==
    self.location.origin
  ) {
    return;
  }

  // Never interfere with APIs
  if (
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Never interfere with Next.js internals
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
          if (
            response &&
            response.ok
          ) {
            const clone =
              response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) =>
                cache.put(
                  request,
                  clone
                )
              )
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

          return fetch(request).then(
            (response) => {
              if (
                response &&
                response.ok
              ) {
                const clone =
                  response.clone();

                caches
                  .open(CACHE_NAME)
                  .then((cache) =>
                    cache.put(
                      request,
                      clone
                    )
                  )
                  .catch(() => {});
              }

              return response;
            }
          );
        })
    );

    return;
  }
});

// ======================================================
// PUSH NOTIFICATION
// ======================================================

self.addEventListener(
  "push",
  (event) => {
    event.waitUntil(
      handlePushNotification(event)
    );
  }
);

// ======================================================
// HANDLE PUSH
// ======================================================

async function handlePushNotification(
  event
) {
  let data = {};

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (error) {
    console.error(
      "Push notification JSON parse failed:",
      error
    );

    try {
      data = {
        title:
          "INFINIA BHARAT NEWS",

        body:
          event.data?.text() ||
          "नई खबर उपलब्ध है।",

        type: "custom",
      };
    } catch {
      data = {
        title:
          "INFINIA BHARAT NEWS",

        body:
          "नई खबर उपलब्ध है।",

        type: "custom",
      };
    }
  }

  const type =
    String(
      data.type || "custom"
    ).toLowerCase();

  // ====================================================
  // COMMON DATA
  // ====================================================

  const title =
    String(
      data.title ||
        "INFINIA BHARAT NEWS"
    );

  const body =
    String(
      data.body ||
        "नई खबर उपलब्ध है।"
    );

  const targetUrl =
    normalizeUrl(
      data.url ||
        SITE_URL
    );

  const icon =
    normalizeUrl(
      data.icon ||
        DEFAULT_ICON
    );

  const badge =
    normalizeUrl(
      data.badge ||
        DEFAULT_BADGE
    );

  const image =
    data.image
      ? normalizeUrl(data.image)
      : "";

  const category =
    String(
      data.category || ""
    );

  const tag =
    String(
      data.tag ||
        `infinia-${type}`
    );

  // ====================================================
  // BASE OPTIONS
  // ====================================================

  const options = {
    body,

    icon,

    badge,

    tag,

    renotify: true,

    lang: "hi-IN",

    data: {
      url: targetUrl,

      type,

      category,

      image,

      title,

      body,

      // Structured notification data
      notification: {
        type,

        category,

        image,

        title,

        body,

        url: targetUrl,
      },
    },
  };

  // ====================================================
  // 📰 ARTICLE
  // ====================================================

  if (
    type === "article"
  ) {
    options.body =
      buildArticleBody(
        category,
        body
      );

    if (image) {
      options.image = image;
    }

    options.actions = [
      {
        action: "read-story",
        title: "Read Story",
      },
    ];

    options.data.cta =
      "Read Story";
  }

  // ====================================================
  // 🔴 BREAKING NEWS
  // ====================================================

  else if (
    type === "breaking"
  ) {
    options.body =
      buildBreakingBody(
        body
      );

    if (image) {
      options.image = image;
    }

    options.requireInteraction =
      true;

    options.actions = [
      {
        action: "open-breaking",
        title: "Open Breaking News",
      },
    ];

    options.data.cta =
      "Open Breaking News";
  }

  // ====================================================
  // ▶️ VIDEO
  // ====================================================

  else if (
    type === "video" ||
    type === "reel"
  ) {
    options.body =
      buildVideoBody(
        body
      );

    if (image) {
      options.image = image;
    }

    options.actions = [
      {
        action: "watch-video",
        title: "▶ Watch Video",
      },
    ];

    options.data.cta =
      "Watch Video";
  }

  // ====================================================
  // 📢 CUSTOM / EVENT
  // ====================================================

  else if (
    type === "custom" ||
    type === "event"
  ) {
    if (image) {
      options.image = image;
    }

    options.actions = [
      {
        action: "open-custom",
        title:
          data.cta ||
          "Open",
      },
    ];

    options.data.cta =
      data.cta ||
      "Open";
  }

  // ====================================================
  // 🎨 CUSTOM CARD
  // ====================================================

  else if (
    type === "custom-card" ||
    type === "html"
  ) {
    if (image) {
      options.image = image;
    }

    options.actions = [
      {
        action: "open-card",
        title:
          data.cta ||
          "View Details",
      },
    ];

    options.data.cta =
      data.cta ||
      "View Details";

    options.data.heading =
      data.heading ||
      title;

    options.data.description =
      data.description ||
      body;
  }

  // ====================================================
  // FALLBACK
  // ====================================================

  else {
    if (image) {
      options.image = image;
    }

    options.actions = [
      {
        action: "open",
        title: "Open",
      },
    ];

    options.data.cta =
      "Open";
  }

  // ====================================================
  // SHOW
  // ====================================================

  try {
    await self.registration.showNotification(
      title,
      options
    );
  } catch (error) {
    console.error(
      "Notification display failed:",
      error
    );

    // Very safe fallback
    await self.registration.showNotification(
      title,
      {
        body,
        icon,
        badge,
        tag,
        data: {
          url: targetUrl,
          type,
        },
      }
    );
  }
}

// ======================================================
// ARTICLE BODY
// ======================================================

function buildArticleBody(
  category,
  description
) {
  const cleanDescription =
    String(
      description || ""
    ).trim();

  if (category) {
    return `📰 ${category} • ${cleanDescription}`;
  }

  return cleanDescription;
}

// ======================================================
// BREAKING BODY
// ======================================================

function buildBreakingBody(
  description
) {
  return `🔴 BREAKING NEWS • ${String(
    description || ""
  ).trim()}`;
}

// ======================================================
// VIDEO BODY
// ======================================================

function buildVideoBody(
  description
) {
  return `▶️ ${String(
    description || ""
  ).trim()}`;
}

// ======================================================
// URL NORMALIZER
// ======================================================

function normalizeUrl(
  value
) {
  try {
    const url =
      new URL(
        String(value)
      );

    // Only HTTPS / HTTP
    if (
      url.protocol !==
        "https:" &&
      url.protocol !==
        "http:"
    ) {
      return SITE_URL;
    }

    return url.href;
  } catch {
    return SITE_URL;
  }
}

// ======================================================
// NOTIFICATION CLICK
// ======================================================

self.addEventListener(
  "notificationclick",
  (event) => {
    event.notification.close();

    // --------------------------------------------------
    // CLOSE
    // --------------------------------------------------

    if (
      event.action ===
      "close"
    ) {
      return;
    }

    const data =
      event.notification.data ||
      {};

    const targetUrl =
      normalizeUrl(
        data.url ||
          SITE_URL
      );

    event.waitUntil(
      openNotificationUrl(
        targetUrl
      )
    );
  }
);

// ======================================================
// OPEN NOTIFICATION URL
// ======================================================

async function openNotificationUrl(
  targetUrl
) {
  const clientList =
    await clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

  // Prefer existing INFINIA tab
  for (
    const client of clientList
  ) {
    try {
      const clientUrl =
        new URL(
          client.url
        );

      const target =
        new URL(
          targetUrl
        );

      if (
        clientUrl.origin ===
        target.origin
      ) {
        await client.navigate(
          target.href
        );

        return client.focus();
      }
    } catch {
      // Continue
    }
  }

  // Open new tab/window
  return clients.openWindow(
    targetUrl
  );
}