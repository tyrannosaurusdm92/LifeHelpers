/* OurSpace PWA service worker
 * Keep this file in the same folder as ourspace.html on GitHub Pages.
 * Authenticated session/account responses are NEVER cached here. The Apps Script backend is always network-only; packaged static JSON may be cached as app assets.
 */
'use strict';

const CACHE_VERSION = 'ourspace-pwa-v17.4.1-backend-preserved-1';
const RUNTIME_CACHE = 'ourspace-runtime-v17.4.1-backend-preserved-1';
const ROOT = new URL('./', self.location.href);
const DEVICE_SETTINGS_DB = 'ourspace-device-alert-settings-v1';
const DEVICE_SETTINGS_STORE = 'settings';

function openDeviceSettingsDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DEVICE_SETTINGS_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DEVICE_SETTINGS_STORE)) db.createObjectStore(DEVICE_SETTINGS_STORE, { keyPath: 'profileKey' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open device settings storage.'));
  });
}

async function writeDeviceAlertSettings(profileKey, settings) {
  profileKey = String(profileKey || '').toLowerCase().trim();
  if (!profileKey) return;
  const kinds = settings?.kinds && typeof settings.kinds === 'object' ? settings.kinds : {};
  const normalized = {
    profileKey,
    sound: settings?.sound === true,
    appBadge: settings?.appBadge !== false,
    calls: settings?.calls !== false,
    systemNotifications: settings?.systemNotifications === true,
    onyxAlerts: settings?.onyxAlerts === true,
    badgeCount: Math.max(0, Number(settings?.badgeCount) || 0),
    kinds: {
      messages: kinds.messages !== false,
      tasks: kinds.tasks !== false,
      appointments: kinds.appointments !== false,
      reminders: kinds.reminders !== false,
            other: kinds.other !== false
    },
    updatedAt: new Date().toISOString()
  };
  const db = await openDeviceSettingsDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(DEVICE_SETTINGS_STORE, 'readwrite');
    tx.objectStore(DEVICE_SETTINGS_STORE).put(normalized);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Unable to save device settings.'));
    tx.onabort = () => reject(tx.error || new Error('Device settings save was aborted.'));
  });
  db.close();
  try {
    if (normalized.appBadge === false && self.navigator?.clearAppBadge) await self.navigator.clearAppBadge();
  } catch (_) {}
}

async function readDeviceAlertSettings(profileKey) {
  profileKey = String(profileKey || '').toLowerCase().trim();
  if (!profileKey) return null;
  try {
    const db = await openDeviceSettingsDb();
    const value = await new Promise((resolve, reject) => {
      const tx = db.transaction(DEVICE_SETTINGS_STORE, 'readonly');
      const request = tx.objectStore(DEVICE_SETTINGS_STORE).get(profileKey);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Unable to read device settings.'));
    });
    db.close();
    return value;
  } catch (_) { return null; }
}

