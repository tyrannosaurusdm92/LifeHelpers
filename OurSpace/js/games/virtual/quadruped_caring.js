/* Research-applied Onyx quadruped frame profile: caring */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"caring",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_caring_sprite_atlas.png",timingMs:{idle:2500,walk:520,run:390,action:900},phaseWeights:{"idle":[7,1,8,1,9],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[2,1,1,1,2]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"soft attention with held readable poses and small response accents"};
  window.OnyxFrameAnimation?.register(profile);
})();
