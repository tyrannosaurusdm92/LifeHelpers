/* north: independent 8-octant travel direction, measured-distance gait, wall sliding.
   Facing is EXACT in world space; Onyx's six-view artwork has north/south approximations. */
(function(root){'use strict';
 const d=Object.freeze({id:'onyx-base-move_north',kind:'locomotion',direction:'north',vector:Object.freeze([0,-1]),
  walkSpeed:108,runSpeed:255,walkStride:78,runStride:116,framesPerCycle:5,
  walkRow:1,runRow:2,diagonal:false,
  frameAt(distance,pace='walk'){const stride=pace==='run'?this.runStride:this.walkStride;return {row:pace==='run'?2:1,phase:Math.floor(Math.max(0,distance)/stride*5)%5};}});
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(d):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(d));
})(typeof window!=='undefined'?window:globalThis);
