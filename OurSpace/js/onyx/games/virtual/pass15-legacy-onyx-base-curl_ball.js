/* onyx-base-curl_ball.js | separate curl ball behavior.
 * Support: native quadruped curlBall. Trajectories are data, not a promise of dedicated sprite art.
 */
(function(root){'use strict';
 var frames=[
 {
  "t": 0,
  "phase": "loaf",
  "heightPx": -8,
  "bodyOffsetY": 2
 },
 {
  "t": 0.2,
  "phase": "tail-wrap",
  "heightPx": -9,
  "bodyOffsetY": 4
 },
 {
  "t": 0.55,
  "phase": "tuck-hindlegs",
  "heightPx": -15,
  "bodyOffsetY": 6
 },
 {
  "t": 1,
  "phase": "tight-curl",
  "heightPx": -18,
  "bodyOffsetY": 6
 }
];
 function sample(elapsedMs,options){var length=Math.max(1,Number(options?.duration)||1100),progress=Math.min(1,Math.max(0,(Number(elapsedMs)||0)/length));var i=0;while(i<frames.length-2&&progress>frames[i+1].t)i++;var a=frames[i],b=frames[i+1],f=(progress-a.t)/Math.max(.00001,b.t-a.t);f=Math.max(0,Math.min(1,f));return {id:'onyx-base-curl_ball',action:'curlBall',progress,phase:a.phase,nextPhase:b.phase,interpolation:f,heightPx:a.heightPx+(b.heightPx-a.heightPx)*f,bodyOffsetY:a.bodyOffsetY+(b.bodyOffsetY-a.bodyOffsetY)*f,sourceVisual:'curlBall'};}
 var def={id:'onyx-base-curl_ball',kind:'posture',action:'curlBall',legacyAction:'curlBall',pose:'curlBall',durationMs:1100,canHold:true,support:"native quadruped curlBall",visualPlaceholder:false,phases:frames,sample};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
