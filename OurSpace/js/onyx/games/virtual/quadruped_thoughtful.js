/* Research-applied Onyx quadruped frame profile: thoughtful */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"thoughtful",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_thoughtful_sprite_atlas.png",timingMs:{idle:2800,walk:540,run:400,action:900},phaseWeights:{"idle":[8,1,9,1,10],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[2,1,2,1,3]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"gentle head tilt, pause, and return with visible settling"};
  window.OnyxFrameAnimation?.register(profile);
})();
