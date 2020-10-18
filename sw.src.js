const CACHE_NS = "potprox"; // Never change the namespace to be able to clear old versions’ caches
const CACHE_VERSION = "{{PACKAGE_VERSION}}";
const CACHE_NAME = `${CACHE_NS}-v${CACHE_VERSION}`;

let cachedFiles = [
    "/potprox/",
    "/potprox/index.html",
    "/potprox/app-icons/favicon.png",
    "/potprox/app-icons/apple-touch-icon.png",
    "/potprox/app-icons/icon-48.png",
    "/potprox/app-icons/icon-192.png",
    "/potprox/app-icons/icon-512.png",
    "/potprox/app-icons/maskable-icon.png",
    "/potprox/css/main.css",
    "/potprox/img/buckingham.svg",
    "/potprox/img/lennard-jones.svg",
    "/potprox/img/morse.svg",
    "/potprox/img/rydberg.svg",
    "/potprox/img/varshni3.svg",
    "/potprox/js/main.min.js"
];

async function cacheAll() {
    let cache = await caches.open(CACHE_NAME);
    return cache.addAll(cachedFiles);
}

async function cleanup() {
    let cacheKeys = await caches.keys();
    let unusedCacheKeys = cacheKeys.filter(key => key.startsWith(CACHE_NS) && key !== CACHE_NAME);
    return Promise.all(unusedCacheKeys.map(key => caches.delete(key)));
}

async function handleRequest(request) {
    let response = await caches.match(request);
    if (response) {
        return response;
    }
    response = await fetch(request);
    if (!response || response.status !== 200 || response.type !== "basic") {
        return response;
    }
    let cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
}

self.addEventListener("install", e => {
    e.waitUntil(cacheAll());
});

self.addEventListener("activate", e => {
    e.waitUntil(cleanup());
});

self.addEventListener("fetch", e => {
    e.respondWith(handleRequest(e.request));
});
