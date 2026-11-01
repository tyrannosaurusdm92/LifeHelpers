/* Adventures bridge: living three-cat WASM scene; no bogus sensing/backend. */
(function(){
  'use strict';
  let connected=false;
  function attach(){
    const world=window.WanderingWorld?.app,shell=window.onyxAdventuresShell;
    if(connected||!world||!shell||!world._loaded)return;
    connected=true;
    shell.connect({
      sceneOnly:false,
      getPetState(){return world.cats.getPetState();},
      onCare(action){return world.cats.onCare(action.action);},
      setPaused(value){world.camera.setPaused(!!value);world.sound.setPaused(!!value);if(value)world.cats.stopMeows();},
      setVolume(value){world.sound.setHudVolume?.(Number(value));
        if(value===0){world.sound.disable();world.cats.stopMeows();}},
      setAccessibility(options){world.camera.setMotionReduced(!!options.reducedMotion);
        world.ui.applyControlValues();
        world.cats.reduceMotion=!!options.reducedMotion;
        if(options.reducedMotion)world.particles.setDensity(Math.min(.25,world.particles.density));}
      // replyToChat deliberately absent: no authenticated AI backend. 
    });
    // Nature audio is unlocked only by an explicit click (never on page load).
    for(const b of document.querySelectorAll('.hud-sound'))b.addEventListener('click',async()=>{
      const value=Number(b.dataset.volume);
      if(value>0){await world.sound.enable();world.sound.setHudVolume?.(value);
        world.sound.setPaused(shell.getSnapshot().paused);}
      else{world.sound.setHudVolume?.(0);world.sound.disable();world.cats.stopMeows();}
    });
    const go=document.getElementById('connectionReadout');
    if(go)go.dataset.sceneReady='true';
    window.dispatchEvent(new CustomEvent('onyx-adventures:scene-connected',{detail:{catSprite:true,cats:['onyx','callie','harvey']}}));
  }
  window.addEventListener('onyx-adventures:ready',attach);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});
  else attach();
})();
