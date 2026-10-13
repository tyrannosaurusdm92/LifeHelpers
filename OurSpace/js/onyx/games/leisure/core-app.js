(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
// In private/sandboxed contexts, keep a session-only fallback rather than crashing.
const onyxMemoryStore=new Map();
const onyxStorage={
 getItem(k){try{const v=localStorage.getItem(k);return v===null?(onyxMemoryStore.get(k)??null):v;}catch(_){return onyxMemoryStore.get(k)??null;}},
 setItem(k,v){onyxMemoryStore.set(k,String(v));try{localStorage.setItem(k,String(v));return true;}catch(_){return false;}},
 removeItem(k){onyxMemoryStore.delete(k);try{localStorage.removeItem(k);return true;}catch(_){return false;}}
};
const onyxStorageStatus={persistent:true};
function onyxPersist(k,v){
 if(onyxStorage.setItem(k,v))return;
 if(!onyxStorageStatus.persistent)return;
 onyxStorageStatus.persistent=false;
 // Announce the temporary-saving limitation without interrupting other modules.
 const root=document.querySelector('#feedHimMeowBase');
 if(root&&!root.querySelector('#fhmStorageStatus')){
  const notice=document.createElement('p');
  notice.id='fhmStorageStatus';notice.setAttribute('role','status');
  notice.textContent='Browser storage is unavailable. Game progress will last only until this tab closes.';
  root.prepend(notice);
 }
}
const S={level:1,layout:null,recipe:null,catalog:null,recipes:null,layouts:null,junk:null,boosters:null,randomizer:null,cookware:null,flavors:null,phase:'home',paused:false,market:{},garden:{},bon:{},settings:{reducedMotion:false,largeTargets:false,sortAssist:false,heatHold:false,aimAssist:false,soundEnabled:true},seed:1,runId:'',lastCompleted:null};
const emit=(type,detail={})=>window.dispatchEvent(new CustomEvent(type,{detail}));
const newRunId=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}:${Math.random().toString(36).slice(2)}`;
function rng(seed){let x=(seed>>>0)||1;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}
async function json(path){const r=await fetch(path);if(!r.ok)throw new Error(`${path}: ${r.status}`);return r.json()}
async function load(){
  const [catalog,recipes,layouts,junk,boosters,randomizer,cookware,flavors]=await Promise.all([
    json('json/ingredient_catalog.json'),json('json/recipes.json'),json('json/board_layouts.json'),json('json/junk_catalog.json'),json('json/boosters.json'),json('json/randomizer_config.json'),json('json/cookware_catalog.json'),json('json/flavor_catalog.json')
  ]);
  Object.assign(S,{catalog,recipes,layouts:layouts.layouts,junk,boosters,randomizer,cookware,flavors});
  restoreSettings();bindUI();window.GameShell?.init();window.OnyxBoosters?.init();renderLevels();
}
function restoreSettings(){
 const saved=onyxStorage.getItem('fhm.settings.v3')||onyxStorage.getItem('fhm.settings');
 if(saved){try{Object.assign(S.settings,JSON.parse(saved))}catch{}}
 else{try{S.settings.reducedMotion=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches}catch(_){}}
 applySettings();
}
function applySettings(){
  document.body.classList.toggle('reduced-motion',!!S.settings.reducedMotion);document.body.classList.toggle('large-targets',!!S.settings.largeTargets);
  for(const [id,key] of [['reducedMotion','reducedMotion'],['largeTargets','largeTargets'],['sortAssist','sortAssist'],['heatHold','heatHold'],['aimAssist','aimAssist'],['soundEnabled','soundEnabled']]){const el=$('#'+id);if(el)el.checked=!!S.settings[key]}
  onyxPersist('fhm.settings.v3',JSON.stringify(S.settings));window.FHMAudio?.setEnabled(!!S.settings.soundEnabled);updateSoundButtons();
}
function updateSoundButtons(){const on=!!S.settings.soundEnabled;const main=$('#soundBtn');if(main){main.firstChild.textContent=on?'🔊 ':'🔇 ';const s=main.querySelector('span');if(s)s.textContent=on?'Sound':'Muted'}const pause=$('#pauseSoundBtn');if(pause)pause.textContent=on?'🔊 Sound: On':'🔇 Sound: Off'}
function show(id){$$('.screen').forEach(x=>x.hidden=true);const el=$('#'+id);if(el){el.hidden=false;el.scrollTop=0}S.phase=id;window.GameShell?.onScreen(id);window.OnyxBoosters?.render()}
function levelStars(save){const n=Number(save?.bestStars ?? save?.stars ?? save?.lastStars ?? 0);return Math.max(0,Math.min(5,Number.isFinite(n)?Math.round(n):0))}
function levelCardMarkup(i,lay,save){const stars=levelStars(save),done=!!save;const last=save?.lastStars!=null&&save.lastStars!==stars?`<small class="last-stars">Last run: ${'★'.repeat(save.lastStars)}${'☆'.repeat(5-save.lastStars)}</small>`:'';return `<b>${i}</b><span>${lay.name}</span><small class="level-stars" aria-label="${stars} of 5 stars">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</small>${last}${done?'<i class="complete-mark">COMPLETE</i>':''}`}
function updateLevelCard(level){const b=$(`#levelGrid .level-card[data-level="${level}"]`);if(!b||!S.layouts)return;const lay=S.layouts[(level-1)%S.layouts.length];const save=getSave(level);b.innerHTML=levelCardMarkup(level,lay,save);b.classList.toggle('completed',!!save)}
function renderLevels({focusLevel=null}={}){
  const host=$('#levelGrid');host.innerHTML='';let totalStars=0,completed=0;
  for(let i=1;i<=50;i++){const lay=S.layouts[(i-1)%S.layouts.length];const save=getSave(i);totalStars+=levelStars(save);if(save)completed++;const b=document.createElement('button');b.className='level-card'+(save?' completed':'');b.dataset.level=i;b.type='button';b.innerHTML=levelCardMarkup(i,lay,save);b.onclick=()=>selectLevel(i);host.append(b)}
  const callout=$('.select-callout');if(callout)callout.textContent=`Choose a level · ${completed}/50 complete · ${totalStars}/250 stars earned`;
  const cp=getCheckpoint();const cont=$('#continueRun');if(cont){cont.hidden=!cp;cont.textContent=cp?`▶ Continue Level ${cp.level}`:'▶ Continue Run'}show('home');
  if(focusLevel){requestAnimationFrame(()=>{const b=$(`#levelGrid .level-card[data-level="${focusLevel}"]`);b?.focus();b?.scrollIntoView({block:'center',inline:'center',behavior:S.settings.reducedMotion?'auto':'smooth'})})}
}
function getSave(level){try{return JSON.parse(onyxStorage.getItem(`fhm.level.${level}`)||'null')}catch{return null}}
function getCheckpoint(){try{return JSON.parse(onyxStorage.getItem('fhm.run.v3')||'null')}catch{return null}}
function saveCheckpoint(phase){if(!S.recipe)return;onyxPersist('fhm.run.v3',JSON.stringify({level:S.level,phase,recipeId:S.recipe.id,market:S.market,garden:S.garden,bon:S.bon,seed:S.seed,runId:S.runId,updatedAt:Date.now()}))}
function clearCheckpoint(){onyxStorage.removeItem('fhm.run.v3')}
function chooseRecipe(level){const featured=S.recipes.featuredRecipes||[];return normalizeRecipe(featured[(level-1)%Math.max(1,featured.length)]||featured[0])}
function beginRecipeGenerator(level){
  S.level=level;S.layout=S.layouts[(level-1)%S.layouts.length];S.seed=0xF00D0000+level*7919;S.runId=newRunId();S.market={};S.garden={};S.bon={};S.paused=false;S.recipe=null;
  $('#generatorLevel').textContent=level;$('#recipeGenStatus').textContent=`Ready to generate Level ${level}'s recipe.`;$('#recipeGenNote').textContent='Market Madness is locked until this step finishes.';$('#generateRecipe').disabled=false;show('recipeGenerator');emit('level:selected',{level,layout:S.layout.id});emit('recipe-generator:opened',{level});
}
function selectLevel(level){beginRecipeGenerator(level)}
function generateRecipe(){
  if(S.phase!=='recipeGenerator')show('recipeGenerator');const btn=$('#generateRecipe');btn.disabled=true;$('#recipeGenSpinner').classList.add('spinning');$('#recipeGenStatus').textContent='Generating recipe…';$('#recipeGenNote').textContent='Validating canonical ingredient IDs and splitting Market Madness / Ingredient Garden responsibilities.';emit('recipe-generator:started',{level:S.level});
  const finish=()=>{S.recipe=chooseRecipe(S.level);renderRecipe();saveCheckpoint('recipe');$('#recipeGenSpinner').classList.remove('spinning');$('#recipeGenStatus').textContent=S.recipe.name;$('#recipeGenNote').textContent='Recipe locked for this run. Market Madness can now begin.';emit('recipe:generated',{recipeId:S.recipe.id,level:S.level});emit('recipe:shown',{recipeId:S.recipe.id,level:S.level});show('recipe');btn.disabled=false};
  setTimeout(finish,S.settings.reducedMotion?20:520);
}
function continueRun(){
  const cp=getCheckpoint();if(!cp)return renderLevels();S.level=cp.level;S.layout=S.layouts[(cp.level-1)%S.layouts.length];S.seed=cp.seed||0xF00D0000+cp.level*7919;S.runId=cp.runId||newRunId();S.market=cp.market||{};S.garden=cp.garden||{};S.bon=cp.bon||{};S.paused=false;S.recipe=chooseRecipe(cp.level);renderRecipe();const phase=cp.phase||'recipe';
  if(phase==='market')startMarket();else if(phase==='garden')advance('garden');else if(phase==='bon')advance('bon');else show('recipe')
}
function normalizeRecipe(r){
  r=structuredClone(r||{});const gameReq=r.gameplay?.requiredIngredientIds||[];const gameFlavor=r.gameplay?.requiredFlavorIds||[];const all=[...gameReq,...gameFlavor,...(r.ingredients||[]).map(x=>x.id),...(r.seasonings||[]),...(r.freshHerbs||[])];r.requiredIds=[...new Set(all.map(resolveId))];
  r.marketIngredients=r.requiredIds.filter(id=>record(id)?.marketEligible);r.gardenIngredients=r.requiredIds.filter(id=>record(id)?.gardenEligible&&!r.marketIngredients.includes(id));
  r.flavorTargets=[...new Set([...gameFlavor,...(r.seasonings||[]),...(r.freshHerbs||[]),...(r.ingredients||[]).filter(x=>['sauce','seasoning','herb'].includes(record(x.id)?.category)).map(x=>x.id)].map(resolveId))];
  r.cookwareRoute={};for(const id of r.requiredIds)r.cookwareRoute[id]=cookwareFor(id);r.stoveHeatTarget=r.stoveHeatTarget||{min:55,max:78};r.ovenRequired=r.ovenRequired??true;r.ovenBlowTarget=r.ovenBlowTarget||100;return r
}
function record(id){id=resolveId(id);return S.catalog?.ingredients?.find(x=>(x.id||x.ingredientId)===id)}
function resolveId(id){return S.catalog?.legacyIngredientAliases?.[id]||id}
function name(id){return record(id)?.name||record(id)?.displayName||String(id).replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}
function asset(id){const r=record(id);return r?.runtimeAssetAlias||r?.sourceAsset||r?.asset||`https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/games/leisure/shared/ingredients/${resolveId(id)}.svg`}
function cookwareFor(id){const r=record(id),c=(r?.category||'').toLowerCase(),s=(r?.subCategory||r?.subcategory||'').toLowerCase();if(['liquid','starch'].includes(c)||/broth|stock|water|pasta|rice|soup/.test(s))return 'pot';if(['sauce','dairy','seasoning','herb','pantry'].includes(c)||/sauce|spice|flour|sugar/.test(s))return 'bowl';return 'pan'}
function renderRecipe(){
  if(!S.recipe)return;$('#recipeLevel').textContent=S.level;$('#recipeName').textContent=S.recipe.name;const list=(el,ids)=>{$(el).innerHTML=(ids.length?ids:['none']).map(id=>id==='none'?'<li>None</li>':`<li><img class="tiny" src="${asset(id)}" alt=""> ${name(id)}</li>`).join('')};list('#marketRecipe',S.recipe.marketIngredients);list('#gardenRecipe',S.recipe.gardenIngredients);list('#flavorRecipe',S.recipe.flavorTargets);renderRecipeDialog()
}
function renderRecipeDialog(){if(!S.recipe)return;$('#recipeDialogBody').innerHTML=`<p><b>${S.recipe.name}</b></p><p><b>YUM</b> means it belongs in this recipe. <b>YUCK</b> means it does not belong in this recipe; edible food can still be YUCK.</p><div class="recipe-columns"><div><b>Fresh/raw</b><br>${S.recipe.marketIngredients.map(name).join(', ')||'None'}</div><div><b>Pantry</b><br>${S.recipe.gardenIngredients.map(name).join(', ')||'None'}</div><div><b>Flavor targets</b><br>${S.recipe.flavorTargets.map(name).join(', ')||'None'}</div></div>`}
function bindUI(){
  $('#generateRecipe').onclick=generateRecipe;$('#generatorBack').onclick=()=>renderLevels({focusLevel:S.level});$('#startMarket').onclick=startMarket;$('#recipeBack').onclick=()=>renderLevels({focusLevel:S.level});$('#continueRun').onclick=continueRun;
  $('#recipeBtn').onclick=()=>window.GameShell?.openRecipe();$('#closeRecipe').onclick=()=>window.GameShell?.closeRecipe();
  let accessWasPaused=false;const closeAccess=()=>{if($('#accessDialog').open)$('#accessDialog').close();S.paused=accessWasPaused};$('#accessBtn').onclick=()=>{accessWasPaused=!!S.paused;S.paused=true;$('#accessDialog').showModal()};$('#closeAccess').onclick=closeAccess;$('#accessDialog').addEventListener('cancel',e=>{e.preventDefault();closeAccess()});
  ['reducedMotion','largeTargets','sortAssist','heatHold','aimAssist','soundEnabled'].forEach(id=>$('#'+id)?.addEventListener('change',e=>{S.settings[id]=e.target.checked;applySettings()}));
  $('#replay').onclick=()=>beginRecipeGenerator(S.level);$('#backLevels').onclick=()=>renderLevels({focusLevel:S.level});$('#nextLevel').onclick=()=>renderLevels({focusLevel:Math.min(50,S.level+1)});
}
function startMarket(){if(!S.recipe){beginRecipeGenerator(S.level);return}show('market');saveCheckpoint('market');window.MarketMadness.start()}
function advance(which){if(!S.recipe){beginRecipeGenerator(S.level);return}if(which==='garden'){show('garden');saveCheckpoint('garden');window.IngredientGarden.start()}else if(which==='bon'){show('bon');saveCheckpoint('bon');window.BonAppetit.start()}else if(which==='final'){show('final');renderFinal()}}
function scorePct(){const m=Math.min(1,(S.market.quality??0)),g=Math.min(1,(S.garden.quality??0)),b=S.bon;const sort=b.sortAccuracy??0,cook=b.cookwareAccuracy??0,heat=b.heatAccuracy??0,oven=b.ovenAccuracy??0,flav=b.flavorAccuracy??0;return Math.max(0,Math.min(1,m*.25+g*.25+((sort+cook)/2)*.20+((heat+oven)/2)*.15+flav*.15))}
function rewardForLevel({stars,firstClear,newPersonalBest,perfectPerformance}){
  const starTable=[0,1,3,6],starCopper=starTable[Math.max(1,Math.min(3,Math.floor(Number(stars)||1)))];
  const levelCopper=Math.min(18,Math.floor(Math.log2(Math.max(1,S.level)+1)*1.25));
  const breakdown={completion:3,firstClear:firstClear?2:0,personalBest:newPersonalBest?2:0,perfect:perfectPerformance?4:0,stars:starCopper,level:levelCopper};
  return {totalCopper:Object.values(breakdown).reduce((sum,value)=>sum+value,0),breakdown};
}
function saveLevelResult(stars,total,quality){
  const old=getSave(S.level)||{},oldBest=Number(old.bestScore??old.score??0)||0,firstClear=!old.completed,newPersonalBest=total>oldBest;
  const bestStars=Math.max(levelStars(old),stars),bestScore=Math.max(oldBest,total),completedAt=Date.now();
  const reward=rewardForLevel({stars,firstClear,newPersonalBest,perfectPerformance:stars===5&&quality==='IDEAL'});
  const payment=window.OnyxCurrency?.credit?.(reward.totalCopper,{id:`feed-him-meow:${S.runId||S.level+':'+completedAt}`,reason:`Feed Him MEOW · Level ${S.level}`,source:'feed-him-meow'});
  const save={stars:bestStars,bestStars,lastStars:stars,score:bestScore,bestScore,lastScore:total,quality,recipeId:S.recipe.id,completed:true,completedAt,rewardCopper:reward.totalCopper,rewardBreakdown:reward.breakdown};
  onyxPersist(`fhm.level.${S.level}`,JSON.stringify(save));S.lastCompleted={level:S.level,...save};updateLevelCard(S.level);
  emit('currency:rewarded',{level:S.level,stars,totalCopper:reward.totalCopper,wallet:payment?.wallet||null,breakdown:reward.breakdown});
  return save;
}
function renderFinal(){
  const pct=scorePct(),stars=pct<.12?0:Math.max(1,Math.min(5,Math.round(pct*5))),purring=stars>=3,b=S.bon;let quality='ACCEPTABLE';if((b.junkToYum||0)>0)quality='CONTAMINATED';else if((b.flavorAccuracy||0)<.45)quality='WRONG-FLAVOR';else if((b.heatAccuracy||0)<.45)quality=(b.timeTooHot||0)>(b.timeTooCold||0)?'OVERCOOKED':'UNDERCOOKED';else if(stars===5)quality='IDEAL';else if(stars<=2)quality='MESSY';
  $('#finalRecipe').textContent=`Level ${S.level} — ${S.recipe.name}`;$('#stars').textContent='★'.repeat(stars)+'☆'.repeat(5-stars);$('#verdictText').textContent=purring?'PURRING':'JUDGMENTAL';$('#onyxVerdict').src=`https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_${purring?'purring':'judgmental'}.png`;$('#qualityText').textContent=`Dish result: ${quality}`;$('#plate').textContent=quality==='IDEAL'?'🍗✨':quality==='CONTAMINATED'?'🍽️🥾':quality==='WRONG-FLAVOR'?'🍽️🌶️':'🍽️🍲';
  const rows=[['Market Madness',pctText(S.market.quality)],['Ingredient Garden',pctText(S.garden.quality)],['Bon Appétit sort',pctText(b.sortAccuracy)],['Cookware routing',pctText(b.cookwareAccuracy)],['Heat',pctText(b.heatAccuracy)],['Oven',pctText(b.ovenAccuracy)],['Flavor',pctText(b.flavorAccuracy)],['Junk to YUM',String(b.junkToYum||0)]];$('#scoreDetails').innerHTML=rows.map(([a,v])=>`<div><span>${a}</span><b>${v}</b></div>`).join('');
  $('#verdictVote').hidden=false;$('#verdictOutcome').hidden=true;$('#voteOnyx').src='https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/shared/legacy-static/onyx_hungry.png';emit('onyx:vote-prompt',{stars,quality});
  const reveal=()=>{$('#verdictVote').hidden=true;$('#verdictOutcome').hidden=false;emit(purring?'onyx:vote-positive':'onyx:vote-negative',{stars,quality});emit(purring?'onyx:purring':'onyx:judgmental',{stars})};setTimeout(reveal,S.settings.reducedMotion?220:950);
  const total=(S.market.score||0)+(S.garden.score||0)+(b.score||0);const saved=saveLevelResult(stars,total,quality);$('#qualityText').textContent+=` · Reward: ${window.OnyxCurrency?.format?.(saved.rewardCopper)||saved.rewardCopper+' copper'}`;clearCheckpoint();emit('stars:calculated',{stars,pct,bestStars:saved.bestStars});emit('level:completed',{level:S.level,stars,total,bestStars:saved.bestStars,rewardCopper:saved.rewardCopper})
}
const pctText=v=>`${Math.round((v||0)*100)}%`;
window.FHM={S,$,$$,emit,rng,record,resolveId,name,asset,cookwareFor,advance,show,renderLevels,renderRecipeDialog,applySettings,saveCheckpoint,getCheckpoint,startMarket,beginRecipeGenerator,generateRecipe,storageStatus:onyxStorageStatus};
function reportLoadError(err){
 console.error('[Feed Him MEOW] Failed to load game data',err);
 const host=document.querySelector('#feedHimMeowBase')||document.body;
 let status=host.querySelector('#fhmLoadStatus');
 if(!status){status=document.createElement('section');status.id='fhmLoadStatus';status.setAttribute('role','alert');status.style.cssText='padding:1rem;border:2px solid currentColor;margin:1rem';host.prepend(status);}
 status.replaceChildren();
 const heading=document.createElement('h2');heading.textContent='Feed Him MEOW could not load';
 const detail=document.createElement('p');detail.textContent='Game data is temporarily unavailable. Other OurSpace pages are unaffected.';
 const retry=document.createElement('button');retry.type='button';retry.textContent='Try again';
 retry.addEventListener('click',()=>{status.remove();load().catch(reportLoadError);});
 status.append(heading,detail,retry);
}
load().catch(reportLoadError);
})();
