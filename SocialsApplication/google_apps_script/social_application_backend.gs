/**
 * Social Application Shared Google Apps Script Backend
 * --------------------------------------------------
 * Copy this entire file into a new Google Apps Script project, run setup(), then deploy as a Web app.
 * Deploy settings recommended for a private friend/family network:
 *   Execute as: Me
 *   Who has access: Anyone with the link
 *
 * The browser site supplies its own projectId, so this one Apps Script deployment can be reused by
 * multiple separate projects/sites. The backend stores each project separately in the same spreadsheet.
 *
 *
 * Important architecture note:
 * - Google Apps Script can store messages/files/events, authenticate sessions, enforce the 10-person cap,
 *   and act as a WebRTC signaling mailbox.
 * - Google Apps Script cannot be a WebSocket/SSE/TURN/SFU media server. Camera, filters, audio/video calls,
 *   screen sharing, and screen/audio recording happen in the browser through WebRTC/MediaRecorder/getUserMedia.
 */

const SOCIAL_APP = {
  VERSION: '1.1.0',
  MAX_REGISTERED_USERS_PER_PROJECT: 10,
  MAX_ACTIVE_USERS_PER_PROJECT: 10,
  ACTIVE_WINDOW_MS: 2 * 60 * 1000,
  SESSION_TTL_MS: 12 * 60 * 60 * 1000,
  STORY_MAX_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  STORY_DEFAULT_TTL_MS: 24 * 60 * 60 * 1000,
  MAX_TEXT: 4000,
  MAX_MEDIA_CHARS_IN_SHEET: 40000,
  PUBLIC_DRIVE_FILE_LINKS: true,
  SPREADSHEET_PROPERTY: 'SOCIAL_APPLICATION_SPREADSHEET_ID',
  FILE_FOLDER_PROPERTY: 'SOCIAL_APPLICATION_UPLOAD_FOLDER_ID',
  SHEETS: {
    USERS: ['projectId','userId','username','displayName','salt','passHash','role','avatar','status','createdAt','updatedAt','disabled'],
    SESSIONS: ['token','projectId','userId','displayName','createdAt','lastSeen','userAgent'],
    PROFILES: ['projectId','id','name','color','status','updatedAt'],
    FEED: ['projectId','id','author','text','media','mediaType','createdAt','reactionsJson','commentsJson'],
    CHANNELS: ['projectId','name','createdAt'],
    MESSAGES: ['projectId','channel','id','author','text','media','mediaType','origin','createdAt','reactionsJson'],
    STORIES: ['projectId','id','author','text','media','mediaType','createdAt','expiresAt','reactionsJson'],
    MESSENGER: ['projectId','id','type','clientId','createdAt','payloadJson','appName'],
    ROOMS: ['projectId','room','passHash','createdAt','updatedAt','participantsJson'],
    SIGNALS: ['projectId','room','id','fromPeer','toPeer','type','payloadJson','createdAt','deliveredJson'],
    EVENTS: ['projectId','id','title','start','end','location','description','createdBy','createdAt','updatedAt','calendarEventId'],
    FILES: ['projectId','id','name','mimeType','size','url','driveFileId','createdBy','createdAt'],
    SETTINGS: ['projectId','projectName','updatedAt','settingsJson'],
    AUDIT: ['at','projectId','action','userId','detailsJson']
  }
};

function setup() {
  const ss = getSpreadsheet_();
  Object.keys(SOCIAL_APP.SHEETS).forEach(function(name){ getSheet_(name); });
  getUploadFolder_();
  return { ok: true, message: 'Social Application backend ready.', spreadsheetUrl: ss.getUrl(), version: SOCIAL_APP.VERSION };
}

function doGet(e) {
  return handleRequest_(e, 'GET');
}

function doPost(e) {
  return handleRequest_(e, 'POST');
}

function handleRequest_(e, method) {
  try {
    setup();
    const req = normalizeRequest_(e, method);
    const result = route_(req);
    return output_(result, req.callback);
  } catch (err) {
    return output_({ ok: false, error: String(err && err.message ? err.message : err), version: SOCIAL_APP.VERSION }, (e && e.parameter && e.parameter.callback) || '');
  }
}

function normalizeRequest_(e, method) {
  const p = (e && e.parameter) || {};
  let body = {};
  if (method === 'POST' && e && e.postData && e.postData.contents) {
    try { body = JSON.parse(e.postData.contents); }
    catch (_err) { body = {}; }
  }
  const payload = body.payload || body || {};
  return {
    method: method,
    action: String(body.action || p.action || payload.action || 'state'),
    projectId: cleanSlug_(body.projectId || p.projectId || payload.projectId || 'default-project'),
    projectName: cleanText_(body.projectName || p.projectName || payload.projectName || 'Social Application Project', 160),
    sessionToken: String(body.sessionToken || p.sessionToken || payload.sessionToken || ''),
    callback: String(p.callback || ''),
    payload: mergeObjects_(payload, p)
  };
}

