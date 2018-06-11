const STATIC_CACHE = 'rr-precache';
const STATIC_CACHE_PATHS = [
  "./",
  "./index.html",
  "./restaurant.html",
  "./scripts/dbhelper.js",
  "./scripts/main.js",
  "./scripts/restaurant_info.js",
  "./scripts/sw-register.js",
  "./styles/main.css",
  "./favicon.ico"
];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', evt => {
  console.log('[RR-PRECACHE] The service worker is being installed.');
  evt.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_CACHE_PATHS))
      .then(() => {
        console.log('[RR-PRECACHE] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

//allow sw to control of current page
self.addEventListener('activate', evt => {
  console.log('[RR-PRECACHE] Claiming clients for current page');
  return self.clients.claim();
});

self.addEventListener('fetch', evt => {
  const requestUrl = new URL(evt.request.url);
  console.log('[RR-PRECACHE] The service worker is serving the asset.' + requestUrl);
  if (evt.request.url.startsWith(self.location.origin)) {
    if (requestUrl.pathname.endsWith('restaurant.html')) {
      evt.respondWith(fromCacheOrNetwork(requestUrl.pathname, evt.request));
      return;
    }
    if (requestUrl.pathname.includes('/images/') && !requestUrl.pathname.endsWith('x200.jpg')) {
      evt.respondWith(fetchFeatureImage(evt.request));
      return;
    }
    evt.respondWith(
      caches
        .match(evt.request)
        .then(response => {
          return response || fetch(evt.request).then(networkResponse => {
            return caches.open(STATIC_CACHE)
              .then(cache => cache.put(evt.request, networkResponse.clone()))
              .then(() => networkResponse);
          })
        })
    );
  }
});

function fetchFeatureImage(request) {
  return caches
    .match(request)
    .then(response => {
      return response || fetch(request).then(networkResponse => {
        return caches
          .open(STATIC_CACHE)
          .then(cache => cache.put(request, networkResponse.clone()))
          .then(() => networkResponse);

      }).catch(() => {
        const thumbnailName = new URL(request.url).pathname.replace('.jpg', 'x200.jpg');
        return caches
          .match(thumbnailName)
          .then(thumbnailResponse => thumbnailResponse);
      })
    });
}

function fromCacheOrNetwork(path, request) {
  return caches
    .match(path)
    .then(response => {
      return response || fetch(request).then(networkResponse => {
        return caches.open(STATIC_CACHE)
          .then(cache => cache.put(path, networkResponse.clone()))
          .then(() => networkResponse);
      })
    });
}
