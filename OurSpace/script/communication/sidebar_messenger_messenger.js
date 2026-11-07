
(function (global) {
  'use strict';

  const DEFAULT_TIMEOUT = 8000;

  function jsonClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  class MessengerBackendBridge extends EventTarget {
    constructor(config) {
      super();
      this.config = Object.assign({
        socketUrl: '',
        httpEndpoint: '',
        clientId: 'client_' + Math.random().toString(36).slice(2),
        appName: 'Sidebar Messenger',
        reconnectMs: 1800,
        timeoutMs: DEFAULT_TIMEOUT
      }, config || {});
      this.socket = null;
      this.connected = false;
      this.queue = [];
      this.channel = null;
      this.closed = false;
      this.pollTimer = 0;
      this.storageKey = 'ourspace.messenger.bridge.v3';
      this.connect();
      this.setupLocalBroadcast();
    }

    setupLocalBroadcast() {
      if ('BroadcastChannel' in global) {
        this.channel = new BroadcastChannel('messenger-plugin-local');
        this.channel.onmessage = (event) => {
          const envelope = event.data;
          if (!envelope || envelope.clientId === this.config.clientId) return;
          this.emitEnvelope(envelope, 'broadcast');
        };
      }
      global.addEventListener('storage', (event) => {
        if (event.key !== this.storageKey || !event.newValue) return;
        try {
          const envelope = JSON.parse(event.newValue);
          if (envelope.clientId !== this.config.clientId) this.emitEnvelope(envelope, 'storage');
        } catch (error) {}
      });
    }

    connect() {
      if (!this.config.socketUrl || this.closed || !('WebSocket' in global)) return;
      try {
        const socket = new WebSocket(this.config.socketUrl);
        this.socket = socket;
        socket.addEventListener('open', () => {
          this.connected = true;
          this.emitStatus();
          this.sendRaw({ type: 'hello', clientId: this.config.clientId, appName: this.config.appName });
          this.flush();
        });
        socket.addEventListener('message', (event) => {
          try {
            const envelope = JSON.parse(event.data);
            this.emitEnvelope(envelope, 'socket');
          } catch (error) {
            console.warn('Messenger socket message parse failed:', error);
          }
        });
        socket.addEventListener('close', () => {
          this.connected = false;
          this.emitStatus();
          if (!this.closed) global.setTimeout(() => this.connect(), this.config.reconnectMs);
        });
        socket.addEventListener('error', () => {
          this.connected = false;
          this.emitStatus();
        });
      } catch (error) {
        this.connected = false;
        this.emitStatus();
      }
    }

    emitStatus() {
      this.dispatchEvent(new CustomEvent('status', { detail: { connected: this.connected, queued: this.queue.length } }));
    }

    emitEnvelope(envelope, source) {
      this.dispatchEvent(new CustomEvent('envelope', { detail: { envelope, source } }));
      if (envelope && envelope.type) {
        this.dispatchEvent(new CustomEvent(envelope.type, { detail: envelope }));
      }
    }

    makeEnvelope(type, payload) {
      return {
        type,
        payload: payload || {},
        id: (payload && payload.id) || `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        clientId: this.config.clientId,
        createdAt: new Date().toISOString(),
        appName: this.config.appName
      };
    }

    async send(type, payload) {
      const envelope = this.makeEnvelope(type, payload);
      this.persistLocal(envelope);
      if (this.channel) this.channel.postMessage(jsonClone(envelope));
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendRaw(envelope);
      } else if (this.config.socketUrl) {
        this.queue.push(envelope);
        this.emitStatus();
      }
      if (this.config.httpEndpoint) this.postHttp(envelope).catch(() => undefined);
      return envelope;
    }

    sendRaw(envelope) {
      try { this.socket.send(JSON.stringify(envelope)); }
      catch (error) {
        this.queue.push(envelope);
        this.emitStatus();
      }
    }

    flush() {
      const queued = this.queue.splice(0);
      queued.forEach((envelope) => this.sendRaw(envelope));
      this.emitStatus();
    }

    async postHttp(envelope) {
      const controller = new AbortController();
      const timer = global.setTimeout(() => controller.abort(), this.config.timeoutMs);
      try {
        const response = await fetch(this.config.httpEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(envelope),
          signal: controller.signal
        });
        return response.ok ? response : Promise.reject(new Error('HTTP backend rejected envelope'));
      } finally {
        global.clearTimeout(timer);
      }
    }

    persistLocal(envelope) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(envelope));
      } catch (error) {}
    }

    close() {
      this.closed = true;
      if (this.socket) this.socket.close();
      if (this.channel) this.channel.close();
    }
  }

  global.MessengerBackendBridge = MessengerBackendBridge;
})(window);

(function (global) {
  'use strict';

  const VERSION = '2.1.0-sidebar';
  const STORE_KEY = 'ourspace.messenger.v3.' + (document.documentElement.dataset.profile || 'william');

  if (!global.CSS) global.CSS = {};
  if (!global.CSS.escape) {
    global.CSS.escape = function (value) { return String(value).replace(/[^a-zA-Z0-9_-]/g, function (char) { return '\\' + char; }); };
  }

  const DEFAULT_STICKERS = ['😀','😂','😍','😎','😭','😡','👍','👎','❤️','✨','🔥','🎲','🐉','🧙','🛡️','🗡️','📜','🧪','👑','💀','🐈‍⬛','🦖','🌙','⭐','💬','⚡','🪄','🍄'];
  const DEFAULT_GIFS = [];
  const DEFAULT_ICE = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }];
  const STATUSES = ['online', 'away', 'busy', 'offline'];

  const $ = (a,b) => typeof a === 'string' ? (b || document).querySelector(a) : a.querySelector(b);
  const $$ = (a,b) => Array.from(typeof a === 'string' ? (b || document).querySelectorAll(a) : a.querySelectorAll(b));
  const nowIso = () => new Date().toISOString();
  const uid = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const safeId = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
  const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  const time = (iso) => new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
  const date = (iso) => new Intl.DateTimeFormat([], { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(iso));
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  const textToHtml = (value) => escapeHtml(value).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g, '<br>');
  const canMedia = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function loadStored() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch (error) { return {}; }
  }

  function saveStored(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (error) { /* Browser storage unavailable; keep this session in memory. */ }
  }

  class MessengerPluginApp {
    constructor(config) {
      this.config = Object.assign({
        appName: 'Sidebar Messenger',
        mount: '#sidebar-messenger-root',
        users: [],
        rooms: [],
        currentUser: null,
        maxCallParticipants: 10,
        socketUrl: '',
        httpEndpoint: '',
        iceServers: DEFAULT_ICE,
        stickers: DEFAULT_STICKERS,
        gifs: DEFAULT_GIFS
      }, config || {});
      this.root = typeof this.config.mount === 'string' ? document.querySelector(this.config.mount) : this.config.mount;
      if (!this.root) throw new Error('Sidebar Messenger mount not found');
      this.stored = loadStored();
      this.clientId = this.stored.clientId || uid('mpclient-' + (document.documentElement.dataset.profile || 'member'));
      this.users = this.prepareUsers(this.config.users);
      this.rooms = this.prepareRooms(this.config.rooms);
      this.currentUser = this.prepareCurrentUser(this.config.currentUser);
      this.status = this.stored.status || this.currentUser.status || 'online';
      this.messages = this.stored.messages || this.seedMessages();
      this.openTabs = this.stored.openTabs || [];
      this.minimized = this.stored.minimized || {};
      this.activePanel = '';
      this.activeConversationId = this.stored.activeConversationId || this.openTabs[this.openTabs.length - 1] || '';
      this.panelGeometry = this.stored.panelGeometry && typeof this.stored.panelGeometry === 'object' ? this.stored.panelGeometry : {};
      this.menuScrollTop = 0;
      this.panelResizeObserver = null;
      this.typing = {};
      this.unread = this.stored.unread || {};
      this.missedCalls = Math.max(0,Number(this.stored.missedCalls)||0);
      this.incomingCall = null;
      this.householdTodayCache = {count:0,items:[],updatedAt:0};
      this.quickReplies = this.loadQuickReplies();
      this.call = null;
      this.camera = { stream: null, targetConversationId: null };
      this.recorder = { mediaRecorder: null, chunks: [], stream: null, targetConversationId: null };
      this.bridge = new global.MessengerBackendBridge({
        socketUrl: this.config.socketUrl,
        httpEndpoint: this.config.httpEndpoint,
        clientId: this.clientId,
        appName: this.config.appName
      });
      this.bridge.addEventListener('envelope', (event) => this.receiveEnvelope(event.detail.envelope, event.detail.source));
      this.bridge.addEventListener('status', () => this.renderSidebar());
      this.render();
      setTimeout(()=>this.updateWallet(),0);
      this.announcePresence();
      this.presenceTimer = setInterval(() => this.announcePresence(), 25000);
      this.callPollBusy=false;this.callPollTimer=setInterval(()=>this.pollBackendCallSignals(),3000);
      Promise.resolve().then(()=>this.pollBackendCallSignals());
    }

    prepareUsers(users) {
      const base = Array.isArray(users) ? users.slice() : [];
      const normalized = base.map((user, index) => Object.assign({
        id: safeId(user.id || user.label || `user-${index + 1}`),
        label: user.label || user.id || `User ${index + 1}`,
        avatar: user.avatar || '👤',
        status: user.status || 'offline',
        mood: user.mood || ''
      }, user));
      if (!normalized.length) {
        normalized.push({ id: 'me', label: 'Me', avatar: '🙂', status: 'online', mood: '' });
        normalized.push({ id: 'friend', label: 'Friend', avatar: '👋', status: 'online', mood: '' });
      }
      return normalized.slice(0, 10);
    }

    prepareRooms(rooms) {
      const base = Array.isArray(rooms) ? rooms.slice() : [];
      if (!base.some((room) => room.id === 'ourspace-shared')) base.unshift({ id: 'ourspace-shared', label: 'Shared Lounge', avatar: '⚡' });
      return base.map((room, index) => Object.assign({
        id: safeId(room.id || room.label || `room-${index + 1}`),
        label: room.label || room.id || `Room ${index + 1}`,
        avatar: room.avatar || '#',
        members: room.members || this.users.map((user) => user.id).slice(0, 10)
      }, room));
    }

    prepareCurrentUser(currentUser) {
      let user = currentUser || this.stored.currentUser || this.users[0];
      if (typeof user === 'string') user = this.users.find((candidate) => candidate.id === user) || this.users[0];
      const matched = this.users.find((candidate) => candidate.id === user.id) || user;
      return Object.assign({}, matched, user, { status: this.status || matched.status || 'online' });
    }

    seedMessages() {
      return {};
    
    }

    persist() {
      saveStored({
        clientId: this.clientId,
        currentUser: this.currentUser,
        status: this.status,
        messages: this.messages,
        openTabs: this.openTabs,
        minimized: this.minimized,
        activeConversationId: this.activeConversationId,
        panelGeometry: this.panelGeometry,
        unread: this.unread,
        missedCalls:this.missedCalls
      });
    }

    render() {
      document.documentElement.classList.add('sidebar-messenger-active');
      this.root.className = 'mp-root mp-vertical-root';
      this.root.dataset.mpUi = 'vertical';
      this.root.innerHTML = `
        <div class="mp-windows" data-mp-windows></div>
        <section class="mp-panel is-hidden" data-panel="quick" aria-label="Quick Chat"></section>
        <section class="mp-panel is-hidden" data-panel="friends" aria-label="Chats"></section>
        <section class="mp-panel is-hidden" data-panel="rooms" aria-label="Rooms"></section>
        <section class="mp-panel is-hidden" data-panel="unread" aria-label="Unread messages"></section>
        <section class="mp-panel is-hidden" data-panel="messages" aria-label="Messages"></section>
        <section class="mp-panel is-hidden" data-panel="today" aria-label="Tasks, appointments and goals"></section>
        <section class="mp-call-window is-hidden" data-call-window></section>
        <section class="mp-incoming-call is-hidden" data-incoming-call role="dialog" aria-modal="true" aria-label="Incoming voice or video call"></section>
        <section class="mp-modal is-hidden" data-camera-modal></section>
        <div class="mp-toast-stack" data-toast-stack aria-live="polite"></div>
        <nav class="mp-sidebar mp-vertical-menu" data-sidebar aria-label="Sidebar Messenger menu"></nav>
      `;
      this.renderAll();
      this.bindGlobalEvents();
      document.addEventListener('ourspace:appearancechange',()=>this.updateModeToggle());
      global.addEventListener('ourspace:calendar-alert',event=>{this.signalAlert('calendar',event.detail);this.refreshToday()});
      global.addEventListener('ourspace:household-updated',()=>this.refreshToday());
      global.addEventListener('storage',event=>{if(event.key==='ourspace_household_organizer_v1')this.refreshToday()});
      this.householdTodayTimer=setInterval(()=>{if(Date.now()-this.householdTodayCache.updatedAt>60000)this.refreshToday()},60000);
      global.addEventListener('ourspace:pin-alert',event=>this.signalAlert('pin',event.detail));
      global.addEventListener('ourspace:room-alert',event=>this.signalAlert('room',event.detail));
      global.addEventListener('ourspace:quick-chat-alert',event=>this.signalAlert('quick',event.detail));
    }

    renderAll() {
      this.renderWindows();
      this.renderChatsPanel();
      this.renderRoomsPanel();
      this.renderCategoryPanel('quick');
      this.renderCategoryPanel('unread');
      this.renderCategoryPanel('messages');
      this.renderCategoryPanel('today');
      this.renderCallWindow();
      this.renderIncomingCall();
      this.renderCameraModal();
      this.renderSidebar();
      this.configureOpenPanel();
    }

    bindGlobalEvents() {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          this.activePanel = '';
          this.closeCamera();
          this.renderAll();
        }
      });
      global.addEventListener('resize', () => { this.configureOpenPanel(); this.updateMenuThumb(); });
    }

    conversationSummaries() {
      const ids = new Set([
        ...this.rooms.map(room => room.id), ...Object.keys(this.messages),
        ...this.openTabs, ...Object.keys(this.unread)
      ]);
      return [...ids].map(id => {
        const item = this.getConversation(id) || { id, label: id, avatar: '💬' };
        const list = Array.isArray(this.messages[id]) ? this.messages[id] : [];
        const latest = list[list.length - 1];
        const today = list.filter(message => message.createdAt && sameDay(message.createdAt, Date.now())).length;
        return { id, item, latest, total: list.length, today, unread: Number(this.unread[id] || 0) };
      }).sort((a,b) => (b.latest ? Date.parse(b.latest.createdAt) || 0 : 0) - (a.latest ? Date.parse(a.latest.createdAt) || 0 : 0));
    }

    totalCounts() {
      const summaries = this.conversationSummaries();
      return {
        unread: summaries.reduce((n, x) => n + x.unread, 0),
        messages: summaries.reduce((n, x) => n + x.total, 0),
        today: this.readHouseholdToday().count,
        missed: this.missedCalls
      };
    }

    // Household is the authoritative source; Messenger does not manufacture calendar events.
    readHouseholdToday(){
      const now=new Date();const day=now.toLocaleDateString('en-CA').replace(/\//g,'-');
      const localDate=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const profile=document.documentElement.dataset.profile||this.currentUser.id;
      const items=[],seen=new Set();const add=(id,title,kind)=>{if(seen.has(id))return;seen.add(id);items.push({id,title:String(title||kind).slice(0,180),kind})};
      const due=(t)=>{if(!t||t.active===false)return false;const f=t.frequency||'on_demand';
        if(f==='on_demand')return true;if(f==='daily')return true;
        if(f==='weekly'){const wd=Array.isArray(t.weekdays)?t.weekdays.map(Number):[];return wd.includes(now.getDay())}
        if(f==='monthly')return Number(t.dayOfMonth||1)===now.getDate();
        if(f==='annually')return Number(t.dayOfMonth||1)===now.getDate()&&Number(t.month||1)===now.getMonth()+1;
        return t.date===localDate||t.dueDate===localDate;
      };
      try{
        const data=JSON.parse(localStorage.getItem('ourspace_household_organizer_v1')||'null');
        if(data){
          const completed=new Set((data.completions||[]).filter(x=>x.date===localDate&&!x.undoneAt).map(x=>x.taskId));
          for(const t of data.tasks||[]){
            if(t.assignee&&t.assignee!=='shared'&&t.assignee!==profile)continue;
            if(!due(t)||completed.has(t.id))continue;
            add('task:'+t.id,t.title,/dbt|adhd/i.test(t.type||'')?'DBT homework':(/therapy/i.test((t.title||'')+' '+(t.description||''))?'Therapy':(/goal/i.test((t.title||'')+' '+(t.description||''))?'Goal':'Task')));
          }
          for(const e of data.events||[]){
            if(e.assignee&&e.assignee!=='shared'&&e.assignee!==profile)continue;
            const start=String(e.startDate||e.date||'');const f=e.frequency||'once';
            let today=e.date===localDate||e.startDate===localDate;
            if(!today&&start<=localDate){
              const d=new Date(`${start}T12:00:00`);
              if(!Number.isNaN(d.getTime()))today=f==='daily'||(f==='weekly'&&d.getDay()===now.getDay())||(f==='monthly'&&d.getDate()===now.getDate())||(f==='annually'&&d.getDate()===now.getDate()&&d.getMonth()===now.getMonth());
            }
            if(today)add('event:'+e.id,e.title,/therapy/i.test(e.category||e.title||'')?'Therapy':'Appointment');
          }
        }
      }catch(_){}
      this.householdTodayCache={count:items.length,items,updatedAt:Date.now()};return this.householdTodayCache;
    }
    refreshToday(){this.householdTodayCache.updatedAt=0;this.renderSidebar();this.renderCategoryPanel('today');}
    getDirectCallId(userId){
      const peer=this.users.find(x=>x.id===userId&&x.id!==this.currentUser.id);if(!peer)return '';
      const ids=[this.currentUser.id,peer.id].sort();const id='dm-'+ids.join('-');
      if(!this.rooms.some(r=>r.id===id))this.rooms.push({id,label:peer.label,avatar:peer.avatar||'👤',members:ids,direct:true});
      this.messages[id]=this.messages[id]||[];return id;
    }
    startPhoneCall(userId,video){
      const id=this.getDirectCallId(userId);
      if(!id)return this.toast('Choose a contact to call.');
      this.startCall(id,video);
    }
    openSitePage(page){
      const profile=document.documentElement.dataset.profile||'william';
      const script=document.querySelector('script[src*="sidebar_messenger_messenger.js"]');
      const inProfile=/\/assets\/code\/(?:william|jasper)\.html$/i.test(location.pathname);
      const url=inProfile?new URL(location.href):new URL('../assets/code/'+profile+'.html',script?.src||location.href);
      url.searchParams.set('page',page);location.assign(url.href);
    }
    renderSidebar() {
      const sidebar = $('[data-sidebar]', this.root);
      if (!sidebar) return;
      const oldScroll = $('[data-menu-scroll]', sidebar);
      if (oldScroll) this.menuScrollTop = oldScroll.scrollTop;
      const counts = this.totalCounts();
      const active = this.activePanel;
      const activeConversation = this.getConversation(this.activeConversationId);
      const selectedChat = active === 'conversation' && activeConversation && !!activeConversation.direct;
      const selectedRoom = active === 'conversation' && activeConversation && !activeConversation.direct;
      const entries = [
        ['quick', '⚡', 'Quick Chat', 'Start a conversation'],
        ['friends', '🗨️', 'Chats', 'Open your chats'],
        ['rooms', '🏰', 'Rooms', 'Open group rooms'],
        ['unread', '📞', `[${counts.missed}] missed`, 'Calls and missed calls'],
        ['messages', '📌', `[${counts.messages}] messages`, 'All conversations'],
        ['today', '📆', `[${counts.today}] today`, 'Tasks, appointments, therapy, goals and DBT homework']
      ];
      sidebar.innerHTML = `
        <div class="mp-menu-scroll" data-menu-scroll id="mpMenuScroll" tabindex="0" aria-label="Messenger menu">
          <div class="mp-menu-items">
            ${entries.map(([key, icon, label, description]) => {
              const selected = active === key || (key === 'friends' && selectedChat) || (key === 'rooms' && selectedRoom);
              return `<button type="button" class="mp-rail-item ${selected ? 'is-active' : ''}" data-action="toggle-panel" data-panel-name="${key}" aria-pressed="${selected}" title="${escapeHtml(description)}"><span class="mp-rail-icon" aria-hidden="true">${icon}</span><span class="mp-rail-label">${escapeHtml(label)}</span></button>`;
            }).join('')}
          </div>
        </div>
        <div class="mp-menu-footer">
          <button type="button" class="mp-mode-toggle" data-action="toggle-mode" aria-pressed="false"><span class="mp-mode-icon" aria-hidden="true">◑</span><strong class="mp-mode-label">Dark mode</strong></button>
          <section class="mp-currency-tracker" aria-label="Currency tracker">
            <strong class="mp-wallet-title">Currency tracker</strong>
            <div class="mp-wallet-site">${escapeHtml(document.documentElement.dataset.siteName || (document.documentElement.dataset.profile==='jasper' ? "Squishy's Cottage" : 'Dino Nerdzone'))}</div>
            <div class="mp-wallet-denominations"><span><b>[<em data-wallet-copper>0</em>]</b><small>Copper</small></span><span><b>[<em data-wallet-silver>0</em>]</b><small>Silver</small></span><span><b>[<em data-wallet-gold>0</em>]</b><small>Gold</small></span><span><b>[<em data-wallet-platinum>0</em>]</b><small>Platinum</small></span></div>
            <small>${escapeHtml(this.currentUser.label)}'s currency · 10:1 exchange</small>
          </section>
        </div>
      `;
      $$ (sidebar, '[data-action]').forEach(button => button.addEventListener('click', event => this.handleAction(event)));
      const scroller = $('[data-menu-scroll]', sidebar);
      scroller.scrollTop = this.menuScrollTop;
      scroller.addEventListener('scroll', () => {
        this.menuScrollTop = scroller.scrollTop;
        this.updateMenuThumb();
      }, { passive: true });
      this.updateModeToggle();
      this.updateWallet();
    }

    getSidebarScrollTarget(){return $('[data-menu-scroll]',this.root)}
    updateMenuThumb(){} // Native teal/persimmon scrollbar belongs only to the menu.
    bindMenuScrollbar(){}

    updateModeToggle(){
      const button=$('[data-action="toggle-mode"]',this.root);if(!button)return;
      const dark=(window.OurSpaceAppearance?.mode||document.documentElement.dataset.osColorMode)==='dark';
      button.querySelector('.mp-mode-icon').textContent=dark?'◐':'◑';
      button.querySelector('.mp-mode-label').textContent=dark?'Light Mode':'Dark mode';
      button.setAttribute('aria-pressed',String(dark));
    }
    updateWallet(){
      let total=0;
      try {const s=JSON.parse(localStorage.getItem('ourspace_household_organizer_v1')||'{}');const who=this.currentUser?.id||'';const member=(s.household?.members||[]).find(x=>x.id===who);total=Math.max(0,Math.floor(Number(member?.walletCopper)||0));} catch (_) {}
      const w={platinum:Math.floor(total/1000),gold:Math.floor(total%1000/100),silver:Math.floor(total%100/10),copper:total%10};
      for(const key of ['copper','silver','gold','platinum']){
        const el=this.root.querySelector(`[data-wallet-${key}]`);if(el)el.textContent=String(w[key]||0);
      }
    }
    canUseCallBackend(){const a=global.OurSpaceAuth;return !!(a?.isAuthenticated?.()&&a?.profile?.()===this.currentUser.id&&typeof a.request==='function')}
    async requestCallBackend(action,values){
      if(!this.canUseCallBackend())return null;
      try{return await global.OurSpaceAuth.request(action,values,{timeout:11000})}catch(err){
        console.warn('OurSpace call backend unavailable:',action,String(err?.message||err));return null;
      }
    }
    async sendCallBackendSignal(type,event,payload,callId){
      const id=callId||this.call?.backendCallId||this.incomingCall?.backendCallId;
      if(!id||!this.canUseCallBackend())return null;
      return this.requestCallBackend('call.signal.send',{callId:id,signalType:type,signal:{ourspaceMessenger:true,event,payload}});
    }
    async pollBackendCallSignals(){
      if(this.callPollBusy||!this.canUseCallBackend())return;
      this.callPollBusy=true;
      try{
        const result=await this.requestCallBackend('call.signal.list',{});
        const rows=Array.isArray(result?.signals)?result.signals:[];
        const processed=[];
        for(const item of rows){
          const data=item.signal;
          if(!data?.ourspaceMessenger||!data.event)continue;
          processed.push(item.signalId);
          const payload={...(data.payload||{}),backendCallId:item.callId};
          this.receiveEnvelope({type:data.event,clientId:'backend:'+item.signalId,payload},'backend');
        }
        if(processed.length)await this.requestCallBackend('call.signal.clear',{signalIds:processed});
      }finally{this.callPollBusy=false;}
    }
    loadQuickReplies(){
      try {const x=JSON.parse(localStorage.getItem('ourspace.messenger.quick-replies.v1.'+this.currentUser.id)||'null');
        if(Array.isArray(x)&&x.length)return x.filter(v=>typeof v==='string').map(v=>v.trim()).filter(Boolean).slice(0,12)}catch(_){}
      return ["On phone, can't talk",'Too noisy, will text','In an appointment'];
    }
    saveQuickReplies(replies){
      this.quickReplies=replies.map(x=>String(x).trim()).filter(Boolean).slice(0,12);
      try{localStorage.setItem('ourspace.messenger.quick-replies.v1.'+this.currentUser.id,JSON.stringify(this.quickReplies))}catch(_){}
    }

    renderCategoryPanel(name) {
      const panel = $(`[data-panel="${name}"]`, this.root);
      if (!panel) return;
      panel.classList.toggle('is-hidden', this.activePanel !== name);
      const summaries = this.conversationSummaries();
      const config = {
        quick: ['⚡ Quick Chat', 'Choose a person or a shared room to start messaging.'],
        unread: ['📞 Calls', 'Start a voice or video call, or review missed calls.'],
        messages: ['📌 Messages', 'Browse all conversations and message totals.'],
        today: ['📆 Today', 'Tasks, appointments, therapy, goals and DBT homework.']
      }[name];
      let rows = '';
      if (name === 'quick') {
        const people = this.users.filter(u => u.id !== this.currentUser.id);
        rows = `
          <div class="mp-section-title">💬 Direct messages</div>
          <div class="mp-contact-list">${people.map(user => `<button class="mp-contact" data-action="open-dm" data-user-id="${escapeHtml(user.id)}"><span class="mp-avatar">${escapeHtml(user.avatar)}</span><span class="mp-contact-main"><span class="mp-contact-name">${escapeHtml(user.label)}</span><span class="mp-contact-mood">Start a private conversation</span></span><span class="mp-contact-tools">›</span></button>`).join('')}</div>
          <div class="mp-section-title">🏰 Shared spaces</div>
          <div class="mp-room-list">${this.rooms.filter(r => !r.direct).map(room => `<button class="mp-room" data-action="open-conversation" data-conversation-id="${escapeHtml(room.id)}"><span class="mp-avatar">${escapeHtml(room.avatar)}</span><span class="mp-room-main"><span class="mp-room-name">${escapeHtml(room.label)}</span><span class="mp-room-meta">Open this room</span></span><span>›</span></button>`).join('')}</div>`;
      } else {
        const filtered = summaries.filter(x => name === 'unread' ? x.unread > 0 : name === 'today' ? x.today > 0 : true);
        rows = filtered.length ? filtered.map(x => {
          const details = name === 'unread' ? `${x.unread} unread` : name === 'today' ? `${x.today} today` : `${x.total} total`;
          const preview = x.latest ? (x.latest.text || (x.latest.attachments && x.latest.attachments.length ? '📎 Attachment' : 'Sticker or activity')) : 'No messages yet';
          return `<button class="mp-summary-row" data-action="open-conversation" data-conversation-id="${escapeHtml(x.id)}"><span class="mp-avatar">${escapeHtml(x.item.avatar || '💬')}</span><span class="mp-summary-text"><strong>${escapeHtml(x.item.label)}</strong><small>${escapeHtml(preview).slice(0, 140)}</small></span><span class="mp-summary-count">${escapeHtml(details)}</span></button>`;
        }).join('') : `<p class="mp-empty-state">${name === 'unread' ? "You're all caught up." : name === 'today' ? 'No messages yet today.' : 'No conversations yet. Use Quick Chat to begin.'}</p>`;
      }
      if(name==='unread'){
        const people=this.users.filter(u=>u.id!==this.currentUser.id);
        const callers=people.map(u=>`<div class="mp-phone-contact"><strong>${escapeHtml(u.avatar||'👤')} ${escapeHtml(u.label)}</strong><div class="mp-phone-actions"><button data-action="phone-call" data-user-id="${escapeHtml(u.id)}" data-call-mode="voice">📞 Voice Call</button><button data-action="phone-call" data-user-id="${escapeHtml(u.id)}" data-call-mode="video">📹 Video Call</button></div></div>`).join('');
        const missed=this.missedCalls?`<p class="mp-empty-state">${this.missedCalls} missed call${this.missedCalls===1?'':'s'}.</p><button class="mp-mini-button" data-action="clear-missed">Clear missed calls</button>`:'<p class="mp-empty-state">No missed calls.</p>';
        rows=`<h3>Call a contact</h3>${callers||'<p class="mp-empty-state">No available contacts.</p>'}<h3>Missed calls</h3>${missed}`;
      }
      if(name==='today'){
        const agenda=this.readHouseholdToday();
        rows=agenda.items.length?agenda.items.map(item=>`<div class="mp-agenda-item"><span>📆 <b>${escapeHtml(item.title)}</b></span><small>${escapeHtml(item.kind)}</small></div>`).join(''):'<p class="mp-empty-state">No tasks, appointments or assignments scheduled for today.</p>';
        rows+=`<div class="mp-agenda-links"><button data-action="open-site-page" data-page="household">🏠 Household</button><button data-action="open-site-page" data-page="communication">🗨️ Communication</button></div>`;
      }
      panel.innerHTML = `
        <div class="mp-titlebar"><span class="mp-titlebar-title">${config[0]}</span><button type="button" class="mp-title-button" data-action="toggle-panel" data-panel-name="${name}" aria-label="Close ${name}">×</button></div>
        <div class="mp-panel-body"><p class="mp-panel-description">${config[1]}</p>${rows}</div>`;
      $$ (panel, '[data-action]').forEach(button => button.addEventListener('click', event => this.handleAction(event)));
    }

    configureOpenPanel() {
      const panel = this.activePanel === 'conversation'
        ? $('[data-window-id]', this.root)
        : $(`[data-panel="${this.activePanel}"]`, this.root);
      if (!panel || panel.classList.contains('is-hidden')) return;
      const key = this.activePanel === 'conversation' ? `conversation:${this.activeConversationId}` : this.activePanel;
      if (!key) return;
      const rail = $('[data-sidebar]', this.root);
      const railRect = rail && rail.getBoundingClientRect();
      const vw = global.innerWidth, vh = global.innerHeight;
      // Sidebar is reserved space, not an area covered by the floating panel.
      // In particular, small phones must NOT let the panel overlap the rail.
      const availableRight = Math.min(vw - 8, railRect ? railRect.left - 8 : vw - 8);
      const availableWidth = Math.max(130, availableRight - 8);
      const minPanelWidth = Math.min(vw <= 700 ? 150 : 210, availableWidth);
      const saved = this.panelGeometry[key];
      const width = Math.min(availableWidth, Math.max(minPanelWidth, Number(saved?.width) || Math.min(440, availableWidth - 12)));
      const height = Math.min(vh - 16, Math.max(Math.min(260, vh - 16), Number(saved?.height) || Math.min(580, Math.max(280, vh * 0.7))));
      const activeButton = $(`[data-panel-name="${this.activePanel}"]`, this.root);
      const buttonRect = activeButton?.getBoundingClientRect();
      const left = Number.isFinite(saved?.left) ? saved.left : Math.max(8, availableRight - width - 4);
      const top = Number.isFinite(saved?.top) ? saved.top : Math.max(8, Math.min(vh - height - 8, (buttonRect?.top || (vh - height) / 2) + 10));
      const clampedLeft = Math.max(8, Math.min(availableRight - width, left));
      const clampedTop = Math.max(8, Math.min(vh - height - 8, top));
      ['left', 'top', 'width', 'height'].forEach((p, i) => panel.style.setProperty(p, `${[clampedLeft, clampedTop, width, height][i]}px`, 'important'));
      panel.style.setProperty('right', 'auto', 'important');
      panel.style.setProperty('bottom', 'auto', 'important');
      if (!panel.querySelector(':scope > .mp-edge-handle')) this.attachResizeHandles(panel, key);
      this.observePanelLayout(panel);
    }

    observePanelLayout(panel) {
      // Re-rendering replaces panel nodes. Disconnect to avoid stale observers.
      if (this.panelResizeObserver) this.panelResizeObserver.disconnect();
      const adjust = (width, height) => {
        panel.classList.toggle('mp-compact', width < 330);
        panel.classList.toggle('mp-narrow', width < 270);
        panel.classList.toggle('mp-short', height < 440);
        panel.classList.toggle('mp-very-short', height < 330);
        // Resize the CONTENT as well as the surrounding window. This ratio is
        // recalculated continuously while an edge or corner is being dragged,
        // not only at mobile/tablet breakpoints. Preserve a readable minimum.
        const userScale = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--os-sidebar-content-user-scale')) || 1;
        const uiScale = Math.min(1.7, Math.max(0.65, ((width / 420) * 0.7 + (height / 520) * 0.3) * userScale));
        panel.style.setProperty('--mp-ui-scale', uiScale.toFixed(3));
        panel.style.setProperty('--mp-current-panel-width', `${Math.round(width)}px`);
        panel.style.setProperty('--mp-current-panel-height', `${Math.round(height)}px`);
      };
      const r = panel.getBoundingClientRect();
      adjust(r.width, r.height);
      if ('ResizeObserver' in global) {
        this.panelResizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            if (entry.target !== panel) continue;
            const rect = entry.borderBoxSize?.[0];
            adjust(rect?.inlineSize || entry.target.getBoundingClientRect().width,
                   rect?.blockSize || entry.target.getBoundingClientRect().height);
          }
        });
        this.panelResizeObserver.observe(panel);
      }
    }

    attachResizeHandles(panel, key) {
      const directions = ['n','ne','e','se','s','sw','w','nw'];
      for (const edge of directions) {
        const h = document.createElement('span');
        h.className = `mp-edge-handle mp-edge-${edge}`;
        h.dataset.mpEdge = edge;
        h.setAttribute('role','separator');
        h.setAttribute('aria-label', `Resize ${edge} side of panel`);
        h.title = `Resize ${edge.toUpperCase()}`;
        panel.appendChild(h);
        h.addEventListener('pointerdown', e => this.startPanelMove(e, panel, key, edge));
      }
      const header = panel.querySelector(':scope > .mp-titlebar');
      if (header) {
        header.title = 'Drag to move this panel';
        header.addEventListener('pointerdown', e => {
          if (e.target.closest('button, input, a, select')) return;
          this.startPanelMove(e, panel, key, 'move');
        });
      }
    }

    startPanelMove(event, panel, key, edge) {
      if (event.button !== 0) return;
      event.preventDefault();
      const initial = panel.getBoundingClientRect();
      const x0 = event.clientX, y0 = event.clientY;
      const railRect = $('[data-sidebar]', this.root)?.getBoundingClientRect();
      const maxRight = Math.min(global.innerWidth - 8, railRect ? railRect.left - 8 : global.innerWidth - 8);
      const minW = Math.min(global.innerWidth <= 700 ? 150 : 210, Math.max(130, maxRight - 8));
      const minH = Math.min(260, global.innerHeight - 16);
      document.documentElement.classList.add('mp-is-resizing');
      const move = e => {
        const dx = e.clientX - x0, dy = e.clientY - y0;
        const limits = { left: 8, top: 8, right: maxRight, bottom: global.innerHeight - 8 };
        let left = initial.left, top = initial.top, right = initial.right, bottom = initial.bottom;
        if (edge === 'move') {
          left = Math.max(limits.left, Math.min(limits.right - initial.width, initial.left + dx));
          top = Math.max(limits.top, Math.min(limits.bottom - initial.height, initial.top + dy));
          right = left + initial.width; bottom = top + initial.height;
        } else {
          if (edge.includes('w')) left = Math.max(limits.left, Math.min(right - minW, initial.left + dx));
          if (edge.includes('e')) right = Math.min(limits.right, Math.max(left + minW, initial.right + dx));
          if (edge.includes('n')) top = Math.max(limits.top, Math.min(bottom - minH, initial.top + dy));
          if (edge.includes('s')) bottom = Math.min(limits.bottom, Math.max(top + minH, initial.bottom + dy));
        }
        panel.style.setProperty('left', `${left}px`, 'important');
        panel.style.setProperty('top', `${top}px`, 'important');
        panel.style.setProperty('width', `${right - left}px`, 'important');
        panel.style.setProperty('height', `${bottom - top}px`, 'important');
      };
      const stop = () => {
        global.removeEventListener('pointermove', move);
        global.removeEventListener('pointerup', stop);
        global.removeEventListener('pointercancel', stop);
        document.documentElement.classList.remove('mp-is-resizing');
        const end = panel.getBoundingClientRect();
        this.panelGeometry[key] = { left:end.left, top:end.top, width:end.width, height:end.height };
        this.persist();
      };
      global.addEventListener('pointermove', move);
      global.addEventListener('pointerup', stop);
      global.addEventListener('pointercancel', stop);
    }

    renderChatsPanel() {
      const panel = $('[data-panel="friends"]', this.root);
      panel.classList.toggle('is-hidden', this.activePanel !== 'friends');
      const me = this.currentUser;
      panel.innerHTML = `
        <div class="mp-titlebar"><span class="mp-titlebar-title">${escapeHtml(this.config.appName)} Chats</span><button class="mp-title-button" data-action="toggle-panel" data-panel-name="friends">×</button></div>
        <div class="mp-panel-body">
          <div class="mp-profile-card">
            <span class="mp-avatar big">${escapeHtml(me.avatar || '👤')}</span>
            <div>
              <strong>${escapeHtml(me.label || me.id)}</strong>
              <div class="mp-identity-row">
                <span class="mp-status-dot mp-status-${escapeHtml(this.status)}"></span>
                <select class="mp-select" data-action="change-status" aria-label="Set status">
                  ${STATUSES.map((status) => `<option value="${status}" ${status === this.status ? 'selected' : ''}>${status}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
          <input class="mp-input mp-search" placeholder="Search friends or moods" data-friend-search />
          <div class="mp-section-title">🟢 IM Chats (${this.users.length})</div>
          <div class="mp-contact-list" data-contact-list>${this.renderContactRows(this.users)}</div>
        </div>
      `;
      $$ (panel, '[data-action]').forEach((button) => button.addEventListener('click', (event) => this.handleAction(event)));
      const statusSelect = $('[data-action="change-status"]', panel);
      statusSelect.addEventListener('change', () => {
        this.status = statusSelect.value;
        this.currentUser.status = this.status;
        this.announcePresence();
        this.persist();
        this.renderAll();
      });
      const search = $('[data-friend-search]', panel);
      search.addEventListener('input', () => {
        const query = search.value.trim().toLowerCase();
        const filtered = this.users.filter((user) => (`${user.label} ${user.mood} ${user.status}`).toLowerCase().includes(query));
        $('[data-contact-list]', panel).innerHTML = this.renderContactRows(filtered);
        $$ (panel, '[data-action]').forEach((button) => button.addEventListener('click', (event) => this.handleAction(event)));
      });
    }

    renderContactRows(users) {
      return users.map((user) => `
        <button class="mp-contact" data-action="open-dm" data-user-id="${escapeHtml(user.id)}">
          <span class="mp-avatar">${escapeHtml(user.avatar || '👤')}</span>
          <span class="mp-contact-main">
            <span class="mp-contact-name"><span class="mp-status-dot mp-status-${escapeHtml(user.id === this.currentUser.id ? this.status : user.status || 'offline')}"></span>${escapeHtml(user.label)}</span>
            <span class="mp-contact-mood">${escapeHtml(user.mood || 'No status message')}</span>
          </span>
          <span class="mp-contact-tools"><span class="mp-mini-button" title="Message">IM</span></span>
        </button>
      `).join('');
    }

    renderRoomsPanel() {
      const panel = $('[data-panel="rooms"]', this.root);
      panel.classList.toggle('is-hidden', this.activePanel !== 'rooms');
      panel.innerHTML = `
        <div class="mp-titlebar"><span class="mp-titlebar-title">Rooms & Party Chats</span><button class="mp-title-button" data-action="toggle-panel" data-panel-name="rooms">×</button></div>
        <div class="mp-panel-body">
          <div class="mp-section-title">🏰 Rooms</div>
          <div class="mp-room-list">
            ${this.rooms.map((room) => `
              <button class="mp-room" data-action="open-conversation" data-conversation-id="${escapeHtml(room.id)}">
                <span class="mp-avatar">${escapeHtml(room.avatar || '#')}</span>
                <span class="mp-room-main"><span class="mp-room-name">${escapeHtml(room.label)}</span><span class="mp-room-meta">${(room.members || []).length} possible members</span></span>
                <span class="mp-badge">${this.unread[room.id] || 0}</span>
              </button>
            `).join('')}
          </div>
          <div class="mp-section-title">➕ Create Room</div>
          <input class="mp-input" data-new-room-name placeholder="Room name, e.g. Goblin Ambush" />
          <div style="height:6px"></div>
          <button class="mp-mini-button" data-action="create-room">Create room</button>
        </div>
      `;
      $$ (panel, '[data-action]').forEach((button) => button.addEventListener('click', (event) => this.handleAction(event)));
    }

    renderWindows() {
      const area = $('[data-mp-windows]', this.root);
      const id = this.activePanel === 'conversation' && this.openTabs.includes(this.activeConversationId) && !this.minimized[this.activeConversationId] ? this.activeConversationId : '';
      area.innerHTML = id ? this.renderWindow(id) : '';
      $$ (area, '[data-action]').forEach((button) => button.addEventListener('click', (event) => this.handleAction(event)));
      $$ (area, '[data-composer]').forEach((textarea) => {
        textarea.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const draft=textarea.value;textarea.value='';Promise.resolve(this.sendText(textarea.dataset.conversationId,draft)).then(sent=>{if(sent===false)textarea.value=draft}).catch(()=>{textarea.value=draft;});
          } else {
            this.bridge.send('typing', { conversationId: textarea.dataset.conversationId, userId: this.currentUser.id, userLabel: this.currentUser.label });
          }
        });
      });
      $$ (area, '[data-file-input]').forEach((input) => input.addEventListener('change', (event) => this.handleFiles(input.dataset.conversationId, event.target.files)));
      this.scrollWindowsToBottom();
    }

    renderWindow(id) {
      const item = this.getConversation(id) || { id, label: id, avatar: '💬' };
      const messages = this.messages[id] || [];
      const minimized = !!this.minimized[id];
      return `
        <section class="mp-window ${minimized ? 'is-minimized' : ''}" data-window-id="${escapeHtml(id)}">
          <div class="mp-titlebar">
            <span>${escapeHtml(item.avatar || '💬')}</span>
            <span class="mp-titlebar-title">${escapeHtml(item.label)}</span>
            <button class="mp-title-button" data-action="start-call" data-call-mode="voice" data-conversation-id="${escapeHtml(id)}" title="Start voice call" aria-label="Start voice call">📞</button>
            <button class="mp-title-button" data-action="start-call" data-call-mode="video" data-conversation-id="${escapeHtml(id)}" title="Start video call" aria-label="Start video call">📹</button>
            <button class="mp-title-button" data-action="toggle-minimize" data-conversation-id="${escapeHtml(id)}" title="Minimize">${minimized ? '▣' : '—'}</button>
            <button class="mp-title-button" data-action="close-window" data-conversation-id="${escapeHtml(id)}" title="Close">×</button>
          </div>
          <div class="mp-chat-body" data-chat-body="${escapeHtml(id)}">
            ${this.renderMessages(messages)}
            <div class="mp-typing-line" data-typing-line="${escapeHtml(id)}">${this.typing[id] || ''}</div>
          </div>
          <div class="mp-composer">
            <div class="mp-tool-row">
              <button class="mp-tool-button" data-action="trigger-file" data-conversation-id="${escapeHtml(id)}">📎 File</button>
              <button class="mp-tool-button" data-action="toggle-stickers" data-conversation-id="${escapeHtml(id)}">☺ Stickers</button>
              <button class="mp-tool-button" data-action="toggle-gifs" data-conversation-id="${escapeHtml(id)}">GIF</button>
              <button class="mp-tool-button" data-action="open-camera" data-conversation-id="${escapeHtml(id)}">📷 Camera</button>
              <button class="mp-tool-button" data-action="record-voice" data-conversation-id="${escapeHtml(id)}">🎙 Voice</button>
              <input type="file" data-file-input data-conversation-id="${escapeHtml(id)}" multiple hidden />
            </div>
            <div class="mp-tray is-hidden" data-tray="stickers-${escapeHtml(id)}">
              ${this.config.stickers.map((sticker) => `<button class="mp-sticker-choice" data-action="send-sticker" data-conversation-id="${escapeHtml(id)}" data-sticker="${escapeHtml(sticker)}">${escapeHtml(sticker)}</button>`).join('')}
            </div>
            <div class="mp-tray is-hidden" data-tray="gifs-${escapeHtml(id)}">
              ${this.config.gifs.map((gif) => `<button class="mp-tool-button mp-gif-choice" data-action="send-gif" data-conversation-id="${escapeHtml(id)}" data-gif-url="${escapeHtml(gif.url)}">${escapeHtml(gif.label)}</button>`).join('')}
              <button class="mp-tool-button mp-gif-choice" data-action="send-gif-url" data-conversation-id="${escapeHtml(id)}">Paste GIF URL…</button>
            </div>
            <div class="mp-composer-line">
              <textarea class="mp-textarea" data-composer data-conversation-id="${escapeHtml(id)}" placeholder="Type a message…"></textarea>
              <button class="mp-send-button" data-action="send-text" data-conversation-id="${escapeHtml(id)}">Send</button>
            </div>
          </div>
        </section>
      `;
    }

    renderMessages(messages) {
      let lastIso = '';
      return messages.map((message) => {
        const pieces = [];
        if (!lastIso || !sameDay(lastIso, message.createdAt)) pieces.push(`<div class="mp-chat-date">${escapeHtml(date(message.createdAt))}</div>`);
        lastIso = message.createdAt;
        if (message.kind === 'system') {
          pieces.push(`<div class="mp-system-message">${textToHtml(message.text)}</div>`);
          return pieces.join('');
        }
        const isMe = message.authorId === this.currentUser.id;
        pieces.push(`
          <article class="mp-message ${isMe ? 'is-me' : ''}">
            <span class="mp-avatar">${escapeHtml(message.authorAvatar || '👤')}</span>
            <div class="mp-bubble">
              <div class="mp-message-meta"><span class="mp-message-name">${escapeHtml(message.authorLabel || message.authorId)}</span><span>${escapeHtml(time(message.createdAt))}</span></div>
              ${message.kind === 'sticker' ? `<div class="mp-sticker-message">${escapeHtml(message.text)}</div>` : `<div class="mp-message-text">${textToHtml(message.text || '')}</div>`}
              ${this.renderAttachments(message.attachments || [])}
            </div>
          </article>
        `);
        return pieces.join('');
      }).join('');
    }

    renderAttachments(attachments) {
      if (!attachments.length) return '';
      return `<div class="mp-attachments">${attachments.map((file) => {
        const name = escapeHtml(file.name || 'attachment');
        const href = escapeHtml(file.url || file.dataUrl || '#');
        if ((file.type || '').startsWith('image/')) return `<a class="mp-attachment" href="${href}" download="${name}" target="_blank"><img src="${href}" alt="${name}" />${name}</a>`;
        if ((file.type || '').startsWith('video/')) return `<a class="mp-attachment" href="${href}" download="${name}" target="_blank"><video src="${href}" controls></video>${name}</a>`;
        if ((file.type || '').startsWith('audio/')) return `<a class="mp-attachment" href="${href}" download="${name}" target="_blank"><audio src="${href}" controls></audio>${name}</a>`;
        return `<a class="mp-attachment" href="${href}" download="${name}" target="_blank">📎 ${name}</a>`;
      }).join('')}</div>`;
    }

    renderIncomingCall(){
      const box=$('[data-incoming-call]',this.root);if(!box)return;
      const inc=this.incomingCall;
      if(!inc){box.classList.add('is-hidden');box.innerHTML='';return}
      box.classList.remove('is-hidden');
      const selected=this.quickReplies.map((text,i)=>`<option value="${i}">${escapeHtml(text)}</option>`).join('');
      box.innerHTML=`<div class="mp-incoming-dialog"><p class="mp-incoming-symbol">${inc.video?'📹':'📞'}</p>
        <h2>Incoming ${inc.video?'video':'voice'} call</h2><p>${escapeHtml(inc.fromLabel||'Someone')} is calling</p>
        <div class="mp-incoming-actions"><button data-action="answer-incoming" class="mp-answer-btn">✓ Answer</button><button data-action="ignore-incoming" class="mp-ignore-btn">Ignore</button></div>
        <label for="mpIgnoreReply">Send a quick message when ignoring (optional)</label>
        <select id="mpIgnoreReply" data-quick-reply><option value="">Ignore without a message</option>${selected}</select>
        <label for="mpQuickReplyEditor">Your saved quick messages (one per line)</label>
        <textarea id="mpQuickReplyEditor" data-replies-editor rows="3" spellcheck="true">${escapeHtml(this.quickReplies.join('\n'))}</textarea>
        <button class="mp-replies-save" data-action="save-quick-replies">Save quick messages</button></div>`;
      $$(box,'[data-action]').forEach(button=>button.addEventListener('click',e=>this.handleAction(e)));
    }
    saveQuickRepliesFromUI(){
      const textarea=$('[data-replies-editor]',this.root);if(!textarea)return;
      const selected=$('[data-quick-reply]',this.root);const old=this.quickReplies[Number(selected?.value)];
      this.saveQuickReplies(textarea.value.split(/\r?\n/));this.renderIncomingCall();
      if(old){const sel=$('[data-quick-reply]',this.root);const index=this.quickReplies.indexOf(old);if(index>=0)sel.value=String(index)}
    }
    async acceptIncomingCall(){
      const inc=this.incomingCall;if(!inc)return;
      if(!canMedia()){this.toast('Microphone/camera access requires HTTPS or localhost.');return}
      try{
        const localStream=await navigator.mediaDevices.getUserMedia({audio:true,video:!!inc.video});
        this.call={conversationId:inc.conversationId,roomId:inc.roomId,video:!!inc.video,localStream,peerConnections:new Map(),remoteStreams:new Map(),participants:new Set([this.currentUser.id]),micMuted:false,videoOff:false};
        if(inc.backendCallId)this.call.backendCallId=inc.backendCallId;
        this.incomingCall=null;clearTimeout(this.incomingCallTimeout);this.renderIncomingCall();this.renderCallWindow();
        if(this.call.backendCallId)await this.requestCallBackend('call.join',{callId:this.call.backendCallId});
        const join={roomId:this.call.roomId,conversationId:inc.conversationId,user:this.currentUser,wantsVideo:!!inc.video};
        await this.bridge.send('call-join',join);
        this.sendCallBackendSignal('RENEGOTIATE','call-join',join);
      }catch(_){this.toast('Call could not be answered. Check camera and microphone access.')}
    }
    async ignoreIncomingCall(sendQuickMessage=true){
      const inc=this.incomingCall;if(!inc)return;
      const value=$('[data-quick-reply]',this.root)?.value;
      const text=sendQuickMessage&&value!==''?this.quickReplies[Number(value)]:'';
      this.incomingCall=null;clearTimeout(this.incomingCallTimeout);this.missedCalls++;this.persist();this.renderIncomingCall();this.renderSidebar();
      const decline={roomId:inc.roomId,conversationId:inc.conversationId,from:this.currentUser.id,to:inc.fromId};
      await this.bridge.send('call-decline',decline);
      this.sendCallBackendSignal('HANGUP','call-decline',decline,inc.backendCallId);
      if(inc.backendCallId)this.requestCallBackend('call.update',{callId:inc.backendCallId,status:sendQuickMessage?'declined':'missed'});
      if(text)await this.sendText(inc.conversationId,text);
    }

    renderCallWindow() {
      const win = $('[data-call-window]', this.root);
      if (!this.call) {
        win.classList.add('is-hidden');
        win.innerHTML = '';
        return;
      }
      win.classList.remove('is-hidden');
      const item = this.getConversation(this.call.conversationId) || { label: this.call.conversationId, avatar: '☎' };
      win.innerHTML = `
        <div class="mp-titlebar"><span class="mp-titlebar-title">${escapeHtml(item.avatar || '☎')} ${escapeHtml(item.label)} Call</span><button class="mp-title-button" data-action="end-call">×</button></div>
        <div class="mp-call-body">
          <div class="mp-video-grid" data-video-grid>
            <div class="mp-video-tile" data-local-tile>${this.call.video ? '<video data-local-video autoplay muted playsinline></video>' : '<span>🎙 Audio Call</span>'}<span class="mp-video-label">${escapeHtml(this.currentUser.label)} (you)</span></div>
          </div>
        </div>
        <div class="mp-call-controls">
          <button class="mp-tool-button" data-action="toggle-mic">${this.call.micMuted ? 'Unmute' : 'Mute'}</button>
          <button class="mp-tool-button" data-action="toggle-video">${this.call.videoOff ? 'Video On' : 'Video Off'}</button>
          <button class="mp-tool-button" data-action="copy-call-id">Copy Room ID</button>
          <button class="mp-tool-button" data-action="end-call">End</button>
          <span class="mp-call-status">${this.call.participants.size}/${this.config.maxCallParticipants} participants · ${this.bridge.connected ? 'socket signaling' : 'local/copy signaling'}</span>
        </div>
      `;
      $$ (win, '[data-action]').forEach((button) => button.addEventListener('click', (event) => this.handleAction(event)));
      const localVideo = $('[data-local-video]', win);
      if (localVideo && this.call.localStream) localVideo.srcObject = this.call.localStream;
      this.paintRemoteVideos();
    }

    paintRemoteVideos() {
      const grid = $('[data-video-grid]', this.root);
      if (!grid || !this.call) return;
      this.call.remoteStreams.forEach((stream, peerId) => {
        if ($(`[data-peer-tile="${CSS.escape(peerId)}"]`, grid)) return;
        const peer = this.users.find((user) => user.id === peerId) || { label: peerId };
        const tile = document.createElement('div');
        tile.className = 'mp-video-tile';
        tile.dataset.peerTile = peerId;
        tile.innerHTML = `<video autoplay playsinline></video><span class="mp-video-label">${escapeHtml(peer.label)}</span>`;
        const video = $('video', tile);
        video.srcObject = stream;
        grid.appendChild(tile);
      });
    }

    renderCameraModal() {
      const modal = $('[data-camera-modal]', this.root);
      modal.innerHTML = `
        <div class="mp-modal-card">
          <div class="mp-titlebar"><span class="mp-titlebar-title">Take Picture</span><button class="mp-title-button" data-action="close-camera">×</button></div>
          <div class="mp-modal-body">
            <div class="mp-camera-stage">
              <video data-camera-video autoplay muted playsinline></video>
              <canvas data-camera-canvas class="is-hidden"></canvas>
            </div>
          </div>
          <div class="mp-modal-actions">
            <button class="mp-tool-button" data-action="capture-photo">Capture</button>
            <button class="mp-tool-button" data-action="send-photo">Send Photo</button>
            <button class="mp-tool-button" data-action="close-camera">Cancel</button>
          </div>
        </div>
      `;
      $$ (modal, '[data-action]').forEach((button) => button.addEventListener('click', (event) => this.handleAction(event)));
    }

    handleAction(event) {
      const el = event.currentTarget;
      const action = el.dataset.action;
      const id = el.dataset.conversationId;
      if (action === 'toggle-panel') this.togglePanel(el.dataset.panelName);
      if (action === 'toggle-mode') {window.OurSpaceAppearance?.toggle?.();this.updateModeToggle();}
      if (action === 'clear-missed'){this.missedCalls=0;this.persist();this.renderSidebar();this.renderCategoryPanel('unread');}
      if (action === 'open-dm') this.openDirectMessage(el.dataset.userId);
      if (action === 'open-conversation') this.openConversation(id || el.dataset.conversationId);
      if (action === 'close-window') this.closeWindow(id);
      if (action === 'toggle-minimize') this.toggleMinimize(id);
      if (action === 'send-text') {
        const win = el.closest('[data-window-id]');
        const textarea = $('[data-composer]', win);
        const draft=textarea.value;textarea.value='';Promise.resolve(this.sendText(id,draft)).then(sent=>{if(sent===false)textarea.value=draft}).catch(()=>{textarea.value=draft;});
      }
      if (action === 'trigger-file') this.triggerFile(id);
      if (action === 'toggle-stickers') this.toggleTray('stickers', id);
      if (action === 'toggle-gifs') this.toggleTray('gifs', id);
      if (action === 'send-sticker') this.sendSticker(id, el.dataset.sticker);
      if (action === 'send-gif') this.sendGif(id, el.dataset.gifUrl);
      if (action === 'send-gif-url') this.promptGif(id);
      if (action === 'open-camera') this.openCamera(id);
      if (action === 'capture-photo') this.capturePhoto();
      if (action === 'send-photo') this.sendPhoto();
      if (action === 'close-camera') this.closeCamera();
      if (action === 'record-voice') this.recordVoice(id);
      if (action === 'create-room') this.createRoom();
      if (action === 'start-call') this.startCall(id, el.dataset.callMode!=='voice');
      if (action === 'phone-call') this.startPhoneCall(el.dataset.userId,el.dataset.callMode==='video');
      if (action === 'open-site-page') this.openSitePage(el.dataset.page);
      if (action === 'answer-incoming') this.acceptIncomingCall();
      if (action === 'ignore-incoming') this.ignoreIncomingCall();
      if (action === 'save-quick-replies') this.saveQuickRepliesFromUI();
      if (action === 'end-call') this.endCall();
      if (action === 'toggle-mic') this.toggleMic();
      if (action === 'toggle-video') this.toggleVideo();
      if (action === 'copy-call-id') this.copyCallId();
    }

    togglePanel(name) {
      this.activePanel = this.activePanel === name ? '' : name;
      this.renderAll();
    }

    openConversation(id) {
      if (!id) return;
      if (!this.openTabs.includes(id)) this.openTabs.push(id);
      this.openTabs = this.openTabs.slice(-4);
      this.minimized[id] = false;
      this.unread[id] = 0;
      this.activeConversationId = id;
      this.activePanel = 'conversation';
      if (!this.messages[id]) this.messages[id] = [];
      this.persist();
      this.renderAll();
    }

    openDirectMessage(userId) {
      const user = this.users.find((candidate) => candidate.id === userId);
      if (!user) return;
      const ids = [this.currentUser.id, user.id].sort();
      const id = `dm-${ids.join('-')}`;
      if (!this.rooms.some((room) => room.id === id)) {
        this.rooms.push({ id, label: user.label, avatar: user.avatar, members: ids, direct: true });
      }
      this.openConversation(id);
    }

    closeWindow(id) {
      this.openTabs = this.openTabs.filter((tab) => tab !== id);
      delete this.minimized[id];
      if (this.activeConversationId === id) {
        this.activeConversationId = this.openTabs[this.openTabs.length - 1] || '';
        this.activePanel = 'friends';
      }
      this.persist();
      this.renderAll();
    }

    toggleMinimize(id) {
      this.minimized[id] = !this.minimized[id];
      if (!this.minimized[id]) { this.unread[id] = 0; this.activeConversationId = id; this.activePanel = 'conversation'; }
      else if (this.activeConversationId === id) this.activePanel = 'friends';
      this.persist();
      this.renderAll();
    }

    getConversation(id) {
      return this.rooms.find((room) => room.id === id) || this.users.find((user) => user.id === id) || null;
    }

    async sendText(conversationId, text) {
      const trimmed = String(text || '').trim();
      if (!trimmed) return;
      const message = this.makeMessage(conversationId, 'message', trimmed, []);
      this.addMessage(message, true);
      await this.bridge.send('message', message);
    }

    async sendSticker(conversationId, sticker) {
      const message = this.makeMessage(conversationId, 'sticker', sticker, []);
      this.addMessage(message, true);
      await this.bridge.send('message', message);
    }

    async sendGif(conversationId, gifUrl) {
      const message = this.makeMessage(conversationId, 'message', '', [{ name: 'animated.gif', type: 'image/gif', url: gifUrl }]);
      this.addMessage(message, true);
      await this.bridge.send('message', message);
    }

    promptGif(conversationId) {
      const url = prompt('Paste a GIF URL ending in .gif, or any direct animated image link:');
      if (url) this.sendGif(conversationId, url);
    }

    makeMessage(conversationId, kind, text, attachments) {
      return {
        id: uid('msg'),
        conversationId,
        authorId: this.currentUser.id,
        authorLabel: this.currentUser.label,
        authorAvatar: this.currentUser.avatar,
        kind,
        text,
        attachments: attachments || [],
        createdAt: nowIso()
      };
    }

    addMessage(message, mine) {
      if (!message || !message.conversationId) return;
      if (!this.messages[message.conversationId]) this.messages[message.conversationId] = [];
      if (this.messages[message.conversationId].some((existing) => existing.id === message.id)) return;
      this.messages[message.conversationId].push(message);
      if (!mine && (this.activePanel !== 'conversation' || this.activeConversationId !== message.conversationId || this.minimized[message.conversationId])) {
        this.unread[message.conversationId] = (this.unread[message.conversationId] || 0) + 1;
        this.toast(`${message.authorLabel || 'Someone'} messaged ${this.getConversation(message.conversationId)?.label || message.conversationId}`);
      }
      this.persist();
      this.renderAll();
    }

    async handleFiles(conversationId, files) {
      const list = Array.from(files || []);
      if (!list.length) return;
      const attachments = [];
      for (const file of list) {
        const dataUrl = await fileToDataUrl(file);
        attachments.push({ name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl });
      }
      const message = this.makeMessage(conversationId, 'message', '', attachments);
      this.addMessage(message, true);
      await this.bridge.send('message', message);
    }

    triggerFile(conversationId) {
      const win = $(`[data-window-id="${CSS.escape(conversationId)}"]`, this.root);
      const input = $('[data-file-input]', win);
      if (input) input.click();
    }

    toggleTray(type, conversationId) {
      const selector = `[data-tray="${type}-${CSS.escape(conversationId)}"]`;
      const tray = $(selector, this.root);
      if (!tray) return;
      tray.classList.toggle('is-hidden');
    }

    async openCamera(conversationId) {
      if (!canMedia()) return this.toast('Camera is not available in this browser.');
      this.camera.targetConversationId = conversationId;
      const modal = $('[data-camera-modal]', this.root);
      modal.classList.remove('is-hidden');
      try {
        this.camera.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const video = $('[data-camera-video]', modal);
        video.srcObject = this.camera.stream;
      } catch (error) {
        this.toast('Camera permission was denied or unavailable.');
      }
    }

    capturePhoto() {
      const modal = $('[data-camera-modal]', this.root);
      const video = $('[data-camera-video]', modal);
      const canvas = $('[data-camera-canvas]', modal);
      if (!video || !canvas || !video.videoWidth) return this.toast('Camera is not ready yet.');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.classList.remove('is-hidden');
    }

    async sendPhoto() {
      const modal = $('[data-camera-modal]', this.root);
      const canvas = $('[data-camera-canvas]', modal);
      if (!canvas || !canvas.width) this.capturePhoto();
      const dataUrl = canvas.toDataURL('image/png');
      const message = this.makeMessage(this.camera.targetConversationId, 'message', '', [{ name: `snapshot-${Date.now()}.png`, type: 'image/png', dataUrl }]);
      this.addMessage(message, true);
      await this.bridge.send('message', message);
      this.closeCamera();
    }

    closeCamera() {
      const modal = $('[data-camera-modal]', this.root);
      modal.classList.add('is-hidden');
      if (this.camera.stream) this.camera.stream.getTracks().forEach((track) => track.stop());
      this.camera.stream = null;
      this.camera.targetConversationId = null;
    }

    async recordVoice(conversationId) {
      if (!canMedia() || !('MediaRecorder' in global)) return this.toast('Voice recording is not available in this browser.');
      if (this.recorder.mediaRecorder && this.recorder.mediaRecorder.state === 'recording') {
        this.recorder.mediaRecorder.stop();
        return;
      }
      try {
        this.recorder.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.recorder.chunks = [];
        this.recorder.targetConversationId = conversationId;
        this.recorder.mediaRecorder = new MediaRecorder(this.recorder.stream);
        this.recorder.mediaRecorder.ondataavailable = (event) => event.data.size && this.recorder.chunks.push(event.data);
        this.recorder.mediaRecorder.onstop = async () => {
          const blob = new Blob(this.recorder.chunks, { type: 'audio/webm' });
          const dataUrl = await blobToDataUrl(blob);
          const message = this.makeMessage(this.recorder.targetConversationId, 'message', 'Voice message', [{ name: `voice-${Date.now()}.webm`, type: 'audio/webm', dataUrl }]);
          this.addMessage(message, true);
          await this.bridge.send('message', message);
          this.recorder.stream.getTracks().forEach((track) => track.stop());
          this.recorder.mediaRecorder = null;
          this.toast('Voice message sent.');
        };
        this.recorder.mediaRecorder.start();
        this.toast('Recording voice… click 🎙 Voice again to stop.');
      } catch (error) {
        this.toast('Microphone permission was denied or unavailable.');
      }
    }

    createRoom() {
      const input = $('[data-new-room-name]', this.root);
      const label = input && input.value.trim();
      if (!label) return;
      const room = { id: safeId(label), label, avatar: '💬', members: this.users.map((user) => user.id).slice(0, 10) };
      if (!this.rooms.some((existing) => existing.id === room.id)) this.rooms.push(room);
      this.messages[room.id] = this.messages[room.id] || [];
      this.openConversation(room.id);
      this.bridge.send('room', room);
    }

    async startCall(conversationId, video) {
      if (this.call) this.endCall();
      if (!canMedia()) return this.toast('Calls need camera/microphone support and HTTPS or localhost.');
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: !!video });
        this.call = {
          conversationId,
          roomId: `${conversationId}-call`,
          video: !!video,
          localStream,
          peerConnections: new Map(),
          remoteStreams: new Map(),
          participants: new Set([this.currentUser.id]),
          micMuted: false,
          videoOff: false
        };
        this.renderCallWindow();
        const remote=await this.requestCallBackend('call.create',{calleeProfile:this.users.find(u=>u.id!==this.currentUser.id)?.id,mode:video?'video':'voice',channelId:conversationId});
        if(remote?.callId)this.call.backendCallId=remote.callId;
        const members=this.getConversation(conversationId)?.members||this.users.filter(u=>u.id!==this.currentUser.id).map(u=>u.id);
        const invite={roomId:this.call.roomId,conversationId,video:!!video,fromId:this.currentUser.id,fromLabel:this.currentUser.label,toIds:members.filter(id=>id!==this.currentUser.id),backendCallId:this.call.backendCallId||'',createdAt:Date.now()};
        await this.bridge.send('call-invite',invite);
        this.sendCallBackendSignal('RENEGOTIATE','call-invite',invite);
        await this.bridge.send('call-join', { roomId: this.call.roomId, conversationId, user: this.currentUser, wantsVideo: !!video });
        this.addMessage(this.makeMessage(conversationId, 'system', `${this.currentUser.label} started a ${video ? 'video' : 'voice'} call.`, []), true);
      } catch (error) {
        this.toast('Call could not start. Camera/microphone permission may be blocked.');
      }
    }

    async handleCallJoin(payload) {
      if (!payload || !this.call || payload.roomId !== this.call.roomId) return;
      const peer = payload.user;
      if (!peer || peer.id === this.currentUser.id) return;
      if (this.call.participants.size >= this.config.maxCallParticipants) {
        this.toast('Call is full. Max 10 people.');
        return;
      }
      this.call.participants.add(peer.id);
      await this.ensurePeer(peer.id, true);
      this.renderCallWindow();
    }

    async ensurePeer(peerId, makeOffer) {
      if (!this.call || this.call.peerConnections.has(peerId)) return this.call && this.call.peerConnections.get(peerId);
      const pc = new RTCPeerConnection({ iceServers: this.config.iceServers });
      this.call.peerConnections.set(peerId, pc);
      this.call.localStream.getTracks().forEach((track) => pc.addTrack(track, this.call.localStream));
      pc.ontrack = (event) => {
        const stream = event.streams[0];
        if (stream) {
          this.call.remoteStreams.set(peerId, stream);
          this.paintRemoteVideos();
        }
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) this.emitCallSignal({ roomId: this.call.roomId, from: this.currentUser.id, to: peerId, candidate: event.candidate });
      };
      if (makeOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await this.emitCallSignal({ roomId: this.call.roomId, from: this.currentUser.id, to: peerId, description: pc.localDescription });
      }
      return pc;
    }

    async emitCallSignal(payload){
      await this.bridge.send('call-signal',payload);
      this.sendCallBackendSignal(payload.candidate?'ICE':payload.description?.type?.toUpperCase()==='ANSWER'?'ANSWER':'OFFER','call-signal',payload);
    }
    async handleCallSignal(payload) {
      if (!payload || !this.call || payload.roomId !== this.call.roomId) return;
      if (payload.from === this.currentUser.id || payload.to !== this.currentUser.id) return;
      const pc = await this.ensurePeer(payload.from, false);
      if (payload.description) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.description));
        if (payload.description.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await this.emitCallSignal({ roomId: this.call.roomId, from: this.currentUser.id, to: payload.from, description: pc.localDescription });
        }
      }
      if (payload.candidate){
        if(pc.remoteDescription)await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        else (pc.pendingIceCandidates||(pc.pendingIceCandidates=[])).push(payload.candidate);
      }
      if(pc.remoteDescription&&pc.pendingIceCandidates?.length){for(const candidate of pc.pendingIceCandidates.splice(0))await pc.addIceCandidate(new RTCIceCandidate(candidate))}
    }

    toggleMic() {
      if (!this.call) return;
      this.call.micMuted = !this.call.micMuted;
      this.call.localStream.getAudioTracks().forEach((track) => { track.enabled = !this.call.micMuted; });
      this.renderCallWindow();
    }

    toggleVideo() {
      if (!this.call) return;
      this.call.videoOff = !this.call.videoOff;
      this.call.localStream.getVideoTracks().forEach((track) => { track.enabled = !this.call.videoOff; });
      this.renderCallWindow();
    }

    copyCallId() {
      if (!this.call) return;
      const text = JSON.stringify({ roomId: this.call.roomId, conversationId: this.call.conversationId, user: this.currentUser }, null, 2);
      navigator.clipboard?.writeText(text).then(() => this.toast('Call room ID copied.')).catch(() => this.toast(text));
    }

    endCall() {
      if (!this.call) return;
      const leave={roomId:this.call.roomId,userId:this.currentUser.id};
      this.bridge.send('call-leave',leave);this.sendCallBackendSignal('HANGUP','call-leave',leave);
      if(this.call.backendCallId)this.requestCallBackend('call.end',{callId:this.call.backendCallId});
      this.call.peerConnections.forEach((pc) => pc.close());
      this.call.localStream.getTracks().forEach((track) => track.stop());
      this.call = null;
      this.renderCallWindow();
    }

    announcePresence() {
      this.bridge.send('presence', { user: Object.assign({}, this.currentUser, { status: this.status }), status: this.status });
    }

    signalAlert(type,detail){
      global.dispatchEvent(new CustomEvent('ourspace:messenger-alert',{detail:{type,createdAt:Date.now(),...(detail||{})}}));
    }

    receiveEnvelope(envelope, source) {
      if (!envelope || envelope.clientId === this.clientId) return;
      const payload = envelope.payload || {};
      if (envelope.type === 'history' && Array.isArray(payload)) {
        payload.forEach((item) => {
          if (item.type === 'message' && item.payload) this.addMessage(item.payload, false);
          if (item.type === 'room' && item.payload && !this.rooms.some((room) => room.id === item.payload.id)) this.rooms.push(item.payload);
        });
        this.renderAll();
      }
      if (envelope.type === 'message') {
        this.addMessage(payload,false);
        const id=String(payload.conversationId||'');
        const isRoom=!(this.getConversation(id)?.direct||id.startsWith('dm-'));
        if(payload.pinned){this.signalAlert('pin',{conversationId:id});if(isRoom)this.signalAlert('room',{conversationId:id});}
        else this.signalAlert(payload.quickChat?'quick':isRoom?'room':'chat',{conversationId:id});
      }
      if (envelope.type === 'presence' && payload.user) {
        const idx = this.users.findIndex((user) => user.id === payload.user.id);
        if (idx >= 0) this.users[idx] = Object.assign({}, this.users[idx], payload.user);
        else if (this.users.length < 10) this.users.push(payload.user);
        this.renderAll();
      }
      if (envelope.type === 'typing') this.handleTyping(payload);
      if (envelope.type === 'room') {
        if (!this.rooms.some((room) => room.id === payload.id)) this.rooms.push(payload);
        this.renderAll();
      }
      if (envelope.type === 'call-invite' && payload.fromId!==this.currentUser.id && (!Array.isArray(payload.toIds)||payload.toIds.includes(this.currentUser.id))){
        if(!this.call && !this.incomingCall){this.incomingCall=payload;this.renderIncomingCall();this.signalAlert('call',{conversationId:payload.conversationId});
          clearTimeout(this.incomingCallTimeout);this.incomingCallTimeout=setTimeout(()=>{if(this.incomingCall?.roomId===payload.roomId)this.ignoreIncomingCall(false)},60000);}
      }
      if(envelope.type==='call-decline'&&this.call&&payload.roomId===this.call.roomId){this.endCall();this.toast('Call declined.')}
      if (envelope.type === 'call-join') this.handleCallJoin(payload);
      if (envelope.type === 'call-signal') this.handleCallSignal(payload).catch((error) => this.toast('Call signal failed.'));
      if (envelope.type === 'call-leave' && this.incomingCall?.roomId === payload.roomId){clearTimeout(this.incomingCallTimeout);this.incomingCall=null;this.renderIncomingCall()}
      if (envelope.type === 'call-leave' && this.call && payload.roomId === this.call.roomId) {
        this.call.participants.delete(payload.userId);
        const pc = this.call.peerConnections.get(payload.userId);
        if (pc) pc.close();
        this.call.peerConnections.delete(payload.userId);
        this.call.remoteStreams.delete(payload.userId);
        this.renderCallWindow();
      }
    }

    handleTyping(payload) {
      if (!payload || payload.userId === this.currentUser.id) return;
      this.typing[payload.conversationId] = `${payload.userLabel || 'Someone'} is typing…`;
      this.renderWindows();
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(() => {
        delete this.typing[payload.conversationId];
        this.renderWindows();
      }, 1400);
    }

    scrollWindowsToBottom() {
      $$ (this.root, '[data-chat-body]').forEach((body) => { body.scrollTop = body.scrollHeight; });
    }

    toast(text) {
      const stack = $('[data-toast-stack]', this.root);
      const toast = document.createElement('div');
      toast.className = 'mp-toast';
      toast.textContent = text;
      stack.appendChild(toast);
      setTimeout(() => toast.remove(), 4200);
    }
  }

  const api = {
    version: VERSION,
    instance: null,
    init(config) {
      this.instance = new MessengerPluginApp(config || {});
      return this.instance;
    },
    destroy() {
      if (this.instance) {
        clearInterval(this.instance.presenceTimer);
        clearInterval(this.instance.callPollTimer);clearTimeout(this.instance.incomingCallTimeout);
        this.instance.endCall();
        this.instance.bridge.close();
        this.instance.panelResizeObserver?.disconnect();
        this.instance.root.innerHTML = '';
        document.documentElement.classList.remove('sidebar-messenger-active');
        this.instance = null;
      }
    }
  };

  global.MessengerPlugin = api;
})(window);

