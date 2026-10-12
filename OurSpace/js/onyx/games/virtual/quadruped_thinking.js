/* Research-applied Onyx quadruped frame profile: thinking */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"thinking",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_thinking_sprite_atlas.png",timingMs:{idle:3000,walk:560,run:420,action:900},phaseWeights:{"idle":[8,1,10,1,11],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[3,1,2,1,4]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"hold the thought pose; let gaze/head accents land separately"};
  window.OnyxFrameAnimation?.register(profile);
})();
