/* curl_ball: distinct transition, hold and recovery poses from actual Onyx atlas rows. */
(function(root){'use strict';
 const def={id:'onyx-base-curl_ball',kind:'posture',action:'curl_ball',aliases:["curl_ball", "curl", "curling"],
  durationMs:2600,defaultHold:true,
  sequence:[{"row": 12, "phase": 0, "end": 0.12}, {"row": 17, "phase": 2, "end": 0.26}, {"row": 16, "phase": 0, "end": 0.47}, {"row": 16, "phase": 1, "end": 0.69}, {"row": 16, "phase": 3, "end": 0.87}, {"row": 16, "phase": 4, "end": 1}],holdSequence:[{"row": 16, "phase": 1}, {"row": 16, "phase": 2}, {"row": 16, "phase": 3}, {"row": 16, "phase": 2}] };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
