/* Onyx's Adventures — on-screen careers, eight-biome actor experiences, field guide.
 * Uses ORIGINAL AdventureCats and their three WASM engines; NEVER creates replacement sprites. */
(function(WW){
'use strict';
const C=WW.GameplayCore, DATA=WW.GameplayData;
const U=WW.util;
class AdventureGameplay {
 constructor(app){
   this.app=app;this.cats=app.cats;this.economy=new WW.OurSpaceEconomy();this.progress=C.newProgress();
   this.profile='guest';this.storage=null;this.hasStorage=false;this.started=false;
   this.jobs=new Map();this.activities=new Map();this.lastBiome=new Map();this.countedDwell=new Map();
   this.clock=0;this.nextAutoWork=175;this.nextMoment=28;this.nextSave=14;this.lastEvent='';
   this.notifications=[];this.listeners=new Set();this.savedLeaderX=null;this.preferences={autoWork:true,autoExplore:true,quiet:false,showProps:true};this.nextRoam=85;this.nextFollow=20;this.socialWatch=null;
   this.lastPoll=0;this._writing=false;this._changed=false;this.lastVisitingChapter=-1;
   this.rng=typeof Math.seedrandom==='function'?new Math.seedrandom('onyx-adventures:'+app.world.seed):null;this.wasmMath=null;
   this.economy.listen(()=>{this._changed=true;this.emit();this.scheduleSave();});
   window.addEventListener('onyx-adventures:shell-event',e=>this.onShellEvent(e.detail||{}));
   window.addEventListener('wanderingworld:birdcaught',e=>this.onBirdCatch(e.detail||{}));
   window.addEventListener('pagehide',()=>{this.saveNow().catch(()=>{});});
   document.addEventListener('visibilitychange',()=>{if(document.hidden)this.saveNow().catch(()=>{});});
 }
 listen(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
 emit(){for(const fn of this.listeners)try{fn(this.snapshot());}catch(e){console.warn('Gameplay update listener:',e);}}
 note(s){this.lastEvent=String(s).slice(0,240);this.notifications.unshift({text:this.lastEvent,at:this.clock});this.notifications.length=Math.min(this.notifications.length,25);this.emit();}
 async start(){
   if(window.localforage){try{this.storage=window.localforage.createInstance({name:'OnyxAdventures',storeName:'progressv3'});await this.storage.ready();this.hasStorage=true;}catch(e){console.warn('LocalForage not ready; using localStorage fallback',e);}}
   await Promise.all([this.loadProfile('guest',true),this.loadKernel()]);
   this.started=true;this.note('The meadow field guide is ready. Cats can explore and work without buying anything.');
   // Integrated OurSpace may supply an already authorized host adapter (never a login dialog in this game).
   if(window.OurSpaceAdventuresAuth?.profileKey){try{this.economy.connect(window.OurSpaceAdventuresAuth);}catch(e){console.warn('OurSpace session not ready:',e.message);}}
   this.economy.flush().catch(()=>{});
   return this;
 }
 async loadKernel(){if(location.protocol==='file:')return null;try{const r=await fetch('../../script/gameplay-kernel.wasm');if(!r.ok)throw Error('WASM math missing');const result=await WebAssembly.instantiate(await r.arrayBuffer());this.wasmMath=result.instance.exports;return this.wasmMath;}catch(e){console.warn('Game math WASM unavailable; using equivalent JS math',e);return null;}}
 async loadProfile(profile,isInitial=false){
   if(!isInitial){await this.saveNow();this.cancelAll('Profile changed');}
   this.profile=profile==='william'||profile==='jasper'?profile:'guest';
   let obj=null;try{if(this.hasStorage)obj=await this.storage.getItem('profile:'+this.profile);}catch(e){console.warn('Progress read',e);}
   if(!obj){try{obj=JSON.parse(localStorage.getItem('onyx-adventures-gameplay:v3:'+this.profile)||'null');}catch(_){obj=null;}}
   this.progress=C.mergeProgress(obj?.progress);this.economy.restore(obj?.economy);
   this.preferences={autoWork:true,autoExplore:true,quiet:false,showProps:true,...(obj?.preferences||{})};
   if(Number.isFinite(obj?.leaderX)&&this.cats.ready){
     const pos=Math.min(this.app.world.length-100,Math.max(100,obj.leaderX));
     this.cats.get('onyx')?.brain.place(pos,this.cats.commonFootY);
     // Only at explicit profile initialization, so returning to a visited world is a real restore, not teleport during play.
     this.app.camera.x=U.modulo(pos-this.app.camera.width*.23,this.app.world.length);
   }
   this.jobs.clear();this.activities.clear();this.lastBiome.clear();this.countedDwell.clear();this._changed=true;this.emit();
   return this.progress;
 }
 async saveNow(){if(!this.started && !this.cats.ready)return false;if(this._writing){this._changed=true;return false;}
   // Never put another signed-in person's pending receipt IDs in this profile's save.
   const exposed=this.economy.export();
   const ownEconomy={confirmed:exposed.confirmed.filter(id=>id.startsWith('adventure:v3:'+this.profile+':')),
     pending:exposed.pending.filter(p=>p.profileKey===this.profile)};
   const copy={schema:3,progress:this.progress,economy:ownEconomy,preferences:this.preferences,
     leaderX:this.cats.get('onyx')?.worldX()||null,savedAt:new Date().toISOString()};
   this._writing=true;try{
     if(this.hasStorage)await this.storage.setItem('profile:'+this.profile,copy);
     else localStorage.setItem('onyx-adventures-gameplay:v3:'+this.profile,JSON.stringify(copy));
     this._changed=false;return true;
   }catch(e){try{localStorage.setItem('onyx-adventures-gameplay:v3:'+this.profile,JSON.stringify(copy));this._changed=false;return true;}catch(_){console.warn('Could not persist field guide',e);return false;}}
   finally{this._writing=false;}
 }
 scheduleSave(){this._changed=true;this.nextSave=Math.min(this.nextSave,this.clock+7);}
 onShellEvent(d){if(d.type==='profile'&&d.id!==this.profile){this.loadProfile(d.id).catch(e=>console.warn('Could not switch profile',e));}
   if(d.type==='accessibility')this.preferences.quiet=!!d.preferences?.lowStimulation;
   if(d.type==='goal-updated'&&d.userConfirmed&&['done','partly','attempted'].includes(d.result)){
     const onyx=this.cats.get('onyx');if(this.isEligible(onyx)){onyx.pose='idle';onyx.poseUntil=this.cats.clock+2;onyx.animClock=0;}
     this.note('A tiny step was recorded. Onyx offers a gentle blink; nothing is required tomorrow.');
   }
 }
 currentBiome(cat){return this.app.world.biomeAt(cat.worldX())?.id||'greenwood';}
 visible(cat){const x=U.wrapDelta(cat.worldX(),this.app.camera.x,this.app.world.length);return x>=35&&x<this.app.camera.width-35;}
 isEligible(cat){if(!cat||!this.cats.ready||this.app.camera.paused||document.hidden||!this.visible(cat))return false;
   if(cat.cuedAction||cat.rest||cat.care||cat.jump||cat.contactVisual||cat.vocal||this.cats.social)return false;
   if(this.cats.busyState(cat)||this.cats.clock<cat.busyUntil||this.cats.clock<cat.socialUntil)return false;
   return true;
 }
 onBirdCatch(detail){
   // Existing renderer only emits after a true alpha-mask paw/mouth collision.
   if(!C.IDS.includes(detail.catId)||!detail.species||!detail.contact)return;
   const sightings=this.progress.guide.sightings;
   sightings[detail.species]=Math.min(100000,(sightings[detail.species]||0)+1);
   this.note(detail.catId[0].toUpperCase()+detail.catId.slice(1)+' made a genuine '+detail.species+' contact. The correct attached frame was shown.');
   this.scheduleSave();
   // No automatic 100-copper catch award without an approved household policy and authenticated host validation.
 }
 observe(){const leader=this.cats.get('onyx');if(!leader)return false;
   const id=this.currentBiome(leader),biome=DATA.biomes[id];
   const current=this.progress.guide.landmarks;
   const find=biome.discoveries.find(x=>!current.includes(x.id));
   if(find){current.push(find.id);this.note('Field Guide: '+find.title+' observed in '+biome.label+'.');}
   else this.note('You returned to '+biome.landmark+'. Familiar places can still be lovely.');
   const visible=this.app.birds.visibleBirds(this.app.camera);if(visible.length){const bird=visible[0];const species=bird.species;
     if(typeof species==='string')this.progress.guide.sightings[species]=(this.progress.guide.sightings[species]||0)+1;}
   this.scheduleSave();return true;
 }
 nextLandmark(){const leader=this.cats.get('onyx');if(!leader)return null;
   const ch=this.app.world.chapterAt(leader.worldX());const idx=(ch.index+1)%this.app.world.route.length;
   const biomeId=this.app.world.route[idx];return {biomeId,label:DATA.biomes[biomeId]?.label||biomeId,chapter:idx,
     distanceWorldPixels:Math.ceil((ch.index+1)*this.app.world.chapterWidth - ch.x)};
 }
 scenicStroll(){const onyx=this.cats.get('onyx');if(!this.isEligible(onyx))return false;
   const ch=this.app.world.chapterAt(onyx.worldX());
   const distance=Math.max(20,Math.min(120,ch.x1-onyx.worldX()-15));
   this.cats.invite(onyx,U.modulo(onyx.worldX()+distance,this.app.world.length));
   this.note('Onyx was invited to continue walking. He may make his own decision.');return true;
 }
 pickJob(cat){const biome=this.currentBiome(cat),opts=DATA.biomes[biome]?.cats[cat.id]?.jobs||[];
   if(!opts.length)return null;
   const seen=this.progress.coverage[cat.id][biome]?.workIds||[];
   return C.nextUnseen(opts,seen,()=>this.rng?this.rng():Math.random());
 }
 startWork(id,automatic=false){const cat=this.cats.get(id);if(!this.isEligible(cat)||this.jobs.has(id))return false;
   const job=this.pickJob(cat);if(!job)return false;
   const biome=this.currentBiome(cat),ch=this.app.world.chapterAt(cat.worldX());
   const original=cat.worldX();const direction=cat.id==='callie'?-1:1;
   let target=U.modulo(original+direction*32,this.app.world.length);
   target=Math.min((ch.index+1)*this.app.world.chapterWidth-25,Math.max(ch.index*this.app.world.chapterWidth+25,target));target=this.cats.limitTentTarget(cat,original,target);
   if(Math.abs(U.wrapDelta(target,original,this.app.world.length))<8)return false;
   const shiftId=(window.crypto?.randomUUID?.()||'session'+Date.now().toString(36)+'-'+Math.floor(Math.random()*1e9).toString(36));
   const role=DATA.careers[id];const state={id:shiftId,jobId:job.id,catId:id,biomeId:biome,job,role,origin:original,target,
     stage:'approach',began:this.clock,stageSince:this.clock,lastCommand:this.clock,acting:0,beat:-1,
     duration:job.durationSeconds+(C.level(this.progress.careers[id].xp)-1)*6, automatic,acted:false,renderedFrames:new Set()};
   if(typeof window.StateMachine==='function')state.fsm=new window.StateMachine({init:'approach',transitions:[{name:'arrive',from:'approach',to:'acting'},{name:'done',from:'acting',to:'return'},{name:'return',from:'return',to:'completed'},{name:'cancel',from:'*',to:'cancelled'}]});
   this.jobs.set(id,state);cat.jobTask=state;cat.cuedAction='career:'+job.id;
   cat.busyUntil=this.cats.clock+180;cat.pose=null;cat.nextDecision=this.cats.clock+180;
   cat.brain.come_to(target);
   this.note(id[0].toUpperCase()+id.slice(1)+' started '+role.name+' work in '+DATA.biomes[biome].label+': '+job.title+'.');
   this.emit();return true;
 }
 cancelWork(id,reason='Shift was paused without penalty'){const job=this.jobs.get(id);if(!job)return false;
   const c=this.cats.get(id);if(c){c.cuedAction=null;c.busyUntil=this.cats.clock+1;c.jobTask=null;c.pose=null;c.brain.force?.(0);c.nextDecision=this.cats.clock+4;}
   if(job.fsm?.can?.('cancel'))job.fsm.cancel();this.jobs.delete(id);this.note(id+' — '+reason);return true;
 }
 cancelAll(reason){for(const id of [...this.jobs.keys()])this.cancelWork(id,reason);for(const id of [...this.activities.keys()])this.endActivity(id,false);}
 workTick(job,dt){const cat=this.cats.get(job.catId);if(!cat)return;
   if(this.currentBiome(cat)!==job.biomeId || cat.rest||cat.care||cat.jump||cat.hunger>=.97||cat.thirst>=.97){this.cancelWork(cat.id,'Rest and care take priority. No penalty.');return;}
   const distance=Math.abs(U.wrapDelta(cat.worldX(),job.stage==='return'?job.origin:job.target,this.app.world.length));
   const stageAge=this.clock-job.stageSince;
   if(job.stage==='approach'){
     if(distance<12){if(job.fsm?.can?.('arrive'))job.fsm.arrive();job.stage='acting';job.stageSince=this.clock;cat.brain.force?.(0);cat.pose=job.job.pose;cat.poseUntil=this.cats.clock+job.duration+3;cat.animClock=0;job.acted=true;
       this.note(cat.id+' reached the real on-path '+job.job.landmark+' work marker.');}
     else if(stageAge>23)this.cancelWork(cat.id,'The route was blocked. Shift cancelled safely.');
     else if(this.clock-job.lastCommand>=2){job.lastCommand=this.clock;cat.brain.come_to(job.target);}
   } else if(job.stage==='acting'){
     if(Number.isFinite(cat.frame)&&cat.frameBounds?.[cat.frame]?.[2]>0)job.renderedFrames.add(cat.frame);
     // The three real sprite atlases must show changing VALID transparent frames.
     job.acting+=dt;
     const beat=Math.floor(job.acting/(job.duration/4));
     if(beat!==job.beat){job.beat=beat;const seq=cat.id==='onyx'?['idle','stretch','settle','proud']:cat.id==='callie'?['settle','loaf','stretch','proud']:['sniff','look','stretch','idle'];
       cat.pose=seq[Math.min(3,beat)];cat.poseUntil=this.cats.clock+job.duration/4+1;cat.animClock=0;
       this.note(cat.id+' is working: '+job.job.title+' ('+Math.min(4,beat+1)+'/4 visible actions).');}
     if(job.acting>=job.duration){if(job.fsm?.can?.('done'))job.fsm.done();job.stage='return';job.stageSince=this.clock;cat.pose=null;cat.brain.come_to(job.origin);}
   }else if(job.stage==='return'){
     if(distance<14){this.completeJob(job);}
     else if(stageAge>24){this.cancelWork(cat.id,'The return route was obstructed. No unverified reward.');}
     else if(this.clock-job.lastCommand>=2){job.lastCommand=this.clock;cat.brain.come_to(job.origin);}
   }
 }
 completeJob(job){const cat=this.cats.get(job.catId);if(!cat||!job.acted||job.acting<job.duration||this.currentBiome(cat)!==job.biomeId)return false;
   if(job.renderedFrames.size<2){this.cancelWork(job.catId,'Work animation could not be verified; no wages were claimed.');return false;}
   if(job.fsm?.can?.('return'))job.fsm.return();
   if(!C.markShift(this.progress,job.catId,job.id,job.job.skill))return this.cancelWork(job.catId,'Shift already recorded.');
   C.markActivity(this.progress,job.catId,job.biomeId,job.job.id,'work');
   const lvl=this.progress.careers[job.catId].level,pay=C.pay(lvl);
   cat.cuedAction=null;cat.jobTask=null;cat.busyUntil=this.cats.clock+2;cat.pose=null;cat.nextDecision=this.cats.clock+5;
   this.jobs.delete(job.catId);
   this.note(job.catId+' completed '+job.job.title+'! Career level '+lvl+'; '+pay+' copper potential OurSpace earnings.');
   if(this.profile!=='guest'&&this.economy.identity?.profileKey===this.profile){
     const eventId=C.rewardId(this.profile,job.catId,job.biomeId,job.id);
     this.economy.queueReward({eventId,profileKey:this.profile,catId:job.catId,biomeId:job.biomeId,level:lvl,amountCopper:pay,reason:'Onyx Adventures: '+job.role.name+' shift in '+DATA.biomes[job.biomeId].label});
   }
   this.scheduleSave();this.emit();return true;
 }
 startActivity(cat){if(!this.isEligible(cat)||this.activities.has(cat.id)||this.jobs.has(cat.id))return false;
   const biome=this.currentBiome(cat);const arr=DATA.biomes[biome]?.cats[cat.id]?.habits||[];
   const seen=this.progress.coverage?.[cat.id]?.[biome]?.actionIds||[];
   const choice=C.nextUnseen(arr,seen,()=>this.rng?this.rng():Math.random());if(!choice)return false;
   cat.cuedAction='biome:'+choice.id;cat.busyUntil=this.cats.clock+12;
   cat.pose=choice.pose;cat.poseUntil=this.cats.clock+choice.phaseSeconds+1;cat.animClock=0;
   const a={id:choice.id,catId:cat.id,biomeId:biome,started:this.clock,duration:choice.phaseSeconds,pose:choice.pose,choice};
   this.activities.set(cat.id,a);this.note(cat.id+' is '+choice.title.toLowerCase()+' in '+DATA.biomes[biome].label+'.');return true;
 }
 endActivity(id,complete=true){const a=this.activities.get(id);if(!a)return false;const cat=this.cats.get(id);
   if(cat){cat.cuedAction=null;cat.busyUntil=this.cats.clock+1;cat.pose=null;cat.nextDecision=this.cats.clock+3;}
   this.activities.delete(id);
   if(complete){C.markActivity(this.progress,id,a.biomeId,a.id,'ordinary');this.note(a.choice.caption);this.scheduleSave();}
   return true;
 }
 chooseAutomaticWork(){if(!this.preferences.autoWork)return false;const available=C.IDS.map(id=>this.cats.get(id)).filter(c=>this.isEligible(c));
   if(!available.length)return false;available.sort((a,b)=>this.progress.careers[a.id].shiftIds.length-this.progress.careers[b.id].shiftIds.length);
   return this.startWork(available[0].id,true);
 }
 update(dt){if(!this.started||dt<=0||this.app.camera.paused||document.hidden)return;this.clock+=dt;
   const onyx=this.cats.get('onyx');if(!onyx)return;
   const chapter=this.app.world.chapterAt(onyx.worldX()).index;
   if(chapter!==this.lastVisitingChapter){this.lastVisitingChapter=chapter;this.progress.lastSeenChapter=chapter;this._changed=true;}
   for(const cat of this.cats.cats){
     const b=this.currentBiome(cat);if(this.lastBiome.get(cat.id)!==b){C.markEntered(this.progress,cat.id,b);this.lastBiome.set(cat.id,b);this.note(cat.id+' arrived in '+DATA.biomes[b].label+'.');this.scheduleSave();}
     if(this.visible(cat))C.addDwell(this.progress,cat.id,b,dt);
   }
   for(const j of [...this.jobs.values()])this.workTick(j,dt);
   for(const a of [...this.activities.values()]){
     const cat=this.cats.get(a.catId);if(!cat||cat.rest||cat.care||this.currentBiome(cat)!==a.biomeId)this.endActivity(a.catId,false);
     else if(this.clock-a.started>=a.duration)this.endActivity(a.catId,true);
   }
   // Gentle route continuation: the camera follows only real Onyx WASM walking.
   // Invitations are infrequent and never override work, sleep, food, thirst or a cat's refusal.
   if(this.preferences.autoExplore&&this.clock>=this.nextRoam){
     if(this.isEligible(onyx)&&Math.random()<.75){
       const target=U.modulo(onyx.worldX()+155,this.app.world.length);
       // Do not clamp at a biome boundary: real WASM walking must traverse into the next biome.
       if(Math.abs(U.wrapDelta(target,onyx.worldX(),this.app.world.length))>12)this.cats.invite(onyx,target);
     }
     this.nextRoam=this.clock+22+Math.random()*19;
   }
   // Real companion engines are invited to catch up on the SAME horizontal footline.
   if(this.clock>=this.nextFollow){
     for(const id of ['callie','harvey']){const companion=this.cats.get(id);if(!this.isEligible(companion))continue;
       const diff=U.wrapDelta(onyx.worldX(),companion.worldX(),this.app.world.length);
       if(Math.abs(diff)>Math.max(150,this.app.camera.width*.33)){
         const step=Math.max(-145,Math.min(145,diff));
         this.cats.invite(companion,companion.worldX()+step);
       }
     }
     this.nextFollow=this.clock+12;
   }
   // Discoveries require REAL presence and cumulative visible time in the biome.
   const leadBiome=this.currentBiome(onyx),seenBiome=this.progress.coverage.onyx[leadBiome];
   for(const [i,entry] of DATA.biomes[leadBiome].discoveries.entries()){
     if(seenBiome.activeSeconds >= [25,90,190][i] && !this.progress.guide.landmarks.includes(entry.id)){
       this.progress.guide.landmarks.push(entry.id);this.note('Discovered '+entry.title+' in '+DATA.biomes[leadBiome].label+'.');this.scheduleSave();
     }
   }
   // The original AdventureCats already performs genuine sibling social sequences.
   if(this.cats.social && !this.socialWatch){
     const type=this.cats.social.type,visibleCats=this.cats.cats.filter(cat=>this.visible(cat));
     if(visibleCats.length>=2)this.socialWatch={type,started:this.clock,biome:leadBiome,catIds:visibleCats.map(x=>x.id)};
   }else if(!this.cats.social&&this.socialWatch){
     const moment=this.socialWatch;this.socialWatch=null;
     if(this.clock-moment.started>=6 && moment.catIds.every(id=>this.currentBiome(this.cats.get(id))===moment.biome)){
       const marker=moment.biome+'.family.'+moment.type;
       if(!this.progress.guide.moments.includes(marker)){this.progress.guide.moments.push(marker);this.note('A family moment: '+moment.type.replace(/_/g,' ')+' in '+DATA.biomes[moment.biome].label+'.');this.scheduleSave();}
     }
   }
   if(this.clock>=this.nextAutoWork){this.chooseAutomaticWork();this.nextAutoWork=this.clock+150+Math.random()*140;}
   if(this.clock>=this.nextMoment){const available=C.IDS.map(id=>this.cats.get(id)).filter(x=>this.isEligible(x));
     if(available.length){available.sort((a,b)=>this.progress.coverage[a.id][this.currentBiome(a)].actionIds.length-this.progress.coverage[b.id][this.currentBiome(b)].actionIds.length);this.startActivity(available[0]);}
     this.nextMoment=this.clock+(this.preferences.quiet?130:42)+Math.random()*33;
   }
   if(this._changed&&this.clock>=this.nextSave){this.nextSave=this.clock+15;this.saveNow().catch(()=>{});}
   if(this.clock-this.lastPoll>90&&this.economy.identity){this.lastPoll=this.clock;this.economy.refresh().catch(()=>{});this.economy.flush().catch(()=>{});}
 }
 // Original canvas scene keeps its birds, original three PNG cats, scenery and tents. This draws ONLY foreground job props.
 drawProps(ctx,camera){if(!this.preferences.showProps)return;const foot=this.cats.commonFootY;
   for(const job of this.jobs.values()){
     const x=U.wrapDelta(job.target,camera.x,this.app.world.length);if(x<-35||x>camera.width+35)continue;
     const raw=this.preferences.quiet?1:Math.min(1,(this.clock-job.began)/.7);
     const t=window.TWEEN?.Easing?.Quadratic?.Out?.(raw)??raw;
     ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(x),Math.round(foot));ctx.globalAlpha=t;
     const color=job.catId==='onyx'?'#25854d':job.catId==='callie'?'#8b5bc4':'#d85893';
     ctx.fillStyle='rgba(0,40,24,.27)';ctx.fillRect(-14,1,28,3);
     if(job.job.prop==='marker'){
       ctx.fillStyle='#6b4d31';ctx.fillRect(11,-25,3,25);ctx.fillStyle='#f7e3ae';ctx.fillRect(-12,-31,29,15);ctx.fillStyle=color;ctx.fillRect(-9,-28,22,3);ctx.fillRect(-9,-21,16,2);
     }else if(job.job.prop==='mat'){
       ctx.fillStyle=color;ctx.fillRect(-21,-6,40,7);ctx.fillStyle='#f5e1f3';ctx.fillRect(-17,-7,32,3);ctx.fillStyle='#58445c';ctx.fillRect(-18,-2,3,2);ctx.fillRect(11,-2,3,2);
     }else{
       ctx.fillStyle='#d0a777';ctx.fillRect(-14,-19,26,18);ctx.fillStyle='#fff3d5';ctx.fillRect(-11,-22,20,12);ctx.fillStyle=color;ctx.fillRect(-10,-20,18,3);ctx.fillStyle='#a17c5c';ctx.fillRect(-13,-8,24,3);
     }
     ctx.restore();
   }
 }
 snapshot(){let count=C.usedCount(this.progress);
   if(this.wasmMath?.total_coverage){let bits=0,n=0;for(const id of C.IDS)for(const b of C.BIOMES){if(this.progress.coverage[id][b].fulfilled)bits|=(1<<n);n++;}count=this.wasmMath.total_coverage(bits);}
   return {ready:this.started,profile:this.profile,coverage:count,totalCoverage:24,
    jobs:[...this.jobs.values()].map(x=>({catId:x.catId,title:x.job.title,stage:x.stage,elapsed:Math.round(x.acting),duration:x.duration,biome:x.biomeId})),
    careers:this.progress.careers,guide:this.progress.guide,coverageCells:this.progress.coverage,
    economy:this.economy.snapshot(),preferences:{...this.preferences},lastEvent:this.lastEvent,chapter:this.progress.lastSeenChapter};}
 inspect(){return {activeJobs:this.jobs.size,activeActivities:this.activities.size,coverageCells:C.usedCount(this.progress),catalogBiomes:Object.keys(DATA.biomes).length,
    actorType:'real AdventureCats WASM instances',originalImagesRetained:this.cats.cats.every(x=>x.image?.src?.includes('/'+x.id+'.png')||x.image?.src?.includes('../../assets/'+x.id+'.png'))};}
}
WW.AdventureGameplay=AdventureGameplay;
})(window.WanderingWorld=window.WanderingWorld||{});
