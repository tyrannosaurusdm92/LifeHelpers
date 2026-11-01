/* Onyx Widget + Onyx Adventures, one HTML, one real three-cat scene.
   Lazy-load the original Adventures JS into #slowPetGame on first Virtual & Health
   fullscreen visit. No iframes, placeholder cats, separate backend, or duplicated game page. */
(()=>{
  'use strict';
  const ROOT=document.documentElement;
  const slow=document.getElementById('slowPetGame');
  const status=document.getElementById('adventuresLoadingMessage');
  const EXPOSED='OnyxAdventuresIntegration';
  if(!slow || !document.getElementById('outdoorCanvas')){
    console.warn('Onyx Adventures: missing embedded fullscreen/canvas');return;
  }
  const SCRIPTS=[
    'adventures-shell.js',
    'util.js','data.js','bird-data.js','bird-hit-masks.js','assets.js',
    'world.js','camera.js','backdrop.js','terrain.js','birds.js','atmosphere.js',
    'particles.js','audio.js','interface.js','cat-manifests.js','personalities.js',
    'wasm-bytes.js','cat-frame-bounds.js','cat-bird-contacts.js','adventure-cats.js',
    'vendor-state-machine.js','vendor-seedrandom.js','vendor-localforage.js',
    'vendor-tween.js','gameplay-core.js','gameplay-data.js',
    'ourspace-economy.js','adventure-gameplay.js','adventures-gameplay-ui.js',
    'onyx-cat-chat.js','app.js','adventures-bridge.js'
  ];
  const loadedScripts=new Set();
  let initPromise=null,lastMode='';
  const isOpen=()=>ROOT.dataset.runtimeMode==='slow-game'&&!slow.hidden;
  const message=(text,visible=true)=>{if(status){status.textContent=text;status.hidden=!visible;}};
  const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));

  function existingAuth(){
    // A host-supplied authorized adapter takes precedence when the widget is embedded
    // inside an already signed-in OurSpace page. Do not overwrite it with guest mode.
    const provided=window.OurSpaceAdventuresAuth;
    if(provided && ['william','jasper'].includes(String(provided.profileKey||'').toLowerCase()) &&
       typeof provided.hostAdapter?.getBalance==='function' && typeof provided.hostAdapter?.earn==='function'){
      return provided;
    }
    const auth=window.OurSpaceBackend;
    if(!auth || !auth.isAuthenticated?.() || auth.isAdmin?.())return null;
    const profileKey=String(auth.profile?.()||'').toLowerCase();
    if(profileKey!=='william'&&profileKey!=='jasper')return null;
    if(!auth.token?.())return null;
    return {profileKey,hostAdapter:{
      getBalance:({profileKey:profile})=>auth.request('currency.balance',{profileKey:profile}),
      earn:({profileKey:profile,...claim})=>auth.request('currency.earn',{profileKey:profile,...claim}),
      openStore:({profileKey:profile,storeId})=>window.dispatchEvent(new CustomEvent('onyx-adventures:open-ourspace-store',{detail:{profileKey:profile,storeId}}))
    }};
  }
  function connectWallet(){
    const game=window.WanderingWorld?.app;
    const economy=game?.gameplay?.economy;
    if(!economy)return;
    const ctx=existingAuth();
    window.OurSpaceAdventuresAuth=ctx||null;
    if(!ctx){if(economy.identity)economy.disconnect('Not signed in');return;}
    if(economy.identity?.profileKey===ctx.profileKey && ['connected','connecting'].includes(economy.status))return;
    // Reuse the tested OurSpace backend, not a new or shadow ledger.
    try{economy.connect(ctx)}catch(e){console.warn('OurSpace wallet:',e.message);}
  }
  function syncGameMode(){
    const app=window.WanderingWorld?.app;
    if(!app)return;
    app.lastFrame=0; // Never count time spent in other widget fullscreen modes.
    if(!isOpen()){
      app.sound?.setPaused?.(true);
      app.cats?.stopMeows?.();
      return;
    }
    app.camera?.resize?.();
    app.cats?.setGround?.();
    app.sound?.setPaused?.(!!app.camera?.paused);
    connectWallet();
    requestAnimationFrame(()=>app.camera?.resize?.());
  }
  function fetchScript(name){
    if(loadedScripts.has(name))return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const node=document.createElement('script');
      node.src='../../script/'+name;node.async=false;
      node.dataset.adventuresRuntime='true';
      node.onload=()=>{loadedScripts.add(name);resolve()};
      node.onerror=()=>{node.remove();reject(new Error('Cannot load '+name))};
      document.body.appendChild(node);
    });
  }
  async function load(){
    if(initPromise)return initPromise;
    initPromise=(async()=>{
      message('Loading Onyx, Callie and Harvey…');
      for(const file of SCRIPTS)await fetchScript(file);
      // app.js starts asynchronously after its dependency scripts are evaluated.
      for(let n=0;n<200;n++){
        if(window.WanderingWorld?.app?._loaded){
          message('',false);syncGameMode();return window.WanderingWorld.app;
        }
        if(n===80)message('Loading the original cat WASM engines and scenery…');
        await wait(100);
      }
      throw new Error('Adventures did not finish loading its original WASM cat scene.');
    })();
    try{return await initPromise;}
    catch(error){
      message('Could not start Onyx’s Adventures: '+error.message);
      console.error('Onyx Adventures load:',error);
      // Loaded scripts stay deduplicated; user can reopen to retry a transient resource failure.
      initPromise=null;throw error;
    }
  }
  function sync(){
    const mode=ROOT.dataset.runtimeMode||'module';
    if(lastMode===mode&&!(mode==='slow-game'&&!window.WanderingWorld?.app))return;
    lastMode=mode;
    if(isOpen()){
      if(!window.WanderingWorld?.app?._loaded)load().catch(()=>{});
      else syncGameMode();
    }else syncGameMode();
  }
  window.addEventListener('ourspace:auth',connectWallet);
  window.addEventListener('ourspace:signed-out',connectWallet);
  window.addEventListener('onyx-adventures:ready',()=>{if(isOpen()){message('',false);syncGameMode();}});
  new MutationObserver(sync).observe(ROOT,{attributes:true,attributeFilter:['data-runtime-mode']});
  new MutationObserver(sync).observe(slow,{attributes:true,attributeFilter:['hidden']});
  window[EXPOSED]=Object.freeze({open:()=>{if(!isOpen())window.OnyxShell?.enterSlowGame?.();return load()},close:()=>window.OnyxShell?.exitToModule?.(),status:()=>({loaded:!!window.WanderingWorld?.app?._loaded,active:isOpen(),scripts:loadedScripts.size,originalWasmCats:!!window.WanderingWorld?.app?.cats})});
  sync();
})();
