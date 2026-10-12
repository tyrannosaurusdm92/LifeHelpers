/* onyx-base-jump_up.js | separate jump up behavior.
 * Support: native jump visual; height and landing target integration pending. Trajectories are data, not a promise of dedicated sprite art.
 */
(function(root){'use strict';
 var frames=[
 {
  "t": 0,
  "phase": "crouch",
  "heightPx": 0,
  "bodyOffsetY": 0
 },
 {
  "t": 0.18,
  "phase": "push",
  "heightPx": 0,
  "bodyOffsetY": -3
 },
 {
  "t": 0.43,
  "phase": "rise",
  "heightPx": 30,
  "bodyOffsetY": -4
 },
 {
  "t": 0.72,
  "phase": "reach",
  "heightPx": 46,
  "bodyOffsetY": 0
 },
 {
  "t": 0.9,
  "phase": "land",
  "heightPx": 10,
  "bodyOffsetY": 5
 },
 {
  "t": 1,
  "phase": "settle",
  "heightPx": 0,
  "bodyOffsetY": 0
 }
];
 function sample(elapsedMs,options){var length=Math.max(1,Number(options?.duration)||600),progress=Math.min(1,Math.max(0,(Number(elapsedMs)||0)/length));var i=0;while(i<frames.length-2&&progress>frames[i+1].t)i++;var a=frames[i],b=frames[i+1],f=(progress-a.t)/Math.max(.00001,b.t-a.t);f=Math.max(0,Math.min(1,f));return {id:'onyx-base-jump_up',action:'jump',progress,phase:a.phase,nextPhase:b.phase,interpolation:f,heightPx:a.heightPx+(b.heightPx-a.heightPx)*f,bodyOffsetY:a.bodyOffsetY+(b.bodyOffsetY-a.bodyOffsetY)*f,sourceVisual:'jumpTakeoff'};}
 var def={id:'onyx-base-jump_up',kind:'jump',action:'jump',legacyAction:'jumpTakeoff',pose:'jumpForward',durationMs:600,canHold:false,support:"native jump visual; height and landing target integration pending",visualPlaceholder:true,phases:frames,sample};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
