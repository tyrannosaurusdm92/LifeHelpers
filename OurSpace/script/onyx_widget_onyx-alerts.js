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
  const ALL_KINDS = Object.freeze(['*']);
  const CATEGORIES = Object.freeze(['calls','texts','calendar','tasks','voice','purchase','visitor','therapy','selfcare','return']);
  const READ_PREFIX = 'ourspace.notificationRead.v2.';
  const DEFAULTS = Object.freeze({
    sound: false,
    systemNotifications: false,
    appBadge: true,
    onyx: true, categories: Object.fromEntries(CATEGORIES.map(kind => [kind, true]))
  });

  let prefs = { ...DEFAULTS };
  let currentProfile = '';
  let seen = new Set();
  let currentAlerts = [];
  let readIds = new Set();
  let subscriptionVerified = '';
  let pollPending = null;
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
    if (new URLSearchParams(location.search).get('public') === '1') return false;
    if (global.OurSpaceBackend?.isAuthenticated) return global.OurSpaceBackend.isAuthenticated() && !global.OurSpaceBackend.isAdmin?.() && global.OurSpaceBackend.profile?.() === profile();
    return false;
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
      onyx: v.kinds?.onyx !== false && v.onyx !== false,
      categories: Object.fromEntries(CATEGORIES.map(kind => [kind, v.categories?.[kind] !== false]))
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
        kinds: { onyx: value.onyx !== false },
        categories: value.categories || {}
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
    return /^(onyx(?:[._-]|$)|therapy(?:[._-]|$)|self[._-]?care[._-]?reminder|come[._-]?back)/i.test(String(kind || ''));
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
        kinds: { onyx: prefs.onyx !== false },
        categories: prefs.categories || {}
      }
    };
    try {
      const reg = await serviceWorkerReady();
      const target = navigator.serviceWorker.controller || reg.active || reg.waiting;
      target?.postMessage?.(message);
    } catch (_) {}
  }

  async function playOnyxSound(options={}){if(!prefs.sound&&options.force!==true)return false;return Boolean(global.OnyxAlertAudio?.play(options.record||options.alert||options.kind||null,{force:options.force===true}));}

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
      subject: raw?.Subject || raw?.subject || raw?.title || '',
      body: raw?.Body || raw?.body || raw?.message || '',
      status: raw?.Status || raw?.status || '',
      createdAt: raw?.CreatedAt || raw?.createdAt || '',
      payload: payload && typeof payload === 'object' ? payload : {}
    };
  }

  function categoryOf(alert) {
    const kind = String(alert?.kind || '').toLowerCase();
    const body = `${alert?.subject || ''} ${alert?.body || ''}`.toLowerCase();
    if (/come[._ -]?back|return[._ -]?reminder/.test(kind)) return 'return';
    if (/therapy|session/.test(kind) && (/onyx|therapy/.test(kind + body))) return 'therapy';
    if (isOnyxKind(kind) || /onyx/.test(kind)) return /self.?care|selfcare|onyx[._-]?care/.test(kind + body) ? 'selfcare' : /therapy/.test(body) ? 'therapy' : 'return';
    if (/call/.test(kind)) return 'calls';
    if (/voice|voicemail/.test(kind) || /voice|audio/.test(String(alert?.payload?.kind || '')) || (/messenger/.test(kind) && /voice message|audio message/.test(body))) return 'voice';
    if (/messenger|message|text/.test(kind)) return 'texts';
    if (/calendar|appointment|organizer|event/.test(kind)) return 'calendar';
    if (/task/.test(kind)) return 'tasks';
    if (/purchase|receipt|store/.test(kind)) return 'purchase';
    if (/visitor|visit/.test(kind)) return 'visitor';
    if (/selfcare|self.care/.test(kind)) return 'selfcare';
    return 'other';
  }

  function readKey(p = profile()) { return READ_PREFIX + p; }
  function loadRead() {
    try { readIds = new Set(JSON.parse(localStorage.getItem(readKey()) || '[]')); }
    catch (_) { readIds = new Set(); }
  }
  function saveRead() {
    try { localStorage.setItem(readKey(), JSON.stringify([...readIds].slice(-750))); }
    catch (_) {}
  }
  function safeTarget(alert) {
    const key = profile();
    const category = categoryOf(alert);
    const page = ({calls:'communication',texts:'communication',voice:'communication',calendar:'household',tasks:'household',purchase:'store',visitor:'retrobuilder',therapy:'skills',selfcare:'skills',return:'retrobuilder'})[category] || 'retrobuilder';
    return `../../assets/code/${key}.html#${page}`;
  }
  function publishedAlert(alert) {
    const category = categoryOf(alert);
    const source = String(alert?.payload?.fromProfile || alert?.payload?.purchaserProfile || alert?.payload?.buyerProfile || alert?.payload?.callerProfile || alert?.payload?.ownerProfileKey || '').toLowerCase();
    const from = source === 'william' ? 'William' : source === 'jasper' ? 'Jasper' : '';
    const title = category === 'purchase' && from ? `New purchase from ${from}` :
      String(alert.subject || ({calls:'Incoming call',texts:'Incoming text',calendar:'Calendar event',tasks:'Task reminder',voice:'Incoming voice message',purchase:'New purchase',visitor:'Profile visitor',therapy:'Onyx therapy session',selfcare:'Onyx self-care reminder',return:'Onyx check-in'})[category] || 'OurSpace');
    return { ...alert, category, title, url: safeTarget(alert), read: readIds.has(alertId(alert)) };
  }
  function isAllowed(alert) {
    const c = categoryOf(alert);
    return c === 'other' || (prefs.categories?.[c] !== false && (!isOnyxKind(alert.kind) || prefs.onyx !== false));
  }
  function publishAllAlerts(incoming = []) {
    const all = currentAlerts.filter(isAllowed).map(publishedAlert);
    const unread = all.filter(a => !a.read);
    const onyx = unread.filter(a => isOnyxKind(a.kind) || ['therapy','selfcare','return'].includes(a.category) && /onyx/i.test(a.kind + a.subject));
    const onyxIncoming = incoming.filter(a => onyx.some(n => n.id === a.id));
    setAppBadge(unread.length).catch(() => {});
    global.dispatchEvent(new CustomEvent('ourspace:onyx-alerts-updated', {
      detail: { count: onyx.length, alerts: onyx, incoming: onyxIncoming, soundHandled: onyxIncoming.length > 0, source:'ourspace-alerts-v2' }
    }));
    const snapshot = { type:'OURSPACE_ALERTS_SYNC', profileKey:profile(), unreadCount:unread.length,
      alerts:all.map(a => ({id:a.id,kind:a.kind,category:a.category,title:a.title,body:String(a.body||'').slice(0,240),url:a.url,read:a.read,createdAt:a.createdAt})) };
    const frame = document.getElementById('ourspaceProfileFrame');
    try { frame?.contentWindow?.postMessage(snapshot, location.origin); } catch (_) {}
    global.dispatchEvent(new CustomEvent('ourspace:notifications-updated', {detail:snapshot}));
    return unread;
  }
  function markRead(ids) {
    const values = Array.isArray(ids) ? ids : [ids];
    for (const id of values) if(id != null) readIds.add(String(id));
    saveRead(); publishAllAlerts();
  }
  async function ensureInAppSubscription() {
    const p = profile();
    if (subscriptionVerified === p || !authenticated() || admin()) return;
    try {
      const result = await api('notification.list', {});
      const active = (result.subscriptions || []).some(row => String(row.Channel || row.channel || '').toLowerCase() === 'in_app' &&
        String(row.Active || row.active || 'true') !== 'false' &&
        ((() => { try { const kinds = JSON.parse(row.AlertKindsJson || row.alertKindsJson || '[]'); return kinds.includes('*'); } catch (_) { return false; } })()));
      if (!active) await api('notification.subscribe', {channel:'in_app', subscriptionId:'ourspace-in-app-'+p, alertKinds:['*']});
      subscriptionVerified = p;
    } catch (_) { /* Offline: try again on the next foreground refresh. */ }
  }
  async function showSystemAlert(alert) {
    if (!prefs.systemNotifications || !('Notification' in global) || Notification.permission !== 'granted') return;
    if (!isAllowed(alert)) return;
    const a = publishedAlert(alert);
    const options = {body:String(a.body||'').slice(0,350), tag:'ourspace-'+alertId(alert), renotify:false, silent:true,
      icon:'../../assets/onyx_widget_ourspace-icon-192.png',
      data:{url:a.url,kind:a.kind,profileKey:profile(),alertId:a.id}};
    try { const reg = await serviceWorkerReady(); await reg.showNotification(a.title,options); } catch (_) {}
  }
  async function loadOnyxAlerts() {
    if (pollPending) return pollPending;
    if (!authenticated() || admin()) return [];
    pollPending = (async () => {
      await ensureInAppSubscription();
      try {
        const result = await api('notification.list', {});
        if (String(result.profileKey || '').toLowerCase() !== profile()) return [];
        const rows = Array.isArray(result.pending) ? result.pending : [];
        // in-app subscriptions are canonical; don't count email/push outbox copies again.
        const filtered = rows.map(normalizeAlert).filter((a,i) =>
          String(rows[i].Channel || rows[i].channel || 'in_app').toLowerCase() === 'in_app');
        // A second legacy in-app subscription may create another outbox row
        // for the same delivery. Collapse only matching backend event signatures.
        const dedup = new Map();
        for(const a of filtered) {
          if(!a.id) continue;
          const sourceId = a.payload?.messageId || a.payload?.callId || a.payload?.purchaseId || a.payload?.scheduleId || a.payload?.fileId;
          const minute = String(a.createdAt||'').slice(0,16);
          const signature = sourceId ? `event:${a.kind}:${sourceId}` :
            `content:${a.kind}:${a.subject}:${a.body}:${minute}`;
          if(!dedup.has(signature)) dedup.set(signature,a);
        }
        currentAlerts = [...dedup.values()].sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt)));
        const snapshot = new Set(currentAlerts.map(a => alertId(a)));
        let incoming = [];
        if (firstAlertSnapshot) firstAlertSnapshot = false;
        else incoming = currentAlerts.filter(a => !seen.has(alertId(a)) && !readIds.has(alertId(a)) && isAllowed(a));
        seen = snapshot;
        const unread = publishAllAlerts(incoming);
        if (incoming.some(a => isOnyxKind(a.kind)) && !document.hidden) await playOnyxSound({record:incoming.find(a=>isOnyxKind(a.kind))});
        if (document.hidden && Date.now() - lastServiceWorkerPushAt > 5000 && incoming.length) await showSystemAlert(incoming[0]);
        return unread;
      } catch (_) { return currentAlerts; }
    })();
    try { return await pollPending; } finally { pollPending = null; }
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
      alertKinds: ALL_KINDS.slice(),
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
    /* Enabling sounds never previews an unclassified meow. */
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
    publishAllAlerts();
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
    loadRead();
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
    loadRead();
    // The root worker controls all installed-app notifications; profile HTML uses <base> at site root.
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register(new URL('service-worker.js',document.baseURI).href,{scope:new URL('./',document.baseURI).pathname}).catch(()=>{});
    }
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
        loadRead(); subscriptionVerified = ''; currentAlerts=[];
        loadDevicePrefs().catch(() => {});
        loadOnyxAlerts().catch(() => {});
      }, 0);
    });

    global.addEventListener('ourspace:auth-session', () => {
      loadDevicePrefs().catch(() => {});
      loadOnyxAlerts().catch(() => {});
    });

    const clearSignedOut = () => {
      firstAlertSnapshot = true;
      seen.clear();
      currentAlerts=[]; subscriptionVerified=''; readIds.clear();
      try { navigator.serviceWorker?.controller?.postMessage({type:'OURSPACE_DEVICE_ALERT_SIGNOUT'}); } catch (_) {}
      setAppBadge(0);
    };
    global.addEventListener('ourspace:auth-signout', clearSignedOut);
    global.addEventListener('ourspace:signed-out', clearSignedOut);

    global.addEventListener('message', (event) => {
      if (event.origin !== location.origin || event.source !== document.getElementById('ourspaceProfileFrame')?.contentWindow) return;
      const m = event.data || {};
      if (m.type === 'OURSPACE_ALERTS_READY') publishAllAlerts();
      if (m.type === 'OURSPACE_ALERT_READ' && typeof m.id === 'string') markRead(m.id);
      if (m.type === 'OURSPACE_ALERT_READ_ALL') markRead(currentAlerts.map(a => alertId(a)));
      if (m.type === 'OURSPACE_ALERT_CATEGORY' && CATEGORIES.includes(m.category)) {
        global.OurSpaceOnyxAlerts?.setCategoryEnabled?.(m.category,m.enabled);
      }
    });
    navigator.serviceWorker?.addEventListener?.('message', (event) => {
      if (event.data?.type === 'OURSPACE_NOTIFICATION_OPEN') {
        const target = new URL(event.data.url || '', document.baseURI);
        if(target.origin === location.origin && target.pathname === location.pathname) {
          if(target.hash) location.hash = target.hash; // Profile host relays its hash into the full-page content iframe.
        } else if (target.origin === location.origin && target.pathname.startsWith(new URL('../../assets/code/',document.baseURI).pathname)) {
          location.assign(target.href);
          return;
        }
        if(event.data.notificationId) markRead(event.data.notificationId);
        if(isOnyxKind(event.data?.kind)) routeToOnyx();
      }
      if (event.data?.type === 'OURSPACE_PUSH_RECEIVED') {
        lastServiceWorkerPushAt = Date.now();
        loadOnyxAlerts().catch(() => {});
      }
    });
  }

  global.OurSpaceOnyxAlerts = Object.freeze({
    getPreferences: () => ({ ...prefs, categories:{...prefs.categories} }),
    getAllAlerts: () => currentAlerts.map(publishedAlert),
    saveReminder: async ({kind,nextAt,body}) => {
      if (!authenticated() || admin()) throw new Error('Sign in to your own profile first.');
      if (!['onyx.therapy','onyx.selfcare','onyx.comeback'].includes(kind)) throw new Error('Unknown Onyx reminder type.');
      const instant = new Date(nextAt); if (!Number.isFinite(instant.getTime()) || instant.getTime() < Date.now()+60000) throw new Error('Choose a future reminder time.');
      const titles={'onyx.therapy':'Onyx therapy session','onyx.selfcare':'Onyx self-care reminder','onyx.comeback':'Onyx check-in'};
      return api('notification.schedule.save', {kind, title:titles[kind], body:String(body||'A small step is enough. Onyx is here.').slice(0,300),
        schedule:{nextAt:instant.toISOString(),recurrence:'once'}, channel:'in_app'});
    },
    markRead,
    markAllRead: () => markRead(currentAlerts.map(a => alertId(a))),
    setCategoryEnabled: async (category, enabled) => { if (!CATEGORIES.includes(category)) return false; prefs.categories[category]=!!enabled; await persistPrefs(); publishAllAlerts(); return true; },
    refresh: loadOnyxAlerts,
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
 * Existing account settings for OurSpace and Onyx device alerts.
 */
(function (global) {
  'use strict';

  let modal = null;
  let lastFocus = null;

  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function authenticated() {
    if (new URLSearchParams(location.search).get('public') === '1') return false;
    if (global.OurSpaceBackend?.isAuthenticated) return global.OurSpaceBackend.isAuthenticated() && !global.OurSpaceBackend.isAdmin?.() && global.OurSpaceBackend.profile?.() === profile();
    return false;
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
            <h3 id="ourspace-onyx-alert-settings-title"><span aria-hidden="true">🐈‍⬛</span> OurSpace &amp; Onyx Alerts</h3>
            <p class="small-note">OurSpace uses its app logo for installed notifications. Onyx reminders also appear on his sprite border. Enable system alerts for background delivery where supported.</p>

            <div class="ourspace-account-toggle-grid">
              <label>
                <input type="checkbox" data-account-system-notifications>
                <span><strong>🔔 Push / system notifications</strong><small>Show OurSpace and Onyx alerts on your device when supported.</small></span>
              </label>
              <label>
                <input type="checkbox" data-account-alert-sound>
                <span><strong>🔊 Onyx alert sound</strong><small>Only virtual pet care, self-care and scheduled therapy alerts have notification sounds.</small></span>
              </label>
              <label>
                <input type="checkbox" data-account-app-badge>
                <span><strong>◉ App icon badge</strong><small>Show unread OurSpace and Onyx alerts on the installed app icon when supported.</small></span>
              </label>
            </div>

            <fieldset class="ourspace-account-alert-kinds">
              <legend>Alert types on this device</legend>
              <div class="ourspace-account-kind-grid">
                <label>
                  <input type="checkbox" data-account-alert-kind="onyx">
                  <span><strong>🐈‍⬛ Onyx</strong><small>All Onyx support notifications.</small></span>
                </label>
                ${[
                  ['calls','📞 Calls'],['texts','💬 Texts'],['calendar','📅 Calendar events'],['tasks','✅ Tasks'],
                  ['voice','🎙️ Voice messages'],['purchase','🎁 Purchases'],['visitor','👀 Profile visitors'],
                  ['therapy','🐈‍⬛ Therapy sessions'],['selfcare','🐈‍⬛ Self-care reminders'],['return','🐈‍⬛ Come-back reminders']
                ].map(([id,label])=>`<label><input type="checkbox" data-account-alert-category="${id}"><span><strong>${label}</strong></span></label>`).join('')}
              </div>
            </fieldset>

            <form class="ourspace-account-reminder-form" data-onyx-reminder-form>
              <h4>Schedule an Onyx reminder</h4>
              <label>Type <select name="kind" required>
                <option value="onyx.therapy">Therapy session</option><option value="onyx.selfcare">Self-care reminder</option><option value="onyx.comeback">Come-back check-in</option>
              </select></label>
              <label>Time <input name="nextAt" type="datetime-local" required></label>
              <label>Note (optional) <input name="body" maxlength="300" placeholder="One small thing counts."></label>
              <button type="submit">Save reminder</button>
              <p data-onyx-reminder-result aria-live="polite"></p>
            </form>
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
    modal.querySelectorAll('[data-account-alert-category]').forEach(el=>{el.checked=prefs.categories?.[el.dataset.accountAlertCategory]!==false});

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
      if (target.matches('[data-account-alert-category]')) {
        await alerts.setCategoryEnabled?.(target.dataset.accountAlertCategory,target.checked);
      } else if (target.matches('[data-account-system-notifications]')) {
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
        '[data-account-system-notifications],[data-account-alert-sound],[data-account-app-badge],[data-account-alert-kind="onyx"],[data-account-alert-category]'
      );
      if (input) handleDeviceToggle(input);
    }, true);

    document.addEventListener('submit', async (event) => {
      const form=event.target.closest('[data-onyx-reminder-form]'); if(!form)return;
      event.preventDefault();
      const status=form.querySelector('[data-onyx-reminder-result]');
      const save=form.querySelector('button[type=submit]');save.disabled=true;
      try { await global.OurSpaceOnyxAlerts.saveReminder(Object.fromEntries(new FormData(form))); status.textContent='Saved to your account reminder schedule.'; form.reset(); }
      catch(error){status.textContent='Reminder not saved: '+String(error?.message||error);}
      finally {save.disabled=false;}
    });
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