const PRECACHE_URLS = [
  new URL('ourspace.html', ROOT).href,
  new URL('css/ourspace.css', ROOT).href,
  new URL('js/profile-feed-host.js', ROOT).href,
  new URL('js/profile-feed-audio-engine.js', ROOT).href,
  new URL('js/profile-feed-metadata.js', ROOT).href,
  new URL('js/profile-feed-bulletin.js', ROOT).href,
  new URL('js/profile-feed-system.js', ROOT).href,
  new URL('js/profile-feed-player.js', ROOT).href,
  new URL('js/ourspace-page-design.js', ROOT).href,
  new URL('js/profile-feed-public-sync.js', ROOT).href,
  new URL('json/profile-feed-identity-options.json', ROOT).href,
  new URL('json/profile-feed-tracks.json', ROOT).href,
  new URL('js/ourspace-backend.js', ROOT).href,
  new URL('js/ourspace-app.js', ROOT).href,
  new URL('js/ourspace-public-visitor.js', ROOT).href,
  new URL('js/ourspace-social.js', ROOT).href,
  new URL('js/ourspace-notifications.js', ROOT).href,
  new URL('js/ourspace-onyx-alerts.js', ROOT).href,
  new URL('js/ourspace-onyx-overlay.js', ROOT).href,
  new URL('js/ourspace-account-settings.js', ROOT).href,
  new URL('js/ourspace-camera-plus.js', ROOT).href,
  new URL('js/ourspace-call-suite.js', ROOT).href,
  new URL('js/ourspace-social-expanded.js', ROOT).href,
  new URL('js/ourspace-rich-links.js', ROOT).href,
  new URL('js/ourspace-communication-media.js', ROOT).href,
  new URL('js/ourspace-calls.js', ROOT).href,
  new URL('js/ourspace-repo.js', ROOT).href,
  new URL('js/ourspace-store.js', ROOT).href,
  new URL('js/ourspace-access.js', ROOT).href,
  new URL('js/ourspace-module-bridge.js', ROOT).href,
  new URL('js/ourspace-module-hosts.js', ROOT).href,
  new URL('js/ourspace-journal-module.js', ROOT).href,
  new URL('js/ourspace-journal-accessibility.js', ROOT).href,
  new URL('js/ourspace-diary-cards.js', ROOT).href,
  new URL('js/ourspace-media-player-module.js', ROOT).href,
  new URL('js/ourspace-visual-player-module.js', ROOT).href,
  new URL('js/ourspace-currency-module.js', ROOT).href,
  new URL('js/ourspace-game-bridge.js', ROOT).href,
  new URL('js/ourspace-favorite-games.js', ROOT).href,
  new URL('js/ourspace-onyx-hooks.js', ROOT).href,
  new URL('css/ourspace-onyx-overlay.css', ROOT).href,
  new URL('assets/code/onyx.html', ROOT).href,
  new URL('assets/code/william.html', ROOT).href,
  new URL('assets/code/jasper.html', ROOT).href,
  new URL('js/ourspace-onyx-embed-bridge.js', ROOT).href,
  new URL('js/ourspace-module-integration.js', ROOT).href,
  new URL('js/ourspace-unified-pages.js', ROOT).href,
  new URL('js/ourspace-profile.js', ROOT).href,
  new URL('assets/images/Logo_Ourspace.png', ROOT).href,
  new URL('json/jasper-store.json', ROOT).href,
  new URL('json/william-store.json', ROOT).href,
  new URL('json/shared-module-registry.json', ROOT).href,
  new URL('json/shared-game-bridge.json', ROOT).href,
  new URL('manifest.webmanifest', ROOT).href,
  new URL('js/ourspace-pwa.js', ROOT).href,
  new URL('js/ourspace-profile-sync.js', ROOT).href,
  new URL('assets/images/ourspace-icon-192.png', ROOT).href,
  new URL('assets/images/ourspace-icon-512.png', ROOT).href,
  new URL('assets/images/ourspace-icon-maskable-512.png', ROOT).href,
  new URL('assets/images/ourspace-apple-touch-icon.png', ROOT).href,
  new URL('assets/audio/message-received.wav', ROOT).href,
  new URL('assets/audio/message-sent.wav', ROOT).href,
  new URL('assets/audio/incoming-call.wav', ROOT).href,
  new URL('assets/audio/call-start.wav', ROOT).href,
  new URL('assets/audio/call-end.wav', ROOT).href,
  new URL('assets/audio/alarm-reminder.wav', ROOT).href,
  new URL('assets/audio/task.wav', ROOT).href,
  new URL('assets/audio/appointment.wav', ROOT).href
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([CACHE_VERSION, RUNTIME_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;
  if (event.data.type === 'OURSPACE_SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'OURSPACE_CLEAR_RUNTIME_CACHE') {
    event.waitUntil(caches.delete(RUNTIME_CACHE));
  }
  if (event.data.type === 'OURSPACE_DEVICE_ALERT_SETTINGS') {
    event.waitUntil(writeDeviceAlertSettings(event.data.profileKey, event.data.settings || {}));
  }
  if (event.data.type === 'OURSPACE_ONYX_ALERT_SETTINGS') {
    event.waitUntil((async () => {
      const current = await readDeviceAlertSettings(event.data.profileKey) || {};
      await writeDeviceAlertSettings(event.data.profileKey, { ...current, onyxAlerts: event.data.enabled === true });
    })());
  }
  if (event.data.type === 'OURSPACE_BADGE_SYNC') {
    event.waitUntil((async () => {
      const current = await readDeviceAlertSettings(event.data.profileKey) || {};
      await writeDeviceAlertSettings(event.data.profileKey, { ...current, badgeCount: Math.max(0, Number(event.data.count) || 0) });
    })());
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Never cache POSTs, auth calls, sync calls, uploads, or any other non-GET request.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cross-origin resources — including the Google Apps Script backend — stay network-only.
  // This prevents private profile data/session responses from becoming service-worker cache entries.
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // Navigation: network first so GitHub Pages updates appear quickly, offline shell as fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const exact = await caches.match(request);
          if (exact) return exact;
          return caches.match(new URL('ourspace.html', ROOT).href);
        })
    );
    return;
  }

  // Same-origin static files: serve cached copy immediately, refresh in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const update = fetch(request).then((response) => {
        if (response && response.ok && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || update;
    })
  );
});


