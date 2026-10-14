/* Research-applied Onyx quadruped frame profile: snuggly */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"snuggly",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_snuggly_sprite_atlas.png",timingMs:{idle:3450,walk:630,run:470,action:900},phaseWeights:{"idle":[10,1,11,1,12],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[3,1,3,1,4]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"weighted sink and settle; tail follows the body pose"};
  window.OnyxFrameAnimation?.register(profile);
})();
