/* Extracted from OurSpace_DRAFT_Strengthening_V17_3_7.
 * Onyx alerts only: device preferences, Web Push subscription, foreground
 * notification receipt, app badge, and the packaged Onyx meow cue.
 *
 * Existing project dependencies:
 *   window.OurSpaceBackend.request(action, data)
 *   window.OurSpaceBackend.installConfig()  (for VAPID/application-server key)
 * Optional existing helpers:
 *   window.OurSpaceProfiles.getActiveProfile()
 *   window.OurSpaceAccess.isAuthenticated()
 *   window.OurSpaceAccess.isAdmin()
 *   window.OurSpaceSocial.routeTo()
 *   window.OnyxSupportChat.open()
 */
(function (global) {
  'use strict';

  const LOCAL_PREFIX = 'ourspace.notificationPrefs.v1.';
  const ONYX_PUSH_KINDS = Object.freeze(['onyx', 'onyx.care', 'onyx.selfcare', 'onyx.pet']);
  const DEFAULTS = Object.freeze({
    sound: false,
    systemNotifications: false,
    appBadge: true,
    onyx: true
  });
  const ONYX_SOUND = 'assets/audio/shared/onyx-meow.wav';

  let prefs = { ...DEFAULTS };
  let currentProfile = '';
  let seen = new Set();
  let firstAlertSnapshot = true;
  let pushSyncState = 'idle';
  let lastToneAt = 0;
  let lastServiceWorkerPushAt = 0;
  let pollTimer = 0;
  const activeAudio = new Set();

  function profile() {
    return String(
      global.OurSpaceProfiles?.getActiveProfile?.() ||
      global.OurSpaceBackend?.getProfileKey?.() ||
      global.OnyxBackendClient?.activeProfile?.() ||
      document.documentElement.dataset.ourspaceProfile ||
      localStorage.getItem('ourspace.auth.activeProfile') ||
      localStorage.getItem('ourspace.activeProfile') ||
      'william'
    ).toLowerCase();
  }

  function authenticated() {
    if (typeof global.OurSpaceAccess?.isAuthenticated === 'function') return global.OurSpaceAccess.isAuthenticated() !== false;
    if (global.OnyxBackendClient?.available) return global.OnyxBackendClient.available() !== false;
    return true;
  }

  function admin() {
    return Boolean(global.OurSpaceAccess?.isAdmin?.());
  }

  function localKey(p = profile()) {
    return LOCAL_PREFIX + p;
  }

  function normalizePrefs(value) {
    const v = value && typeof value === 'object' ? value : {};
    return {
      sound: v.sound === true,
      systemNotifications: v.systemNotifications === true,
      appBadge: v.appBadge !== false,
      onyx: v.kinds?.onyx !== false && v.onyx !== false
    };
  }

  function readLocal(p = profile()) {
    try {
      return normalizePrefs(JSON.parse(localStorage.getItem(localKey(p)) || 'null'));
    } catch (_) {
      return { ...DEFAULTS };
    }
  }

  function writeLocal(value, p = profile()) {
    try {
      localStorage.setItem(localKey(p), JSON.stringify({
        sound: value.sound === true,
        systemNotifications: value.systemNotifications === true,
        appBadge: value.appBadge !== false,
        kinds: { onyx: value.onyx !== false }
      }));
    } catch (_) {}
  }

  async function api(action, data) {
    if (global.OurSpaceBackend?.request) return global.OurSpaceBackend.request(action, data || {});
    if (global.OnyxBackendClient?.request) return global.OnyxBackendClient.request(action, data || {});
    throw new Error('Backend unavailable');
  }

  async function serviceWorkerReady(timeoutMs = 2500) {
    if (!('serviceWorker' in navigator)) throw new Error('Service worker unavailable');
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('No active service worker')), timeoutMs))
    ]);
  }

  function isOnyxKind(kind) {
    return /onyx/i.test(String(kind || ''));
  }

  function endpointSubscriptionId(endpoint) {
    let h = 2166136261;
    const text = String(endpoint || '');
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return 'webpush-' + (h >>> 0).toString(36);
  }

  async function syncWorkerDeviceSettings() {
    if (!('serviceWorker' in navigator)) return;
    const message = {
      type: 'OURSPACE_DEVICE_ALERT_SETTINGS',
      profileKey: profile(),
      settings: {
        sound: Boolean(prefs.sound),
        appBadge: prefs.appBadge !== false,
        systemNotifications: Boolean(prefs.systemNotifications),
        kinds: { onyx: prefs.onyx !== false }
      }
    };
    try {
      const reg = await serviceWorkerReady();
      const target = navigator.serviceWorker.controller || reg.active || reg.waiting;
      target?.postMessage?.(message);
    } catch (_) {}
  }

  async function playOnyxSound(options = {}) {
    if (!prefs.sound && options.force !== true) return false;
    const now = Date.now();
    if (options.bypassDebounce !== true && now - lastToneAt < 900) return false;
    if (options.bypassDebounce !== true) lastToneAt = now;
    if (typeof global.Audio !== 'function') return false;

    const audio = new Audio(ONYX_SOUND);
    const release = () => activeAudio.delete(audio);
    try {
      audio.preload = 'auto';
      audio.volume = 0.68;
      audio.setAttribute('playsinline', '');
      audio.addEventListener('ended', release, { once: true });
      audio.addEventListener('error', release, { once: true });
      activeAudio.add(audio);
      await audio.play();
      return true;
    } catch (_) {
      release();
      return false;
    }
  }

  async function setAppBadge(count) {
    if (!prefs.appBadge) {
      try { if (navigator.clearAppBadge) await navigator.clearAppBadge(); } catch (_) {}
      return;
    }
    const n = Math.max(0, Number(count) || 0);
    try {
      if (n > 0 && navigator.setAppBadge) await navigator.setAppBadge(n);
      else if (n === 0 && navigator.clearAppBadge) await navigator.clearAppBadge();
    } catch (_) {}
  }

  function alertId(alert, index = 0) {
    return String(alert?.id || alert?.notificationId || `${alert?.kind || 'alert'}:${alert?.createdAt || ''}:${index}`);
  }

  function normalizeAlert(raw) {
    let payload = raw?.PayloadJson ?? raw?.payloadJson ?? raw?.payload ?? raw?.data ?? {};
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (_) { payload = {}; }
    }
    return {
      id: raw?.NotificationId || raw?.notificationId || raw?.id || '',
      kind: raw?.Kind || raw?.kind || 'alert',
      subject: raw?.Subject || raw?.subject || raw?.title || 'Onyx',
      body: raw?.Body || raw?.body || raw?.message || '',
      status: raw?.Status || raw?.status || '',
      createdAt: raw?.CreatedAt || raw?.createdAt || '',
      payload: payload && typeof payload === 'object' ? payload : {}
    };
  }

  async function showSystemAlert(alert) {
    if (!prefs.systemNotifications || prefs.onyx === false) return;
    if (!('Notification' in global) || Notification.permission !== 'granted') return;
    if (!isOnyxKind(alert?.kind)) return;

    const title = String(alert?.subject || 'Onyx');
    const body = String(alert?.body || '').slice(0, 500);
    const options = {
      body,
      tag: `ourspace-${alertId(alert)}`,
      renotify: false,
      silent: !prefs.sound,
      data: {
        url: './ourspace.html#about',
        kind: String(alert?.kind || 'onyx'),
        alertId: alertId(alert)
      }
    };

    try {
      const reg = await navigator.serviceWorker?.ready;
      if (reg?.showNotification) await reg.showNotification(title, options);
      else new Notification(title, options);
    } catch (_) {}
  }

  async function handleAlerts(alerts) {
    const list = (Array.isArray(alerts) ? alerts : []).filter((alert) => isOnyxKind(alert?.kind));
    await setAppBadge(list.length);

    const snapshot = new Set(list.map(alertId));
    let incoming = [];
    if (firstAlertSnapshot) {
      seen = snapshot;
      firstAlertSnapshot = false;
    } else {
      incoming = list.filter((alert, index) => !seen.has(alertId(alert, index)));
      seen = snapshot;
    }

    if (incoming.length && prefs.onyx !== false) {
      const recentWorkerPush = document.hidden && Date.now() - lastServiceWorkerPushAt < 5000;
      if (!recentWorkerPush) await playOnyxSound();
      if (document.hidden && !recentWorkerPush) await showSystemAlert(incoming[0]);
    }

    global.dispatchEvent(new CustomEvent('ourspace:onyx-alerts-updated', {
      detail: {
        count: list.length,
        alerts: list.slice(),
        incoming: incoming.slice(),
        soundHandled: incoming.length > 0,
        source: 'updated-onyx-alert-runtime'
      }
    }));
    return list;
  }


  async function loadOnyxAlerts() {
    if (!authenticated() || admin() || (!global.OurSpaceBackend?.request && !global.OnyxBackendClient?.request)) return [];
    try {
      const result = await api('notification.list', {});
      const rows = Array.isArray(result?.pending) ? result.pending : [];
      const alerts = rows.map(normalizeAlert).filter((alert) => isOnyxKind(alert.kind))
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      return handleAlerts(alerts);
    } catch (_) {
      return [];
    }
  }

  function keyCandidates(config) {
    const found = [];
    const seenObjects = new Set();
    function walk(value, depth = 0) {
      if (!value || typeof value !== 'object' || depth > 5 || seenObjects.has(value)) return;
      seenObjects.add(value);
      for (const [key, child] of Object.entries(value)) {
        if (typeof child === 'string' && /(?:vapid|applicationserver|push).*(?:public)?key|public.*(?:vapid|push).*key/i.test(key)) {
          found.push(child.trim());
        } else {
          walk(child, depth + 1);
        }
      }
    }
    walk(config);
    return found.filter(Boolean);
  }

  function base64KeyToBytes(value) {
    const padding = '='.repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
  }

  async function matchingEndpointSubscriptions(endpoint) {
    if (!endpoint || !authenticated() || admin()) return [];
    try {
      const result = await api('notification.list', {});
      const rows = Array.isArray(result?.subscriptions) ? result.subscriptions : [];
      return rows.filter((row) => {
        const channel = String(row?.Channel ?? row?.channel ?? '').toLowerCase();
        const destination = String(row?.Destination ?? row?.destination ?? '').trim();
        return channel === 'web_push' && destination === endpoint;
      });
    } catch (_) {
      return [];
    }
  }

  async function cleanupDuplicateEndpointSubscriptions(endpoint, keepId) {
    const rows = await matchingEndpointSubscriptions(endpoint);
    for (const row of rows) {
      const id = String(row?.SubscriptionId ?? row?.subscriptionId ?? '');
      if (!id || id === keepId) continue;
      try { await api('pwa.push.unsubscribe', { subscriptionId: id, channel: 'web_push' }); } catch (_) {}
    }
  }

  async function syncSubscription(subscription) {
    if (!subscription || !authenticated() || admin()) return { ok: false, skipped: true };
    const json = subscription.toJSON ? subscription.toJSON() : subscription;
    const endpoint = json.endpoint || subscription.endpoint || '';
    const subscriptionId = endpointSubscriptionId(endpoint);
    const result = await api('pwa.push.subscribe', {
      profileKey: profile(),
      subscriptionId,
      push: json,
      subscription: json,
      endpoint,
      keys: json.keys || {},
      alertKinds: prefs.onyx === false ? [] : ONYX_PUSH_KINDS.slice(),
      client: 'ourspace-pwa',
      userAgent: navigator.userAgent || ''
    });
    await cleanupDuplicateEndpointSubscriptions(endpoint, subscriptionId);
    return result;
  }

  async function ensurePushSubscription() {
    if (pushSyncState === 'working') return { ok: false, busy: true };
    pushSyncState = 'working';
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in global)) {
        return { ok: false, unsupported: true };
      }
      const reg = await serviceWorkerReady();
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        let config = null;
        try { config = await global.OurSpaceBackend?.installConfig?.(); } catch (_) {}
        let key = keyCandidates(config)[0];
        if (!key && authenticated() && !admin()) {
          try { key = keyCandidates(await api('pwa.notification.contract', {}))[0]; } catch (_) {}
        }
        if (!key) return { ok: false, noApplicationServerKey: true };
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64KeyToBytes(key)
        });
      }
      try {
        await syncSubscription(sub);
        return { ok: true, subscribed: true };
      } catch (error) {
        return { ok: false, backendSyncFailed: true, error };
      }
    } finally {
      pushSyncState = 'idle';
    }
  }

  async function getPushState() {
    if (!('serviceWorker' in navigator) || !('PushManager' in global)) {
      return { ok: false, unsupported: true, subscribed: false, backendLinked: false };
    }
    try {
      const reg = await serviceWorkerReady();
      const subscription = await reg.pushManager.getSubscription();
      const endpoint = subscription?.endpoint || '';
      let backendLinked = false;
      let backendLinkChecked = false;

      if (subscription && authenticated() && !admin()) {
        try {
          const result = await api('notification.list', {});
          const rows = Array.isArray(result?.subscriptions) ? result.subscriptions : [];
          backendLinkChecked = true;
          backendLinked = rows.some((row) => {
            const channel = String(row?.Channel ?? row?.channel ?? '').toLowerCase();
            const destination = String(row?.Destination ?? row?.destination ?? '').trim();
            const id = String(row?.SubscriptionId ?? row?.subscriptionId ?? '');
            return channel === 'web_push' && (destination === endpoint || id === endpointSubscriptionId(endpoint));
          });
        } catch (_) {}
      }

      return {
        ok: true,
        subscribed: Boolean(subscription),
        browserSubscribed: Boolean(subscription),
        backendLinked,
        backendLinkChecked,
        endpoint,
        permission: 'Notification' in global ? Notification.permission : 'unsupported'
      };
    } catch (error) {
      return { ok: false, subscribed: false, backendLinked: false, error: String(error?.message || error) };
    }
  }

  async function disablePushSubscription(options = {}) {
    if (!('serviceWorker' in navigator) || !('PushManager' in global)) {
      return { ok: false, unsupported: true };
    }
    const reg = await serviceWorkerReady();
    const subscription = await reg.pushManager.getSubscription();
    const endpoint = subscription?.endpoint || '';
    let backendUnsubscribed = false;

    if (authenticated() && !admin()) {
      try {
        const matches = await matchingEndpointSubscriptions(endpoint);
        if (matches.length) {
          for (const row of matches) {
            const id = String(row?.SubscriptionId ?? row?.subscriptionId ?? '');
            if (id) await api('pwa.push.unsubscribe', { subscriptionId: id, channel: 'web_push' });
          }
        } else if (endpoint) {
          await api('pwa.push.unsubscribe', {
            subscriptionId: endpointSubscriptionId(endpoint),
            channel: 'web_push'
          });
        }
        backendUnsubscribed = true;
      } catch (_) {}
    }

    let browserUnsubscribed = false;
    if (subscription && options.removeBrowserSubscription === true) {
      try { browserUnsubscribed = Boolean(await subscription.unsubscribe()); } catch (_) {}
    }

    return {
      ok: true,
      subscribed: Boolean(subscription) && !browserUnsubscribed,
      backendUnsubscribed,
      browserUnsubscribed
    };
  }

  async function persistPrefs() {
    writeLocal(prefs, currentProfile || profile());
    await syncWorkerDeviceSettings();
    return { ok: true, deviceLocal: true };
  }

  async function setSoundEnabled(enabled) {
    prefs = { ...prefs, sound: Boolean(enabled) };
    await persistPrefs();
    if (prefs.sound) await playOnyxSound({ force: true, bypassDebounce: true });
    return { ok: true, sound: prefs.sound };
  }

  async function setAppBadgeEnabled(enabled) {
    prefs = { ...prefs, appBadge: Boolean(enabled) };
    await persistPrefs();
    if (!prefs.appBadge) await setAppBadge(0);
    return { ok: true, appBadge: prefs.appBadge };
  }

  async function setOnyxAlertsEnabled(enabled) {
    prefs = { ...prefs, onyx: Boolean(enabled) };
    await persistPrefs();
    const state = await getPushState();
    if (state.subscribed && authenticated() && !admin()) {
      try {
        const reg = await serviceWorkerReady();
        const subscription = await reg.pushManager.getSubscription();
        if (subscription) await syncSubscription(subscription);
      } catch (_) {}
    }
    return { ok: true, onyx: prefs.onyx };
  }

  async function setSystemNotificationsEnabled(enabled) {
    enabled = Boolean(enabled);
    if (!enabled) {
      prefs = { ...prefs, systemNotifications: false };
      await persistPrefs();
      await disablePushSubscription({ removeBrowserSubscription: false }).catch(() => {});
      return { ok: true, systemNotifications: false };
    }

    prefs = { ...prefs, systemNotifications: true };
    await persistPrefs();

    if (!('Notification' in global)) {
      throw new Error('This browser does not support the Notification API.');
    }

    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      await syncWorkerDeviceSettings();
      throw new Error('Browser notification permission is not granted.');
    }

    await ensurePushSubscription();
    return { ok: true, systemNotifications: true };
  }

  async function loadDevicePrefs() {
    currentProfile = profile();
    prefs = readLocal(currentProfile);
    await syncWorkerDeviceSettings();
  }

  function routeToOnyx() {
    global.OurSpaceSocial?.routeTo?.('about');
    setTimeout(() => {
      if (global.OnyxSupportChat?.open) global.OnyxSupportChat.open();
      else global.OnyxRoundWidget?.open?.();
    }, 40);
  }

  function bind() {
    currentProfile = profile();
    prefs = readLocal(currentProfile);
    loadDevicePrefs().catch(() => {});
    loadOnyxAlerts().catch(() => {});

    if (!pollTimer) {
      pollTimer = global.setInterval(() => {
        if (!document.hidden && authenticated()) loadOnyxAlerts().catch(() => {});
      }, 30000);
    }

    global.addEventListener('focus', () => {
      if (authenticated()) loadOnyxAlerts().catch(() => {});
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && authenticated()) loadOnyxAlerts().catch(() => {});
    });

    global.addEventListener('ourspace:profile-changing', () => {
      firstAlertSnapshot = true;
      seen.clear();
      setTimeout(() => {
        currentProfile = profile();
        prefs = readLocal(currentProfile);
        loadDevicePrefs().catch(() => {});
        loadOnyxAlerts().catch(() => {});
      }, 0);
    });

    global.addEventListener('ourspace:auth-session', () => {
      loadDevicePrefs().catch(() => {});
      loadOnyxAlerts().catch(() => {});
    });

    global.addEventListener('ourspace:auth-signout', () => {
      firstAlertSnapshot = true;
      seen.clear();
      setAppBadge(0);
    });

    navigator.serviceWorker?.addEventListener?.('message', (event) => {
      if (event.data?.type === 'OURSPACE_NOTIFICATION_OPEN' && isOnyxKind(event.data?.kind)) {
        routeToOnyx();
      }
      if (event.data?.type === 'OURSPACE_PUSH_RECEIVED' && isOnyxKind(event.data?.payload?.kind)) {
        lastServiceWorkerPushAt = Date.now();
        loadOnyxAlerts().catch(() => {});
      }
    });
  }

  global.OurSpaceOnyxAlerts = Object.freeze({
    getPreferences: () => ({ ...prefs }),
    getPushState,
    ensurePushSubscription,
    disablePushSubscription,
    setSystemNotificationsEnabled,
    setSoundEnabled,
    setAppBadgeEnabled,
    setOnyxAlertsEnabled,
    playOnyxSound,
    loadOnyxAlerts,
    getSoundAsset: () => ONYX_SOUND
  });

  /* Backward-compatible Onyx module alert API. This keeps existing module-side
     subscribe/list/send hooks while the updated OurSpace alert runtime handles
     device preferences, push, badges, sound, and foreground alert delivery. */
  global.OnyxAlerts = Object.freeze({
    subscribe(payload){return global.OnyxBackendClient?.alertSubscribe?.(payload)},
    unsubscribe(payload){return global.OnyxBackendClient?.alertUnsubscribe?.(payload)},
    list(payload){return global.OnyxBackendClient?.alertList?.(payload)},
    send(payload){return global.OnyxBackendClient?.alertSend?.(payload)},
    inApp(message,{sound=false,kind='onyx',count=0,persist=false,duration=4200}={}){
      const detail={kind,incoming:true,sound:Boolean(sound),count,persist,duration,record:{source:'onyx',message:String(message||'')}};
      try{global.dispatchEvent(new CustomEvent('onyx:reaction-alert',{detail}))}catch(_){}
      return detail;
    },
    getPreferences:()=>global.OurSpaceOnyxAlerts?.getPreferences?.(),
    refresh:()=>global.OurSpaceOnyxAlerts?.loadOnyxAlerts?.()
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})(window);
/* Extracted from OurSpace_DRAFT_Strengthening_V17_3_7.
 * Master-navigation Account Settings button + Onyx alert opt-in only.
 */
