const CACHE_NAME = 'cliff-de-tech-v2'; // Bumped cache name
const urlsToCache = [
  '/',
  '/index.html',
  '/about.html',
  '/portfolio.html',
  '/skills.html',
  '/contact.html',
  '/CSS/style.css?v=1.3',
  '/CSS/web-category.css?v=1.1',
  '/JS/main.js?v=1.1',
  '/JS/web-category.js?v=1.1',
  '/JS/web-scroll.js?v=1.1',
  '/assets/logo.webp',
  '/assets/me.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); 
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});