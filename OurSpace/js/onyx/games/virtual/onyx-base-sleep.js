/* sleep: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-sleep',kind:'posture',action:'sleep',aliases:["sleep", "sleeping"],
  durationMs:2850,defaultHold:true,
  sequence:[{"row": 12, "phase": 2, "end": 0.09}, {"row": 18, "phase": 1, "end": 0.2}, {"row": 17, "phase": 1, "end": 0.4}, {"row": 19, "phase": 0, "end": 0.64}, {"row": 19, "phase": 1, "end": 0.83}, {"row": 19, "phase": 2, "end": 1}],holdSequence:[{"row": 19, "phase": 0}, {"row": 19, "phase": 0}, {"row": 19, "phase": 1}, {"row": 19, "phase": 0}, {"row": 19, "phase": 2}, {"row": 19, "phase": 0}] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
