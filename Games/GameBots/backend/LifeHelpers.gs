/**
 * LifeHelpers.gs — GitHub-safe GameBots strategy bridge
 *
 * Private deployment values are not stored in this repository.
 * Set AI_BRAIN_ENDPOINT in Apps Script Script Properties, and optionally
 * install the AI-Brain Apps Script library using the identifier AIBrain.
 */

var LIFEHELPERS = Object.freeze({
  VERSION: '1.0.1',
  MODE: 'gameplay_strategy_only',
  MAX_JSON_CHARS: 28000,
  CACHE_SECONDS: 2,
  ALLOWED_ACTIONS: ['strategy','gameplay','health']
});

function doGet(e) {
  return json_({ok:true, service:'LifeHelpers GameBots', version:LIFEHELPERS.VERSION, mode:LIFEHELPERS.MODE, actions:['strategy','gameplay']});
}

function doPost(e) {
  try {
    var request = parseRequest_(e);
    var action = String(request.action || 'strategy').toLowerCase();
    if (LIFEHELPERS.ALLOWED_ACTIONS.indexOf(action) < 0) {
      return json_({ok:false,error:'unsupported_action'});
    }
    if (action === 'health') return doGet(e);

    var safe = sanitizeGameplayRequest_(request);
    var cacheKey = 'gb:' + digest_(JSON.stringify(safe).slice(0,12000));
    var cache = CacheService.getScriptCache();
    var cached = cache.get(cacheKey);
    if (cached) return json_(JSON.parse(cached));

    var result = askAiBrain_(safe);
    var response = normalizeStrategyResponse_(result, safe);
    cache.put(cacheKey, JSON.stringify(response), LIFEHELPERS.CACHE_SECONDS);
    return json_(response);
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return json_({ok:false,error:'strategy_failure',message:String(error && error.message ? error.message : error)});
  }
}

function parseRequest_(e) {
  var raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
  if (raw.length > LIFEHELPERS.MAX_JSON_CHARS) throw new Error('Request too large.');
  var value = JSON.parse(raw || '{}');
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('JSON object required.');
  return value;
}

function sanitizeGameplayRequest_(r) {
  return {
    action: r.action === 'gameplay' ? 'gameplay' : 'strategy',
    mode: LIFEHELPERS.MODE,
    source: 'LifeHelpers.GameBots',
    sessionId: cleanScalar_(r.sessionId, 80),
    difficulty: oneOf_(r.difficulty, ['easy','normal','hard','adaptive'], 'normal'),
    game: sanitizeGame_(r.game || {}),
    botIds: cleanArray_(r.botIds, 8, 80),
    objective: cleanScalar_(r.objective || (r.game && r.game.objective), 240),
    legalActions: sanitizeActions_(r.legalActions || (r.game && r.game.legalActions)),
    constraints: {
      strategyOnly: true,
      noCreation: true,
      noGeneralChat: true,
      noCodeGeneration: true,
      returnStructuredPlan: true
    }
  };
}

function sanitizeGame_(g) {
  return {
    gameId: cleanScalar_(g.gameId || g.id, 100),
    title: cleanScalar_(g.title, 120),
    round: finite_(g.round),
    score: safeJsonValue_(g.score, 1200),
    visual: safeJsonValue_(g.visual, 2500),
    bridge: safeJsonValue_(g.bridge, 7500),
    state: safeJsonValue_(g.state, 7500)
  };
}

function sanitizeActions_(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0,64).map(function(x){ return safeJsonValue_(x,800); });
}

function cleanArray_(items, max, itemChars) {
  if (!Array.isArray(items)) return [];
  return items.slice(0,max).map(function(x){return cleanScalar_(x,itemChars);}).filter(Boolean);
}

function cleanScalar_(v, max) {
  if (v === null || v === undefined) return '';
  var s = String(v).replace(/[\u0000-\u001f]/g,' ').replace(/\s+/g,' ').trim();
  return s.slice(0,max || 200);
}

function oneOf_(v, allowed, fallback) {
  v = String(v || '').toLowerCase();
  return allowed.indexOf(v) >= 0 ? v : fallback;
}

function finite_(v) { v = Number(v); return isFinite(v) ? v : null; }

function safeJsonValue_(v, maxChars) {
  if (v === undefined) return null;
  try {
    var s = JSON.stringify(v);
    if (!s) return null;
    if (s.length > maxChars) s = s.slice(0,maxChars);
    return JSON.parse(s);
  } catch (_) { return null; }
}

function askAiBrain_(request) {
  try {
    if (typeof AIBrain !== 'undefined' && AIBrain) {
      var libraryResult = callLibrary_(AIBrain, request);
      if (libraryResult !== null && libraryResult !== undefined) return libraryResult;
    }
  } catch (libraryError) {
    console.warn('AI-Brain library call failed; trying optional configured endpoint.');
  }
  return callEndpoint_(request);
}

function callLibrary_(lib, request) {
  var names = ['gameStrategy','getGameStrategy','strategy','routeGameplay','route','run'];
  for (var i=0;i<names.length;i++) {
    var fn = lib[names[i]];
    if (typeof fn === 'function') {
      try { return fn.call(lib, request); } catch (err) { console.warn('AI-Brain library route failed.'); }
    }
  }
  return null;
}

function callEndpoint_(request) {
  var endpoint = PropertiesService.getScriptProperties().getProperty('AI_BRAIN_ENDPOINT');
  if (!endpoint) throw new Error('AI-Brain library is unavailable and no private fallback endpoint is configured.');

  var payload = {
    action: 'strategy',
    capability: 'gameplay_strategy',
    mode: LIFEHELPERS.MODE,
    source: 'LifeHelpers.GameBots',
    request: request
  };
  var res = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
    followRedirects: true
  });
  var code = res.getResponseCode();
  var text = res.getContentText();
  if (code < 200 || code >= 300) throw new Error('AI-Brain HTTP '+code+': '+text.slice(0,300));
  try { return JSON.parse(text); } catch (_) { return {text:text}; }
}

function normalizeStrategyResponse_(raw, request) {
  raw = raw || {};
  var candidate = raw.plan || raw.result || raw.data || raw;
  var plan = {
    intent: cleanScalar_(candidate.intent || candidate.strategy || candidate.text, 320),
    target: safeJsonValue_(candidate.target, 1200),
    priorities: cleanArray_(candidate.priorities, 8, 180),
    actions: sanitizeActions_(candidate.actions || candidate.moves || candidate.recommendedActions),
    risk: finite_(candidate.risk),
    confidence: finite_(candidate.confidence),
    horizonMs: finite_(candidate.horizonMs || candidate.horizon_ms)
  };
  return {ok:true,mode:LIFEHELPERS.MODE,gameId:request.game.gameId,plan:plan};
}

function digest_(s) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return bytes.slice(0,12).map(function(b){var x=(b+256)%256;return ('0'+x.toString(16)).slice(-2);}).join('');
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
