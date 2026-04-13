

const CACHE_NAME = "infinia-bharat-v5";

const APP_SHELL = [
  "/",
  "/index.html"
];

// ðŸ‘‡ IMPORTANT (fix error)
self.addEventListener("message", function (event) {});

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// FETCH
self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(res => res || fetch(request))
  );
});