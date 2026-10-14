(()=>{
'use strict';
let inv={},wasPaused=false,activeMood='listening';
const resultRoot='assets/images/games/leisure/Bon-Appetit/result/';
function phaseKey(){return FHM.S.phase==='market'?'market':FHM.S.phase==='garden'?'garden':FHM.S.phase==='bon'?'bon':null}
function defs(){return FHM.S.boosters?.onyxMenuBoosters||[]}
function moodMap(){return FHM.S.randomizer?.onyxGardenBehavior?.boosterMoodMap||{}}
function load(){try{inv=JSON.parse(localStorage.getItem('fhm.boosters.v3')||'{}')}catch{inv={}}for(const d of defs())if(inv[d.id]==null)inv[d.id]=Math.max(0,d.start||0);save()}
function save(){localStorage.setItem('fhm.boosters.v3',JSON.stringify(inv))}
function phaseApi(){const p=phaseKey();return p==='market'?window.MarketMadness:p==='garden'?window.IngredientGarden:p==='bon'?window.BonAppetit:null}
function usable(def){const p=phaseKey();if(!p)return false;const allowed=FHM.S.boosters?.phaseAvailability?.[p]||[];if(!allowed.includes(def.id))return false;const api=phaseApi();return api?.canUseBooster?api.canUseBooster(def.id)!==false:true}
function moodFor(def){return def?.mood||moodMap()[def?.id]||'listening'}
function setMood(mood,note){activeMood=mood||'listening';const img=document.querySelector('#boosterOnyx');if(img){img.src=`${resultRoot}onyx_${activeMood}.png`;img.alt=`${activeMood} Onyx`}const m=document.querySelector('#boosterMood');if(m)m.textContent=activeMood.toUpperCase();if(note)document.querySelector('#boosterNote').textContent=note}
function render(){const p=phaseKey(),host=document.querySelector('#boosterGrid');if(!host)return;const ids=FHM.S.boosters?.phaseAvailability?.[p]||[];const list=defs().filter(d=>ids.includes(d.id));host.innerHTML='';if(!p){host.innerHTML='<p>Start a phase to use Onyx boosters.</p>';return}for(const d of list){const count=inv[d.id]||0,ok=count>0&&usable(d);const b=document.createElement('button');b.type='button';b.className='booster-item';b.disabled=!ok;b.innerHTML=`<strong>${d.name}</strong><span>${d.desc}</span><b>× ${count}</b>`;b.addEventListener('focus',()=>setMood(moodFor(d),ok?'Ready to help.':count?'This boost is for another moment in the phase.':'No uses left.'));b.addEventListener('pointerenter',()=>setMood(moodFor(d)));b.addEventListener('click',()=>use(d));host.append(b)}if(!list.length)host.innerHTML='<p>No phase boosters are assigned here yet.</p>'}
function open(){const d=document.querySelector('#boosterDialog');if(!d||d.open)return;wasPaused=!!FHM.S.paused;FHM.S.paused=true;render();setMood('listening',`Pick a boost for ${phaseKey()==='bon'?'Bon Appétit':phaseKey()==='market'?'Market Madness':phaseKey()==='garden'?'Ingredient Garden':'this run'}.`);d.showModal();FHM.emit('onyx:booster-menu-open',{phase:phaseKey()})}
function close(){const d=document.querySelector('#boosterDialog');if(d?.open)d.close();FHM.S.paused=wasPaused}
function use(def){if((inv[def.id]||0)<=0||!usable(def))return;FHM.emit('onyx:booster-confirm',{id:def.id,phase:phaseKey()});const api=phaseApi(),ok=api?.applyBooster?.(def.id);if(ok===false){setMood(moodFor(def),'That boost cannot be used at this exact moment.');render();return}inv[def.id]=Math.max(0,(inv[def.id]||0)-1);save();setMood(moodFor(def),`${def.name.replace(/^\S+\s*/,'')} activated.`);const usedDetail={id:def.id,phase:phaseKey(),remaining:inv[def.id]};setTimeout(close,300);setTimeout(()=>FHM.emit('onyx:booster-used',usedDetail),520);render()}
function init(){load();document.querySelector('#boosterBtn')?.addEventListener('click',open);document.querySelector('#closeBoosters')?.addEventListener('click',close);document.querySelector('#boosterDialog')?.addEventListener('cancel',e=>{e.preventDefault();close()})}
window.OnyxBoosters={init,open,close,render,use,get inventory(){return {...inv}}};
})();
