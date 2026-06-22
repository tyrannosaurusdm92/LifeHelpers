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
        eventsEndpoint: '',
        historyEndpoint: '',
        clientId: 'client_' + Math.random().toString(36).slice(2),
        appName: 'Messenger Plug-in',
        reconnectMs: 1800,
        timeoutMs: DEFAULT_TIMEOUT
      }, config || {});
      this.socket = null;
      this.connected = false;
      this.queue = [];
      this.channel = null;
      this.closed = false;
      this.pollTimer = 0;
      this.eventSource = null;
      this.storageKey = 'messengerPlugin.bridge.messages.v2';
      this.seenHistory = new Set();
      this.connect();
      this.setupLocalBroadcast();
      this.setupServerEvents();
      this.fetchHistory();
      this.setupPolling();
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



    setupServerEvents() {
      if (!this.config.eventsEndpoint || !('EventSource' in global)) return;
      try {
        const source = new EventSource(this.config.eventsEndpoint);
        this.eventSource = source;
        source.addEventListener('open', () => {
          this.dispatchEvent(new CustomEvent('status', { detail: { connected: this.connected, queued: this.queue.length, sse: true } }));
        });
        source.addEventListener('envelope', (event) => {
          try {
            const envelope = JSON.parse(event.data);
            this.emitEnvelope(envelope, 'sse');
          } catch (error) {
            console.warn('Messenger SSE envelope parse failed:', error);
          }
        });
        source.addEventListener('history', (event) => {
          try {
            const payload = JSON.parse(event.data);
            const history = Array.isArray(payload) ? payload : (payload.envelopes || []);
            this.emitEnvelope({ type: 'history', payload: history, clientId: 'server', createdAt: new Date().toISOString() }, 'sse-history');
          } catch (error) {
            console.warn('Messenger SSE history parse failed:', error);
          }
        });
        source.addEventListener('error', () => undefined);
      } catch (error) {}
    }


    setupPolling() {
      if (!this.config.historyEndpoint || this.config.eventsEndpoint || !('fetch' in global)) return;
      this.pollTimer = global.setInterval(() => this.fetchHistory(), 5000);
    }

    async fetchHistory() {
      if (!this.config.historyEndpoint || !('fetch' in global)) return;
      try {
        const response = await fetch(this.config.historyEndpoint, { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        const history = Array.isArray(payload) ? payload : (payload.envelopes || []);
        const fresh = [];
        for (const envelope of history) {
          if (!envelope || !envelope.id || this.seenHistory.has(envelope.id)) continue;
          this.seenHistory.add(envelope.id);
          fresh.push(envelope);
        }
        if (fresh.length) this.emitEnvelope({ type: 'history', payload: fresh, clientId: 'server', createdAt: new Date().toISOString() }, 'http-history');
      } catch (error) {}
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
      if (global.SocialSharedBackend?.isEnabled?.()) {
        return global.SocialSharedBackend.request('messengerEnvelope', envelope, { timeoutMs: this.config.timeoutMs });
      }
      const controller = new AbortController();
      const timer = global.setTimeout(() => controller.abort(), this.config.timeoutMs);
      try {
        const response = await fetch(this.config.httpEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
      if (this.eventSource) this.eventSource.close();
      if (this.pollTimer) global.clearInterval(this.pollTimer);
    }
  }

  global.MessengerBackendBridge = MessengerBackendBridge;
})(window);
