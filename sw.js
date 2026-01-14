const CACHE_NAME = "expense-manager-v1";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // console.log("SW: Caching assets");
            return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
                // console.error("SW: Failed to cache", err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    // Simple Network-First Strategy to ensure fresh code
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
