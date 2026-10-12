/* onyx-base-play_hunt.js | separate play hunt behavior.
 * Support: placeholder: target/toy pursuit and fish-catch events need game-specific input. Trajectories are data, not a promise of dedicated sprite art.
 */
(function(root){'use strict';
 var frames=[
 {
  "t": 0,
  "phase": "stalk",
  "heightPx": 0,
  "bodyOffsetY": -2
 },
 {
  "t": 0.18,
  "phase": "focus",
  "heightPx": -5,
  "bodyOffsetY": -4
 },
 {
  "t": 0.43,
  "phase": "pounce",
  "heightPx": 22,
  "bodyOffsetY": -2
 },
 {
  "t": 0.66,
  "phase": "paw-catch",
  "heightPx": 5,
  "bodyOffsetY": 2
 },
 {
  "t": 0.83,
  "phase": "bat",
  "heightPx": -1,
  "bodyOffsetY": 3
 },
 {
  "t": 1,
  "phase": "recover",
  "heightPx": 0,
  "bodyOffsetY": 0
 }
];
 function sample(elapsedMs,options){var length=Math.max(1,Number(options?.duration)||920),progress=Math.min(1,Math.max(0,(Number(elapsedMs)||0)/length));var i=0;while(i<frames.length-2&&progress>frames[i+1].t)i++;var a=frames[i],b=frames[i+1],f=(progress-a.t)/Math.max(.00001,b.t-a.t);f=Math.max(0,Math.min(1,f));return {id:'onyx-base-play_hunt',action:'primary',progress,phase:a.phase,nextPhase:b.phase,interpolation:f,heightPx:a.heightPx+(b.heightPx-a.heightPx)*f,bodyOffsetY:a.bodyOffsetY+(b.bodyOffsetY-a.bodyOffsetY)*f,sourceVisual:'primary'};}
 var def={id:'onyx-base-play_hunt',kind:'interaction',action:'primary',legacyAction:'primary',pose:'jumpForward',durationMs:920,canHold:false,support:"placeholder: target/toy pursuit and fish-catch events need game-specific input",visualPlaceholder:true,phases:frames,sample};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
