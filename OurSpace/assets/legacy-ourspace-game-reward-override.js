/* OurSpace Universal Game Reward Override v3
   Injected into every local HTML game. Converts score/points/stars/coins/resources into private OurSpace currency milestones and adds FNAF-style milestones to all games.
   External fallback pages use minute tracking instead of remote-page bridge hooks.
*/
(function(){
  'use strict';
  if (window.__OurSpaceGameRewardOverrideInstalled) return;
  window.__OurSpaceGameRewardOverrideInstalled = true;
  const currentScript = document.currentScript;
  const scriptSrc = currentScript && currentScript.src || '';
  const scriptDir = scriptSrc ? scriptSrc.replace(/[^/]*$/, '') : '';
  const rulesSrc = currentScript && currentScript.getAttribute('data-ourspace-rules-src') || (scriptDir ? scriptDir.replace(/\/js\/$/, '/json/') + 'ourspace_game_reward_rules.json' : '../json/ourspace_game_reward_rules.json');
  const cssSrc = currentScript && currentScript.getAttribute('data-ourspace-css-src') || (scriptDir ? scriptDir.replace(/\/js\/$/, '/css/') + 'ourspace-game-rewards.css' : '../css/ourspace-game-rewards.css');
  const params = new URLSearchParams(location.search || '');
  const DEFAULT_ALLOWED_GAME_IDS = ["candycrush", "amongus", "angrybirds", "plantsvszombies", "fruitninja", "flappybird", "jetpackjoyride", "fnaf", "fnaf4", "fnaf2", "fnaf3", "fnafcustom", "badpiggies", "8ballclassic", "bubbleshooter", "doodlejump", "doodleroad", "paintbynumber", "fancypantsadventure2", "ducklife", "backrooms", "capybaraclicker", "minesweeper", "houseofhazards", "retropingpong", "bloxorz", "noobminer", "clashofvikings", "floodrunner2"];
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
  const embedded = !!(window.parent && window.parent !== window);
  const gameId = normalizeGameId(params.get('game') || params.get('gameId') || params.get('fallbackGame') || document.documentElement.getAttribute('data-game-id') || (location.pathname.split('/').pop() || 'game').replace(/\.html?$/i,''));
  const FALLBACK_RULES = {
    schema:'ourspace.game.reward.rules.fallback.v3',
    currencyScale:{copper:1,silver:10,gold:100,platinum:1000},
    allowedGameIds:DEFAULT_ALLOWED_GAME_IDS,
    defaultSessionCapCopper:25000,
    globalEvents:{"game_launch": {"label": "Game opened", "totalCopper": 100, "cooldownMs": 300000, "maxPerSession": 1, "tier": "tiny_start"}, "first_action": {"label": "First in-game action", "totalCopper": 250, "cooldownMs": 300000, "maxPerSession": 1, "tier": "gentle_step"}, "action_streak_small": {"label": "In-game action streak", "totalCopper": 250, "cooldownMs": 45000, "maxPerSession": 8, "tier": "gentle_step"}, "action_streak_large": {"label": "Strong play streak", "totalCopper": 500, "cooldownMs": 90000, "maxPerSession": 4, "tier": "small_task"}, "play_time_5_min": {"label": "Focused local play block", "totalCopper": 500, "cooldownMs": 300000, "maxPerSession": 12, "tier": "small_task"}, "level_complete": {"label": "Level / stage / round cleared", "totalCopper": 900, "cooldownMs": 20000, "maxPerSession": 12, "tier": "medium_task"}, "achievement": {"label": "Achievement unlocked", "totalCopper": 500, "cooldownMs": 20000, "maxPerSession": 10, "tier": "small_task"}, "high_score": {"label": "High score / best score", "totalCopper": 900, "cooldownMs": 45000, "maxPerSession": 8, "tier": "medium_task"}, "score_milestone": {"label": "Score/points milestone converted to OurSpace currency", "totalCopper": 250, "cooldownMs": 15000, "maxPerSession": 40, "tier": "gentle_step"}, "resource_milestone": {"label": "Coins/stars/gems/resource milestone converted to OurSpace currency", "totalCopper": 250, "cooldownMs": 15000, "maxPerSession": 40, "tier": "gentle_step"}, "game_over_recovery": {"label": "Played and reset safely", "totalCopper": 100, "cooldownMs": 120000, "maxPerSession": 8, "tier": "tiny_start"}, "fnaf_defensive_set": {"label": "FNAF defensive survival actions", "totalCopper": 250, "cooldownMs": 12000, "maxPerSession": 20, "tier": "gentle_step"}, "fnaf_hour_survived": {"label": "FNAF hour survived", "totalCopper": 900, "cooldownMs": 30000, "maxPerSession": 8, "tier": "medium_task"}, "fnaf_night_survived": {"label": "FNAF night survived", "totalCopper": 2500, "cooldownMs": 60000, "maxPerSession": 8, "tier": "very_hard_task"}, "fnaf_hard_clear": {"label": "FNAF hard clear", "totalCopper": 5000, "cooldownMs": 180000, "maxPerSession": 3, "tier": "hero"}, "fnaf_listen_success": {"label": "FNAF 4 good listen/check choice", "totalCopper": 300, "cooldownMs": 12000, "maxPerSession": 20, "tier": "gentle_step"}, "paint_image_loaded": {"label": "Loaded image for paint-by-number", "totalCopper": 250, "cooldownMs": 45000, "maxPerSession": 4, "tier": "gentle_step"}, "paint_process_started": {"label": "Started paint-by-number processing", "totalCopper": 500, "cooldownMs": 60000, "maxPerSession": 8, "tier": "small_task"}, "paint_palette_created": {"label": "Generated palette / numbered facets", "totalCopper": 900, "cooldownMs": 120000, "maxPerSession": 6, "tier": "medium_task"}, "paint_art_saved": {"label": "Saved paint-by-number art", "totalCopper": 500, "cooldownMs": 60000, "maxPerSession": 8, "tier": "small_task"}, "survival_checkpoint": {"label": "FNAF-style survival/checkpoint milestone", "totalCopper": 600, "cooldownMs": 30000, "maxPerSession": 16, "tier": "medium_task"}, "session_level_up": {"label": "Session level-up milestone", "totalCopper": 750, "cooldownMs": 45000, "maxPerSession": 12, "tier": "medium_task"}, "external_fallback_opened": {"label": "Fallback game opened in OurSpace viewer", "totalCopper": 100, "cooldownMs": 300000, "maxPerSession": 1, "tier": "tiny_start"}, "external_fallback_minute": {"label": "Fallback viewer active minute", "totalCopper": 100, "cooldownMs": 55000, "maxPerSession": 180, "tier": "minute_tracking"}, "fallback_focus_block": {"label": "Fallback active 5-minute block", "totalCopper": 500, "cooldownMs": 300000, "maxPerSession": 24, "tier": "small_task"}, "amongus_task_complete": {"label": "Among Us task completed", "totalCopper": 300, "cooldownMs": 12000, "maxPerSession": 20, "tier": "gentle_step"}, "amongus_meeting_survived": {"label": "Among Us meeting/vote survived", "totalCopper": 500, "cooldownMs": 30000, "maxPerSession": 8, "tier": "small_task"}, "amongus_round_survived": {"label": "Among Us round survival milestone", "totalCopper": 900, "cooldownMs": 45000, "maxPerSession": 8, "tier": "medium_task"}, "amongus_match_win": {"label": "Among Us match win / team victory", "totalCopper": 2500, "cooldownMs": 60000, "maxPerSession": 6, "tier": "very_hard_task"}},
    gameRules:{}
  };
  let RULES = FALLBACK_RULES;
  let gameRules = { name: document.title || gameId, enabledEvents: Object.keys(FALLBACK_RULES.globalEvents) };
  let totalAwardedThisSession = 0;
  let actionCount = 0;
  let defensiveActionCount = 0;
  let focusSeconds = 0;
  let fallbackMinutes = 0;
  const eventCounts = Object.create(null);
  const lastAwardAt = Object.create(null);
  const statValues = Object.create(null);
  const seenText = new Map();
  const replacementStats = Object.create(null);

  function normalizeGameId(value){ return String(value || 'game').toLowerCase().replace(/\.html?$/i,'').replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'') || 'game'; }
  function cleanInt(value){ value=Number(value); return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0; }
  function copperToAmount(totalCopper){ let total=cleanInt(totalCopper); const platinum=Math.floor(total/1000); total%=1000; const gold=Math.floor(total/100); total%=100; const silver=Math.floor(total/10); const copper=total%10; return {platinum,gold,silver,copper,totalCopper:cleanInt(totalCopper)}; }
  function formatCurrency(totalCopper){ const a=copperToAmount(totalCopper); const parts=[]; if(a.platinum)parts.push(`${a.platinum} platinum`); if(a.gold)parts.push(`${a.gold} gold`); if(a.silver)parts.push(`${a.silver} silver`); if(a.copper)parts.push(`${a.copper} copper`); return parts.join(', ') || '0 copper'; }
  function escapeHtml(text){ return String(text).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
  function allowedIds(){ return (Array.isArray(RULES.allowedGameIds)&&RULES.allowedGameIds.length ? RULES.allowedGameIds : DEFAULT_ALLOWED_GAME_IDS).map(normalizeGameId); }
  function isAllowedGameId(value){ return allowedIds().includes(normalizeGameId(value)); }
  function isFnaf(){ return /^fnaf/.test(gameId) || /five-nights|freddy/i.test(document.title || ''); }
  function isAmongUs(){ return gameId === 'amongus' || /among\s*us/i.test(document.title || ''); }
  function isExternalFallback(){ return gameId === 'external-fallback' || params.get('fallbackGame') || params.get('ourspaceFallback') === '1' || gameRules.externalOnly; }
  function eventRule(eventId){ const global=(RULES.globalEvents&&RULES.globalEvents[eventId])||{}; const specific=gameRules.eventOverrides&&gameRules.eventOverrides[eventId]||{}; return Object.assign({}, global, specific); }
  function eventEnabled(eventId){
    if (!gameRules.enabledEvents || !gameRules.enabledEvents.length) return true;
    return gameRules.enabledEvents.indexOf(eventId)!==-1 || (/^fnaf_/.test(eventId)&&isFnaf()) || (/^amongus_/.test(eventId)&&isAmongUs());
  }
  function canAward(eventId, rule){
    const activeId = normalizeGameId(params.get('fallbackGame') || gameId);
    if (!isAllowedGameId(activeId)) return false;
    if (!eventEnabled(eventId)) return false;
    rule = rule || eventRule(eventId);
    const amount = cleanInt(rule.totalCopper || rule.rewardCp);
    if (!amount) return false;
    const cap = cleanInt(gameRules.sessionCapCopper || RULES.defaultSessionCapCopper || 25000);
    if (cap && totalAwardedThisSession + amount > cap) return false;
    eventCounts[eventId] = eventCounts[eventId] || 0;
    if (rule.maxPerSession && eventCounts[eventId] >= rule.maxPerSession) return false;
    const now = Date.now(); const last = lastAwardAt[eventId] || 0;
    if (rule.cooldownMs && last && now - last < rule.cooldownMs) return false;
    return true;
  }
  function directLocalAward(payload){
    try { if (window.OurSpaceCurrency && typeof window.OurSpaceCurrency.award === 'function') { window.OurSpaceCurrency.award(payload); return; } } catch(err){}
    try {
      const key='ourspace.directGameLedger.v3'; const ledger=JSON.parse(localStorage.getItem(key)||'null')||{totalCopper:0,history:[]};
      ledger.totalCopper=cleanInt(ledger.totalCopper)+cleanInt(payload.totalCopper); ledger.currency=copperToAmount(ledger.totalCopper); ledger.updatedAt=new Date().toISOString();
      ledger.history.unshift(Object.assign({at:ledger.updatedAt,display:formatCurrency(payload.totalCopper)},payload)); ledger.history=ledger.history.slice(0,500);
      localStorage.setItem(key,JSON.stringify(ledger));
    } catch(err){}
  }
  function award(eventId, detail){
    const rule=eventRule(eventId); if(!canAward(eventId,rule)) return false;
    const amount=cleanInt(rule.totalCopper || rule.rewardCp); eventCounts[eventId]=(eventCounts[eventId]||0)+1; lastAwardAt[eventId]=Date.now(); totalAwardedThisSession+=amount;
    const activeId=normalizeGameId(params.get('fallbackGame') || gameId);
    const payload={
      type:'ourspace.game.reward.v1', source:isExternalFallback()?'ourspace-external-fallback-minute-tracker':'ourspace-game-reward-override', category:'mobile_games',
      sessionId, gameId:activeId, gameName:gameRules.name || document.title || activeId, eventId, label:rule.label || eventId, totalCopper:amount, amount:copperToAmount(amount), cooldownMs:rule.cooldownMs||0,
      dedupeKey:`${activeId}:${sessionId}:${eventId}:${eventCounts[eventId]}`, privateCurrencyOnly:true, realCurrencyPayouts:false,
      detail:Object.assign({url:location.pathname, universalHooks:true, currencyReplacement:!!gameRules.currencyReplacement, milestoneMode:gameRules.milestoneMode || 'universal-milestone', currencyLaw:'10 copper=1 silver, 10 silver=1 gold, 10 gold=1 platinum'}, detail || {})
    };
    if(embedded) { try { window.parent.postMessage(payload,'*'); } catch(err) { directLocalAward(payload); } } else directLocalAward(payload);
    showAward(payload.label, amount); renderOverlay(); return true;
  }
  function ensureCss(){ if(document.querySelector('link[data-ourspace-reward-css]')) return; const link=document.createElement('link'); link.rel='stylesheet'; link.href=cssSrc; link.setAttribute('data-ourspace-reward-css','true'); document.head.appendChild(link); }
  function ensureOverlay(){
    if(document.getElementById('ourspaceGameRewardOverlay')) return; ensureCss();
    const box=document.createElement('div'); box.id='ourspaceGameRewardOverlay';
    box.innerHTML='<div class="osgr-top"><strong>OurSpace</strong><span id="osgrSessionTotal">0 copper</span></div><div class="osgr-sub" id="osgrStatus">Rewards active</div><div class="osgr-sub" id="osgrConvert">Points/coins/stars convert to OurSpace currency.</div>';
    document.body.appendChild(box); renderOverlay();
  }
  function renderOverlay(){
    const total=document.getElementById('osgrSessionTotal'); if(total) total.textContent=formatCurrency(totalAwardedThisSession);
    const status=document.getElementById('osgrStatus'); if(status) status.textContent=`${gameRules.name || gameId}: ${actionCount} actions${isExternalFallback()?`, ${fallbackMinutes} fallback minutes`:''}`;
    const conv=document.getElementById('osgrConvert'); if(conv) { const entries=Object.entries(replacementStats).slice(-3).map(([k,v])=>`${k} ${v.value} → ${formatCurrency(v.estimatedCopper)}`); conv.textContent=entries.length?entries.join(' · '):'Points/coins/stars convert to OurSpace currency.'; }
  }
  function showAward(label,totalCopper){
    ensureOverlay(); const toast=document.createElement('div'); toast.className='ourspace-reward-toast';
    toast.innerHTML=`<strong>+${escapeHtml(formatCurrency(totalCopper))}</strong><span>${escapeHtml(label)}</span>`; document.body.appendChild(toast);
    requestAnimationFrame(()=>toast.classList.add('show')); setTimeout(()=>{toast.classList.remove('show'); setTimeout(()=>toast.remove(),400);},1800);
  }
  function textRecentlySeen(text){ const cleaned=String(text||'').replace(/\s+/g,' ').trim().slice(0,240); if(!cleaned||cleaned.length<2)return true; const now=Date.now(); const previous=seenText.get(cleaned); if(previous&&now-previous<2500)return true; seenText.set(cleaned,now); if(seenText.size>500){ for(const k of seenText.keys()){seenText.delete(k); if(seenText.size<320)break;} } return false; }
  function scanText(text, source){
    if(textRecentlySeen(text)) return; const raw=String(text||'').replace(/\s+/g,' ').trim(); const lower=raw.toLowerCase();
    if(/(new high score|best score|personal best|record|achievement|unlocked)/.test(lower)) award('high_score',{source,text:raw.slice(0,160)})||award('achievement',{source,text:raw.slice(0,160)});
    if(/(you win|victory|level complete|stage clear|mission complete|round complete|wave clear|complete!|cleared)/.test(lower)) award('level_complete',{source,text:raw.slice(0,160)});
    if(/(game over|try again|failed|you died|defeat)/.test(lower)) award('game_over_recovery',{source,text:raw.slice(0,160)});
    if(/(checkpoint|survived|survival|safe room|escaped|night|hour)/.test(lower)) award('survival_checkpoint',{source,text:raw.slice(0,160)});
    if(isAmongUs()){
      if(/(task complete|tasks complete|completed task)/.test(lower)) award('amongus_task_complete',{source,text:raw.slice(0,160)});
      if(/(emergency meeting|body reported|reported|ejected|voted|meeting)/.test(lower)) award('amongus_meeting_survived',{source,text:raw.slice(0,160)});
      if(/(crewmates win|impostors win|imposters win|victory|you win)/.test(lower)) award('amongus_match_win',{source,text:raw.slice(0,160)});
      if(/(round complete|survived|defeat|game over)/.test(lower)) award('amongus_round_survived',{source,text:raw.slice(0,160)});
    }
    if(isFnaf()){
      if(/(6\s*a\.?m\.?|6am|night\s*(survived|complete|cleared)|survived)/.test(lower)) award('fnaf_night_survived',{source,text:raw.slice(0,160),hardGame:true});
      if(/(night\s*[56]|20\/20\/20\/20|nightmare|custom night|hard mode)/.test(lower)&&/(complete|clear|survived|win|won|6\s*a\.?m\.?)/.test(lower)) award('fnaf_hard_clear',{source,text:raw.slice(0,160),hardGame:true});
      const hourMatch=lower.match(/([1-5])\s*a\.?m\.?/); if(hourMatch) award('fnaf_hour_survived',{source,hour:Number(hourMatch[1]),text:raw.slice(0,160),hardGame:true});
    }
    let m; const statRegex=/(score|points?|coins?|gold|cash|money|stars?|gems?|candy|fruit|fish|xp|level|stage|round|wave|night|day|tasks?|reward)\s*[:=\- ]\s*(-?\d{1,9})/gi;
    while((m=statRegex.exec(raw))) handleStat(m[1].toLowerCase(),Number(m[2]),`${source}:${raw.slice(0,160)}`);
    const reverseRegex=/(-?\d{1,9})\s*(score|points?|coins?|gold|cash|money|stars?|gems?|candy|fruit|fish|xp|tasks?)/gi;
    while((m=reverseRegex.exec(raw))) handleStat(m[2].toLowerCase(),Number(m[1]),`${source}:${raw.slice(0,160)}`);
  }
  function nextMilestone(previous,current){ const thresholds=[1,5,10,25,50,100,250,500,1000,2500,5000,10000,25000,50000,100000,250000,500000,1000000]; for(const t of thresholds) if(previous<t&&current>=t) return t; return Infinity; }
  function handleStat(kind,value,source){
    if(!Number.isFinite(value)||value<0)return; const key=kind.replace(/\s+/g,'_'); const previous=statValues[key];
    if(previous===undefined){ statValues[key]=value; updateReplacementStat(key,value,0); return; }
    if(value<=previous){ statValues[key]=Math.max(previous,value); updateReplacementStat(key,value,0); return; }
    statValues[key]=value; const delta=value-previous; const converted=Math.max(1, Math.min(500, Math.floor(delta)));
    updateReplacementStat(key,value,converted);
    if(/level|stage|round|wave|night|day/.test(key)){ award(isFnaf()&&/night/.test(key)?'fnaf_hour_survived':'level_complete',{kind,value,previous,delta,source,convertedFromInGameStat:true}); if(delta>=2) award('session_level_up',{kind,value,previous,delta,source}); return; }
    if(/task/.test(key)&&isAmongUs()){ award('amongus_task_complete',{kind,value,previous,delta,source,convertedFromInGameStat:true}); return; }
    if(/coin|gold|cash|money|gem|star|fish|xp/.test(key)){ if(delta>=1||value>=nextMilestone(previous,value)) award('resource_milestone',{kind,value,previous,delta,source,estimatedCopper:converted,convertedFromInGameCurrency:true}); return; }
    if(/score|point|fruit|candy/.test(key)){ if(delta>=1||value>=nextMilestone(previous,value)) award('score_milestone',{kind,value,previous,delta,source,estimatedCopper:converted,convertedFromInGamePoints:true}); }
  }
  function updateReplacementStat(key,value,estimatedCopper){ replacementStats[key]={value,estimatedCopper:cleanInt(estimatedCopper),at:Date.now()}; renderOverlay(); }
  function getTargetText(target){ if(!target)return''; const parts=[]; try{if(target.id)parts.push(target.id);}catch(e){} try{if(typeof target.className==='string')parts.push(target.className);}catch(e){} try{ if(target.getAttribute) ['aria-label','title','alt','data-action','data-control','data-name','role'].forEach(attr=>{const v=target.getAttribute(attr); if(v)parts.push(v);}); }catch(e){} try{ if(target.innerText&&target.innerText.length<160)parts.push(target.innerText); }catch(e){} return parts.join(' '); }
  function registerAction(event){
    actionCount+=1; if(actionCount===1) award('first_action',{event:event.type}); if(actionCount%20===0) award('action_streak_small',{event:event.type,actionCount}); if(actionCount%80===0) award('action_streak_large',{event:event.type,actionCount}); if(actionCount%120===0) award('survival_checkpoint',{event:event.type,actionCount});
    const txt=getTargetText(event.target); if(txt) scanText(`${txt} ${event.key||''} ${event.code||''}`,event.type);
    const lower=`${txt} ${event.key||''} ${event.code||''}`.toLowerCase();
    if(isFnaf() && /door|light|camera|monitor|mask|flash|flashlight|listen|closet|bed|vent|shock/.test(lower)) { defensiveActionCount+=1; if(defensiveActionCount%8===0) award('fnaf_defensive_set',{event:event.type,defensiveActionCount,hardGame:true}); }
    if(isAmongUs() && /task|use|report|meeting|vote|kill|sabotage|vent|map|admin|security/.test(lower)) { defensiveActionCount+=1; if(defensiveActionCount%10===0) award('survival_checkpoint',{event:event.type,actionCount,amongUsStyle:true}); }
    renderOverlay();
  }
  function installCanvasScanner(){ try{ const proto=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype; if(!proto||proto.__OurSpaceTextScanner)return; proto.__OurSpaceTextScanner=true; const of=proto.fillText, os=proto.strokeText; if(typeof of==='function') proto.fillText=function(text){try{scanText(String(text),'canvas-fillText');}catch(e){} return of.apply(this,arguments);}; if(typeof os==='function') proto.strokeText=function(text){try{scanText(String(text),'canvas-strokeText');}catch(e){} return os.apply(this,arguments);}; }catch(e){} }
  function installDomScanner(){ try{ const observer=new MutationObserver(muts=>{ for(const mut of muts){ if(mut.type==='characterData') scanText(mut.target&&mut.target.textContent,'dom-text'); for(const node of mut.addedNodes||[]){ if(node.nodeType===Node.TEXT_NODE) scanText(node.textContent,'dom-text'); else if(node.nodeType===Node.ELEMENT_NODE&&!/^(SCRIPT|STYLE|CANVAS|NOSCRIPT|IFRAME)$/i.test(node.tagName||'')) scanText((node.innerText||node.textContent||'').slice(0,320),'dom-element'); } } }); observer.observe(document.documentElement||document.body,{childList:true,subtree:true,characterData:true}); setTimeout(()=>scanText(document.body&&document.body.innerText||'','initial-dom'),1500); }catch(e){} }
  function installStorageScanner(){ try{ if(!window.Storage||!Storage.prototype||Storage.prototype.__OurSpaceStorageScanner)return; const original=Storage.prototype.setItem; if(typeof original!=='function')return; Storage.prototype.__OurSpaceStorageScanner=true; Storage.prototype.setItem=function(key,value){ try{ const lowerKey=String(key||'').toLowerCase(); const text=`${key}:${value}`; if(/score|point|coin|gold|cash|money|star|gem|xp|level|stage|round|wave|night|best|high|record|fish|task/.test(lowerKey)){ const numbers=String(value).match(/-?\d{1,9}/g)||[]; if(numbers.length) handleStat(lowerKey,Math.max.apply(null,numbers.map(Number)),`localStorage:${key}`); else scanText(text,'localStorage'); } }catch(e){} return original.apply(this,arguments); }; }catch(e){} }
  function installFocusTimer(){ setInterval(()=>{ if(document.hidden)return; focusSeconds+=30; if(!isExternalFallback()&&focusSeconds>0&&focusSeconds%300===0) award('play_time_5_min',{focusSeconds}); },30000); }
  function installExternalMinuteTimer(){ if(!isExternalFallback()) return; award('external_fallback_opened',{fallback:true,externalUrl:params.get('url')||''}); setInterval(()=>{ if(document.hidden)return; fallbackMinutes+=1; award('external_fallback_minute',{fallback:true,minute:fallbackMinutes,externalUrl:params.get('url')||''}); if(fallbackMinutes%5===0) award('fallback_focus_block',{fallback:true,minute:fallbackMinutes}); },60000); }
  function installApi(){ window.OurSpaceGameRewards=Object.assign(window.OurSpaceGameRewards||{},{version:'3.0.0',gameId,sessionId,award,reportScore(value,kind){handleStat(kind||'score',Number(value),'api-reportScore');},reportCurrency(value,kind){handleStat(kind||'coins',Number(value),'api-reportCurrency');},scanText(text){scanText(text,'api-scanText');},formatCurrency,getSessionTotalCopper(){return totalAwardedThisSession;}}); }
  async function loadRules(){ try{ const res=await fetch(rulesSrc,{cache:'no-store'}); if(res.ok) RULES=Object.assign({},FALLBACK_RULES,await res.json()); }catch(e){ RULES=FALLBACK_RULES; } const activeId=normalizeGameId(params.get('fallbackGame')||gameId); gameRules=(RULES.gameRules&&RULES.gameRules[activeId])||{name:document.title||activeId,enabledEvents:Object.keys(RULES.globalEvents||{}),currencyReplacement:true,milestoneMode:'universal-milestone'}; }
  async function init(){ await loadRules(); const activeId=normalizeGameId(params.get('fallbackGame')||gameId); if(!isAllowedGameId(activeId)) return; ensureOverlay(); installApi(); installCanvasScanner(); installDomScanner(); installStorageScanner(); installFocusTimer(); installExternalMinuteTimer(); ['pointerdown','touchstart','click','keydown'].forEach(type=>window.addEventListener(type,registerAction,{capture:true,passive:true})); if(!isExternalFallback()) award('game_launch',{launch:true}); renderOverlay(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
