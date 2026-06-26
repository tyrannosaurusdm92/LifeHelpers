const OURSPACE_CACHE = 'ourspace-pwa-v7-store-adhd';
const CORE_ASSETS = [
  './',
  './OurSpace.html',
  './ourspace.html',
  './william.html',
  './jasper.html',
  './manifest.webmanifest',
  './assets/ourspace-data-catalogs.js',
  './assets/ourspace-embedded-catalogs.js',
  './assets/audio/message-ding.mp3',
  './assets/icons/ourspace-icon-180.png',
  './assets/icons/ourspace-icon-192.png',
  './assets/icons/ourspace-icon-512.png',
  './json/shared/store.json',
  './json/william/store.json',
  './json/jasper/store.json',
  './json/shared/tasks.json',
  './json/william/tasks.json',
  './json/jasper/tasks.json',
  './json/shared/skills.json'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(OURSPACE_CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== OURSPACE_CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.pathname.includes('/json/') || url.pathname.includes('/assets/') || url.pathname.includes('/modules/')){
    event.respondWith(fetch(request).then(response => {
      if(response && response.status === 200){const copy = response.clone(); caches.open(OURSPACE_CACHE).then(cache => cache.put(request, copy));}
      return response;
    }).catch(() => caches.match(request)));
    return;
  }
  if(request.mode === 'navigate'){
    event.respondWith(fetch(request).then(response => {
      const copy = response.clone(); caches.open(OURSPACE_CACHE).then(cache => cache.put(request, copy)); return response;
    }).catch(() => caches.match(request).then(match => match || caches.match('./OurSpace.html'))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if(!response || response.status !== 200) return response;
    const copy = response.clone(); caches.open(OURSPACE_CACHE).then(cache => cache.put(request, copy)); return response;
  }).catch(() => cached)));
});
