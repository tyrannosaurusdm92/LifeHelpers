(function(){
  "use strict";
  const current = document.currentScript;
  const base = current && current.src ? current.src.replace(/\/js\/gamebots\.js(?:\?.*)?$/, "") : "GameBots";
  const files = [
    "js/core/runtime.js",
    "js/bots/universal/universal-agile-navigator.js",
    "js/bots/universal/universal-duelist.js",
    "js/bots/universal/universal-projectile-sniper.js",
    "js/bots/universal/universal-coop-partner.js",
    "js/bots/universal/universal-hazard-runner.js",
    "js/bots/universal/universal-physics-pilot.js",
    "js/bots/universal/universal-turn-planner.js",
    "js/bots/universal/universal-racer.js",
    "js/bots/universal/universal-survivalist.js",
    "js/bots/universal/universal-tactical-commander.js",
    "js/bots/specific/bad-ice-cream-bot.js",
    "js/bots/specific/bad-ice-cream-2-bot.js",
    "js/bots/specific/bad-ice-cream-3-bot.js",
    "js/bots/specific/house-of-hazards-bot-1.js",
    "js/bots/specific/house-of-hazards-bot-2.js",
    "js/bots/specific/rooftop-snipers-2-bot.js",
    "js/bots/specific/stick-archers-battle-bot.js",
    "js/bots/specific/tag-bot-1.js",
    "js/bots/specific/tag-bot-2.js",
    "js/bots/specific/tube-jumpers-bot-1.js",
    "js/bots/specific/tube-jumpers-bot-2.js",
    "js/bots/specific/stick-fighter-bot.js",
    "js/bots/specific/poor-bunny-bot.js",
    "js/bots/specific/temple-of-boom-bot.js",
    "js/bots/specific/eight-ball-classic-bot.js",
    "js/bots/specific/chess-bot.js"
  ];

  const ns = window.LifeHelpersGameBots = window.LifeHelpersGameBots || {};
  let resolveReady;
  ns.ready = new Promise(resolve => { resolveReady = resolve; });
  ns.whenReady = () => ns.ready;
  ns.baseUrl = base;

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const s=document.createElement("script");
      s.src=base+"/"+src;
      s.async=false;
      s.onload=()=>resolve(src);
      s.onerror=()=>reject(new Error("Failed to load GameBots script: "+src));
      document.head.appendChild(s);
    });
  }

  (async()=>{
    try{
      for(const file of files) await loadScript(file);
      if(ns.finalizeRegistration) ns.finalizeRegistration();
      resolveReady(ns);
      window.dispatchEvent(new CustomEvent("lifehelpers-gamebots-ready",{detail:{botCount:ns.listBots?ns.listBots().length:0}}));
    }catch(error){
      console.error("LifeHelpers GameBots failed to initialize",error);
      ns.loadError=error;
      resolveReady(ns);
    }
  })();
})();
