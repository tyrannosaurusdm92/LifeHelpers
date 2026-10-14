(()=>{
'use strict';
let initialized=false,gamepadIndex=null,lastPadAction=0,axisLatch={x:0,y:0},padRaf=0,recipeWasPaused=false;
const gameplayPhases=new Set(['market','garden','bon']);
function $q(s){return document.querySelector(s)}
function phaseForScreen(id){return id==='market'?'market':id==='garden'?'garden':['bon','final'].includes(id)?'bon':null}
function onScreen(id){
  const current=phaseForScreen(id);document.querySelectorAll('[data-phase-node]').forEach(n=>{const p=n.dataset.phaseNode;const order={market:1,garden:2,bon:3};const cur=current?order[current]:0;n.classList.toggle('active',p===current);n.classList.toggle('done',cur&&order[p]<cur)});
  const labels={home:'LEVEL SELECT',recipeGenerator:'RECIPE GENERATOR',recipe:'RECIPE BRIEF',market:'MARKET MADNESS',garden:'INGREDIENT GARDEN',bon:'BON APPÉTIT',final:"ONYX'S VERDICT"};
  if($q('#gameStatus'))$q('#gameStatus').textContent=labels[id]||'READY';
}
async function toggleFullscreen(){try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen?.();else await document.exitFullscreen?.()}catch{}updateFullscreen()}
function updateFullscreen(){const b=$q('#fullBtn');if(b)b.querySelector('span').textContent=document.fullscreenElement?'Exit':'Full'}
function setPaused(v,{openDialog=true}={}){
  if(!window.FHM)return;FHM.S.paused=!!v;document.body.classList.toggle('game-paused',!!v);
  const d=$q('#pauseDialog');if(v&&openDialog&&!d.open)d.showModal();if(!v&&d.open)d.close();
  if($q('#gameStatus')&&v)$q('#gameStatus').textContent='PAUSED';
  if(!v)onScreen(FHM.S.phase);
}
function togglePause(){if(!window.FHM)return;setPaused(!FHM.S.paused)}
function keydown(e){
  const tag=e.target?.tagName;const openDialog=document.querySelector('dialog[open]');if(openDialog)return;if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;
  if(e.key==='p'||e.key==='P'){e.preventDefault();togglePause();return}
  if(e.key==='Escape'&&gameplayPhases.has(FHM?.S?.phase)){e.preventDefault();togglePause();return}
  if(e.key==='1'){e.preventDefault();window.OnyxBoosters?.open();return}
  if(e.key==='4'){e.preventDefault();openRecipe();return}
  if(e.key==='m'||e.key==='M'){e.preventDefault();toggleSound();return}
  if(e.key==='f'||e.key==='F'){e.preventDefault();toggleFullscreen();return}
}
function openRecipe(){if(!FHM?.S?.recipe)return;FHM.renderRecipeDialog?.();const d=$q('#recipeDialog');if(d&&!d.open){recipeWasPaused=!!FHM.S.paused;FHM.S.paused=true;d.showModal()}}
function closeRecipe(){const d=$q('#recipeDialog');if(d?.open)d.close();if(FHM)FHM.S.paused=recipeWasPaused}
function toggleSound(){if(!FHM)return;FHM.S.settings.soundEnabled=!FHM.S.settings.soundEnabled;FHM.applySettings?.()}
function currentFocusables(root=document){return [...root.querySelectorAll('button:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden&&el.offsetParent!==null)}
function moveFocus(delta,root=document){const a=currentFocusables(root);if(!a.length)return;let i=a.indexOf(document.activeElement);i=i<0?(delta>0?-1:0):i;a[(i+delta+a.length)%a.length]?.focus()}
function dispatchKey(key){let target=document.activeElement;if((!target||target===document.body)&&['market','garden'].includes(FHM?.S?.phase)){target=document.querySelector(`#${FHM.S.phase==='market'?'marketBoards':'gardenBoard'} .cell:not(.hole):not([disabled])`);target?.focus()}target=target&&target!==document.body?target:window;target.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true}));target.dispatchEvent(new KeyboardEvent('keyup',{key,bubbles:true}))}
function pollGamepad(t){
  const pads=navigator.getGamepads?.()||[];let p=gamepadIndex!=null?pads[gamepadIndex]:null;if(!p){p=[...pads].find(Boolean);gamepadIndex=p?.index??null}
  const status=$q('#inputStatus');if(p){if(status)status.textContent=`Controller: ${p.id.slice(0,28)} · Touch · Keyboard`;
    const modal=document.querySelector('dialog[open]');
    if(t-lastPadAction>230){const pressed=i=>!!p.buttons[i]?.pressed;
      if(modal){
        if(pressed(1)){if(modal.id==='pauseDialog')setPaused(false);else if(modal.id==='recipeDialog')closeRecipe();else if(modal.id==='boosterDialog')window.OnyxBoosters?.close();else modal.querySelector('#closeAccess')?.click();lastPadAction=t}
        else if(pressed(0)){const a=document.activeElement;if(a&&modal.contains(a)&&a.matches('button:not([disabled])'))a.click();else currentFocusables(modal)[0]?.focus();lastPadAction=t}
        else if(pressed(12)||pressed(14)){moveFocus(-1,modal);lastPadAction=t}
        else if(pressed(13)||pressed(15)){moveFocus(1,modal);lastPadAction=t}
      }else if(pressed(9)&&gameplayPhases.has(FHM?.S?.phase)){togglePause();lastPadAction=t}
      else if(pressed(3)&&gameplayPhases.has(FHM?.S?.phase)){window.OnyxBoosters?.open();lastPadAction=t}
      else if(pressed(2)){openRecipe();lastPadAction=t}
      else if(pressed(1)){if(gameplayPhases.has(FHM?.S?.phase))togglePause();lastPadAction=t}
      else if(pressed(0)){
        if(['market','garden','bon'].includes(FHM?.S?.phase))dispatchKey(' ');else{const a=document.activeElement;if(a?.matches?.('button:not([disabled])'))a.click();else currentFocusables($q(`#${FHM?.S?.phase||'home'}`)||document)[0]?.focus()}lastPadAction=t
      }
      else if(pressed(12)||pressed(14)){if(['market','garden'].includes(FHM?.S?.phase))dispatchKey(pressed(12)?'ArrowUp':'ArrowLeft');else moveFocus(-1,$q(`#${FHM?.S?.phase||'home'}`)||document);lastPadAction=t}
      else if(pressed(13)||pressed(15)){if(['market','garden'].includes(FHM?.S?.phase))dispatchKey(pressed(13)?'ArrowDown':'ArrowRight');else moveFocus(1,$q(`#${FHM?.S?.phase||'home'}`)||document);lastPadAction=t}
      else {const x=p.axes[0]||0,y=p.axes[1]||0,rx=p.axes[2]||0,ry=p.axes[3]||0;window.dispatchEvent(new CustomEvent('fhm:gamepad-axis',{detail:{lx:x,ly:y,rx,ry}}));const nx=Math.abs(x)>.65?Math.sign(x):0,ny=Math.abs(y)>.65?Math.sign(y):0;if(FHM?.S?.phase!=='bon'&&(nx!==axisLatch.x||ny!==axisLatch.y)){if(['market','garden'].includes(FHM?.S?.phase)){if(nx)dispatchKey(nx<0?'ArrowLeft':'ArrowRight');else if(ny)dispatchKey(ny<0?'ArrowUp':'ArrowDown')}else if(nx||ny)moveFocus(nx<0||ny<0?-1:1,$q(`#${FHM?.S?.phase||'home'}`)||document);if(nx||ny)lastPadAction=t}axisLatch={x:nx,y:ny}}
    }
  }else{if(status)status.textContent='Mouse · Touch · Keyboard · Controller';axisLatch={x:0,y:0}}
  padRaf=requestAnimationFrame(pollGamepad)
}
function init(){if(initialized)return;initialized=true;
  $q('#pauseBtn')?.addEventListener('click',togglePause);$q('#resumeBtn')?.addEventListener('click',()=>setPaused(false));$q('#pauseDialog')?.addEventListener('cancel',e=>{e.preventDefault();setPaused(false)});$q('#recipeDialog')?.addEventListener('cancel',e=>{e.preventDefault();closeRecipe()});$q('#fullBtn')?.addEventListener('click',toggleFullscreen);$q('#soundBtn')?.addEventListener('click',toggleSound);
  $q('#pauseRecipeBtn')?.addEventListener('click',()=>{setPaused(false,{openDialog:false});openRecipe()});
  $q('#pauseBoostBtn')?.addEventListener('click',()=>{setPaused(false,{openDialog:false});window.OnyxBoosters?.open()});
  $q('#pauseSoundBtn')?.addEventListener('click',toggleSound);$q('#pauseLevelsBtn')?.addEventListener('click',()=>{setPaused(false);FHM.renderLevels?.()});
  addEventListener('keydown',keydown,true);document.addEventListener('fullscreenchange',updateFullscreen);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&gameplayPhases.has(FHM?.S?.phase)&&!FHM.S.paused)setPaused(true)});
  ['#marketBoards','#gardenBoard','#bonCanvas','#joystick'].forEach(s=>$q(s)?.addEventListener('contextmenu',e=>e.preventDefault()));
  addEventListener('gamepadconnected',e=>{gamepadIndex=e.gamepad.index});addEventListener('gamepaddisconnected',e=>{if(gamepadIndex===e.gamepad.index)gamepadIndex=null});
  cancelAnimationFrame(padRaf);padRaf=requestAnimationFrame(pollGamepad);updateFullscreen();onScreen(FHM.S.phase)
}
window.GameShell={init,onScreen,toggleFullscreen,setPaused,togglePause,openRecipe,closeRecipe,toggleSound};
})();
