/* onyx-base-move_west.js | walk and run in the west octant.
 * 8-direction world movement, 6-direction legacy Onyx atlas fallback.
 * Trap the Cat inspired: discrete directional choice and cyclic five-frame gait.
 */
(function(root){'use strict';
 var vector=[-1,0],walkMs=520,runMs=310;
 var walkCycle=[{feet:'contact',weight:.50,tail:0},{feet:'front-transfer',weight:.58,tail:1},{feet:'rear-push',weight:.38,tail:2},{feet:'cross-contact',weight:.61,tail:1},{feet:'settle',weight:.48,tail:0}];
 var runCycle=[{feet:'gather',weight:.34,tail:2},{feet:'launch',weight:.65,tail:3},{feet:'airborne',weight:0,tail:4},{feet:'forepaw-reach',weight:.45,tail:2},{feet:'land',weight:.77,tail:1}];
 function frameAt(elapsedMs,pace){var running=pace==='run',cycle=running?runCycle:walkCycle,period=running?runMs:walkMs,index=Math.floor((Math.max(0,Number(elapsedMs)||0)%period)/period*cycle.length)%cycle.length;return {...cycle[index],index,frames:5,pace:running?'run':'walk',durationMs:period,legacyDirection:3,octant:4};}
 function step(position,seconds,pace,opts){var speed=pace==='run'?(opts.speedRun??.32):(opts.speedWalk??.16),dt=Math.max(0,Math.min(.1,Number(seconds)||0));return {x:Number(position.x)+vector[0]*speed*dt,y:Number(position.y)+vector[1]*speed*dt,frame:frameAt(opts.elapsedMs||0,pace)};}
 var def={id:'onyx-base-move_west',kind:'locomotion',direction:'west',vector,legacyDirection:3,gaits:{walk:walkCycle,run:runCycle},frameAt,step,support:'implemented; sprite orientation falls back to six-direction legacy atlas'};
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
