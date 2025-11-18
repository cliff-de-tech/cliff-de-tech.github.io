const CACHE_NAME = 'cliff-de-tech-v1';
const urlsToCache = [
  '/',
  '/CSS/style.css',
  '/JS/main.js',
  '/assets/logo.webp',
  '/assets/me.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});