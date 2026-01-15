const CACHE_NAME = "expense-manager-v2";
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./logo.svg",
    "./manifest.json"
];

// Install: Cache Static Assets
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Network First for HTML, Stale-While-Revalidate for Assets
// self.addEventListener("fetch", (event) => {
//     const url = new URL(event.request.url);

//     // Ignore Firestore/Firebase API calls (handled by SDK persistence)
//     if (url.origin.includes('googleapis.com') || url.origin.includes('firebase')) {
//         return;
//     }

//     // HTML Navigation: Network First -> Cache Fallback
//     // This ensures we get new versions of index.html, but works offline
//     if (event.request.mode === 'navigate') {
//         event.respondWith(
//             fetch(event.request)
//                 .catch(() => caches.match("./index.html"))
//         );
//         return;
//     }

//     // Assets (JS, CSS, Images): Stale-While-Revalidate
//     // Try to use cache first (fast), but update it in background
//     event.respondWith(
//         caches.match(event.request).then((cachedResponse) => {
//             const fetchPromise = fetch(event.request).then((networkResponse) => {
//                 // Update cache with new version
//                 if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
//                     const responseToCache = networkResponse.clone();
//                     caches.open(CACHE_NAME).then((cache) => {
//                         cache.put(event.request, responseToCache);
//                     });
//                 }
//                 return networkResponse;
//             });
//             return cachedResponse || fetchPromise;
//         })
//     );
// });

self.addEventListener("fetch", (event) => {
    // 1. FIX: Ignore Extensions & Non-HTTP schemes
    // This prevents the "Request scheme 'chrome-extension' is unsupported" error
    if (!event.request.url.startsWith('http')) {
        return;
    }

    const url = new URL(event.request.url);

    // 2. Ignore Firestore/Firebase API calls
    if (url.origin.includes('googleapis.com') || url.origin.includes('firebase')) {
        return;
    }

    // 3. HTML Navigation: Network First -> Cache Fallback
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match("./index.html"))
        );
        return;
    }

    // 4. Assets: Stale-While-Revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Ensure we only cache valid responses
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // If offline, errors are expected here
            });
            
            // Keep SW alive for the update
            event.waitUntil(fetchPromise);

            return cachedResponse || fetchPromise;
        })
    );
});