function route_(req) {
  const action = req.action;
  if (action === 'ping') return { ok: true, version: SOCIAL_APP.VERSION, now: new Date().toISOString() };
  if (action === 'setup') return setup();
  if (action === 'manifest') return manifest_(req);
  if (action === 'login') return login_(req);
  if (action === 'register') return register_(req);
  if (action === 'logout') return logout_(req);

  const session = requireSession_(req, action === 'state' || action === 'onlineUsers' || action === 'messengerHistory');
  if (action === 'state') return { ok: true, state: publicState_(req.projectId) };
  if (action === 'onlineUsers') return { ok: true, onlineUsers: onlineUsers_(req.projectId) };
  if (action === 'heartbeat' || action === 'presence') return heartbeat_(req, session);
  if (action === 'profile') return saveProfile_(req, session);
  if (action === 'post') return savePost_(req, session);
  if (action === 'comment') return saveComment_(req, session);
  if (action === 'reaction') return saveReaction_(req, session);
  if (action === 'message') return saveChannelMessage_(req, session);
  if (action === 'importHistory') return importHistory_(req, session);
  if (action === 'story') return saveStory_(req, session);
  if (action === 'exportData') return exportData_(req, session);
  if (action === 'event') return saveEvent_(req, session);
  if (action === 'file') return saveFile_(req, session);
  if (action === 'messengerEnvelope') return messengerEnvelope_(req, session);
  if (action === 'messengerHistory') return { ok: true, envelopes: messengerHistory_(req.projectId) };
  if (action === 'roomJoin') return roomJoin_(req, session);
  if (action === 'roomHeartbeat') return roomHeartbeat_(req, session);
  if (action === 'roomLeave') return roomLeave_(req, session);
  if (action === 'roomSignal') return roomSignal_(req, session);
  if (action === 'roomChat') return roomChat_(req, session);
  if (action === 'roomReaction') return roomReaction_(req, session);
  if (action === 'roomRaiseHand') return roomRaiseHand_(req, session);
  if (action === 'roomPoll') return roomPoll_(req, session);
  throw new Error('Unknown action: ' + action);
}

function login_(req) {
  const payload = req.payload || {};
  const username = cleanUsername_(payload.username);
  const password = String(payload.password || '');
  if (!username || !password) throw new Error('Username and password are required.');
  pruneSessions_();
  const users = rows_('USERS').filter(function(u){ return u.projectId === req.projectId && String(u.username).toLowerCase() === username.toLowerCase() && String(u.disabled) !== 'true'; });
  if (!users.length) throw new Error('User not found. Use Register for the first setup, or check the username.');
  const user = users[0];
  if (hashPassword_(password, user.salt) !== user.passHash) throw new Error('Incorrect password.');
  enforceActiveLimit_(req.projectId, '');
  const session = createSession_(req.projectId, user.userId, user.displayName, payload.userAgent);
  audit_(req.projectId, 'login', user.userId, { username: username });
  return { ok: true, session: session, user: publicUser_(user), state: publicState_(req.projectId) };
}

function register_(req) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const payload = req.payload || {};
    const username = cleanUsername_(payload.username);
    const password = String(payload.password || '');
    const displayName = cleanText_(payload.displayName || username, 80);
    if (!username || !password || password.length < 6) throw new Error('Username and a password of at least 6 characters are required.');
    const existing = rows_('USERS').filter(function(u){ return u.projectId === req.projectId; });
    if (existing.some(function(u){ return String(u.username).toLowerCase() === username.toLowerCase(); })) throw new Error('That username already exists.');
    if (existing.length >= SOCIAL_APP.MAX_REGISTERED_USERS_PER_PROJECT) throw new Error('This project already has the maximum 10 registered users.');
    enforceActiveLimit_(req.projectId, '');
    const salt = randomId_('salt');
    const userId = randomId_('user');
    const now = new Date().toISOString();
    append_('USERS', {
      projectId: req.projectId,
      userId: userId,
      username: username,
      displayName: displayName,
      salt: salt,
      passHash: hashPassword_(password, salt),
      role: existing.length ? 'member' : 'admin',
      avatar: payload.avatar || '💬',
      status: 'Around',
      createdAt: now,
      updatedAt: now,
      disabled: 'false'
    });
    upsertProfile_(req.projectId, { id: cleanSlug_(username), name: displayName, color: '#38bdf8', status: 'Around' });
    const session = createSession_(req.projectId, userId, displayName, payload.userAgent);
    audit_(req.projectId, 'register', userId, { username: username });
    return { ok: true, session: session, user: { userId: userId, username: username, displayName: displayName, role: existing.length ? 'member' : 'admin' }, state: publicState_(req.projectId) };
  } finally {
    lock.releaseLock();
  }
}

