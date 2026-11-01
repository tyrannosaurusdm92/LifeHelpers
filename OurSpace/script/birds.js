/* Seven independent bird-flight atlases (33 usable frames each), with a five-minute, single-roll
   cat-catching schedule and 90-second low-flight windows. Cat registration is
   explicit: the shell does NOT contain an invisible pet or counterfeit catch. */
(function (WW) {
  'use strict';
  const U=WW.util;
  const SPECIES=Object.keys(WW.birdFrames.species);
  const BIRD_VISUAL_SCALE=.75;
  const WALKING_LANE_BODY_FRACTION=.56;
  const SIZE={bluejay:1.02,cardinal:.92,sparrow:.72,finch:.75,
    dove:1.12,robin:.86,hummingbird:.63};
  const COLORS={bluejay:'#579bef',cardinal:'#ec594d',sparrow:'#b99a74',
    finch:'#e8ce40',dove:'#b7aba9',robin:'#c66f49',hummingbird:'#62c17a'};
  class Bird {
    constructor(manager,config) {
      this.manager=manager;
      this.world=manager.world;
      this.id=config.id;
      this.seed=config.seed;
      this.rng=new U.PRNG(config.seed);
      this.species=config.species;
      this.x=U.modulo(config.x,this.world.length);
      this.altitude=config.altitude;
      this.baseAltitude=this.altitude;
      this.targetAltitude=this.altitude;
      this.speed=config.speed;
      this.direction=config.direction;
      this.depth=config.depth;
      this.scale=config.scale;
      this.flapFps=config.flapFps;
      this.phase=config.phase;
      this.time=this.rng.between(0,20);
      this.state='flight';
      this.stateTime=this.rng.between(0,14);
      this.lifeTime=0;this.duration=this.rng.between(7,18);
      this.attention=this.rng.next();
      this.flock=config.flock;
      this.flockIndex=config.flockIndex;
      this.bobbing=this.rng.between(1.8,4.2);
      this.pitch=0;this.wingFrame=1;
      this.resting=false;this.perch=null;
      this.landTarget=null;
      this.landingStart=null;
      this.lastAltitude=this.altitude;
      this.glideDuration=0;
      this.chirpCooldown=this.rng.between(3,18);
      this.blinkDuration=0;
      this.blinkTimer=this.rng.between(2,14);
      this.speedTarget=this.speed;
      this.waitForFlight=0;
      this.climb=0;
      this.pattern=this.rng.int(0,4);
      this.isSilhouette=this.depth < .47;
      this.lastRendered=false;
      this.hiddenFor=0;
      this.catchDiveBlend=0;
      this.catchLowAltitude=.665+(this.seed%9)*.004;
      this.debugName=`${this.species}-${this.id}`;
    }
    changeState(state,min,max) {
      this.state=state;this.stateTime=0;
      this.duration=this.rng.between(min,max);
      if(state==='perched')this.resting=true;
      if(state==='flight')this.resting=false;
    }
    choosePerch() {
      const tree=this.world.nearestTree(this.x,125);
      if(tree && this.rng.bool(.76)) {
        const branchX=tree.x+this.rng.between(-14,14)*tree.size;
        return {x:U.modulo(branchX,this.world.length),
          altitude:-1,tree,branch:this.rng.between(.4,.65)};
      }
      const ground=this.world.groundHeight(this.x);
      return {x:this.x+this.rng.between(-10,10),altitude:ground-.025,tree:null,branch:0};
    }
    getPerchAltitude(perch) {
      if(!perch)return this.altitude;
      if(perch.tree){
        const base=this.world.groundHeight(perch.tree.x);
        const treeScale=WW.TREE_VISUAL_SCALE||1;
        return U.clamp(base-.26*perch.tree.size*treeScale*perch.branch,.12,.8);
      }
      return U.clamp(perch.altitude,.14,.78);
    }
    startLanding() {
      this.landTarget=this.choosePerch();
      this.landingStart={x:this.x,altitude:this.altitude};
      this.changeState('landing',1.15,2.7);
    }
    takeOff() {
      this.resting=false;this.perch=null;this.landTarget=null;
      this.direction=this.rng.bool(.72)?this.direction:-this.direction;
      this.targetAltitude=this.rng.between(.17,.53);
      this.changeState('takeoff',.75,1.7);
      this.speedTarget=this.rng.between(24,58);
    }
    update(dt,environment,leader=null) {
      // Smoothly dive during a catch window, then climb back on its end.
      // Do not overwrite the flight/perching simulation's own altitude.
      const lower=!!environment.lowFlight &&
        ((this.id+environment.catchPeriodIndex)%3!==0);
      this.catchDiveBlend=U.damp(this.catchDiveBlend,lower?1:0,
        lower?1.3:1.05,dt);
      if(lower && (this.state==='perched'||this.state==='landing'))this.takeOff();
      if(this.hiddenFor>0){
        this.hiddenFor=Math.max(0,this.hiddenFor-dt);
        if(this.hiddenFor===0){
          this.x=U.modulo(this.x+this.rng.between(160,480)*this.direction,this.world.length);
          this.altitude=this.baseAltitude;
          this.changeState('flight',6,15);
        }
        return;
      }
      this.lifeTime+=dt;this.time+=dt;
      this.stateTime+=dt;
      this.chirpCooldown-=dt;
      this.blinkTimer-=dt;
      const climate=environment.weather;
      const sky=environment.light;
      const turbulence=U.clamp(climate.wind,0,1.8);
      const flightBoost=climate.rain>.55?1.15:1;
      if(this.chirpCooldown<=0){
        this.chirpCooldown=this.rng.between(7,32);
        if(this.rng.bool(.68) && !environment.paused)
          this.manager.emitChirp(this);
      }
      if(this.blinkTimer<=0){this.blinkDuration=.13;this.blinkTimer=this.rng.between(3,13);}
      this.blinkDuration=Math.max(0,this.blinkDuration-dt);
      if(this.state==='perched') {
        if(this.perch){
          this.x=U.modulo(this.perch.x,this.world.length);
          this.altitude=this.getPerchAltitude(this.perch);
        }
        this.pitch=0;
        this.wingFrame=33;
        if(this.stateTime>this.duration || climate.rain>.78)this.takeOff();
        return;
      }
      if(this.state==='landing') {
        const target=this.landTarget;
        if(!target){this.changeState('flight',6,13);return;}
        const t=U.smoother(U.clamp(this.stateTime/this.duration,0,1));
        const dx=U.wrapDelta(target.x,this.landingStart.x,this.world.length);
        this.x=U.modulo(this.landingStart.x+dx*t,this.world.length);
        const high=this.getPerchAltitude(target);
        this.altitude=U.lerp(this.landingStart.altitude,high,t)+Math.sin(t*Math.PI)*-.03;
        this.pitch=.10*Math.sin(t*Math.PI);
        this.wingFrame=29+Math.min(4,Math.floor(t*5));
        if(this.stateTime>=this.duration){
          this.perch=target;this.changeState('perched',2.5,11);
          this.altitude=high;this.x=U.modulo(target.x,this.world.length);
        }
        return;
      }
      if(this.state==='takeoff'){
        this.altitude=U.damp(this.altitude,this.targetAltitude,1.75,dt);
        this.x=U.modulo(this.x+this.direction*this.speedTarget*.6*dt,this.world.length);
        this.pitch=-.16;this.wingFrame=1+Math.floor(this.time*this.flapFps*1.35)%8;
        if(this.stateTime>=this.duration)this.changeState('flight',6,17);
        return;
      }
      if(this.state==='gliding') {
        this.x=U.modulo(this.x+this.direction*this.speed*.86*dt,this.world.length);
        this.altitude+=Math.sin(this.time*.8+this.phase)*dt*.004;
        this.pitch=Math.sin(this.time*.6)*.055;
        this.wingFrame=4;
        if(this.stateTime>this.duration)this.changeState('flight',5,13);
        return;
      }
      // Ordinary free flight; the flock leader encourages gentle cohesion.
      const target=this.baseAltitude+Math.sin(this.time*.12+this.phase)*.055+
        Math.sin(this.time*.31+this.id*.71)*.018;
      this.targetAltitude=U.clamp(target,.11,.7);
      this.altitude=U.damp(this.altitude,this.targetAltitude,1.1,dt);
      if(leader && leader!==this && leader.hiddenFor<=0 && leader.state!=='perched') {
        const leadY=leader.altitude+(this.flockIndex%2?-.02:.025);
        this.altitude=U.damp(this.altitude,leadY,.13,dt);
        const spacing=(this.flockIndex+1)*this.rng.between(8,12);
        const targetX=U.modulo(leader.x-leader.direction*spacing,this.world.length);
        const off=U.wrapDelta(targetX,this.x,this.world.length);
        this.speedTarget=this.speed+U.clamp(off*.075,-16,16);
      } else this.speedTarget=this.speed;
      this.speed=U.damp(this.speed,this.speedTarget,2.2,dt);
      const perturb=Math.sin(this.time*.78+this.phase)*3.4+
        Math.sin(this.time*.25+this.id)*2.1;
      this.x=U.modulo(this.x+this.direction*(this.speed*flightBoost+perturb)*dt,this.world.length);
      this.altitude=U.clamp(this.altitude+.0006*Math.sin(this.time*1.6)*turbulence,.10,.76);
      this.pitch=U.clamp((this.altitude-this.lastAltitude)*15,-.2,.2);
      this.lastAltitude=this.altitude;
      this.wingFrame=1+Math.floor((this.time+this.phase)*this.flapFps)%28;
      if(this.stateTime>=this.duration){
        // Less perching in the rain and fewer takeoffs on quiet evenings.
        const perchChance=(this.world.config.birds.perchChance||.18)*
          (climate.rain>.42?.30:1)*(sky.night>.6?.75:1);
        if(this.catchDiveBlend>.18){this.changeState('flight',4,8);}
        else if(this.rng.bool(perchChance))this.startLanding();
        else if(this.rng.bool(.28))this.changeState('gliding',1.3,4.4);
        else {
          if(this.rng.bool(.1))this.direction*=-1;
          this.changeState('flight',5,17);
        }
      }
    }
    screenPosition(camera){
      const w=camera.width,h=camera.height;
      const x=U.wrapDelta(this.x,camera.x,this.world.length);
      // For ~2/3 of the birds, blend from natural flight altitude to a
      // swooping near-ground lane; returning blend makes an actual climb.
      const walkingLane=this.manager.walkingLaneAltitude(camera);
      const lowAltitude=Number.isFinite(walkingLane)?walkingLane:this.catchLowAltitude;
      const flightY=U.lerp(this.altitude,lowAltitude,this.catchDiveBlend);
      let y=flightY*h+Math.sin(this.time*this.bobbing+this.phase)*
        (this.state==='perched'?.2:1.6);
      if(this.state==='perched' && this.perch && this.perch.tree) y+=50;
      else if(this.state==='landing' && this.landTarget && this.landTarget.tree)
        y+=50*U.smoother(U.clamp(this.stateTime/Math.max(this.duration,.001),0,1));
      return {x,y};
    }
    draw(ctx,camera,light,assets){
      const w=camera.width,h=camera.height;
      if(this.hiddenFor>0){this.lastRendered=false;return;}
      const {x,y}=this.screenPosition(camera);
      const s=this.scale*(.42+this.depth*.42);
      const frameSize=52*s*(SIZE[this.species]||1)*1.25*BIRD_VISUAL_SCALE;
      if(x < -60 || x>w+60 || y<-40 || y>h+30){this.lastRendered=false;return;}
      this.lastRendered=true;
      ctx.save();ctx.translate(Math.round(x),Math.round(y));
      if(this.direction<0)ctx.scale(-1,1);
      ctx.rotate(this.pitch);
      const im=assets.bird(this.species);
      if(im){
        ctx.imageSmoothingEnabled=false;
        const dw=Math.max(1,Math.round(frameSize));
        const frame=Math.max(1,Math.min(33,this.wingFrame))-1;
        const sx=(frame%6)*256,sy=Math.floor(frame/6)*256;
        if(light.night>.25)ctx.filter=`brightness(${1-light.night*.34}) saturate(${1-light.night*.08})`;
        ctx.drawImage(im,sx,sy,256,256,-Math.floor(dw/2),-Math.floor(dw/2),dw,dw);
        ctx.filter='none';
      }else{
        this.drawPlaceholder(ctx,s*BIRD_VISUAL_SCALE);
      }
      ctx.restore();
    }
    drawPlaceholder(ctx,scale){
      const s=Math.max(1,scale);
      const color=COLORS[this.species]||'#85c2e9';
      ctx.fillStyle=color;
      ctx.fillRect(-11*s,-3*s,18*s,8*s);
      ctx.fillRect(-3*s,-8*s,13*s,7*s);
      ctx.fillRect(-9*s,-7*s,8*s,4*s);
      ctx.fillStyle='#e1eeec';ctx.fillRect(4*s,-4*s,4*s,4*s);
      ctx.fillStyle='#192d42';ctx.fillRect(6*s,-3*s,2*s,2*s);
      ctx.fillStyle='#f69f4f';ctx.fillRect(10*s,0,6*s,2*s);
      ctx.fillStyle='#f3e7a5';ctx.fillRect(-3*s,0,8*s,4*s);
    }
    getInfo() {
      return {id:this.id,species:this.species,behavior:this.state,x:this.x,
        altitude:this.altitude,speed:this.speed,depth:this.depth,flock:this.flock};
    }
  }
  class BirdManager {
    constructor(world,assets) {
      this.world=world;this.assets=assets;
      this.birds=[];this.flocks=new Map();this.contactEvents=0;
      this.density=1;this.time=0;
      // Configured in ../../json/world.json (and mirrored in ../../script/data.js for
      // file://), with the requested timing as safe defaults.
      const huntSettings=this.world.config.birdCatching||{};
      this.catchRules=Object.freeze({
        intervalSeconds:Number(huntSettings.repeatEveryActiveSeconds)||300,
        periodSeconds:Number(huntSettings.lowFlightWindowSeconds)||90,
        probability:huntSettings.chancePerEligibleCat??.03,
        lowFlyingFraction:2/3});
      this.huntRng=new U.PRNG(this.world.seed^0x74c830b);
      this.catchPeriod={active:false,index:0,
        nextAt:Number(huntSettings.startAfterActiveSeconds)||300,endAt:0,
        rolls:0,successRolls:0,rolled:false,pending:false,catId:null,
        targetBirdId:null,catches:0,attemptedCats:new Set(),eligibleCats:[],
        perCatTrials:new Map()};
      this.catActors=new Map();
      this.callListener=null;this.lastChirpId=-1;
      this.visible=0;this.perched=0;
      this.walkingPathY=null;this.walkingBodyHeight=42.5;
      this._hitCache=new Map();
      this.createBirds();
    }
    createBirds(){
      this.birds=[];this.flocks.clear();
      const rng=new U.PRNG(this.world.seed^0x819732);
      const perChapter=Math.max(5,Math.ceil((this.world.config.defaultBirds||26)*2.5));
      let id=0,flockId=0;
      this.world.forEachSection(({index,biome,x0,x1})=>{
        let created=0;
        const clusterCount=Math.ceil(perChapter/4.4);
        for(let group=0;group<clusterCount;group++){
          const groupSize=Math.min(perChapter-created,rng.int(2,6));
          if(groupSize<=0)break;
          const center=x0+rng.between(0,this.world.chapterWidth);
          const height=rng.between(.16,.58);
          const direction=rng.bool(.65)?-1:1;
          const velocity=rng.between(18,53);
          const flock=[];
          for(let j=0;j<groupSize;j++){
            const pool=biome.birdSpecies||SPECIES;
            const species=rng.pick(pool);
            const bird=new Bird(this,{id:id++,seed:rng.int(1,0x7fffffff),
              species,x:center+direction*j*rng.between(-17,34),
              altitude:height+rng.between(-.03,.03),direction,
              speed:velocity+rng.between(-6,6),
              scale:rng.between(.66,1.5),depth:rng.between(.55,1.14),
              flapFps:rng.between(6.5,11.5),phase:rng.between(0,U.TAU),
              flock:flockId,flockIndex:j});
            flock.push(bird);this.birds.push(bird);created++;
          }
          this.flocks.set(flockId,flock);flockId++;
        }
        while(created<perChapter){
          const bird=new Bird(this,{id:id++,seed:rng.int(1,0x7fffffff),
            species:rng.pick(biome.birdSpecies||SPECIES),
            x:x0+rng.between(0,this.world.chapterWidth),
            altitude:rng.between(.18,.57),direction:rng.sign(),
            speed:rng.between(20,58),scale:rng.between(.65,1.36),
            depth:rng.between(.5,1.1),flapFps:rng.between(6,11),
            phase:rng.between(0,U.TAU),flock:flockId,flockIndex:0});
          this.birds.push(bird);this.flocks.set(flockId,[bird]);created++;flockId++;
        }
      });
    }
    // A future real cat engine registers one callback for each actual cat.
    // Callback returns {worldX,canCatch?:boolean}; no fake cats are created.
    registerCat(id,getPosition){
      if(typeof id!=='string'||!id.trim()||typeof getPosition!=='function')
        throw new TypeError('Provide a cat id and live world-coordinate getter.');
      this.catActors.set(id,getPosition);
      return ()=>this.catActors.delete(id);
    }
    unregisterCat(id){return this.catActors.delete(id);}
    setWalkingPath(footY,bodyHeight=42.5){
      if(Number.isFinite(footY))this.walkingPathY=footY;
      if(Number.isFinite(bodyHeight)&&bodyHeight>0)this.walkingBodyHeight=bodyHeight;
    }
    walkingLaneAltitude(camera){
      if(!camera||!Number.isFinite(this.walkingPathY))return null;
      // Birds descend to the cats' shared ground lane, with their center just
      // above the feet so a real mouth/paw collision can occur on the path.
      const targetY=this.walkingPathY-this.walkingBodyHeight*WALKING_LANE_BODY_FRACTION;
      return U.clamp(targetY/Math.max(1,camera.height),.1,.9);
    }
    validCats(){
      const cats=[];
      for(const [id,getPosition] of this.catActors){
        try{
          const state=getPosition();
          if(state&&Number.isFinite(state.worldX)&&state.canCatch!==false &&
             state.active!==false)
            cats.push({id,worldX:U.modulo(state.worldX,this.world.length),
              canCatch:!!state.canCatch,
              tryJump:state.tryJump,strikePoints:state.strikePoints,
              jumping:!!state.jumping,
              targetBirdId:Number.isFinite(state.targetBirdId)?state.targetBirdId:null});
        }catch(e){console.warn('Cat position unavailable:',id,e);}
      }
      return cats;
    }
    setDensity(n) {this.density=U.clamp(Number(n)||0,0,2.5);}
    setChirpListener(callback) {this.callListener=callback;}
    emitChirp(bird) {if(this.callListener) this.callListener(bird);this.lastChirpId=bird.id;}
    activeBird(bird) {
      const n=this.density;
      if(n>=2.5)return true;
      return U.hashUnit(bird.flock,3,this.world.seed)<n/2.5;
    }
    update(dt,environment,camera){
      // Active unpaused seconds only (the outer app also freezes on hidden tabs).
      if(environment.paused||dt<=0)return;
      this.time+=dt;
      this.advanceCatchPeriod(camera);
      const inHunt=this.catchPeriod.active;
      const env={...environment,lowFlight:inHunt,
        catchPeriodIndex:this.catchPeriod.index};
      for(const [id,flock] of this.flocks){
        const leader=flock[0];
        for(const bird of flock){
          if(!this.activeBird(bird))continue;
          bird.update(dt,env,bird===leader?null:leader);
        }
      }
      this.finishPendingCatch(camera);
    }
    announcePeriod(kind){
      window.dispatchEvent(new CustomEvent('onyx-adventures:bird-catching-period',{
        detail:{phase:kind,index:this.catchPeriod.index,
          durationSeconds:this.catchRules.periodSeconds,
          probability:this.catchRules.probability,
          catsRegistered:this.catActors.size}}));
    }
    advanceCatchPeriod(camera){
      const p=this.catchPeriod;
      if(p.active&&this.time>=p.endAt){
        p.active=false;p.pending=false;p.catId=null;p.targetBirdId=null;
        this.announcePeriod('ended');
      }
      if(this.time>=p.nextAt){
        p.index++;p.active=true;p.endAt=p.nextAt+this.catchRules.periodSeconds;
        p.nextAt+=this.catchRules.intervalSeconds;
        p.rolled=false;p.pending=false;p.catId=null;p.targetBirdId=null;
        p.attemptedCats.clear();p.eligibleCats=[];p.perCatTrials.clear();
        this.announcePeriod('started');
      }
      // The chance is independent for each eligible awake cat: 3% per cat,
      // at most once during each five-minute opportunity. Cats already
      // resting, feeding, drinking or handling a cued action are ineligible;
      // if they finish before this 90-second window closes, they can join.
      // No chance roll is performed every frame, per bird, or per jump.
      if(p.active){
        for(const cat of this.validCats()){
          if(p.perCatTrials.has(cat.id))continue;
          const authorized=this.huntRng.next()<this.catchRules.probability;
          p.perCatTrials.set(cat.id,{authorized,attempted:false,caught:false});
          p.eligibleCats.push(cat.id);p.rolls++;
          if(authorized)p.successRolls++;
          p.rolled=true;
          window.dispatchEvent(new CustomEvent('onyx-adventures:cat-catch-roll',{
            detail:{catId:cat.id,periodIndex:p.index,chance:this.catchRules.probability}}));
        }
        p.pending=Array.from(p.perCatTrials.values()).some(t=>t.authorized&&!t.caught);
      }
    }
    // Geometry-based contact only: the cat must be visibly jumping with an
    // open paw/muzzle collision point touching the *rendered* bird on this
    // exact frame. X proximity alone never produces feathers.
    actualContact(cat,bird,camera){
      if(!cat||!cat.canCatch||!cat.jumping||cat.targetBirdId!==bird.id||
         typeof cat.strikePoints!=='function'||bird.catchDiveBlend<.92)return null;
      const bounds=this.renderedBirdBounds(bird,camera);
      if(!bounds)return null;
      const art=window.CAT_BIRD_CONTACT_FRAMES?.sprites?.[cat.id]?.[bird.species];
      if(!art||!this.assets.catContact(cat.id,bird.species))return null;
      for(const point of cat.strikePoints(camera)||[]){
        if(point.kind!==art.kind ||
           !Number.isFinite(point.x)||!Number.isFinite(point.y))continue;
        const r=Math.max(1,Math.min(7,Number(point.r)||4));
        if(point.x<bounds.left-r||point.x>bounds.right+r||
           point.y<bounds.top-r||point.y>bounds.bottom+r)continue;
        if(this.renderedBirdPixelContact(bird,camera,point))
          return {catId:cat.id,kind:point.kind,x:point.x,y:point.y};
      }
      return null;
    }
    renderedBirdPixelContact(bird,camera,point){
      const hit=window.BIRD_HIT_MASKS;
      const frameIndex=Math.max(0,Math.min(32,Math.floor(bird.wingFrame)-1));
      const packed=hit?.species?.[bird.species]?.[frameIndex];
      if(!packed)return false;
      if(!this._hitCache)this._hitCache=new Map();
      const key=bird.species+':'+frameIndex;
      let bytes=this._hitCache.get(key);
      if(!bytes){
        try{
          const binary=atob(packed);bytes=new Uint8Array(binary.length);
          for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
          this._hitCache.set(key,bytes);
        }catch(_){return false;}
      }
      // Independent alpha lookup exactly matches the current bird frame.
      // No getImageData: a file:// or CORS-tainted canvas cannot silently
      // suppress all legitimate catches. Mask grid is 4-source-pixel blocks.
      const {x,y}=bird.screenPosition(camera);
      const s=bird.scale*(.42+bird.depth*.42);
      const dw=Math.max(1,Math.round(52*s*(SIZE[bird.species]||1)*1.25*BIRD_VISUAL_SCALE));
      const origin=-Math.floor(dw/2);
      const cos=Math.cos(bird.pitch||0),sin=Math.sin(bird.pitch||0);
      const radius=Math.max(1,Math.min(7,Number(point.r)||4));
      const samples=[[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],
        [radius*.7,radius*.7],[-radius*.7,radius*.7],
        [radius*.7,-radius*.7],[-radius*.7,-radius*.7]];
      for(const [ox,oy] of samples){
        const dx=(point.x+ox-x)*(bird.direction<0?-1:1),dy=point.y+oy-y;
        const localX=cos*dx+sin*dy,localY=-sin*dx+cos*dy;
        const sourceX=Math.floor((localX-origin)/dw*256);
        const sourceY=Math.floor((localY-origin)/dw*256);
        if(sourceX<0||sourceX>=256||sourceY<0||sourceY>=256)continue;
        const px=(sourceX>>2),py=(sourceY>>2),i=py*64+px;
        if((bytes[i>>3]&(128>>(i&7)))!==0)return true;
      }
      return false;
    }
    renderedBirdBounds(bird,camera){
      if(!bird||!camera)return null;
      const species=WW.birdFrames.species[bird.species];
      const frameIndex=Math.max(0,Math.min(32,Math.floor(bird.wingFrame)-1));
      const frame=species?.frames?.[frameIndex];
      const content=frame?.contentBounds;
      if(!frame||!Array.isArray(content)||content.length<4)return null;
      const {x,y}=bird.screenPosition(camera);
      const s=bird.scale*(.42+bird.depth*.42);
      const dw=Math.max(1,Math.round(52*s*(SIZE[bird.species]||1)*1.25*BIRD_VISUAL_SCALE));
      const localX=content[0]-frame.x,localY=content[1]-frame.y;
      const localW=content[2],localH=content[3];
      const origin=-Math.floor(dw/2);
      let left=x+origin+localX/256*dw;
      let right=x+origin+(localX+localW)/256*dw;
      if(bird.direction<0){
        const mirroredLeft=x-origin-(localX+localW)/256*dw;
        const mirroredRight=x-origin-localX/256*dw;
        left=mirroredLeft;right=mirroredRight;
      }
      return {left:Math.min(left,right),right:Math.max(left,right),
        top:y+origin+localY/256*dw,bottom:y+origin+(localY+localH)/256*dw};
    }
    finishPendingCatch(camera){
      const p=this.catchPeriod;
      if(!p.active||!camera)return;
      const eligible=this.validCats();
      // All eligible cats attempt one visible jump during this window,
      // even on a failed 3% roll. The chance only permits a catch, it does
      // not manufacture paw contact. Finish each cat's attempt separately.
      if(this.time>=p.endAt-86){
        for(const cat of eligible){
          const trial=p.perCatTrials.get(cat.id);
          if(!trial||trial.attempted||typeof cat.tryJump!=='function')continue;
          let nearest=null,bestDistance=Infinity;
          for(const bird of this.birds){
            if(!this.activeBird(bird)||bird.hiddenFor>0||
               (bird.id+p.index)%3===0||bird.catchDiveBlend<.88)continue;
            const screen=bird.screenPosition(camera);
            if(screen.x<-25||screen.x>camera.width+25)continue;
            const distance=Math.abs(U.wrapDelta(bird.x,cat.worldX,this.world.length));
            if(distance<bestDistance){nearest=bird;bestDistance=distance;}
          }
          if(nearest && cat.tryJump(nearest,camera)){
            trial.attempted=true;p.attemptedCats.add(cat.id);
            window.dispatchEvent(new CustomEvent('onyx-adventures:cat-attempted-bird',
              {detail:{catId:cat.id,birdId:nearest.id,periodIndex:p.index,
                chancePerCat:this.catchRules.probability}}));
          }
        }
      }
      // Each successful 3% roll may resolve ONCE, but only if the actual
      // jumping cat's mouth/paw overlaps an opaque bird pixel on that frame.
      for(const cat of eligible){
        const trial=p.perCatTrials.get(cat.id);
        if(!trial||!trial.authorized||!trial.attempted||trial.caught||
           !cat.jumping||!Number.isFinite(cat.targetBirdId))continue;
        const bird=this.birds.find(b=>b.id===cat.targetBirdId);
        if(!bird||!this.activeBird(bird)||bird.hiddenFor>0)continue;
        const physical=this.actualContact(cat,bird,camera);
        if(!physical)continue;
        const result=this.catchBird(bird.id,camera,cat.id);
        if(result){
          trial.caught=true;p.catches++;p.targetBirdId=bird.id;
          p.pending=Array.from(p.perCatTrials.values()).some(t=>t.authorized&&!t.caught);
          window.dispatchEvent(new CustomEvent('onyx-adventures:cat-caught-bird',
            {detail:{...result,catId:cat.id,periodIndex:p.index,contact:physical.kind}}));
        }
      }
    }
    catchPeriodStatus(){
      const p=this.catchPeriod;
      return {active:p.active,index:p.index,elapsedActiveSeconds:this.time,
        remainingSeconds:p.active?Math.max(0,p.endAt-this.time):0,
        secondsUntilNext:p.active?0:Math.max(0,p.nextAt-this.time),
        lowFlightFraction:this.catchRules.lowFlyingFraction,
        durationSeconds:this.catchRules.periodSeconds,
        chancePerInterval:this.catchRules.probability,
        intervalSeconds:this.catchRules.intervalSeconds,
        registeredCats:this.catActors.size,rolls:p.rolls,catches:p.catches,
        pendingCatch:p.pending,attemptedCats:Array.from(p.attemptedCats),
        eligibleCats:p.eligibleCats.slice(),
        perCat:Object.fromEntries(Array.from(p.perCatTrials,([id,t])=>
          [id,{rolled:true,attempted:t.attempted,caught:t.caught}]))};
    }
    draw(ctx,camera,light){
      let visible=0,perched=0;
      // Smaller distant birds first, then close foreground sprite birds.
      const order=this.birds;
      for(let pass=0;pass<2;pass++){
        for(const bird of order){
          if(!this.activeBird(bird))continue;
          if(pass===0&&bird.depth>.83)continue;
          if(pass===1&&bird.depth<=.83)continue;
          bird.draw(ctx,camera,light,this.assets);
          if(bird.lastRendered){visible++;if(bird.state==='perched')perched++;}
        }
      }
      this.visible=visible;this.perched=perched;
    }
    visibleBirds(camera){
      const result=[];
      for(const bird of this.birds){
        if(!this.activeBird(bird)||bird.hiddenFor>0)continue;
        const position=bird.screenPosition(camera);
        if(position.x<-45||position.x>camera.width+45||
           position.y<-45||position.y>camera.height+45)continue;
        const radius=25*bird.scale*(SIZE[bird.species]||1)*BIRD_VISUAL_SCALE;
        result.push({id:bird.id,species:bird.species,
          screenX:position.x,screenY:position.y,radius,
          worldX:bird.x,altitude:bird.altitude,behavior:bird.state});
      }
      return result;
    }
    catchBird(id,camera,catId){
      const bird=this.birds.find(candidate=>candidate.id===Number(id));
      const period=this.catchPeriod;
      const trial=period.perCatTrials.get(catId);
      if(!bird||bird.hiddenFor>0||!this.activeBird(bird)||
         !period.active||!trial?.authorized||!trial.attempted||
         trial.caught||!camera)return null;
      const cats=this.validCats();
      const cat=cats.find(c=>c.id===catId);
      const contact=this.actualContact(cat,bird,camera);
      if(!contact)return null; // also guards every external developer hook
      const position=bird.screenPosition(camera);
      // The only art is part of the contact pose, attached to the cat.
      // No independent feathers / poofs / explosion actors are created.
      bird.hiddenFor=bird.rng.between(10,18);
      this.contactEvents++;
      const detail={birdId:bird.id,species:bird.species,contactEventId:this.contactEvents,
        screenX:position.x,screenY:position.y,worldX:bird.x,
        contact:contact.kind,catId:cat.id,contactArt:`cat-contact-${cat.id}-${bird.species}`,
        separateFeatherInstances:0};
      window.dispatchEvent(new CustomEvent('wanderingworld:birdcaught',{detail}));
      return detail;
    }
    catchNearest(screenX,screenY,radius,camera){
      let nearest=null,distance=Infinity;
      const maxRadius=U.clamp(Number(radius)||35,1,150);
      for(const bird of this.visibleBirds(camera)){
        const d=Math.hypot(bird.screenX-screenX,bird.screenY-screenY);
        if(d<=maxRadius+bird.radius&&d<distance){nearest=bird;distance=d;}
      }
      // Developer/UI hooks now obey the same verified physical contact gate.
      // UI/debug clicks cannot fabricate a cat mouth/paw contact.
      return null;
    }
    closestBird(camera){
      let closest=null,dist=Infinity;
      for(const bird of this.birds){
        if(!this.activeBird(bird)||bird.hiddenFor>0)continue;
        const sx=U.wrapDelta(bird.x,camera.x,this.world.length);
        const d=Math.abs(sx-camera.width*.5);
        if(d<dist){dist=d;closest=bird;}
      }
      return closest;
    }
    inspect(){
      const states={};for(const bird of this.birds){states[bird.state]=(states[bird.state]||0)+1;}
      return {total:this.birds.length,visible:this.visible,perched:this.perched,
        frameSprites:7*33,species:SPECIES,flocks:this.flocks.size,behaviors:states,
        standaloneExplosionActors:0,standaloneFeatherActors:0,
        catAttachedContactEvents:this.contactEvents,
        birdDensity:this.density,catchPeriod:this.catchPeriodStatus(),
        visualScale:BIRD_VISUAL_SCALE,walkingPathY:this.walkingPathY,
        walkingLaneAltitude:this.walkingLaneAltitude({height:600}),
        source:'Isolated generated bird atlases'};
    }
  }
  WW.Bird=Bird;WW.BirdManager=BirdManager;
})(window.WanderingWorld=window.WanderingWorld||{});
