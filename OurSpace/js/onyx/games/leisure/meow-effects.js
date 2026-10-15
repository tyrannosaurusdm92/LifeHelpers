/* Arcade word FX & Onyx bubble visits. Visual overlays never capture input,
   idling never takes moves, targets or score, and never runs during pause. */
(()=>{'use strict';
 const stage=document.getElementById('gameViewport'),dock=document.getElementById('onyxBoosterDock');
 const bubble=document.getElementById('onyxBoosterBubble');
 const wordBank={market:['FRESH FETCH!','PAW-SOME PICK!','MEAT & VEGGIE MAYHEM!'],garden:['PANTRY POWER!','SAUCE-TASTIC!','SPICE SURPRISE!'],bon:['YUM!','IMPERIAL CUISINE!','CHEF ONYX!'],booster:['PAW POWER!','IMPERIAL BLESSING!'],recipe:['RECIPE ROYALE!']};
 const overlay=document.createElement('div');overlay.className='meow-effects-layer';overlay.setAttribute('aria-hidden','true');document.body.append(overlay);
 let lastWord=0,idleInterval=null,lastActivity=performance.now(),lastSnack=0,nibble=null,activeFlights=0;
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function word(message,context='market'){
  if(reduced())return;
  const now=performance.now();if(now-lastWord<480)return;lastWord=now;
  const pool=wordBank[context]||wordBank.market;
  const text=message||pool[Math.floor(Math.random()*pool.length)];
  const r=stage?.getBoundingClientRect();if(!r)return;
  const el=document.createElement('div');el.className='meow-word-pop';el.dataset.context=context;el.textContent=text;
  el.style.left=Math.max(6,r.left+r.width*(.34+Math.random()*.3))+'px';
  el.style.top=Math.max(70,r.top+r.height*(.28+Math.random()*.18))+'px';
  overlay.append(el);
  el.animate([{opacity:0,transform:'translate(-50%,25px) scale(.72)'},{opacity:1,transform:'translate(-50%,-12px) scale(1.1)',offset:.35},{opacity:0,transform:'translate(-50%,-95px) scale(1)'}],{duration:1250,easing:'ease-out'}).finished.catch(()=>{}).finally(()=>el.remove());
 }
 function coords(target){const sr=stage.getBoundingClientRect();const tr=target?.getBoundingClientRect?.()||sr;return {x:tr.left+tr.width/2,y:tr.top+tr.height/2}}
 async function travel({mood='hungry',target,words=[],onArrive=()=>{}}={}){
  if(activeFlights>0){try{onArrive()}catch(e){console.error(e)};return}
  activeFlights++;
  const sr=stage.getBoundingClientRect(),dr=dock?.getBoundingClientRect();
  const start=(dr?.width&&dr?.height)?{x:dr.left+dr.width/2,y:dr.top+dr.height/2}:{x:sr.left+sr.width*.92,y:sr.top+sr.height*.18};
  const end=coords(target),size=Math.max(62,Math.min(96,innerWidth*.095));
  const actor=document.createElement('div');actor.className='meow-onyx-flying-bubble';actor.style.width=size+'px';actor.style.height=size+'px';actor.style.left=(start.x-size/2)+'px';actor.style.top=(start.y-size/2)+'px';
  const portrait=document.createElement('img');portrait.alt='';portrait.src='assets/images/games/leisure/Bon-Appetit/onyx_'+(['hungry','purring','judgmental'].includes(mood)?mood:'hungry')+'_MEOW.svg';
  actor.append(portrait);overlay.append(actor);
  const originalOpacity=dock?.style.opacity||'';if(dock&&!dock.hidden)dock.style.opacity='0';
  const dx=end.x-start.x,dy=end.y-start.y,duration=reduced()?50:Math.max(380,Math.min(840,Math.hypot(dx,dy)*1.25));
  let arrived=false;const arriveOnce=()=>{if(arrived)return;arrived=true;try{onArrive()}catch(e){console.error('Onyx visit:',e)}};
  try{
   await actor.animate([{transform:'translate(0,0) scale(.8)'},{transform:`translate(${dx*.52}px,${dy*.52-35}px) scale(1.18)`,offset:.56},{transform:`translate(${dx}px,${dy}px) scale(1)`}],{duration,easing:'ease-in-out',fill:'forwards'}).finished;
   actor.classList.add('meow-onyx-bite');
   arriveOnce();
   if(words.length)word(words[Math.floor(Math.random()*words.length)],mood==='hungry'?'market':'booster');
   await new Promise(resolve=>setTimeout(resolve,reduced()?40:550));
   await actor.animate([{transform:`translate(${dx}px,${dy}px) scale(1)`},{transform:'translate(0,0) scale(.8)'}],{duration:reduced()?60:440,easing:'ease-in',fill:'forwards'}).finished;
  }catch(e){arriveOnce()}
  finally{actor.remove();if(dock)dock.style.opacity=originalOpacity;activeFlights--}
 }
 function reset(){lastActivity=performance.now()}
 window.addEventListener('pointerdown',reset,{passive:true,capture:true});
 window.addEventListener('keydown',reset,{passive:true,capture:true});
 window.addEventListener('meow:shell',e=>{if(['action','move','rotate','board-gesture','pause'].includes(e.detail?.type))reset()});
 function stopIdle(){if(idleInterval!==null){clearInterval(idleInterval);idleInterval=null}nibble=null}
 function startIdle(callback){stopIdle();nibble=callback;reset();idleInterval=setInterval(()=>{
  if(document.hidden||!document.getElementById('onyxIdleSnacks')?.checked||!stage||!nibble||window.gameShell?.paused||activeFlights||performance.now()-lastActivity<27000||performance.now()-lastSnack<45000)return;
  reset();lastSnack=performance.now();nibble();
 },1000)}
 document.addEventListener('visibilitychange',reset);
 window.addEventListener('bon-appetit:yum-correct',()=>word('YUM!','bon'));
 window.addEventListener('bon-appetit:yuck-correct',()=>word('VOID REJECTED!','bon'));
 window.addEventListener('bon-appetit:pan-correct',()=>word('PAN-TASTIC!','bon'));
 window.addEventListener('bon-appetit:bowl-correct',()=>word('ROYAL MIX!','bon'));
 window.addEventListener('bon-appetit:pot-correct',()=>word('POT LUCK!','bon'));
 window.addEventListener('bon-appetit:heat-completed',()=>word('HOT STUFF!','bon'));
 window.addEventListener('bon-appetit:flavor-correct',()=>word('SPICE SUPREME!','bon'));
 window.addEventListener('ingredient-garden:ingredient-collected',()=>word(null,'garden'));
 window.MEOWFX={word,travel,startIdle,stopIdle,reset};
})();
