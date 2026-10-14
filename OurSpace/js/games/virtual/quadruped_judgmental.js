/* Research-applied Onyx quadruped frame profile: judgmental */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"judgmental",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_judgmental_sprite_atlas.png",timingMs:{idle:2850,walk:560,run:410,action:900},phaseWeights:{"idle":[9,1,7,1,9],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[3,1,1,1,3]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"long dry holds with short, precise eye and head accents"};
  window.OnyxFrameAnimation?.register(profile);
})();