function logout_(req) {
  if (!req.sessionToken) return { ok: true };
  const sheet = getSheet_('SESSIONS');
  const data = rows_('SESSIONS');
  data.forEach(function(row){ if (row.token === req.sessionToken) sheet.deleteRow(row._row); });
  return { ok: true };
}

function heartbeat_(req, session) {
  if (!session) session = requireSession_(req, false);
  enforceActiveLimit_(req.projectId, session.token);
  updateSessionSeen_(session.token);
  if (req.payload && (req.payload.name || req.payload.status)) {
    upsertProfile_(req.projectId, {
      id: cleanSlug_(req.payload.id || req.payload.clientId || session.userId),
      name: cleanText_(req.payload.name || session.displayName, 80),
      color: req.payload.color || '#38bdf8',
      status: cleanText_(req.payload.status || 'Around', 120)
    });
  }
  return { ok: true, user: { clientId: session.userId, name: session.displayName, status: 'online', lastSeen: Date.now() }, onlineUsers: onlineUsers_(req.projectId), state: publicState_(req.projectId) };
}

function saveProfile_(req, session) {
  const p = req.payload || {};
  const profile = upsertProfile_(req.projectId, {
    id: cleanSlug_(p.id || p.name || session.userId),
    name: cleanText_(p.name || session.displayName, 80),
    color: /^#[0-9a-f]{6}$/i.test(String(p.color || '')) ? p.color : '#38bdf8',
    status: cleanText_(p.status || 'Around', 120)
  });
  return { ok: true, profile: profile, state: publicState_(req.projectId) };
}

function savePost_(req, session) {
  const p = req.payload || {};
  const media = saveMediaIfNeeded_(req.projectId, p.media, p.mediaType, 'post-media', session.userId);
  const post = {
    projectId: req.projectId,
    id: randomId_('post'),
    author: cleanText_(p.author || session.displayName || 'Friend', 80),
    text: cleanText_(p.text || '', SOCIAL_APP.MAX_TEXT),
    media: media.url || '',
    mediaType: cleanText_(p.mediaType || media.mimeType || '', 120),
    createdAt: new Date().toISOString(),
    reactionsJson: '[]',
    commentsJson: '[]'
  };
  if (!post.text && !post.media) throw new Error('Post text or media is required.');
  append_('FEED', post);
  return { ok: true, post: publicPost_(post), state: publicState_(req.projectId) };
}

function saveComment_(req, session) {
  const p = req.payload || {};
  const rows = rows_('FEED');
  const row = rows.find(function(x){ return x.projectId === req.projectId && x.id === String(p.postId || ''); });
  if (!row) throw new Error('Post not found.');
  const comments = parseJson_(row.commentsJson, []);
  const comment = { id: randomId_('comment'), author: cleanText_(p.author || session.displayName, 80), text: cleanText_(p.text || '', 1200), createdAt: new Date().toISOString() };
  if (!comment.text) throw new Error('Comment text is required.');
  comments.push(comment);
  updateRow_('FEED', row._row, { commentsJson: JSON.stringify(comments.slice(-100)) });
  return { ok: true, comment: comment, state: publicState_(req.projectId) };
}

function saveReaction_(req, session) {
  const p = req.payload || {};
  const type = cleanText_(p.type || 'post', 20);
  const id = String(p.id || '');
  const sheetName = type === 'story' ? 'STORIES' : type === 'message' ? 'MESSAGES' : 'FEED';
  const row = rows_(sheetName).find(function(x){ return x.projectId === req.projectId && x.id === id; });
  if (!row) throw new Error('Item not found.');
  const reactions = parseJson_(row.reactionsJson, []);
  const author = cleanText_(p.author || session.displayName, 80);
  const reaction = cleanText_(p.reaction || '💙', 16);
  const idx = reactions.findIndex(function(r){ return r.author === author && r.reaction === reaction; });
  if (idx >= 0) reactions.splice(idx, 1);
  else reactions.push({ id: randomId_('react'), author: author, reaction: reaction, at: Date.now() });
  updateRow_(sheetName, row._row, { reactionsJson: JSON.stringify(reactions.slice(-250)) });
  return { ok: true, item: { id: id, reactions: reactions }, state: publicState_(req.projectId) };
}

function saveChannelMessage_(req, session) {
  const p = req.payload || {};
  const channel = cleanSlug_(p.channel || 'general');
  ensureChannel_(req.projectId, channel);
  const media = saveMediaIfNeeded_(req.projectId, p.media, p.mediaType, 'message-media', session.userId);
  const message = {
    projectId: req.projectId,
    channel: channel,
    id: randomId_('msg'),
    author: cleanText_(p.author || session.displayName || 'Friend', 80),
    text: cleanText_(p.text || p.content || '', SOCIAL_APP.MAX_TEXT),
    media: media.url || '',
    mediaType: cleanText_(p.mediaType || media.mimeType || '', 120),
    origin: cleanText_(p.origin || 'browser', 40),
    createdAt: new Date().toISOString(),
    reactionsJson: '[]'
  };
  if (!message.text && !message.media) throw new Error('Message text or media is required.');
  append_('MESSAGES', message);
  return { ok: true, channel: channel, message: publicMessage_(message), state: publicState_(req.projectId) };
}

