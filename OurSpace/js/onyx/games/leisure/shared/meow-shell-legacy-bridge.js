/* Retro Arcade Page 11 <-> previous Feed Him MEOW shared shell integration.
   The template's window.gameShell remains authoritative; this shim does not simulate board effects. */
(()=>{'use strict';
const native=window.gameShell;
if(!native)return;
const copy=v=>v==null?v:JSON.parse(JSON.stringify(v));
const phases={LEVEL_SELECT:'level-select',RECIPE_GENERATOR:'recipe',RECIPE:'recipe',RECIPE_BRIEF:'recipe',MARKET_MADNESS:'market-madness',INGREDIENT_GARDEN:'ingredient-garden',BON_APPETIT:'bon-appetit',ONYX_VERDICT:'onyx-verdict',REWARD:'reward'};
const canonical=()=>{
 const phase=Object.keys(phases).find(k=>phases[k]===native.phase)||'LEVEL_SELECT';
 if(native.phase==='bon-appetit'){
  const sub=String(native.stage||'').toUpperCase().replaceAll('-','_');
  return sub.startsWith('BON_APPETIT_')?sub:'BON_APPETIT_'+(sub||'SORT');
 }
 return phase;
};
const emit=(type,details={})=>{
 const body={...details,type,phase:canonical(),paused:native.paused,inputSource:details.inputSource||'shared-shell'};
 window.dispatchEvent(new CustomEvent('meow:input',{detail:body}));
 window.dispatchEvent(new CustomEvent('feed-him-meow-input',{detail:body}));
 document.getElementById('gameShell')?.dispatchEvent(new CustomEvent('meow-shell-input',{detail:body}));
 native.emit(type,details);return body;
};
let savedBoosters=[],lastStars=null;
const api={version:'3.0.0-page11',ready:true,getPhase:canonical,isPaused:()=>native.paused,
 getRecipe:()=>copy(native.recipe),getBoosters:()=>copy(native.boosters??savedBoosters),
 getSettings:()=>copy(native.accessibility),getInputState:()=>({phase:canonical(),nativePhase:native.phase,stage:native.stage,paused:native.paused,controlsVisible:native.controlsVisible,volume:native.volume,resources:copy(native.resources)}),
 setPhase(value){const v=String(value||'').toUpperCase();if(v.startsWith('BON_APPETIT_')){native.setPhase('bon-appetit');native.setStage(v.toLowerCase().replaceAll('_','-'));return true}return native.setPhase(phases[v]||String(value||'').toLowerCase().replaceAll('_','-'));},
 setRecipe:r=>native.setRecipe(r),setStatus:s=>native.setRunStatus(s),setHUD:s=>{
  if(s?.wallet||s?.currency)api.setCurrency(s.wallet||s.currency);
  if(s?.mode)native.setRunStatus({householdMode:String(s.mode).toLowerCase().includes('duo')?'duo':'solo'});
  if(s?.stars!==undefined){const n=Number(s.stars);if(Number.isInteger(n)&&n>=0&&n<=5){lastStars=n;window.dispatchEvent(new CustomEvent('meow:shell',{detail:{type:'hud:updated',stars:n,phase:canonical()}}))}}
  if(s?.score!==undefined)native.setRunStatus({score:s.score});return s;
 },
 setBoosters(list){savedBoosters=Array.isArray(list)?copy(list):[];native.setBoosters(savedBoosters);return savedBoosters.length},
 setCurrency(amount={}){const values={brown:amount.brown??amount.copper,white:amount.white??amount.silver,coin:amount.coin??amount.gold,blue:amount.blue??amount.platinum};return native.setResources(values)},
 getCurrency(){const r=native.resources;return {copper:r.brown,silver:r.white,gold:r.coin,platinum:r.blue}},
 getStars:()=>lastStars,setPaused:value=>native.setPaused(value),setControlsVisible:value=>native.setControlsVisible(value),
 setSoundLevel:value=>native.setVolume(value),toggleSound:()=>native.setVolume(native.volume>0?0:1),
 openPanel:name=>{if(name==='boosters')return window.MEOWOnyxBoosters?.showBubble()||false;return native.openPanel(({status:'onyx',recipe:'route',assist:'patience'}[name]||name))},
 closePanel:name=>{if(name==='boosters'){window.MEOWOnyxBoosters?.closeMenu();return true}const key=({status:'onyx',recipe:'route',assist:'patience'}[name]||name);if(key)return native.closePanel(key);const open=document.querySelector('.hud-panel.is-open');return open?native.closePanel(open.dataset.panel):false},
 emitInput:emit,onInput:listener=>native.onInput(listener),
 mountGame:el=>native.mount(el),unmountGame:()=>native.clear(),
 requestBooster:id=>emit('booster:request',{boosterId:String(id),inputSource:'module'}),
 toggleFullscreen:()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.(),
 setMode:mode=>native.setRunStatus({householdMode:String(mode).toLowerCase().includes('duo')?'duo':'solo'}),
};
window.MEOWShell=Object.freeze(api);window.FeedHimMEOWShell=window.MEOWShell;
window.addEventListener('game-shell-input',e=>{
 const d=e.detail||{};let detail=null;
 if(d.type==='phase')detail={type:'phase:changed',current:canonical(),phase:canonical()};
 if(d.type==='stage')detail={type:'phase:changed',current:canonical(),phase:canonical(),stage:native.stage};
 if(d.type==='verdict'){lastStars=d.stars;window.dispatchEvent(new CustomEvent('meow:shell',{detail:{type:'hud:updated',stars:d.stars,phase:canonical()}}));}
 if(d.type==='onyx-mood'){window.MEOWOnyxBoosters?.syncMood?.(d.mood);}
 if(d.type==='boosters'){savedBoosters=copy(native.boosters??[]);detail={type:'boosters:updated',count:d.count,phase:canonical()};}
 if(detail)window.dispatchEvent(new CustomEvent('meow:shell',{detail}));
});
window.addEventListener('meow:onyx-ready',()=>{const b=document.getElementById('onyxBoostersUtility');b?.setAttribute('aria-pressed','false')});
})();