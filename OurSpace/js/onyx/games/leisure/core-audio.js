(()=>{
'use strict';
const ROOT='https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/audio/games/leisure';
const sounds={
  level:'level_select/garden_board_popup.mp3',
  trace:'Market Madness/trace_select.mp3',
  match:'Ingredient_Garden/match.mp3',
  cascade:'Ingredient_Garden/cascade.mp3',
  collect:'Ingredient_Garden/collect.mp3',
  gardenSelect:'shared/actions/garden_select_piece.mp3',
  gardenPlop:'shared/actions/garden_piece_plop.mp3',
  gardenCombo:'shared/actions/garden_combo_clear.mp3',
  gardenCollect:'shared/actions/garden_collect_points.mp3',
  gardenMusic:'shared/music/garden_music_loop_03.mp3',
  gardenSuccess:'shared/success/garden_success_level_win.mp3',
  gardenFailure:'shared/failure/garden_failure_lose.mp3',
  warning:'shared/warning.mp3',
  powerup:'shared/powerup.mp3',
  plop:'shared/piece_plop.mp3',
  success:'shared/success.mp3',
  machine:'Bon-Appetit/machine_hit.mp3',
  machineBonus:'Bon-Appetit/machine_bonus.mp3',
  purringResult:'Bon-Appetit_result/purring_result.mp3',
  judgmentalResult:'Bon-Appetit_result/judgmental_result.mp3',
  boosterOpen:'shared/onyx/booster_menu_open.mp3',
  boosterConfirm:'shared/onyx/booster_confirm.mp3',
  boosterUsed:'shared/onyx/booster_used.mp3',
  votePrompt:'shared/onyx/vote_prompt.mp3',
  votePositive:'shared/onyx/vote_positive.mp3',
  voteNegative:'shared/onyx/vote_negative.mp3'
};
let enabled=true, unlocked=false;
const channels=new Map(), cache=new Map();
function get(key){
  const src=sounds[key]||key;
  if(!src)return null;
  const url=src.startsWith('assets/')?src:ROOT+src;
  if(!cache.has(url)){const a=new Audio(url);a.preload='auto';cache.set(url,a)}
  return cache.get(url);
}
function stop(channel){const a=channels.get(channel);if(a){try{a.pause();a.currentTime=0}catch{}}channels.delete(channel)}
async function play(key,{channel='sfx',volume=.62,restart=true,loop=false}={}){
  if(!enabled)return false;
  const base=get(key);if(!base)return false;
  if(restart)stop(channel);
  const a=base.cloneNode(true);a.volume=Math.max(0,Math.min(1,volume));a.loop=!!loop;channels.set(channel,a);
  a.addEventListener('ended',()=>{if(channels.get(channel)===a)channels.delete(channel)},{once:true});
  try{await a.play();unlocked=true;return true}catch{return false}
}
function setEnabled(v){enabled=!!v;if(!enabled)for(const ch of [...channels.keys()])stop(ch);document.body.classList.toggle('sound-off',!enabled);return enabled}
function unlock(){if(unlocked)return;unlocked=true;const a=get('plop');if(a){a.volume=0;const p=a.play();if(p?.then)p.then(()=>{a.pause();a.currentTime=0}).catch(()=>{})}}
function bind(type,key,opts){window.addEventListener(type,()=>play(key,opts))}
function init(){
  addEventListener('pointerdown',unlock,{once:true,capture:true});addEventListener('keydown',unlock,{once:true,capture:true});
  bind('level:selected','level',{volume:.42});
  bind('market-madness:trace-started','trace',{volume:.28});
  bind('market-madness:trace-resolved','collect',{volume:.34});
  bind('ingredient-garden:started','gardenMusic',{channel:'music',volume:.22,loop:true});
  bind('ingredient-garden:swap','gardenSelect',{volume:.24});
  bind('ingredient-garden:match','match',{volume:.32});
  bind('ingredient-garden:match','gardenCombo',{channel:'combo',volume:.26});
  bind('ingredient-garden:ingredient-collected','gardenCollect',{volume:.28});
  bind('ingredient-garden:cascade','cascade',{volume:.36});
  bind('ingredient-garden:completed','gardenSuccess',{channel:'music',volume:.34});
  bind('ingredient-garden:failed','gardenFailure',{channel:'music',volume:.34});
  ['bon-appetit:yum-correct','bon-appetit:yuck-correct','bon-appetit:pan-correct','bon-appetit:bowl-correct','bon-appetit:pot-correct'].forEach(t=>bind(t,'machine',{volume:.3}));
  ['bon-appetit:yum-wrong','bon-appetit:yuck-wrong','bon-appetit:cookware-wrong','bon-appetit:flavor-wrong','bon-appetit:junk-to-yum'].forEach(t=>bind(t,'warning',{volume:.38}));
  bind('bon-appetit:flavor-correct','machineBonus',{volume:.35});
  bind('onyx:booster-menu-open','boosterOpen',{channel:'cat',volume:.62});
  bind('onyx:booster-confirm','boosterConfirm',{channel:'cat',volume:.60});
  bind('onyx:booster-used','boosterUsed',{channel:'cat',volume:.66});
  bind('onyx:vote-prompt','votePrompt',{channel:'cat',volume:.62});
  window.addEventListener('onyx:vote-positive',()=>{play('votePositive',{channel:'cat',volume:.68});setTimeout(()=>enabled&&play('purringResult',{channel:'result',volume:.42}),1450)});
  window.addEventListener('onyx:vote-negative',()=>{play('voteNegative',{channel:'cat',volume:.68});setTimeout(()=>enabled&&play('judgmentalResult',{channel:'result',volume:.42}),800)});
}
window.FHMAudio={init,play,stop,setEnabled,get enabled(){return enabled},unlock,sounds};init();
})();
