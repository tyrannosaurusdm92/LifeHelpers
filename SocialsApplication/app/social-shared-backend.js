(function (global) {
  'use strict';

  const DEFAULT_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzL5BoWZsDaTQGzLE-AvoubKyVsEanUGNSwrNyKP7wEw3pK4-2KOw2LVfKejtwyNnvK/exec';
  const DEPLOYMENT_ID = 'AKfycbzL5BoWZsDaTQGzLE-AvoubKyVsEanUGNSwrNyKP7wEw3pK4-2KOw2LVfKejtwyNnvK';
  const URL_KEY = 'socialApplication.sharedBackendUrl';
  const DISABLED_KEY = 'socialApplication.sharedBackendDisabled';
  const SESSION_KEY = 'socialApplication.sharedBackendSession';
  const PROJECT_KEY = 'socialApplication.projectId';
  const PROJECT_NAME_KEY = 'socialApplication.projectName';
  const POLL_MS = 5000;
  const ROOM_POLL_MS = 1800;
  const HEARTBEAT_MS = 45000;
  const originalFetch = global.fetch ? global.fetch.bind(global) : null;

  function slug(value, fallback = 'project') {
    return String(value || fallback)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 64) || fallback;
  }

  function getProjectId() {
    const explicit = global.SOCIAL_APPLICATION_PROJECT_ID || document.documentElement?.dataset?.projectId || document.body?.dataset?.projectId;
    if (explicit) {
      const id = slug(explicit, 'project');
      localStorage.setItem(PROJECT_KEY, id);
      return id;
    }
    const stored = localStorage.getItem(PROJECT_KEY);
    if (stored) return slug(stored, 'project');
    const source = `${location.hostname || 'local'}-${location.pathname || 'site'}-${document.title || 'social-application'}`;
    const id = slug(source, 'project');
    localStorage.setItem(PROJECT_KEY, id);
    return id;
  }

  function getProjectName() {
    return global.SOCIAL_APPLICATION_PROJECT_NAME || document.documentElement?.dataset?.projectName || document.body?.dataset?.projectName || localStorage.getItem(PROJECT_NAME_KEY) || document.title || 'Social Application Project';
  }

  function cleanBackendUrl(url) {
    return String(url || '').trim().replace(/\/+$/, '');
  }

  function getDefaultBackendUrl() {
    return cleanBackendUrl(global.SOCIAL_APPLICATION_BACKEND_URL || DEFAULT_BACKEND_URL);
  }

  function getBackendUrl() {
    if (localStorage.getItem(DISABLED_KEY) === 'true') return '';
    const configured = cleanBackendUrl(localStorage.getItem(URL_KEY) || global.SOCIAL_APPLICATION_BACKEND_URL || DEFAULT_BACKEND_URL);
    return configured;
  }

  function setBackendUrl(url) {
    const clean = cleanBackendUrl(url);
    if (clean) {
      localStorage.setItem(URL_KEY, clean);
      localStorage.removeItem(DISABLED_KEY);
      return clean;
    }
    localStorage.setItem(DISABLED_KEY, 'true');
    return '';
  }

  function useDefaultBackend() {
    localStorage.removeItem(URL_KEY);
    localStorage.removeItem(DISABLED_KEY);
    return getBackendUrl();
  }

  function disableBackend() {
    localStorage.setItem(DISABLED_KEY, 'true');
    return '';
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
  }

  function setSession(session) {
    if (!session) localStorage.removeItem(SESSION_KEY);
    else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function isEnabled() {
    return Boolean(getBackendUrl());
  }

  function parseBody(options = {}) {
    if (!options.body) return {};
    if (typeof options.body === 'string') {
      try { return JSON.parse(options.body || '{}'); }
      catch { return {}; }
    }
    return options.body || {};
  }

  function backendBody(action, payload = {}, options = {}) {
    const session = getSession();
    const projectId = payload.projectId || options.projectId || getProjectId();
    return {
      action,
      projectId,
      projectName: getProjectName(),
      sessionToken: payload.sessionToken || session?.sessionToken || session?.token || '',
      payload
    };
  }

  async function request(action, payload = {}, options = {}) {
    const base = getBackendUrl();
    if (!base || !originalFetch) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 15000);
    try {
      const response = await originalFetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(backendBody(action, payload, options)),
        signal: controller.signal,
        redirect: 'follow'
      });
      const text = await response.text();
      let data = {};
      try { data = JSON.parse(text); }
      catch { data = { ok: response.ok, text }; }
      if (!response.ok || data.ok === false) throw new Error(data.error || `Shared backend error: ${response.status}`);
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function get(action, payload = {}, options = {}) {
    const base = getBackendUrl();
    if (!base || !originalFetch) return null;
    const session = getSession();
    const params = new URLSearchParams({
      action,
      projectId: payload.projectId || options.projectId || getProjectId(),
      projectName: getProjectName(),
      sessionToken: payload.sessionToken || session?.sessionToken || session?.token || ''
    });
    for (const [key, value] of Object.entries(payload || {})) {
      if (value == null || typeof value === 'object') continue;
      params.set(key, String(value));
    }
    const response = await originalFetch(`${base}?${params.toString()}`, { cache: 'no-store', redirect: 'follow' });
    const data = await response.json();
    if (!response.ok || data.ok === false) throw new Error(data.error || `Shared backend error: ${response.status}`);
    return data;
  }

  async function login(username, password, displayName) {
    const result = await request('login', { username, password, displayName, userAgent: navigator.userAgent });
    const session = result.session || result.data?.session || result;
    setSession(session);
    return session;
  }

  async function register(username, password, displayName) {
    const result = await request('register', { username, password, displayName, userAgent: navigator.userAgent });
    const session = result.session || result.data?.session || result;
    setSession(session);
    return session;
  }

  async function logout() {
    try { await request('logout', {}); }
    catch {}
    setSession(null);
  }

  const pathMap = {
    '/api/profile': 'profile',
    '/api/post': 'post',
    '/api/comment': 'comment',
    '/api/reaction': 'reaction',
    '/api/messages': 'message',
    '/api/import/history': 'importHistory',
    '/api/story': 'story',
    '/api/export': 'exportData',
    '/api/presence': 'presence',
    '/api/event': 'event',
    '/api/file': 'file',
    '/api/messenger/envelope': 'messengerEnvelope',
    '/api/room/join': 'roomJoin',
    '/api/room/heartbeat': 'roomHeartbeat',
    '/api/room/leave': 'roomLeave',
    '/api/room/signal': 'roomSignal',
    '/api/room/chat': 'roomChat',
    '/api/room/reaction': 'roomReaction',
    '/api/room/raise-hand': 'roomRaiseHand'
  };

  async function api(path, options = {}) {
    if (!isEnabled()) return null;
    if (path === '/api/state') return (await get('state')).state;
    if (path === '/api/online-users') return await get('onlineUsers');
    if (path === '/api/messenger/history') return await get('messengerHistory');
    const action = pathMap[path];
    if (!action) return null;
    const payload = parseBody(options);
    const result = await request(action, payload);
    return unwrapForLocalShape(action, result);
  }

  function unwrapForLocalShape(action, result) {
    if (!result || typeof result !== 'object') return result;
    if (action === 'event') return result;
    if (action === 'exportData') return result.data || result.export || result;
    if (action === 'messengerEnvelope') return result;
    if (result.state) return result.state;
    return result;
  }

  async function saveFeature(feature, payload = {}) {
    const map = {
      profile: 'profile', post: 'post', comment: 'comment', reaction: 'reaction', channelMessage: 'message',
      message: 'message', story: 'story', event: 'event', file: 'file', presence: 'presence',
      messenger: 'messengerEnvelope', roomJoin: 'roomJoin', roomSignal: 'roomSignal', roomChat: 'roomChat'
    };
    const action = map[feature] || feature;
    return request(action, payload);
  }

  function startStatePolling(callback, onError, intervalMs = POLL_MS) {
    let stopped = false;
    let timer = 0;
    async function tick() {
      if (stopped || !isEnabled()) return;
      try {
        const result = await get('state');
        if (result?.state) callback(result.state);
      } catch (error) {
        onError?.(error);
      }
      if (!stopped) timer = setTimeout(tick, intervalMs);
    }
    tick();
    return () => { stopped = true; clearTimeout(timer); };
  }

  function startRoomPolling(room, peerId, handler, onError, intervalMs = ROOM_POLL_MS) {
    let stopped = false;
    let timer = 0;
    let since = 0;
    async function tick() {
      if (stopped || !isEnabled()) return;
      try {
        const result = await get('roomPoll', { room, peerId, since });
        since = result.now || Date.now();
        if (Array.isArray(result.events)) result.events.forEach(handler);
        if (Array.isArray(result.participants)) handler({ event: 'participants', data: result.participants });
      } catch (error) {
        onError?.(error);
      }
      if (!stopped) timer = setTimeout(tick, intervalMs);
    }
    tick();
    return () => { stopped = true; clearTimeout(timer); };
  }

  function startHeartbeat(profileProvider, onError, intervalMs = HEARTBEAT_MS) {
    let stopped = false;
    let timer = 0;
    async function beat() {
      if (stopped || !isEnabled() || !getSession()) return;
      try {
        const profile = typeof profileProvider === 'function' ? profileProvider() : (profileProvider || {});
        await request('heartbeat', profile || {});
      } catch (error) {
        onError?.(error);
      }
      if (!stopped) timer = setTimeout(beat, intervalMs);
    }
    beat();
    return () => { stopped = true; clearTimeout(timer); };
  }

  function svgIconDataUrl(label, background = '#003C42', foreground = '#E8FFFF') {
    const text = String(label || 'SA').trim().slice(0, 2).toUpperCase() || 'SA';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="104" fill="${background}"/><circle cx="256" cy="256" r="190" fill="none" stroke="#00ffff" stroke-width="18" opacity=".8"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-size="172" font-weight="700" fill="${foreground}">${text}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function applyDynamicManifest() {
    const name = getProjectName();
    const icon = svgIconDataUrl(name);
    const manifest = {
      name,
      short_name: name.slice(0, 12) || 'Project',
      description: 'Private small-network social application with shared Messenger Plug-in backend.',
      start_url: location.href.split('#')[0],
      scope: location.href.split('#')[0].replace(/[^/]*$/, ''),
      display: 'standalone',
      background_color: '#000305',
      theme_color: '#003C42',
      icons: [
        { src: icon, sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
        { src: icon, sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
      ]
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/manifest+json' });
    const url = URL.createObjectURL(blob);
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = url;
    document.title = name;
    return manifest;
  }

  let deferredInstallPrompt = null;
  global.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    document.dispatchEvent(new CustomEvent('social-install-ready'));
  });

  async function promptInstall() {
    applyDynamicManifest();
    if (!deferredInstallPrompt) {
      throw new Error('Install prompt is not available yet. Use the browser menu: Install app / Add to Home screen.');
    }
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    return choice;
  }

  function setProject(name, id) {
    if (name) localStorage.setItem(PROJECT_NAME_KEY, String(name).trim());
    if (id) localStorage.setItem(PROJECT_KEY, slug(id, 'project'));
    applyDynamicManifest();
  }

  function ensureAuthStyles() {
    if (document.getElementById('social-shared-backend-sdk-styles')) return;
    const style = document.createElement('style');
    style.id = 'social-shared-backend-sdk-styles';
    style.textContent = `
      .ssb-sdk-auth{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.72);font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#e8ffff}
      .ssb-sdk-auth[hidden]{display:none}.ssb-sdk-auth form{width:min(430px,96vw);background:#03161a;color:#e8ffff;border:2px solid #00d9d9;border-radius:18px;padding:18px;box-shadow:0 18px 60px rgba(0,0,0,.55)}
      .ssb-sdk-auth h2{margin:.2rem 0 .4rem}.ssb-sdk-auth p{margin:.2rem 0 1rem;line-height:1.35}.ssb-sdk-auth label{display:grid;gap:5px;margin:10px 0}.ssb-sdk-auth input{border:2px solid #00d9d9;border-radius:10px;padding:10px;background:#effbff;color:#03161a}.ssb-sdk-auth .row{display:flex;gap:8px;flex-wrap:wrap}.ssb-sdk-auth button{border:0;border-radius:999px;padding:10px 13px;font-weight:800;cursor:pointer}.ssb-sdk-auth .primary{background:#e8ffff;color:#003c42}.ssb-sdk-auth .secondary{background:#003c42;color:#e8ffff;border:1px solid #00d9d9}.ssb-sdk-auth .hint{font-size:.9rem;opacity:.86}`;
    document.head.appendChild(style);
  }

  async function ensureSession(options = {}) {
    if (!isEnabled()) return null;
    const existing = getSession();
    if (existing?.sessionToken || existing?.token) return existing;
    if (options.silent) return null;
    ensureAuthStyles();
    let overlay = document.getElementById('social-shared-backend-sdk-auth');
    if (!overlay) {
      overlay = document.createElement('section');
      overlay.id = 'social-shared-backend-sdk-auth';
      overlay.className = 'ssb-sdk-auth';
      overlay.innerHTML = `<form>
        <h2>Messenger Plug-in Sign in</h2>
        <p class="hint">This project uses the shared backend. Normal username/password fields allow Google Password Manager autofill.</p>
        <label>Username <input name="username" autocomplete="username" required></label>
        <label>Password <input name="password" type="password" autocomplete="current-password" required></label>
        <label>Display name <input name="displayName" autocomplete="nickname" placeholder="Shown to friends"></label>
        <div class="row"><button class="primary" type="submit">Login</button><button class="secondary" type="button" data-register>Register</button>${options.allowLocal ? '<button class="secondary" type="button" data-local>Use local/offline</button>' : ''}</div>
      </form>`;
      document.body.appendChild(overlay);
    }
    overlay.hidden = false;
    const form = overlay.querySelector('form');
    async function finish(mode) {
      const username = form.elements.username.value.trim();
      const password = form.elements.password.value;
      const displayName = form.elements.displayName.value.trim() || username;
      if (!username || !password) throw new Error('Username and password are required.');
      const session = mode === 'register' ? await register(username, password, displayName) : await login(username, password, displayName);
      overlay.hidden = true;
      return session;
    }
    return new Promise((resolve, reject) => {
      form.onsubmit = async (event) => { event.preventDefault(); finish('login').then(resolve, reject); };
      form.querySelector('[data-register]')?.addEventListener('click', () => finish('register').then(resolve, reject), { once: true });
      form.querySelector('[data-local]')?.addEventListener('click', () => { disableBackend(); overlay.hidden = true; resolve(null); }, { once: true });
    });
  }

  function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data ?? {}), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
  }

  async function requestBodyFromFetch(init) {
    const body = init?.body;
    if (!body) return {};
    if (typeof body === 'string') {
      try { return JSON.parse(body); } catch { return {}; }
    }
    if (body instanceof Blob) {
      try { return JSON.parse(await body.text()); } catch { return {}; }
    }
    if (body instanceof FormData) {
      return Object.fromEntries(body.entries());
    }
    return body;
  }

  function shouldBridgeUrl(input, init) {
    if (!isEnabled() || !originalFetch) return null;
    const raw = typeof input === 'string' ? input : input?.url;
    if (!raw) return null;
    const url = new URL(raw, location.href);
    if (url.origin !== location.origin) return null;
    const path = url.pathname;
    if (path === '/api/state' || path === '/api/online-users' || path === '/api/messenger/history' || pathMap[path]) return { url, path };
    return null;
  }

  function installFetchBridge() {
    if (!originalFetch || global.__socialSharedBackendFetchBridgeInstalled) return;
    global.__socialSharedBackendFetchBridgeInstalled = true;
    global.fetch = async function socialSharedBackendFetch(input, init = {}) {
      const bridged = shouldBridgeUrl(input, init);
      if (!bridged) return originalFetch(input, init);
      try {
        const method = String(init.method || (typeof input !== 'string' ? input.method : 'GET') || 'GET').toUpperCase();
        let result;
        if (method === 'GET') {
          if (bridged.path === '/api/state') result = await api('/api/state');
          else if (bridged.path === '/api/online-users') result = await api('/api/online-users');
          else if (bridged.path === '/api/messenger/history') result = await api('/api/messenger/history');
          else result = await api(bridged.path, { method: 'GET' });
        } else {
          const body = await requestBodyFromFetch(init);
          result = await api(bridged.path, { method, body: JSON.stringify(body || {}) });
        }
        return jsonResponse(result, 200);
      } catch (error) {
        return jsonResponse({ ok: false, error: error.message || String(error) }, 400);
      }
    };
  }

  const Bridge = {
    URL_KEY,
    SESSION_KEY,
    PROJECT_KEY,
    DISABLED_KEY,
    DEFAULT_BACKEND_URL,
    DEPLOYMENT_ID,
    getDefaultBackendUrl,
    getBackendUrl,
    setBackendUrl,
    useDefaultBackend,
    disableBackend,
    getSession,
    setSession,
    isEnabled,
    request,
    get,
    api,
    saveFeature,
    login,
    register,
    logout,
    ensureSession,
    startHeartbeat,
    startStatePolling,
    startRoomPolling,
    getProjectId,
    getProjectName,
    setProject,
    applyDynamicManifest,
    promptInstall,
    installFetchBridge,
    pathMap
  };

  global.SocialSharedBackend = Bridge;
  installFetchBridge();
  applyDynamicManifest();
})(window);