function importHistory_(req, session) {
  const p = req.payload || {};
  const channel = cleanSlug_(p.channel || 'imports');
  ensureChannel_(req.projectId, channel);
  const input = p.history || p;
  const arr = Array.isArray(input) ? input : (input.messages || input.data || []);
  let count = 0;
  arr.slice(0, 500).forEach(function(item){
    const text = cleanText_(item.text || item.content || item.message || '', SOCIAL_APP.MAX_TEXT);
    if (!text) return;
    append_('MESSAGES', {
      projectId: req.projectId,
      channel: channel,
      id: randomId_('msg'),
      author: cleanText_(item.author || item.user || session.displayName || 'Imported', 80),
      text: text,
      media: '',
      mediaType: '',
      origin: 'import',
      createdAt: item.createdAt || new Date().toISOString(),
      reactionsJson: '[]'
    });
    count++;
  });
  return { ok: true, channel: channel, imported: count, state: publicState_(req.projectId) };
}

function saveStory_(req, session) {
  const p = req.payload || {};
  const media = saveMediaIfNeeded_(req.projectId, p.media, p.mediaType, 'story-media', session.userId);
  const ttl = Math.max(5 * 60 * 1000, Math.min(Number(p.ttlMs || SOCIAL_APP.STORY_DEFAULT_TTL_MS), SOCIAL_APP.STORY_MAX_TTL_MS));
  const story = {
    projectId: req.projectId,
    id: randomId_('story'),
    author: cleanText_(p.author || session.displayName || 'Friend', 80),
    text: cleanText_(p.text || '', 800),
    media: media.url || '',
    mediaType: cleanText_(p.mediaType || media.mimeType || '', 120),
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + ttl,
    reactionsJson: '[]'
  };
  if (!story.text && !story.media) throw new Error('Story text or media is required.');
  append_('STORIES', story);
  return { ok: true, story: publicStory_(story), state: publicState_(req.projectId) };
}

function saveEvent_(req, session) {
  const p = req.payload || {};
  const operation = cleanText_(p.operation || 'create', 20);
  if (operation === 'delete') {
    const sheet = getSheet_('EVENTS');
    const rows = rows_('EVENTS');
    const row = rows.find(function(x){ return x.projectId === req.projectId && x.id === String(p.id || ''); });
    if (!row) throw new Error('Event not found.');
    sheet.deleteRow(row._row);
    return { ok: true, deleted: p.id, state: publicState_(req.projectId) };
  }
  const id = p.id || randomId_('event');
  const event = {
    projectId: req.projectId,
    id: id,
    title: cleanText_(p.title || 'Untitled event', 160),
    start: cleanText_(p.start || '', 80),
    end: cleanText_(p.end || p.start || '', 80),
    location: cleanText_(p.location || '', 240),
    description: cleanText_(p.description || '', 2000),
    createdBy: session.displayName || session.userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    calendarEventId: ''
  };
  if (!event.start) throw new Error('Event start date/time is required.');
  const existing = rows_('EVENTS').find(function(x){ return x.projectId === req.projectId && x.id === id; });
  if (existing) updateRow_('EVENTS', existing._row, event);
  else append_('EVENTS', event);
  return { ok: true, event: publicEvent_(event), state: publicState_(req.projectId) };
}

function saveFile_(req, session) {
  const p = req.payload || {};
  const media = saveMediaIfNeeded_(req.projectId, p.dataUrl || p.media, p.mimeType || p.mediaType, p.name || 'upload', session.userId, true);
  return { ok: true, file: media };
}

function messengerEnvelope_(req, session) {
  const raw = req.payload || {};
  const type = cleanText_(raw.type || 'message', 40);
  const allowed = ['hello','history','message','presence','typing','room','call-join','call-signal','call-leave'];
  if (allowed.indexOf(type) < 0) throw new Error('Unsupported messenger envelope type.');
  const envelope = {
    projectId: req.projectId,
    id: cleanText_(raw.id || randomId_('mp'), 120),
    type: type,
    clientId: cleanText_(raw.clientId || session.userId || 'browser', 120),
    createdAt: raw.createdAt || new Date().toISOString(),
    payloadJson: JSON.stringify(raw.payload || {}),
    appName: 'Messenger Plug-in'
  };
  if (type === 'message' || type === 'room' || type.indexOf('call-') === 0 || type === 'typing' || type === 'presence') append_('MESSENGER', envelope);
  return { ok: true, envelope: publicEnvelope_(envelope) };
}