/* Web Push is optional in the tested backend contract. This worker is ready to
 * display standards-based push payloads when the existing backend/gateway has a
 * subscription. No notification payload is cached. */
function normalizePushPayload(event) {
  if (!event.data) return {};
  try { return event.data.json() || {}; }
  catch (_) { try { return { body: event.data.text() }; } catch (_) { return {}; } }
}

function pushKindCategory(kind) {
  const value = String(kind || '').toLowerCase();
  if (/^call\.|incoming[-_. ]?call|video[-_. ]?call/.test(value)) return 'calls';
  if (/messenger|message|chat/.test(value)) return 'messages';
  if (/appointment|calendar/.test(value)) return 'appointments';
  if (/task|todo|to-do/.test(value)) return 'tasks';
  if (/reminder|alarm|organizer|selfcare|self-care/.test(value)) return 'reminders';
  return 'other';
}

function pushKindEnabled(settings, kind) {
  const category = pushKindCategory(kind);
  if (category === 'calls') return settings?.calls !== false;
  return settings?.kinds?.[category] !== false;
}

function defaultNotificationTarget(kind) {
  if (/onyx|self[-_. ]?care|virtual[-_. ]?pet|pet[-_. ]?care/i.test(String(kind || ''))) return './ourspace.html#about';
  const category = pushKindCategory(kind);
  if (category === 'tasks' || category === 'appointments' || category === 'reminders') return './ourspace.html#household';
  return './ourspace.html#communication';
}

self.addEventListener('push', (event) => {
  const raw = normalizePushPayload(event);
  event.waitUntil((async () => {
    const n = raw.notification && typeof raw.notification === 'object' ? raw.notification : raw;
    const title = String(n.title || n.subject || 'OurSpace');
    const body = String(n.body || n.message || 'You have a new OurSpace alert.').slice(0, 500);
    const kind = String(n.kind || raw.kind || 'alert');
    const profileKey = String(n.profileKey || raw.profileKey || n.data?.profileKey || raw.data?.profileKey || '').toLowerCase();
    const deviceSettings = await readDeviceAlertSettings(profileKey);

    // Device-local controls are a second line of defense. The backend also filters
    // alertKinds per subscription, but an already queued/stale push should still
    // respect what this particular browser/app has disabled.
    if (deviceSettings?.systemNotifications === false) return;
    if (/onyx|self[-_. ]?care|virtual[-_. ]?pet|pet[-_. ]?care/i.test(kind) && deviceSettings?.onyxAlerts !== true) return;
    if (!pushKindEnabled(deviceSettings, kind)) return;

    const tag = String(n.tag || raw.id || raw.notificationId || `ourspace-${kind}`);
    const target = String(n.url || raw.url || defaultNotificationTarget(kind));
    const options = {
      body,
      icon: new URL('assets/images/ourspace-icon-192.png', ROOT).href,
      badge: new URL('assets/images/ourspace-icon-192.png', ROOT).href,
      tag,
      renotify: Boolean(n.renotify),
      silent: deviceSettings?.sound === false || n.sound === false || n.silent === true,
      data: { ...(n.data && typeof n.data === 'object' ? n.data : {}), url: target, kind, profileKey }
    };

    await self.registration.showNotification(title, options);
    if (deviceSettings?.appBadge !== false) {
      try {
        const badgeCount = Math.max(1, Number(deviceSettings?.badgeCount || 0) + 1);
        await writeDeviceAlertSettings(profileKey, { ...deviceSettings, badgeCount });
        if (self.navigator?.setAppBadge) await self.navigator.setAppBadge(badgeCount);
      } catch (_) {}
    }
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: 'OURSPACE_PUSH_RECEIVED', payload: { title, body, kind, tag, profileKey } }));
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const requested = event.notification?.data?.url || './ourspace.html#communication';
  const target = new URL(requested, ROOT).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        try {
          const here = new URL(client.url);
          if (here.origin === self.location.origin && 'focus' in client) {
            await client.focus();
            client.postMessage({ type: 'OURSPACE_NOTIFICATION_OPEN', url: target, kind: event.notification?.data?.kind || 'alert' });
            return;
          }
        } catch (_) {}
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});
