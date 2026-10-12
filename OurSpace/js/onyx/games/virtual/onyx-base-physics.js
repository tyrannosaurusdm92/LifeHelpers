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