function roomJoin_(req, session) {
  enforceActiveLimit_(req.projectId, session.token);
  const p = req.payload || {};
  const roomCode = cleanSlug_(p.room || 'room');
  const pass = String(p.pass || '');
  const now = Date.now();
  let room = rows_('ROOMS').find(function(x){ return x.projectId === req.projectId && x.room === roomCode; });
  if (!room) {
    append_('ROOMS', { projectId: req.projectId, room: roomCode, passHash: hashPassword_(pass, 'room:' + roomCode), createdAt: now, updatedAt: now, participantsJson: '[]' });
    room = rows_('ROOMS').find(function(x){ return x.projectId === req.projectId && x.room === roomCode; });
  }
  if (room.passHash !== hashPassword_(pass, 'room:' + roomCode)) throw new Error('Incorrect room passcode.');
  let participants = parseJson_(room.participantsJson, []).filter(function(x){ return now - Number(x.lastSeen || 0) < SOCIAL_APP.ACTIVE_WINDOW_MS; });
  const peerId = cleanText_(p.peerId || session.userId || randomId_('peer'), 120);
  if (!participants.some(function(x){ return x.id === peerId; }) && participants.length >= SOCIAL_APP.MAX_ACTIVE_USERS_PER_PROJECT) throw new Error('This room already has 10 active people.');
  participants = participants.filter(function(x){ return x.id !== peerId; });
  participants.push({ id: peerId, name: cleanText_(p.name || session.displayName || 'Guest', 80), joinedAt: now, lastSeen: now, handRaised: false });
  updateRow_('ROOMS', room._row, { updatedAt: now, participantsJson: JSON.stringify(participants) });
  addRoomEvent_(req.projectId, roomCode, 'participants', participants, 'server', '*');
  return { ok: true, peerId: peerId, participants: participants, room: roomCode };
}

function roomHeartbeat_(req, session) {
  const p = req.payload || {};
  const room = findRoom_(req.projectId, p.room);
  const participants = touchParticipant_(room, p.peerId || p.from, null);
  return { ok: true, participants: participants };
}

function roomLeave_(req, session) {
  const p = req.payload || {};
  const room = findRoom_(req.projectId, p.room);
  const peerId = String(p.peerId || p.from || '');
  const participants = parseJson_(room.participantsJson, []).filter(function(x){ return x.id !== peerId; });
  updateRow_('ROOMS', room._row, { updatedAt: Date.now(), participantsJson: JSON.stringify(participants) });
  addRoomEvent_(req.projectId, room.room, 'participants', participants, 'server', '*');
  return { ok: true, participants: participants };
}

function roomSignal_(req, session) {
  const p = req.payload || {};
  const room = findRoom_(req.projectId, p.room);
  const from = cleanText_(p.from || p.peerId || session.userId, 120);
  const to = cleanText_(p.to || '', 120);
  if (!to) throw new Error('Signal target is required.');
  const signal = addRoomEvent_(req.projectId, room.room, 'signal', { from: from, to: to, type: cleanText_(p.type || '', 40), payload: p.payload }, from, to);
  return { ok: true, signal: signal };
}

function roomChat_(req, session) {
  const p = req.payload || {};
  const room = findRoom_(req.projectId, p.room);
  const from = cleanText_(p.from || p.peerId || session.userId, 120);
  const sender = cleanText_(session.displayName || p.name || 'Guest', 80);
  const message = { id: randomId_('roommsg'), from: from, sender: sender, body: cleanText_(p.message || '', SOCIAL_APP.MAX_TEXT), sentAt: Date.now() };
  addRoomEvent_(req.projectId, room.room, 'room-chat', message, from, '*');
  return { ok: true, message: message };
}

function roomReaction_(req, session) {
  const p = req.payload || {};
  const room = findRoom_(req.projectId, p.room);
  const from = cleanText_(p.from || p.peerId || session.userId, 120);
  const reaction = { id: randomId_('roomreact'), from: from, sender: session.displayName || 'Guest', reaction: cleanText_(p.reaction || '👍', 16), sentAt: Date.now() };
  addRoomEvent_(req.projectId, room.room, 'room-reaction', reaction, from, '*');
  return { ok: true, reaction: reaction };
}

function roomRaiseHand_(req, session) {
  const p = req.payload || {};
  const room = findRoom_(req.projectId, p.room);
  const participants = touchParticipant_(room, p.peerId || p.from, Boolean(p.raised));
  addRoomEvent_(req.projectId, room.room, 'participants', participants, 'server', '*');
  return { ok: true, participants: participants };
}

function roomPoll_(req, session) {
  const p = req.payload || {};
  const room = findRoom_(req.projectId, p.room);
  const peerId = cleanText_(p.peerId || p.from || session.userId, 120);
  const since = Number(p.since || 0);
  const now = Date.now();
  const participants = touchParticipant_(room, peerId, null);
  const signals = rows_('SIGNALS').filter(function(x){
    return x.projectId === req.projectId && x.room === room.room && Number(x.createdAt) > since && (x.toPeer === '*' || x.toPeer === peerId);
  }).slice(-100).map(function(x){
    return { event: x.type === 'signal' ? 'signal' : x.type, data: parseJson_(x.payloadJson, {}), at: Number(x.createdAt) };
  });
  return { ok: true, now: now, participants: participants, events: signals };
}

