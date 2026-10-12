/* loaf: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-loaf',kind:'posture',action:'loaf',aliases:["loaf", "loafing"],
  durationMs:1800,defaultHold:true,
  sequence:[{"row": 0, "phase": 0, "end": 0.14}, {"row": 6, "phase": 0, "end": 0.3}, {"row": 17, "phase": 1, "end": 0.49}, {"row": 18, "phase": 0, "end": 0.76}, {"row": 18, "phase": 2, "end": 1}],holdSequence:[{"row": 18, "phase": 0}, {"row": 18, "phase": 1}, {"row": 18, "phase": 0}, {"row": 18, "phase": 2}] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
