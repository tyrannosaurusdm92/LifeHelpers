/* LifeHelpers Arcade installable web app shell.
 * Stores only small launcher resources; individual games may require internet.
 */
const CACHE = "lifehelpers-arcade-shell-2026-11-19-v1";
const CORE = [
  "./", "./index.html", "./manifest.json", "./css/main.css",
  "./js/main.js", "./js/arcade-cloud.js", "./icon-192.png", "./icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key =>
      key.startsWith("lifehelpers-arcade-shell-") && key !== CACHE
    ).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Never cache Google Apps Script API.
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  const path = url.pathname.slice(scope.pathname.length);
  const shell = path === "" || path === "index.html";
  const smallAsset = /^(?:manifest\.json|css\/main\.css|js\/main\.js|js\/arcade-cloud\.js|icon-192\.png|icon-512\.png)$/.test(path);
  if (!shell && !smallAsset) return; // Do not fill device storage with giant game HTML.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cached = await cache.match(request, { ignoreSearch: shell });
      if (cached) return cached;
      throw error;
    }
  })());
});
