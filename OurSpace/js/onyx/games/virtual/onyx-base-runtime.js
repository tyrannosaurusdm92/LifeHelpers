/* Onyx Base Motion Pass23. Original game-independent action controller.
 * Load physics.js, sprites.js, this runtime, then 18 onyx-base-*.js.
 * No game loop, image URL or input handler is installed until attachCanvas()/start().
 */
(function(root){'use strict';
 if(root.OnyxBaseMotion&&root.OnyxBaseMotion.version==='23.0')return;
 const P=root.OnyxBasePhysics,S=root.OnyxBaseSprites,G=root.OnyxBaseGait;
 if(!P||!S)throw Error('Load onyx-base-physics.js and onyx-base-sprites.js before onyx-base-runtime.js');
 const registry=new Map(), aliases=new Map(), listeners=new Map();
 const dirs=S.DIRS, headingVectors={east:[1,0],south_east:[1,1],south:[0,1],south_west:[-1,1],west:[-1,0],north_west:[-1,-1],north:[0,-1],north_east:[1,-1]};
 let state={x:440,y:345,z:0,direction:'east',lastSide:'right',pace:'walk',action:'idle',phase:0,travel:0,gaitTravel:0,gaitStride:0,moving:false,inputX:0,inputY:0,elapsedMs:0,job:null,command:null,lastResult:null};
 let world={width:960,height:560,obstacles:[],canOccupy:null},sprites=null,canvas=null,ctx=null;
 let nav=null;
 // Optional buffered steering: direction changes are smooth, but by default the
 // legacy immediate-response controls remain completely unchanged.
 let steering={enabled:false,acceleration:4.5,braking:7.5,actualX:0,actualY:0};
 function clearSteering(){steering.actualX=0;steering.actualY=0;}
 function setSteering(options={}){
  if(typeof options.enabled==='boolean')steering.enabled=options.enabled;
  for(const k of ['acceleration','braking'])if(Object.hasOwn(options,k)){
   if(!Number.isFinite(options[k])||options[k]<=0)return {ok:false,reason:'invalid-steering-'+k};
   steering[k]=Math.min(100,Math.max(.1,options[k]));
  }
  if(!steering.enabled)clearSteering();
  return getSteering();
 }
 function getSteering(){return {...steering};}
 function steerStep(dt){
  const tx=state.inputX,ty=state.inputY,mag=Math.hypot(tx,ty);
  const rate=mag?steering.acceleration:steering.braking;
  const dx=tx-steering.actualX,dy=ty-steering.actualY,dist=Math.hypot(dx,dy),amount=Math.min(dist,rate*dt);
  if(dist>1e-9){steering.actualX+=dx/dist*amount;steering.actualY+=dy/dist*amount;}
  if(Math.hypot(steering.actualX,steering.actualY)<1e-4)clearSteering();
  const speedFraction=Math.min(1,Math.hypot(steering.actualX,steering.actualY));
  if(speedFraction>1e-4)stepMovement(steering.actualX,steering.actualY,dt*speedFraction,state.pace);
  else {state.moving=false;state.phase=0;}
 }
 let animating=false,raf=0,lastT=0,now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
 const moodProfiles=root.OnyxBaseProfiles||{base_cat:{idle:2500,walk:520,run:390,weights:{idle:[7,1,8,1,9]}}};
 let mood='base_cat',auto={enabled:false,seed:73429,mode:'idle',timeMs:0,direction:'east',minIdleMs:700,maxIdleMs:2000,minWalkMs:700,maxWalkMs:2400,pace:'walk'};
 const random=()=>{auto.seed=(Math.imul(auto.seed,1664525)+1013904223)>>>0;return auto.seed/4294967296;};
 function setMood(v){if(!moodProfiles[v])return false;mood=v;const profile=moodProfiles[v],speed=state.pace==='run'?255:108;rebaseGait(Math.max(4,speed*(profile?.[state.pace]||520)/1000));emit('mood',{name:v,profile:moodProfiles[v]});return true;}
 function getMood(){return mood;}
 function setWander(options={}){if(typeof options.enabled==='boolean')auto.enabled=options.enabled;
  for(const key of ['minIdleMs','maxIdleMs','minWalkMs','maxWalkMs'])if(Number.isFinite(options[key]))auto[key]=Math.max(100,options[key]);
  if(Number.isFinite(options.seed))auto.seed=options.seed>>>0;
  if(options.pace)auto.pace=options.pace==='run'?'run':'walk';auto.timeMs=0;auto.mode='idle';if(!auto.enabled&&!state.job&&!nav&&!state.command&&!state.inputX&&!state.inputY)state.moving=false;return getWander();}
 function getWander(){return {...auto};}
 function weightedPhase(elapsed,duration,weights){const ws=Array.isArray(weights)&&weights.length===5?weights:[1,1,1,1,1],total=ws.reduce((a,b)=>a+Math.max(0,b),0)||5;
  const pct=((elapsed%duration)+duration)%duration/duration;let sum=0;
  for(let i=0;i<5;i++){sum+=Math.max(0,ws[i])/total;if(pct<sum)return i;}return 4;}
 function autonomousStep(dt){if(!auto.enabled)return false;
  auto.timeMs-=dt*1000;if(auto.timeMs<=0){if(auto.mode==='idle'){
    auto.mode='walking';auto.timeMs=auto.minWalkMs+random()*Math.max(0,auto.maxWalkMs-auto.minWalkMs);
    // Choose from all 8 bearings; bounded attempts prevent wandering forever into a wall.
    const choices=[...dirs];let chosen=null;
    for(let i=0;i<8;i++){const d=choices[Math.floor(random()*choices.length)],v=headingVectors[d],p=P.unit(...v),test=P.sweep(world,state,p[0]*28,p[1]*28,16,{groundLock:true});
      if(test.distance>18){chosen=d;break;}}
    if(chosen){auto.direction=chosen;setFacing(chosen);}else{auto.mode='idle';auto.timeMs=auto.minIdleMs;}
   }else{auto.mode='idle';auto.timeMs=auto.minIdleMs+random()*Math.max(0,auto.maxIdleMs-auto.minIdleMs);}}
  if(auto.mode==='walking'){const v=headingVectors[auto.direction],out=stepMovement(v[0],v[1],dt,auto.pace);
    if(out.blocked){auto.mode='idle';auto.timeMs=auto.minIdleMs;}} else{state.moving=false;state.phase=0;}
  return true;
 }
 const emit=(name,detail)=>{for(const f of listeners.get(name)||[]){try{f(detail);}catch(e){setTimeout(()=>{throw e;});}}if(typeof root.dispatchEvent==='function'&&typeof CustomEvent==='function')root.dispatchEvent(new CustomEvent('onyx-base-'+name,{detail}));};
 function on(n,fn){if(!listeners.has(n))listeners.set(n,new Set());listeners.get(n).add(fn);return()=>listeners.get(n).delete(fn);}
 function register(desc){if(!desc||!desc.id||registry.has(desc.id))throw Error('Invalid or duplicate Onyx movement module: '+desc?.id);registry.set(desc.id,Object.freeze(desc));if(desc.aliases)for(const a of desc.aliases)aliases.set(a,desc.id);return desc;}
 function descriptor(n){return registry.get(n)||registry.get('onyx-base-'+n)||registry.get(aliases.get(n));}
 function chooseDirection(x,y){if(Math.hypot(x,y)<1e-6)return state.direction;const oct=((Math.round(Math.atan2(y,x)*4/Math.PI)%8)+8)%8;return dirs[oct];}
 function setFacing(dir){if(!headingVectors[dir])return false;state.direction=dir;if(headingVectors[dir][0]>0)state.lastSide='right';else if(headingVectors[dir][0]<0)state.lastSide='left';return true;}
 function heading(x,y,opts={}){let dir=chooseDirection(x,y);setFacing(dir);if(opts.pace)state.pace=opts.pace;const v=P.unit(...headingVectors[dir]);emit('heading',{direction:dir,vector:v,authoredView:S.artView(dir,state.lastSide),approximateDrawing:['north','south'].includes(dir)});return dir;}
 function setWorld(w={}){
   const width=Number(w.width),height=Number(w.height);
   if(!Number.isFinite(width)&&w.width!=null||!Number.isFinite(height)&&w.height!=null)return {ok:false,reason:'invalid-world-size'};
   const obstacles=Array.isArray(w.obstacles)?w.obstacles:[];
   if(obstacles.some(o=>!o||!['x','y','w','h'].every(k=>Number.isFinite(o[k]))||o.w<0||o.h<0||(o.height!=null&&!Number.isFinite(o.height))))return {ok:false,reason:'invalid-obstacle'};
   world={width:width>0?width:960,height:height>0?height:560,obstacles:obstacles.map(o=>({...o})),canOccupy:typeof w.canOccupy==='function'?w.canOccupy:null};
   state.x=P.clamp(state.x,20,Math.max(20,world.width-20));state.y=P.clamp(state.y,20,Math.max(20,world.height-20));return getWorld();}
 function getWorld(){return {...world,obstacles:world.obstacles.map(o=>({...o}))};}
 function setPosition(x,y,z){if(!Number.isFinite(x)||!Number.isFinite(y))return {ok:false,reason:'invalid-position'};
  const h=Number.isFinite(z)?z:P.support(world,x,y);if(P.occupied(world,x,y,h,16))return {ok:false,reason:'blocked'};
  state.x=x;state.y=y;state.z=h;return {ok:true};}
 function setInput(x,y,opts={}){x=Number(x);y=Number(y);if(!Number.isFinite(x)||!Number.isFinite(y))return {ok:false,reason:'invalid-input'};if((x||y)&&state.job?.def.nonInterruptible)return {ok:false,reason:'busy',action:state.job.def.id};const v=P.unit(x,y);state.inputX=v[0];state.inputY=v[1];if(opts.pace)state.pace=opts.pace==='run'?'run':'walk';if(v[0]||v[1])heading(v[0],v[1],{pace:state.pace});  if(v[0]||v[1]){endNavigation('manual-input');if(state.command){state.command=null;emit('motion-stop',{reason:'manual-input'});}}if(opts.interrupt!==false&&(v[0]||v[1])&&state.job&&!state.job.def.nonInterruptible)cancelAction('movement-input');return {ok:true};}
 function rebaseGait(stride){
  if(!state.gaitStride){state.gaitStride=stride;return;}
  if(Math.abs(state.gaitStride-stride)<1e-6)return;
  const phase=((state.gaitTravel/state.gaitStride)%1+1)%1;
  state.gaitTravel=phase*stride;state.gaitStride=stride;
  emit('gait-change',{pace:state.pace,mood,phase,stridePx:stride});
 }
 function stepMovement(dx,dy,dt,pace='walk',allowAction=false){if(state.job&&!allowAction)return {ok:false,reason:'busy'};
  if(!Number.isFinite(dt)||dt<=0)return {ok:false,reason:'nonpositive-dt'};
  dt=P.clamp(dt,0,.1);const dir=chooseDirection(dx,dy),d=descriptor('move_'+dir);if(!d)return {ok:false,reason:'direction-module-missing'};
  setFacing(dir);state.pace=pace==='run'?'run':'walk';const v=P.unit(dx,dy),speed=state.pace==='run'?d.runSpeed:d.walkSpeed;
  const before={x:state.x,y:state.y,z:state.z};let out=P.sweep(world,state,v[0]*speed*dt,v[1]*speed*dt,16,{groundLock:true,maxStep:1});
  // Per-substep ground locking, not just an endpoint check, prevents walking across a narrow gap.
  state.x=out.x;state.y=out.y;state.travel+=out.distance;state.moving=out.distance>.02;
  // Stride distance (not animation wall time) determines planted-foot progress.
  const prof=moodProfiles[mood]||moodProfiles.base_cat;
  const cycle=Number(prof?.[state.pace])|| (state.pace==='run'?390:520);
  const stride=Math.max(4,speed*cycle/1000);
  rebaseGait(stride);
  const beforeTravel=state.gaitTravel;
  state.gaitTravel+=out.distance;
  const prevPhase=state.phase;state.phase=Math.floor(((state.gaitTravel/stride)%1)*5)%5;
  if(G&&state.moving){for(const contact of G.crossedContacts(beforeTravel,state.gaitTravel,stride,state.pace))emit('paw-contact',{direction:dir,pace:state.pace,phase:state.phase,paw:contact.name,x:state.x,y:state.y});}
  else if(state.moving&&state.phase!==prevPhase&&(state.phase===0||state.phase===2))emit('paw-contact',{direction:dir,pace:state.pace,phase:state.phase,x:state.x,y:state.y});
  const result={ok:out.distance>0,position:{x:state.x,y:state.y,z:state.z},direction:dir,pace:state.pace,phase:state.phase,distance:out.distance,blocked:out.blocked,before};
  state.lastResult=result;if(out.distance>0)emit('step',result);if(out.blocked)emit('blocked',result);return result;}
 function advance(direction,dt,opts={}){const v=headingVectors[direction];if(!v)return {ok:false,reason:'unknown-direction'};return stepMovement(...v,dt,opts.pace||'walk');}
 function move(dir,opts={}){clearSteering();if(state.job?.def.nonInterruptible)return {ok:false,reason:'busy',action:state.job.def.id};if(!headingVectors[dir])return {ok:false,reason:'unknown-direction'};endNavigation('direct-command');cancelAction('move-command');setFacing(dir);const d=descriptor('move_'+dir),pace=opts.pace==='run'?'run':'walk';
  let durationMs=opts.durationMs??opts.duration,remaining=Number.isFinite(opts.distancePx)?Math.max(0,opts.distancePx):Infinity;
  if(durationMs!=null)durationMs=Math.max(0,Number(durationMs)||0);else durationMs=Infinity;
  state.command={direction:dir,pace,remaining,remainingMs:durationMs};return {ok:true,direction:dir,pace};}
 function walk(dir,opts={}){return move(dir,{...opts,pace:'walk'});}function run(dir,opts={}){return move(dir,{...opts,pace:'run'});}
 // Canceling an airborne action must never strand Onyx at a floating z value.
 // Search grounded positions in priority order: takeoff, landing, current projection,
 // then nearby samples. If furniture blocks every candidate, emit failure honestly.
 function recoverGrounded(job,reason){
  const p=job?.data?.plan;
  const here={x:state.x,y:state.y};
  const origins=p?[{x:p.x0,y:p.y0},{x:p.x1,y:p.y1},here]:[here];
  const candidates=[...origins];
  for(const origin of origins){for(const radius of [12,24,40,60,84]){
   for(let i=0;i<16;i++){const angle=i*Math.PI/8;
    candidates.push({x:origin.x+Math.cos(angle)*radius,y:origin.y+Math.sin(angle)*radius});
   }
  }}
  for(const pos of candidates){const z=P.support(world,pos.x,pos.y);
   if(!P.landingSupported(world,pos.x,pos.y,z,13)||P.occupied(world,pos.x,pos.y,z,13,true))continue;
   const wasAirborne=state.z>z+.5;
   state.x=pos.x;state.y=pos.y;state.z=z;
   if(wasAirborne)emit('ground-recovery',{reason,x:pos.x,y:pos.y,z});
   return true;
  }
  emit('ground-recovery-failed',{reason,at:here});return false;
 }
 function needsGroundRecovery(job){
  // An interrupted pounce can be airborne too, not just actions of kind 'jump'.
  // Recover after onStop, since an action-specific onStop may already land safely.
  const floor=P.support(world,state.x,state.y);
  return state.z>floor+.5 || (job?.def?.kind==='jump'&&P.occupied(world,state.x,state.y,state.z,13));
 }
 function cancelAction(reason='cancelled'){
  const prev=state.job;if(prev){if(typeof prev.def.onStop==='function')prev.def.onStop(api,prev,reason);if(needsGroundRecovery(prev))recoverGrounded(prev,reason);state.job=null;emit('action-end',{id:prev.def.id,reason,elapsedMs:prev.elapsedMs});}
  if(prev&&!state.job)state.action='idle';return !!prev;}
 function stop(reason='stopped'){clearSteering();endNavigation(reason);cancelAction(reason);state.command=null;state.inputX=0;state.inputY=0;state.moving=false;state.action='idle';emit('motion-stop',{reason,...getState()});}
 function perform(name,opts={}){if(state.job?.def.nonInterruptible)return {ok:false,reason:'busy',action:state.job.def.id};const d=descriptor(name);if(!d||d.kind==='locomotion')return {ok:false,reason:'unknown-action',name};
  const j={def:d,opts:{...opts},elapsedMs:0,durationMs:Math.max(1,Number(opts.durationMs??opts.duration??d.durationMs)||d.durationMs||900),data:{},hold:opts.hold===true||opts.loop===true||d.defaultHold===true&&opts.hold!==false};
  // Preflight BEFORE cancelling the existing action. Invalid jumps and out-of-reach food
  // do not rip the cat out of sleep, curl or another long-lived posture.
  let init={ok:true};if(typeof d.onStart==='function')init=d.onStart(api,j)||init;
  if(!init.ok){const error={...init,id:d.id};emit('action-rejected',error);return error;}
  clearSteering();cancelAction('replaced');endNavigation('action-started');state.command=null;state.inputX=0;state.inputY=0;state.moving=false;state.action=d.action;state.job=j;
  emit('action-start',{id:d.id,name:d.action,options:j.opts,durationMs:j.durationMs});return {ok:true,id:d.id,action:d.action,durationMs:j.durationMs};}
 function endAction(reason='completed'){if(!state.job)return;const done=state.job;state.job=null;state.action='idle';if(done.def.onStop)done.def.onStop(api,done,reason);if(needsGroundRecovery(done))recoverGrounded(done,reason);emit('action-end',{id:done.def.id,reason,elapsedMs:done.elapsedMs});}
 function endNavigation(reason='cancelled'){
  if(!nav)return false;const target={...nav.target};nav=null;state.moving=false;
  emit('navigation-end',{target,reason});return true;
 }
 function planTo(x,y,opts={}){const N=root.OnyxBaseNavigation;if(!N)return [];return N.plan(world,{x:state.x,y:state.y,z:state.z},{x,y},opts);}
 function navigateTo(x,y,opts={}){if(![x,y].every(Number.isFinite))return {ok:false,reason:'invalid-target'};
  if(state.job?.def.nonInterruptible)return {ok:false,reason:'busy'};
  if(Math.hypot(x-state.x,y-state.y)<3)return {ok:true,waypoints:0};
  const path=planTo(x,y,opts);if(!path.length)return {ok:false,reason:'no-walking-path'};
  clearSteering();cancelAction('navigate');endNavigation('replaced');state.command=null;state.inputX=0;state.inputY=0;
  nav={path,index:0,pace:opts.pace==='run'?'run':'walk',target:{x,y},options:{cell:opts.cell??20},replans:0,stalls:0,lastDistance:Infinity};
  emit('navigation-start',{target:nav.target,waypoints:path.length});return {ok:true,waypoints:path.length,path:path.map(q=>({...q}))};
 }
 function navigateStep(dt){if(!nav)return false;
  for(let tries=0;tries<3&&nav;tries++){
   let q=nav.path[nav.index],dx=q.x-state.x,dy=q.y-state.y,dist=Math.hypot(dx,dy);
   if(dist<=2.5){nav.index++;if(nav.index>=nav.path.length){const target=nav.target;nav=null;state.moving=false;emit('navigation-end',{target,reason:'arrived'});return true;}continue;}
   const pace=nav.pace,speed=pace==='run'?255:108;
   const out=stepMovement(dx,dy,Math.min(dt,dist/speed),pace);
   if(!nav)return true;
   const remaining=Math.hypot(q.x-state.x,q.y-state.y);
   // Diagonal wall sliding must not be mistaken for route progress indefinitely.
   nav.stalls=remaining>=dist-.08?nav.stalls+1:0;
   if(nav.stalls>3||out.blocked&&out.distance<.2){
    const newPath=nav.replans<2?planTo(nav.target.x,nav.target.y,nav.options):[];
    if(newPath.length){nav.path=newPath;nav.index=0;nav.stalls=0;nav.replans++;emit('navigation-replan',{target:nav.target,count:nav.replans,waypoints:newPath.length});}
    else{const target=nav.target;nav=null;state.moving=false;emit('navigation-end',{target,reason:'blocked'});}
   }
   return true;
  }return true;
 }
 // Sub-stepping is deliberately inside the runtime: callers with irregular
 // requestAnimationFrame clocks and OurSpace's host clock get identical safety.
 // Excess background-tab elapsed time is capped to avoid instant behavior skips.
 function step(dt){
  const elapsed=Number.isFinite(dt)?P.clamp(dt,0,.25):0;
  if(!elapsed)return;
  const subdivisions=Math.max(1,Math.ceil(elapsed/.025));
  const subdt=elapsed/subdivisions;
  for(let i=0;i<subdivisions;i++)stepOne(subdt);
 }
 function stepOne(dt){state.elapsedMs+=dt*1000;
  const j=state.job;
  if(j){j.elapsedMs+=dt*1000;if(j.def.onUpdate){const result=j.def.onUpdate(api,j,dt);if(result&&result.ok===false){endAction(result.reason||'blocked');return;}if(result?.complete){endAction(result.reason||'completed');return;}}
    if(!j.hold&&j.elapsedMs>=j.durationMs)endAction('completed');return;}
  let x=state.inputX,y=state.inputY,pace=state.pace;
  if(!(x||y)&&state.command){const c=state.command,[vx,vy]=headingVectors[c.direction];x=vx;y=vy;pace=c.pace;const prior={x:state.x,y:state.y};const d=descriptor('move_'+c.direction);const speed=c.pace==='run'?d.runSpeed:d.walkSpeed;
   const limited=Math.max(0,Math.min(dt,c.remainingMs/1000,c.remaining/Math.max(1,speed)));
   const res=limited>0?stepMovement(x,y,limited,pace):{blocked:false};
   const travelled=Math.hypot(state.x-prior.x,state.y-prior.y);c.remaining-=travelled;c.remainingMs-=dt*1000;
   if(c.remaining<=.25||c.remainingMs<=0||res.blocked){state.command=null;state.moving=false;emit('motion-stop',{reason:res.blocked?'blocked':'completed'});}return;}
  if(steering.enabled&&(x||y||Math.hypot(steering.actualX,steering.actualY)>1e-4)){steerStep(dt);return;}
  if(x||y)stepMovement(x,y,dt,pace);else if(!navigateStep(dt)&&!autonomousStep(dt)){state.moving=false;state.phase=0;}
 }
 function sequenceFrame(j){const seq=j.def.sequence||[];if(!seq.length)return null;
  let t=j.elapsedMs;if(j.hold&&t>=j.durationMs){const stable=j.def.holdSequence||[seq[seq.length-1]];seq.length;const at=stable[Math.floor((t-j.durationMs)/900)%stable.length];return {...at,phase:at.phase??0};}
  const ratio=P.clamp(t/j.durationMs,0,.999999);let index=seq.findIndex(p=>ratio<(p.end??1));if(index<0)index=seq.length-1;const p=seq[index];return {...p,phase:p.phase??Math.floor(t/115)%5};}
 function getFrame(){const j=state.job;if(j){const s=j.def.sample?j.def.sample(api,j):sequenceFrame(j);if(s)return {kind:'atlas',direction:state.direction,side:state.lastSide,action:state.action,pace:state.pace,...s};}
  const p=moodProfiles[mood]||moodProfiles.base_cat;
  const phase=state.moving?state.phase:weightedPhase(state.elapsedMs,p?.idle||2500,p?.weights?.idle);
  const visualPhase=state.moving&&sprites?.style==='catai'?Math.floor((state.gaitTravel/Math.max(1,state.gaitStride)%1)*8)%8:
   state.moving&&sprites?.style?.startsWith('fox')?Math.floor((state.gaitTravel/Math.max(1,state.gaitStride)%1)*12)%12:
   state.moving&&sprites?.style?.startsWith('catndog')?Math.floor((state.gaitTravel/Math.max(1,state.gaitStride)%1)*10)%10:phase;
  return {kind:state.moving?'move':'atlas',direction:state.direction,side:state.lastSide,pace:state.pace,action:state.action,row:state.moving?(state.pace==='run'?S.ROWS.run:S.ROWS.walk):S.ROWS.idle,phase:visualPhase};}
 function getGait(){const p=moodProfiles[mood]||moodProfiles.base_cat,spd=state.pace==='run'?255:108,stride=spd*(p?.[state.pace]||520)/1000;
  return G?G.sample(state.gaitTravel,state.gaitStride||stride,state.pace):null;}
 function getState(){return {x:state.x,y:state.y,z:state.z,direction:state.direction,lastSide:state.lastSide,pace:state.pace,action:state.action,moving:state.moving,phase:state.phase,travelDistance:state.travel,mood,steering:getSteering(),gait:getGait(),navigation:nav?{target:{...nav.target},index:nav.index,total:nav.path.length,pace:nav.pace}:null,job:state.job?{id:state.job.def.id,elapsedMs:state.job.elapsedMs,durationMs:state.job.durationMs,hold:state.job.hold}:null,command:state.command?{...state.command}:null};}
 function attachCanvas(el,options={}){if(typeof el==='string'&&typeof document!=='undefined')el=document.querySelector(el);if(!el||typeof el.getContext!=='function')return {ok:false,reason:'canvas-not-found'};canvas=el;ctx=canvas.getContext('2d');if(!ctx)return {ok:false,reason:'no-2d-context'};
  const assetBase=options.assetBase||(typeof document!=='undefined'?document.baseURI:'file:///');sprites=new S.Sprites({atlasUrl:options.atlasUrl||new URL('assets/images/games/virtual/atlases/onyx_meow_sprite_atlas.png',assetBase).href,cataiRoot:options.cataiRoot||new URL('assets/catai-black/',assetBase).href,referenceRoot:options.referenceRoot||new URL('assets/references/',assetBase).href,style:options.style||'onyx'});return {ok:true};}
 function setSpriteStyle(style){return !!sprites&&sprites.setStyle(style);}
 function getSpriteStyle(){return sprites?.style||'onyx';}
 function render(options={}){if(!ctx||!canvas||!sprites)return false;
  ctx.clearRect(0,0,canvas.width,canvas.height);if(options.drawWorld)options.drawWorld(ctx,world,getState());
  // Shadow remains fixed at ground projection as sprite rises above it.
  const shadowWidth=48*Math.max(.55,1-state.z/370);ctx.save();ctx.fillStyle=`rgba(23,28,37,${Math.max(.10,.28-state.z/650)})`;ctx.beginPath();ctx.ellipse(state.x,state.y-6,shadowWidth,10*Math.max(.5,1-state.z/260),0,0,Math.PI*2);ctx.fill();ctx.restore();
  const f=getFrame();if(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)f.phase=0;const bob=state.moving&&options.bodyBob===true?Math.round(getGait()?.bodyBobPx||0):0;
  const rendered=sprites.draw(ctx,f,state.x,state.y-state.z-bob,options.scale??2);
  if(options.afterDraw)options.afterDraw(ctx,getState(),f);return rendered;}
 function start(options={}){if(animating)return true;if(typeof requestAnimationFrame!=='function')return false;animating=true;lastT=0;
  const frame=t=>{if(!animating)return;let dt=lastT?(t-lastT)/1000:0;lastT=t;step(dt);render(options);raf=requestAnimationFrame(frame);};
  raf=requestAnimationFrame(frame);return true;}
 function pause(){animating=false;if(typeof cancelAnimationFrame==='function'&&raf)cancelAnimationFrame(raf);raf=0;}
 function jumpPlan(j,type){const opt=j.opts,vec=P.unit(...headingVectors[state.direction]),from={x:state.x,y:state.y,z:state.z};
  const defaultDistance=type==='jump_up'?54:type==='jump_down'?75:140;
  const dest=opt.to||{x:state.x+vec[0]*(Number.isFinite(opt.distancePx)?opt.distancePx:defaultDistance),y:state.y+vec[1]*(Number.isFinite(opt.distancePx)?opt.distancePx:defaultDistance)};
  const target={x:dest.x,y:dest.y,z:Number.isFinite(dest.z)?dest.z:P.support(world,dest.x,dest.y)};
  const arc=Number(opt.arcPx??opt.heightPx??(type==='jump_up'?95:type==='jump_down'?60:70));
  const plan=P.planJump(world,from,target,{arcPx:arc,durationMs:opt.durationMs??(type==='jump_up'?680:type==='jump_down'?600:750),radius:13});
  if(!plan.ok)return plan;j.data.plan=plan.plan;j.durationMs=plan.plan.durationMs;return {ok:true};}
 function jumpUpdate(j){const p=j.data.plan;if(!p)return {ok:false,reason:'no-jump-plan'};
  const snap=P.jumpSample(p,P.clamp(j.elapsedMs/j.durationMs,0,1));
  // If furniture changes while airborne, never phase through it or land in empty space.
  const segment=P.validateJumpSegment(world,p,j.data.lastProgress||0,snap.progress,13);
  const safe=segment.ok;
  if(!safe){
   const home={x:p.x0,y:p.y0,z:p.z0};
   if(!P.occupied(world,home.x,home.y,home.z,13))Object.assign(state,home);
   else { // Host mutated both takeoff and landing: report failure and retain safe in-air point.
    const previous=j.data.lastSafe;if(previous)Object.assign(state,previous);
   }
   emit('jump-blocked',{id:j.def.id,reason:'trajectory-changed',requested:snap,collision:segment.at||null});
   return {ok:false,reason:'trajectory-changed'};
  }
  state.x=snap.x;state.y=snap.y;state.z=snap.z;j.data.lastSafe={x:snap.x,y:snap.y,z:snap.z};j.data.lastProgress=snap.progress;
  emit('jump-step',{...snap,id:j.def.id});if(snap.progress>=1){state.z=p.z1;emit('landing',{x:state.x,y:state.y,z:state.z});return {complete:true};}return {ok:true};}
 function path(start,goal,grid){return P.findPath(start,goal,grid);}
 function getAdapter(){return api.adapter||null;}
 function setAdapter(adapter){api.adapter=adapter||null;return api;}
 function method(name){return opts=>perform(name,opts||{});}
 const api={version:'23.0',register,descriptor,list:()=>[...registry.keys()],on,getState,getWorld,setWorld,setPosition,setInput,heading,advance,move,walk,run,stop,perform,step,render,start,pause,getFrame,attachCanvas,setSpriteStyle,getSpriteStyle,setMood,getMood,setWander,getWander,setSteering,getSteering,getGait,planTo,navigateTo,cancelNavigation:endNavigation,findPath:path,getAdapter,setAdapter,cancelAction,
  _jumpPlan:jumpPlan,_jumpUpdate:jumpUpdate,_emit:emit,_moveDuringAction:(dx,dy,dt,pace)=>stepMovement(dx,dy,dt,pace,true),_setAirPosition:(x,y,z)=>{state.x=x;state.y=y;state.z=z;},_walkTo(x,y,pace='walk',dt=1/60){const dx=x-state.x,dy=y-state.y,dist=Math.hypot(dx,dy);if(dist<3)return true;const out=stepMovement(dx,dy,Math.min(dt,dist/(pace==='run'?255:108)),pace==='run'?'run':'walk',true);return out.ok&&Math.hypot(x-state.x,y-state.y)<3;},
  jumpUp:method('jump_up'),jumpDown:method('jump_down'),jumpAcross:method('jump_across'),stretch:method('stretch'),loaf:method('loaf'),lounge:method('lounge'),curlBall:method('curl_ball'),eat:opts=>perform('eat_drink',{...opts,mode:'eat'}),drink:opts=>perform('eat_drink',{...opts,mode:'drink'}),sleep:method('sleep'),playWithToy:opts=>perform('play_hunt',{...opts,mode:'toy'}),huntFish:opts=>perform('play_hunt',{...opts,mode:'fish'})};
 root.OnyxBaseMotion=api;
 const queued=root.OnyxBaseMotionQueue||[];for(const d of queued)register(d);root.OnyxBaseMotionQueue=[];
})(typeof window!=='undefined'?window:globalThis);
