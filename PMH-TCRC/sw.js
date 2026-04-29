const CACHE_VERSION = "v1";

self.addEventListener("fetch", (event) => {
    event.respondWith(handleRequest(event));
});

self.addEventListener("activate", (event) => {
    console.log("activate")
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.forEach((cacheName) => {
                    if (cacheName == CACHE_VERSION) return;
                    console.log("deleting:" + cacheName);
                    return caches.delete(cacheName);
                })
            );
        })
    );
    self.clients.claim();
});
self.addEventListener("install", (event) => {
    console.log("install")
});

async function handleRequest(event) {
    const response = await getFromCache(event);
    if (response) {
        fetchAndCache(event); // Call this but don't await, allowing the cache to update in the background
        return response;
    }
    return fetchAndCache(event);
}

async function getFromCache(event) {
    const request = event.request;
    const cache = await caches.open(CACHE_VERSION);
    const response = await cache.match(request);
    return response;
}

async function fetchAndCache(event) {
    const request = event.request;
    const response = await fetch(request);
    if (response.status === 200) {
        // Only cache successful responses
        if (request.url.split("/").indexOf("media") != -1) {
            // Do not cache media
            return;
        }
        const cache = await caches.open(CACHE_VERSION);
        cache.put(request, response.clone());
    }
    return response;
}
