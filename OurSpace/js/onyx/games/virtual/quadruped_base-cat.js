/* Research-applied Onyx quadruped frame profile: base_cat */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"base_cat",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_meow_sprite_atlas.png",timingMs:{idle:2500,walk:520,run:390,action:900},phaseWeights:{"idle":[7,1,8,1,9],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[2,1,1,1,2]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"neutral moving hold; quiet breath; full contact and recovery"};
  window.OnyxFrameAnimation?.register(profile);
})();
