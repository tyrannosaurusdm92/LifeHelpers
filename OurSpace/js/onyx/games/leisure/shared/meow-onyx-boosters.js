/* Shared Onyx booster bubble for any Onyx leisure game.
 * Utility 5 toggles visibility ONLY. Onyx's own portrait is the sole booster menu toggle.
 * Effects are requests to the owning board; no currency, inventory, or board state is fabricated here.
 */
(()=>{'use strict';
const shell=window.MEOWShell;
const dock=document.getElementById('onyxBoosterDock');
if(!shell||!dock)return;
const $=id=>document.getElementById(id);
const bubble=$('onyxBoosterBubble'), portrait=$('onyxBoosterPortrait'), menu=$('onyxBoosterMenu'),
 grid=$('onyxBoosterGrid'), help=$('onyxMenuHelp'), status=$('onyxBoosterStatus'), cancel=$('onyxCancelTarget'), utility=$('onyxBoostersUtility'),
 stage=$('gameMount')||$('gameViewport'),viewer=$('viewerScreen')||document.querySelector('.viewport-frame');
const states=new Set(['caring','hungry','judgmental','listening','purring','sleepy','snuggly','thinking','thoughtful']);
const ICON_BASE='assets/images/games/leisure/shared/';
const definitions=[
 {id:'imperial_paw_bop',name:'Imperial Paw Bop',description:'One royal swat clears one permitted tile.',mood:'judgmental',effect:'removeOne',targets:1,icon:'paw-bop',phases:['MARKET_MADNESS','INGREDIENT_GARDEN','BON_APPETIT_SORT','BON_APPETIT_COOKWARE']},
 {id:'sticky_toe_beans',name:'Sticky Toe-Beans',description:'Pick two tiles to swap, paw-to-paw.',mood:'purring',effect:'swapTwo',targets:2,icon:'toe-beans',phases:['MARKET_MADNESS','INGREDIENT_GARDEN','BON_APPETIT_FLAVOR']},
 {id:'royal_side_eye',name:'Royal Side-Eye',description:'Dismiss one wrong ingredient or blocker.',mood:'judgmental',effect:'dismissUnwanted',targets:1,icon:'side-eye',phases:['MARKET_MADNESS','INGREDIENT_GARDEN','BON_APPETIT_SORT','BON_APPETIT_COOKWARE']},
 {id:'bowtie_blitz',name:'Bowtie Blitz',description:'A tidy cross sweep through one tile.',mood:'thoughtful',effect:'crossClear',targets:1,icon:'bowtie-blitz',phases:['MARKET_MADNESS','INGREDIENT_GARDEN','BON_APPETIT_FLAVOR']},
 {id:'void_pounce',name:'Void Pounce',description:'Land a theatrical 3×3 paw blast.',mood:'caring',effect:'areaClear3x3',targets:1,icon:'void-pounce',phases:['MARKET_MADNESS','INGREDIENT_GARDEN','BON_APPETIT_OVEN']},
 {id:'blep_shuffle',name:'Blep Shuffle',description:'His Majesty rearranges the whole board.',mood:'thinking',effect:'shuffle',targets:0,icon:'blep-shuffle',phases:['MARKET_MADNESS','INGREDIENT_GARDEN','BON_APPETIT_SORT','BON_APPETIT_COOKWARE']},
 {id:'snack_tax',name:'Snack Tax',description:'Claim one recipe-needed ingredient.',mood:'hungry',effect:'collectRequired',targets:1,icon:'snack-tax',phases:['MARKET_MADNESS','INGREDIENT_GARDEN','BON_APPETIT_HEAT']},
 {id:'imperial_decree',name:'Imperial Decree',description:'Select a family for a royal mass clear.',mood:'thoughtful',effect:'clearFamily',targets:1,icon:'imperial-decree',phases:['MARKET_MADNESS','INGREDIENT_GARDEN','BON_APPETIT_FLAVOR']},
 {id:'steady',name:'Steady Paw',description:'Hold the kitchen at its target heat or keep the oven air flowing.',mood:'caring',effect:'steadyCook',targets:0,icon:'toe-beans',phases:['BON_APPETIT_COOK','BON_APPETIT_OVEN']},
 {id:'stock',name:'Second Helping',description:'Recover one required portion sent away during sorting.',mood:'hungry',effect:'recoverPortion',targets:0,icon:'snack-tax',phases:['BON_APPETIT_SORT','BON_APPETIT_MEASURE']}
];
let visible=false,expanded=false,mood='listening',overrideMood=false,selected=null,targets=[],pending=null,inventory=null,lastStars=null;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const emit=(type,body)=>shell.emitInput(type,{inputSource:'onyx-bubble',...body});
const phase=()=>shell.getPhase();
function applyMood(next,{manual=false}={}){
 const key=String(next||'listening').replace(/^onyx_/,'').toLowerCase();
 if(!states.has(key))return false;
 mood=key;if(manual)overrideMood=true;
 portrait.src='assets/images/shared/legacy-static/onyx_'+key+'.png';
 portrait.alt='Onyx, '+key;
 bubble.title=`Onyx (${key}) · Tap to ${expanded?'close':'open'} boosters`;
 dock.dataset.mood=key;
 return true;
}
function setStatus(message,{targeting=false}={}){
 if(!message){status.hidden=true;status.textContent='';status.dataset.targeting='false';return}
 status.textContent=message;status.hidden=false;status.dataset.targeting=String(targeting);
}
function layout(){
 if(!visible)return;
 dock.dataset.stage=phase().startsWith('BON_APPETIT_')?'bon':'puzzle';
 const r=viewer.getBoundingClientRect();
 const mobile=window.innerWidth<=620,landscape=window.innerHeight<=450;
 const side=(mobile||landscape)?'left':'right';
 dock.dataset.side=side;
 const size=mobile?(landscape?70:88):(landscape?76:128);
 dock.style.setProperty('--onyx-bubble-size',size+'px');
 const x=side==='left'?(mobile?r.left+9:r.left+155):r.right-size-12;
 const dockX=clamp(x,8,window.innerWidth-size-8);
 const y=clamp(r.top+(mobile?88:60),7,window.innerHeight-size-(landscape?6:13));
 dock.style.left=dockX+'px';dock.style.top=y+'px';
 const menuWidth=side==='left'?Math.min(392,window.innerWidth-dockX-size-21):Math.min(392,dockX-21);
 menu.style.width=Math.max(175,menuWidth)+'px';
 const maxMenuHeight=Math.max(110,window.innerHeight-y-12);
 menu.style.maxHeight=Math.min(maxMenuHeight,window.innerHeight*.74)+'px';
}
function showBubble({openMenu=false}={}){
 visible=true;dock.hidden=false;utility?.setAttribute('aria-pressed','true');
 bubble.setAttribute('aria-expanded',String(expanded));layout();
 if(openMenu)toggleMenu(true);
 emit('onyx:bubble-visibility',{visible:true});return true;
}
function closeMenu({focusBubble=false}={}){
 expanded=false;menu.hidden=true;bubble.setAttribute('aria-expanded','false');bubble.setAttribute('aria-label',"Open Onyx's booster menu");
 if(focusBubble&&visible)bubble.focus({preventScroll:true});
 emit('onyx:booster-menu',{open:false});return false;
}
function hideBubble(){
 closeMenu();cancelTarget({quiet:true});visible=false;dock.hidden=true;utility?.setAttribute('aria-pressed','false');setStatus('');
 emit('onyx:bubble-visibility',{visible:false});return false;
}
function toggleBubble(){return visible?hideBubble():showBubble()}
function toggleMenu(next=!expanded){
 if(!visible)return false;
 expanded=!!next;menu.hidden=!expanded;
 bubble.setAttribute('aria-expanded',String(expanded));bubble.setAttribute('aria-label',expanded?"Close Onyx's booster menu":"Open Onyx's booster menu");
 if(expanded){layout();render();}
 emit('onyx:booster-menu',{open:expanded});return expanded;
}
function setInventory(items){
 inventory=Array.isArray(items)?items.map(v=>({...v})):null;
 render();return getInventory();
}
function getInventory(){return inventory===null?null:inventory.map(v=>({...v}))}
function matchingItem(def){return inventory?.find(x=>String(x.id||'')===def.id)}
function formatStock(item){
 if(!item)return 'Ready to request · board validates';
 const n=Number(item.count??item.quantity??item.stock);
 if(Number.isFinite(n)&&n>=0)return `Owned: ${Math.floor(n)}`;
 return item.available===false?'Unavailable':'Connected to game';
}
function available(def){const p=phase(),allowed=def.phases.includes(p),item=matchingItem(def);
 if(!allowed)return false;
 if(inventory!==null&&!item)return false;
 if(!item)return true;
 const n=Number(item.count??item.quantity??item.stock);
 if(item.available===false)return false;
 return !(Number.isFinite(n)&&n<=0);
}
function render(){
 grid.replaceChildren();
 for(const def of definitions){
  const item=matchingItem(def);const b=document.createElement('button');b.type='button';b.className='onyx-boost-card';b.dataset.booster=def.id;
  b.setAttribute('aria-pressed',String(selected?.id===def.id));b.disabled=!available(def);
  b.title=def.description;
  const img=document.createElement('img');img.src=ICON_BASE+'booster-'+def.icon+'.svg';img.alt='';img.loading='lazy';
  const copy=document.createElement('span');copy.className='onyx-boost-copy';
  const name=document.createElement('strong');name.className='onyx-boost-name';name.textContent=def.name;
  const desc=document.createElement('span');desc.className='onyx-boost-desc';desc.textContent=def.description;
  const count=document.createElement('span');count.className='onyx-boost-stock';count.textContent=!def.phases.includes(phase())?'Not available in this phase':formatStock(item);
  copy.append(name,desc,count);b.append(img,copy);b.addEventListener('click',()=>choose(def));grid.append(b);
 }
 help.textContent=selected?`Selected: ${selected.name}. ${targets.length}/${selected.targets} targets. Tap game board or cancel.`:
 'Choose an Onyx booster. Some require tapping one or two tiles on the board.';
 cancel.hidden=!selected;
}
function cancelTarget({quiet=false}={}){
 if(!selected)return false;
 const id=selected.id;selected=null;targets=[];
 if(!quiet){setStatus('Booster targeting canceled.');applyMood('listening');emit('booster:cancel',{boosterId:id});}
 render();return true;
}
function submit(def,picks=[]){
 const request={boosterId:def.id,boosterName:def.name,effect:def.effect,phase:phase(),targets:picks.map(p=>({...p})),source:'onyx-bubble'};
 pending=request;selected=null;targets=[];cancel.hidden=true;
 emit('booster:request',request);
 // Do not decrement currency or inventory, or pretend the board already applied an effect.
 setStatus(`${def.name}: sent to game for approval.`);
 render();return request;
}
function choose(def){
 if(!available(def))return false;
 selected=def;targets=[];applyMood(def.mood);closeMenu();
 emit('booster:selected',{boosterId:def.id,effect:def.effect,targetsNeeded:def.targets});
 if(def.targets===0){submit(def);return true}
 setStatus(`${def.name}: tap ${def.targets===2?'the first tile':'a tile'} on the board.`,{targeting:true});render();return true;
}
function stageCoord(e){const r=stage.getBoundingClientRect();return {
 x:clamp((e.clientX-r.left)/Math.max(r.width,1),0,1),y:clamp((e.clientY-r.top)/Math.max(r.height,1),0,1),
 pixelX:e.clientX-r.left,pixelY:e.clientY-r.top,pointerType:e.pointerType||'mouse',
 targetId:e.target?.closest?.('[data-tile-id]')?.dataset?.tileId||null,
 tileRow:e.target?.closest?.('[data-row]')?.dataset?.row??null,
 tileColumn:e.target?.closest?.('[data-column]')?.dataset?.column??null
}}
function pick(e){
 if(!selected||!visible)return;
 if(shell.isPaused())return;
 if(e.button!==undefined&&e.button!==0)return;
 // Complete on pointerup to avoid activating a tile accidentally from an incomplete gesture.
 const def=selected;
 e.preventDefault();e.stopImmediatePropagation();
 targets.push(stageCoord(e));
 emit('booster:target-picked',{boosterId:def.id,position:targets.length,total:def.targets,target:targets[targets.length-1]});
 if(targets.length<def.targets){setStatus(`${def.name}: tap the second tile.`,{targeting:true});render();return}
 submit(def,targets);
}
stage.addEventListener('pointerup',pick,true);
stage.addEventListener('click',e=>{if(selected){e.preventDefault();e.stopImmediatePropagation()}},true);
// Pointerdown is suppressed in original shell while targeting; still prevent board child handlers.
stage.addEventListener('pointerdown',e=>{if(selected){e.stopPropagation();e.preventDefault()}},true);
function syncWithPhase(){
 const p=phase();
 dock.dataset.stage=p.startsWith('BON_APPETIT_')?'bon':'puzzle';
 if(selected&&!selected.phases.includes(p))cancelTarget();
 if(!overrideMood){
  if(p.startsWith('BON_APPETIT_'))applyMood('hungry');
  else if(p==='ONYX_VERDICT')applyMood(lastStars===null?'thoughtful':lastStars>=3?'purring':'judgmental');
  else applyMood('listening');
 }
 render();
}
function resolveRequest(id,{accepted=false,message='',mood:desiredMood}={}){
 if(!pending||pending.boosterId!==id)return false;
 const result={...pending,accepted:!!accepted};pending=null;
 if(desiredMood)applyMood(desiredMood);else applyMood(accepted?'purring':'judgmental');
 setStatus(message||(accepted?'Onyx booster applied by game.':'Onyx booster was not applied.'));
 emit('booster:resolved',result);
 return true;
}
function handleShell(e){const d=e.detail||{};
 if(d.type==='phase:changed')syncWithPhase();
 if(d.type==='hud:updated'){
  // Star verdicts are 0..5; never interpret a raw points score (such as 1500) as stars.
  const explicit=Number(d.stars);
  const legacy=Number(d.score);
  const candidate=d.stars!==null&&d.stars!==undefined?explicit:
    Number.isInteger(legacy)&&legacy>=0&&legacy<=5&&d.score!==null?legacy:null;
  if(candidate!==null&&Number.isInteger(candidate)&&candidate>=0&&candidate<=5)lastStars=candidate;
  if(phase()==='ONYX_VERDICT'&&!overrideMood&&lastStars!==null)applyMood(lastStars>=3?'purring':'judgmental');
 }
 if(d.type==='boosters:updated'&&shell.getBoosters)setInventory(shell.getBoosters());
}
window.addEventListener('meow:shell',handleShell);
bubble.addEventListener('click',()=>toggleMenu());
$('onyxBoosterClose').addEventListener('click',()=>closeMenu({focusBubble:true}));
cancel.addEventListener('click',()=>{cancelTarget();closeMenu({focusBubble:true})});
window.addEventListener('resize',layout,{passive:true});
window.addEventListener('scroll',layout,{passive:true});
document.addEventListener('pointerdown',e=>{if(expanded&&!dock.contains(e.target))closeMenu()},{passive:true});
window.addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 if(selected){e.preventDefault();e.stopImmediatePropagation();cancelTarget();}
 else if(expanded){e.preventDefault();e.stopImmediatePropagation();closeMenu({focusBubble:true})}
},true);
const api=Object.freeze({version:'1.0.0',showBubble,hideBubble,toggleBubble,openMenu:()=>toggleMenu(true),closeMenu,toggleMenu,
 setMood:(state)=>applyMood(state,{manual:true}),syncMood:(state)=>{overrideMood=false;return applyMood(state)},autoMood:()=>{overrideMood=false;syncWithPhase()},getMood:()=>mood,
 isVisible:()=>visible,isMenuOpen:()=>expanded,isTargeting:()=>!!selected,
 getDefinitions:()=>definitions.map(v=>({...v})),setInventory,getInventory,cancelTarget,resolveRequest});
window.MEOWOnyxBoosters=api;
// Hook is deliberately NOT auto-expanded: utility 5 shows Onyx's icon, not the menu.
applyMood('listening');
window.dispatchEvent(new CustomEvent('meow:onyx-ready',{detail:{api:'window.MEOWOnyxBoosters'}}));
})();
