/* OurSpace Game Currency Bridge v3
   Parent/site bridge. Receives local game hooks and external fallback-minute messages.
   Currency law: 10 copper=1 silver, 10 silver=1 gold, 10 gold=1 platinum. Copper/silver/gold display 0-9; platinum uncapped.
*/
(function(){
  'use strict';
  if (window.__OurSpaceGameCurrencyBridgeInstalled) return;
  window.__OurSpaceGameCurrencyBridgeInstalled = true;
  const DEFAULT_ALLOWED = ["candycrush", "amongus", "angrybirds", "plantsvszombies", "fruitninja", "flappybird", "jetpackjoyride", "fnaf", "fnaf4", "fnaf2", "fnaf3", "fnafcustom", "badpiggies", "8ballclassic", "bubbleshooter", "doodlejump", "doodleroad", "paintbynumber", "fancypantsadventure2", "ducklife", "backrooms", "capybaraclicker", "minesweeper", "houseofhazards", "retropingpong", "bloxorz", "noobminer", "clashofvikings", "floodrunner2"];
  const DEFAULT_MILESTONES = {"game_launch": 100, "first_action": 250, "action_streak_small": 250, "action_streak_large": 500, "play_time_5_min": 500, "level_complete": 900, "achievement": 500, "high_score": 900, "score_milestone": 250, "resource_milestone": 250, "game_over_recovery": 100, "fnaf_defensive_set": 250, "fnaf_hour_survived": 900, "fnaf_night_survived": 2500, "fnaf_hard_clear": 5000, "fnaf_listen_success": 300, "paint_image_loaded": 250, "paint_process_started": 500, "paint_palette_created": 900, "paint_art_saved": 500, "survival_checkpoint": 600, "session_level_up": 750, "external_fallback_opened": 100, "external_fallback_minute": 100, "fallback_focus_block": 500, "amongus_task_complete": 300, "amongus_meeting_survived": 500, "amongus_round_survived": 900, "amongus_match_win": 2500};
  const config = Object.assign({
    allowedGameIds: window.OurSpaceAllowedGameIds || DEFAULT_ALLOWED,
    milestoneRewardsCopper: DEFAULT_MILESTONES,
    privateCurrencyOnly: true,
    realCurrencyPayouts: false,
    defaultProfile: 'shared',
    cooldownMs: 1200,
    maxSingleAwardCopper: 5000,
    maxSessionCopper: 75000
  }, window.OurSpaceGameCurrencyBridgeConfig || {});
  const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const awarded = Object.create(null);
  let sessionCopper = 0;
  const safeId = (value, fallback) => String(value || fallback || 'game').toLowerCase().replace(/\.html?$/i,'').replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'') || fallback || 'game';
  const cleanInt = value => { value = Number(value); return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0; };
  function amountToCopper(value){
    if (typeof value === 'number') return cleanInt(value);
    if (!value || typeof value !== 'object') return 0;
    if ('totalCopper' in value) return cleanInt(value.totalCopper);
    if ('rewardCp' in value) return cleanInt(value.rewardCp);
    if ('rewardTotalCopper' in value) return cleanInt(value.rewardTotalCopper);
    if ('amountCopper' in value) return cleanInt(value.amountCopper);
    return cleanInt(value.copper) + cleanInt(value.silver)*10 + cleanInt(value.gold)*100 + cleanInt(value.platinum)*1000;
  }
  function copperToAmount(totalCopper){
    let total=cleanInt(totalCopper); const platinum=Math.floor(total/1000); total%=1000; const gold=Math.floor(total/100); total%=100; const silver=Math.floor(total/10); const copper=total%10; return {platinum,gold,silver,copper,totalCopper:cleanInt(totalCopper)};
  }
  function activeProfile(){
    try { if (window.PortalStorage && PortalStorage.getActiveProfileId) return PortalStorage.getActiveProfileId(); } catch(e) {}
    try { return localStorage.getItem('ourspace.activeProfile') || localStorage.getItem('ourspace.activeProfile.v1') || config.defaultProfile; } catch(e) { return config.defaultProfile; }
  }
  function amountFor(data){
    const direct = amountToCopper(data.totalCopper !== undefined ? data.totalCopper : data.amount) || amountToCopper(data);
    if (direct) return Math.min(direct, config.maxSingleAwardCopper);
    const eventId = safeId(data.eventId || data.reason || data.type, 'game_launch');
    return cleanInt(config.milestoneRewardsCopper[eventId] || config.milestoneRewardsCopper.game_launch || 100);
  }
  function isAllowed(gameId){ return (config.allowedGameIds || DEFAULT_ALLOWED).map(x=>safeId(x)).includes(safeId(gameId)); }
  function award(input){
    const data = Object.assign({}, input || {});
    const gameId = safeId(data.gameId || data.game || data.name, 'unknown-game');
    if (!isAllowed(gameId)) return false;
    const eventId = safeId(data.eventId || data.reason || data.type, 'game_launch');
    let totalCopper = amountFor(Object.assign({}, data, {eventId}));
    if (!totalCopper) return false;
    const remaining = cleanInt(config.maxSessionCopper) - sessionCopper;
    if (remaining <= 0) return false;
    totalCopper = Math.min(totalCopper, remaining);
    const dedupeKey = data.dedupeKey || `${gameId}:${eventId}:${data.level || ''}:${data.score || ''}:${data.minute || ''}`;
    const now = Date.now();
    const cooldown = cleanInt(data.cooldownMs || config.cooldownMs);
    if (awarded[dedupeKey] && now - awarded[dedupeKey] < cooldown) return false;
    awarded[dedupeKey] = now;
    sessionCopper += totalCopper;
    const payload = {
      type:'ourspace.game.reward.v1', source:data.source || 'ourspace-game-currency-bridge', category:'mobile_games',
      profile:data.profile || activeProfile(), gameId, gameName:data.gameName || data.title || gameId, eventId,
      label:data.label || eventId.replace(/[-_]+/g,' '), totalCopper, amount:copperToAmount(totalCopper), sessionId,
      privateCurrencyOnly:true, realCurrencyPayouts:false,
      detail:Object.assign({bridgeVersion:'v3', currencyLaw:'10C=1S,10S=1G,10G=1P', platinumUncapped:true}, data.detail || {})
    };
    if (window.OurSpaceCurrency && typeof window.OurSpaceCurrency.award === 'function') window.OurSpaceCurrency.award(payload);
    else if (window.PortalCurrency && typeof window.PortalCurrency.add === 'function') window.PortalCurrency.add(payload.profile, {totalCopper}, payload.label, payload);
    else window.dispatchEvent(new CustomEvent('ourspace:pending-game-award', {detail: payload}));
    return payload;
  }
  function handleMessage(event){
    const data = event && event.data;
    if (!data || typeof data !== 'object') return;
    const type = String(data.type || '').toLowerCase();
    if (!['ourspace.game.reward.v1','ourspace.external.fallback.minute','game_reward','reward','score','achievement','level_complete','milestone'].includes(type)) return;
    award(data);
  }
  window.OurSpaceGameCurrencyBridge={version:'3.0.0',privateCurrencyOnly:true,realCurrencyPayouts:false,allowedGameIds:config.allowedGameIds.slice(),award,sessionId,copperToAmount};
  window.addEventListener('message', handleMessage, false);
})();
