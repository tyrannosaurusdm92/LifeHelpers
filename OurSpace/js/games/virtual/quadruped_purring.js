/* Research-applied Onyx quadruped frame profile: purring */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"purring",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_purring_sprite_atlas.png",timingMs:{idle:3100,walk:590,run:430,action:900},phaseWeights:{"idle":[9,1,10,1,10],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[3,1,2,1,3]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"slow rocking/purr cycle with a long settle"};
  window.OnyxFrameAnimation?.register(profile);
})();