function exportData_(req, session) {
  return { ok: true, data: publicState_(req.projectId), envelopes: messengerHistory_(req.projectId), exportedAt: new Date().toISOString() };
}

function publicState_(projectId) {
  pruneSessions_();
  pruneStories_();
  const profiles = rows_('PROFILES').filter(byProject_(projectId)).map(function(p){ return { id: p.id, name: p.name, color: p.color, status: p.status }; });
  const feed = rows_('FEED').filter(byProject_(projectId)).map(publicPost_).sort(byDateDesc_).slice(0, 250);
  const stories = rows_('STORIES').filter(byProject_(projectId)).filter(function(s){ return Number(s.expiresAt) > Date.now(); }).map(publicStory_).sort(byDateDesc_).slice(0, 120);
  const messages = rows_('MESSAGES').filter(byProject_(projectId));
  const channels = {};
  rows_('CHANNELS').filter(byProject_(projectId)).forEach(function(c){ channels[c.name] = []; });
  messages.forEach(function(m){ if (!channels[m.channel]) channels[m.channel] = []; channels[m.channel].push(publicMessage_(m)); });
  Object.keys(channels).forEach(function(k){ channels[k] = channels[k].sort(byDateAsc_).slice(-250); });
  if (!channels.general) channels.general = [];
  const events = rows_('EVENTS').filter(byProject_(projectId)).map(publicEvent_).sort(function(a,b){ return String(a.start).localeCompare(String(b.start)); }).slice(0, 250);
  return { appName: 'Social Application', profiles: profiles, channels: channels, feed: feed, stories: stories, onlineUsers: onlineUsers_(projectId), events: events, updatedAt: new Date().toISOString() };
}

function onlineUsers_(projectId) {
  const cutoff = Date.now() - SOCIAL_APP.ACTIVE_WINDOW_MS;
  return rows_('SESSIONS').filter(function(s){ return s.projectId === projectId && Number(s.lastSeen) >= cutoff; }).slice(0, SOCIAL_APP.MAX_ACTIVE_USERS_PER_PROJECT).map(function(s){
    return { clientId: s.userId, name: s.displayName, status: 'online', color: '#38bdf8', section: 'site', activeGame: '', activeGameTitle: '', lastSeen: Number(s.lastSeen), connectedAt: Number(s.createdAt) };
  });
}

function messengerHistory_(projectId) {
  return rows_('MESSENGER').filter(byProject_(projectId)).slice(-1000).map(publicEnvelope_);
}

function manifest_(req) {
  const short = req.projectName.slice(0, 12) || 'Project';
  return { ok: true, manifest: { name: req.projectName, short_name: short, display: 'standalone', background_color: '#000305', theme_color: '#003C42', description: 'Private small-network social application.' } };
}

function requireSession_(req, optional) {
  pruneSessions_();
  if (!req.sessionToken) {
    if (optional) return null;
    throw new Error('Login required.');
  }
  const session = rows_('SESSIONS').find(function(s){ return s.token === req.sessionToken && s.projectId === req.projectId; });
  if (!session) {
    if (optional) return null;
    throw new Error('Session expired. Please log in again.');
  }
  updateSessionSeen_(session.token);
  return session;
}

function createSession_(projectId, userId, displayName, userAgent) {
  const token = randomId_('sess');
  const now = Date.now();
  append_('SESSIONS', { token: token, projectId: projectId, userId: userId, displayName: displayName, createdAt: now, lastSeen: now, userAgent: cleanText_(userAgent || '', 240) });
  return { sessionToken: token, token: token, projectId: projectId, userId: userId, displayName: displayName, createdAt: now, maxActiveUsers: SOCIAL_APP.MAX_ACTIVE_USERS_PER_PROJECT };
}

function updateSessionSeen_(token) {
  const row = rows_('SESSIONS').find(function(s){ return s.token === token; });
  if (row) updateRow_('SESSIONS', row._row, { lastSeen: Date.now() });
}

function enforceActiveLimit_(projectId, currentToken) {
  const active = rows_('SESSIONS').filter(function(s){ return s.projectId === projectId && Date.now() - Number(s.lastSeen || 0) < SOCIAL_APP.ACTIVE_WINDOW_MS; });
  const alreadyActive = active.some(function(s){ return s.token === currentToken; });
  if (!alreadyActive && active.length >= SOCIAL_APP.MAX_ACTIVE_USERS_PER_PROJECT) throw new Error('This project already has 10 active people. Try again after someone leaves or becomes inactive.');
}

