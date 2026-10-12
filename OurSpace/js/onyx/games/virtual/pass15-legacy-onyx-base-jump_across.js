/* onyx-base-jump_across.js | separate jump across behavior.
 * Support: native jump sequence; across-gap collision and landing targets pending. Trajectories are data, not a promise of dedicated sprite art.
 */
(function(root){'use strict';
 var frames=[
 {
  "t": 0,
  "phase": "gather",
  "heightPx": 0,
  "bodyOffsetY": 0
 },
 {
  "t": 0.16,
  "phase": "launch",
  "heightPx": 12,
  "bodyOffsetY": -3
 },
 {
  "t": 0.45,
  "phase": "extension",
  "heightPx": 34,
  "bodyOffsetY": -5
 },
 {
  "t": 0.7,
  "phase": "flight",
  "heightPx": 28,
  "bodyOffsetY": -2
 },
 {
  "t": 0.91,
  "phase": "land",
  "heightPx": 6,
  "bodyOffsetY": 4
 },
 {
  "t": 1,
  "phase": "recover",
  "heightPx": 0,
  "bodyOffsetY": 0
 }
];
 function sample(elapsedMs,options){var length=Math.max(1,Number(options?.duration)||590),progress=Math.min(1,Math.max(0,(Number(elapsedMs)||0)/length));var i=0;while(i<frames.length-2&&progress>frames[i+1].t)i++;var a=frames[i],b=frames[i+1],f=(progress-a.t)/Math.max(.00001,b.t-a.t);f=Math.max(0,Math.min(1,f));return {id:'onyx-base-jump_across',action:'jump',progress,phase:a.phase,nextPhase:b.phase,interpolation:f,heightPx:a.heightPx+(b.heightPx-a.heightPx)*f,bodyOffsetY:a.bodyOffsetY+(b.bodyOffsetY-a.bodyOffsetY)*f,sourceVisual:'jumpForward'};}
 var def={id:'onyx-base-jump_across',kind:'jump',action:'jump',legacyAction:'jumpForward',pose:'jumpForward',durationMs:590,canHold:false,support:"native jump sequence; across-gap collision and landing targets pending",visualPlaceholder:true,phases:frames,sample};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
