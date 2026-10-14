/* Research-applied Onyx Professor biped frame profile. */
(()=>{
  "use strict";
  const profile={schema:"onyx-frame-profile/v1",id:"advising_professor",form:"biped",asset:"assets/images/games/virtual/atlases/onyx_professor_sprite_atlas.png",clipTimingsMs:{"idle_stand":[680,100,760,100,940],"walk_quadruped":170,"walk_biped":150,"professor_enter_rise":[100,120,150,150,210],"professor_exit_rise":[210,150,150,120,100],"professor_enter_spin":[90,85,105,125,165],"professor_exit_spin":[165,125,105,85,90],"professor_sit_settle":[100,135,160,180,185],"professor_sit_prepare":[210,185,165,140,120],"professor_sit_lean":[340,140,520,140,360],"professor_sit_listen":[380,130,500,130,360],"professor_sit_notes":[300,160,500,160,380],"professor_sit_crossed":[400,140,500,140,360]},gaitPhaseSource:"screen-distance",researchPass:6,performanceNote:"clear key poses, weighted holds, anticipatory rise, settle, and restrained seated moving holds"};
  window.OnyxFrameAnimation?.register(profile);
})();
