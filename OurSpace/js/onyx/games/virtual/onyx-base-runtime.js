/* Onyx Movement Pass 25 | independent, browser-native movement engine.
   No backend access; original Onyx art and existing Happy Home state stay authoritative. */
(function(root){
"use strict";
if(root.OnyxBaseMotion && root.OnyxBaseMotion.version==="25.0")return;
const SQRT2=Math.SQRT1_2, EPS=1e-5, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dirs={
 north:[0,-1],north_east:[SQRT2,-SQRT2],east:[1,0],south_east:[SQRT2,SQRT2],
 south:[0,1],south_west:[-SQRT2,SQRT2],west:[-1,0],north_west:[-SQRT2,-SQRT2]
};
const VALID_ACT=new Set(["stretch","loaf","lounge","curl_ball","eat_drink","sleep","play_hunt"]);
const PROFILES={
 base_cat:{walk:520,run:390,idle:2500},caring:{walk:520,run:390,idle:2500},
 hungry:{walk:440,run:340,idle:1650},judgmental:{walk:560,run:410,idle:2850},
 listening:{walk:500,run:370,idle:2350},purring:{walk:590,run:430,idle:3100},
 sleepy:{walk:690,run:520,idle:3900},snuggly:{walk:630,run:470,idle:3450},
 thinking:{walk:560,run:420,idle:3000},thoughtful:{walk:540,run:400,idle:2800}
};
const world={width:1916,height:821,obstacles:[],platforms:[],revision:0,canOccupy:null};
const actor={x:640,y:650,z:0,floor:0,dir:"south_east",pace:"walk",mood:"base_cat",
 vx:0,vy:0,phase:0,travel:0,action:"idle",elapsed:0,command:null,nav:null,job:null,
 smooth:true,walkSpeed:95,runSpeed:180,radius:12,error:null,frames:0};
const events=new Map();
let nextToken=1;
const point=p=>p&&Number.isFinite(+p.x)&&Number.isFinite(+p.y);
const rect=r=>r&&["x","y","w","h"].every(k=>Number.isFinite(+r[k]))&&r.w>0&&r.h>0;
const copy=o=>JSON.parse(JSON.stringify(o));
function emit(type,info){try{(events.get(type)||[]).forEach(fn=>fn(info));}catch(e){console.warn("[Onyx motion callback]",e);}}
function on(type,fn){if(typeof fn!=="function")return()=>{};const a=events.get(type)||[];a.push(fn);events.set(type,a);return()=>{const b=events.get(type)||[];const i=b.indexOf(fn);if(i>=0)b.splice(i,1);};}
function hitRect(x,y,r,pad=actor.radius){return x>=r.x-pad&&x<=r.x+r.w+pad&&y>=r.y-pad&&y<=r.y+r.h+pad;}
function supported(x,y,floor=0){
 if(x<actor.radius||y<actor.radius||x>world.width-actor.radius||y>world.height-actor.radius)return false;
 if(floor===0)return true;
 return world.platforms.some(p=>
  (p.z??0)===floor&&x>=p.x+actor.radius&&x<=p.x+p.w-actor.radius&&y>=p.y+actor.radius&&y<=p.y+p.h-actor.radius
 );
}
function accessible(x,y,z=actor.floor,ignore=null,requireSupport=true){
 if(!Number.isFinite(x)||!Number.isFinite(y))return false;
 if(requireSupport&&!supported(x,y,z))return false;
 if(!requireSupport&&(x<actor.radius||y<actor.radius||x>world.width-actor.radius||y>world.height-actor.radius))return false;
 for(const b of world.obstacles){if(b!==ignore&&hitRect(x,y,b)&&z<(b.height??100))return false;}
 if(typeof world.canOccupy==="function"){try{if(!world.canOccupy(x,y,z))return false;}catch(e){return false;}}
 return true;
}
function lineClear(a,b,z=actor.floor){
 const dist=Math.hypot(b.x-a.x,b.y-a.y),n=Math.max(1,Math.ceil(dist/5));
 for(let i=1;i<=n;i++){const t=i/n;if(!accessible(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,z))return false;}
 return true;
}
function direction(x,y,previous=actor.dir){
 if(Math.hypot(x,y)<EPS)return previous;
 const angle=(Math.atan2(y,x)*180/Math.PI+360)%360;
 const ids=["east","south_east","south","south_west","west","north_west","north","north_east"];
 return ids[Math.round(angle/45)%8];
}
function normalize(x,y){const d=Math.hypot(x,y);return d>EPS?{x:x/d,y:y/d}:{x:0,y:0};}
function clearMove(){
 actor.command=null;actor.nav=null;actor.vx=actor.vy=0;
}
function groundRecovery(){
 const {x,y,floor}=actor;
 if(accessible(x,y,floor)){actor.z=floor;return true;}
 for(let r=4;r<=160;r+=4)for(let i=0;i<24;i++){
  const a=(i/24)*Math.PI*2,nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;
  if(accessible(nx,ny,floor)){actor.x=nx;actor.y=ny;actor.z=floor;return true;}
 }
 actor.z=floor;actor.error="No safe landing found";return false;
}
function cancel(reason="cancelled"){
 const old=actor.job;
 if(old?.type==="jump")groundRecovery();
 actor.job=null;clearMove();actor.action="idle";actor.elapsed=0;
 if(old)emit("action-cancelled",{id:old.id,reason});
 return {ok:true};
}
function setWorld(options={}){
 if(options.width!==undefined&&(!Number.isFinite(options.width)||options.width<=40))return {ok:false,error:"invalid width"};
 if(options.height!==undefined&&(!Number.isFinite(options.height)||options.height<=40))return {ok:false,error:"invalid height"};
 if(options.width!==undefined)world.width=options.width;
 if(options.height!==undefined)world.height=options.height;
 if(Array.isArray(options.obstacles))world.obstacles=options.obstacles.filter(rect).map(r=>({...r,height:Number.isFinite(r.height)?r.height:100}));
 if(Array.isArray(options.platforms))world.platforms=options.platforms.filter(rect).map(r=>({...r,z:Number.isFinite(r.z)?r.z:0}));
 if(Array.isArray(options.platforms)&&world.platforms.length===0&&actor.floor!==0&&!actor.job){
  actor.floor=0;actor.z=0;
 }
 if(Object.hasOwn(options,"canOccupy"))world.canOccupy=typeof options.canOccupy==="function"?options.canOccupy:null;
 world.revision++;return {ok:true,revision:world.revision};
}
function setPosition(x,y,floor=actor.floor){
 if(!accessible(x,y,floor))return {ok:false,error:"blocked or unsupported location"};
 cancel("position sync");actor.x=x;actor.y=y;actor.floor=floor;actor.z=floor;return {ok:true};
}
function setMood(name){if(!PROFILES[name])return {ok:false,error:"unknown mood"};actor.mood=name;return {ok:true};}
function steer(dx,dy,pace="walk",options={}){
 if(actor.job?.type==="jump")return {ok:false,error:"jump in progress"};
 if(!Number.isFinite(dx)||!Number.isFinite(dy))return {ok:false,error:"invalid direction"};
 if(actor.job)cancel("manual takeover");
 actor.nav=null;const v=normalize(dx,dy);
 actor.command=(v.x||v.y)?{x:v.x,y:v.y,pace:pace==="run"?"run":"walk",kind:"manual"}:null;
 actor.pace=pace==="run"?"run":"walk";if(v.x||v.y)actor.dir=direction(v.x,v.y);
 if(options.smooth!==undefined)actor.smooth=!!options.smooth;
 return {ok:true};
}
function walk(dir,pace="walk"){const v=dirs[dir];return v?steer(v[0],v[1],pace):{ok:false,error:"invalid direction"};}
function canCut(a,b){return lineClear(a,b);}
function route(target){
 const size=28,startX=Math.round(actor.x/size),startY=Math.round(actor.y/size),endX=Math.round(target.x/size),endY=Math.round(target.y/size);
 const key=(x,y)=>x+","+y, start=key(startX,startY), goal=key(endX,endY);
 const queue=[{x:startX,y:startY}],parent=new Map([[start,null]]),limits=1800;
 let i=0,found=null;
 while(i<queue.length&&i<limits){
  const a=queue[i++],ak=key(a.x,a.y);
  if(ak===goal||Math.hypot(a.x*size-target.x,a.y*size-target.y)<size){found=ak;break;}
  for(const [dx,dy] of Object.values(dirs)){
   const x=a.x+Math.round(dx*2),y=a.y+Math.round(dy*2),k=key(x,y);
   if(parent.has(k))continue;
   const nx=x*size,ny=y*size;
   if(!accessible(nx,ny)||!canCut({x:a.x*size,y:a.y*size},{x:nx,y:ny}))continue;
   parent.set(k,ak);queue.push({x,y});
  }
 }
 if(!found)return null;
 const nodes=[];for(let k=found;k&&k!==start;k=parent.get(k)){const [x,y]=k.split(",").map(Number);nodes.push({x:x*size,y:y*size});}
 nodes.reverse();
 if(lineClear(nodes.length?nodes[nodes.length-1]:{x:actor.x,y:actor.y},target))nodes.push({x:target.x,y:target.y});
 return nodes;
}
function navigateTo(x,y,pace="walk"){
 if(actor.job?.type==="jump")return {ok:false,error:"jump in progress"};
 if(!point({x,y})||!accessible(x,y))return {ok:false,error:"invalid destination"};
 cancel("new navigation");
 const path=route({x,y});if(!path)return {ok:false,error:"no route"};
 actor.nav={path,index:0,target:{x,y},pace:pace==="run"?"run":"walk",replans:0,revision:world.revision};
 actor.action="walk";return {ok:true,waypoints:path.length};
}
function jump(kind,target={}){
 if(actor.job?.type==="jump")return {ok:false,error:"jump in progress"};
 const dx=Number.isFinite(target.dx)?target.dx:dirs[actor.dir]?.[0]*80||0;
 const dy=Number.isFinite(target.dy)?target.dy:dirs[actor.dir]?.[1]*80||0;
 const end={x:Number.isFinite(target.x)?target.x:actor.x+dx,y:Number.isFinite(target.y)?target.y:actor.y+dy};
 const landingFloor=Number.isFinite(target.floor)?target.floor:
   Math.max(0,actor.floor+((kind==="jump_up"&&world.platforms.length)?48:kind==="jump_down"?-48:0));
 if(!accessible(end.x,end.y,landingFloor))return {ok:false,error:"unsafe landing"};
 const height=Math.max(48,Number.isFinite(target.apex)?target.apex:84);
 let clear=true;const n=Math.max(4,Math.ceil(Math.hypot(end.x-actor.x,end.y-actor.y)/8));
 for(let i=1;i<=n;i++){
  const t=i/n,x=actor.x+(end.x-actor.x)*t,y=actor.y+(end.y-actor.y)*t;
  const z=actor.floor+(landingFloor-actor.floor)*t+4*height*t*(1-t);
  if(!accessible(x,y,z,null,false)){clear=false;break;}
 }
 if(!clear)return {ok:false,error:"jump corridor blocked"};
 cancel("new jump");
 const job={type:"jump",id:nextToken++,kind,start:{x:actor.x,y:actor.y,z:actor.floor},
  end,floor:landingFloor,apex:height,durationMs:Math.max(300,Number.isFinite(target.durationMs)?target.durationMs:610),ms:0};
 actor.job=job;actor.action="jump";actor.dir=direction(end.x-actor.x,end.y-actor.y);
 emit("action-start",{id:job.id,type:job.type,kind});return {ok:true,id:job.id};
}
function perform(name,opts={}){
 if(!VALID_ACT.has(name))return {ok:false,error:"invalid action"};
 if(actor.job?.type==="jump")return {ok:false,error:"jump in progress"};
 cancel("new action");
 const duration=clamp(Number.isFinite(opts.durationMs)?opts.durationMs:1800,100,600000);
 actor.job={type:"action",name,id:nextToken++,ms:0,durationMs:duration,hold:!!opts.hold,target:opts.target||null};
 actor.action=name;actor.elapsed=0;emit("action-start",{id:actor.job.id,name});
 return {ok:true,id:actor.job.id};
}
function targetPoint(t){if(typeof t==="function"){try{t=t();}catch(_){return null;}}return point(t)?{x:+t.x,y:+t.y}:null;}
function interact(kind,target,opts={}){
 if(!["eat","drink","toy","fish"].includes(kind))return {ok:false,error:"invalid interaction"};
 if(actor.job?.type==="jump")return {ok:false,error:"jump in progress"};
 const t=targetPoint(target);if(!t)return {ok:false,error:"invalid target"};
 const maxRange=kind==="eat"||kind==="drink"?36:46;
 if(Math.hypot(t.x-actor.x,t.y-actor.y)<=maxRange&&lineClear({x:actor.x,y:actor.y},t))
  return perform(kind==="eat"||kind==="drink"?"eat_drink":"play_hunt",{durationMs:opts.durationMs||2500,hold:!!opts.hold,target:{type:kind,ref:target,range:maxRange}});
 const theta=Math.atan2(actor.y-t.y,actor.x-t.x),offset=maxRange*.75;
 const approach={x:t.x+Math.cos(theta)*offset,y:t.y+Math.sin(theta)*offset};
 let nav=navigateTo(approach.x,approach.y,opts.pace||"walk");
 if(nav.ok)actor.nav.interaction={kind,target,opts,range:maxRange};
 return nav;
}
function integrate(dt){
 let goal=actor.command;
 if(actor.nav){
  const nav=actor.nav;
  if(nav.revision!==world.revision){const p=route(nav.target);nav.path=p||[];nav.index=0;nav.revision=world.revision;}
  if(nav.index>=nav.path.length){
   const pending=nav.interaction;actor.nav=null;actor.command=null;actor.vx=actor.vy=0;
   if(pending){const t=targetPoint(pending.target);
    if(t&&Math.hypot(t.x-actor.x,t.y-actor.y)<=pending.range&&lineClear({x:actor.x,y:actor.y},t))
      perform(["eat","drink"].includes(pending.kind)?"eat_drink":"play_hunt",
       {durationMs:pending.opts?.durationMs||2400,hold:!!pending.opts?.hold,target:{type:pending.kind,ref:pending.target,range:pending.range}});
   }
   return;
  }
  const p=nav.path[nav.index],d=Math.hypot(p.x-actor.x,p.y-actor.y);
  if(d<Math.max(2.5,actor.walkSpeed*dt*1.2)){nav.index++;return;}
  const v=normalize(p.x-actor.x,p.y-actor.y);
  goal={...v,pace:nav.pace,kind:"navigation"};
 }
 if(!goal){actor.vx=actor.vy=0;actor.action="idle";return;}
 const speed=goal.pace==="run"?actor.runSpeed:actor.walkSpeed;
 const n=normalize(goal.x,goal.y);
 const accel=actor.smooth?clamp(11*dt,0,1):1;
 actor.vx+=(n.x*speed-actor.vx)*accel;actor.vy+=(n.y*speed-actor.vy)*accel;
 const distance=Math.hypot(actor.vx*dt,actor.vy*dt),steps=Math.max(1,Math.ceil(distance/4));
 let moved=0;
 for(let i=0;i<steps;i++){
  let dx=actor.vx*dt/steps,dy=actor.vy*dt/steps,nx=actor.x+dx,ny=actor.y+dy;
  if(accessible(nx,ny)){actor.x=nx;actor.y=ny;moved+=Math.hypot(dx,dy);}
  else if(accessible(nx,actor.y)){actor.x=nx;moved+=Math.abs(dx);}
  else if(accessible(actor.x,ny)){actor.y=ny;moved+=Math.abs(dy);}
  else {actor.vx=actor.vy=0;break;}
 }
 if(moved>EPS){
  actor.pace=goal.pace;actor.dir=direction(actor.vx,actor.vy);
  actor.action=goal.pace;actor.travel+=moved;
  const cycle=PROFILES[actor.mood]?.[goal.pace]||520;
  actor.phase=(actor.phase+moved/Math.max(1,speed*cycle/1000))%1;
  emit("step",{x:actor.x,y:actor.y,dir:actor.dir,phase:actor.phase,pace:actor.pace});
 }else if(actor.nav){
  const nav=actor.nav;
  if(nav.replans++<3){nav.revision=-1;}else{actor.nav=null;actor.error="route blocked";emit("navigation-blocked",{x:actor.x,y:actor.y});}
 }
}
function jobTick(ms){
 const job=actor.job;if(!job)return;
 job.ms+=ms;const t=clamp(job.ms/job.durationMs,0,1);
 if(job.type==="jump"){
  const x=job.start.x+(job.end.x-job.start.x)*t,y=job.start.y+(job.end.y-job.start.y)*t;
  const z=job.start.z+(job.floor-job.start.z)*t+4*job.apex*t*(1-t);
  if(!accessible(x,y,z,null,t>=1)){actor.error="jump obstructed";groundRecovery();actor.job=null;actor.action="idle";emit("action-cancelled",{id:job.id,reason:"blocked during flight"});return;}
  actor.x=x;actor.y=y;actor.z=z;actor.action="jump";
  if(t>=1){actor.z=actor.floor=job.floor;actor.job=null;actor.action="idle";emit("action-complete",{id:job.id,kind:job.kind});}
  return;
 }
 const watch=job.target;
 if(watch){
  const p=targetPoint(watch.ref);
  const dist=p?Math.hypot(p.x-actor.x,p.y-actor.y):Infinity;
  if(!p||dist>watch.range||!lineClear({x:actor.x,y:actor.y},p)){
   actor.job=null;actor.action="idle";emit("action-cancelled",{id:job.id,reason:"target moved or blocked"});return;
  }
 }
 actor.elapsed=job.ms;
 if(t>=1){
  if(job.hold){job.ms=0;actor.elapsed=0;}
  else{actor.job=null;actor.action="idle";emit("action-complete",{id:job.id,name:job.name});}
 }
}
function step(deltaSeconds){
 if(!Number.isFinite(deltaSeconds)||deltaSeconds<0)return {ok:false,error:"invalid time"};
 let left=Math.min(deltaSeconds,.35);
 while(left>1e-8){const dt=Math.min(left,1/60);if(actor.job)jobTick(dt*1000);else integrate(dt);left-=dt;actor.frames++;}
 return {ok:true,x:actor.x,y:actor.y,z:actor.z,action:actor.action};
}
function getState(){return copy({...actor,command:actor.command,nav:actor.nav,job:actor.job});}
function getWorld(){return {...world,obstacles:copy(world.obstacles),platforms:copy(world.platforms),canOccupy:!!world.canOccupy};}
function stop(){return cancel("stop");}
function setSmooth(v){actor.smooth=!!v;return {ok:true};}
root.OnyxBaseActions=root.OnyxBaseActions||{};
root.OnyxBaseMotion={version:"25.0",directions:copy(dirs),profiles:copy(PROFILES),getState,getWorld,
 setWorld,setPosition,setMood,steer,move:steer,walk,navigateTo,jump,perform,interact,stop,cancel,
 step,on,lineClear,accessible,setSmooth,handleAction:(id,opts={})=>(root.OnyxBaseActions[id]||(()=>({ok:false,error:"unknown module"})))(opts)};
})(typeof window!=="undefined"?window:globalThis);
