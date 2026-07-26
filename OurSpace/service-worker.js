const OURSPACE_CACHE = 'ourspace-20260725-games-pbn-v2';
const CORE_ASSETS = [
  "./ourspace.html",
  "./william.html",
  "./jasper.html",
  "./manifest.webmanifest",
  "./browserconfig.xml",
  "./assets/ourspace-data-catalogs.js",
  "./assets/ourspace-embedded-catalogs.js",
  "./assets/ourspace-user-core.js",
  "./assets/ourspace-user.css",
  "./assets/ourspace-auth.js",
  "./assets/ourspace-auth.css",
  "./json/shared/positive_messages.json",
  "./assets/ourspace-positive-messages.js",
  "./assets/ourspace-revision-20260626.js",
  "./assets/ourspace-revision-20260626.css",
  "./assets/ourspace-brand-font.js",
  "./assets/ourspace-brand-font.css",
  "./assets/ourspace-extensive-audit-fixes.css",
  "./assets/ourspace-extensive-audit-fixes.js",
  "./assets/js/docx-lite-reader.js",
  "./assets/js/journal-module.js",
  "./assets/js/journal-accessibility-addon.js",
  "./assets/css/journal-module.css",
  "./assets/css/journal-accessibility-addon.css",
  "./js/ourspace-visual-player.js",
  "./css/ourspace-visual-player.css",
  "./js/ourspace-media-player.js",
  "./css/ourspace-media-player.css",
  "./assets/legacy-portal-storage.js",
  "./assets/legacy-ourspace-allowed-games.js",
  "./assets/legacy-ourspace-currency-core.js",
  "./assets/legacy-ourspace-game-currency-bridge.js",
  "./assets/legacy-ourspace-game-reward-override.js",
  "./assets/legacy-ourspace-game-rewards.css",
  "./assets/legacy-ourspace-play-to-win-adapter.js",
  "./assets/audio/message-ding.mp3",
  "./assets/icons/ourspace-icon-180.png",
  "./assets/icons/ourspace-icon-192.png",
  "./assets/icons/ourspace-icon-512.png",
  "./assets/icons/ourspace-icon-384.png"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(OURSPACE_CACHE)
      .then(cache => Promise.all(CORE_ASSETS.map(asset => cache.add(asset).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== OURSPACE_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

const OURSPACE_GAME_BUILD = '20260725-games-pbn-v2';
const GAME_SUPPORT_PATHS = new Set([
  '/assets/ourspace-embedded-catalogs.js',
  '/assets/game-reward-rules.json',
  '/assets/legacy-ourspace-allowed-games.js',
  '/assets/legacy-ourspace-currency-core.js',
  '/assets/legacy-ourspace-game-currency-bridge.js',
  '/assets/legacy-ourspace-game-reward-override.js',
  '/assets/legacy-ourspace-game-rewards.css',
  '/assets/legacy-ourspace-play-to-win-adapter.js',
  '/assets/legacy-portal-storage.js'
]);

function isGameResource(url) {
  const path = url.pathname;
  if (path.includes('/modules/games/')) return true;
  if (path.includes('/assets/game-bots/')) return true;
  for (const suffix of GAME_SUPPORT_PATHS) {
    if (path.endsWith(suffix)) return true;
  }
  return false;
}

async function cacheResponse(request, response) {
  if (response && response.status === 200) {
    const cache = await caches.open(OURSPACE_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallback) {
  try {
    const freshRequest = new Request(request, { cache: 'no-store' });
    const response = await fetch(freshRequest);
    return await cacheResponse(request, response);
  } catch (error) {
    return (await caches.match(request)) || fallback || Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (isGameResource(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, caches.match('./ourspace.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => cacheResponse(request, response)).catch(() => cached))
  );
});
