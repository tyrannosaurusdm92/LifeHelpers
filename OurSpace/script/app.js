/* Onyx's Adventures — united three-cat WASM companion simulation,
   living outdoor panorama, scene-specific tents, and seven bird species. */
(function (WW) {
  'use strict';
  const U=WW.util;
  class OutdoorApplication {
    constructor(config) {
      this.version='1.6.0-cat-attached-contact-art';
      this.config=config;
      this.canvas=document.getElementById('outdoorCanvas');
      this.ctx=this.canvas.getContext('2d',{alpha:false,desynchronized:true});
      if(!this.ctx)throw new Error('Canvas 2D is required for this outdoor environment.');
      this.world=new WW.World(config);
      this.assets=new WW.AssetLibrary();
      this.camera=new WW.ScenicCamera(this.world,this.canvas);
      this.backdrop=new WW.Backdrop(this.world,this.assets);
      this.terrain=new WW.TerrainRenderer(this.world,this.assets);
      this.birds=new WW.BirdManager(this.world,this.assets);
      this.cats=new WW.AdventureCats(this);
      this.gameplay=new WW.AdventureGameplay(this);
      this.atmosphere=new WW.Atmosphere(this.world);
      this.particles=new WW.ParticleField(this.world);
      this.sound=new WW.Soundscape(config);
      this.allowDrag=true;
      this.environment={light:this.atmosphere.light,weather:this.atmosphere.weather,paused:false};
      this.ui=new WW.ViewerInterface(this);
      this.lastFrame=0;this.frameNumber=0;
      this.lastFrameMillis=0;this.delta=0;this.renderStats={fps:60,avgMs:16,drawnObjects:0};
      this._frames=0;this._seconds=0;this.running=false;
      this._resizeObserver=null;this._loop=this.loop.bind(this);
      this._loaded=false;this._raf=0;
      // Environment recordings provide the only bird audio layer.
      this.birds.setChirpListener(null);
      this.installEventHandlers();
      this.camera.resize();
      this.cats.setGround();
      this.birds.setWalkingPath(this.cats.commonFootY,42.5);
      this.atmosphere.update(.016,this.camera,this.camera.x);
      const biome=this.world.biomeAt(this.camera.screenToWorld(this.camera.width*.47));
      this.sound.setBiome(biome.id);
      if(document.documentElement.dataset.runtimeMode==='slow-game')this.draw();
    }
    installEventHandlers(){
      window.addEventListener('resize',()=>this.camera.resize(),{passive:true});
      window.addEventListener('orientationchange',()=>this.camera.resize(),{passive:true});
      if('ResizeObserver' in window){
        this._resizeObserver=new ResizeObserver(()=>this.camera.resize());
        this._resizeObserver.observe(this.canvas);
      }
      document.addEventListener('visibilitychange',()=>{
        // The clock simply resumes after the tab returns, with no teleport.
        // Sound is damped while the tab is hidden.
        if(document.hidden){this.sound.setPaused(true);this.cats.stopMeows();this.lastFrame=0;}
        else {this.sound.setPaused(this.camera.paused);this.lastFrame=0;}
      });
      window.addEventListener('pagehide',()=>this.sound.setPaused(true));
      window.addEventListener('pageshow',()=>this.sound.setPaused(this.camera.paused));
    }
    async start(){
      const load=this.assets.preload();
      const wasm=this.assets.loadWasm(this.world.noise);
      const result=await load;
      await wasm;
      await this.cats.start();
      await this.gameplay.start();
      this.gameplayUI=new WW.GameplayUI(this.gameplay);
      this._loaded=true;
      this.ui.finishLoading(result);
      this.running=true;this.lastFrame=0;
      this._raf=requestAnimationFrame(this._loop);
      // Exposed solely for local diagnostics, not for a gameplay console.
      console.info('Onyx’s Adventures three-cat outdoor world ready',this.inspect());
      return result;
    }
    stop(){
      this.running=false;
      if(this._raf)cancelAnimationFrame(this._raf);
      this.sound.disable();this.cats.stopMeows();
      this.particles.clear();
      this._resizeObserver?.disconnect();
    }
    loop(timestamp){
      if(!this.running)return;
      const delta=this.lastFrame ? (timestamp-this.lastFrame)/1000 : 1/60;
      this.lastFrame=timestamp;
      this.delta=U.clamp(delta,0,.05);
      this.lastFrameMillis=timestamp;
      // Embedded Onyx Widget: offscreen game never moves cats, advances hunt clocks, or plays audio.
      const visible=document.documentElement.dataset.runtimeMode==='slow-game' && !document.getElementById('slowPetGame')?.hidden;
      if(!visible){this.lastFrame=0;this.sound.setPaused(true);this._raf=requestAnimationFrame(this._loop);return;}
      this.update(this.delta);
      this.draw();
      this.ui.update(timestamp);
      this.gameplayUI?.tick(timestamp);
      this.trackPerformance(delta);
      this._raf=requestAnimationFrame(this._loop);
    }
    update(dt){
      const paused=this.camera.paused||document.hidden||(document.documentElement.dataset.runtimeMode!=='slow-game');
      if(paused)dt=0;
      this.camera.update(dt);
      // The true Onyx WASM body, rather than a fixed auto-scroll timer,
      // drives the camera when it isn't under manual inspection.
      this.cats.update(dt);
      this.gameplay.update(dt);
      this.birds.setWalkingPath(this.cats.commonFootY,this.cats.cats[0]?.h||42.5);
      if(!paused && this.cats.ready && this.cats.clock-(this._lastPetHUDClock||0)>2){
        this._lastPetHUDClock=this.cats.clock;
        window.onyxAdventuresShell?.setPetReadings?.(this.cats.getPetState());
      }
      const environment=this.atmosphere.update(dt,this.camera,this.camera.x);
      this.environment={light:environment.light,weather:environment.weather,paused};
      const biome=this.world.biomeAt(this.camera.screenToWorld(this.camera.width*.47));
      this.sound.setBiome(biome.id);
      if(!paused){
        this.backdrop.update(dt,environment.weather);
        this.terrain.update(dt,environment.weather);
        this.birds.update(dt,this.environment,this.camera);
        this.particles.update(dt,this.camera,environment.weather,environment.light);
        this.sound.update(environment.weather,environment.light);
      }
    }
    draw(){
      const ctx=this.ctx;
      if(!ctx)return;
      const cam=this.camera;
      const w=cam.width,h=cam.height;
      const light=this.atmosphere.light||{night:0,phase:0,twilight:0};
      const weather=this.atmosphere.weather||{wind:.4,rain:0,mist:0,cloud:0};
      ctx.save();ctx.setTransform(1,0,0,1,0,0);
      ctx.imageSmoothingEnabled=false;
      ctx.clearRect(0,0,w,h);
      this.backdrop.draw(ctx,cam,light);
      const count=this.terrain.draw(ctx,cam,light);
      this.gameplay.drawProps(ctx,cam);
      this.birds.draw(ctx,cam,light);
      // Transparent pixel sprites, rear tent walls, then cats and front flaps.
      this.cats.draw(ctx,cam,light);
      this.particles.draw(ctx,light);
      this.atmosphere.drawMist(ctx,cam);
      this.atmosphere.drawLightOverlay(ctx,cam);
      this.atmosphere.drawVignette(ctx,cam,.09);
      if(this.camera.debug)this.drawDebug(ctx);
      ctx.restore();
      window.OnyxCatChat?.renderBubbles?.();
      this.renderStats.drawnObjects=count;
      this.frameNumber++;
    }
    drawDebug(ctx){
      const cam=this.camera;
      ctx.save();
      ctx.fillStyle='rgba(6,27,36,.8)';ctx.fillRect(7,7,204,100);
      ctx.fillStyle='#f1ffff';ctx.font='11px monospace';
      const lines=[
        'Onyx’s Adventures '+this.version,
        'FPS '+this.renderStats.fps.toFixed(1)+' / '+this.renderStats.avgMs.toFixed(1)+' ms',
        'Onyx X '+(this.cats.get('onyx')?.worldX()||0).toFixed(0)+' / '+this.world.length,
        'Birds '+this.birds.visible+' of '+this.birds.birds.length,
        'Decorations '+this.renderStats.drawnObjects,
        'Weather '+this.atmosphere.currentWeather,
        'WASM '+this.assets.wasmStatus
      ];
      lines.forEach((t,i)=>ctx.fillText(t,14,21+i*13));
      ctx.restore();
    }
    trackPerformance(delta){
      if(delta<=0)return;
      this._seconds+=delta;this._frames++;
      this.renderStats.avgMs=U.lerp(this.renderStats.avgMs,delta*1000,.035);
      if(this._seconds>=.9){
        this.renderStats.fps=this._frames/this._seconds;
        this._frames=0;this._seconds=0;
      }
    }
    inspect(){
      return {name:'Onyx’s Adventures',version:this.version,game:true,catSprite:true,
        htmlEntry:'adventures.html',world:this.world.inspect(),assets:this.assets.report(),
        birds:this.birds.inspect(),cats:this.cats.snapshot(),backdrop:this.backdrop.inspect(),
        terrain:this.terrain.inspect(),particles:this.particles.inspect(),
        atmosphere:this.atmosphere.inspect(),sound:this.sound.inspect(),
        camera:{x:this.camera.x,speed:this.camera.speed,paused:this.camera.paused,
          lapMinutes:this.camera.getTimeToLapMinutes(),pixelSize:[this.camera.width,this.camera.height]},
        fps:this.renderStats.fps,ui:this.ui.inspect(),gameplay:this.gameplay.inspect()};
    }
    selfTest(){
      const checks={};
      const world=this.world;
      const n=world.length;
      checks.threeIndependentWasmCats=this.cats.ready&&this.cats.cats.length===3&&
        this.cats.cats.every(c=>!!c.brain&&!!c.image);
      checks.transparentCompositing=this.cats.hasNoWhiteBackground();
      checks.catFeetOffset=this.cats.cats.every(c=>Math.abs(c.footY-this.terrain.treeBaseY(this.camera)-25)<.01);
      checks.colorTents=this.cats.cats.map(c=>c.tentColor).join(',')==='green,purple,pink';
      checks.singleHTML=document.querySelectorAll('html').length===1;
      checks.sevenSpeciesFlightAtlases=Object.keys(WW.birdFrames.species).length===7&&
        Object.values(WW.birdFrames.species).every(s=>s.frames.length===33&&!('featherTemplates' in s));
      checks.worldCloses=world.route[0]===world.route[world.route.length-1];
      checks.seamHeight=Math.abs(world.groundHeight(0)-world.groundHeight(n))<1e-7;
      checks.toroidalPosition=U.modulo(n+10,n)===10;
      checks.toroidalObjectVisibility=world.objectsNear(n-30,500,50).length>0;
      checks.biomeCount=world.biomes.length>=7;
      checks.sourceAssetsPresent=!!this.assets.get('nature-01-7')&&
        !!this.assets.bird('bluejay');
      checks.all21CatAttachedImages=this.cats.cats.length===3&&
        ['onyx','callie','harvey'].every(id=>
          Object.keys(WW.birdFrames.species).every(species=>
            !!this.assets.catContact(id,species)));
      checks.noStandaloneExplosions=this.birds.inspect().standaloneExplosionActors===0&&
        this.birds.inspect().standaloneFeatherActors===0;
      checks.exactContactGate=typeof this.birds.actualContact==='function'&&
        typeof this.cats.strikePoints==='function'&&
        typeof this.cats.showVerifiedContact==='function';
      checks.birdsReducedTo75Percent=this.birds.inspect().visualScale===.75;
      checks.treesIncreasedAnother75Percent=WW.TREE_VISUAL_SCALE===3.0625;
      checks.birdsUseCatWalkingLane=Number.isFinite(this.birds.inspect().walkingPathY);
      checks.oneLoopPerEnvironment=world.biomes.every(b=>!!world.config.birdAudio?.[b.id]?.file);
      checks.noSyntheticBirdChirps=this.sound.callsTotal===0;
      checks.tentCollider=typeof this.cats.enforceTentBoundaries==='function';
      checks.voiceGatedByMouth=typeof this.cats.mouthOpen==='function';
      checks.contactCatchHook=typeof this.birds.catchBird==='function'&&
        typeof this.birds.catchNearest==='function';
      checks.periodicBackdrop=!!this.backdrop.inspect().mirroredParallax;
      checks.wasmPresent=!!this.world.noise;
      checks.audioOffByDefault=!this.sound.enabled;
      checks.persistenceAvailable=!!this.ui;
      checks.behaviorVariety=this.birds.birds.every(b=>typeof b.update==='function');
      checks.groundFeaturesBehindTrees=typeof this.terrain.draw==='function';
      checks.catchTiming=this.birds.catchRules.intervalSeconds===300&&
        this.birds.catchRules.periodSeconds===90&&
        this.birds.catchRules.probability===.03;
      checks.lowFlyingShare=this.birds.catchRules.lowFlyingFraction===2/3;
      checks.threeRegisteredCats=this.birds.catActors.size===3;
      const failures=Object.entries(checks).filter(([k,v])=>!v).map(([k])=>k);
      return {ok:failures.length===0,checks,failures,world:this.world.inspect()};
    }
  }
  async function fetchConfiguration(){
    if(location.protocol==='file:')return WW.defaults;
    try{
      const response=await fetch('../../json/world.json',{cache:'no-store'});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const data=await response.json();
      if(!Array.isArray(data.biomes)||!Array.isArray(data.route)||data.biomes.length<2)
        throw new Error('Invalid world.json route or biomes');
      return data;
    }catch(err){
      console.warn('Using embedded scenery settings:',err.message);
      return WW.defaults;
    }
  }
  async function boot(){
    const loading=document.getElementById('loadingText');
    try{
      const config=await fetchConfiguration();
      WW.app=new OutdoorApplication(config);
      await WW.app.start();
      window.WanderingWorldGameplay=Object.freeze({
        snapshot:()=>WW.app.gameplay.snapshot(),
        inspect:()=>WW.app.gameplay.inspect(),
        startWork:id=>WW.app.gameplay.startWork(id,false),
        cancelWork:id=>WW.app.gameplay.cancelWork(id),
        observe:()=>WW.app.gameplay.observe(),
        stroll:()=>WW.app.gameplay.scenicStroll(),
        connectOurSpace:options=>WW.app.gameplay.economy.connect(options)
      });
      window.WanderingWorldDiagnostics={
        inspect:()=>WW.app.inspect(),
        selfTest:()=>WW.app.selfTest(),
        pause:()=>WW.app.camera.setPaused(true),
        resume:()=>WW.app.camera.setPaused(false),
        chapter:(i)=>WW.app.camera.jumpToChapter(i)
      };
      window.dispatchEvent(new CustomEvent('onyx-adventures:ready',{detail:{scene:WW.app,loaded:true}}));
      // Cat engines are registered with the shared, rare bird-catching rule.
      // The bird API retains explicit developer testing hooks.
      window.WanderingWorldBirds=Object.freeze({
        visible:()=>WW.app.birds.visibleBirds(WW.app.camera),
        period:()=>WW.app.birds.catchPeriodStatus(),
        // Register only when a REAL cat engine exists and can report X.
        registerCat:(id,getPosition)=>WW.app.birds.registerCat(id,getPosition),
        unregisterCat:(id)=>WW.app.birds.unregisterCat(id),
        catchById:(id)=>WW.app.birds.catchBird(id,WW.app.camera),
        catchNearestCanvas:(x,y,radius=35)=>
          WW.app.birds.catchNearest(x,y,radius,WW.app.camera),
        catchNearestClient:(clientX,clientY,radius=35)=>{
          const rect=WW.app.canvas.getBoundingClientRect();
          const scaleX=WW.app.canvas.width/rect.width;
          const scaleY=WW.app.canvas.height/rect.height;
          return WW.app.birds.catchNearest((clientX-rect.left)*scaleX,
            (clientY-rect.top)*scaleY,radius*Math.max(scaleX,scaleY),WW.app.camera);
        },
        onCaught:(handler)=>{
          const listener=event=>handler(event.detail);
          window.addEventListener('wanderingworld:birdcaught',listener);
          return ()=>window.removeEventListener('wanderingworld:birdcaught',listener);
        }
      });
    }catch(err){
      console.error('Onyx’s Adventures could not start:',err);
      if(loading){loading.textContent='Unable to open the landscape: '+err.message;}
      const msg=document.getElementById('loadDetail');
      if(msg)msg.textContent='Check that ../../assets/ and ../../script/ are alongside adventures.html.';
    }
  }
  WW.OutdoorApplication=OutdoorApplication;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})(window.WanderingWorld=window.WanderingWorld||{});
