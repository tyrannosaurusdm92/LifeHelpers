/* Research-applied Onyx quadruped frame profile: hungry */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"hungry",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_hungry_sprite_atlas.png",timingMs:{idle:1650,walk:440,run:340,action:900},phaseWeights:{"idle":[4,1,4,1,4],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[1,1,2,1,2]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"alert sniffing rhythm; brief anticipation accents before food actions"};
  window.OnyxFrameAnimation?.register(profile);
})();
