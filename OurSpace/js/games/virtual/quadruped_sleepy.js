/* Research-applied Onyx quadruped frame profile: sleepy */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"sleepy",form:"quadruped",asset:"assets/images/games/virtual/atlases/onyx_sleepy_sprite_atlas.png",timingMs:{idle:3900,walk:690,run:520,action:900},phaseWeights:{"idle":[12,1,13,1,14],"walk":[1,1,1,1,1],"run":[1,1,1,1,1],"action":[4,1,2,1,5]},idleSequence:[0,1,2,3,4],gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"slow drooping holds; rare short blink or ear twitch"};
  window.OnyxFrameAnimation?.register(profile);
})();
