/* OurSpace Happy Home <> Onyx movement adapter, Pass 25.
   Existing Professor Onyx runtime owns the cat art, behavior, chat and persistence.
   This bridge ONLY controls voluntary Happy Home movement and collision. */
(function(root){
"use strict";
if(root.OnyxHappyHomeMotion?.version==="25.0")return;
const movement=()=>root.OnyxBaseMotion;
const room=()=>root.OnyxRoomSpatial||root.HappyHomeOnyxSpatial;
const native=()=>root.OnyxImperialExpedition;
const WIDTH=1916,HEIGHT=821;
let running=false,requested=0,raf=0,lastTime=0,lastSync=0,lastAction="",listening=null,worldSignature="";
function cat(){return native()?.getState?.()?.cat||null;}
function bounds(feature){
 const pts=feature?.geometry?.type==="Polygon"?feature.geometry.coordinates?.[0]:null;
 if(!Array.isArray(pts)||pts.length<3)return null;
 const valid=pts.filter(p=>Array.isArray(p)&&Number.isFinite(p[0])&&Number.isFinite(p[1]));
 if(valid.length<3)return null;
 const xs=valid.map(p=>p[0]),ys=valid.map(p=>p[1]);
 const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
 return w>0&&h>0?{x,y,w,h}:null;
}
function syncRoom(){
 const motion=movement();if(!motion)return {ok:false,error:"Onyx movement runtime unavailable"};
 const features=room()?.allFeatures?.()||[];
 const obstacles=[];
 for(const f of features){
  const p=f?.properties||{},role=String(p.role||"").toLowerCase();
  if(role!=="placed-furniture"&&!(p.dynamic===true&&role.includes("furniture")))continue;
  const box=bounds(f);if(box)obstacles.push({...box,id:p.id||"",height:Number.isFinite(+p.collisionHeight)?+p.collisionHeight:96});
 }
 // Use the existing spatial room boundary if it is defined.
 const spatial=room();
 const sig=JSON.stringify(obstacles);
 if(sig===worldSignature){lastSync=performance.now();return {ok:true,unchanged:true};}
 worldSignature=sig;
 const canOccupy=(x,y,z)=>(
   typeof spatial?.canWalkPoint!=="function"||z>0||spatial.canWalkPoint(x,y)
 );
 lastSync=performance.now();
 return motion.setWorld({width:WIDTH,height:HEIGHT,obstacles,canOccupy});
}
function syncPosition(){
 const p=cat(),motion=movement();
 if(!motion||!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
 const state=motion.getState();
 if(state.job||state.command||state.nav)return false;
 return motion.setPosition(p.x*WIDTH,p.y*HEIGHT).ok;
}
function syncMood(){
 const mood=native()?.getState?.()?.behavior;
 if(mood&&movement()?.profiles[mood])movement().setMood(mood);
}
function syncNative(){
 const m=movement(),a=native();if(!m||!a)return;
 const s=m.getState();
 a.setCatPosition?.(s.x/WIDTH,s.y/HEIGHT);
 let action=s.job?.name||s.job?.kind||(s.nav||s.command?s.pace:s.action);
 const table={jump_up:"jump",jump_down:"jump",jump_across:"jump",stretch:"stretchBow",
   loaf:"loaf",lounge:"sit",curl_ball:"curlBall",eat_drink:"interact",sleep:"sleep",play_hunt:"primary"};
 if(action===lastAction||action==="idle")return;
 lastAction=action;
 a.performCatAction?.(table[action]||action,{
  duration:s.job?.durationMs||450,hold:!!s.job?.hold});
}
function tick(now){
 if(!running)return;
 const dt=lastTime?Math.min(.1,Math.max(0,(now-lastTime)/1000)):0;lastTime=now;
 if(now-lastSync>500)syncRoom();
 syncMood();
 const m=movement(),s=m?.getState();
 const active=!!(s?.job||s?.nav||s?.command);
 if(m&&active){m.step(dt);syncNative();}
 else if(now>requested){syncPosition();lastAction="";}
 raf=requestAnimationFrame(tick);
}
function request(){
 requested=performance.now()+500;
 if(!running)start();
}
function start(){
 if(running)return {ok:true,alreadyRunning:true};
 if(!movement())return {ok:false,error:"Onyx movement runtime unavailable"};
 if(!native())return {ok:false,error:"Happy Home cat renderer unavailable"};
 syncRoom();syncPosition();syncMood();
 listening=movement().on("action-complete",()=>{lastAction="";});
 running=true;lastTime=0;raf=requestAnimationFrame(tick);return {ok:true};
}
function stop(){
 running=false;cancelAnimationFrame(raf);raf=0;lastTime=0;listening?.();listening=null;
 movement()?.stop();return {ok:true};
}
const api={
 version:"25.0",start,stop,refreshRoom:syncRoom,refreshPosition:syncPosition,
 getState:()=>movement()?.getState(),getWorld:()=>movement()?.getWorld(),
 move(direction,pace="walk"){request();return movement()?.walk(direction,pace)||{ok:false};},
 steer(x,y,pace="walk"){request();return movement()?.steer(x,y,pace)||{ok:false};},
 navigate(x,y,pace="walk"){request();return movement()?.navigateTo(x,y,pace)||{ok:false};},
 jump(kind,target={}){request();return movement()?.jump(kind,target)||{ok:false};},
 action(name,options={}){request();return movement()?.perform(name,options)||{ok:false};},
 interact(kind,target,options={}){request();return movement()?.interact(kind,target,options)||{ok:false};},
 setSmooth:v=>movement()?.setSmooth(v),
 cancel:()=>{requested=0;return movement()?.stop();}
};
root.OnyxHappyHomeMotion=api;
root.addEventListener?.("onyx-room-updated",syncRoom);
root.addEventListener?.("onyx-happy-home-room-updated",syncRoom);
root.addEventListener?.("onyx-happy-home-opened",start);
root.addEventListener?.("onyx-happy-home-closed",stop);
// Lazy activation: do not start an extra rAF if the native Happy Home has not loaded.
if(native()&&room())start();
root.dispatchEvent?.(new CustomEvent("onyx-base-motion-ready",{detail:{version:api.version,adapter:api}}));
})(typeof window!=="undefined"?window:globalThis);
