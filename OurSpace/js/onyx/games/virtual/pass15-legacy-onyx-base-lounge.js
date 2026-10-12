/* onyx-base-lounge.js | separate lounge behavior.
 * Support: snuggle/recline fallback, distinct lounge sprite pending. Trajectories are data, not a promise of dedicated sprite art.
 */
(function(root){'use strict';
 var frames=[
 {
  "t": 0,
  "phase": "lower-front",
  "heightPx": -3,
  "bodyOffsetY": 1
 },
 {
  "t": 0.3,
  "phase": "roll-hip",
  "heightPx": -10,
  "bodyOffsetY": 4
 },
 {
  "t": 0.64,
  "phase": "extend-hindlegs",
  "heightPx": -16,
  "bodyOffsetY": 4
 },
 {
  "t": 1,
  "phase": "reclined",
  "heightPx": -16,
  "bodyOffsetY": 4
 }
];
 function sample(elapsedMs,options){var length=Math.max(1,Number(options?.duration)||1250),progress=Math.min(1,Math.max(0,(Number(elapsedMs)||0)/length));var i=0;while(i<frames.length-2&&progress>frames[i+1].t)i++;var a=frames[i],b=frames[i+1],f=(progress-a.t)/Math.max(.00001,b.t-a.t);f=Math.max(0,Math.min(1,f));return {id:'onyx-base-lounge',action:'snuggle',progress,phase:a.phase,nextPhase:b.phase,interpolation:f,heightPx:a.heightPx+(b.heightPx-a.heightPx)*f,bodyOffsetY:a.bodyOffsetY+(b.bodyOffsetY-a.bodyOffsetY)*f,sourceVisual:'snuggle'};}
 var def={id:'onyx-base-lounge',kind:'posture',action:'snuggle',legacyAction:'snuggle',pose:'curlBall',durationMs:1250,canHold:true,support:"snuggle/recline fallback, distinct lounge sprite pending",visualPlaceholder:true,phases:frames,sample};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
