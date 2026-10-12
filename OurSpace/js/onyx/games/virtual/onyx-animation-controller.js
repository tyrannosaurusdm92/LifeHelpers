/* Onyx Pass 35: independent, asset-free distance-driven flipbook clock.
   Uses existing authored sheets. Never modifies the renderer or backend. */
(function(root){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),finite=Number.isFinite;
const views=['east','south_east','south_west','west','north_west','north_east'];
const defaults={idle:2500,walk:520,run:390,action:900};
function profile(p={}){
 const duration={},weights={};
 for(const k of Object.keys(defaults)){
  duration[k]=finite(p[k])&&p[k]>0?p[k]:defaults[k];
  const a=p.weights?.[k];
  weights[k]=Array.isArray(a)&&a.length===5&&a.some(v=>finite(v)&&v>0)?a.map(v=>finite(v)?Math.max(0,v):0):[1,1,1,1,1];
 }return {duration,weights};
}
function sample(t,length,weights){
 const sum=weights.reduce((a,b)=>a+b,0);if(!sum||!length)return 0;
 const fraction=((t%length)+length)%length/length;let progress=0;
 for(let i=0;i<weights.length;i++){progress+=weights[i]/sum;if(fraction<progress)return i;}
 return weights.length-1;
}
function facing(dir,prior='east'){
 if(views.includes(dir))return dir;
 const left=['west','north_west','south_west'].includes(prior);
 if(dir==='north')return left?'north_west':'north_east';
 if(dir==='south')return left?'south_west':'south_east';
 return views.includes(prior)?prior:'east';
}
function create(options={}){
 let p=profile(options.profile),action='idle',dir='south_east',side='south_east';
 let elapsed=0,distance=0,paused=false,reduced=!!options.reducedMotion;
 const cycle={walk:finite(options.walkCyclePx)&&options.walkCyclePx>0?options.walkCyclePx:60,
              run:finite(options.runCyclePx)&&options.runCyclePx>0?options.runCyclePx:96};
 function frame(){
  const v=facing(dir,side),idx=views.indexOf(v);
  const isWalking=action==='walk'||action==='run';
  const clock=isWalking?distance/cycle[action]*p.duration[action]:elapsed;
  const phase=reduced?0:sample(clock,p.duration[action],p.weights[action]);
  return {action,direction:dir,authoredFacing:v,approximatedFacing:dir==='north'||dir==='south',
   phase,col:idx*5+phase,row:{idle:0,walk:1,run:2,action:8}[action],
   cellSize:64,elapsedMs:elapsed,travelPx:distance,reducedMotion:reduced};
 }
 return Object.freeze({
  setAction(next){const n=Object.hasOwn(defaults,next)?next:'idle';if(action!==n){action=n;elapsed=0;}return frame();},
  setDirection(next){if(views.includes(next)){dir=next;side=next;}else if(next==='north'||next==='south')dir=next;return frame();},
  setProfile(next){p=profile(next);return frame();},
  setReducedMotion(v){reduced=!!v;},setPaused(v){paused=!!v;},
  setCycleDistance(pace,px){if(Object.hasOwn(cycle,pace)&&finite(px)&&px>0)cycle[pace]=px;},
  tick(dtMs,displacementPx=0){if(!finite(dtMs)||dtMs<0)return frame();
   if(!paused){elapsed+=Math.min(dtMs,250);if((action==='walk'||action==='run')&&finite(displacementPx)&&displacementPx>0)distance+=displacementPx;}
   return frame();},
  reset(){elapsed=0;distance=0;action='idle';},getFrame:frame
 });
}
root.OnyxAnimationController=Object.freeze({version:'35.0',create,facing,profile});
})(typeof window!=='undefined'?window:globalThis);
