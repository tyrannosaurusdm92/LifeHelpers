/* stretch: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-stretch',kind:'posture',action:'stretch',aliases:["stretch", "stretching"],
  durationMs:2050,defaultHold:false,
  sequence:[{"row": 0, "phase": 0, "end": 0.1}, {"row": 8, "phase": 0, "end": 0.23}, {"row": 8, "phase": 1, "end": 0.4}, {"row": 8, "phase": 2, "end": 0.52}, {"row": 8, "phase": 3, "end": 0.67}, {"row": 8, "phase": 4, "end": 0.8}, {"row": 0, "phase": 2, "end": 1}],holdSequence:[] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
