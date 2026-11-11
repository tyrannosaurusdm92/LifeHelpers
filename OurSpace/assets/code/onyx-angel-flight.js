/* Onyx Angel Flight — companion-aware flight and user-supplied sprite installer.
   The original CAT-astrophic archive, other cats, and world are left intact.
   Uploaded artwork remains the source; no wings/halos are procedurally drawn. */
(function () {
  'use strict';
  if (window.OnyxAngelicFlight) return;
  const DB='catastrophic-onyx-angel-art-v1', STORE='uploads';
  const BIRDS=['hummingbird','robin','sparrow','bluejay','cardinal','dove','finch'];
  const ASSET_ROOT='assets/images/game/';
  const state={phase:'ground',alt:0,xSpeed:0,active:false,images:{},urls:{},pressed:new Set(),hoverLock:false,controller:false,ready:false,loading:null,status:'New sprites not installed yet'};
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const imageUrl=blob=>URL.createObjectURL(blob);
  const pauseForFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  const isTyping=el=>!!el?.closest?.('input,textarea,select,[contenteditable="true"]');
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function dbOpen() {
    return new Promise((resolve,reject)=>{
      if(!window.indexedDB){reject(new Error('This browser cannot save sprite archives'));return;}
      const req=indexedDB.open(DB,1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error||new Error('Sprite storage unavailable'));
    });
  }
  async function savedArchive(){
    try {
      const db=await dbOpen();
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE,'readonly');
        const request=tx.objectStore(STORE).get('onyx');
        request.onsuccess=()=>{resolve(request.result||null);db.close();};
        request.onerror=()=>{reject(request.error);db.close();};
      });
    }catch(err){console.warn('Onyx sprite storage:',err);return null;}
  }
  async function persistArchive(blob){
    const db=await dbOpen();
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(STORE,'readwrite');
      tx.objectStore(STORE).put(blob,'onyx');
      tx.oncomplete=resolve;
      tx.onerror=()=>reject(tx.error||new Error('Sprite save failed'));
    });
    db.close();
  }
  function setStatus(message){
    state.status=message;
    const status=document.getElementById('onyxAngelStatus');
    if(status)status.textContent=message;
    const toggle=document.getElementById('onyxAngelFlightToggle');
    if(toggle){toggle.textContent=state.phase==='ground'?'Fly with Onyx':'Land Onyx';toggle.setAttribute('aria-pressed',String(state.phase!=='ground'));}
    const hover=document.getElementById('onyxAngelHoverToggle');
    if(hover){hover.disabled=state.phase==='ground';hover.setAttribute('aria-pressed',String(state.hoverLock));hover.textContent=state.hoverLock?'Resume flying':'Hover in place';}
  }
  async function loadImage(blob){
    const url=imageUrl(blob),img=new Image();
    img.decoding='async';img.src=url;
    try{await img.decode();return {image:img,url};}
    catch(err){URL.revokeObjectURL(url);throw new Error('Could not decode one of Onyx’s sprite images');}
  }
  function rectFor(sheet,row,col){
    if(sheet==='air'){
      const rowBands=[[21,186],[194,346],[359,516],[523,674],[675,840],[835,1013],[1013,1175],[1170,1340],[1340,1510]];
      const xBands=row===0?[[22,205],[200,390],[390,575],[575,750],[750,1015]]:[[16,220],[220,417],[417,615],[615,818],[818,1024]];
      const xs=xBands[col%5],ys=rowBands[clamp(row,0,8)];
      return {x:xs[0],y:ys[0],w:xs[1]-xs[0],h:ys[1]-ys[0]};
    }
    if(sheet==='bowtie'){
      // The supplied 724px-wide bow-tie atlas has four columns of original art.
      const xBands=[[40,214],[216,386],[389,559],[559,717]];
      const yBands=[[40,217],[245,423],[447,625],[640,818],[833,1008],[1038,1216],[1230,1412],[1420,1605]];
      const xs=xBands[col%4],ys=yBands[clamp(row,0,7)];
      return {x:xs[0],y:ys[0],w:xs[1]-xs[0],h:ys[1]-ys[0]};
    }
    const bands=[[16,235],[239,461],[465,680],[683,869],[875,1097],[1103,1319],[1325,1535]];
    const xs=[[23,220],[222,414],[416,608],[610,801],[803,1004]][col%5];
    const ys=bands[clamp(row,0,6)];
    return {x:xs[0],y:ys[0],w:xs[1]-xs[0],h:ys[1]-ys[0]};
  }
  function drawFrame(ctx,image,source,row,col,x,y,w,h){
    const r=rectFor(source,row,col);
    ctx.drawImage(image,r.x,r.y,r.w,r.h,x,y,w,h);
  }
  function toBlob(canvas){
    return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Could not export Onyx sprite atlas')),'image/png'));
  }
  async function createAtlas(){
    // Preserve the existing 4 x 8, 210-pixel manifest layout for WASM, inventory,
    // native Mosswood, legacy drawing and their precomputed frame IDs.
    const canvas=document.createElement('canvas');canvas.width=840;canvas.height=1680;
    const ctx=canvas.getContext('2d',{alpha:true});ctx.imageSmoothingEnabled=false;
    const poses=[
      ['bowtie',0,0],['bowtie',0,1],['ground',1,0],['ground',1,1],
      ['ground',1,2],['ground',1,3],['ground',4,0],['ground',4,1],
      ['ground',3,0],['ground',3,1],['ground',4,2],['ground',4,3],
      ['ground',2,0],['ground',2,1],['ground',2,2],['ground',2,3],
      ['ground',2,4],['ground',3,2],['ground',1,4],['ground',0,2],
      ['bowtie',2,2],['bowtie',2,3],['air',4,0],['air',4,1],
      ['ground',0,3],['ground',0,4],['ground',2,0],['air',6,0],
      ['ground',1,2],['ground',1,3],['ground',1,4],['air',7,2]
    ];
    for(let i=0;i<32;i++){
      const [source,row,col]=poses[i],img=state.images[source].image;
      drawFrame(ctx,img,source,row,col,(i%4)*210,Math.floor(i/4)*210,210,210);
    }
    const blob=await toBlob(canvas);const url=imageUrl(blob);
    state.urls[ASSET_ROOT+'onyx.png']=url;
    state.urls[ASSET_ROOT+'mosswood_characters--onyx.png']=url;
    state.urls[ASSET_ROOT+'onyx-original-transparent.png']=url;
  }
  async function fromZip(blob){
    if(!window.JSZip)throw new Error('The game’s ZIP reader is unavailable');
    const zip=await JSZip.loadAsync(blob);
    const entries=Object.values(zip.files).filter(file=>!file.dir);
    function locate(expr,label){
      const file=entries.find(file=>expr.test(file.name.split('/').pop()));
      if(!file)throw new Error('Missing '+label+' in the attached archive');
      return file;
    }
    const ground=locate(/haloed cat sprite sheet-1\.png$/i,'Onyx’s ground sprite sheet');
    const air=locate(/angelic cat sprite sheet-2\.png$/i,'Onyx’s flying sprite sheet');
    const bowtie=locate(/haloed bowtie sprite sheet\.png$/i,'Onyx’s bow-tie sprite sheet');
    for(const [name,file] of [['ground',ground],['air',air],['bowtie',bowtie]]){
      state.images[name]=await loadImage(await file.async('blob'));
    }
    for(const bird of BIRDS){
      const file=locate(new RegExp('^0[1-7]_Onyx_'+bird+'_Halo\\.png$','i'),bird+' bird contact');
      const original=await loadImage(await file.async('blob'));
      // The game expects fixed 280x220 contact atlases; normalize dimensions
      // rather than allowing the much larger source PNGs to be cropped wrongly.
      const cvs=document.createElement('canvas');cvs.width=280;cvs.height=220;
      cvs.getContext('2d').drawImage(original.image,0,0,280,220);
      const output=await toBlob(cvs);
      state.urls[ASSET_ROOT+'cat-contact-onyx-'+bird+'.png']=imageUrl(output);
      URL.revokeObjectURL(original.url);
    }
    await createAtlas();
    state.ready=true;
    setStatus('Onyx’s halo, wings and all seven bird scenes are ready.');
  }
  function bundledArchive(){
    const el=document.getElementById('onyxAngelArtArchive');
    const encoded=el?.textContent?.trim();
    if(!encoded)return null;
    try {
      const binary=atob(encoded),bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      return new Blob([bytes],{type:'application/zip'});
    }catch(err){console.warn('Embedded Onyx sprite archive could not be decoded:',err);return null;}
  }
  async function prepare(){
    if(state.loading)return state.loading;
    state.loading=(async()=>{
      const saved=await savedArchive();
      const bundled=bundledArchive();
      const attempts=[saved,bundled].filter(Boolean);
      for(const blob of attempts){
        try {await fromZip(blob);return true;}
        catch(err){console.warn('Onyx angel sprite archive:',err);setStatus('Sprite archive needs re-import: '+err.message);}
      }
      if(!attempts.length)setStatus('Select Install Onyx’s angel sprite ZIP once to replace the original sprites.');
      return state.ready;
    })();
    return state.loading;
  }
  function applyOverrides(urls){
    for(const [path,url] of Object.entries(state.urls))urls[path]=url;
  }
  async function importZip(file){
    if(!file)return;
    setStatus('Checking Onyx’s sprite sheets and bird images…');
    try{
      await fromZip(file);
      await persistArchive(file);
      setStatus('Installed. Reloading the game to replace both sprite engines…');
      location.reload();
    }catch(err){console.error('Onyx import failed',err);setStatus('Could not install sprites: '+err.message);}
  }
  const airborne=()=>state.phase!=='ground';
  function toggle(){
    if(state.phase==='ground'){state.phase='takingoff';state.alt=0;state.xSpeed=0;state.hoverLock=false;}
    else{state.phase='landing';}
    setStatus(state.phase==='landing'?'Onyx is coming in for a gentle landing.':
      'Onyx is taking flight. A/D or ←/→ move; W/↑/Space rise; S/↓/Shift descend.');
    return true;
  }
  function land(){if(airborne()){state.phase='landing';state.hoverLock=false;setStatus('Onyx is gliding down to land.');}}
  function hover(){
    if(!airborne())return false;
    state.hoverLock=!state.hoverLock;
    if(state.hoverLock){state.xSpeed=0;state.phase='hovering';}
    setStatus(state.hoverLock?'Onyx is hovering gently in place. Use W/S or ↑/↓ to rise and descend.':'Onyx can glide again.');
    return state.hoverLock;
  }
  function altitude(){return state.alt;}
  function advance(dt){
    if(!airborne())return false;
    dt=clamp(dt||0,0,.065);
    const up=state.pressed.has('up'),down=state.pressed.has('down');
    if(state.phase==='takingoff'){
      state.alt=Math.min(120,state.alt+dt*148);
      if(state.alt>=120){state.phase='hovering';setStatus('Onyx is hovering with his angel wings.');}
    }else if(state.phase==='landing'){
      state.alt=Math.max(0,state.alt-dt*165);
      if(state.alt<=0){
        state.phase='ground';state.alt=0;state.xSpeed=0;
        state.hoverLock=false;state.nativeAnchor=null;
        setStatus('Onyx has landed safely.');return false;
      }
    }else{
      const v=(up?1:0)-(down?1:0);
      state.alt=clamp(state.alt+v*dt*186,40,460);
    }
    const direction=(state.pressed.has('right')?1:0)-(state.pressed.has('left')?1:0);
    const desired=(state.hoverLock?0:direction*250);
    state.xSpeed+=(desired-state.xSpeed)*Math.min(1,dt*(state.hoverLock?16:10));
    if(state.hoverLock)state.xSpeed=0;
    if(state.phase==='landing'){
      state.xSpeed*=Math.max(0,1-dt*7);
    }else if(state.phase!=='takingoff'){
      const next=state.hoverLock||(!direction&&Math.abs(state.xSpeed)<4)?'hovering':'flying';
      state.phase=next;
    }
    return true;
  }
  function updateLegacy(cat,dt,world,ground){
    if(cat?.id!=='onyx'||!airborne()||!isLegacyScene())return false;
    const active=advance(dt);
    if(!active)return false;
    const length=world?.length||12000;
    const x=clamp(cat.worldX()+state.xSpeed*dt,40,Math.max(41,length-40));
    try{cat.brain.force?.(0);cat.brain.place(x,ground);}catch(err){console.warn('Onyx flight placement:',err);}
    return true;
  }
  function isLegacyScene(){
    return (document.getElementById('slowPetGame')?.dataset.currentBiomeLayer||'legacy')==='legacy';
  }
  function updateNative(actor,dt){
    if(actor?.id!=='onyx'||!airborne()||isLegacyScene())return false;
    if(!state.nativeAnchor || state.nativeAnchor.zone!==actor.zone)
      state.nativeAnchor={zone:actor.zone,x:actor.x,y:actor.y};
    const still=advance(dt);
    if(!still){
      actor.linkedWorld=false;actor.goal=null;actor.path=[];actor.task='idle';
      actor.next=0;state.nativeOverride=false;state.nativeAnchor=null;
      return false;
    }
    const max=actor.zone==='mosswood'?238:actor.zone==='apothecary'?18:48;
    state.nativeAnchor.x=clamp(state.nativeAnchor.x+state.xSpeed*dt,1.9,max);
    actor.x=state.nativeAnchor.x;actor.y=state.nativeAnchor.y;
    actor.linkedWorld=false;actor.goal=null;actor.path=[];actor.task='angel-flight';
    actor.anim='idle';actor.animClock=(actor.animClock||0)+dt;
    actor.facing=state.xSpeed<-.5?-1:state.xSpeed>.5?1:actor.facing;
    return true;
  }
  function mirrorNative(actor){
    return actor?.id==='onyx'&&(airborne()||!!state.nativeOverride);
  }
  function frameFor(phase,anim,clock){
    const frame=Math.floor((clock||performance.now()/1000)*(reduced()?2:7))%5;
    if(phase==='landing')return ['air',7,frame];
    if(phase==='takingoff')return ['air',5,frame];
    if(phase==='hovering')return ['air',8,Math.floor((clock||performance.now()/1000)*(reduced()?1:3))%5];
    if(phase==='flying')return ['air',6+Math.floor((clock||0)/3)%2,frame];
    const row=anim==='sleep'||anim==='rest'?3:anim==='groom'||anim==='yawn'?2:
      anim==='pounce'||anim==='play'?4:anim==='walk'?1:0;
    if(anim==='proud'||anim==='settle')return ['bowtie',2,frame%4];
    if(row===0) return ['bowtie',0,frame%4];
    return ['ground',row,frame];
  }
  function paint(ctx,anim,centerX,footY,height,facing,clock){
    if(!state.ready)return false;
    const [name,row,col]=frameFor(state.phase,anim,clock);
    const sprite=state.images[name]?.image;
    if(!sprite?.complete)return false;
    const h=height*(airborne()?1.27:1.12),w=h*(airborne()?1.18:1.08);
    const bob=airborne()&&!reduced()?Math.sin((clock||performance.now()/1000)*(state.phase==='hovering'?2.4:5))*(state.phase==='hovering'?4:2.8):0;
    ctx.save();ctx.imageSmoothingEnabled=false;
    const x=Math.round(centerX-w/2),y=Math.round(footY-h-state.alt+bob);
    if(facing<0){ctx.translate(Math.round(centerX+w/2),0);ctx.scale(-1,1);drawFrame(ctx,sprite,name,row,col,0,y,w,h);}
    else drawFrame(ctx,sprite,name,row,col,x,y,w,h);
    ctx.restore();return true;
  }
  function drawLegacy(ctx,cat,b,clock){
    if(cat?.id!=='onyx')return false;
    return paint(ctx,cat.rest?'sleep':cat.care?.kind||cat.pose||'idle',b.centerX??(b.x+b.w/2),
      b.y+b.h,cat.h,cat.facing(),clock);
  }
  function drawNative(ctx,a,level,scale,height,clock,stoolLift){
    if(a?.id!=='onyx')return false;
    return paint(ctx,a.anim,level.getPixelX()+a.x*scale,
      level.getPixelY()+a.y*scale-(stoolLift||0),height,a.facing,clock);
  }
  function drawSleep(ctx,cat,b,clock){
    if(cat?.id!=='onyx'||!state.ready)return false;
    return paint(ctx,'sleep',b.centerX??(b.x+b.w/2),b.y+b.h,cat.h,cat.facing(),clock);
  }
  function keyDirection(code){
    if(['ArrowLeft','KeyA'].includes(code))return 'left';
    if(['ArrowRight','KeyD'].includes(code))return 'right';
    if(['ArrowUp','KeyW','Space'].includes(code))return 'up';
    if(['ArrowDown','KeyS','ShiftLeft','ShiftRight'].includes(code))return 'down';
    return null;
  }
  document.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.metaKey||event.altKey||isTyping(event.target))return;
    if(event.code==='KeyF'&&!event.repeat){event.preventDefault();toggle();return;}
    if(event.code==='KeyH'&&!event.repeat&&airborne()){event.preventDefault();hover();return;}
    if(event.code==='Escape'&&airborne()){land();return;}
    const direction=keyDirection(event.code);
    if(direction&&airborne()){state.pressed.add(direction);event.preventDefault();}
  },true);
  document.addEventListener('keyup',event=>{const direction=keyDirection(event.code);if(direction)state.pressed.delete(direction);},true);
  window.addEventListener('blur',()=>state.pressed.clear());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)state.pressed.clear();});
  function attachControl(){
    if(document.getElementById('onyxAngelFlightControls'))return;
    const parent=document.getElementById('hud-controls')||document.querySelector('#slowPetGame .hud-panel')||document.body;
    const box=document.createElement('div');box.id='onyxAngelFlightControls';box.className='section';
    const title=document.createElement('h3');title.textContent='Onyx’s angel wings';box.appendChild(title);
    const paragraph=document.createElement('p');
    paragraph.textContent='F: fly or land · H: hover in place · A/D or ←/→: travel · W/↑/Space: ascend · S/↓/Shift: descend · Esc: land. Onyx also hovers automatically when still.';
    box.appendChild(paragraph);
    const toggleButton=document.createElement('button');toggleButton.id='onyxAngelFlightToggle';
    toggleButton.type='button';toggleButton.className='btn';toggleButton.textContent='Fly with Onyx';toggleButton.addEventListener('click',toggle);
    box.appendChild(toggleButton);
    const hoverButton=document.createElement('button');hoverButton.id='onyxAngelHoverToggle';
    hoverButton.type='button';hoverButton.className='btn';hoverButton.textContent='Hover in place';
    hoverButton.style.marginLeft='8px';hoverButton.disabled=true;hoverButton.setAttribute('aria-pressed','false');
    hoverButton.addEventListener('click',hover);box.appendChild(hoverButton);
    const importButton=document.createElement('button');importButton.id='onyxAngelImport';
    importButton.type='button';importButton.className='btn';importButton.textContent='Install Onyx’s angel sprite ZIP';
    importButton.style.marginLeft='8px';box.appendChild(importButton);
    const input=document.createElement('input');input.type='file';input.accept='.zip,application/zip';input.hidden=true;
    input.addEventListener('change',()=>{const file=input.files?.[0];if(file)importZip(file);input.value='';});
    importButton.addEventListener('click',()=>input.click());box.appendChild(input);
    const controls=document.createElement('div');controls.className='onyx-angel-direction-pad';
    for(const [direction,label] of [['left','←'],['right','→'],['up','Ascend'],['down','Descend']]){
      const button=document.createElement('button');button.type='button';button.className='btn';
      button.textContent=label;button.setAttribute('aria-label','Onyx fly '+direction);
      button.addEventListener('pointerdown',event=>{event.preventDefault();state.pressed.add(direction);button.setPointerCapture?.(event.pointerId);});
      for(const kind of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(kind,()=>state.pressed.delete(direction));
      controls.appendChild(button);
    }
    box.appendChild(controls);
    const status=document.createElement('p');status.id='onyxAngelStatus';status.setAttribute('role','status');
    status.textContent=state.status;box.appendChild(status);parent.appendChild(box);
  }
  const stylesheet=document.createElement('style');
  stylesheet.textContent='#onyxAngelFlightControls{margin:12px 0;padding:12px;border:1px solid #cdab55;border-radius:8px}#onyxAngelFlightControls .onyx-angel-direction-pad{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}#onyxAngelFlightControls button{touch-action:none}#onyxAngelStatus{font-size:.92em;opacity:.9}';
  document.head.appendChild(stylesheet);
  document.addEventListener('DOMContentLoaded',attachControl);
  window.addEventListener('catastrophic-archive-ready',attachControl);
  window.OnyxAngelicFlight={prepare,applyOverrides,importZip,toggle,hover,land,altitude,updateLegacy,updateNative,mirrorNative,drawLegacy,drawNative,drawSleep,
    get installed(){return state.ready;},get phase(){return state.phase;}};
})();