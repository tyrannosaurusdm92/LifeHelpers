/* onyx-base-loaf.js | separate loaf behavior.
 * Support: native quadruped loaf. Trajectories are data, not a promise of dedicated sprite art.
 */
(function(root){'use strict';
 var frames=[
 {
  "t": 0,
  "phase": "sit",
  "heightPx": 0,
  "bodyOffsetY": 0
 },
 {
  "t": 0.35,
  "phase": "forepaws-tuck",
  "heightPx": -6,
  "bodyOffsetY": 3
 },
 {
  "t": 0.7,
  "phase": "compact",
  "heightPx": -12,
  "bodyOffsetY": 4
 },
 {
  "t": 1,
  "phase": "loaf",
  "heightPx": -12,
  "bodyOffsetY": 4
 }
];
 function sample(elapsedMs,options){var length=Math.max(1,Number(options?.duration)||850),progress=Math.min(1,Math.max(0,(Number(elapsedMs)||0)/length));var i=0;while(i<frames.length-2&&progress>frames[i+1].t)i++;var a=frames[i],b=frames[i+1],f=(progress-a.t)/Math.max(.00001,b.t-a.t);f=Math.max(0,Math.min(1,f));return {id:'onyx-base-loaf',action:'loaf',progress,phase:a.phase,nextPhase:b.phase,interpolation:f,heightPx:a.heightPx+(b.heightPx-a.heightPx)*f,bodyOffsetY:a.bodyOffsetY+(b.bodyOffsetY-a.bodyOffsetY)*f,sourceVisual:'loaf'};}
 var def={id:'onyx-base-loaf',kind:'posture',action:'loaf',legacyAction:'loaf',pose:'loaf',durationMs:850,canHold:true,support:"native quadruped loaf",visualPlaceholder:false,phases:frames,sample};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
