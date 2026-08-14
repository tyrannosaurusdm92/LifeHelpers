(function(global){
  'use strict';
  var dossier = global.ONYX_DOSSIER_RUNTIME || {};
  var traitSpec = dossier.traits || {};
  var careerSpec = dossier.career_tracks || {};
  var designSpec = dossier.apartment_expansions || {};
  var STORAGE_KEY = 'onyx.catOnly.progression.v1';
  var SENSITIVE = /(diagnos|medicat|prescri|journal|crisis|self.?harm|suicid|trauma|sexual|blood|glucose|insulin|address|password|credential|financial)/i;

  function clone(value){ return JSON.parse(JSON.stringify(value)); }
  function now(){ return new Date().toISOString(); }
  function safeId(value){ return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'_').slice(0,80); }
  function defaultState(){
    var core = (traitSpec.core_traits || []).map(function(t){return t.id;});
    return {
      schema:'Onyx.catOnly.progression.v1',
      needsFree:true,
      coreTraits:core,
      learnedTraitEvidence:{},
      careers:{},
      currencyCopper:0,
      designTier:0,
      designAbilities:((designSpec.design_ability_tiers || [])[0] || {}).abilities || [],
      unlockedSpaces:['starter_room'],
      lastUpdatedAt:now()
    };
  }
  function load(){
    try {
      var raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      var state = JSON.parse(raw);
      var base = defaultState();
      Object.keys(state || {}).forEach(function(k){ base[k]=state[k]; });
      base.needsFree = true;
      base.coreTraits = defaultState().coreTraits;
      if (!base.unlockedSpaces.includes('starter_room')) base.unlockedSpaces.unshift('starter_room');
      return base;
    } catch(_err){ return defaultState(); }
  }
  var state = load();
  function save(){
    state.needsFree = true;
    state.coreTraits = defaultState().coreTraits;
    state.lastUpdatedAt = now();
    try { if (global.localStorage) global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(_err){}
    return snapshot();
  }
  function snapshot(){ return clone(state); }
  function stageFor(points){
    var s=traitSpec.stages || {emerging:5,established:15,signature:35};
    if (points >= Number(s.signature||35)) return 'signature';
    if (points >= Number(s.established||15)) return 'established';
    if (points >= Number(s.emerging||5)) return 'emerging';
    return 'observed';
  }
  function recordEvidence(evidenceId, amount){
    evidenceId=safeId(evidenceId); amount=Math.max(1,Math.min(10,Number(amount||1)));
    if (!evidenceId || SENSITIVE.test(evidenceId)) return {ok:false,reason:'sensitive_or_invalid_evidence_rejected',state:snapshot()};
    var matched=[];
    (traitSpec.learned_traits || []).forEach(function(trait){
      if ((trait.evidence || []).map(safeId).indexOf(evidenceId) < 0) return;
      var id=safeId(trait.id), current=state.learnedTraitEvidence[id] || {points:0,evidence:{},family:trait.family||'',stage:'observed'};
      current.points += amount;
      current.evidence[evidenceId]=(current.evidence[evidenceId]||0)+amount;
      current.stage=stageFor(current.points);
      state.learnedTraitEvidence[id]=current;
      matched.push({id:id,points:current.points,stage:current.stage});
    });
    save();
    return {ok:true,matched:matched,state:snapshot()};
  }
  function track(id){ return (careerSpec.tracks || []).find(function(t){return t.id===id;}) || null; }
  function shift(id){ return (careerSpec.shift_types || []).find(function(t){return t.id===id;}) || null; }
  function ensureCareer(trackId){
    if (!state.careers[trackId]) state.careers[trackId]={rankIndex:0,xp:0,completedShifts:0,promotions:0};
    return state.careers[trackId];
  }
  function completeShift(trackId,shiftTypeId,approvedEvidence){
    var t=track(trackId), sh=shift(shiftTypeId);
    if(!t||!sh) return {ok:false,reason:'unknown_track_or_shift',state:snapshot()};
    var c=ensureCareer(trackId), rank=Math.max(0,Math.min((t.ranks||[]).length-1,c.rankIndex||0));
    var base=Number((t.base_pay_copper||[])[rank]||0), pay=Math.max(0,Math.round(base*Number(sh.pay_multiplier||1)));
    c.xp += Math.max(1,Math.round(Number(sh.minutes||15)/15)); c.completedShifts += 1; state.currencyCopper += pay;
    (approvedEvidence || []).forEach(function(e){ recordEvidence(e,1); });
    save();
    return {ok:true,payCopper:pay,career:clone(c),rank:(t.ranks||[])[rank]||'',state:snapshot(),principle:'optional work; no streak, demotion, firing, injury, or lost wages for inactivity'};
  }
  function promoteTrack(trackId){
    var t=track(trackId); if(!t) return {ok:false,reason:'unknown_track',state:snapshot()};
    var c=ensureCareer(trackId), max=Math.max(0,(t.ranks||[]).length-1);
    if(c.rankIndex>=max) return {ok:true,alreadyAtTop:true,career:clone(c),state:snapshot()};
    c.rankIndex += 1; c.promotions += 1; save();
    return {ok:true,career:clone(c),rank:t.ranks[c.rankIndex],state:snapshot(),userControlled:true};
  }
  function grantDesignTier(tier){
    tier=Math.max(0,Math.min(6,Math.floor(Number(tier||0))));
    state.designTier=Math.max(state.designTier||0,tier);
    var abilities=[];
    (designSpec.design_ability_tiers||[]).forEach(function(item){ if(Number(item.tier)<=state.designTier) abilities=abilities.concat(item.abilities||[]); });
    state.designAbilities=Array.from(new Set(abilities)); save();
    return {ok:true,tier:state.designTier,abilities:clone(state.designAbilities),state:snapshot()};
  }
  function unlockSpace(spaceId){
    spaceId=safeId(spaceId);
    var exists=(designSpec.spaces||[]).some(function(s){return s.id===spaceId;});
    if(!exists) return {ok:false,reason:'unknown_space',state:snapshot()};
    if(state.unlockedSpaces.indexOf(spaceId)<0) state.unlockedSpaces.push(spaceId);
    save(); return {ok:true,spaceId:spaceId,permanent:true,state:snapshot()};
  }
  function currencyBreakdown(){
    var n=Math.max(0,Math.floor(state.currencyCopper||0));
    var platinum=Math.floor(n/1000); n%=1000; var gold=Math.floor(n/100); n%=100; var silver=Math.floor(n/10); var copper=n%10;
    return {platinum:platinum,gold:gold,silver:silver,copper:copper,totalCopper:state.currencyCopper||0};
  }
  function resetLocalPreview(){ state=defaultState(); save(); return snapshot(); }

  global.ONYX_PROGRESSION_RUNTIME={
    schema:'Onyx.catOnly.progression.v1', needsFree:true, snapshot:snapshot, recordEvidence:recordEvidence,
    completeShift:completeShift, promoteTrack:promoteTrack, grantDesignTier:grantDesignTier, unlockSpace:unlockSpace,
    currencyBreakdown:currencyBreakdown, resetLocalPreview:resetLocalPreview,
    rules:{noDecay:true,noPunishment:true,noSensitiveInference:true,noDemotion:true,permanentUnlocks:true,foundationToolsNeverGated:true}
  };
})(window);
