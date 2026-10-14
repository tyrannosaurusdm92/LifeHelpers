/* Onyx Base Motion Pass 23 bundle. Generated from the adjacent tested modules. */

/* --- onyx-base-physics.js --- */
/* Onyx Pass 17: original dependency-free 2.5D physics.
   x right, y down on ground plane; z vertical above ground; feet at x,y,z.
   A platform is solid below its top and supports feet ON its top; walls never support.
*/
(function(root){'use strict';
 const EPS=1e-7,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const length=(x,y)=>Math.hypot(x,y),unit=(x,y)=>{const d=length(x,y);return d>EPS?[x/d,y/d]:[0,0];};
 const circleRect=(x,y,r,b)=>{const cx=clamp(x,b.x,b.x+b.w),cy=clamp(y,b.y,b.y+b.h);return (x-cx)**2+(y-cy)**2<r*r;};
 const inBounds=(w,x,y,r=0)=>x>=r&&y>=r&&x<=w.width-r&&y<=w.height-r;
 function support(w,x,y){let z=0;for(const o of w.obstacles||[])if(o.platform&&x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h)z=Math.max(z,o.height||0);return z;}
 function occupied(w,x,y,z,r=16,landing=false){
  if(!inBounds(w,x,y,r))return true;
  for(const o of w.obstacles||[]){if(!circleRect(x,y,r,o))continue;const height=Number(o.height)||1;
   if(o.platform&&z>=height-.5)continue;
   if(z<height-.5)return true;
  }
  return typeof w.canOccupy==='function'&&!w.canOccupy(x,y,z,!!landing);
 }
 function sweep(w,s,dx,dy,r=16,opts={}){
  const n=Math.max(1,Math.ceil(length(dx,dy)/Math.max(2,r*.24))),stepX=dx/n,stepY=dy/n;
  let x=s.x,y=s.y,travelled=0,blocked=false;
  const valid=(a,b)=>!occupied(w,a,b,s.z,r)&&(!opts.groundLock||Math.abs(support(w,a,b)-s.z)<= (opts.maxStep??1));
  for(let k=0;k<n;k++){
   const ox=x,oy=y,nx=x+stepX,ny=y+stepY;
   if(valid(nx,ny)){x=nx;y=ny;travelled+=length(x-ox,y-oy);continue;}
   blocked=true;let slid=false;
   if(Math.abs(stepX)>EPS&&valid(nx,y)){x=nx;slid=true;}
   if(Math.abs(stepY)>EPS&&valid(x,ny)){y=ny;slid=true;}
   // Distance is the ground track, never |dx|+|dy|. Counting both axes
   // independently made paw-cycle timing sprint ahead during wall slides.
   travelled+=length(x-ox,y-oy);
   if(!slid)break;
  }
  return {x,y,blocked,distance:travelled};
 }
 // Interaction sight/reach is independent of the cat's larger walking collider.
 // Sample the complete segment, including narrow obstacles between two close points.
 // Prevent eating/drinking/collecting through furniture while allowing normal approach.
 function clearApproach(w,from,to,r=4){
  if(!from||!to||![from.x,from.y,to.x,to.y].every(Number.isFinite))return false;
  const z=Number.isFinite(from.z)?from.z:support(w,from.x,from.y);
  const dx=to.x-from.x,dy=to.y-from.y,n=Math.max(1,Math.ceil(length(dx,dy)/Math.max(2,r*.65)));
  for(let i=1;i<=n;i++){
   const t=i/n,x=from.x+dx*t,y=from.y+dy*t;
   if(occupied(w,x,y,z,r))return false;
  }
  return true;
 }
 function jumpSample(p,t){t=clamp(t,0,1);
  const lift=4*p.arc*t*(1-t),z=p.z0+(p.z1-p.z0)*t+lift;
  return {x:p.x0+(p.x1-p.x0)*t,y:p.y0+(p.y1-p.y0)*t,z,progress:t,verticalVelocity:(p.z1-p.z0+4*p.arc*(1-2*t))/p.durationSeconds};
 }
 // The paws must fit onto the top, not just the center of a 1px platform edge.
 function landingSupported(w,x,y,z,r=13){
  // Cardinal and diagonal support points approximate the paws and body footprint.
  // Without diagonal checks, a cat can land with two paws hanging off a platform corner.
  const samples=[[0,0],[.68,0],[-.68,0],[0,.68],[0,-.68],[.52,.52],[.52,-.52],[-.52,.52],[-.52,-.52]];
  return samples.every(([u,v])=>Math.abs(support(w,x+u*r,y+v*r)-z)<=1);
 }
 // Probe every segment of an airborne action, not just its final sampled pose.
 // This detects a thin piece of furniture added after takeoff even if it falls
 // entirely between two host update calls. Returns the first blocked sample.
 function validateJumpSegment(w,p,fromProgress,toProgress,r=13){
  if(!Number.isFinite(fromProgress)||!Number.isFinite(toProgress))return {ok:false,reason:'invalid-progress'};
  const a=clamp(Math.min(fromProgress,toProgress),0,1),b=clamp(Math.max(fromProgress,toProgress),0,1);
  const start=jumpSample(p,a),finish=jumpSample(p,b);
  const displacement=length(finish.x-start.x,finish.y-start.y)+Math.abs(finish.z-start.z);
  const subdivisions=Math.max(2,Math.ceil(displacement/Math.max(2,r*.32)),Math.ceil((b-a)*64));
  for(let i=1;i<=subdivisions;i++){
   const pos=jumpSample(p,a+(b-a)*i/subdivisions);
   if(occupied(w,pos.x,pos.y,pos.z,r,pos.progress>=1))return {ok:false,reason:'trajectory-obstructed',at:pos};
  }
  if(b>=1&&!landingSupported(w,p.x1,p.y1,p.z1,r))return {ok:false,reason:'landing-unsupported',at:finish};
  return {ok:true};
 }
 function validateJump(w,p,r=13){
  if(!inBounds(w,p.x0,p.y0,r)||!inBounds(w,p.x1,p.y1,r))return {ok:false,reason:'outside-room'};
  const supported=support(w,p.x1,p.y1);
  if(Math.abs(p.z1-supported)>1||!landingSupported(w,p.x1,p.y1,p.z1,r))return {ok:false,reason:'no-landing-surface',supported};
  if(occupied(w,p.x1,p.y1,p.z1,r,true))return {ok:false,reason:'landing-blocked'};
  const sweep=validateJumpSegment(w,p,0,1,r);if(!sweep.ok)return {...sweep,reason:'jump-intersects-obstacle'};
  return {ok:true};
 }
 function planJump(w,from,target,opts={}){
  if(![from.x,from.y,from.z,target.x,target.y].every(Number.isFinite))return {ok:false,reason:'invalid-coordinate'};
  const z1=Number.isFinite(target.z)?target.z:support(w,target.x,target.y),dz=z1-from.z;
  const arc=clamp(Number.isFinite(opts.arcPx)?opts.arcPx:Math.max(70,Math.abs(dz)*.75+35),12,260);
  const distance=length(target.x-from.x,target.y-from.y),duration=clamp(Number(opts.durationMs)||Math.round(450+distance*1.4+Math.abs(dz)*.6),260,2400);
  const p={x0:from.x,y0:from.y,z0:from.z,x1:target.x,y1:target.y,z1,arc,durationMs:duration,durationSeconds:duration/1000};
  const checked=validateJump(w,p,opts.radius||13);
  return checked.ok?{ok:true,plan:p}:{...checked,plan:p};
 }
 function findPath(start,goal,grid={}){
  const cols=grid.cols|0,rows=grid.rows|0;if(cols<1||rows<1||cols*rows>120000)return [];
  const blocked=grid.blocked||new Set(),key=(x,y)=>x+','+y;
  const invalid=(x,y)=>x<0||y<0||x>=cols||y>=rows||(typeof blocked.has==='function'?blocked.has(key(x,y)):Array.isArray(blocked)?blocked.includes(key(x,y)):!!blocked[key(x,y)]);
  if(invalid(start.x,start.y)||invalid(goal.x,goal.y))return [];
  const h=(x,y)=>{let a=Math.abs(x-goal.x),b=Math.abs(y-goal.y);return Math.max(a,b)+(Math.SQRT2-1)*Math.min(a,b);};
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  const open=[{x:start.x,y:start.y,g:0,f:h(start.x,start.y)}],best=new Map([[key(start.x,start.y),0]]),parent=new Map();
  while(open.length){let mi=0;for(let i=1;i<open.length;i++)if(open[i].f<open[mi].f)mi=i;
   const p=open.splice(mi,1)[0],pk=key(p.x,p.y);if(p.g>(best.get(pk)??Infinity)+EPS)continue;
   if(p.x===goal.x&&p.y===goal.y){const path=[{x:p.x,y:p.y}];let curr=pk;while(parent.has(curr)){curr=parent.get(curr);const [x,y]=curr.split(',').map(Number);path.push({x,y});}return path.reverse();}
   for(const [vx,vy] of dirs){const x=p.x+vx,y=p.y+vy;if(invalid(x,y)||vx&&vy&&(invalid(p.x+vx,p.y)||invalid(p.x,p.y+vy)))continue;
    const g=p.g+(vx&&vy?Math.SQRT2:1),k=key(x,y);if(g+EPS>=(best.get(k)??Infinity))continue;
    best.set(k,g);parent.set(k,pk);open.push({x,y,g,f:g+h(x,y)});
   }
  }return [];
 }
 root.OnyxBasePhysics=Object.freeze({clamp,length,unit,circleRect,inBounds,support,landingSupported,occupied,clearApproach,sweep,jumpSample,validateJumpSegment,validateJump,planJump,findPath});
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-gait.js --- */
/* Quadruped paw-contact model informed by the user-provided PixelPet rig reference.
   Timing only: Onyx is a full-body atlas, not a multi-joint IK puppet.
   Never claim independent visual paws where source art doesn't contain them.
 */
(function(root){'use strict';
 const PAWS=['frontLeft','frontRight','hindLeft','hindRight'];
 const WALK={frontLeft:0,frontRight:.52,hindLeft:.75,hindRight:.25};
 const RUN={frontLeft:0,frontRight:.10,hindLeft:.53,hindRight:.63};
 function sample(travel,stride,pace='walk'){
  stride=Math.max(1,Number(stride)||1);const t=((travel/stride)%1+1)%1,starts=pace==='run'?RUN:WALK,duty=pace==='run'?.34:.63;
  const paws={},contacts=[];
  for(const name of PAWS){const local=((t-starts[name])%1+1)%1,stance=local<duty,proportion=stance?local/duty:(local-duty)/(1-duty);
   paws[name]={stance,phase:local,lift:stance?0:Math.sin(proportion*Math.PI),progress:proportion};
   if(local<.035)contacts.push(name);
  }
  return {pace,cycle:t,stridePx:stride,paws,contacts,bodyBobPx:pace==='run'?1.3*Math.sin(t*4*Math.PI):.55*Math.sin(t*8*Math.PI)};
 }
 function crossedContacts(before,after,stride,pace){
  const starts=pace==='run'?RUN:WALK,events=[];if(after<=before||stride<=0)return events;
  for(const name of PAWS){const offset=starts[name]*stride;let first=Math.floor((before-offset)/stride)+1;
   for(let k=first;k<=Math.floor((after-offset)/stride);k++)events.push({name,atDistance:offset+k*stride});
  }
  return events.sort((a,b)=>a.atDistance-b.atDistance);
 }
 root.OnyxBaseGait=Object.freeze({sample,crossedContacts,PAWS});
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-navigation.js --- */
/* Eight-neighbour target planner. Paths remain on the current supported floor:
   walls, platform discontinuities, and diagonal corner-cuts cannot be walked through.
   Obstacles requiring a jump must be handled by jump_up/down/across explicitly. */
(function(root){'use strict';
 const P=root.OnyxBasePhysics;
 function plan(world,from,target,opts={}){
  if(!P||![from.x,from.y,target.x,target.y].every(Number.isFinite))return [];
  const cell=P.clamp(Number(opts.cell)||20,12,48),r=opts.radius??16;
  const z=Number.isFinite(from.z)?from.z:P.support(world,from.x,from.y);
  if(P.occupied(world,target.x,target.y,z,r)||Math.abs(P.support(world,target.x,target.y)-z)>1)return [];
  const direct=P.sweep(world,{...from,z},target.x-from.x,target.y-from.y,r,{groundLock:true});
  const distance=Math.hypot(target.x-from.x,target.y-from.y);
  if(!direct.blocked&&distance-direct.distance<1.5)return [{x:target.x,y:target.y}];
  const cols=Math.ceil(world.width/cell),rows=Math.ceil(world.height/cell);
  const xy=(x,y)=>({x:Math.max(0,Math.min(cols-1,Math.floor(x/cell))),y:Math.max(0,Math.min(rows-1,Math.floor(y/cell)))});
  const start=xy(from.x,from.y),goal=xy(target.x,target.y),blocked=new Set();
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
   const cx=(x+.5)*cell,cy=(y+.5)*cell;
   if(P.occupied(world,cx,cy,z,r)||Math.abs(P.support(world,cx,cy)-z)>1)blocked.add(x+','+y);
  }
  // Start/target are known valid positions; permit their cells despite center rounding.
  blocked.delete(start.x+','+start.y);blocked.delete(goal.x+','+goal.y);
  const route=P.findPath(start,goal,{cols,rows,blocked});if(!route.length)return [];
  const coords=route.slice(1).map(p=>({x:(p.x+.5)*cell,y:(p.y+.5)*cell}));coords.push({x:target.x,y:target.y});
  // Conservative pruning: an unobstructed straight segment may skip waypoints.
  const result=[],origin={...from};let i=0;
  while(i<coords.length){let best=i;
   for(let j=coords.length-1;j>i;j--){let probe=P.sweep(world,{x:origin.x,y:origin.y,z},coords[j].x-origin.x,coords[j].y-origin.y,r,{groundLock:true});
    if(!probe.blocked&&Math.hypot(probe.x-coords[j].x,probe.y-coords[j].y)<1.4){best=j;break;}}
   result.push(coords[best]);origin.x=coords[best].x;origin.y=coords[best].y;i=best+1;
  }return result;
 }
 root.OnyxBaseNavigation=Object.freeze({plan});
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-profiles.js --- */
/* User-provided Onyx motion timing research: mood-based weighted holds and travel-synchronized gait. */
(function(r){"use strict";r.OnyxBaseProfiles=Object.freeze({"base_cat":{"idle":2500,"walk":520,"run":390,"weights":{"idle":[7,1,8,1,9],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[2,1,1,1,2]},"intent":"neutral moving hold; quiet breath; full contact and recovery"},"caring":{"idle":2500,"walk":520,"run":390,"weights":{"idle":[7,1,8,1,9],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[2,1,1,1,2]},"intent":"soft attention with held readable poses and small response accents"},"hungry":{"idle":1650,"walk":440,"run":340,"weights":{"idle":[4,1,4,1,4],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[1,1,2,1,2]},"intent":"alert sniffing rhythm; brief anticipation accents before food actions"},"judgmental":{"idle":2850,"walk":560,"run":410,"weights":{"idle":[9,1,7,1,9],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[3,1,1,1,3]},"intent":"long dry holds with short, precise eye and head accents"},"listening":{"idle":2350,"walk":500,"run":370,"weights":{"idle":[7,1,8,1,7],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[2,1,1,1,2]},"intent":"listening hold; head and ear response follows the cue"},"purring":{"idle":3100,"walk":590,"run":430,"weights":{"idle":[9,1,10,1,10],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[3,1,2,1,3]},"intent":"slow rocking/purr cycle with a long settle"},"sleepy":{"idle":3900,"walk":690,"run":520,"weights":{"idle":[12,1,13,1,14],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[4,1,2,1,5]},"intent":"slow drooping holds; rare short blink or ear twitch"},"snuggly":{"idle":3450,"walk":630,"run":470,"weights":{"idle":[10,1,11,1,12],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[3,1,3,1,4]},"intent":"weighted sink and settle; tail follows the body pose"},"thinking":{"idle":3000,"walk":560,"run":420,"weights":{"idle":[8,1,10,1,11],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[3,1,2,1,4]},"intent":"hold the thought pose; let gaze/head accents land separately"},"thoughtful":{"idle":2800,"walk":540,"run":400,"weights":{"idle":[8,1,9,1,10],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[2,1,2,1,3]},"intent":"gentle head tilt, pause, and return with visible settling"}});})(typeof window!=="undefined"?window:globalThis);


/* --- onyx-base-sprites.js --- */
/* 2D full-body sprite renderer. Onyx remains default. Other provided animals
   are explicitly opt-in REFERENCES and never replace Onyx within the game. */
(function(root){'use strict';
 const DIRS=['east','south_east','south','south_west','west','north_west','north','north_east'];
 const SIX=['east','south_east','south_west','west','north_west','north_east'];
 const ROWS=Object.freeze({idle:0,walk:1,run:2,dash:3,dashjump:4,jump:5,duck:6,drop:7,stretch:8,reach:9,inspect:10,feed:11,sit:12,stand:13,search:14,sit2:15,curl:16,lounge:17,loaf:18,sleep:19,pounce:20,hunt:21});
 const FOX_DIR=Object.freeze({east:6,south_east:7,south:8,south_west:1,west:2,north_west:3,north:4,north_east:5});
 const ALLOWED=['onyx','catai','fox','fox_normal','fox_plain','catndog_cat','catndog_dog'];
 function artView(dir,side){if(dir==='south')return side==='left'?'south_west':'south_east';if(dir==='north')return side==='left'?'north_west':'north_east';return SIX.includes(dir)?dir:'east';}
 function at(dir,side,row,phase){const view=artView(dir,side),col=SIX.indexOf(view)*5+((Math.floor(phase)%5)+5)%5;return {sx:col*64,sy:row*64,sw:64,sh:64,col,row,authoredView:view,requestedDirection:dir,approximate:dir==='north'||dir==='south'};}
 class Sprites{
  constructor(options={}){
   this.path=options.atlasUrl||'assets/onyx_meow_sprite_atlas_grid64.png';this.cataiRoot=options.cataiRoot||'assets/catai-black/';this.referenceRoot=options.referenceRoot||'assets/references/';
   this.style=ALLOWED.includes(options.style)?options.style:'onyx';this.cache=new Map();this.pending=new Map();this.atlas=null;
   this.atlasReady=this.load(this.path).then(im=>{this.atlas=im;return im});
  }
  load(path){if(this.cache.has(path))return Promise.resolve(this.cache.get(path));if(this.pending.has(path))return this.pending.get(path);
   if(typeof Image==='undefined')return Promise.resolve(null);
   const task=new Promise(resolve=>{let img=new Image();img.onload=()=>{this.cache.set(path,img);this.pending.delete(path);resolve(img);};img.onerror=()=>{this.cache.set(path,null);this.pending.delete(path);resolve(null);};img.src=path;});this.pending.set(path,task);return task;
  }
  cached(path){if(this.cache.has(path))return this.cache.get(path);this.load(path);return null;}
  preloadCatai(){for(const d of DIRS)this.load(this.cataiRoot+'rotations/'+d.replace('_','-')+'.png');}
  setStyle(v){if(!ALLOWED.includes(v))return false;this.style=v;if(v==='catai')this.preloadCatai();return true;}
  cataiPath(s){const dir=(s.direction||'east').replace('_','-'),phase=Math.floor(s.phase||0);
   if(s.kind==='feed')return this.cataiRoot+(s.mode==='drink'?'drinking':'eating')+'/'+dir+'/frame_'+String(phase%(s.mode==='drink'?8:11)).padStart(3,'0')+'.png';
   if(s.kind==='move')return this.cataiRoot+'running-8-frames/'+dir+'/frame_'+String(phase%8).padStart(3,'0')+'.png';
   return this.cataiRoot+'rotations/'+dir+'.png';
  }
  foxData(s){let state=s.kind==='move'||s.row===ROWS.walk||s.row===ROWS.run?'Walk':'Idle';
   let style=this.style==='fox_plain'?'Plain_':this.style==='fox_normal'?'Normal_':'';
   const file='Fox_'+style+state+'_dir'+FOX_DIR[s.direction||'east']+'.png';
   let path=this.referenceRoot+'fox/'+state.toLowerCase()+'/'+file;
   let max=state==='Walk'?12:24,phase=((Math.floor(s.phase||0)%max)+max)%max;
   return {path,sx:(phase%6)*256,sy:Math.floor(phase/6)*256,sw:256,sh:256};
  }
  catDogData(s){const animal=this.style==='catndog_dog'?'dog':'cat';let action=s.kind==='move'?(s.pace==='run'?'run':'walk'):
    ['jump_up','jump_down','jump_across','play_hunt'].includes(s.action)?'jump':s.action==='feed'?'idle':'idle';
   const row={idle:0,walk:1,run:2,jump:3,fall:4,slide:5}[action];
   const count=['idle','walk'].includes(action)?10:8,phase=((Math.floor(s.phase||0)%count)+count)%count;
   return {path:this.referenceRoot+'catndog/'+animal+'-reference-sheet.png',sx:phase*128,sy:row*128,sw:128,sh:128};
  }
  draw(ctx,s,x,y,scale=2){if(!ctx)return false;ctx.imageSmoothingEnabled=false;
   // Default Onyx atlas and its 12 carefully normalized left/right feeding frames.
   if(this.style==='onyx'||s.kind==='feeding_svg'&&this.style==='onyx'){
    if(s.kind==='feeding_svg'){const im=this.cached(s.url);if(im){ctx.drawImage(im,x-32*scale,y-58*scale,64*scale,64*scale);return true;}/* Never turn invisible while feeding SVG is loading. */const base=this.atlas;if(!base)return false;const a=at(s.direction,s.side,ROWS.feed,s.phase??0);ctx.drawImage(base,a.sx,a.sy,64,64,x-32*scale,y-58*scale,64*scale,64*scale);return true;}
    const im=this.atlas;if(!im)return false;const a=at(s.direction,s.side,s.row??0,s.phase??0);
    ctx.drawImage(im,a.sx,a.sy,64,64,x-32*scale,y-58*scale,64*scale,64*scale);return true;
   }
   if(this.style==='catai'){
    const sprite={...s};if(sprite.kind==='feeding_svg'){sprite.kind='feed';sprite.mode=s.mode;}
    const im=this.cached(this.cataiPath(sprite));if(!im)return false;
    ctx.drawImage(im,x-32*scale,y-58*scale,64*scale,64*scale);return true;
   }
   if(this.style.startsWith('fox')){
    let data=this.foxData(s),im=this.cached(data.path);if(!im)return false;
    ctx.drawImage(im,data.sx,data.sy,256,256,x-32*scale,y-58*scale,64*scale,64*scale);return true;
   }
   if(this.style.startsWith('catndog')){
    const data=this.catDogData(s),im=this.cached(data.path);if(!im)return false;
    const width=64*scale,height=64*scale;
    ctx.save();if(['west','north_west','south_west'].includes(s.direction)){ctx.translate(2*x,0);ctx.scale(-1,1);}
    ctx.drawImage(im,data.sx,data.sy,data.sw,data.sh,x-width/2,y-58*scale,width,height);ctx.restore();return true;
   }return false;
  }
 }
 root.OnyxBaseSprites=Object.freeze({DIRS,SIX,ROWS,FOX_DIR,ALLOWED,artView,at,Sprites});
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-runtime.js --- */
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
  const assetBase=options.assetBase||(typeof document!=='undefined'?document.baseURI:'file:///');sprites=new S.Sprites({atlasUrl:options.atlasUrl||new URL('assets/images/games/virtual/atlases/onyx_meow_sprite_atlas_grid64.png',assetBase).href,cataiRoot:options.cataiRoot||new URL('assets/catai-black/',assetBase).href,referenceRoot:options.referenceRoot||new URL('assets/references/',assetBase).href,style:options.style||'onyx'});return {ok:true};}
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


/* --- onyx-base-move_east.js --- */
/* east: independent 8-octant travel direction, measured-distance gait, wall sliding.
   Facing is EXACT in world space; Onyx's six-view artwork has north/south approximations. */
(function(root){'use strict';
 const d=Object.freeze({id:'onyx-base-move_east',kind:'locomotion',direction:'east',vector:Object.freeze([1,0]),
  walkSpeed:108,runSpeed:255,walkStride:78,runStride:116,framesPerCycle:5,
  walkRow:1,runRow:2,diagonal:false,
  frameAt(distance,pace='walk'){const stride=pace==='run'?this.runStride:this.walkStride;return {row:pace==='run'?2:1,phase:Math.floor(Math.max(0,distance)/stride*5)%5};}});
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(d):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(d));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-move_south_east.js --- */
/* south_east: independent 8-octant travel direction, measured-distance gait, wall sliding.
   Facing is EXACT in world space; Onyx's six-view artwork has north/south approximations. */
(function(root){'use strict';
 const d=Object.freeze({id:'onyx-base-move_south_east',kind:'locomotion',direction:'south_east',vector:Object.freeze([1,1]),
  walkSpeed:108,runSpeed:255,walkStride:78,runStride:116,framesPerCycle:5,
  walkRow:1,runRow:2,diagonal:true,
  frameAt(distance,pace='walk'){const stride=pace==='run'?this.runStride:this.walkStride;return {row:pace==='run'?2:1,phase:Math.floor(Math.max(0,distance)/stride*5)%5};}});
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(d):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(d));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-move_south.js --- */
/* south: independent 8-octant travel direction, measured-distance gait, wall sliding.
   Facing is EXACT in world space; Onyx's six-view artwork has north/south approximations. */
(function(root){'use strict';
 const d=Object.freeze({id:'onyx-base-move_south',kind:'locomotion',direction:'south',vector:Object.freeze([0,1]),
  walkSpeed:108,runSpeed:255,walkStride:78,runStride:116,framesPerCycle:5,
  walkRow:1,runRow:2,diagonal:false,
  frameAt(distance,pace='walk'){const stride=pace==='run'?this.runStride:this.walkStride;return {row:pace==='run'?2:1,phase:Math.floor(Math.max(0,distance)/stride*5)%5};}});
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(d):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(d));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-move_south_west.js --- */
/* south_west: independent 8-octant travel direction, measured-distance gait, wall sliding.
   Facing is EXACT in world space; Onyx's six-view artwork has north/south approximations. */
(function(root){'use strict';
 const d=Object.freeze({id:'onyx-base-move_south_west',kind:'locomotion',direction:'south_west',vector:Object.freeze([-1,1]),
  walkSpeed:108,runSpeed:255,walkStride:78,runStride:116,framesPerCycle:5,
  walkRow:1,runRow:2,diagonal:true,
  frameAt(distance,pace='walk'){const stride=pace==='run'?this.runStride:this.walkStride;return {row:pace==='run'?2:1,phase:Math.floor(Math.max(0,distance)/stride*5)%5};}});
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(d):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(d));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-move_west.js --- */
/* west: independent 8-octant travel direction, measured-distance gait, wall sliding.
   Facing is EXACT in world space; Onyx's six-view artwork has north/south approximations. */
(function(root){'use strict';
 const d=Object.freeze({id:'onyx-base-move_west',kind:'locomotion',direction:'west',vector:Object.freeze([-1,0]),
  walkSpeed:108,runSpeed:255,walkStride:78,runStride:116,framesPerCycle:5,
  walkRow:1,runRow:2,diagonal:false,
  frameAt(distance,pace='walk'){const stride=pace==='run'?this.runStride:this.walkStride;return {row:pace==='run'?2:1,phase:Math.floor(Math.max(0,distance)/stride*5)%5};}});
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(d):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(d));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-move_north_west.js --- */
/* north_west: independent 8-octant travel direction, measured-distance gait, wall sliding.
   Facing is EXACT in world space; Onyx's six-view artwork has north/south approximations. */
(function(root){'use strict';
 const d=Object.freeze({id:'onyx-base-move_north_west',kind:'locomotion',direction:'north_west',vector:Object.freeze([-1,-1]),
  walkSpeed:108,runSpeed:255,walkStride:78,runStride:116,framesPerCycle:5,
  walkRow:1,runRow:2,diagonal:true,
  frameAt(distance,pace='walk'){const stride=pace==='run'?this.runStride:this.walkStride;return {row:pace==='run'?2:1,phase:Math.floor(Math.max(0,distance)/stride*5)%5};}});
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(d):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(d));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-move_north.js --- */
/* north: independent 8-octant travel direction, measured-distance gait, wall sliding.
   Facing is EXACT in world space; Onyx's six-view artwork has north/south approximations. */
(function(root){'use strict';
 const d=Object.freeze({id:'onyx-base-move_north',kind:'locomotion',direction:'north',vector:Object.freeze([0,-1]),
  walkSpeed:108,runSpeed:255,walkStride:78,runStride:116,framesPerCycle:5,
  walkRow:1,runRow:2,diagonal:false,
  frameAt(distance,pace='walk'){const stride=pace==='run'?this.runStride:this.walkStride;return {row:pace==='run'?2:1,phase:Math.floor(Math.max(0,distance)/stride*5)%5};}});
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(d):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(d));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-move_north_east.js --- */
/* north_east: independent 8-octant travel direction, measured-distance gait, wall sliding.
   Facing is EXACT in world space; Onyx's six-view artwork has north/south approximations. */
(function(root){'use strict';
 const d=Object.freeze({id:'onyx-base-move_north_east',kind:'locomotion',direction:'north_east',vector:Object.freeze([1,-1]),
  walkSpeed:108,runSpeed:255,walkStride:78,runStride:116,framesPerCycle:5,
  walkRow:1,runRow:2,diagonal:true,
  frameAt(distance,pace='walk'){const stride=pace==='run'?this.runStride:this.walkStride;return {row:pace==='run'?2:1,phase:Math.floor(Math.max(0,distance)/stride*5)%5};}});
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(d):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(d));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-jump_up.js --- */
/* Onyx jump_up: physical arc with per-sample collision/valid landing, not a teleport. */
(function(root){'use strict';
 const def={id:'onyx-base-jump_up',kind:'jump',action:'jump_up',aliases:['jump_up'],durationMs:680,nonInterruptible:true,
  onStart(m,j){return m._jumpPlan(j,'jump_up');},
  onUpdate(m,j,dt){return m._jumpUpdate(j);},
  sample(m,j){let t=Math.min(1,j.elapsedMs/j.durationMs);
   if(t<.11)return {row:6,phase:Math.min(4,Math.floor(t*35))};
   if(t<.31)return {row:5,phase:Math.min(4,Math.floor((t-.11)*20))};
   if(t<.78)return {row:5,phase:Math.floor((t-.31)*9)%5};
   return {row:7,phase:Math.min(4,Math.floor((t-.78)*23))};
  }
 };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-jump_down.js --- */
/* Onyx jump_down: physical arc with per-sample collision/valid landing, not a teleport. */
(function(root){'use strict';
 const def={id:'onyx-base-jump_down',kind:'jump',action:'jump_down',aliases:['jump_down'],durationMs:600,nonInterruptible:true,
  onStart(m,j){return m._jumpPlan(j,'jump_down');},
  onUpdate(m,j,dt){return m._jumpUpdate(j);},
  sample(m,j){let t=Math.min(1,j.elapsedMs/j.durationMs);
   if(t<.11)return {row:6,phase:Math.min(4,Math.floor(t*35))};
   if(t<.31)return {row:5,phase:Math.min(4,Math.floor((t-.11)*20))};
   if(t<.78)return {row:7,phase:Math.floor((t-.31)*9)%5};
   return {row:7,phase:Math.min(4,Math.floor((t-.78)*23))};
  }
 };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-jump_across.js --- */
/* Onyx jump_across: physical arc with per-sample collision/valid landing, not a teleport. */
(function(root){'use strict';
 const def={id:'onyx-base-jump_across',kind:'jump',action:'jump_across',aliases:['jump_across'],durationMs:750,nonInterruptible:true,
  onStart(m,j){return m._jumpPlan(j,'jump_across');},
  onUpdate(m,j,dt){return m._jumpUpdate(j);},
  sample(m,j){let t=Math.min(1,j.elapsedMs/j.durationMs);
   if(t<.11)return {row:6,phase:Math.min(4,Math.floor(t*35))};
   if(t<.31)return {row:5,phase:Math.min(4,Math.floor((t-.11)*20))};
   if(t<.78)return {row:20,phase:Math.floor((t-.31)*9)%5};
   return {row:7,phase:Math.min(4,Math.floor((t-.78)*23))};
  }
 };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-stretch.js --- */
/* stretch: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-stretch',kind:'posture',action:'stretch',aliases:["stretch", "stretching"],
  durationMs:2050,defaultHold:false,
  sequence:[{"row": 0, "phase": 0, "end": 0.1}, {"row": 8, "phase": 0, "end": 0.23}, {"row": 8, "phase": 1, "end": 0.4}, {"row": 8, "phase": 2, "end": 0.52}, {"row": 8, "phase": 3, "end": 0.67}, {"row": 8, "phase": 4, "end": 0.8}, {"row": 0, "phase": 2, "end": 1}],holdSequence:[] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-loaf.js --- */
/* loaf: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-loaf',kind:'posture',action:'loaf',aliases:["loaf", "loafing"],
  durationMs:1800,defaultHold:true,
  sequence:[{"row": 0, "phase": 0, "end": 0.14}, {"row": 6, "phase": 0, "end": 0.3}, {"row": 17, "phase": 1, "end": 0.49}, {"row": 18, "phase": 0, "end": 0.76}, {"row": 18, "phase": 2, "end": 1}],holdSequence:[{"row": 18, "phase": 0}, {"row": 18, "phase": 1}, {"row": 18, "phase": 0}, {"row": 18, "phase": 2}] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-lounge.js --- */
/* lounge: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-lounge',kind:'posture',action:'lounge',aliases:["lounge", "lounging"],
  durationMs:2050,defaultHold:true,
  sequence:[{"row": 0, "phase": 0, "end": 0.16}, {"row": 12, "phase": 1, "end": 0.33}, {"row": 17, "phase": 1, "end": 0.55}, {"row": 17, "phase": 2, "end": 0.78}, {"row": 17, "phase": 3, "end": 1}],holdSequence:[{"row": 17, "phase": 2}, {"row": 17, "phase": 3}, {"row": 17, "phase": 4}] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-curl_ball.js --- */
/* curl_ball: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-curl_ball',kind:'posture',action:'curl_ball',aliases:["curl_ball", "curl", "curling"],
  durationMs:2600,defaultHold:true,
  sequence:[{"row": 12, "phase": 0, "end": 0.12}, {"row": 17, "phase": 2, "end": 0.26}, {"row": 16, "phase": 0, "end": 0.47}, {"row": 16, "phase": 1, "end": 0.69}, {"row": 16, "phase": 3, "end": 0.87}, {"row": 16, "phase": 4, "end": 1}],holdSequence:[{"row": 16, "phase": 1}, {"row": 16, "phase": 2}, {"row": 16, "phase": 3}, {"row": 16, "phase": 2}] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-eat_drink.js --- */
/* Onyx feeding: real normalized 12 SVG frames from user-provided Pass15 art.
   Modes eat/drink, 3 images per side. Stable grounded paws, separate left/right.
   A feeding event does NOT automatically consume inventory: optional onBite callback. */
(function(root){'use strict';
 const current=(typeof document!=='undefined'&&document.currentScript?.src)||'';
 const rootPath=current?new URL('../../../../assets/images/games/virtual/atlases/onyx-base-frames/',current).href:'assets/frames/';
 const url=(mode,side,frame)=>rootPath+'onyx_'+mode+'_'+side+'_'+String(frame).padStart(2,'0')+'.svg';
 // The bowl is a live world object: food cannot be consumed once it moves,
 // falls out of reach, or becomes hidden by furniture during a held feeding.
 const bowlCheck=(m,j)=>{const b=j.opts.bowl;if(!b)return {ok:true};
  const s=m.getState(),reach=Number(j.opts.reachPx??86);
  if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(reach)||reach<=0)return {ok:false,reason:'invalid-bowl'};
  if(Math.hypot(b.x-s.x,b.y-s.y)>reach)return {ok:false,reason:'bowl-out-of-reach'};
  if(!root.OnyxBasePhysics.clearApproach(m.getWorld(),s,b,4))return {ok:false,reason:'bowl-obstructed'};
  return {ok:true};};
 const def={id:'onyx-base-eat_drink' ,aliases:['eat_drink','eat','drink','feed'],kind:'feeding',action:'feed',durationMs:2600,
  onStart(m,j){j.data.mode=/^(water|drink|lapping)$/i.test(j.opts.mode||'')?'drink':'eat';
   const d=(j.opts.direction||m.getState().direction).replaceAll('-','_');j.data.side=['west','south_west','north_west','left'].includes(d)?'left':(['east','north_east','south_east','right'].includes(d)?'right':m.getState().lastSide);
   // Optional bowl proximity validator: host must provide world coordinates for realism.
   return bowlCheck(m,j);},
  onUpdate(m,j){
   const valid=bowlCheck(m,j);if(!valid.ok){m._emit('feeding-blocked',{reason:valid.reason,mode:j.data.mode,bowl:j.opts.bowl});return valid;}
   if(j.data.lastBite===undefined)j.data.lastBite=0;const duration=j.durationMs;
   const n=Math.floor(j.elapsedMs/360);if(n>j.data.lastBite&&(j.opts.loop===true||j.elapsedMs<duration-200)){j.data.lastBite=n;
    if(typeof j.opts.onBite==='function')j.opts.onBite({mode:j.data.mode,bite:n,frame:j.data.mode==='drink'?'lap':'chew'});
    m._emit(j.data.mode==='drink'?'lap':'bite',{bite:n,mode:j.data.mode});}
   return {ok:true};},
  sample(m,j){const t=j.hold?j.elapsedMs%j.durationMs:j.elapsedMs,duration=j.durationMs;
   const frame=t<duration*.12?1:t>duration*.91?3:([1,2,1,2,3,2][Math.floor(t/155)%6]);
   return {kind:'feeding_svg',row:10,phase:frame-1,mode:j.data.mode,side:j.data.side,url:url(j.data.mode,j.data.side,frame),visualSource:'user-supplied-12-SVG-frames'};}
 };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-sleep.js --- */
/* sleep: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-sleep',kind:'posture',action:'sleep',aliases:["sleep", "sleeping"],
  durationMs:2850,defaultHold:true,
  sequence:[{"row": 12, "phase": 2, "end": 0.09}, {"row": 18, "phase": 1, "end": 0.2}, {"row": 17, "phase": 1, "end": 0.4}, {"row": 19, "phase": 0, "end": 0.64}, {"row": 19, "phase": 1, "end": 0.83}, {"row": 19, "phase": 2, "end": 1}],holdSequence:[{"row": 19, "phase": 0}, {"row": 19, "phase": 0}, {"row": 19, "phase": 1}, {"row": 19, "phase": 0}, {"row": 19, "phase": 2}, {"row": 19, "phase": 0}] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-play_hunt.js --- */
/* Onyx interactive toy/fish play: pursuit -> crouch -> pounce -> paw -> recover.
   Catches are emitted ONLY after target overlap. Fish inventory remains host-owned. */
(function(root){'use strict';
 const def={id:'onyx-base-play_hunt',aliases:['play_hunt','play','hunt','play_with_toy','hunt_fish'],kind:'play',action:'play_hunt',durationMs:3000,
  onStart(m,j){const s=m.getState(),t=j.opts.target||{x:s.x+(j.opts.distancePx||95),y:s.y};
   if(!Number.isFinite(t.x)||!Number.isFinite(t.y))return {ok:false,reason:'invalid-target'};
   j.data.target={x:t.x,y:t.y};j.data.mode=j.opts.mode==='fish'?'fish':'toy';j.data.caught=false;j.data.pounced=false;j.data.failed=false;
   j.data.start={x:s.x,y:s.y};j.data.reach=Math.max(18,Number(j.opts.reachPx)||36);return {ok:true};},
  onUpdate(m,j,dt){const s=m.getState(),t=j.data.target;
   let p=j.elapsedMs/j.durationMs;
   // The host may move or remove a toy/fish while it is being hunted.
   // Before takeoff, track its new position. Once airborne, do not allow a
   // phantom catch at its old coordinates or teleport to a new trajectory.
   const live=j.opts.target;
   if(live){
    if(!Number.isFinite(live.x)||!Number.isFinite(live.y)){
     m._emit('play-blocked',{reason:'target-unavailable',target:t});return {ok:false,reason:'target-unavailable'};
    }
    if(Math.hypot(live.x-t.x,live.y-t.y)>2){
     if(p<.42){t.x=live.x;t.y=live.y;}
     else {m._emit('play-blocked',{reason:'target-moved',target:{x:live.x,y:live.y},previous:{...t}});return {ok:false,reason:'target-moved'};}
    }
   }
   if(p<.38){ // Stalk first: low-speed, distance-locked gait, keep away from the target until the leap.
    const dx=t.x-s.x,dy=t.y-s.y,dist=Math.hypot(dx,dy);
    if(dist>70){const moving=m._moveDuringAction(dx,dy,Math.min(dt, .030),'walk');if(moving.blocked)j.data.failed=true;}
   } else if(p>=.42&&p<.84){
    if(!j.data.pounced){j.data.pounced=true;const a=m.getState(),delta=Math.hypot(t.x-a.x,t.y-a.y);
     const g=m.getWorld();const phy=root.OnyxBasePhysics;
     // Aim just short of the fish or toy so a paw, not the whole cat, makes contact.
     const f=Math.max(0,(delta-20)/Math.max(1,delta));const x=a.x+(t.x-a.x)*f,y=a.y+(t.y-a.y)*f;
     const goal={x,y,z:phy.support(g,x,y)};
     const plan=phy.planJump(g,{x:a.x,y:a.y,z:a.z},goal,{arcPx:65,durationMs:Math.max(150,j.durationMs*.42),radius:12});
     if(plan.ok)j.data.plan=plan.plan;else {j.data.failed=true;m._emit('play-blocked',{reason:plan.reason,target:t});}
    }
    if(j.data.plan){
     const tt=Math.min(1,(p-.42)/.42),phy=root.OnyxBasePhysics,g=m.getWorld();
     const previous=j.data.pounceProgress||0;
     const check=phy.validateJumpSegment(g,j.data.plan,previous,tt,12);
     if(!check.ok){
      const launch=j.data.plan;
      if(!phy.occupied(g,launch.x0,launch.y0,launch.z0,12))m._setAirPosition(launch.x0,launch.y0,launch.z0);
      else if(j.data.lastSafe)m._setAirPosition(j.data.lastSafe.x,j.data.lastSafe.y,j.data.lastSafe.z);
      j.data.failed=true;
      m._emit('play-blocked',{reason:'pounce-obstructed',target:t,collision:check.at||null});
      return {ok:false,reason:'pounce-obstructed'};
     }
     const loc=phy.jumpSample(j.data.plan,tt);
     m._setAirPosition(loc.x,loc.y,loc.z);
     j.data.lastSafe={x:loc.x,y:loc.y,z:loc.z};j.data.pounceProgress=tt;
    }
   } else if(p>=.84){if(j.data.plan&&!j.data.landed){const g=j.data.plan;m._setAirPosition(g.x1,g.y1,g.z1);j.data.landed=true;}}
   const now=m.getState(),contact=Math.hypot(t.x-now.x,t.y-now.y);
   if(!j.data.caught&&j.data.pounced&&j.data.landed&&contact<=j.data.reach){
    // The last few pixels (between nose/paw and target) are not part of the
    // body pounce plan. Do not register a catch through a newly placed wall.
    if(!root.OnyxBasePhysics.clearApproach(m.getWorld(),now,t,4)){
     j.data.failed=true;m._emit('play-blocked',{reason:'target-obstructed',target:t});
     return {ok:false,reason:'target-obstructed'};
    }
    j.data.caught=true;
    const event={mode:j.data.mode,target:t,reachPx:j.data.reach,distancePx:contact};
    m._emit('target-contact',event);
    if(j.data.mode==='fish'){if(typeof j.opts.onFishContact==='function')j.opts.onFishContact(event);} else if(typeof j.opts.onToyContact==='function')j.opts.onToyContact(event);
   }
   return {ok:true};},
  sample(m,j){const p=Math.min(1,j.elapsedMs/j.durationMs);
   if(p<.16)return {row:14,phase:Math.floor(p*24)%5};
   if(p<.42)return {row:21,phase:Math.floor((p-.16)*15)%5};
   if(p<.84)return {row:20,phase:Math.floor((p-.42)*12)%5};
   if(p<.95)return {row:9,phase:Math.floor((p-.84)*35)%5};
   return {row:0,phase:0};},
  onStop(m,j,reason){
   if(j.data.plan){const s=m.getState(),w=m.getWorld(),phy=root.OnyxBasePhysics;
    if(s.z>phy.support(w,s.x,s.y)+.5){const launch=j.data.plan;
     if(!phy.occupied(w,launch.x0,launch.y0,launch.z0,12))m._setAirPosition(launch.x0,launch.y0,launch.z0);
    }
   }
   if(!j.data.caught)m._emit('play-missed',{reason,target:j.data.target,mode:j.data.mode});}
 };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);


/* --- onyx-base-sequences.js --- */
/* Pass21 host-side interaction conductor. Does not create another RAF loop.
 * Requires Pass18 runtime and attaches to its public events.
 * It never mutates needs, food stock, affection or fish ownership. */
(function(root){'use strict';
 const M=root.OnyxBaseMotion;
 if(!M)throw Error('Load onyx-base-runtime.js before onyx-base-sequences.js');
 function approach(target,action,opts={}){
  if(!target||!Number.isFinite(target.x)||!Number.isFinite(target.y))return {ok:false,reason:'invalid-target'};
  if(M.getState().job?.id&&!opts.interrupt)return {ok:false,reason:'busy'};
  const radius=Math.max(16,Number(opts.reachPx)||70),P=root.OnyxBasePhysics;const visible=pos=>P.clearApproach(M.getWorld(),pos,target,4);
  let finished=false;let offEnd=()=>{},offStart=()=>{};
  const end=reason=>{if(finished)return;finished=true;offEnd();offStart();if(reason!=='arrived')opts.onEnd?.({ok:false,reason});};
  const execute=()=>{if(finished)return;finished=true;offEnd();offStart();
   // Revalidate after navigation: the bowl or toy may have been moved or blocked.
   const here=M.getState(),distance=Math.hypot(target.x-here.x,target.y-here.y);
   if(distance>radius+2||!visible(here)){
    const result={ok:false,reason:distance>radius+2?'target-out-of-reach':'target-obstructed'};
    opts.onEnd?.(result);return;
   }
   const result=action();opts.onEnd?.(result);};
  const s=M.getState();const distance=Math.hypot(target.x-s.x,target.y-s.y);
  if(distance<=radius&&visible(s)){const result=action();opts.onEnd?.(result);return result;}
  // Approach from a reachable side rather than trying to occupy a bowl/fish itself.
  const firstAngle=Math.atan2(s.y-target.y,s.x-target.x);
  const candidates=[];
  for(let i=0;i<16;i++){
   const angle=firstAngle+(i%2?1:-1)*Math.ceil(i/2)*Math.PI/8;
   const goal={x:target.x+Math.cos(angle)*radius*.72,y:target.y+Math.sin(angle)*radius*.72};
   if(!visible({...goal,z:s.z}))continue;
   const waypoints=M.planTo(goal.x,goal.y,{cell:opts.cell||18});
   if(waypoints.length)candidates.push({goal,waypoints,score:waypoints.reduce((acc,p,k)=>{
    const before=waypoints[k-1]||(k===0?s:waypoints[0]);return acc+Math.hypot(p.x-before.x,p.y-before.y);
   },0)});
  }
  if(!candidates.length)return {ok:false,reason:'no-approach-route'};
  candidates.sort((a,b)=>a.score-b.score);
  const choice=candidates[0];
  const route=M.navigateTo(choice.goal.x,choice.goal.y,{pace:opts.pace||'walk',cell:opts.cell||18});
  if(!route.ok)return route;
  offEnd=M.on('navigation-end',e=>{if(e.reason==='arrived')execute();else end(e.reason);});
  offStart=M.on('action-start',()=>end('interrupted'));
  return {ok:true,approaching:true,waypoints:route.waypoints,target:{...target},cancel(){
   // Old handles cannot cancel an unrelated new movement or activity.
   if(finished)return false;
   // Cancel navigation alone, never cancel the actor's currently selected job.
   M.cancelNavigation('sequence-cancel');end('cancelled');return true;
  }};
 }
 const sequences={
  approach,
  eatAt(bowl,opts={}){return approach(bowl,()=>M.eat({...opts,bowl,reachPx:opts.reachPx||90}),opts);},
  drinkAt(bowl,opts={}){return approach(bowl,()=>M.drink({...opts,bowl,reachPx:opts.reachPx||90}),opts);},
  playAt(target,opts={}){return approach(target,()=>M.playWithToy({...opts,target}),{...opts,reachPx:opts.approachReachPx||155});},
  fishAt(target,opts={}){return approach(target,()=>M.huntFish({...opts,target}),{...opts,reachPx:opts.approachReachPx||155});}
 };
 root.OnyxBaseSequences=Object.freeze(sequences);
})(typeof window!=='undefined'?window:globalThis);

