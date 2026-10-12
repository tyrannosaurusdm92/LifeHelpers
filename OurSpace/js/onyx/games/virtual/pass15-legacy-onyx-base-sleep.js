/* onyx-base-sleep.js | separate sleep behavior.
 * Support: curled/resting native pose; sleeping eyes and breathing sprites pending. Trajectories are data, not a promise of dedicated sprite art.
 */
(function(root){'use strict';
 var frames=[
 {
  "t": 0,
  "phase": "slow-blink",
  "heightPx": -5,
  "bodyOffsetY": 1
 },
 {
  "t": 0.28,
  "phase": "lower-head",
  "heightPx": -8,
  "bodyOffsetY": 3
 },
 {
  "t": 0.6,
  "phase": "eyes-closed",
  "heightPx": -13,
  "bodyOffsetY": 4
 },
 {
  "t": 1,
  "phase": "asleep",
  "heightPx": -13,
  "bodyOffsetY": 4
 }
];
 function sample(elapsedMs,options){var length=Math.max(1,Number(options?.duration)||1850),progress=Math.min(1,Math.max(0,(Number(elapsedMs)||0)/length));var i=0;while(i<frames.length-2&&progress>frames[i+1].t)i++;var a=frames[i],b=frames[i+1],f=(progress-a.t)/Math.max(.00001,b.t-a.t);f=Math.max(0,Math.min(1,f));return {id:'onyx-base-sleep',action:'curlBall',progress,phase:a.phase,nextPhase:b.phase,interpolation:f,heightPx:a.heightPx+(b.heightPx-a.heightPx)*f,bodyOffsetY:a.bodyOffsetY+(b.bodyOffsetY-a.bodyOffsetY)*f,sourceVisual:'curlBall'};}
 var def={id:'onyx-base-sleep',kind:'posture',action:'curlBall',legacyAction:'curlBall',pose:'curlBall',durationMs:1850,canHold:true,support:"curled/resting native pose; sleeping eyes and breathing sprites pending",visualPlaceholder:true,phases:frames,sample};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
