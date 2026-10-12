/* onyx-base-jump_down.js | separate jump down behavior.
 * Support: native jump/drop frames; elevated furniture physics pending. Trajectories are data, not a promise of dedicated sprite art.
 */
(function(root){'use strict';
 var frames=[
 {
  "t": 0,
  "phase": "edge-crouch",
  "heightPx": 0,
  "bodyOffsetY": 0
 },
 {
  "t": 0.2,
  "phase": "release",
  "heightPx": 8,
  "bodyOffsetY": -4
 },
 {
  "t": 0.47,
  "phase": "fall",
  "heightPx": -6,
  "bodyOffsetY": 2
 },
 {
  "t": 0.76,
  "phase": "forepaw-landing",
  "heightPx": -18,
  "bodyOffsetY": 3
 },
 {
  "t": 1,
  "phase": "settle",
  "heightPx": 0,
  "bodyOffsetY": 0
 }
];
 function sample(elapsedMs,options){var length=Math.max(1,Number(options?.duration)||510),progress=Math.min(1,Math.max(0,(Number(elapsedMs)||0)/length));var i=0;while(i<frames.length-2&&progress>frames[i+1].t)i++;var a=frames[i],b=frames[i+1],f=(progress-a.t)/Math.max(.00001,b.t-a.t);f=Math.max(0,Math.min(1,f));return {id:'onyx-base-jump_down',action:'drop',progress,phase:a.phase,nextPhase:b.phase,interpolation:f,heightPx:a.heightPx+(b.heightPx-a.heightPx)*f,bodyOffsetY:a.bodyOffsetY+(b.bodyOffsetY-a.bodyOffsetY)*f,sourceVisual:'jumpAir'};}
 var def={id:'onyx-base-jump_down',kind:'jump',action:'drop',legacyAction:'jumpAir',pose:'jumpForward',durationMs:510,canHold:false,support:"native jump/drop frames; elevated furniture physics pending",visualPlaceholder:true,phases:frames,sample};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
