import http from 'node:http';
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_DIR = path.join(__dirname, 'app');
const DATA_DIR = path.resolve(__dirname, process.env.DATA_DIR || 'data');
const DATA_FILE = path.join(DATA_DIR, 'socials-data.json');
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '127.0.0.1';
const MAX_BODY = Math.max(1, Number(process.env.MAX_BODY_MB || 12)) * 1024 * 1024;
const STALE_AFTER_MS = 90_000;
const PRESENCE_STALE_MS = 75_000;
const MAX_ACTIVE_USERS = 10;

mkdirSync(DATA_DIR, { recursive: true });

const defaults = {
  version: 1,
  appName: 'Socials Application',
  profiles: [
    { id: 'friend', name: 'Friend', color: '#38bdf8', status: 'Around' },
    { id: 'loved-one', name: 'Loved One', color: '#f472b6', status: 'Around' }
  ],
  channels: {
    general: [],
    checkins: [],
    cats: [],
    plans: []
  },
  feed: [],
  stories: [],
  events: [],
  messengerEnvelopes: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

let db = loadDb();
const socialClients = new Set();
const messengerClients = new Set();
/** @type {Map<string, { clientId:string, name:string, status:string, color:string, section:string, activeGame:string, activeGameTitle:string, lastSeen:number, connectedAt:number }>} */
const presence = new Map();
/** @type {Map<string, { passHash:string, createdAt:number, participants:Map<string, any>, clients:Map<string, Set<http.ServerResponse>>, events:any[] }>} */
const rooms = new Map();

function loadDb() {
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    return { ...structuredClone(defaults), ...parsed, channels: { ...defaults.channels, ...(parsed.channels || {}) } };
  } catch {
    writeDb(defaults);
    return structuredClone(defaults);
  }
}

function writeDb(value = db) {
  value.updatedAt = new Date().toISOString();
  writeFileSync(DATA_FILE, JSON.stringify(value, null, 2));
}

function jsonResponse(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store'
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > MAX_BODY) {
        reject(new Error(`Body too large. Limit is ${Math.round(MAX_BODY / 1024 / 1024)} MB.`));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { reject(new Error('Invalid JSON body.')); }
    });
    req.on('error', reject);
  });
}

function cleanText(value, limit = 4000) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
    .slice(0, limit);
}

function cleanSlug(value, fallback = 'general') {
  return String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || fallback;
}

function safeDataUrl(value) {
  const str = String(value || '');
  if (!str) return '';
  if (!/^data:(image|video|audio)\/[a-z0-9.+-]+;base64,/i.test(str)) return '';
  return str.slice(0, MAX_BODY);
}

