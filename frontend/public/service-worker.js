// frontend/public/service-worker.js
// Robust Service Worker for Vite/CRA apps (no bundle filename assumptions)

// Cache names (bump CACHE_VERSION to force full re-cache)
const CACHE_VERSION = 'v1';
const PRECACHE = `digi-saarathi-precache-${CACHE_VERSION}`;
const RUNTIME = `digi-saarathi-runtime-${CACHE_VERSION}`;

// Files to precache - keep minimal (no hashed bundle file names)
const PRECACHE_URLS = [
  '/',           // HTML entry
  '/index.html', // ensure SPA fallback works
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Fallback image to use when an image request fails (development helper)
// I placed your uploaded logo in the workspace; in production use '/icons/icon-512.png'.
const FALLBACK_IMAGE = '/icons/icon-512.png'; 
// Replace above with '/icons/icon-512.png' if the file is in public/icons/

self.addEventListener('install', (event) => {
  // Precache core resources
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Activate worker immediately after install
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Utility: safe clone response for caching and return
async function fetchAndCache(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    // Only cache successful same-origin responses
    if (response && response.ok && request.url.startsWith(self.location.origin)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

// Main fetch handler:
// - navigation requests -> network-first with fallback to cached index.html (SPA behavior)
// - API requests (detect /api/) -> network-first (better freshness), fallback to cache
// - other assets (images/scripts/styles) -> network-first with runtime cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Always bypass SW for non-GET requests (POST, PUT, etc.)
  if (request.method !== 'GET') return;

  // SPA navigation requests: network-first, fallback to cached index.html
  // inside service-worker.js (replace current navigation handler)
if (request.mode === 'navigate') {
  event.respondWith(
    fetch(request)
      .then(res => {
        // if server returns non-OK (like 404), return cached index.html instead
        if (!res || !res.ok) {
          return caches.match('/index.html');
        }
        // cache it optionally and return
        caches.open(RUNTIME).then(cache => cache.put(request, res.clone()));
        return res;
      })
      .catch(() => caches.match('/index.html'))
  );
  return;
}


  const url = new URL(request.url);

  // Example: treat API calls specially (adjust the path if your backend uses a different prefix)
  if (url.pathname.startsWith('/api') || url.hostname !== self.location.hostname) {
    // network-first for APIs and cross-origin, fallback to cache
    event.respondWith(
      fetch(request)
        .then((res) => {
          // optionally cache API GET responses if you want:
          if (request.method === 'GET' && res && res.ok && request.url.startsWith(self.location.origin)) {
            caches.open(RUNTIME).then((cache) => cache.put(request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For other resources (images, JS, CSS) use network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // cache successful same-origin responses
        if (response && response.ok && request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // If it's an image, return a fallback image
        if (request.destination === 'image') {
          // Try to return fallback image from cache (if precached)
          const fallback = await caches.match('/icons/icon-512.png');
          if (fallback) return fallback;

          // As a last fallback, try the sandbox path (development helper)
          try {
            return await fetch(FALLBACK_IMAGE);
          } catch (e) {
            return new Response('', { status: 503, statusText: 'offline' });
          }
        }

        return new Response('Offline', { status: 503 });
      })
  );
});

// Message handler: allows clients to trigger skipWaiting (useful when releasing updates)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
