/* Savanski Studio PWA service worker. Keep at repository root so its default scope covers studio.html and all runtime folders. */
'use strict';
const VERSION='savanski-studio-v10-2026-10-09';
const SHELL_CACHE=`${VERSION}-shell`;
const RUNTIME_CACHE=`${VERSION}-runtime`;
const SHELL=[
  './studio.html',
  './manifest.webmanifest',
  './assets/app/icon-32.png',
  './assets/app/icon-64.png',
  './assets/app/icon-128.png',
  './assets/app/icon-180.png',
  './assets/app/icon-192.png',
  './assets/app/icon-256.png',
  './assets/app/icon-512.png',
  './css/studio.css',
  './css/single-shell.css',
  './css/toolbar_menus.css',
  './css/settings.css',
  './css/authoritative-toolbar-integration.css',
  './js/backend-config.js',
  './css/advanced-suite.css',
  './js/savanski-wasm-suite.js',
  './js/advanced-brushes.js',
  './js/advanced-image-lab.js',
  './js/advanced-3d-surfaces.js',
  './json/brush-library.json',
  './script/savanski-raster-fx.wasm',
  './script/savanski-geometry.wasm',
  './js/backend-api.js',
  './js/settings.js',
  './js/storage.js',
  './js/project-library.js',
  './js/pwa-runtime.js',
  './js/professional-pass6-wasm.js',
  './js/art-professional-pass6.js',
  './js/uniform3d-professional-pass6.js',
  './script/savanski-pass6-kernel.wasm',
  './js/professional-pass7-wasm.js',
  './js/art-professional-pass7.js',
  './js/uniform3d-professional-pass7.js',
  './script/savanski-pass7-kernel.wasm',
  './js/professional-pass8-wasm.js',
  './js/art-professional-pass8.js',
  './js/art-google-drawings-pass9.js',
  './js/uniform3d-professional-pass8.js',
  './script/savanski-pass8-kernel.wasm'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(n=>n.startsWith('savanski-studio-')&&n!==SHELL_CACHE&&n!==RUNTIME_CACHE).map(n=>caches.delete(n)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});
function sameOrigin(request){try{return new URL(request.url).origin===self.location.origin}catch{return false}}
async function networkFirst(request){
  const cache=await caches.open(RUNTIME_CACHE);
  try{const response=await fetch(request);if(response&&response.ok)cache.put(request,response.clone());return response}catch(err){return (await cache.match(request))||(await caches.match('./studio.html'))||Response.error()}
}
async function staleWhileRevalidate(request){
  const cache=await caches.open(RUNTIME_CACHE),cached=await cache.match(request);
  const network=fetch(request).then(response=>{if(response&&response.ok)cache.put(request,response.clone());return response}).catch(()=>null);
  return cached||(await network)||Response.error();
}
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||!sameOrigin(request)||request.headers.has('range'))return;
  if(request.mode==='navigate'){event.respondWith(networkFirst(request));return;}
  event.respondWith(staleWhileRevalidate(request));
});