function makeId(prefix = 'item') {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

function presenceSnapshot() {
  const now = Date.now();
  for (const [id, user] of presence) {
    if (now - user.lastSeen > PRESENCE_STALE_MS) presence.delete(id);
  }
  return [...presence.values()]
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .map(user => ({
      clientId: user.clientId,
      name: user.name,
      status: user.status,
      color: user.color,
      section: user.section,
      activeGame: user.activeGame,
      activeGameTitle: user.activeGameTitle,
      lastSeen: user.lastSeen,
      connectedAt: user.connectedAt
    }));
}

function publicState() {
  const now = Date.now();
  db.stories = (db.stories || []).filter(story => !story.expiresAt || story.expiresAt > now);
  return {
    appName: db.appName,
    profiles: db.profiles || [],
    channels: Object.fromEntries(Object.entries(db.channels || {}).map(([name, list]) => [name, list.slice(-250)])),
    feed: (db.feed || []).slice(-250).reverse(),
    stories: (db.stories || []).slice(-120).reverse(),
    events: (db.events || []).slice().sort((a, b) => String(a.start || '').localeCompare(String(b.start || ''))).slice(0, 250),
    onlineUsers: presenceSnapshot(),
    updatedAt: db.updatedAt
  };
}


function messengerHistory() {
  if (!Array.isArray(db.messengerEnvelopes)) db.messengerEnvelopes = [];
  return db.messengerEnvelopes.slice(-1000);
}

function normalizeMessengerEnvelope(raw = {}) {
  const type = cleanText(raw.type || 'message', 40);
  const allowed = new Set(['hello', 'history', 'message', 'presence', 'typing', 'room', 'call-join', 'call-signal', 'call-leave']);
  if (!allowed.has(type)) return null;
  return {
    type,
    payload: raw.payload && typeof raw.payload === 'object' ? raw.payload : {},
    id: cleanText(raw.id || makeId('mp'), 120),
    clientId: cleanText(raw.clientId || 'browser', 120),
    createdAt: raw.createdAt || new Date().toISOString(),
    appName: 'Messenger Plug-in'
  };
}

function storeMessengerEnvelope(envelope) {
  if (!Array.isArray(db.messengerEnvelopes)) db.messengerEnvelopes = [];
  if (envelope.type === 'message' || envelope.type === 'room') {
    db.messengerEnvelopes.push(envelope);
    db.messengerEnvelopes = db.messengerEnvelopes.slice(-2000);
    writeDb();
  }
}

function broadcastMessengerEnvelope(envelope) {
  const packet = `event: envelope\ndata: ${JSON.stringify(envelope)}\n\n`;
  for (const res of [...messengerClients]) {
    try { res.write(packet); } catch { messengerClients.delete(res); }
  }
}

function broadcastSocial(event = 'state', payload = publicState()) {
  const packet = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of [...socialClients]) {
    try { res.write(packet); } catch { socialClients.delete(res); }
  }
}

function addReaction(collection, itemId, author, reaction) {
  const item = collection.find(x => x.id === itemId);
  if (!item) return null;
  if (!item.reactions) item.reactions = [];
  const cleanAuthor = cleanText(author || 'Friend', 80);
  const cleanReaction = cleanText(reaction || '💙', 16);
  const existing = item.reactions.find(x => x.author === cleanAuthor && x.reaction === cleanReaction);
  if (existing) item.reactions = item.reactions.filter(x => x !== existing);
  else item.reactions.push({ id: makeId('react'), author: cleanAuthor, reaction: cleanReaction, at: Date.now() });
  return item;
}

function normalizeHistoryExport(input) {
  const findMessages = value => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];
    if (Array.isArray(value.messages)) return value.messages;
    if (Array.isArray(value.data)) return value.data;
    for (const nested of Object.values(value)) {
      if (Array.isArray(nested) && nested.some(item => item && typeof item === 'object' && ('content' in item || 'text' in item || 'message' in item))) return nested;
    }
    return [];
  };
  const authorName = author => {
    if (!author) return 'Imported';
    if (typeof author === 'string') return author;
    return author.displayName || author.name || author.username || author.nick || author.id || 'Imported';
  };
  return findMessages(input)
    .map(item => ({
      id: makeId('msg'),
      author: cleanText(authorName(item.author || item.user), 80),
      text: cleanText(item.content || item.text || item.message || '', 4000),
      media: '',
      mediaType: '',
      origin: 'history-import',
      createdAt: item.timestamp || item.time || item.createdAt || item.date || new Date().toISOString(),
      reactions: []
    }))
    .filter(item => item.text);
}

async function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const safePath = path.normalize(pathname).replace(/^([.][.][\/])+/, '');
  const filePath = path.join(APP_DIR, safePath);
  if (!filePath.startsWith(APP_DIR) || !existsSync(filePath)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const type = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.wasm': 'application/wasm'
  }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  createReadStream(filePath).pipe(res);
}

function hashPass(pass = '') {
  return crypto.createHash('sha256').update(String(pass)).digest('hex');
}

function roomSnapshot(room) {
  return [...room.participants.values()].map(p => ({
    id: p.id,
    name: p.name,
    joinedAt: p.joinedAt,
    lastSeen: p.lastSeen,
    handRaised: Boolean(p.handRaised)
  }));
}