/* OurSpace Communication: shared conversation transport and persistent Sidebar Messenger. */
(()=>{
 'use strict';
 if(new URLSearchParams(location.search).get('public')==='1')return;
  const profile=document.documentElement.dataset.profile==='jasper'?'jasper':'william';
 const own=profile==='jasper'?{id:'jasper',label:'Jasper',avatar:'🦆',status:'online',mood:'In OurSpace'}:{id:'william',label:'William',avatar:'🦖',status:'online',mood:'In OurSpace'};
 const other=profile==='jasper'?{id:'william',label:'William',avatar:'🦖',status:'away',mood:'Around'}:{id:'jasper',label:'Jasper',avatar:'🦆',status:'away',mood:'Around'};
 const rooms=[{id:'ourspace-shared',label:'Shared Lounge',avatar:'⚡',members:['william','jasper']},{id:'household-chat',label:'Household',avatar:'🏡',members:['william','jasper']},{id:'plans-chat',label:'Plans & Notes',avatar:'📝',members:['william','jasper']}];
 const root=document.getElementById('sidebar-messenger-root');
 const $=s=>document.querySelector(s);
 const clean=s=>String(s??'');
 const esc=s=>clean(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 if(!root || !window.MessengerPlugin)return;
 let app;
 try{
   app=window.MessengerPlugin.init({mount:root,appName:'Sidebar Messenger',users:[own,other],rooms,currentUser:own,maxCallParticipants:2,socketUrl:'',httpEndpoint:'',gifs:[]});
 }catch(err){console.error('Sidebar Messenger could not initialize',err);return;}
 window.ourspaceMessenger=app;
 const dom=$('[data-oscomm]');
 const dmId=`dm-${['william','jasper'].sort().join('-')}`;
 const all=[{id:dmId,label:other.label,avatar:other.avatar,direct:true},{...rooms[0]},{...rooms[1]},{...rooms[2]}];
 if(!app.rooms.some(r=>r.id===dmId))app.rooms.push({id:dmId,label:other.label,avatar:other.avatar,members:['william','jasper'],direct:true});
 let chosen='ourspace-shared';
 app.openTabs=app.openTabs.filter(id=>all.some(x=>x.id===id));
 app.persist();app.renderAll();
 const notify=()=>window.dispatchEvent(new Event('ourspace-messenger-changed'));
 const add=app.addMessage.bind(app);
 app.addMessage=(...args)=>{const v=add(...args);notify();return v};
 app.bridge.addEventListener('envelope',notify);
 const send=app.bridge.send.bind(app.bridge);
 app.bridge.send=async (type,payload)=>{
   const envelope=await send(type,payload);
   try{window.dispatchEvent(new CustomEvent('ourspace:messenger-outgoing',{detail:{profile,envelope}}))}catch(_){ }
   return envelope;
 };
 // Local frame-to-frame relay: works in the self-contained single HTML even when
 // file:// browsers block localStorage or BroadcastChannel. Avoids a fake server.
 window.addEventListener('message',e=>{
   if(!e.data || e.data.type!=='ourspace-messenger-deliver-v1')return;
   const packet=e.data.envelope;
   if(!packet || !['message','presence','typing','room','call-join','call-signal','call-leave'].includes(packet.type))return;
   try{app.bridge.emitEnvelope(packet,'ourspace-local-parent')}catch(err){console.warn(err)}
 });
 if(!dom)return;
 const timeline=$('#oscom-thread');
 const presence=$('#oscom-presence');
 const fields={name:$('#oscom-chatname'),info:$('#oscom-chatinfo'),mode:$('#oscom-mode'),connection:$('#oscom-connection'),who:$('#oscom-who'),count:$('#oscom-count')};
 const describe=()=> all.find(x=>x.id===chosen)||all[1];
 function contacts(){
  const q=$('#oscom-search').value.trim().toLowerCase();
  const make=x=>`<button type="button" class="oscom-conversation" data-oscom-id="${esc(x.id)}" aria-current="${String(x.id===chosen)}"><span class="oscom-icon">${esc(x.avatar)}</span><span class="oscom-label">${esc(x.label)}</span></button>`;
  $('#oscom-contacts').innerHTML=all.filter(x=>x.direct && x.label.toLowerCase().includes(q)).map(make).join('');
  $('#oscom-rooms').innerHTML=all.filter(x=>!x.direct && x.label.toLowerCase().includes(q)).map(make).join('');
 }
 function attachment(a){if(!a)return null;const wrap=document.createElement('div');wrap.className='oscom-attachment';const src=a.dataUrl||a.url||'';
  if(!/^(data:(image|audio|video|application\/pdf)\/|https?:\/\/)/i.test(src))return null;
  const mime=clean(a.type); if(mime.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(a.name||'')){
    const img=document.createElement('img');img.src=src;img.alt=clean(a.name||'Attached image');img.loading='lazy';wrap.append(img);
  }else if(mime.startsWith('audio/')){const el=document.createElement('audio');el.controls=true;el.src=src;wrap.append(el);
  }else if(mime.startsWith('video/')){const el=document.createElement('video');el.controls=true;el.src=src;wrap.append(el);
  }else{const link=document.createElement('a');link.href=src;link.textContent=clean(a.name||'Open attachment');link.download=clean(a.name||'attachment');link.rel='noopener';link.target='_blank';wrap.append(link)}return wrap;
 }
 function render(){
  if(!document.getElementById('oscom-thread'))return;
  const desc=describe();fields.name.textContent=desc.label;fields.info.textContent=desc.direct?'Private conversation':'Shared between William and Jasper';fields.who.textContent=desc.direct?other.label:'William and Jasper';
  fields.mode.textContent=window.OurSpaceMessageTransport?.connected?'Backend text sync · local media/calls':'Local messages';fields.connection.textContent=window.OurSpaceMessageTransport?.connected?'Two-profile text sync':'Local in-browser';presence.value=app.status;
  const msg=app.messages[chosen]||[];fields.count.textContent=`${msg.length} message${msg.length===1?'':'s'}`;
  timeline.replaceChildren();
  if(!msg.length){const empty=document.createElement('div');empty.className='oscom-empty';empty.textContent='No messages yet. Start the conversation below.';timeline.append(empty)}
  for(const m of msg.slice(-400)){
   const row=document.createElement('article');row.className='oscom-bubble'+(m.authorId===own.id?' mine':'');
   const meta=document.createElement('div');meta.className='oscom-msgmeta';const person=document.createElement('span');person.textContent=clean(m.authorLabel||m.authorId||'Member');const ts=document.createElement('time');ts.dateTime=m.createdAt||'';try{ts.textContent=new Date(m.createdAt).toLocaleString([],{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}catch(_){ts.textContent=''};meta.append(person,ts);row.append(meta);
   if(m.text||m.kind==='sticker'){const body=document.createElement('div');body.className='oscom-msgbody';body.textContent=clean(m.text);row.append(body)}
   for(const a of (m.attachments||[])){const element=attachment(a);if(element)row.append(element)}
   timeline.append(row);
  }
  timeline.scrollTop=timeline.scrollHeight;contacts();
 }
 function select(id){if(!all.some(x=>x.id===id))return;chosen=id;app.openConversation(id);render();}
 // Sidebar windows and the full Communication page always target the same room.
 const originalOpenConversation=app.openConversation.bind(app);
 app.openConversation=function(id){if(!all.some(x=>x.id===id))return;originalOpenConversation(id);chosen=id;render();window.dispatchEvent(new CustomEvent('ourspace:conversation-selected',{detail:{id}}))};
 window.addEventListener('ourspace:open-conversation',event=>{
   const id=event.detail?.id||dmId;if(!all.some(x=>x.id===id))return;
   if(event.detail?.page){try{window.ourspaceNavigatePage?.('communication')}catch(_){document.querySelector('.page-route[data-page="communication"]')?.click()}}
   app.openConversation(id);
 });
 window.OurSpaceConversation={open:id=>app.openConversation(id),selected:()=>chosen,rooms:()=>all.map(x=>x.id)};
 dom.addEventListener('click',e=>{const button=e.target.closest('[data-oscom-id]');if(button)select(button.dataset.oscomId)});
 $('#oscom-search').addEventListener('input',contacts);
 $('#oscom-compose-form').addEventListener('submit',async e=>{e.preventDefault();const field=$('#oscom-text');const text=field.value.trim();if(!text)return;field.value='';try{const sent=await app.sendText(chosen,text);if(sent===false)field.value=text}catch(_){field.value=text}field.focus()});
 $('#oscom-text').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#oscom-compose-form').requestSubmit()}});
 $('#oscom-file').addEventListener('change',e=>{const files=e.currentTarget.files;if(files?.length)app.handleFiles(chosen,files);e.currentTarget.value=''});
 $('#oscom-sticker').addEventListener('click',()=>{const sticker=prompt('Choose a sticker emoji','⚡');if(sticker?.trim())app.sendSticker(chosen,sticker.trim().slice(0,16))});
 $('#oscom-voice-note').addEventListener('click',()=>app.recordVoice(chosen));
 $('#oscom-voice').addEventListener('click',()=>app.startCall(chosen,false));
 $('#oscom-video').addEventListener('click',()=>app.startCall(chosen,true));
 $('#oscom-popout').addEventListener('click',()=>app.openConversation(chosen));
 $('#oscom-open-friends').addEventListener('click',()=>app.togglePanel('friends'));
 $('#oscom-open-rooms').addEventListener('click',()=>app.togglePanel('rooms'));
 $('#oscom-toggle-sidebar').addEventListener('click',e=>{const aside=$('.oscom-sidebar');const isCollapsed=aside.classList.toggle('is-minimized');e.currentTarget.setAttribute('aria-expanded',String(!isCollapsed))});
 presence.addEventListener('change',()=>{app.status=presence.value;app.currentUser.status=presence.value;app.announcePresence();app.persist();app.renderAll()});
 window.addEventListener('ourspace-messenger-changed',render);window.addEventListener('ourspace:transport-status',render);
 window.addEventListener('ourspace:page-changed',render);
 render();
})();

document.addEventListener('click', event => { if(event.target.closest && event.target.closest('.page-route')) { const nav=document.getElementById('masterNav'); if(nav) { nav.classList.add('collapsed'); const toggle=nav.querySelector('.master-toggle'); if(toggle)toggle.setAttribute('aria-expanded','false'); } } });

