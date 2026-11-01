/* Onyx's Adventures: independent original PixelPaws-derived WASM brains,
   transparent original PNG atlases, three pets and temporary sleeping tents.
   The former white catsCanvas / cats.html is NEVER mounted or rendered. */
(function (WW) {
  'use strict';
  const U=WW.util;
  const IDS=['onyx','callie','harvey'];
  const COLORS={
    onyx:{name:'green',fabric:'#41a65d',roof:'#267c45',trim:'#b7f5a5',shadow:'#164b32'},
    callie:{name:'purple',fabric:'#9262c3',roof:'#653b99',trim:'#f1d2ff',shadow:'#46276c'},
    harvey:{name:'pink',fabric:'#ee87ba',roof:'#c85199',trim:'#ffe5f3',shadow:'#8c3f77'}
  };
  const STATE={
    onyx:['idle','walk','idle','fall','idle','walk','idle','proud','stretch','idle','idle','play','walk','play','crouch','pounce','proud','groom','yawn','idle','idle','idle','idle','idle','walk','pounce','talk'],
    callie:['idle','walk','sleep','idle','idle','walk','eat','idle','stretch','idle','idle','idle','walk','idle','crouch','pounce','proud','groom','yawn','loaf','idle','idle','idle','idle','walk','pounce','yawn'],
    harvey:['idle','walk','zoomies','groom','stretch','play','sniff','pounce','yawn','look']
  };
  const rand=(a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const choose=values=>values[Math.floor(Math.random()*values.length)];
  const mean=(a,b)=>a+(b-a)*.5;

  class AdventureCats {
    constructor(app){
      this.app=app;this.cats=[];this.ready=false;this.clock=0;
      this.reduceMotion=false;this.social=null;this.nextSocial=rand(22,39);
      this.commonFootY=0;this.loadedPromise=null;this.petPointer=null;
      this.unregister=[];this.world=app.world;this.persona=window.CAT_PERSONALITIES?.cats||{};
      this.lastMeowAt=-200;this.contactFrames=window.CAT_BIRD_CONTACT_FRAMES;
      this.meowClips={onyx:[],callie:[],harvey:[]};
      this.setGround();
    }
    setGround(){this.commonFootY=this.app.terrain.treeBaseY(this.app.camera)+25;}
    hasNoWhiteBackground(){return this.cats.length===3 && this.cats.every(c=>c.transparent&&c.image?.naturalWidth>0);}
    get(id){return this.cats.find(c=>c.id===id);}
    async engine(id){
      let bytes=null;
      if(location.protocol!=='file:'){
        try{const res=await fetch('../../script/'+id+'-engine.wasm');if(res.ok)bytes=await res.arrayBuffer();}
        catch(e){console.warn('WASM network loading failed; bundled fallback will be used',id);}
      }
      if(!bytes){
        const base64=window.CATS_WASM_BYTES?.[id];
        if(!base64)throw new Error('Missing WASM fallback for '+id);
        const decoded=atob(base64),array=new Uint8Array(decoded.length);
        for(let i=0;i<array.length;i++)array[i]=decoded.charCodeAt(i);
        bytes=array.buffer;
      }
      const result=await WebAssembly.instantiate(bytes,{});
      return result.instance.exports;
    }
    async start(){
      if(this.loadedPromise)return this.loadedPromise;
      this.loadedPromise=this._start();return this.loadedPromise;
    }
    async _start(){
      const width=this.app.camera.width,height=this.app.camera.height;
      const start=300;
      await Promise.all(IDS.map(async (id,i)=>{
        const manifest=window.CAT_MANIFESTS[id];
        const image=new Image();image.decoding='async';image.src=manifest.sheet;
        const [brain]=await Promise.all([this.engine(id),image.decode()]);
        // Original RGBA assets were alpha-verified during packaging. Pixel hit
        // regions come from precomputed alpha bounds, so loading via file://
        // never taints a canvas through getImageData or adds a white plate.
        const transparent=!!window.CAT_FRAME_BOUNDS?.[id] &&
          image.naturalWidth===manifest.columns*manifest.cellWidth;
        if(!transparent)throw new Error(id+' sprite sheet or alpha manifest is missing');
        // Visible size hierarchy: Onyx largest, Callie in the middle,
        // Harvey smallest. No pixels, proportions or fur colors are changed.
        const scale={onyx:88,callie:76,harvey:66}[id];
        const h=scale, w=scale*manifest.cellWidth/manifest.cellHeight;
        const initial=start+[0,Math.max(85,width*.25),Math.max(185,width*.51)][i];
        const c={id,manifest,image,frameBounds:window.CAT_FRAME_BOUNDS[id],transparent,brain,
          w,h,footY:this.commonFootY,clock:0,frame:0,lastFrame:-1,lastState:-1,
          animClock:0,nextDecision:rand(8,20),sleepiness:[.26,.16,0][i],
          hunger:[.60,.48,.52][i],thirst:[.51,.57,.63][i],
          care:null,careCooldown:10+i*6,pose:null,poseUntil:0,
          lastCareCompleted:null,playedFrames:new Set(),
          rest:null,restCooldown:12+i*9,tentColor:COLORS[id].name,
          userRequested:false, lastCare:'',socialUntil:0,brainReady:true,
          busyUntil:0,cuedAction:null,jump:null,contactVisual:null,vocal:null,nextMeow:rand(18,45),meowIndex:0,
          personality:this.persona[id]||{}};
        c.x=()=>brain.get(0);
        c.y=()=>brain.get(1);
        c.actualW=()=>brain.get(id==='harvey'?2:4);
        c.actualH=()=>brain.get(id==='harvey'?3:5);
        c.state=()=>brain.get(id==='harvey'?4:8)|0;
        c.facing=()=>brain.get(id==='harvey'?5:9)|0;
        c.frameId=()=>brain.get(id==='harvey'?6:11)|0;
        c.energy=()=>id==='harvey'?clamp(1-c.sleepiness*.45,.10,1):brain.get(6);
        c.worldX=()=>U.modulo(c.x()+c.actualW()/2,this.world.length);
        if(id==='harvey'){
          brain.init(this.world.length,height,w,h,(Date.now()+i*41)>>>0);
          brain.set_ground(this.commonFootY);brain.place(initial);
        }else{
          brain.init(this.world.length,height,w,h,initial-w/2,this.commonFootY-h,
            id==='onyx'?.75:.72,.15,(Date.now()+i*97)>>>0);
          brain.config(id==='onyx'?.47:.42,1,id==='callie'?1:0,id==='callie'?1:0,0);
          brain.reset_surfaces();brain.add_surface(0,this.world.length,this.commonFootY);
          brain.place(initial,this.commonFootY);
        }
        this.cats[i]=c;
      }));
      this.ready=true;
      window.addEventListener('wanderingworld:birdcaught',event=>{
        this.showVerifiedContact(event.detail);
      });
      this.app.camera.x=U.modulo(this.get('onyx').worldX()-this.app.camera.width*.23,this.world.length);
      this.unregister=IDS.map(id=>this.app.birds.registerCat(id,()=>{
        const cat=this.get(id);
        return {worldX:cat.worldX(),canCatch:this.canHunt(cat),active:true,
          jumping:!!cat.jump,targetBirdId:cat.jump?cat.jump.targetBirdId:null,
          tryJump:(bird,camera)=>this.prepareJump(cat,bird,camera,true),
          strikePoints:(camera)=>this.strikePoints(cat,camera)};
      }));
      window.CatCompanions=Object.freeze({
        snapshot:()=>this.snapshot(),runSocial:kind=>this.startSocial(kind),
        pause:()=>this.app.camera.setPaused(true),resume:()=>this.app.camera.setPaused(false),
        requestRest:id=>this.requestRest(id),
        getPetState:()=>this.getPetState(),
        setCuedAction:(id,action,duration)=>this.setCuedAction(id,action,duration),
        endCuedAction:id=>this.endCuedAction(id),
        silence:()=>this.stopMeows(),
        voiceSnapshot:()=>this.cats.map(c=>({id:c.id,mouthOpen:this.mouthOpen(c),
          vocalizing:!!c.vocal,meowSelections:this.meowClips[c.id].length}))
      });
      window.dispatchEvent(new CustomEvent('onyx-adventures:cats-ready',{detail:{ids:IDS.slice()}}));
      return true;
    }
    // The mouth visibly opens for exactly the interval that the selected
    // recording is playing. Idle/yawn frames cannot silently trigger sound.
    mouthOpen(cat){return !!cat.vocal && !cat.vocal.audio.paused &&
      !cat.vocal.audio.ended && this.app.sound.enabled && !this.app.camera.paused;}
    animate(cat){
      if(this.mouthOpen(cat))return cat.manifest.animations.talk.frames[0];
      if(cat.care?.phase==='using'){
        const anim=cat.manifest.animations[cat.care.kind];
        return anim.frames[Math.floor(cat.animClock*(anim.fps||3))%anim.frames.length];
      }
      if(cat.jump)return cat.manifest.animations.pounce.frames[Math.min(1,Math.floor((cat.jump.elapsed/cat.jump.duration)*2))];
      let name=STATE[cat.id][cat.state()]||'idle';
      if(name==='eat'&&!cat.care)name='idle'; // no pretending to eat without food
      if(cat.pose && this.clock<cat.poseUntil && !cat.rest)name=cat.pose;
      if(cat.rest?.phase==='sleep')name=cat.id==='callie'?'sleep':'idle';
      let anim=cat.manifest.animations[name]||cat.manifest.animations.idle;
      if(!anim)anim=Object.values(cat.manifest.animations)[0];
      const frameIndex=Math.floor(cat.animClock*(anim.fps||1));
      return anim.frames[anim.loop?frameIndex%anim.frames.length:Math.min(frameIndex,anim.frames.length-1)]||0;
    }
    bounds(cat,camera){
      const x=U.wrapDelta(cat.worldX(),camera.x,this.world.length);
      let footY=this.commonFootY;
      // A sleeping cat settles a little closer to the tent's sleeping pad.
      if(cat.rest?.phase==='sleep')footY-=2;
      const jumpOffset=cat.jump?this.jumpHeight(cat):0;
      return {x:Math.round(x-cat.w/2),y:Math.round(footY-cat.h-jumpOffset),
        w:Math.round(cat.w),h:Math.round(cat.h),centerX:x,footY};
    }
    hitTest(clientX,clientY){
      const canvas=this.app.canvas,rect=canvas.getBoundingClientRect(),camera=this.app.camera;
      const x=(clientX-rect.left)*camera.width/rect.width;
      const y=(clientY-rect.top)*camera.height/rect.height;
      for(const cat of this.cats.slice().reverse()){
        const b=this.bounds(cat,camera),ix=Math.floor((x-b.x)/b.w*cat.manifest.cellWidth),
          iy=Math.floor((y-b.y)/b.h*cat.manifest.cellHeight);
        if(ix<0||iy<0||ix>=cat.manifest.cellWidth||iy>=cat.manifest.cellHeight)continue;
        const face=cat.facing()<0?cat.manifest.cellWidth-1-ix:ix;
        const alphaBox=cat.frameBounds[cat.frame]||[0,0,0,0];
        if(face>=alphaBox[0]&&face<alphaBox[2]&&iy>=alphaBox[1]&&iy<alphaBox[3])
          return cat;
      }
      return null;
    }
    onPointerDown(e){
      if(!this.ready||e.button!==0)return false;
      const hit=this.hitTest(e.clientX,e.clientY);
      if(!hit)return false;
      this.petPointer={id:e.pointerId,x:e.clientX,y:e.clientY,cat:hit.id};
      return true; // stop manual camera drag if the actual cat was tapped.
    }
    onPointerUp(e){
      const p=this.petPointer;
      if(!p||e.pointerId!==p.id)return false;
      this.petPointer=null;
      if(Math.hypot(e.clientX-p.x,e.clientY-p.y)<12)this.touchCat(p.cat);
      return true;
    }
    touchCat(id){
      const c=this.get(id);if(!c||c.rest||c.jump||c.cuedAction||this.clock<c.busyUntil)return false;
      if(id==='onyx')c.brain.boop();
      else if(id==='callie'){c.brain.pet(1);c.releasePetAt=this.clock+1.4;}
      else c.brain.play();
      c.socialUntil=this.clock+3;
      return true;
    }
    invite(cat,target){
      if(cat.rest||cat.care||cat.jump||cat.cuedAction||this.clock<cat.busyUntil)return;
      const candidate=this.limitTentTarget(cat,cat.worldX(),target);
      const aim=clamp(candidate,cat.w/2+1,this.world.length-cat.w/2-1);
      cat.brain.come_to(aim);
      cat.nextDecision=this.clock+rand(5,11);
    }
    decide(cat){
      if(cat.rest||cat.care||cat.jump||cat.cuedAction||this.clock<cat.busyUntil||this.clock<cat.socialUntil)return;
      const r=Math.random(),p=cat.worldX();
      if(this.clock>=cat.restCooldown && (cat.sleepiness>=.98||
        cat.energy()<.35) && this.beginRest(cat))return;
      if(cat.id==='onyx'){
        if(r<.16){cat.pose=choose(['settle','crouch','play']);
          cat.poseUntil=this.clock+rand(3,5);cat.brain.force(0);}
        else if(r<.59)cat.brain.force(0);
        else if(r<.73)cat.brain.force(17);
        else if(r<.84)cat.brain.force(8);
        else if(r<.93)this.invite(cat,p+rand(-70,88));
        else cat.brain.force(18);
        cat.nextDecision=this.clock+rand(10,20);
      }else if(cat.id==='callie'){
        if(r<.22){cat.pose=choose(['settle','crouch','play']);
          cat.poseUntil=this.clock+rand(3,6);cat.brain.force(19);}
        else if(r<.46)cat.brain.force(19);
        else if(r<.61)cat.brain.force(17);
        else if(r<.78)cat.brain.force(0);
        else if(r<.89)this.invite(cat,p+rand(-95,95));
        else if(r<.96)cat.brain.force(8);
        else cat.brain.force(12);
        cat.nextDecision=this.clock+rand(12,25);
      }else{
        if(r<.12){cat.pose=choose(['settle','sniff','stretch','crouch']);
          cat.poseUntil=this.clock+rand(2,4);cat.brain.force(0);}
        else if(r<.22)cat.brain.play();
        else if(r<.34)cat.brain.force?.(2);
        else if(r<.65)this.invite(cat,mean(p,this.get('onyx').worldX())+rand(-125,125));
        else if(r<.80)cat.brain.mouse(p+70,this.commonFootY);
        else cat.brain.play();
        cat.nextDecision=this.clock+rand(4,9);
      }
    }
    startSocial(type){
      if(!this.ready||this.social)return false;
      const types=['greeting','parallel','secretary_interrupts','callie_refuses','zoomie_chase','gentle_groom','onyx_complaint'];
      type=types.includes(type)?type:choose(types);
      const byType={greeting:['onyx','harvey'],parallel:IDS,
        secretary_interrupts:['callie','harvey'],callie_refuses:['callie','harvey'],
        zoomie_chase:['callie','harvey'],gentle_groom:['callie','harvey'],
        onyx_complaint:['onyx','harvey']};
      const members=byType[type];if(members.some(id=>{const c=this.get(id);return c.rest||c.care||c.jump||c.cuedAction||this.clock<c.busyUntil;}))return false;
      const anchor=this.get(members.includes('onyx')?'onyx':'callie');
      const gap=Math.max(65,Math.min(115,this.app.camera.width*.22));
      for(const id of members){
        const cat=this.get(id);if(cat===anchor)continue;
        this.invite(cat,anchor.worldX()+(id==='harvey'?gap:-gap));
        cat.socialUntil=this.clock+5;
      }
      this.social={type,until:this.clock+8};
      return true;
    }
    // Tent footprints are reserved WORLD intervals. Every other cat's center
    // is blocked at the tent's outer boundary, regardless of direction or
    // wrap seam. Only the owning cat may enter for its own sleep sequence.
    tentHalfWidth(cat){return 45+cat.w*.5;}
    tentReservation(candidate,cat){
      return this.cats.every(other=>{
        if(other===cat)return true;
        const space=this.tentHalfWidth(other)+cat.w*.5+8;
        if(Math.abs(U.wrapDelta(other.worldX(),candidate,this.world.length))<space)return false;
        return !other.rest || Math.abs(U.wrapDelta(other.rest.anchor,candidate,this.world.length))>116;
      });
    }
    limitTentTarget(cat,from,to){
      const length=this.world.length;
      let delta=U.wrapDelta(to,from,length);
      let shortest=delta;
      for(const owner of this.cats){
        if(owner===cat||!owner.rest)continue;
        const anchor=owner.rest.anchor;
        const radius=this.tentHalfWidth(cat)+6;
        const relative=U.wrapDelta(anchor,from,length);
        if(Math.abs(relative)<radius){
          shortest=0;break; // a new tent must never appear around a visitor
        }
        if(delta>0&&relative>0&&relative-radius<=shortest)
          shortest=Math.max(0,relative-radius);
        if(delta<0&&relative<0&&relative+radius>=shortest)
          shortest=Math.min(0,relative+radius);
      }
      return U.modulo(from+shortest,length);
    }
    enforceTentBoundaries(cat,oldX){
      if(cat.rest?.phase==='sleep'||cat.rest?.phase==='opening')return;
      const current=cat.worldX(),limited=this.limitTentTarget(cat,oldX,current);
      if(Math.abs(U.wrapDelta(limited,current,this.world.length))>.05){
        cat.brain.place(limited,cat.footY);
        // Steer away so the WASM target does not push repeatedly through fabric.
        const away=U.wrapDelta(oldX,limited,this.world.length);
        const retreat=U.modulo(limited+(away>=0?18:-18),this.world.length);
        cat.brain.come_to(retreat);
        cat.blockedByTent=true;
      }else cat.blockedByTent=false;
    }
    beginRest(cat){
      if(cat.rest||cat.care||cat.jump||cat.contactVisual||cat.cuedAction||this.clock<cat.busyUntil)return false;
      let anchor=null;
      for(const distance of [25,-45,85,-90,140,-150]){
        const attempt=U.modulo(cat.worldX()+distance,this.world.length);
        if(this.tentReservation(attempt,cat)){anchor=attempt;break;}
      }
      if(anchor===null)return false;
      anchor=clamp(anchor,cat.w+1,this.world.length-cat.w-1);
      cat.rest={phase:'approach',anchor,since:this.clock,
        duration:cat.id==='onyx'?rand(18,28):cat.id==='callie'?rand(16,27):rand(9,16),
        scale:0,phaseSince:this.clock};
      this.inviteRest(cat,anchor);
      return true;
    }
    inviteRest(cat,anchor){
      // Owners are intentionally permitted to cross their own entrance.
      cat.brain.come_to(anchor);
    }
    requestRest(id){
      const cat=this.get(id);
      if(!cat)return false;
      // Requests never fabricate sleep needs: check real simulated intention.
      if(cat.sleepiness<.84 && cat.energy()>.42)return false;
      return this.beginRest(cat);
    }
    restTick(cat,dt){
      const r=cat.rest;if(!r)return false;
      const age=this.clock-r.phaseSince;
      if(r.phase==='approach'){
        if(Math.abs(U.wrapDelta(cat.worldX(),r.anchor,this.world.length))<10){
          // Ground-plane arrival: only now can the fabric unfold.
          cat.brain.place(r.anchor,cat.footY);
          r.phase='opening';r.phaseSince=this.clock;
        } else if(age>2 && Math.floor(age)%3===0)this.inviteRest(cat,r.anchor);
      }else if(r.phase==='opening'){
        r.scale=this.reduceMotion?1:clamp(age/.8,0,1);
        if(age>.8){r.phase='sleep';r.phaseSince=this.clock;r.scale=1;
          cat.brain.place(r.anchor,cat.footY);
          if(cat.id==='callie')cat.brain.force(2);
          else if(cat.id==='onyx')cat.brain.force(0);
        }
      }else if(r.phase==='sleep'){
        cat.sleepiness=clamp(cat.sleepiness-dt*.055,0,2);
        if(age>=r.duration){r.phase='exiting';r.phaseSince=this.clock;
          if(cat.id==='callie')cat.brain.force(0);
          else if(cat.id==='harvey')cat.brain.play();
          else cat.brain.force(8);
          cat.brain.come_to(clamp(r.anchor+68,cat.w,this.world.length-cat.w));
        }
      }else if(r.phase==='exiting'){
        // Never collapse while the cat body occupies its door/footprint.
        if(Math.abs(U.wrapDelta(cat.worldX(),r.anchor,this.world.length))>64){
          r.phase='closing';r.phaseSince=this.clock;
        }else if(age>12){
          // Keep the flap up while still occupied; retry walking out.
          cat.brain.come_to(clamp(r.anchor+86,cat.w,this.world.length-cat.w));
        }
      }else if(r.phase==='closing'){
        r.scale=this.reduceMotion?0:clamp(1-age/.9,0,1);
        if(age>.9){cat.rest=null;cat.restCooldown=this.clock+rand(30,60);
          cat.sleepiness=Math.min(cat.sleepiness,.20);cat.nextDecision=this.clock+rand(3,9);}
      }
      return !!cat.rest;
    }
    canBeginCare(cat){
      return !!cat && !cat.rest && !cat.care && !cat.jump && !cat.vocal &&
        !cat.contactVisual && !cat.cuedAction && this.clock>=cat.busyUntil &&
        this.clock>=cat.careCooldown && !this.social &&
        this.clock>=cat.socialUntil;
    }
    beginCare(cat,kind){
      if(!this.canBeginCare(cat)||!['eat','drink'].includes(kind))return false;
      if((kind==='eat'?cat.hunger:cat.thirst)<.72)return false;
      const from=cat.worldX();
      const direction=cat.id==='onyx'?1:cat.id==='callie'?-1:1;
      const anchor=this.limitTentTarget(cat,from,
        U.modulo(from+direction*22,this.world.length));
      cat.care={kind,anchor,phase:'approach',since:this.clock,usingSince:0};
      cat.pose=null;cat.nextDecision=this.clock+16;
      // The real PNG frames 24-26 and 28-30 ALREADY contain the correct
      // cat-owned bowl and tongue/splash details. Never layer a duplicate.
      cat.brain.come_to(anchor);
      return true;
    }
    careTick(cat,dt){
      const c=cat.care;if(!c)return;
      if(c.phase==='approach'){
        if(Math.abs(U.wrapDelta(cat.worldX(),c.anchor,this.world.length))<13 ||
           this.clock-c.since>7){
          c.phase='using';c.usingSince=this.clock;cat.animClock=0;
          cat.brain.place(c.anchor,cat.footY);
          if(cat.id==='callie'&&c.kind==='eat')cat.brain.force(6);
          else cat.brain.force(0);
        }else if(this.clock-c.since>3 && Math.floor(this.clock)%2===0)
          cat.brain.come_to(c.anchor);
      }else if(c.phase==='using'){
        // The brain is frozen at the entrance while care frames play.
        // DO NOT call brain.place() each tick: its WASM implementation
        // enters IDLE and increments frameId, restarting animation at 24/28.
        if(this.clock-c.usingSince>=(c.kind==='eat'?6.5:6.2)){
          if(c.kind==='eat')cat.hunger=.10;else cat.thirst=.10;
          cat.lastCareCompleted=c.kind;
          cat.care=null;cat.careCooldown=this.clock+rand(12,25);
          cat.busyUntil=this.clock+1.3;cat.nextDecision=this.clock+rand(3,8);
          cat.brain.force(0);
          window.dispatchEvent(new CustomEvent('onyx-adventures:cat-care-completed',
            {detail:{catId:cat.id,kind:c.kind,at:this.clock}}));
        }
      }
    }
    update(dt){
      if(!this.ready||dt<=0)return;
      this.clock+=dt;this.setGround();
      if(!this.app.sound.enabled||document.hidden)this.stopMeows();
      const cam=this.app.camera,height=cam.height;
      for(const cat of this.cats){
        if(cat.footY!==this.commonFootY || cat.canvasHeight!==height){
          cat.footY=this.commonFootY;cat.canvasHeight=height;
          cat.brain.set_world(this.world.length,height);
          cat.brain.set_size(cat.w,cat.h);
          if(cat.id==='harvey')cat.brain.set_ground(cat.footY);
          else {cat.brain.reset_surfaces();cat.brain.add_surface(0,this.world.length,cat.footY);}
          if(cat.rest?.phase==='sleep')cat.brain.place(cat.rest.anchor,cat.footY);
        }
        const r=cat.rest,oldX=cat.worldX();
        if((!r || r.phase==='approach'||r.phase==='exiting') &&
           cat.care?.phase!=='using'){
          if(cat.id==='harvey')cat.brain.tick(dt);
          else {cat.brain.tick(dt,12);cat.brain.take_events();}
          this.enforceTentBoundaries(cat,oldX);
        }
        if(cat.jump){cat.jump.elapsed+=dt;
          if(cat.jump.elapsed>=cat.jump.duration)cat.jump=null;}
        if(cat.contactVisual){cat.contactVisual.elapsed+=dt;
          if(cat.contactVisual.elapsed>=cat.contactVisual.duration||cat.rest||cat.cuedAction)
            cat.contactVisual=null;}
        cat.animClock+=dt;
        if(cat.releasePetAt && this.clock>=cat.releasePetAt){cat.brain.pet(0);cat.releasePetAt=0;}
        if(!r && !cat.care)cat.sleepiness=clamp(cat.sleepiness+dt*
          (cat.id==='onyx'?.023:cat.id==='callie'?.018:.012),0,2);
        // Separate non-punitive scene needs; WASM hunger is not exposed as a
        // reliable mutable value on all three builds, so do not read it as a
        // second competing source of truth.
        cat.hunger=clamp(cat.hunger+dt/385,0,1);
        cat.thirst=clamp(cat.thirst+dt/330,0,1);
        if(!r && !cat.care && this.canBeginCare(cat)){
          if(cat.thirst>=.76 && (cat.thirst>=cat.hunger||cat.hunger<.72))
            this.beginCare(cat,'drink');
          else if(cat.hunger>=.72)this.beginCare(cat,'eat');
        }
        if(cat.care)this.careTick(cat,dt);
        if(!r && !cat.care && this.clock>cat.nextDecision)this.decide(cat);
        if(cat.cuedAction && this.clock>=cat.busyUntil &&
           !/feed|eat|water|drink|sleep|rest/i.test(cat.cuedAction))cat.cuedAction=null;
        if(cat.rest)this.restTick(cat,dt);
        // Organic short calls: no overlapping meows, no idle sound without a
        // visibly open mouth, no audio without an explicit user sound opt-in.
        /* All unsolicited cat meows disabled; only alert box notification sounds are permitted. */
        const state=cat.state(),frame=cat.frameId();
        // WASM frame IDs change rapidly while walking; resetting the JS
        // animation on every raw frame change suppressed most of the atlas.
        // Reset only on a genuine animation category transition.
        const animKey=cat.vocal?'talk':cat.care?.phase==='using'?'care:'+cat.care.kind:
          cat.jump?'pounce':cat.pose && this.clock<cat.poseUntil?'pose:'+cat.pose:
          STATE[cat.id][state]||'idle';
        if(animKey!==cat.animKey){cat.animClock=0;cat.animKey=animKey;}
        cat.lastState=state;cat.lastFrame=frame;
        cat.frame=this.animate(cat);
        if(cat.frameBounds[cat.frame]?.[2]>0)cat.playedFrames.add(cat.frame);
      }
      if(this.clock>this.nextSocial && !this.social){
        this.startSocial();this.nextSocial=this.clock+rand(18,36);
      }
      if(this.social&&this.clock>=this.social.until)this.social=null;
      // Follow only actual Onyx horizontal walking, not a background timer.
      const leader=this.get('onyx');
      if(!cam.dragging && cam.elapsed>=(cam.manualUntil||0)){
        const wanted=U.modulo(leader.worldX()-cam.width*.23,this.world.length);
        const delta=U.wrapDelta(wanted,cam.x,this.world.length);
        cam.x=U.modulo(cam.x+delta*Math.min(1,dt*2.9),this.world.length);
      }
    }
    draw(ctx,camera,light){
      if(!this.ready)return;
      // No white fill: source atlases have transparent pixels. The scene is
      // already painted directly into this same shared world canvas.
      for(const cat of this.cats)if(cat.rest)this.drawTentBack(ctx,camera,cat);
      const order=this.cats.slice().sort((a,b)=>a.id==='onyx'?1:b.id==='onyx'?-1:a.worldX()-b.worldX());
      for(const cat of order)this.drawCat(ctx,camera,cat,light);
      for(const cat of this.cats)if(cat.rest)this.drawTentFront(ctx,camera,cat);
    }
    drawCat(ctx,camera,cat,light){
      const b=this.bounds(cat,camera);
      if(b.x+b.w<0||b.x>camera.width)return;
      const m=cat.manifest;
      const frame=cat.rest?.phase==='sleep' ? 8:cat.frame;
      const sx=(frame%m.columns)*m.cellWidth,sy=Math.floor(frame/m.columns)*m.cellHeight;
      ctx.save();ctx.imageSmoothingEnabled=false;
      if(cat.rest?.phase==='sleep'){
        this.drawCurledSleeper(ctx,cat,b);ctx.restore();return;
      }
      if(cat.contactVisual && this.drawVerifiedContact(ctx,camera,cat,b)){
        ctx.restore();return;
      }
      ctx.translate(Math.round(b.x+(cat.facing()<0?b.w:0)),Math.round(b.y));
      if(cat.facing()<0)ctx.scale(-1,1);
      if(light.night>.2)ctx.filter=`brightness(${1-light.night*.28})`;
      ctx.drawImage(cat.image,sx,sy,m.cellWidth,m.cellHeight,0,0,b.w,b.h);
      ctx.filter='none';ctx.restore();
    }
    showVerifiedContact(detail){
      if(!detail||!detail.catId||!detail.species||
         !['mouth','paw'].includes(detail.contact))return false;
      const cat=this.get(detail.catId);
      const frame=this.contactFrames?.sprites?.[detail.catId]?.[detail.species];
      if(!cat||!frame||frame.kind!==detail.contact||!cat.jump||
         cat.jump.targetBirdId!==detail.birdId||!this.canHunt(cat)||
         !this.app.assets.catContact(cat.id,detail.species))return false;
      cat.contactVisual={species:detail.species,kind:detail.contact,
        elapsed:0,duration:this.contactFrames.durationSeconds,verifiedBirdId:detail.birdId};
      return true;
    }
    drawVerifiedContact(ctx,camera,cat,b){
      const hit=cat.contactVisual;
      if(!hit||cat.rest||cat.cuedAction)return false;
      const entry=this.contactFrames?.sprites?.[cat.id]?.[hit.species];
      const image=this.app.assets.catContact(cat.id,hit.species);
      if(!entry||!image||entry.kind!==hit.kind)return false;
      const [sx,sy,sw,sh]=entry.alphaBounds;
      // The 280×220 originals contain generous transparent padding.
      // Crop to their actual alpha, retain *all* cat/bird/feather pixels,
      // then size based on the existing cat's visible body—not 280px canvas.
      const pixelScale=cat.h*.48/116;
      const w=sw*pixelScale,h=sh*pixelScale;
      const x=b.centerX+(sx-140)*pixelScale;
      const y=(b.y+b.h) - (sy+sh)*pixelScale;
      ctx.save();ctx.imageSmoothingEnabled=false;
      if(cat.facing()<0){
        ctx.translate(Math.round(b.centerX),0);ctx.scale(-1,1);
        ctx.drawImage(image,sx,sy,sw,sh,Math.round(b.centerX-x-w),Math.round(y),w,h);
      }else ctx.drawImage(image,sx,sy,sw,sh,Math.round(x),Math.round(y),w,h);
      // The source PNG itself contains the feather contact pose. No
      // additional particles or separately exploding bird are painted.
      ctx.restore();return true;
    }
    drawCurledSleeper(ctx,cat,b){
      // Original dedicated curled sleeping frames for both sisters, scaled to
      // a tiny ball on the tent mat. Onyx gets a drawn black curled silhouette
      // rather than a stretched-out pose or invented white rectangle.
      const w=Math.round(cat.w*(cat.id==='onyx'?.49:.66)),
        h=Math.round(cat.h*(cat.id==='onyx'?.32:.51)),
        x=Math.round(b.centerX-w/2),y=Math.round(this.commonFootY-h-1);
      if(cat.id!=='onyx'){
        const m=cat.manifest,frame=8;
        ctx.drawImage(cat.image,(frame%m.columns)*m.cellWidth,
          Math.floor(frame/m.columns)*m.cellHeight,m.cellWidth,m.cellHeight,
          x,y,w,h);
        return;
      }
      const unit=Math.max(1,Math.round(w/19));
      ctx.fillStyle='#20252b';ctx.beginPath();ctx.ellipse(x+w*.48,y+h*.61,w*.46,h*.37,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#30343a';ctx.beginPath();ctx.ellipse(x+w*.35,y+h*.63,w*.23,h*.21,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#15181f';ctx.beginPath();ctx.ellipse(x+w*.70,y+h*.52,w*.24,h*.29,0,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.moveTo(x+w*.54,y+h*.37);ctx.lineTo(x+w*.57,y+h*.10);ctx.lineTo(x+w*.72,y+h*.30);ctx.fill();
      ctx.beginPath();ctx.moveTo(x+w*.75,y+h*.28);ctx.lineTo(x+w*.89,y+h*.08);ctx.lineTo(x+w*.92,y+h*.43);ctx.fill();
      ctx.strokeStyle='#4b5557';ctx.lineWidth=Math.max(1,unit);
      ctx.beginPath();ctx.arc(x+w*.21,y+h*.61,w*.2,1.1,4.5);ctx.stroke();
      ctx.fillStyle='#749c70';ctx.fillRect(Math.round(x+w*.68),Math.round(y+h*.53),unit*2,unit);
    }
    tentGeometry(cat,camera){
      const r=cat.rest;if(!r)return null;
      const x=U.wrapDelta(r.anchor,camera.x,this.world.length);
      const foot=this.commonFootY;
      const k=r.phase==='approach'?.10:r.phase==='opening'||r.phase==='closing'?r.scale:1;
      return {x:Math.round(x),y:Math.round(foot),w:78*k,h:64*k,k};
    }
    drawTentBack(ctx,camera,cat){
      const t=this.tentGeometry(cat,camera);if(!t||t.k<=0)return;
      const {x,y,w,h}=t,C=COLORS[cat.id];
      ctx.save();ctx.imageSmoothingEnabled=false;
      // Transparent shadow/ground cloth, no opaque background rectangle.
      ctx.fillStyle='rgba(15,42,31,.17)';ctx.beginPath();ctx.ellipse(x,y+1,w*.52,4,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=C.shadow;ctx.fillRect(x-w*.52,y-h*.26,w*1.04,h*.28);
      ctx.fillStyle=C.fabric;ctx.fillRect(x-w*.48,y-h*.73,w*.96,h*.53);
      // Foldable castle-like roof with two short turrets; pixel block edges.
      ctx.fillStyle=C.roof;ctx.beginPath();ctx.moveTo(x-w*.53,y-h*.70);
      ctx.lineTo(x-w*.18,y-h*.96);ctx.lineTo(x+w*.16,y-h*.96);
      ctx.lineTo(x+w*.53,y-h*.70);ctx.closePath();ctx.fill();
      ctx.fillRect(x-w*.48,y-h*.96,w*.15,h*.25);
      ctx.fillRect(x+w*.32,y-h*.96,w*.15,h*.25);
      ctx.fillStyle=C.trim;
      ctx.fillRect(x-w*.47,y-h*.99,Math.max(2,w*.17),Math.max(2,h*.035));
      ctx.fillRect(x+w*.30,y-h*.99,Math.max(2,w*.17),Math.max(2,h*.035));
      // Open entrance, still colored; mats anchor to the flat cat ground line.
      ctx.fillStyle='#22353e';ctx.fillRect(x-w*.24,y-h*.54,w*.48,h*.54);
      ctx.fillStyle=C.shadow;ctx.fillRect(x-w*.24,y-h*.54,w*.48,h*.05);
      ctx.fillStyle=C.trim;ctx.fillRect(x-w*.28,y-h*.08,w*.56,h*.08);
      ctx.restore();
    }
    drawTentFront(ctx,camera,cat){
      const t=this.tentGeometry(cat,camera);if(!t||t.k<=0)return;
      const {x,y,w,h}=t,C=COLORS[cat.id];
      ctx.save();ctx.imageSmoothingEnabled=false;
      // A continuous, physically attached front facade. Side-door triangles
      // JOIN the rear tent at their roof and floor, with a solid lintel and
      // uninterrupted foundation, so nobody can appear between detached layers.
      ctx.fillStyle=C.roof;
      ctx.fillRect(x-w*.53,y-h*.76,w*1.06,Math.max(2,h*.085)); // attached roof rim
      ctx.fillStyle=C.fabric;
      ctx.beginPath();ctx.moveTo(x-w*.53,y-h*.72);
      ctx.lineTo(x-w*.20,y-h*.53);ctx.lineTo(x-w*.13,y-h*.12);
      ctx.lineTo(x-w*.51,y-h*.10);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(x+w*.53,y-h*.72);
      ctx.lineTo(x+w*.20,y-h*.53);ctx.lineTo(x+w*.13,y-h*.12);
      ctx.lineTo(x+w*.51,y-h*.10);ctx.closePath();ctx.fill();
      ctx.fillStyle=C.shadow;
      ctx.fillRect(x-w*.53,y-h*.15,w*.28,Math.max(2,h*.13));
      ctx.fillRect(x+w*.25,y-h*.15,w*.28,Math.max(2,h*.13));
      // The top of the door touches the same continuous roof; the lower
      // beam touches the ground cloth. All parts share the identical x/y/w/h.
      ctx.fillStyle=C.trim;
      ctx.fillRect(x-w*.22,y-h*.55,w*.44,Math.max(2,h*.052));
      ctx.fillRect(x-w*.52,y-h*.12,w*.27,Math.max(2,h*.045));
      ctx.fillRect(x+w*.25,y-h*.12,w*.27,Math.max(2,h*.045));
      ctx.restore();
    }
    setCuedAction(id,action,duration=4){
      const c=this.get(id);if(!c)return false;
      c.cuedAction=String(action);
      c.busyUntil=this.clock+Math.max(0,Number(duration)||4);
      c.contactVisual=null;this.cancelJump(c);return true;
    }
    endCuedAction(id){const c=this.get(id);if(!c)return false;
      c.cuedAction=null;c.busyUntil=0;return true;}
    busyState(cat){
      const state=STATE[cat.id]?.[cat.state()]||'idle';
      return /sleep|eat|drink|groom|rest|yawn|fall/.test(state)||
        (cat.id==='callie'&&cat.state()===6);
    }
    canHunt(cat){
      return !!cat && this.ready && !cat.rest && !cat.care && !cat.vocal && !this.app.camera.paused &&
        !document.hidden && !cat.contactVisual && this.clock>=cat.busyUntil && !cat.cuedAction &&
        this.clock>=cat.socialUntil && !this.social && !this.busyState(cat) &&
        (!cat.jump || cat.jump.elapsed<cat.jump.duration);
    }
    jumpHeight(cat){
      if(!cat.jump)return 0;
      const t=clamp(cat.jump.elapsed/cat.jump.duration,0,1);
      return Math.sin(Math.PI*t)*cat.jump.peak;
    }
    prepareJump(cat,bird,camera,allowMiss=false){
      if(!this.canHunt(cat))return false;
      if(cat.jump)return cat.jump.targetBirdId===bird.id && !cat.contactVisual;
      const dx=Math.abs(U.wrapDelta(bird.x,cat.worldX(),this.world.length));
      const position=bird.screenPosition(camera);
      const baseline=this.commonFootY;
      // A miss is still a genuine visible attempt. Never convert mere
      // closeness into a catch: actualContact checks the mouth/paw alpha.
      if(position.x<-25||position.x>camera.width+25)return false;
      if(!allowMiss && (dx>29||position.y>baseline-16||position.y<baseline-110))return false;
      const peak=clamp(baseline-position.y-cat.h*.32,32,85);
      cat.jump={elapsed:0,duration:1.05,peak,targetBirdId:bird.id};
      cat.brain.force?.(cat.id==='onyx'?14:cat.id==='callie'?15:7);
      return true;
    }
    strikePoints(cat,camera){
      if(!cat.jump||!this.canHunt(cat))return [];
      const t=cat.jump.elapsed/cat.jump.duration;
      if(t<.14 || t>.86)return [];
      const b=this.bounds(cat,camera);
      const forward=cat.facing()<0?-1:1;
      return [
        {kind:'mouth',x:b.centerX+forward*cat.w*.20,y:b.y+cat.h*.48,r:5},
        {kind:'paw',x:b.centerX+forward*cat.w*.32,y:b.y+cat.h*.68,r:5}
      ];
    }
    cancelJump(cat){if(cat?.jump)cat.jump=null;}
    maybeMeow(cat){return false; /* ambient cat meows are prohibited */
      cat.nextMeow=this.clock+rand(cat.id==='harvey'?19:30,cat.id==='harvey'?55:82);
      if(!this.canHunt(cat)||cat.jump||cat.vocal||
         this.clock-this.lastMeowAt<7||!this.app.sound.enabled||
         this.app.sound.gain<=0)return false;
      const sounds=this.meowClips[cat.id];
      const file=sounds[cat.meowIndex%sounds.length];cat.meowIndex++;
      const audio=new Audio(file);audio.preload='auto';
      const unregister=this.app.sound.registerAudio(audio,.38);
      cat.vocal={audio,file,unregister};this.lastMeowAt=this.clock;
      const clear=()=>{if(cat.vocal?.audio===audio){cat.vocal=null;unregister();}};
      audio.onended=clear;audio.onerror=clear;
      const response=audio.play();if(response?.catch)response.catch(clear);
      return true;
    }
    stopMeows(){
      for(const cat of this.cats){
        if(cat.vocal){
          const vocal=cat.vocal;cat.vocal=null;
          vocal.unregister?.();vocal.audio.pause();vocal.audio.currentTime=0;
        }
      }
    }
    onCare(action){
      const c=this.get('onyx');
      if(!this.ready||!c)return {message:'The three cat WASM engines are still loading.'};
      if(['pet','scratch','slow-blink','slowblink','blink','brush'].includes(action)){
        this.touchCat('onyx');
        return {message:'Onyx acknowledges the attention with a small genuine sprite reaction.'};
      }
      if(action==='play'){
        this.setCuedAction('onyx','play',3);
        c.brain.force(11);return {message:'Onyx considers a quick play break; the sprite reacts.'};
      }
      if(['tuck','blanket','pillow'].includes(action)){
        const accepted=this.requestRest('onyx');
        return {message:accepted?'Onyx feels sleepy and has chosen his green pop-up tent.':
          'Onyx is not sleepy right now. His green tent appears only when he chooses to rest.'};
      }
      if(['feed','water'].includes(action)){
        const kind=action==='feed'?'eat':'drink';
        const n=kind==='eat'?c.hunger:c.thirst;
        if(c.care?.kind===kind)return {message:`Onyx is already ${kind==='eat'?'eating from his green bowl':'drinking from his green-and-white bowl'}.`};
        if(n<.72)return {message:`Onyx is ${kind==='eat'?'not hungry':'not thirsty'} right now. His own bowl will appear when he needs it.`};
        return {message:this.beginCare(c,kind)?
          `Onyx is heading to his ${kind==='eat'?'green food bowl':'green-and-white water bowl'} now.`:
          'Onyx is completing another activity first. The care request will not interrupt it.'};
      }
      return {message:`${action} is not yet connected to a physical outdoor action. No value was changed.`};
    }
    getPetState(){
      const c=this.get('onyx');
      if(!c)return {primaryBehavior:'Loading cat engines'};
      return {energy:Math.round(clamp(c.energy(),0,1)*100),
        fullness:Math.round(clamp(1-c.hunger,0,1)*100),
        primaryBehavior:c.rest?'Sleeping in green tent':STATE.onyx[c.state()]||'idle',
        visitors:'Callie and Harvey are here',
        // Hydration is the game's independent visible drinking simulation;
        // no unsupported biometric sensing or inferred affection is claimed.
        hydration:Math.round(clamp(1-c.thirst,0,1)*100),
        affection:null,comfort:null};
    }
    snapshot(){
      return {ready:this.ready,transparentBackground:this.hasNoWhiteBackground(),
        collisionBoundaries:true,contactOnlyArt:true,
        installedContactImages:this.contactFrames?Object.values(this.contactFrames.sprites).reduce((n,m)=>n+Object.keys(m).length,0):0,
        activeContactImages:this.cats.filter(c=>!!c.contactVisual).length,
        cats:this.cats.map(c=>({id:c.id,worldX:c.worldX(),footY:c.footY,
          renderWidth:c.w,renderHeight:c.h,wasmState:c.state(),frame:c.frame,
          hunger:Math.round(c.hunger*100),thirst:Math.round(c.thirst*100),
          care:c.care?.kind||null,carePhase:c.care?.phase||null,
          playedFrames:Array.from(c.playedFrames).sort((a,b)=>a-b),
          energy:c.energy(),sleepiness:c.sleepiness,tent:c.rest?.phase||'closed',
          tentColor:c.tentColor,blockedByTent:!!c.blockedByTent,
          isJumping:!!c.jump,mouthOpen:this.mouthOpen(c),
          isMeowing:!!c.vocal})),
        treeBaseY:this.app.terrain.treeBaseY(this.app.camera),
        relativeFootOffset:this.commonFootY-this.app.terrain.treeBaseY(this.app.camera),
        ratios:{bird:.75,cats:{onyx:88,callie:76,harvey:66},
          treeScaleRelativePrevious:1.75,treeScaleFromOriginal:3.0625},
        social:this.social?.type||null};
    }
  }
  WW.AdventureCats=AdventureCats;
})(window.WanderingWorld=window.WanderingWorld||{});
