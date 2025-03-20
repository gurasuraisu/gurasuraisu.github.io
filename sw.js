const CACHE_NAME = 'gurasuraisu-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/index.js',
  '/assets',
  '/manifest.json',
  '/assets/favicon.png',
  '/assets/gurasuraisu.png',
  '/assets/appicon/alarm.png',
  '/assets/appicon/calculator.png',
  '/assets/appicon/docs.png',
  '/assets/appicon/music.png',
  '/assets/appicon/notes.png',
  '/assets/appicon/photos.png',
  '/assets/appicon/sketch.png',
  '/assets/appicon/tasks.png',
  '/assets/appicon/video.png'
];

const FONT_URLS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=DynaPuff:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Iansui:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=DotGothic16:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Patrick+Hand:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Rampart+One:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Doto:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0'
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS_TO_CACHE);
      // Fetch and cache fonts separately
      for (const url of FONT_URLS) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.warn('Font caching failed:', url);
        }
      }
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      // Bypass cache for API calls
      if (event.request.url.includes('api.open-meteo.com') || event.request.url.includes('nominatim.openstreetmap.org')) {
        return fetch(event.request).catch(() => caches.match(event.request));
      }

      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await caches.match(event.request);

      if (cachedResponse) {
        // Try fetching a fresh version in the background
        fetch(event.request)
          .then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
          })
          .catch(() => null);
        return cachedResponse;
      }

      // If no cached response, fetch from network
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        return cachedResponse || caches.match('/');
      }
    })()
  );
});
