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
