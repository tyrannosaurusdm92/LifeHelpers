/* Research-applied Onyx quadruped frame profile: listening */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"listening",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_listening_sprite_atlas.png",timingMs:{idle:2350,walk:500,run:370,action:900},phaseWeights:{"idle":[7,1,8,1,7],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[2,1,1,1,2]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"listening hold; head and ear response follows the cue"};
  window.OnyxFrameAnimation?.register(profile);
})();
