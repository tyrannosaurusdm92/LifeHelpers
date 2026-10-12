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