(function (global) {
  'use strict';

  let modal = null;
  let lastFocus = null;

  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function authenticated() {
    if (typeof global.OurSpaceAccess?.isAuthenticated === 'function') return global.OurSpaceAccess.isAuthenticated() !== false;
    if (global.OnyxBackendClient?.available) return global.OnyxBackendClient.available() !== false;
    return true;
  }

  function admin() {
    return Boolean(global.OurSpaceAccess?.isAdmin?.());
  }

  function activeProfile() {
    return String(
      global.OurSpaceProfiles?.getActiveProfile?.() ||
      global.OurSpaceBackend?.getProfileKey?.() ||
      global.OnyxBackendClient?.activeProfile?.() ||
      document.documentElement.dataset.ourspaceProfile ||
      localStorage.getItem('ourspace.auth.activeProfile') ||
      localStorage.getItem('ourspace.activeProfile') || ''
    ).toLowerCase();
  }

  function setStatus(node, message, state = '') {
    if (!node) return;
    node.textContent = String(message || '');
    if (state) node.dataset.state = state;
    else delete node.dataset.state;
  }

  function ensureNavigationButtons() {
    $$('.master-actions').forEach((actions) => {
      if (actions.querySelector('[data-account-settings-open]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'secondary account-settings-nav-button';
      button.dataset.accountSettingsOpen = '';
      button.setAttribute('aria-haspopup', 'dialog');
      button.innerHTML = '<span class="ourspace-ui-symbol" aria-hidden="true">⚙️</span>Account Settings';
      actions.insertBefore(button, actions.firstChild);
    });
  }

  function ensureModal() {
    if (modal?.isConnected) return modal;
    modal = document.createElement('div');
    modal.className = 'ourspace-account-settings-backdrop';
    modal.dataset.accountSettingsModal = '';
    modal.hidden = true;
    modal.innerHTML = `
      <section class="ourspace-account-settings-dialog" role="dialog" aria-modal="true" aria-labelledby="ourspace-account-settings-title">
        <header class="ourspace-account-settings-header">
          <div>
            <span class="ourspace-account-settings-kicker">Private account controls</span>
            <h2 id="ourspace-account-settings-title"><span aria-hidden="true">⚙️</span> Account Settings</h2>
          </div>
          <button type="button" class="ourspace-account-settings-close" data-account-settings-close aria-label="Close Account Settings">×</button>
        </header>
        <div class="ourspace-account-settings-body">
          <p class="ourspace-account-settings-profile" data-account-settings-profile></p>
          <section class="ourspace-account-settings-section" aria-labelledby="ourspace-onyx-alert-settings-title">
            <h3 id="ourspace-onyx-alert-settings-title"><span aria-hidden="true">🐈‍⬛</span> Onyx Alerts</h3>
            <p class="small-note">Choose whether this browser or installed app receives Onyx alerts, plays the Onyx meow cue, and shows an app badge.</p>

            <div class="ourspace-account-toggle-grid">
              <label>
                <input type="checkbox" data-account-system-notifications>
                <span><strong>🔔 Push / system notifications</strong><small>Show Onyx alerts outside the open page when supported.</small></span>
              </label>
              <label>
                <input type="checkbox" data-account-alert-sound>
                <span><strong>🔊 Onyx alert sound</strong><small>Play the packaged Onyx meow cue for new Onyx alerts while the page is active.</small></span>
              </label>
              <label>
                <input type="checkbox" data-account-app-badge>
                <span><strong>◉ App icon badge</strong><small>Show pending Onyx alert count on the installed app icon when supported.</small></span>
              </label>
            </div>

            <fieldset class="ourspace-account-alert-kinds">
              <legend>Alert types on this device</legend>
              <div class="ourspace-account-kind-grid">
                <label>
                  <input type="checkbox" data-account-alert-kind="onyx">
                  <span><strong>🐈‍⬛ Onyx</strong><small>Onyx care/support notifications.</small></span>
                </label>
              </div>
            </fieldset>

            <div class="ourspace-account-device-actions">
              <button type="button" class="secondary" data-account-sync-push>↻ Sync this device</button>
              <button type="button" class="secondary" data-account-disable-push>🔕 Disable push on this device</button>
            </div>
            <div class="ourspace-account-status" data-account-device-status aria-live="polite"></div>
          </section>
        </div>
      </section>`;
    document.body.appendChild(modal);
    return modal;
  }

  async function refreshDeviceSettings() {
    if (!modal) return;
    const alerts = global.OurSpaceOnyxAlerts;
    const prefs = alerts?.getPreferences?.() || {
      sound: false,
      systemNotifications: false,
      appBadge: true,
      onyx: true
    };
    const permission = 'Notification' in global ? Notification.permission : 'unsupported';

    modal.querySelector('[data-account-system-notifications]').checked = Boolean(prefs.systemNotifications);
    modal.querySelector('[data-account-alert-sound]').checked = Boolean(prefs.sound);
    modal.querySelector('[data-account-app-badge]').checked = prefs.appBadge !== false;
    modal.querySelector('[data-account-alert-kind="onyx"]').checked = prefs.onyx !== false;

    const statusNode = modal.querySelector('[data-account-device-status]');
    if (!alerts) return setStatus(statusNode, 'Onyx alert controls are still loading.');

    try {
      const state = await alerts.getPushState?.();
      let text = `Browser notification permission: ${permission}.`;
      let status = '';

      if (!prefs.systemNotifications) {
        text = state?.subscribed
          ? 'Onyx system alerts are disabled for this profile on this device. A reusable browser subscription may remain available.'
          : `Onyx system alerts are disabled on this device. Browser permission: ${permission}.`;
      } else if (state?.unsupported) {
        text = 'Onyx system alerts are enabled, but Web Push is not supported in this browser.';
      } else if (permission !== 'granted') {
        text = `Onyx system alerts are enabled, but browser notification permission is ${permission}. Allow notifications in browser/site settings.`;
        status = 'error';
      } else if (!state?.subscribed) {
        text = 'Onyx system alerts are enabled and browser permission is granted, but this browser does not currently have a push subscription. Use “Sync this device.”';
      } else if (state?.backendLinkChecked && !state?.backendLinked) {
        text = 'This browser has a push subscription, but it is not currently linked to this signed-in profile. Use “Sync this device.”';
      } else if (state?.backendLinked) {
        text = `Onyx push alerts are linked to this profile on this device. Browser permission: ${permission}.`;
        status = 'ok';
      } else {
        text = 'A browser push subscription exists. Backend link status could not be confirmed; use “Sync this device” if Onyx alerts are not arriving.';
      }

      setStatus(statusNode, text, status);
    } catch (_) {
      setStatus(statusNode, `Browser notification permission: ${permission}.`);
    }
  }

  async function openModal() {
    ensureModal();
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!authenticated() || admin()) return;

    modal.hidden = false;
    document.body.classList.add('ourspace-account-settings-open');
    modal.querySelector('[data-account-settings-profile]').textContent =
      `Signed in as ${activeProfile() || 'profile'}. Onyx alert, sound and badge controls apply only to this device.`;
    modal.querySelector('[data-account-settings-close]')?.focus();
    await refreshDeviceSettings();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('ourspace-account-settings-open');
    if (lastFocus?.isConnected) {
      try { lastFocus.focus(); } catch (_) {}
    }
    lastFocus = null;
  }

  async function handleDeviceToggle(target) {
    const alerts = global.OurSpaceOnyxAlerts;
    const statusNode = modal?.querySelector('[data-account-device-status]');
    if (!alerts) return setStatus(statusNode, 'Onyx alert controls are still loading.', 'error');

    target.disabled = true;
    try {
      if (target.matches('[data-account-system-notifications]')) {
        await alerts.setSystemNotificationsEnabled?.(target.checked);
      } else if (target.matches('[data-account-alert-sound]')) {
        await alerts.setSoundEnabled?.(target.checked);
      } else if (target.matches('[data-account-app-badge]')) {
        await alerts.setAppBadgeEnabled?.(target.checked);
      } else if (target.matches('[data-account-alert-kind="onyx"]')) {
        await alerts.setOnyxAlertsEnabled?.(target.checked);
      }
      await refreshDeviceSettings();
    } catch (error) {
      setStatus(statusNode, String(error?.message || error), 'error');
      await refreshDeviceSettings();
    } finally {
      target.disabled = false;
    }
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      const open = event.target.closest('[data-account-settings-open]');
      if (open) {
        event.preventDefault();
        openModal();
        return;
      }

      if (event.target.closest('[data-account-settings-close]') || event.target === modal) {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.target.closest('[data-account-sync-push]')) {
        event.preventDefault();
        const node = modal?.querySelector('[data-account-device-status]');
        setStatus(node, 'Syncing this device…');
        global.OurSpaceOnyxAlerts?.ensurePushSubscription?.().then(async (result) => {
          await refreshDeviceSettings();
          if (result?.noApplicationServerKey) {
            setStatus(node, 'This backend deployment is not exposing the Web Push application-server key needed to create a device subscription.', 'error');
          } else if (result?.backendSyncFailed) {
            setStatus(node, 'This browser has a push subscription, but syncing it to the account failed.', 'error');
          }
        }).catch((error) => setStatus(node, String(error?.message || error), 'error'));
        return;
      }

      if (event.target.closest('[data-account-disable-push]')) {
        event.preventDefault();
        const node = modal?.querySelector('[data-account-device-status]');
        setStatus(node, 'Disabling Onyx push alerts on this device…');
        global.OurSpaceOnyxAlerts?.setSystemNotificationsEnabled?.(false)
          .then(() => refreshDeviceSettings())
          .catch((error) => setStatus(node, String(error?.message || error), 'error'));
      }
    }, true);

    document.addEventListener('change', (event) => {
      const input = event.target.closest(
        '[data-account-system-notifications],[data-account-alert-sound],[data-account-app-badge],[data-account-alert-kind="onyx"]'
      );
      if (input) handleDeviceToggle(input);
    }, true);

    document.addEventListener('keydown', (event) => {
      if (!modal || modal.hidden) return;
      if (event.key === 'Escape') closeModal();
    });

    global.addEventListener('ourspace:auth-signout', closeModal);
    global.addEventListener('ourspace:profile-changing', closeModal);
  }

  function init() {
    ensureNavigationButtons();
    ensureModal();
    bindEvents();
  }

  global.OurSpaceOnyxAlertAccountSettings = Object.freeze({
    open: openModal,
    close: closeModal,
    refresh: refreshDeviceSettings
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})(window);
