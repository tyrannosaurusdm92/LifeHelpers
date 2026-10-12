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
