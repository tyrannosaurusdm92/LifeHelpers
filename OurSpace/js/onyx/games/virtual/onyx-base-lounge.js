/* lounge: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-lounge',kind:'posture',action:'lounge',aliases:["lounge", "lounging"],
  durationMs:2050,defaultHold:true,
  sequence:[{"row": 0, "phase": 0, "end": 0.16}, {"row": 12, "phase": 1, "end": 0.33}, {"row": 17, "phase": 1, "end": 0.55}, {"row": 17, "phase": 2, "end": 0.78}, {"row": 17, "phase": 3, "end": 1}],holdSequence:[{"row": 17, "phase": 2}, {"row": 17, "phase": 3}, {"row": 17, "phase": 4}] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
