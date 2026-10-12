/* Happy Home full-body Onyx controller.
 * The chest-up widget remains owned by OnyxVirtualPet; this controller only
 * coordinates the room quadruped and the atlas-backed Professor actor.
 */
(()=>{'use strict';
 const $=s=>document.querySelector(s),slow=$('#slowPetGame'),fallbackActor=$('#slowPetActor'),fallbackCanvas=$('#slowPetSprite'),tone=$('#slowToneBadge');
 const USER_IDLE_MS=10*60*1000,CARE_STAGE_MS=1450,QUAD_PROFESSOR_MS=850,CONTROL_GRACE_MS=2200;
 const QUAD_MOODS=Object.freeze(['caring','hungry','judgmental','listening','purring','sleepy','snuggly','thinking','thoughtful']);
 const ONYX_HOURS_PER_REAL_HOUR=12,REAL_MS_PER_ONYX_HOUR=3600000/ONYX_HOURS_PER_REAL_HOUR,FISH_CATCH_INTERVAL_MS=REAL_MS_PER_ONYX_HOUR*6;
 const FISH_SPECIES=Object.freeze(['goldfish','neon tetra','amber tetra']),FISH_STORAGE_KEY='onyx.happy-home.fish-collection.v1',APPLIANCE_STORAGE_KEY='onyx.happy-home.appliances.v1';
 let active=false,raf=0,last=performance.now(),x=.52,y=.55,goalX=.52,goalY=.55,nextGoal=0,currentTone='pet',chatting=false;
 let moveTask='',forcedFacing='forward',manualUntil=0,visible=true,externalControlActive=false;
 let activeForm='quadruped',quadrupedMove=null,quadrupedCycle=0,currentCouchSpot='',bipedSize=96,roomUi=null;
 let bipedGaitDistancePx=0,bipedGaitSpeedPxPerSec=0,bipedGaitLastX=.52,bipedGaitLastY=.55,bipedGaitLastAt=0,bipedMoveStartDistance=1,bipedSeatTargetSize=450;
 let workflow='stopped',workflowAt=0,lastUserActivityAt=0,awaitingPraise=false,previousMood='caring';
 let fishState={counts:{goldfish:0,'neon tetra':0,'amber tetra':0},history:[],nextCatchAt:Date.now()+FISH_CATCH_INTERVAL_MS};
 let applianceState={airConditionerOn:false,ceilingFanOn:false};
 try{const saved=JSON.parse(localStorage.getItem(FISH_STORAGE_KEY)||'null');if(saved&&typeof saved==='object')fishState={...fishState,...saved,counts:{...fishState.counts,...(saved.counts||{})},history:Array.isArray(saved.history)?saved.history.slice(-40):[],nextCatchAt:Number(saved.nextCatchAt)||fishState.nextCatchAt}}catch(_){}
 try{const saved=JSON.parse(localStorage.getItem(APPLIANCE_STORAGE_KEY)||'null');if(saved&&typeof saved==='object')applianceState={...applianceState,...saved}}catch(_){}
 const workRx=/\b(work mode|professor|project|coding|code|debug|javascript|typescript|html|css|json|repo|github|research|analy[sz]e|compare|writing|write|worldbuild|ttrpg|document|spreadsheet|file|design|plan|explain|teach|steps?|guide|build|fix)\b/i;
 const petRx=/\b(pet(?:ting)?|purr|snuggl|cuddl|scratch(?:ies)?|treat|feed|food|water|nap|sleepy|blanket|bow ?tie|meow|mrrp|good (?:boy|kitty)|come here|sit with me|keep me company|stay with me|slow blink|nuzzle)\b/i;
 const actorApi=()=>window.OnyxVirtualProfessorBody;
 function frame(){return document.getElementById('happyHomeFullscreenFrame')}
 function shellWindow(){try{return frame()?.contentWindow||null}catch(_){return null}}
 function decorApi(){return shellWindow()?.HappyHomeDecor||null}
 function quadrupedApi(){return shellWindow()?.OnyxImperialExpedition||null}
 function personalityApi(){return shellWindow()?.OnyxPersonalityEngine||null}
 function spatialApi(){return shellWindow()?.OnyxRoomSpatial||null}
 function roomScale(){const api=spatialApi(),room=frame()?.contentDocument?.getElementById('viewerScreen');return Math.max(.01,(room?.clientHeight||api?.H||821)/(api?.H||821))}
 function pointForFeature(id){try{const f=spatialApi()?.getZone?.(id),g=f?.geometry,p=f?.properties||{};if(g?.type==='Point'&&Array.isArray(g.coordinates))return{x:Number(g.coordinates[0]),y:Number(g.coordinates[1]),properties:p};if(g?.type==='Polygon'){const ring=g.coordinates?.[0]||[];if(ring.length){const pts=ring.slice(0,-1);return{x:pts.reduce((a,v)=>a+v[0],0)/pts.length,y:pts.reduce((a,v)=>a+v[1],0)/pts.length,properties:p}}}}catch(_){}return null}
 function worldSizeAtY(worldY,explicit=0){const api=spatialApi(),base=Number(explicit)||Number(api?.spriteSizeAtY?.(worldY))||64;return base*roomScale()}
 function setQuadrupedSizeAtWorldY(worldY,explicit=0){const size=worldSizeAtY(worldY,explicit);setQuadrupedSize(size);return size}
 function persistFishState(){try{localStorage.setItem(FISH_STORAGE_KEY,JSON.stringify(fishState))}catch(_){}}
 function persistApplianceState(){try{localStorage.setItem(APPLIANCE_STORAGE_KEY,JSON.stringify(applianceState))}catch(_){}}
 function ensureRoomVisuals(){
   try{
     const d=frame()?.contentDocument,room=d?.getElementById('viewerScreen'),api=spatialApi();if(!d||!room||!api)return null;
     if(roomUi?.layer?.isConnected)return roomUi;
     roomUi=null;const style=d.createElement('style');
     style.id='onyx-room-perception-style';
     style.textContent='#onyxRoomPerceptionLayer{position:absolute;inset:0;z-index:45;pointer-events:none;overflow:hidden}#onyxCeilingFanVisual{position:absolute;z-index:2;pointer-events:none;transform:translate(-50%,-50%);display:grid;place-items:center}#onyxCeilingFanVisual .onyx-fan-rotor{position:relative;width:1px;height:1px}#onyxCeilingFanVisual .onyx-fan-blade{position:absolute;left:-4px;top:-54px;width:8px;height:54px;border-radius:90% 90% 35% 35%;background:linear-gradient(90deg,#10252B,#397078 52%,#10252B);transform-origin:50% 100%;box-shadow:0 1px 2px #0007}#onyxCeilingFanVisual .onyx-fan-hub{position:absolute;width:16px;height:16px;border:2px solid #10252B;border-radius:50%;background:#E6F1F0;transform:translate(-50%,-50%);z-index:2}#onyxCeilingFanVisual.is-on .onyx-fan-rotor{animation:onyx-room-fan-spin .72s linear infinite}@keyframes onyx-room-fan-spin{to{transform:rotate(360deg)}}#onyxRoomApplianceControls{position:absolute;z-index:5;min-width:190px;max-width:260px;padding:9px;border:1px solid #397078;border-radius:10px;background:#fff;color:#000;box-shadow:0 5px 18px #0005;font:11px system-ui,sans-serif;pointer-events:auto}#onyxRoomApplianceControls strong{display:block;margin-bottom:4px;font-size:11px}#onyxRoomApplianceDemand{margin:0 0 7px;color:#397078;font-size:10px;line-height:1.3}#onyxRoomApplianceButtons{display:flex;gap:5px}#onyxRoomApplianceButtons button{flex:1;min-width:0;padding:5px 6px;border:1px solid #397078;border-radius:6px;background:#E6F1F0;color:#000;font:800 10px system-ui,sans-serif;cursor:pointer}#onyxRoomApplianceButtons button[aria-pressed=true]{background:#10252B;color:#fff}#onyxRoomApplianceButtons button:focus-visible{outline:2px solid #000;outline-offset:2px}#onyxAquariumCatchNotice{position:absolute;z-index:4;display:flex;align-items:center;gap:5px;max-width:170px;padding:5px 8px;border:1px solid #397078;border-radius:9px;background:#fff;color:#000;font:800 10px system-ui,sans-serif;box-shadow:0 4px 14px #0005;pointer-events:none}#onyxAquariumCatchNotice img{width:22px;height:22px;object-fit:contain}#onyxAquariumCatchNotice[hidden]{display:none}@media(prefers-reduced-motion:reduce){#onyxCeilingFanVisual.is-on .onyx-fan-rotor{animation-duration:5s}}';
     (d.head||d.documentElement).append(style);
     const layer=d.createElement('div');layer.id='onyxRoomPerceptionLayer';room.append(layer);
     const fan=d.createElement('div');fan.id='onyxCeilingFanVisual';fan.setAttribute('aria-label','Ceiling fan');const rotor=d.createElement('div');rotor.className='onyx-fan-rotor';
     for(let i=0;i<4;i++){const blade=d.createElement('i');blade.className='onyx-fan-blade';blade.style.transform='rotate('+(i*90)+'deg)';rotor.append(blade)}
     const hub=d.createElement('i');hub.className='onyx-fan-hub';fan.append(rotor,hub);layer.append(fan);
     const controls=d.createElement('section');controls.id='onyxRoomApplianceControls';controls.setAttribute('aria-label','Room climate controls');
     controls.innerHTML='<strong>Room climate</strong><p id="onyxRoomApplianceDemand" aria-live="polite"></p><div id="onyxRoomApplianceButtons"></div>';layer.append(controls);
     const buttons=controls.querySelector('#onyxRoomApplianceButtons');
     [['airConditionerOn','A/C'],['ceilingFanOn','Fan']].forEach(([key,label])=>{const b=d.createElement('button');b.type='button';b.dataset.appliance=key;b.addEventListener('click',()=>{applianceState[key]=!applianceState[key];persistApplianceState();updateRoomAppliances()});buttons.append(b)});
     const notice=d.createElement('div');notice.id='onyxAquariumCatchNotice';notice.hidden=true;notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');const img=d.createElement('img');img.alt='';const text=d.createElement('span');notice.append(img,text);layer.append(notice);
     roomUi={layer,fan,controls,demand:controls.querySelector('#onyxRoomApplianceDemand'),buttons,notice,noticeImage:img,noticeText:text};
     updateRoomAppliances();positionRoomElement(fan,'onyx.appliance.ceiling-fan',0,-10);positionRoomElement(controls,'onyx.appliance.air-conditioner',0,92);positionRoomElement(notice,'onyx.aquarium.jump-landing',0,-44);
     return roomUi;
   }catch(_){return null}
 }
 function positionRoomElement(el,id,offsetX=0,offsetY=0){const p=pointForFeature(id),api=spatialApi(),room=frame()?.contentDocument?.getElementById('viewerScreen');if(!p||!el||!api||!room)return;el.style.left=((p.x+offsetX)/(api.W||1916)*100)+'%';el.style.top=((p.y+offsetY)/(api.H||821)*100)+'%';if(el===roomUi?.fan)el.style.width=(150*roomScale())+'px';if(el===roomUi?.fan)el.style.height=(110*roomScale())+'px';if(el===roomUi?.controls)el.style.transform='translate(-50%,0)'}
 function updateRoomAppliances(){
   const ui=ensureRoomVisuals();if(!ui)return;
   ui.fan.classList.toggle('is-on',Boolean(applianceState.ceilingFanOn));ui.fan.setAttribute('aria-label',applianceState.ceilingFanOn?'Ceiling fan on':'Ceiling fan off');
   ui.buttons.querySelectorAll('button[data-appliance]').forEach(b=>{const on=Boolean(applianceState[b.dataset.appliance]);b.textContent=(b.dataset.appliance==='airConditionerOn'?'A/C ':'Fan ')+(on?'ON':'OFF');b.setAttribute('aria-pressed',String(on))});
   const cat=quadrupedApi()?.getState?.()?.cat,ac=pointForFeature('onyx.basking.ac-rest'),api=spatialApi();const near=activeForm==='quadruped'&&cat&&ac&&Math.hypot((cat.x-ac.x/(api.W||1916))*(api.W||1916),(cat.y-ac.y/(api.H||821))*(api.H||821))<260;
   const demandText=near?(applianceState.airConditionerOn&&applianceState.ceilingFanOn?'Cool air and a moving breeze. Thank you.':'Onyx demands the A/C and ceiling fan be turned on.'):'';ui.demand.hidden=!near;if(ui.demand.textContent!==demandText)ui.demand.textContent=demandText;
   ui.fan.style.left=((pointForFeature('onyx.appliance.ceiling-fan')?.x||979)/(api.W||1916)*100)+'%';ui.fan.style.top=((pointForFeature('onyx.appliance.ceiling-fan')?.y||96)/(api.H||821)*100)+'%';ui.fan.style.width=(150*roomScale())+'px';ui.fan.style.height=(110*roomScale())+'px';
   ui.controls.style.left=((pointForFeature('onyx.appliance.air-conditioner')?.x||1280)/(api.W||1916)*100)+'%';ui.controls.style.top=(((pointForFeature('onyx.appliance.air-conditioner')?.y||458)+92)/(api.H||821)*100)+'%';ui.controls.style.transform='translate(-50%,0)';
   ui.notice.style.left=((pointForFeature('onyx.aquarium.jump-landing')?.x||215)/(api.W||1916)*100)+'%';ui.notice.style.top=(((pointForFeature('onyx.aquarium.jump-landing')?.y||372)-44)/(api.H||821)*100)+'%';
 }
 function showFishNotice(species){
   const ui=ensureRoomVisuals();if(!ui)return;const id=String(species||'goldfish'),asset=id==='neon tetra'?'neon_tetra.svg':id==='amber tetra'?'amber_tetra.svg':'goldfish.svg';
   ui.noticeImage.src='https://raw.githubusercontent.com/tyrannosaurusdm92/LifeHelpers/main/OurSpace/assets/images/games/virtual/room/'+asset;ui.noticeText.textContent='Caught '+id+' · collection '+Number(fishState.counts[id]||0);ui.notice.hidden=false;
 }
 function recordFishCatch(){
   const species=FISH_SPECIES[Math.min(FISH_SPECIES.length-1,Math.floor(Math.random()*FISH_SPECIES.length))];
   fishState.counts[species]=Number(fishState.counts[species]||0)+1;fishState.history=Array.isArray(fishState.history)?fishState.history:[];fishState.history.push({species,at:new Date().toISOString()});fishState.history=fishState.history.slice(-40);
   const catchAt=Date.now(),scheduled=Number(fishState.nextCatchAt)||catchAt;let next=scheduled+FISH_CATCH_INTERVAL_MS;while(next<=catchAt)next+=FISH_CATCH_INTERVAL_MS;fishState.lastCatchAt=catchAt;fishState.nextCatchAt=next;persistFishState();showFishNotice(species);
   try{window.dispatchEvent(new CustomEvent('onyx:aquarium-fish-caught',{detail:{species,counts:{...fishState.counts},history:fishState.history.slice(),nextCatchAt:fishState.nextCatchAt,realIntervalMs:FISH_CATCH_INTERVAL_MS,onyxHoursPerRealHour:ONYX_HOURS_PER_REAL_HOUR}}))}catch(_){}
   return species;
 }
 function positionQuadrupedAtAc(){
   if(!active||activeForm!=='quadruped')return false;
   const spot=pointForFeature('onyx.basking.ac-rest'),api=quadrupedApi(),spatial=spatialApi();if(!spot||!api||!spatial)return false;
   if(currentCouchSpot&&currentCouchSpot!=='onyx.basking.ac-rest')return false;
   x=goalX=spot.x/(spatial.W||1916);y=goalY=spot.y/(spatial.H||821);api.setSafePoint?.(true);api.setCatPosition?.(x,y);
   currentCouchSpot='onyx.basking.ac-rest';setQuadrupedSizeAtWorldY(spot.y,spot.properties?.targetSpriteSize||64);api.performCatAction?.('loaf',{duration:900,hold:true});updateRoomAppliances();return true;
 }
 function isHungryMode(){
   const mood=personalityApi()?.getState?.()?.currentMood||quadrupedApi()?.getState?.()?.behavior||'';
   return String(mood).toLowerCase()==='hungry';
 }
 function maybeScheduleFishCatch(now=performance.now()){
   if(!active||activeForm!=='quadruped'||!isHungryMode()||Date.now()<fishState.nextCatchAt||quadrupedMove||isControlled(now))return false;
   const api=quadrupedApi(),spatial=spatialApi(),landing=pointForFeature('onyx.aquarium.jump-landing');if(!api||!spatial||!landing)return false;
   const cat=api.getState?.()?.cat||{},tx=landing.x/(spatial.W||1916),ty=landing.y/(spatial.H||821);
   if(Math.hypot((cat.x-tx)*(spatial.W||1916),(cat.y-ty)*(spatial.H||821))<24){api.performCatAction?.('primary',{duration:560});recordFishCatch();return true}
   return moveQuadrupedToSpot({id:'onyx.aquarium.jump-landing',form:'quadruped',x:tx,y:ty,actorSize:64,action:'loaf',direction:1},{autonomousCatch:true});
 }
 function couchSpots(){try{
   const api=spatialApi(),group=api?.getZone?.('onyx.couch.quadruped');
   if(api&&group){const room=frame()?.contentDocument?.getElementById('viewerScreen'),scale=(room?.clientHeight||821)/(api.H||821);
     const actions={loaf:'loaf',lounge:'snuggle',lay:'sleep',sprawl:'sleep'};
     return api.childrenOf(group.properties?.id||'onyx.couch.quadruped').map(f=>{
       const p=f.geometry?.coordinates||[],prop=f.properties||{},py=Number(p[1]);
       return{id:prop.id,form:'quadruped',action:actions[prop.pose]||'loaf',direction:1,x:Number(p[0])/(api.W||1916),y:py/(api.H||821),actorSize:(Number(prop.targetSpriteSize)||api.spriteSizeAtY?.(py)||64)*scale};
     }).filter(s=>Number.isFinite(s.x)&&Number.isFinite(s.y));
   }
   return decorApi()?.getCouchSpots?.()||[];
 }catch(_){try{return decorApi()?.getCouchSpots?.()||[]}catch(__){return[]}}}
 function couchAnchor(id='biped-seat'){try{
   const anchor=actorApi()?.getVisualAnchor?.(),footAnchorY=anchor?.visibleFootYFraction??(61/64),api=spatialApi();
   const feature=api?.getZone?.(id==='biped-seat'?'onyx.couch.professor-seat':id);
   const p=feature?.geometry?.coordinates,room=frame()?.contentDocument?.getElementById('viewerScreen');
   if(api&&p&&room){const px=Number(p[0]),py=Number(p[1]),height=Math.max(1,room.clientHeight||821),scale=height/(api.H||821),prop=feature?.properties||{},actorSize=(Number(prop.targetSpriteSize)||api.spriteSizeAtY?.(py)||96)*scale;
     return{x:px/(api.W||1916),y:(py-actorSize*(footAnchorY-.5))/height,floorX:px/(api.W||1916),floorY:py/(api.H||821),actorSize,approachFacing:'left',seatFacing:'forward'};
   }
   return decorApi()?.getCouchAnchor?.(id,{footAnchorY})||null
 }catch(_){try{return decorApi()?.getCouchAnchor?.(id)||null}catch(__){return null}}}
 function shellSurface(){
   try{const d=frame()?.contentDocument,a=d?.getElementById('professorActor'),c=d?.getElementById('professorSprite');if(a&&c)return{actor:a,canvas:c,inside:true}}catch(_){ }
   return{actor:fallbackActor,canvas:fallbackCanvas,inside:false};
 }
 function quadrupedSurface(){try{const d=frame()?.contentDocument,actor=d?.getElementById('catActor'),visual=d?.getElementById('catVisual'),canvas=d?.getElementById('catSprite');return actor&&canvas?{actor,visual,canvas}:null}catch(_){return null}}
 function setBipedSize(size){const s=shellSurface();if(s.actor&&size){bipedSize=Math.max(1,Number(size)||96);s.actor.style.width=Math.round(bipedSize)+'px';s.actor.style.height=Math.round(bipedSize)+'px'}}
 function setQuadrupedSize(size){const s=quadrupedSurface();if(s?.actor&&size){s.actor.style.width=`${Math.round(size)}px`;s.actor.style.height=`${Math.round(size)}px`}}
 function setGoodBoyGate(ready){
   awaitingPraise=Boolean(ready);
   try{shellWindow()?.postMessage({source:'ourspace-onyx-parent',type:'good-boy-state',detail:{ready:awaitingPraise}},'*')}catch(_){ }
 }
 function refreshMount(){
   const s=shellSurface(),q=quadrupedSurface(),showBiped=visible&&activeForm==='biped',showQuadruped=visible&&activeForm==='quadruped';
   if(fallbackActor)fallbackActor.style.display=s.inside?'none':(showBiped?'block':'none');
   if(s.actor){s.actor.style.display=showBiped?'block':'none';s.actor.setAttribute('aria-hidden',String(!showBiped))}
   if(q){[q.actor,q.visual,q.canvas].forEach(el=>{if(!el)return;el.hidden=!showQuadruped;el.setAttribute('aria-hidden',String(!showQuadruped))});q.actor.style.display=showQuadruped?'block':'none';q.actor.dataset.catHookOnly=String(!showQuadruped);if(showQuadruped)q.actor.setAttribute('aria-label','Full-body quadruped Onyx')}
   return s.inside;
 }
 function setForm(form){activeForm=form==='quadruped'?'quadruped':'biped';refreshMount();return activeForm}
 function setTone(next){if(next!=='work'&&next!=='pet')return;currentTone=next;if(tone){tone.dataset.tone=next;tone.textContent=next==='work'?'WORK / PROFESSOR TONE':'PET / COMPANION TONE'}slow?.setAttribute('data-conversation-tone',next)}
 function inferTone(text){const s=String(text||'');if(workRx.test(s))return'work';if(petRx.test(s))return'pet';return currentTone}
 function markControlled(ms=CONTROL_GRACE_MS){manualUntil=Math.max(manualUntil,performance.now()+Math.max(250,Number(ms)||CONTROL_GRACE_MS))}
 function isControlled(t=performance.now()){return chatting||externalControlActive||!!moveTask||!!quadrupedMove||t<manualUntil}
 function setControlActive(v){externalControlActive=!!v;noteUserActivity();markControlled(externalControlActive?2600:500);return externalControlActive}
 function setQuadAutonomy(on){try{personalityApi()?.setAutonomy?.(Boolean(on))}catch(_){}}
 function setQuadMood(mood,reason='Botanical Garden state'){
   const chosen=QUAD_MOODS.includes(mood)?mood:'caring';previousMood=chosen;
   try{quadrupedApi()?.setBehavior?.(chosen)}catch(_){ }
   try{personalityApi()?.setMood?.(chosen,reason)}catch(_){ }
   return chosen;
 }
 function setWidgetMood(mood){
   try{return window.OnyxVirtualPet?.setBehaviorVariant?.(mood,0)}catch(_){return false}
 }
 function setVisible(v){visible=!!v;refreshMount();return visible}
 function onShellReady(){
   if(!active){refreshMount();return false}
   setGoodBoyGate(awaitingPraise);
   if(workflow==='autonomous')setQuadAutonomy(true);
   else{
     setQuadAutonomy(false);
     if(workflow==='awaiting-good-boy'||workflow==='quadruped-caring')setQuadMood('caring','Botanical Garden conversation state');
     else if(workflow==='quadruped-professor')setQuadMood('thoughtful','Professor transition state');
   }
   refreshMount();return true;
 }
  function facingFromVector(dx,dy){
    const octant=window.OnyxFrameAnimation?.octantFromVector?.(dx,dy);
    if(octant==null)return forcedFacing;
    const left=/left/.test(forcedFacing),views=['right','down-right',left?'down-left':'down-right','down-left','left','up-left',left?'up-left':'up-right','up-right'];
    forcedFacing=views[octant]||forcedFacing;
    return forcedFacing;
  }
 function syncPositionFromQuadruped(){if(activeForm!=='quadruped')return;const p=quadrupedApi()?.getState?.()?.cat;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)){x=p.x;y=p.y;goalX=x;goalY=y}}
 function activateBiped(){
   const fromQuadruped=activeForm==='quadruped';
   if(fromQuadruped){syncPositionFromQuadruped();quadrupedApi()?.clearCouchRestSpot?.();quadrupedMove=null;bipedGaitDistancePx=0;bipedGaitSpeedPxPerSec=0;bipedGaitLastX=x;bipedGaitLastY=y;bipedGaitLastAt=performance.now()}
   setForm('biped')
 }
 function activateQuadruped(){const q=quadrupedApi(),surface=quadrupedSurface();if(!q||!surface)return false;if(activeForm!=='quadruped'){q.clearCouchRestSpot?.();q.setCatPosition?.(x,y);actorApi()?.exitProfessor?.()}setForm('quadruped');return true}
 function makeRoomPath(spot,fromX,fromY,options={}){
   const api=spatialApi(),isAquarium=options.autonomousCatch||String(spot.id||'').includes('aquarium'),isAc=spot.id==='onyx.basking.ac-rest';
   const lineId=isAquarium?'onyx.floor.ac-to-aquarium':'onyx.floor.ac-to-couch',line=api?.getZone?.(lineId)?.geometry?.coordinates||[];
   let coords=[];
   const alreadyCouch=String(currentCouchSpot).startsWith('onyx.couch.')&&String(spot.id||'').startsWith('onyx.couch.');
   if(alreadyCouch){coords=[[fromX*(api?.W||1916),fromY*(api?.H||821)]]}
   else if(isAc){
     const route=api?.getZone?.('onyx.floor.ac-to-couch')?.geometry?.coordinates||[];
     coords=route.slice().reverse();
   }else coords=line.slice();
   const points=[{x:fromX,y:fromY}];
   for(const c of coords){const point={x:Number(c[0])/(api?.W||1916),y:Number(c[1])/(api?.H||821)};if(Math.hypot((point.x-points[points.length-1].x)*(api?.W||1916),(point.y-points[points.length-1].y)*(api?.H||821))>3)points.push(point)}
   const target={x:Number(spot.x),y:Number(spot.y)};
   if(Math.hypot((target.x-points[points.length-1].x)*(api?.W||1916),(target.y-points[points.length-1].y)*(api?.H||821))>3)points.push(target);
   return points;
 }
 function moveQuadrupedToSpot(spot,options={}){
   const api=quadrupedApi();if(!api||!activateQuadruped())return false;
   const state=api.getState?.()?.cat||{},fromX=Number.isFinite(state.x)?state.x:x,fromY=Number.isFinite(state.y)?state.y:y;
   const targetSize=Number(spot.actorSize)||worldSizeAtY(spot.y*(spatialApi()?.H||821));
   const points=makeRoomPath({...spot,actorSize:targetSize},fromX,fromY,options),length=points.reduce((sum,p,i)=>i?sum+Math.hypot((p.x-points[i-1].x)*(spatialApi()?.W||1916),(p.y-points[i-1].y)*(spatialApi()?.H||821)):sum,0);
   quadrupedMove={spot:{...spot,actorSize:targetSize},points,index:1,stage:'walk',startedAt:performance.now(),startX:fromX,startY:fromY,startSize:worldSizeAtY(fromY*(spatialApi()?.H||821))/roomScale(),targetSize:targetSize/roomScale(),distance:0,totalDistance:Math.max(1,length),autonomousCatch:Boolean(options.autonomousCatch),isAquarium:options.autonomousCatch||String(spot.id||'').includes('aquarium'),jumpStart:0,landingUntil:0};
   currentCouchSpot=spot.id;moveTask=quadrupedMove.autonomousCatch?'aquarium-catch':'couch-rest';api.performCatAction?.('walk',{duration:900,hold:true});setQuadrupedSizeAtWorldY(fromY*(spatialApi()?.H||821));if(!quadrupedMove.autonomousCatch)markControlled(12000);return true;
 }
 function finishQuadrupedMove(now=performance.now()){
   if(!quadrupedMove)return false;const {spot,autonomousCatch,isAquarium}=quadrupedMove,api=quadrupedApi();api?.setCatPosition?.(spot.x,spot.y);setQuadrupedSizeAtWorldY(spot.y*(spatialApi()?.H||821),spot.actorSize/roomScale());
   if(autonomousCatch){api?.performCatAction?.('primary',{duration:560});recordFishCatch();setTimeout(()=>{if(active&&activeForm==='quadruped'&&String(currentCouchSpot).includes('aquarium'))api?.performCatAction?.('loaf',{duration:800,hold:true})},600)}
   else api?.performCatAction?.(spot.action||'loaf',{duration:900,hold:true,dir:spot.direction});
   x=goalX=spot.x;y=goalY=spot.y;currentCouchSpot=spot.id;quadrupedMove=null;moveTask='';manualUntil=Math.max(manualUntil,now+500);return true;
 }
 function advanceQuadrupedMove(now,dt){
   const m=quadrupedMove,api=quadrupedApi();if(!m||!api)return;
   const state=api.getState?.()?.cat||{},px=Number.isFinite(state.x)?state.x:x,py=Number.isFinite(state.y)?state.y:y;
   if(m.stage==='walk'){
     const dest=m.points[Math.min(m.index,m.points.length-1)],dx=(dest.x-px)*(spatialApi()?.W||1916),dy=(dest.y-py)*(spatialApi()?.H||821),d=Math.hypot(dx,dy),step=220*dt;
     if(d<=Math.max(3,step)){api.setCatPosition?.(dest.x,dest.y);m.distance+=d;m.index++}
     else{const f=step/d,nx=px+(dest.x-px)*f,ny=py+(dest.y-py)*f;api.setCatPosition?.(nx,ny);m.distance+=step}
     // Eight-way travel direction and five-frame walk, adapted from Trap the Cat's
      // directional cycles; native renderer remains authoritative for the sprite.
      const baseMotion=shellWindow()?.OnyxBaseMotion;
      const heading=baseMotion?.heading(dx,dy,{mode:'walk',elapsedMs:now-m.startedAt});
      if(heading&&typeof api.setSpriteFrame==='function')api.setSpriteFrame(heading.legacyDirection,heading.frame.index,'walk');
      const progress=Math.min(1,m.distance/m.totalDistance),semanticSize=m.startSize+(m.targetSize-m.startSize)*progress;
     x=px;y=py;setQuadrupedSize(Math.max(1,semanticSize*roomScale()));
     if(m.index>=m.points.length){const p=api.getState?.()?.cat||{};m.jumpFrom={x:Number(p.x)||dest.x,y:Number(p.y)||dest.y};m.stage='jump';m.jumpStart=now;
       const jumpName=m.spot.id==='onyx.basking.ac-rest'?'jump_down':(m.isAquarium||String(m.spot.id||'').includes('couch'))?'jump_up':'jump_across';
       if(!shellWindow()?.OnyxBaseMotion?.perform?.(jumpName,{duration:520})?.ok)api.performCatAction?.('jump',{duration:520})}
   }else if(m.stage==='jump'){
     const p=Math.min(1,(now-m.jumpStart)/520),nx=m.jumpFrom.x+(m.spot.x-m.jumpFrom.x)*p,ny=m.jumpFrom.y+(m.spot.y-m.jumpFrom.y)*p;api.setCatPosition?.(nx,ny);
     const semanticSize=m.startSize+(m.targetSize-m.startSize)*p;setQuadrupedSize(Math.max(1,semanticSize*roomScale()));x=nx;y=ny;
     if(p>=1){api.setCatPosition?.(m.spot.x,m.spot.y);m.stage='landing';m.landingUntil=now+360}
   }else if(now>=m.landingUntil)finishQuadrupedMove(now);
 }
 function goToCouchRestSpot(id){const spots=couchSpots().filter(spot=>spot.form==='quadruped'),spot=spots.find(item=>item.id===id);return spot?moveQuadrupedToSpot(spot):false}
 function cycleCouchRest(){const spots=couchSpots().filter(spot=>spot.form==='quadruped');if(!spots.length)return false;const spot=spots[quadrupedCycle%spots.length];quadrupedCycle=(quadrupedCycle+1)%spots.length;return moveQuadrupedToSpot(spot)}
 function scheduleWalk(name){
   const actor=actorApi();activateBiped();actor?.getUp?.();
   if(name==='away'){goalX=x<.5?.12:.88;goalY=.39;moveTask='walk-away'}
   else{const anchor=couchAnchor('biped-seat');goalX=anchor?.x??.50;goalY=anchor?.y??.60;moveTask='walk-to';bipedMoveStartDistance=Math.max(.001,Math.hypot(goalX-x,goalY-y));bipedSeatTargetSize=anchor?.actorSize||450*roomScale();setBipedSize(96*roomScale());if(anchor?.approachFacing)forcedFacing=anchor.approachFacing}
   nextGoal=Infinity;
 }
 function walkTo(name){markControlled(3500);noteUserActivity();chatting=false;scheduleWalk(name);workflow=name==='away'?'walking-away':'walking-to-couch'}
 function pivot(){
   markControlled();noteUserActivity();
   if(activeForm==='quadruped'){const p=quadrupedApi()?.getState?.()?.cat;quadrupedApi()?.setCouchRestSpot?.({id:currentCouchSpot,x:p?.x??x,y:p?.y??y,direction:((p?.dir||0)+1)%6,action:p?.action||'loaf'});return}
   actorApi()?.getUp?.();const order=['forward','right','back','left'];forcedFacing=order[(Math.max(0,order.indexOf(forcedFacing))+1)%order.length];goalX=x;goalY=y;moveTask='';actorApi()?.turnTo?.(forcedFacing);
 }
 function sit(){
   markControlled();noteUserActivity();
   if(activeForm==='quadruped'){const spots=couchSpots().filter(spot=>spot.form==='quadruped');return spots.length?moveQuadrupedToSpot(spots[0]):false}
   activateBiped();const anchor=couchAnchor('biped-seat'),actor=actorApi();
   if(!anchor){goalX=x;goalY=y;moveTask='';actor?.sit?.();return}
   if(anchor.actorSize)setBipedSize(anchor.actorSize);goalX=anchor.x;goalY=anchor.y;forcedFacing=anchor.seatFacing||'forward';
   if(Math.hypot(goalX-x,goalY-y)>.012){actor?.getUp?.();moveTask='sit-to-couch';nextGoal=Infinity}
   else{x=goalX;y=goalY;moveTask='';workflow='manual-sit-turn';actor?.turnTo?.(forcedFacing);}
 }
 function getUp(){markControlled();noteUserActivity();if(activeForm==='quadruped'){if(String(currentCouchSpot).startsWith('onyx.couch.')){const p=pointForFeature('onyx.basking.ac-rest'),api=spatialApi();return p?moveQuadrupedToSpot({id:'onyx.basking.ac-rest',form:'quadruped',x:p.x/(api?.W||1916),y:p.y/(api?.H||821),actorSize:64,action:'loaf'}):false}quadrupedMove=null;moveTask='';currentCouchSpot='';quadrupedApi()?.performCatAction?.('idle',{duration:500});return}actorApi()?.getUp?.()}
 function beginProfessorSequence(t=performance.now()){
   if(!active)return false;
   lastUserActivityAt=t;chatting=true;awaitingPraise=false;setGoodBoyGate(false);setWidgetMood('caring');setQuadAutonomy(false);
   if(activeForm==='biped'){
     const mode=actorApi()?.getState?.().mode;
     if(mode==='seated'){workflow='seated-professor';actorApi()?.noteChatActivity?.('user',t);return true}
     if(mode==='settle'){workflow='settling-on-couch';actorApi()?.noteChatActivity?.('user',t);return true}
     if(mode==='turn'){workflow='turning-to-seat';moveTask='';return true}
     actorApi()?.enterProfessor?.(t,'chat','standing');moveTask='';workflow='entering-professor';return true;
   }
   quadrupedMove=null;moveTask='';currentCouchSpot='';setForm('quadruped');setQuadMood('caring','user started a Botanical Garden conversation');
   actorApi()?.beginQuadrupedProfessor?.(t);workflow='quadruped-caring';workflowAt=t+CARE_STAGE_MS;return true;
 }
 function beginChat(role='user'){
   if(role!=='user')return false;
   const t=performance.now();setTone(inferTone(''));
   return beginProfessorSequence(t);
 }
 function endChat(){chatting=false;actorApi()?.endChat?.();return true}
 function noteUserActivity(){
   if(!active||awaitingPraise)return false;
   if(workflow==='quadruped-caring'||workflow==='quadruped-professor'||workflow==='entering-professor'||workflow==='walking-to-couch'||workflow==='turning-to-seat'||workflow==='settling-on-couch'||workflow==='seated-professor'){
     lastUserActivityAt=performance.now();chatting=true;return true;
   }
   return false;
 }
 function noteChat(role){if(role==='user')return beginChat(role);return false}
 function beginWalkToCouch(t){
   const anchor=couchAnchor('biped-seat');
   if(anchor){if(anchor.actorSize)setBipedSize(anchor.actorSize);goalX=anchor.x;goalY=anchor.y;if(anchor.approachFacing)forcedFacing=anchor.approachFacing}
   else{goalX=.50;goalY=.60}
   moveTask='walk-to';workflow='walking-to-couch';nextGoal=Infinity;
 }
 function startSeatTurn(t){
   const anchor=couchAnchor('biped-seat');if(anchor){x=goalX=anchor.x;y=goalY=anchor.y;forcedFacing=anchor.seatFacing||'forward'}
   moveTask='';workflow='turning-to-seat';actorApi()?.turnTo?.(forcedFacing,t);
 }
 function enterSeatedProfessor(t){
   const anchor=couchAnchor('biped-seat');if(anchor){x=goalX=anchor.x;y=goalY=anchor.y;forcedFacing=anchor.seatFacing||'forward'}
   moveTask='';workflow='settling-on-couch';actorApi()?.sit?.(t);
 }
 function startIdleExit(t){
   if(workflow==='leaving-seat'||workflow==='walking-away'||workflow==='exiting-professor'||workflow==='awaiting-good-boy')return false;
   chatting=false;workflow='leaving-seat';moveTask='';actorApi()?.getUp?.(t);return true;
 }
 function finishIdleExit(){
   if(!activateQuadruped())return false;
   quadrupedApi()?.clearCouchRestSpot?.();quadrupedApi()?.setCatPosition?.(x,y);
   const vectors={right:[1,0],forward:[1,1],back:[1,-1],left:[-1,0],'down-right':[1,1],'down-left':[-1,1],'up-left':[-1,-1],'up-right':[1,-1]};const v=vectors[forcedFacing];if(v)quadrupedApi()?.faceVector?.(v[0],v[1]);
   setForm('quadruped');
   setQuadAutonomy(false);setQuadMood('caring','waiting for Good boy after the conversation');
   workflow='awaiting-good-boy';awaitingPraise=true;setGoodBoyGate(true);chatting=false;return true;
 }
 function goodBoy(){
   if(!active||workflow!=='awaiting-good-boy'||!awaitingPraise)return false;
   awaitingPraise=false;setGoodBoyGate(false);workflow='autonomous';chatting=false;setTone('pet');
   setQuadMood('purring','the user praised Onyx');
   const moodState=personalityApi()?.getState?.();
   if(moodState?.allowed){personalityApi()?.setMoodAllowed?.('professor',false);personalityApi()?.setMoodAllowed?.('advising_professor',false)}
   setQuadAutonomy(true);
   try{
     const pet=window.OnyxVirtualPet,widgetState=pet?.getState?.();
     if(widgetState?.conversationPhase!=='serious_active')pet?.clearConversationState?.();
     Promise.resolve(pet?.act?.('pet')).catch(()=>{});
   }catch(_){ }
   return true;
 }
 function transition(){
   if(!active)return false;
   if(activeForm==='quadruped'){
     if(workflow==='awaiting-good-boy')return false;
     setQuadAutonomy(false);setQuadMood('thoughtful','manual Professor test');actorApi()?.beginQuadrupedProfessor?.();workflow='quadruped-professor';workflowAt=performance.now()+QUAD_PROFESSOR_MS;return true;
   }
   if(workflow==='seated-professor'){return startIdleExit(performance.now())}
   actorApi()?.exitProfessor?.();workflow='exiting-professor';return true;
 }
 function control(key,detail={}){
   if(detail.pressed===false)return false;const k=String(key||'').toLowerCase();if(!['t','2','p','x','u','0','c'].includes(k))return false;
   if(detail.repeat&&k==='c')return true;if(detail.repeat&&k!=='p')markControlled();
   if(k==='t'){if(activeForm==='quadruped')beginProfessorSequence(performance.now());else transition()}
   else if(k==='2')walkTo('to');else if(k==='p')pivot();else if(k==='x')sit();else if(k==='u')getUp();else if(k==='0')walkTo('away');else if(k==='c')cycleCouchRest();
   return true;
 }
 function render(now){
   const surface=shellSurface();if(activeForm==='quadruped'){refreshMount();return}
   const api=actorApi();if(!api?.render||!surface.canvas)return;
   const moving=!!moveTask&&Math.hypot(goalX-x,goalY-y)>.008;const facing=moving?facingFromVector(goalX-x,goalY-y):forcedFacing;
   const room=frame()?.contentDocument?.getElementById('viewerScreen'),width=Math.max(1,room?.clientWidth||1915),height=Math.max(1,room?.clientHeight||647);
   const sampleSeconds=bipedGaitLastAt>0?Math.max(0,(now-bipedGaitLastAt)/1000):0;
   const traveledPx=Math.hypot((x-bipedGaitLastX)*width,(y-bipedGaitLastY)*height);
   if(moving&&sampleSeconds>0&&Number.isFinite(traveledPx)){bipedGaitDistancePx+=traveledPx;bipedGaitSpeedPxPerSec=traveledPx/sampleSeconds}else bipedGaitSpeedPxPerSec=0;
   bipedGaitLastX=x;bipedGaitLastY=y;bipedGaitLastAt=now;
   api.render(surface.canvas,{time:now,size:bipedSize||96,facing,chatting,moving,gaitDistancePx:bipedGaitDistancePx,gaitSpeedPxPerSec:bipedGaitSpeedPxPerSec});
   if(surface.actor){surface.actor.style.left=(x*100)+'%';surface.actor.style.top=(y*100)+'%';surface.actor.style.display=visible?'block':'none';surface.actor.dataset.chatting=String(chatting);surface.actor.dataset.professorState=api.getState?.().mode||'quadruped'}
   if(fallbackActor)fallbackActor.style.display=surface.inside?'none':(visible?'block':'none');
 }
 function advanceWorkflow(now){
   const actorMode=actorApi()?.getState?.().mode||'quadruped';
   if(workflow==='quadruped-caring'&&now>=workflowAt){
     setQuadMood('thoughtful','Onyx is preparing to advise');actorApi()?.beginQuadrupedProfessor?.(now);workflow='quadruped-professor';workflowAt=now+QUAD_PROFESSOR_MS;
   }else if(workflow==='quadruped-professor'&&now>=workflowAt){
     activateBiped();actorApi()?.beginProfessorEntry?.(now);workflow='entering-professor';
   }else if(workflow==='entering-professor'&&actorMode==='standing'){
     beginWalkToCouch(now);
   }else if(workflow==='turning-to-seat'&&actorMode==='standing'){
     enterSeatedProfessor(now);
   }else if(workflow==='settling-on-couch'&&actorMode==='seated'){
     workflow='seated-professor';
   }else if(workflow==='manual-sit-turn'&&actorMode==='standing'){
     actorApi()?.sit?.(now);workflow='manual-sit-settling';
   }else if(workflow==='manual-sit-settling'&&actorMode==='seated'){
     workflow='seated-professor';
   }else if(workflow==='leaving-seat'&&actorMode==='standing'){
     scheduleWalk('away');workflow='walking-away';
   }else if(workflow==='walking-away'&&!moveTask){
     actorApi()?.exitProfessor?.(now);workflow='exiting-professor';
   }else if(workflow==='exiting-professor'&&actorMode==='quadruped'){
     finishIdleExit();
   }
 }
 function tick(now){
   if(!active)return;const dt=Math.min(.05,(now-last)/1000||0);last=now;
   if((workflow==='seated-professor'||workflow==='settling-on-couch'||workflow==='manual-sit-settling')&&lastUserActivityAt&&now-lastUserActivityAt>USER_IDLE_MS)startIdleExit(now);
   if(activeForm==='quadruped'&&!quadrupedMove){syncPositionFromQuadruped();const state=quadrupedApi()?.getState?.()?.cat;if(state&&Number.isFinite(state.y))setQuadrupedSizeAtWorldY(state.y*(spatialApi()?.H||821))}
   updateRoomAppliances();
   if(quadrupedMove){advanceQuadrupedMove(now,dt);advanceWorkflow(now);render(now);raf=requestAnimationFrame(tick);return}
   let dx=goalX-x,dy=goalY-y,m=Math.hypot(dx,dy),actorMode=actorApi()?.getState?.().mode||'quadruped';
   if((moveTask==='walk-to'||moveTask==='walk-away'||moveTask==='sit-to-couch')&&actorMode==='standing'){
     if(m>.008){const speed=.115;x+=dx/m*speed*dt;y+=dy/m*speed*dt;forcedFacing=facingFromVector(dx,dy);if(moveTask==='walk-to'||moveTask==='sit-to-couch'){const progress=Math.min(1,1-Math.hypot(goalX-x,goalY-y)/bipedMoveStartDistance);setBipedSize(96*roomScale()+(bipedSeatTargetSize-96*roomScale())*progress)}}
     else{
       x=goalX;y=goalY;const task=moveTask;moveTask='';manualUntil=Math.max(manualUntil,now+450);
       if(task==='walk-to'||task==='sit-to-couch'){setBipedSize(bipedSeatTargetSize);startSeatTurn(now)}
       else if(task==='walk-away')workflow='walking-away';
     }
   }
   if(activeForm==='biped'&&workflow==='autonomous'&&!chatting&&actorMode==='quadruped'&&now>nextGoal){
     nextGoal=now+6500+Math.random()*4000;goalX=.22+Math.random()*.55;goalY=.48+Math.random()*.27;moveTask='ambient';dx=goalX-x;dy=goalY-y;m=Math.hypot(dx,dy);
   }
   if(moveTask==='ambient'){dx=goalX-x;dy=goalY-y;m=Math.hypot(dx,dy);if(m>.008){const speed=.028;x+=dx/m*speed*dt;y+=dy/m*speed*dt;forcedFacing=facingFromVector(dx,dy)}else moveTask=''}
   if(activeForm==='quadruped'&&!quadrupedMove)maybeScheduleFishCatch(now);
   updateRoomAppliances();advanceWorkflow(now);render(now);raf=requestAnimationFrame(tick);
 }
 function start(){
   active=true;last=performance.now();nextGoal=Infinity;x=.52;y=.55;goalX=x;goalY=y;moveTask='';quadrupedMove=null;currentCouchSpot='';activeForm='quadruped';forcedFacing='forward';manualUntil=0;chatting=false;workflow='autonomous';lastUserActivityAt=0;awaitingPraise=false;bipedGaitDistancePx=0;bipedGaitSpeedPxPerSec=0;bipedGaitLastX=x;bipedGaitLastY=y;bipedGaitLastAt=0;bipedSize=96*roomScale();
   actorApi()?.reset?.();setGoodBoyGate(false);setForm('quadruped');setQuadAutonomy(true);
   const current=personalityApi()?.getState?.().currentMood||quadrupedApi()?.getState?.().behavior||'caring';setQuadMood(QUAD_MOODS.includes(current)?current:'caring','Botanical Garden opened');
   positionQuadrupedAtAc();setTimeout(positionQuadrupedAtAc,180);setTimeout(positionQuadrupedAtAc,420);setBipedSize(96*roomScale());
   cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);if(slow)slow.hidden=false;setTimeout(refreshMount,80);setTimeout(refreshMount,350);return true;
 }
 function stop(){
   active=false;chatting=false;moveTask='';quadrupedMove=null;currentCouchSpot='';externalControlActive=false;awaitingPraise=false;workflow='stopped';cancelAnimationFrame(raf);setGoodBoyGate(false);setQuadAutonomy(true);actorApi()?.reset?.();
   if(fallbackActor)fallbackActor.style.display='none';const q=quadrupedSurface();if(q?.actor){q.actor.style.display='none';q.actor.hidden=true}const s=shellSurface();if(s.actor)s.actor.style.display='none';
 }
 document.querySelectorAll('[data-slow-care]').forEach(b=>b.addEventListener('click',()=>{setTone('pet');window.OnyxVirtualPet?.act?.(b.dataset.slowCare)}));
 document.addEventListener('keydown',e=>{if(!active)return;const target=e.target;if(target?.matches?.('input,textarea,select,[contenteditable="true"]'))return;if(control(e.key,{pressed:true,repeat:e.repeat})){e.preventDefault();e.stopPropagation()}},true);
 window.addEventListener('onyx:chat-line',e=>{
   if(e.detail?.tab!=='health')return;const role=String(e.detail?.role||'');
   if(role==='user'){setTone(inferTone(e.detail?.content));beginChat('user')}
 });
 window.addEventListener('onyx:conversation-complete',e=>{
   if(e.detail?.tab!=='health')return;const s=String(e.detail?.answer?.state||'');
   if(/advising_professor|thinking|thoughtful/.test(s)&&currentTone==='work')setTone('work');else if(/purring|snuggly/.test(s))setTone('pet');
 });
 window.OnyxVirtualHealthEnvironment=Object.freeze({
   start,stop,setTone,inferTone,beginChat,endChat,noteChat,noteUserActivity,goodBoy,control,markControlled,setControlActive,setVisible,refreshMount,
   cycleCouchRest,goToCouchRestSpot,getCouchSpots:couchSpots,onShellReady,
   get couchSpot(){return currentCouchSpot},get form(){return activeForm},get tone(){return currentTone},get workflow(){return workflow},get active(){return active},get chatting(){return chatting},get awaitingPraise(){return awaitingPraise},
   get userIdleRemainingMs(){return lastUserActivityAt?Math.max(0,USER_IDLE_MS-(performance.now()-lastUserActivityAt)):USER_IDLE_MS},
   get fishCollection(){return{counts:{...fishState.counts},history:fishState.history.slice(),nextCatchAt:fishState.nextCatchAt,catchIntervalMs:FISH_CATCH_INTERVAL_MS,onyxHoursPerRealHour:ONYX_HOURS_PER_REAL_HOUR}},
   get applianceState(){return{...applianceState}},
   get fishCatchIntervalMs(){return FISH_CATCH_INTERVAL_MS},
   jumpOntoAquarium(){const p=pointForFeature('onyx.aquarium.jump-landing'),api=spatialApi();return p?moveQuadrupedToSpot({id:'onyx.aquarium.jump-landing',form:'quadruped',x:p.x/(api?.W||1916),y:p.y/(api?.H||821),actorSize:64,action:'loaf'},{autonomousCatch:false}):false},
   // The profile owns the Pass 23 motion clock. The scene iframe still owns its
   // original cat sprite, couch and aquarium animations, and game/need state.
   get baseMotion(){return window.OnyxBaseMotion||shellWindow()?.OnyxBaseMotion||null},
   baseMove(direction,options={}){
     const bridge=window.OnyxHappyHomeMotion;
     return bridge?.move?.(String(direction),'walk',options)
       ||this.baseMotion?.walk?.(String(direction),options)
       ||{ok:false,reason:'motion-not-ready'};
   },
   baseRun(direction,options={}){
     const bridge=window.OnyxHappyHomeMotion;
     return bridge?.move?.(String(direction),'run',options)
       ||this.baseMotion?.run?.(String(direction),options)
       ||{ok:false,reason:'motion-not-ready'};
   },
   baseAction(action,options={}){
     return window.OnyxHappyHomeMotion?.action?.(String(action),options)
       ||this.baseMotion?.perform?.(String(action),options)
       ||{ok:false,reason:'motion-not-ready'};
   },
   feedOnyx(options={}){
     const target=options.bowl||options.target;
     return (target&&window.OnyxHappyHomeMotion?.interact?.('eat',target,options))
       ||this.baseMotion?.eat?.(options)
       ||{ok:false,reason:'motion-not-ready'};
   },
   waterOnyx(options={}){
     const target=options.bowl||options.target;
     return (target&&window.OnyxHappyHomeMotion?.interact?.('drink',target,options))
       ||this.baseMotion?.drink?.(options)
       ||{ok:false,reason:'motion-not-ready'};
   },
   get controlled(){return isControlled()}
 });
})();