function pruneSessions_() {
  const cutoff = Date.now() - SOCIAL_APP.SESSION_TTL_MS;
  const sheet = getSheet_('SESSIONS');
  const rows = rows_('SESSIONS').filter(function(r){ return Number(r.lastSeen || 0) < cutoff; }).sort(function(a,b){ return b._row - a._row; });
  rows.forEach(function(row){ sheet.deleteRow(row._row); });
}

function pruneStories_() {
  const sheet = getSheet_('STORIES');
  const expired = rows_('STORIES').filter(function(r){ return Number(r.expiresAt || 0) < Date.now(); }).sort(function(a,b){ return b._row - a._row; });
  expired.forEach(function(row){ sheet.deleteRow(row._row); });
}

function upsertProfile_(projectId, p) {
  const profile = { projectId: projectId, id: cleanSlug_(p.id || p.name), name: cleanText_(p.name || 'Friend', 80), color: /^#[0-9a-f]{6}$/i.test(String(p.color || '')) ? p.color : '#38bdf8', status: cleanText_(p.status || 'Around', 120), updatedAt: new Date().toISOString() };
  const existing = rows_('PROFILES').find(function(row){ return row.projectId === projectId && row.id === profile.id; });
  if (existing) updateRow_('PROFILES', existing._row, profile);
  else append_('PROFILES', profile);
  return { id: profile.id, name: profile.name, color: profile.color, status: profile.status };
}

function ensureChannel_(projectId, name) {
  const channel = cleanSlug_(name || 'general');
  const exists = rows_('CHANNELS').some(function(c){ return c.projectId === projectId && c.name === channel; });
  if (!exists) append_('CHANNELS', { projectId: projectId, name: channel, createdAt: new Date().toISOString() });
}

function findRoom_(projectId, roomCode) {
  const room = rows_('ROOMS').find(function(r){ return r.projectId === projectId && r.room === cleanSlug_(roomCode || 'room'); });
  if (!room) throw new Error('Room not found.');
  return room;
}

function touchParticipant_(room, peerId, handRaised) {
  const now = Date.now();
  const participants = parseJson_(room.participantsJson, []).filter(function(x){ return now - Number(x.lastSeen || 0) < SOCIAL_APP.ACTIVE_WINDOW_MS; });
  participants.forEach(function(p){ if (p.id === peerId) { p.lastSeen = now; if (handRaised !== null && handRaised !== undefined) p.handRaised = handRaised; } });
  updateRow_('ROOMS', room._row, { updatedAt: now, participantsJson: JSON.stringify(participants) });
  return participants;
}

function addRoomEvent_(projectId, room, type, payload, fromPeer, toPeer) {
  const row = { projectId: projectId, room: room, id: randomId_('signal'), fromPeer: fromPeer || 'server', toPeer: toPeer || '*', type: type, payloadJson: JSON.stringify(payload || {}), createdAt: Date.now(), deliveredJson: '[]' };
  append_('SIGNALS', row);
  pruneSignals_();
  return row;
}

function pruneSignals_() {
  const cutoff = Date.now() - 30 * 60 * 1000;
  const sheet = getSheet_('SIGNALS');
  rows_('SIGNALS').filter(function(r){ return Number(r.createdAt || 0) < cutoff; }).sort(function(a,b){ return b._row - a._row; }).forEach(function(row){ sheet.deleteRow(row._row); });
}

function saveMediaIfNeeded_(projectId, dataUrl, mimeType, name, createdBy, force) {
  const value = String(dataUrl || '');
  if (!value) return { url: '', mimeType: mimeType || '', id: '' };
  if (!force && value.length <= SOCIAL_APP.MAX_MEDIA_CHARS_IN_SHEET) return { url: value, mimeType: mimeType || guessMime_(value), id: '' };
  const match = value.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { url: value.slice(0, 2000), mimeType: mimeType || '', id: '' };
  const type = mimeType || match[1] || 'application/octet-stream';
  const bytes = Utilities.base64Decode(match[2]);
  const safeName = cleanSlug_(name || 'upload') + '-' + Date.now();
  const blob = Utilities.newBlob(bytes, type, safeName);
  const file = getUploadFolder_().createFile(blob);
  if (SOCIAL_APP.PUBLIC_DRIVE_FILE_LINKS) file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const url = SOCIAL_APP.PUBLIC_DRIVE_FILE_LINKS ? ('https://drive.google.com/uc?export=download&id=' + file.getId()) : file.getUrl();
  const id = randomId_('file');
  append_('FILES', { projectId: projectId, id: id, name: safeName, mimeType: type, size: bytes.length, url: url, driveFileId: file.getId(), createdBy: createdBy || '', createdAt: new Date().toISOString() });
  return { id: id, name: safeName, mimeType: type, size: bytes.length, url: url, driveFileId: file.getId() };
}

function publicPost_(p) { return { id: p.id, author: p.author, text: p.text, media: p.media, mediaType: p.mediaType, createdAt: p.createdAt, reactions: parseJson_(p.reactionsJson, []), comments: parseJson_(p.commentsJson, []) }; }
function publicMessage_(m) { return { id: m.id, author: m.author, text: m.text, media: m.media, mediaType: m.mediaType, origin: m.origin, createdAt: m.createdAt, reactions: parseJson_(m.reactionsJson, []) }; }
function publicStory_(s) { return { id: s.id, author: s.author, text: s.text, media: s.media, mediaType: s.mediaType, createdAt: s.createdAt, expiresAt: Number(s.expiresAt), reactions: parseJson_(s.reactionsJson, []) }; }
function publicEnvelope_(e) { return { id: e.id, type: e.type, clientId: e.clientId, createdAt: e.createdAt, payload: parseJson_(e.payloadJson, {}), appName: e.appName || 'Messenger Plug-in' }; }
function publicEvent_(e) { return { id: e.id, title: e.title, start: e.start, end: e.end, location: e.location, description: e.description, createdBy: e.createdBy, createdAt: e.createdAt, updatedAt: e.updatedAt, calendarEventId: e.calendarEventId }; }
function publicUser_(u) { return { userId: u.userId, username: u.username, displayName: u.displayName, role: u.role, avatar: u.avatar, status: u.status }; }

function output_(obj, callback) {
  const text = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + text + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(SOCIAL_APP.SPREADSHEET_PROPERTY);
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create('Social Application Shared Backend Data');
  props.setProperty(SOCIAL_APP.SPREADSHEET_PROPERTY, ss.getId());
  return ss;
}

function getUploadFolder_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(SOCIAL_APP.FILE_FOLDER_PROPERTY);
  if (id) return DriveApp.getFolderById(id);
  const folder = DriveApp.createFolder('Social Application Shared Backend Uploads');
  props.setProperty(SOCIAL_APP.FILE_FOLDER_PROPERTY, folder.getId());
  return folder;
}

