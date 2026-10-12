/* onyx-base-stretch.js | separate stretch behavior.
 * Support: native stretching bow plus pose tuning. Trajectories are data, not a promise of dedicated sprite art.
 */
(function(root){'use strict';
 var frames=[
 {
  "t": 0,
  "phase": "stand",
  "heightPx": 0,
  "bodyOffsetY": 0
 },
 {
  "t": 0.23,
  "phase": "forelegs-forward",
  "heightPx": -8,
  "bodyOffsetY": 2
 },
 {
  "t": 0.55,
  "phase": "bow",
  "heightPx": -13,
  "bodyOffsetY": 3
 },
 {
  "t": 0.8,
  "phase": "rear-rise",
  "heightPx": -6,
  "bodyOffsetY": 2
 },
 {
  "t": 1,
  "phase": "stand",
  "heightPx": 0,
  "bodyOffsetY": 0
 }
];
 function sample(elapsedMs,options){var length=Math.max(1,Number(options?.duration)||1600),progress=Math.min(1,Math.max(0,(Number(elapsedMs)||0)/length));var i=0;while(i<frames.length-2&&progress>frames[i+1].t)i++;var a=frames[i],b=frames[i+1],f=(progress-a.t)/Math.max(.00001,b.t-a.t);f=Math.max(0,Math.min(1,f));return {id:'onyx-base-stretch',action:'stretchBow',progress,phase:a.phase,nextPhase:b.phase,interpolation:f,heightPx:a.heightPx+(b.heightPx-a.heightPx)*f,bodyOffsetY:a.bodyOffsetY+(b.bodyOffsetY-a.bodyOffsetY)*f,sourceVisual:'stretchBow'};}
 var def={id:'onyx-base-stretch',kind:'posture',action:'stretchBow',legacyAction:'stretchBow',pose:'stretchBow',durationMs:1600,canHold:false,support:"native stretching bow plus pose tuning",visualPlaceholder:false,phases:frames,sample};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