function ensureRoom(code, pass) {
  let room = rooms.get(code);
  if (!room) {
    room = { passHash: hashPass(pass), createdAt: Date.now(), participants: new Map(), clients: new Map(), events: [] };
    rooms.set(code, room);
  }
  return room;
}

function emitRoom(roomCode, event, payload, targetPeer = '*') {
  const room = rooms.get(roomCode);
  if (!room) return;
  const packet = { event, payload, at: Date.now() };
  room.events.push(packet);
  if (room.events.length > 250) room.events.splice(0, room.events.length - 250);
  const deliver = res => {
    try { res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`); } catch {}
  };
  if (targetPeer === '*') for (const set of room.clients.values()) for (const res of set) deliver(res);
  else for (const res of room.clients.get(targetPeer) || []) deliver(res);
}

function updatePresence(body = {}) {
  const rawId = cleanText(body.clientId || body.id || body.name || crypto.randomUUID(), 120);
  const clientId = cleanSlug(rawId, crypto.randomUUID());
  const now = Date.now();
  if (!presence.has(clientId) && presenceSnapshot().length >= MAX_ACTIVE_USERS) throw new Error('This site already has 10 active people.');
  const user = {
    clientId,
    name: cleanText(body.name || 'Friend', 80),
    status: cleanText(body.status || 'Around', 120),
    color: /^#[0-9a-f]{6}$/i.test(String(body.color || '')) ? body.color : '#22d3ee',
    section: cleanSlug(body.section || 'site', 'site'),
    activeGame: cleanSlug(body.activeGame || '', ''),
    activeGameTitle: cleanText(body.activeGameTitle || '', 120),
    lastSeen: now,
    connectedAt: presence.get(clientId)?.connectedAt || now
  };
  presence.set(clientId, user);
  return user;
}

function prunePresence() {
  const before = presence.size;
  presenceSnapshot();
  if (presence.size !== before) broadcastSocial();
}

function pruneRooms() {
  const now = Date.now();
  for (const [code, room] of rooms) {
    let changed = false;
    for (const [peerId, p] of room.participants) {
      if (now - p.lastSeen > STALE_AFTER_MS) { room.participants.delete(peerId); changed = true; }
    }
    if (changed) emitRoom(code, 'participants', roomSnapshot(room));
    if (room.participants.size === 0 && now - room.createdAt > STALE_AFTER_MS) rooms.delete(code);
  }
}
setInterval(pruneRooms, 30_000).unref();
setInterval(prunePresence, 25_000).unref();

async function handleApi(req, res, url) {
  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      return jsonResponse(res, 200, { ok: true, app: 'Socials Application', rooms: rooms.size, now: new Date().toISOString() });
    }

    if (req.method === 'GET' && url.pathname === '/events') {
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'x-accel-buffering': 'no'
      });
      res.write(`event: state\ndata: ${JSON.stringify(publicState())}\n\n`);
      socialClients.add(res);
      const keepAlive = setInterval(() => res.write(': keepalive\n\n'), 20_000);
      req.on('close', () => { clearInterval(keepAlive); socialClients.delete(res); });
      return true;
    }



    if (req.method === 'GET' && url.pathname === '/messenger-events') {
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'x-accel-buffering': 'no'
      });
      res.write(`event: history\ndata: ${JSON.stringify({ envelopes: messengerHistory() })}\n\n`);
      messengerClients.add(res);
      const keepAlive = setInterval(() => res.write(': keepalive\n\n'), 20_000);
      req.on('close', () => { clearInterval(keepAlive); messengerClients.delete(res); });
      return true;
    }

    if (req.method === 'GET' && url.pathname === '/api/messenger/history') {
      return jsonResponse(res, 200, { envelopes: messengerHistory() });
    }

    if (req.method === 'GET' && url.pathname === '/room-events') {
      const roomCode = cleanSlug(url.searchParams.get('room'), 'room');
      const peerId = String(url.searchParams.get('peer') || '');
      const room = rooms.get(roomCode);
      if (!room || !peerId || !room.participants.has(peerId)) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Room or participant not found');
        return true;
      }
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache, no-transform',
        connection: 'keep-alive',
        'x-accel-buffering': 'no'
      });
      res.write(`event: ready\ndata: ${JSON.stringify({ peerId, room: roomCode })}\n\n`);
      let set = room.clients.get(peerId);
      if (!set) room.clients.set(peerId, (set = new Set()));
      set.add(res);
      const keepAlive = setInterval(() => res.write(': keepalive\n\n'), 20_000);
      req.on('close', () => { clearInterval(keepAlive); set.delete(res); if (set.size === 0) room.clients.delete(peerId); });
      return true;
    }

    if (req.method === 'GET' && url.pathname === '/api/state') return jsonResponse(res, 200, publicState());
    if (req.method === 'GET' && url.pathname === '/api/online-users') return jsonResponse(res, 200, { onlineUsers: presenceSnapshot() });
    if (!url.pathname.startsWith('/api/')) return false;
    const body = await readBody(req);



    if (url.pathname === '/api/messenger/envelope' && req.method === 'POST') {
      const envelope = normalizeMessengerEnvelope(body);
      if (!envelope) return jsonResponse(res, 400, { error: 'Unsupported messenger envelope type.' });
      storeMessengerEnvelope(envelope);
      broadcastMessengerEnvelope(envelope);
      return jsonResponse(res, 202, { ok: true, envelope });
    }

    if (url.pathname === '/api/presence' && req.method === 'POST') {
      const user = updatePresence(body);
      const onlineUsers = presenceSnapshot();
      broadcastSocial('presence', { user, onlineUsers });
      broadcastSocial();
      return jsonResponse(res, 200, { user, onlineUsers });
    }

    if (url.pathname === '/api/profile' && req.method === 'POST') {
      const id = cleanSlug(body.id || body.name, 'friend');
      const profile = {
        id,
        name: cleanText(body.name || id, 80),
        color: /^#[0-9a-f]{6}$/i.test(String(body.color || '')) ? body.color : '#38bdf8',
        status: cleanText(body.status || 'Around', 120)
      };
      const existing = db.profiles.findIndex(p => p.id === id);
      if (existing >= 0) db.profiles[existing] = { ...db.profiles[existing], ...profile };
      else db.profiles.push(profile);
      writeDb();
      broadcastSocial();
      return jsonResponse(res, 200, { profile });
    }

    if (url.pathname === '/api/post' && req.method === 'POST') {
      const post = {
        id: makeId('post'),
        author: cleanText(body.author || 'Friend', 80),
        text: cleanText(body.text || '', 4000),
        media: safeDataUrl(body.media),
        mediaType: cleanText(body.mediaType || '', 120),
        createdAt: new Date().toISOString(),
        reactions: [],
        comments: []
      };
      if (!post.text && !post.media) return jsonResponse(res, 400, { error: 'Post text or media is required.' });
      db.feed.push(post);
      db.feed = db.feed.slice(-500);
      writeDb();
      broadcastSocial('post', post);
      broadcastSocial();
      return jsonResponse(res, 201, { post });
    }

    if (url.pathname === '/api/comment' && req.method === 'POST') {
      const post = db.feed.find(x => x.id === body.postId);
      if (!post) return jsonResponse(res, 404, { error: 'Post not found.' });
      if (!post.comments) post.comments = [];
      const comment = { id: makeId('comment'), author: cleanText(body.author || 'Friend', 80), text: cleanText(body.text || '', 1200), createdAt: new Date().toISOString() };
      if (!comment.text) return jsonResponse(res, 400, { error: 'Comment text is required.' });
      post.comments.push(comment);
      post.comments = post.comments.slice(-100);
      writeDb();
      broadcastSocial();
      return jsonResponse(res, 201, { comment });
    }

    if (url.pathname === '/api/reaction' && req.method === 'POST') {
      const type = cleanText(body.type || 'post', 20);
      const collection = type === 'story' ? db.stories : type === 'message' ? Object.values(db.channels).flat() : db.feed;
      const item = addReaction(collection, String(body.id || ''), body.author, body.reaction);
      if (!item) return jsonResponse(res, 404, { error: 'Item not found.' });
      writeDb();
      broadcastSocial();
      return jsonResponse(res, 200, { item });
    }

    if (url.pathname === '/api/messages' && req.method === 'POST') {
      const channel = cleanSlug(body.channel, 'general');
      if (!db.channels[channel]) db.channels[channel] = [];
      const message = {
        id: makeId('msg'),
        author: cleanText(body.author || 'Friend', 80),
        text: cleanText(body.text || body.content || '', 4000),
        media: safeDataUrl(body.media),
        mediaType: cleanText(body.mediaType || '', 120),
        origin: cleanText(body.origin || 'browser', 40),
        createdAt: new Date().toISOString(),
        reactions: []
      };
      if (!message.text && !message.media) return jsonResponse(res, 400, { error: 'Message text or media is required.' });
      db.channels[channel].push(message);
      db.channels[channel] = db.channels[channel].slice(-1000);
      writeDb();
      broadcastSocial('message', { channel, message });
      broadcastSocial();
      return jsonResponse(res, 201, { channel, message });
    }

    if (url.pathname === '/api/import/history' && req.method === 'POST') {
      const channel = cleanSlug(body.channel, 'imports');
      if (!db.channels[channel]) db.channels[channel] = [];
      const imported = normalizeHistoryExport(body.history ?? body);
      db.channels[channel].push(...imported);
      db.channels[channel] = db.channels[channel].slice(-1000);
      writeDb();
      broadcastSocial();
      return jsonResponse(res, 201, { channel, imported: imported.length, messages: imported });
    }

    if (url.pathname === '/api/story' && req.method === 'POST') {
      const ttl = Math.max(5 * 60 * 1000, Math.min(Number(body.ttlMs || 24 * 60 * 60 * 1000), 7 * 24 * 60 * 60 * 1000));
      const story = {
        id: makeId('story'),
        author: cleanText(body.author || 'Friend', 80),
        text: cleanText(body.text || '', 800),
        media: safeDataUrl(body.media),
        mediaType: cleanText(body.mediaType || '', 120),
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + ttl,
        reactions: []
      };
      if (!story.text && !story.media) return jsonResponse(res, 400, { error: 'Story text or media is required.' });
      db.stories.push(story);
      db.stories = db.stories.slice(-250);
      writeDb();
      broadcastSocial('story', story);
      broadcastSocial();
      return jsonResponse(res, 201, { story });
    }

    if (url.pathname === '/api/event' && req.method === 'POST') {
      if (!Array.isArray(db.events)) db.events = [];
      const operation = cleanText(body.operation || 'create', 20);
      if (operation === 'delete') {
        const before = db.events.length;
        db.events = db.events.filter(event => event.id !== String(body.id || ''));
        writeDb();
        broadcastSocial();
        return jsonResponse(res, 200, { deleted: before - db.events.length, state: publicState() });
      }
      const event = {
        id: cleanText(body.id || makeId('event'), 80),
        title: cleanText(body.title || 'Untitled event', 160),
        start: cleanText(body.start || '', 80),
        end: cleanText(body.end || body.start || '', 80),
        location: cleanText(body.location || '', 240),
        description: cleanText(body.description || '', 2000),
        createdBy: cleanText(body.author || body.createdBy || 'Friend', 80),
        createdAt: body.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (!event.title || !event.start) return jsonResponse(res, 400, { error: 'Event title and start time are required.' });
      const existing = db.events.findIndex(item => item.id === event.id);
      if (existing >= 0) db.events[existing] = { ...db.events[existing], ...event };
      else db.events.push(event);
      db.events = db.events.slice(-500);
      writeDb();
      broadcastSocial('event', event);
      broadcastSocial();
      return jsonResponse(res, 201, { event, state: publicState() });
    }

    if (url.pathname === '/api/export' && req.method === 'POST') return jsonResponse(res, 200, db);

    if (url.pathname.startsWith('/api/room/') && req.method === 'POST') return handleRoomApi(req, res, url, body);

    return jsonResponse(res, 404, { error: 'Unknown API route.' });
  } catch (err) {
    return jsonResponse(res, 500, { error: err.message || 'Server error.' });
  }
}

function handleRoomApi(_req, res, url, body) {
  const roomCode = cleanSlug(body.room, 'room');
  const pass = String(body.pass || '');

  if (url.pathname === '/api/room/join') {
    const room = ensureRoom(roomCode, pass);
    if (room.passHash !== hashPass(pass)) return jsonResponse(res, 403, { error: 'Incorrect room passcode.' });
    const id = String(body.peerId || crypto.randomUUID());
    if (!room.participants.has(id) && room.participants.size >= MAX_ACTIVE_USERS) return jsonResponse(res, 429, { error: 'This room already has 10 active people.' });
    const participant = { id, name: cleanText(body.name || 'Guest', 80), joinedAt: Date.now(), lastSeen: Date.now(), handRaised: false };
    room.participants.set(id, participant);
    emitRoom(roomCode, 'participants', roomSnapshot(room));
    return jsonResponse(res, 200, { peerId: id, participants: roomSnapshot(room), room: roomCode });
  }

  const room = rooms.get(roomCode);
  if (!room) return jsonResponse(res, 404, { error: 'Room not found.' });
  const from = String(body.from || body.peerId || '');
  if (from && room.participants.has(from)) room.participants.get(from).lastSeen = Date.now();

  if (url.pathname === '/api/room/heartbeat') return jsonResponse(res, 200, { ok: true, participants: roomSnapshot(room) });

  if (url.pathname === '/api/room/leave') {
    if (from) room.participants.delete(from);
    emitRoom(roomCode, 'participants', roomSnapshot(room));
    if (room.participants.size === 0) rooms.delete(roomCode);
    return jsonResponse(res, 200, { ok: true });
  }

  if (url.pathname === '/api/room/signal') {
    const to = String(body.to || '');
    if (!to || !room.participants.has(to)) return jsonResponse(res, 404, { error: 'Target peer not found.' });
    emitRoom(roomCode, 'signal', { from, to, type: cleanText(body.type || '', 40), payload: body.payload }, to);
    return jsonResponse(res, 200, { ok: true });
  }

  if (url.pathname === '/api/room/chat') {
    const sender = room.participants.get(from)?.name || 'Guest';
    emitRoom(roomCode, 'room-chat', { id: makeId('roommsg'), from, sender, body: cleanText(body.message || '', 4000), sentAt: Date.now() });
    return jsonResponse(res, 200, { ok: true });
  }

  if (url.pathname === '/api/room/reaction') {
    const sender = room.participants.get(from)?.name || 'Guest';
    emitRoom(roomCode, 'room-reaction', { id: makeId('roomreact'), from, sender, reaction: cleanText(body.reaction || '👍', 16), sentAt: Date.now() });
    return jsonResponse(res, 200, { ok: true });
  }

  if (url.pathname === '/api/room/raise-hand') {
    const p = room.participants.get(from);
    if (p) p.handRaised = Boolean(body.raised);
    emitRoom(roomCode, 'participants', roomSnapshot(room));
    return jsonResponse(res, 200, { ok: true });
  }

  return jsonResponse(res, 404, { error: 'Unknown room API route.' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const handled = await handleApi(req, res, url);
  if (handled !== false) return;
  await serveStatic(req, res, url);
});

server.listen(PORT, HOST, () => {
  console.log(`Socials Application running at http://${HOST}:${PORT}`);
  if (HOST === '127.0.0.1') console.log('For LAN testing: set HOST=0.0.0.0 before npm start. Camera/mic access may require HTTPS outside localhost.');
});