function getSheet_(key) {
  const headers = SOCIAL_APP.SHEETS[key];
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(key);
  if (!sheet) sheet = ss.insertSheet(key);
  const width = headers.length;
  const first = sheet.getRange(1, 1, 1, width).getValues()[0];
  const mismatch = headers.some(function(h, i){ return first[i] !== h; });
  if (mismatch) sheet.getRange(1, 1, 1, width).setValues([headers]);
  return sheet;
}

function rows_(key) {
  const sheet = getSheet_(key);
  const values = sheet.getDataRange().getValues();
  const headers = SOCIAL_APP.SHEETS[key];
  if (values.length <= 1) return [];
  return values.slice(1).map(function(row, i){
    const obj = { _row: i + 2 };
    headers.forEach(function(h, c){ obj[h] = row[c]; });
    return obj;
  });
}

function append_(key, obj) {
  const sheet = getSheet_(key);
  const headers = SOCIAL_APP.SHEETS[key];
  sheet.appendRow(headers.map(function(h){ return obj[h] !== undefined ? obj[h] : ''; }));
}

function updateRow_(key, rowNumber, patch) {
  const sheet = getSheet_(key);
  const headers = SOCIAL_APP.SHEETS[key];
  const current = sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0];
  const next = headers.map(function(h, i){ return patch[h] !== undefined ? patch[h] : current[i]; });
  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([next]);
}

function audit_(projectId, action, userId, details) {
  append_('AUDIT', { at: new Date().toISOString(), projectId: projectId, action: action, userId: userId || '', detailsJson: JSON.stringify(details || {}) });
}

function hashPassword_(password, salt) {
  const raw = salt + ':' + String(password || '');
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(bytes);
}

function randomId_(prefix) {
  return prefix + '_' + Utilities.getUuid().replace(/-/g, '').slice(0, 20);
}

function cleanSlug_(value) {
  const cleaned = String(value || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 64);
  return cleaned || 'default';
}

function cleanUsername_(value) {
  return String(value || '').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.@-]+/g, '').slice(0, 80);
}

function cleanText_(value, limit) {
  return String(value == null ? '' : value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, limit || 4000);
}

function parseJson_(value, fallback) {
  try { return JSON.parse(value || ''); }
  catch (_err) { return fallback; }
}

function mergeObjects_(a, b) {
  const out = {};
  Object.keys(a || {}).forEach(function(k){ out[k] = a[k]; });
  Object.keys(b || {}).forEach(function(k){ if (out[k] === undefined) out[k] = b[k]; });
  return out;
}

function byProject_(projectId) { return function(row){ return row.projectId === projectId; }; }
function byDateDesc_(a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); }
function byDateAsc_(a, b) { return String(a.createdAt || '').localeCompare(String(b.createdAt || '')); }
function guessMime_(dataUrl) { const m = String(dataUrl || '').match(/^data:([^;]+)/); return m ? m[1] : ''; }
