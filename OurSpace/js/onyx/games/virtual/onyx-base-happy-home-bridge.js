/* OurSpace Pass 31 — Onyx Pass 23 movement ↔ Happy Home native actor.
 * Movement source: original Pass23 engine. Art, personality, game state, backend:
 * pre-existing OurSpace runtime. Nothing here creates a second actor or backend.
 */
(function(root){'use strict';
 const VERSION='31.0';
 if(root.OnyxHappyHomeMotion?.version===VERSION)return;
 const motion=()=>root.OnyxBaseMotion?.version==='23.0'?root.OnyxBaseMotion:null;
 let nativeFrame=null,running=false,raf=0,lastTime=0,lastSync=0,lastAction='',activeDeadline=0;
 let roomSignature='',roomIdentity=null,listening=null;
 function findHost(){
  try{if(nativeFrame&&!nativeFrame.closed&&nativeFrame.OnyxImperialExpedition &&
   (nativeFrame.OnyxRoomSpatial||nativeFrame.HappyHomeOnyxSpatial))return nativeFrame;}catch(_){}
  nativeFrame=null;
  const seen=new Set();
  function search(win,depth){
   if(!win||depth>6||seen.has(win))return null;seen.add(win);
   try{
    if(win.OnyxImperialExpedition&&(win.OnyxRoomSpatial||win.HappyHomeOnyxSpatial)){
     nativeFrame=win;return win;
    }
    const iframes=win.document?.querySelectorAll('iframe')||[];
    for(const f of iframes){let sub;try{sub=f.contentWindow;}catch(_){}const found=search(sub,depth+1);if(found)return found;}
   }catch(_){}
   return null;
  }
  return search(root,0);
 }
 const native=()=>findHost()?.OnyxImperialExpedition;
 const room=()=>{const f=findHost();return f&&(f.OnyxRoomSpatial||f.HappyHomeOnyxSpatial);};
 function rectOf(f){
  const poly=f?.geometry?.type==='Polygon'?f.geometry.coordinates?.[0]:null;
  if(!Array.isArray(poly)||poly.length<3)return null;
  const xs=[],ys=[];for(const p of poly){if(Array.isArray(p)&&Number.isFinite(+p[0])&&Number.isFinite(+p[1])){xs.push(+p[0]);ys.push(+p[1]);}}
  if(xs.length<3)return null;
  const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
  return w>0&&h>0?{x,y,w,h}:null;
 }
 function refreshRoom(){
  const m=motion(),s=room();if(!m||!s)return {ok:false,reason:'room-or-motion-unavailable'};
  const obstacles=[];
  for(const feature of s.allFeatures?.()||[]){
   const p=feature?.properties||{},role=String(p.role||'').toLowerCase();
   if(role!=='placed-furniture'&&!(p.dynamic===true&&role.includes('furniture')))continue;
   // Small care objects remain walkable so a paw can reach their interaction point.
   if(['bowl','fountain','toy'].includes(String(p.interactiveType||'').toLowerCase()))continue;
   const rectangle=rectOf(feature);if(rectangle)obstacles.push({...rectangle,id:p.id||'',height:Number(p.collisionHeight)||96,platform:!!p.platform});
  }
  const signature=JSON.stringify(obstacles);
  if(signature===roomSignature&&roomIdentity===s){lastSync=performance.now();return {ok:true,unchanged:true};}
  roomSignature=signature;roomIdentity=s;
  const world=m.setWorld({width:s.W||1916,height:s.H||821,obstacles,
   canOccupy:(x,y,z)=>z>0||typeof s.canWalkPoint!=='function'||s.canWalkPoint(x,y)});
  lastSync=performance.now();
  return world?.ok===false?world:{ok:true,obstacles:obstacles.length};
 }
 function syncNativePosition(){
  const m=motion(),p=native()?.getState?.()?.cat,s=room();
  if(!m||!s||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
  const state=m.getState();if(state.job||state.command||state.navigation)return false;
  return m.setPosition(p.x*(s.W||1916),p.y*(s.H||821)).ok===true;
 }
 function syncMood(){
  const m=motion(),ns=native()?.getState?.();const current=ns?.currentMood||ns?.behavior;
  if(typeof current==='string')m?.setMood(current);
 }
 function applyNativePose(){
  const m=motion(),n=native(),spatial=room();if(!m||!n||!spatial)return;
  const s=m.getState();
  n.setCatPosition?.(s.x/(spatial.W||1916),s.y/(spatial.H||821));
  const name=s.job?.id||s.action;
  if(!name||name===lastAction)return;
  lastAction=name;
  const translation={jump_up:'jump',jump_down:'jump',jump_across:'jump',stretch:'stretchBow',
   curl_ball:'curlBall',lounge:'sit',loaf:'loaf',eat_drink:'interact',play_hunt:'primary'};
  const actionName=name.replace(/^onyx-base-/, '');
  if(actionName==='idle')return;
  n.performCatAction?.(translation[actionName]||actionName,{duration:s.job?.durationMs||480});
 }
 function frame(now){
  if(!running)return;
  const dt=lastTime?Math.min(.1,Math.max(0,(now-lastTime)/1000)):0;lastTime=now;
  if(now-lastSync>400)refreshRoom();
  const m=motion();if(!native()||!m){stop();return;}
  syncMood();const s=m.getState(),active=!!(s.job||s.command||s.navigation||s.moving);
  if(active){m.step(dt);applyNativePose();}
  else if(now>activeDeadline){syncNativePosition();lastAction='';}
  raf=root.requestAnimationFrame(frame);
 }
 function start(){
  if(running)return {ok:true,alreadyRunning:true};
  if(!motion())return {ok:false,reason:'pass23-not-loaded'};
  if(!native()||!room())return {ok:false,reason:'native-happy-home-not-ready'};
  refreshRoom();syncNativePosition();syncMood();
  listening=motion().on('action-end',()=>{lastAction='';});
  running=true;lastTime=0;raf=root.requestAnimationFrame(frame);return {ok:true};
 }
 function stop(){
  running=false;if(raf)root.cancelAnimationFrame(raf);raf=0;lastTime=0;
  listening?.();listening=null;
  motion()?.stop('happy-home-stopped');return {ok:true};
 }
 function begin(){activeDeadline=performance.now()+400;return start();}
 function jump(name,opts={}){
  const m=motion();if(!m)return {ok:false,reason:'motion-unavailable'};
  const kind=String(name||'jump_across').replace(/-/g,'_');const state=m.getState();
  const target=opts.to||((Number.isFinite(opts.x)&&Number.isFinite(opts.y))?{x:opts.x,y:opts.y,z:opts.z}:null);
  const normalized={...opts};if(target)normalized.to=target;
  if(!target&&(Number.isFinite(opts.dx)||Number.isFinite(opts.dy)))normalized.to={
   x:state.x+(Number(opts.dx)||0),y:state.y+(Number(opts.dy)||0),
   ...(Number.isFinite(opts.z)?{z:opts.z}:{})};
  if(kind==='jump_up')return m.jumpUp(normalized);
  if(kind==='jump_down')return m.jumpDown(normalized);
  return m.jumpAcross(normalized);
 }
 function interact(kind,target,opts={}){
  const m=motion(),seq=root.OnyxBaseSequences;if(!m)return {ok:false,reason:'motion-unavailable'};
  const k=String(kind||'').toLowerCase();
  if(k==='eat')return seq?.eatAt?.(target,opts)||m.eat({...opts,bowl:target});
  if(k==='drink')return seq?.drinkAt?.(target,opts)||m.drink({...opts,bowl:target});
  if(k==='toy')return seq?.playAt?.(target,opts)||m.playWithToy({...opts,target});
  if(k==='fish')return seq?.fishAt?.(target,opts)||m.huntFish({...opts,target});
  return {ok:false,reason:'unknown-interaction'};
 }
 const api={version:VERSION,start,stop,refreshRoom,refreshPosition:syncNativePosition,
  getState:()=>motion()?.getState(),getWorld:()=>motion()?.getWorld(),
  getStatus:()=>({active:running,rendererFound:!!native(),engineLoaded:!!motion(),roomFound:!!room(),backendModified:false}),
  // Never report a successful command when the source renderer/room is unavailable.
  // The authoritative native actor owns its game state and its drawn position.
  move(direction,pace='walk',opts={}){const ready=begin();if(!ready.ok)return ready;const m=motion();return pace==='run'?m?.run(direction,opts):m?.walk(direction,opts);},
  steer(x,y,pace='walk'){const ready=begin();if(!ready.ok)return ready;return motion()?.setInput(x,y,{pace})||{ok:false,reason:'motion-unavailable'};},
  navigate(x,y,pace='walk'){const ready=begin();if(!ready.ok)return ready;return motion()?.navigateTo(x,y,{pace})||{ok:false,reason:'motion-unavailable'};},
  jump(name,opts={}){const ready=begin();if(!ready.ok)return ready;return jump(name,opts);},
  action(name,opts={}){const ready=begin();if(!ready.ok)return ready;return motion()?.perform(name,opts)||{ok:false,reason:'motion-unavailable'};},
  interact(kind,target,opts={}){const ready=begin();if(!ready.ok)return ready;return interact(kind,target,opts);},
  setSmooth(value){return motion()?.setSteering({enabled:!!value})||{ok:false};},
  cancel(){activeDeadline=0;return motion()?.stop('cancelled');}};
 root.OnyxHappyHomeMotion=api;
 root.addEventListener?.('onyx-room-updated',refreshRoom);
 root.addEventListener?.('onyx-happy-home-room-updated',refreshRoom);
 root.addEventListener?.('onyx-happy-home-opened',start);
 root.addEventListener?.('onyx-happy-home-closed',stop);
 root.document?.addEventListener?.('load',ev=>{if(ev.target?.tagName==='IFRAME')start();},true);
 if(native()&&room())start();
 root.dispatchEvent?.(new CustomEvent('onyx-base-motion-ready',{detail:{version:VERSION,adapter:api}}));
})(typeof window!=='undefined'?window:globalThis);
