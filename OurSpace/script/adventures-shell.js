/*
 * Onyx’s Adventures-only shell/HUD. No Feed Him MEOW, kitchen, puzzle, joystick or face-button runtimes.
 * Browser-local guided self-care is honest about its limits. Connect a real game / AI adapter
 * through window.onyxAdventuresShell.connect(adapter) to enable host-backed actions.
 */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const root = $('#gameShell');
  const viewport = $('#gameViewport');
  const panels = new Map($$('.hud-panel').map(el => [el.dataset.panel, el]));
  const shortcutMap = {1:'home',2:'care',3:'status',4:'goals',5:'journal'};
  const VALID_STATES = new Set([
    'onyx_sleepy','onyx_snuggly','onyx_advising_professor','onyx_judgmental',
    'onyx_listening','onyx_caring','onyx_hungry','onyx_purring','onyx_thinking','onyx_thoughtful'
  ]);
  const ACTIVATORS = [
    /\bprofessor onyx\b/i, /\b(hello|hey|hi) professor\b/i,
    /\b(enter|start|activate|switch to) professor( mode)?\b/i,
    /\bdbt (?:skill|skills|worksheet|worksheets|handout|handouts|practice|coaching)\b/i,
    /\b(?:help me with|teach me|practice|learn|use) dbt\b/i,
    /\b(distress tolerance|emotion regulation|interpersonal effectiveness) (skill|worksheet|handout|practice)\b/i,
    /\bmindfulness worksheet\b/i,
    /\b(teach|show|give|walk me through|help me with) (?:me )?(?:a |some )?coping skill/i,
    /\b(help me (make|write|build)|make me) (a |my )?safety plan\b/i
  ];
  const EXITS = [/\b(exit|leave|stop|end|turn off) professor( mode)?\b/i,/\b(back to normal|normal chat|regular onyx|no more professor)\b/i];
  const SAFETY = /\b(i (?:am going to|plan to|want to|might|will) (?:kill|hurt) myself|i want to die|suicide plan|i am in immediate danger|i (?:just )?overdosed|i cannot keep myself safe)\b/i;
  const CARE_WORDS = {feed:'food',water:'water',treat:'treat',pet:'pet',scratch:'scratch',brush:'brush',play:'play',blink:'slow blink',blanket:'blanket',fan:'fan',pillow:'pillow',tuck:'tuck in'};
  const CARE_DESCRIPTIONS={
    feed:'Food picnic requires a real hunger reading. Onyx must approach, sniff, eat, and leave before the picnic folds away.',
    water:'Fresh water appears only for independently measured thirst. He must lap from the bowl; feeding cannot replenish hydration.',
    treat:'A separate small treat interaction, with cooldown. It must not summon the main hunger picnic.',
    pet:'Direct touch will need Onyx’s actual hit area and affectionate animation, such as leaning, purring, or blinking.',
    scratch:'An actual physical scratch/purr response will be needed, not a pretend meter change.',
    brush:'A temporary brush station requires an animation showing him accepting or declining grooming.',
    play:'He may choose brief toy play when interested, never forced frantic activity. The toy leaves after play.',
    blink:'Slow blink is a brief genuine cat animation, no permanent scenery or pressure to reciprocate.',
    blanket:'A resting mat or blanket appears when appropriate for actual comfort needs, then withdraws.',
    fan:'A breeze or shade scene is offered only when comfortable and needed, not automatically.',
    pillow:'A small pillow appears only during an actual rest interaction and persists until rest ends.',
    tuck:'The pixel tent castle unfolds only when Onyx is genuinely sleepy, and never closes while he is inside.'
  };
  const DEFAULT_PREFS = {largeTargets:false,contrast:false,reducedMotion:false,oneHanded:false,labels:true,noTimers:true,noShake:true,quietNudges:true,subbar:true,persistChat:false,muteMeadowMoments:false,muteGrounding:false,muteMood:false,muteWeatherEffects:false,muteDiscoveryCaptions:false,lowStimulation:false};
  let profile='guest', profileLabel='Local guest', adapter=null;
  let prefs={...DEFAULT_PREFS};
  let goals=[], journals=[], transcript=[], state='onyx_snuggly', professor=false, listeningOnly=false;
  let volume=1, lastUnmuted=1, paused=false, panelLocked=false, lastActivePanel=null, lastAction=null;
  let mood=null, readings={}, wallet={copper:0,silver:0,gold:0,platinum:0};
  let awaitingGoal=false, storageOk=true, actionId=0, chatPending=false;
  let focusRemaining=0, focusActive=false, focusLastTick=0, focusTimer=null;
  let bubblePosition={x:0.88,y:0.85}; // normalized free-movement coordinates per profile

  const getKey = () => `onyx-adventures-shell:v1:${profile}`;
  const legacyKey = () => `happy-home-shell:v1:${profile}`;
  const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
  const setText=(selector,text)=>{const el=$(selector);if(el)el.textContent=String(text);};
  const notify=text=>setText('#gameStatus',text);
  function broadcast(type,detail={}){
    window.dispatchEvent(new CustomEvent('onyx-adventures:shell-event',{detail:{type,profile,...detail}}));
  }
  function safeLoad(){
    try{
      const item=localStorage.getItem(getKey()) ?? localStorage.getItem(legacyKey());
      return item?JSON.parse(item):{};
    }catch(_){storageOk=false;return {};}
  }
  function save(){
    const obj={prefs,goals,journals,mood,paused,volume,positions:{},professorBubblePosition:{...bubblePosition}};
    if(prefs.persistChat)obj.transcript=transcript.slice(-100);
    for(const [name,p] of panels){
      if(p.dataset.positioned==='true')obj.positions[name]={left:p.style.left,top:p.style.top,width:p.style.width,height:p.style.height};
    }
    try{localStorage.setItem(getKey(),JSON.stringify(obj));storageOk=true;}
    catch(_){storageOk=false;setText('#adventureSettingsStatus','Local storage unavailable. Export changes before closing.');}
  }
  function restore(){
    const obj=safeLoad();
    prefs={...DEFAULT_PREFS,...(obj.prefs||{})};
    goals=Array.isArray(obj.goals)?obj.goals.filter(x=>x&&typeof x.text==='string').slice(-200).map(x=>({...x,result:x.result||(x.done?'done':'open')})):[];
    journals=Array.isArray(obj.journals)?obj.journals.filter(x=>x&&typeof x.text==='string').slice(-200):[];
    transcript=prefs.persistChat&&Array.isArray(obj.transcript)?obj.transcript.filter(x=>x&&typeof x.text==='string').slice(-100):[];
    mood=typeof obj.mood==='string'?obj.mood:null;
    paused=!!obj.paused;
    volume=[0,.35,1].includes(Number(obj.volume))?Number(obj.volume):1;
    if(volume)lastUnmuted=volume;
    for(const [name,pos] of Object.entries(obj.positions||{})){
      const p=panels.get(name);
      if(!p||!pos||typeof pos!=='object')continue;
      for(const key of ['left','top','width','height']) if(/^\d+(\.\d+)?px$/.test(pos[key]||''))p.style[key]=pos[key];
      p.dataset.positioned='true';
    }
    const storedBubble=obj.professorBubblePosition;
    bubblePosition=(storedBubble&&Number.isFinite(storedBubble.x)&&Number.isFinite(storedBubble.y))
      ?{x:clamp(storedBubble.x,0,1),y:clamp(storedBubble.y,0,1)}:{x:0.88,y:0.85};
    renderBubblePosition();
    applyPreferences(false);
    setPause(paused,false);
    updateAudio(false);
    renderGoals();renderJournal();renderMessages();renderMood();updateStatus();
  }
  function setProfile(id,label){
    if(!/^[\w-]{1,100}$/.test(String(id||'')))throw new Error('Profile ID must contain only letters, digits, underscore or hyphen.');
    save();
    profile=String(id);profileLabel=String(label||id).slice(0,120);
    // No cross-profile transcript, professor posture, or pet status can follow a switch.
    goals=[];journals=[];transcript=[];professor=false;listeningOnly=false;mood=null;readings={};
    for(const [name,p] of panels){closePanel(name);p.style.left='';p.style.top='';p.style.width='';p.style.height='';delete p.dataset.positioned;}
    bubblePosition={x:0.88,y:0.85};renderBubblePosition();
    wallet={copper:0,silver:0,gold:0,platinum:0};setBalances(wallet);setState('onyx_snuggly');
    setProfessor(false,false);restore();
    setText('#profileReadout',`Profile: ${profileLabel}`);
    broadcast('profile',{id:profile});
  }
  function applyPreferences(persist=true){
    const classes={largeTargets:'accessible-large',contrast:'accessible-contrast',reducedMotion:'accessible-motionless',oneHanded:'onehand',labels:'labels-hidden',subbar:'hud-hidden'};
    for(const [key,cssClass] of Object.entries(classes))root.classList.toggle(cssClass,key==='labels'||key==='subbar'?!prefs[key]:!!prefs[key]);
    $$('input[data-preference]').forEach(el=>el.checked=!!prefs[el.dataset.preference]);
    $('#meadowMomentsSection').hidden=!!prefs.muteMeadowMoments;
    $('#moodButtons').closest('.section').hidden=!!prefs.muteMood;
    const grounding=$('[data-chat-prompt="Can you guide me through an optional, gentle grounding exercise?"]');
    if(grounding)grounding.closest('.section').hidden=!!prefs.muteGrounding;
    $('.scene-location').classList.toggle('caption-minimal',!!prefs.muteDiscoveryCaptions);
    if(prefs.muteWeatherEffects && $('#worldWeather').value!=='clear'){$('#worldWeather').value='clear';$('#worldWeather').dispatchEvent(new Event('change',{bubbles:true}));}
    window.dispatchEvent(new CustomEvent('onyx-adventures:low-stimulation',{detail:{enabled:!!prefs.lowStimulation}}));
    if(persist)save();
    try{adapter?.setAccessibility?.({...prefs});}catch(e){console.warn('Accessibility adapter:',e);}
    broadcast('accessibility',{preferences:{...prefs}});
  }
  $$('input[data-preference]').forEach(el=>el.addEventListener('change',()=>{
    prefs[el.dataset.preference]=el.checked;applyPreferences();
    if(!prefs.persistChat){try{save();}catch(_){} }
  }));

  function updateAudio(persist=true){
    $$('.hud-sound').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.volume)===volume)));
    viewport.querySelectorAll('audio,video').forEach(x=>{try{x.volume=volume;x.muted=volume===0;}catch(_){}});
    try{adapter?.setVolume?.(volume);}catch(e){console.warn('Audio adapter:',e);}
    broadcast('volume',{volume});
    if(persist)save();
  }
  function setVolume(next){const n=Number(next);volume=[0,.35,1].includes(n)?n:1;if(volume)lastUnmuted=volume;updateAudio();notify(volume===0?'Audio muted':`Audio ${volume===1?'full':'low'}`);}
  $$('.hud-sound').forEach(el=>el.addEventListener('click',()=>setVolume(el.dataset.volume)));
  $('#cycleVolume').addEventListener('click',()=>setVolume(volume===0?.35:volume===.35?1:0));
  function setPause(next,persist=true){
    paused=!!next;$('#gamePause').textContent=paused?'▶':'Ⅱ';
    $('#gamePause').setAttribute('aria-pressed',String(paused));
    $('#gamePause').setAttribute('aria-label',paused?'Resume optional activities':'Pause nonessential Onyx’s Adventures activities');
    root.classList.toggle('simulation-paused',paused);
    setText('#statusQuiet',paused?'On':'Off');
    const q=$('#quietMeadowToggle');q.setAttribute('aria-pressed',String(paused));q.textContent=paused?'Quiet Meadow enabled':'Enable Quiet Meadow';
    try{adapter?.setPaused?.(paused,{source:'shell',nonessentialOnly:true});}catch(e){console.warn('Pause adapter:',e);}
    broadcast('pause',{paused,nonessentialOnly:true});
    notify(paused?'Rest enabled. Chat and urgent support remain available.':'Optional activities resumed.');
    if(persist)save();
  }
  $('#gamePause').addEventListener('click',()=>setPause(!paused));
  $('#quietMeadowToggle').addEventListener('click',()=>setPause(!paused));
  $('#quietMeadowResume').addEventListener('click',()=>setPause(false));
  $('#focusPanels').addEventListener('click',()=>{
    let hidden=0;
    for(const [name,p] of panels) if(p.classList.contains('is-open')&&!p.classList.contains('is-pinned')){closePanel(name);hidden++;}
    $('#focusPanels').setAttribute('aria-pressed',String(hidden>0));
    notify(hidden?`${hidden} unpinned panel(s) closed`:'No unpinned panels open');
  });
  $('#lockPanels').addEventListener('click',()=>{
    panelLocked=!panelLocked;root.classList.toggle('panels-locked',panelLocked);
    $('#lockPanels').setAttribute('aria-pressed',String(panelLocked));
    notify(panelLocked?'Panel layout locked':'Panel layout unlocked');
  });
  function syncPanelButtons(){
    $$('.hud-tab').forEach(b=>b.setAttribute('aria-expanded',String(panels.get(b.dataset.panel)?.classList.contains('is-open'))));
    $$('.game-slot').forEach(b=>{
      const active=panels.get(shortcutMap[b.dataset.slot])?.classList.contains('is-open');
      b.setAttribute('aria-pressed',String(!!active));b.classList.toggle('is-selected',!!active);
    });
  }
  function openPanel(name,{toggle=false}={}){
    const p=panels.get(name);if(!p)return false;
    if(toggle&&p.classList.contains('is-open'))return closePanel(name);
    for(const [n,other] of panels)if(n!==name&&!other.classList.contains('is-pinned'))closePanel(n);
    p.hidden=false;p.classList.add('is-open');p.style.zIndex=String(++actionId+50);lastActivePanel=name;
    syncPanelButtons();broadcast('panel',{name,open:true});return true;
  }
  function closePanel(name){
    const p=panels.get(name);if(!p)return false;
    p.hidden=true;p.classList.remove('is-open');syncPanelButtons();broadcast('panel',{name,open:false});return true;
  }
  $$('[data-panel].hud-tab').forEach(btn=>btn.addEventListener('click',()=>openPanel(btn.dataset.panel,{toggle:true})));
  $$('.game-slot').forEach(btn=>btn.addEventListener('click',()=>openPanel(shortcutMap[btn.dataset.slot],{toggle:true})));
  $$('[data-open-panel]').forEach(btn=>btn.addEventListener('click',()=>openPanel(btn.dataset.openPanel)));
  $$('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closePanel(btn.dataset.close)));
  $$('[data-pin]').forEach(btn=>btn.addEventListener('click',()=>{
    const p=panels.get(btn.dataset.pin);const on=!p.classList.contains('is-pinned');
    p.classList.toggle('is-pinned',on);btn.setAttribute('aria-pressed',String(on));notify(on?'Panel pinned':'Panel unpinned');
  }));
  // Drag and resize only the shell's windows, never the mounted room.
  function beginPointerMove(target,event,resize=false){
    if(panelLocked||event.button!==0||event.target.closest('button,input,textarea,select,a'))return;
    const p=target.closest('.hud-panel');if(!p)return;
    const rect=p.getBoundingClientRect(), x=event.clientX,y=event.clientY;
    let initial={left:rect.left,top:rect.top,width:rect.width,height:rect.height};
    event.preventDefault();target.setPointerCapture?.(event.pointerId);
    const update=e=>{
      const dx=e.clientX-x,dy=e.clientY-y;
      if(resize){p.style.width=`${Math.round(clamp(initial.width+dx,Math.min(270,window.innerWidth-14),window.innerWidth-14))}px`;p.style.height=`${Math.round(clamp(initial.height+dy,220,window.innerHeight-20))}px`;}
      else{p.style.left=`${Math.round(clamp(initial.left+dx,0,Math.max(0,window.innerWidth-65)))}px`;p.style.top=`${Math.round(clamp(initial.top+dy,0,Math.max(0,window.innerHeight-52)))}px`;}
      p.dataset.positioned='true';
    };
    const finish=()=>{target.removeEventListener('pointermove',update);target.removeEventListener('pointerup',finish);target.removeEventListener('pointercancel',finish);save();};
    target.addEventListener('pointermove',update);target.addEventListener('pointerup',finish);target.addEventListener('pointercancel',finish);
  }
  $$('[data-drag-handle]').forEach(el=>el.addEventListener('pointerdown',e=>beginPointerMove(el,e,false)));
  $$('.panel-resize-handle').forEach(el=>el.addEventListener('pointerdown',e=>beginPointerMove(el,e,true)));
  async function fullscreen(){
    try{
      if(document.fullscreenElement)await document.exitFullscreen();
      else if(root.requestFullscreen)await root.requestFullscreen();
      else throw new Error('Fullscreen unsupported by browser');
      setText('#fullscreenReadout',document.fullscreenElement?'Fullscreen active':'Windowed mode active');
    }catch(e){setText('#fullscreenReadout',`Fullscreen unavailable: ${e.message}`);}
  }
  $$('[data-fullscreen]').forEach(b=>b.addEventListener('click',fullscreen));
  document.addEventListener('keydown',event=>{
    if(document.documentElement.dataset.runtimeMode!=='slow-game')return;
    const typing=event.target.matches('input,textarea,select,[contenteditable="true"]');
    if(event.key==='Escape'){
      if(!$('#onyxBoosterMenu').hidden)toggleProfessorMenu(false);
      else if(lastActivePanel)closePanel(lastActivePanel);
      return;
    }
    if(typing)return;
    if(/^[1-5]$/.test(event.key)&&!event.repeat){event.preventDefault();openPanel(shortcutMap[event.key],{toggle:true});}
    if(event.code==='KeyP'&&!event.repeat){event.preventDefault();setPause(!paused);}
    if(event.code==='KeyF'&&!event.repeat){event.preventDefault();fullscreen();}
  });

  function setState(next,{source='shell'}={}){
    if(!VALID_STATES.has(next))return false;
    state=next;
    setText('#onyxMood',adapter?.sceneOnly?`Guided chat: ${next} (not live pet state)`:`Conversation posture: ${next}`);
    broadcast('state',{state,source});return true;
  }
  function setProfessor(next,announce=true){
    professor=!!next;
    $('#onyxBoosterDock').hidden=!professor;
    if(professor)renderBubblePosition();
    if(!professor)toggleProfessorMenu(false);
    $('#chatModeLabel').textContent=professor?'Professor Onyx':'Normal chat';
    $('#chatModeLabel').classList.toggle('professor-mode',professor);
    setText('#chatTitle',professor?'Virtual & Health · Professor Onyx':'Virtual & Health · Onyx');
    if(professor)setState('onyx_advising_professor');
    else if(state==='onyx_advising_professor')setState('onyx_snuggly');
    if(announce)broadcast('professor',{active:professor,source:'chat-phrase'});
    // A professor bubble never becomes a feeding, gaming or booster control.
  }
  // Free-moving bubble: absolute screen coordinates derived from normalized position.
  // Position never snaps to a corner. Keep the entire bubble on screen and remember it
  // across reloads, viewport changes, and profile switching.
  const dock=$('#onyxBoosterDock'),bubble=$('#onyxBoosterBubble'),profMenu=$('#onyxBoosterMenu');
  const screenArea=()=>({
    width:Math.max(0,window.innerWidth-dock.offsetWidth),
    height:Math.max(0,window.innerHeight-dock.offsetHeight)
  });
  function renderBubblePosition(){
    const range=screenArea();
    dock.style.left=`${Math.round(bubblePosition.x*range.width)}px`;
    dock.style.top=`${Math.round(bubblePosition.y*range.height)}px`;
    if(!profMenu.hidden)placeProfessorMenu();
  }
  function moveBubbleTo(left,top,persist=false){
    const {width,height}=screenArea();
    bubblePosition={x:width>0?clamp(left,0,width)/width:0,y:height>0?clamp(top,0,height)/height:0};
    renderBubblePosition();
    if(persist){save();broadcast('professor-position',{position:{...bubblePosition}});}
  }
  function placeProfessorMenu(){
    if(profMenu.hidden)return;
    const rect=dock.getBoundingClientRect();
    // Measure the visible menu in its actual current layout, then try all four sides.
    const width=profMenu.offsetWidth,height=profMenu.offsetHeight,gap=12,pad=8;
    const w=window.innerWidth,h=window.innerHeight;
    const proposed=[
      {x:rect.right+gap,y:rect.top,side:'right'},
      {x:rect.left-width-gap,y:rect.top,side:'left'},
      {x:rect.left,y:rect.bottom+gap,side:'below'},
      {x:rect.left,y:rect.top-height-gap,side:'above'}
    ];
    const visible=proposed.map((p,i)=>{
      const overflow=Math.max(0,pad-p.x)+Math.max(0,p.x+width-(w-pad))+
        Math.max(0,pad-p.y)+Math.max(0,p.y+height-(h-pad));
      const x=clamp(p.x,pad,Math.max(pad,w-width-pad));
      const y=clamp(p.y,pad,Math.max(pad,h-height-pad));
      // When there is little horizontal room, placing the menu underneath or
      // above is better than letting it cover the bubble and block its button.
      const overlapX=Math.max(0,Math.min(x+width,rect.right)-Math.max(x,rect.left));
      const overlapY=Math.max(0,Math.min(y+height,rect.bottom)-Math.max(y,rect.top));
      return {...p,x,y,overlap:overlapX*overlapY,overflow,priority:i};
    }).sort((a,b)=>a.overlap-b.overlap||a.overflow-b.overflow||a.priority-b.priority);
    const best=visible[0];
    profMenu.style.left=`${Math.round(best.x)}px`;
    profMenu.style.top=`${Math.round(best.y)}px`;
  }
  function toggleProfessorMenu(on){
    const next=typeof on==='boolean'?on:profMenu.hidden;
    profMenu.hidden=!next;
    bubble.setAttribute('aria-expanded',String(next));
    if(next)placeProfessorMenu();
  }
  // Pointer capture supports dragging with mouse, pen, and touch. A drag does NOT
  // also click the tools button when the pointer is released.
  let suppressBubbleClick=false;
  let bubbleDrag=null;
  bubble.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    const rect=dock.getBoundingClientRect();
    bubbleDrag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,moved:false};
    bubble.setPointerCapture(event.pointerId);
  });
  bubble.addEventListener('pointermove',event=>{
    if(!bubbleDrag||event.pointerId!==bubbleDrag.id)return;
    const dx=event.clientX-bubbleDrag.x,dy=event.clientY-bubbleDrag.y;
    if(!bubbleDrag.moved&&Math.hypot(dx,dy)<5)return;
    bubbleDrag.moved=true;
    dock.classList.add('is-dragging');
    moveBubbleTo(bubbleDrag.left+dx,bubbleDrag.top+dy);
  });
  function finishBubbleDrag(event){
    if(!bubbleDrag||event.pointerId!==bubbleDrag.id)return;
    const moved=bubbleDrag.moved;
    bubbleDrag=null;dock.classList.remove('is-dragging');
    if(moved){suppressBubbleClick=true;save();broadcast('professor-position',{position:{...bubblePosition}});}
    if(bubble.hasPointerCapture(event.pointerId))bubble.releasePointerCapture(event.pointerId);
  }
  bubble.addEventListener('pointerup',finishBubbleDrag);
  bubble.addEventListener('pointercancel',finishBubbleDrag);
  bubble.addEventListener('lostpointercapture',event=>{if(bubbleDrag&&event.pointerId===bubbleDrag.id)finishBubbleDrag(event);});
  bubble.addEventListener('click',event=>{
    if(suppressBubbleClick){suppressBubbleClick=false;event.preventDefault();return;}
    toggleProfessorMenu();
  });
  bubble.addEventListener('keydown',event=>{
    const step=event.shiftKey?40:12;
    const {width,height}=screenArea();
    const x=bubblePosition.x*width,y=bubblePosition.y*height;
    if(event.key==='ArrowLeft'){event.preventDefault();moveBubbleTo(x-step,y,true);}
    if(event.key==='ArrowRight'){event.preventDefault();moveBubbleTo(x+step,y,true);}
    if(event.key==='ArrowUp'){event.preventDefault();moveBubbleTo(x,y-step,true);}
    if(event.key==='ArrowDown'){event.preventDefault();moveBubbleTo(x,y+step,true);}
  });
  window.addEventListener('resize',renderBubblePosition);
  $('#onyxBoosterClose').addEventListener('click',()=>toggleProfessorMenu(false));
  $$('[data-professor-action]').forEach(b=>b.addEventListener('click',()=>{
    const cmd=b.dataset.professorAction;toggleProfessorMenu(false);openPanel('chat');
    if(cmd==='exit'){handleUserMessage('Back to normal');return;}
    if(cmd==='talk'){$('#chatInput').focus();return;}
    handleUserMessage(cmd==='worksheet'?'Professor Onyx, please give me a DBT worksheet':'Professor Onyx, show me a distress tolerance handout');
  }));

  function updateStatus(){
    setText('#hostReadout',adapter?.sceneOnly?'Outdoor scenery is active; cats loading.':adapter?'Three cat WASM companions and outdoor runtime connected.':'Outdoor scene loading.');
    setText('#connectionReadout',adapter?.sceneOnly?'Outdoor world loaded; cat engines starting.':adapter?'Onyx, Callie and Harvey are exploring their shared world.':'Loading Onyx’s Adventures scenery…');
    setText('#chatRuntimeLabel',adapter?.replyToChat?'Connected Onyx AI chat':'Local guided chat · AI backend not connected');
    for(const [key,id] of Object.entries({fullness:'#statusFullness',comfort:'#statusComfort',energy:'#statusEnergy',affection:'#statusAffection',hydration:'#statusHydration'})){
      const value=readings[key];setText(id,Number.isFinite(value)?`${clamp(Math.round(value),0,100)}%`:'—');
    }
    setText('#profileReadout',`Profile: ${profileLabel}`);
    setText('#statusActivity',readings.primaryBehavior||'Not connected');
    setText('#statusVisitors',readings.visitors||'Not installed');
    setText('#statusQuiet',paused?'On':'Off');
  }
  function setPetReadings(obj={}){
    for(const key of ['fullness','comfort','energy','affection','hydration']){
      const n=Number(obj[key]);if(obj[key]!=null&&Number.isFinite(n))readings[key]=clamp(n,0,100);
    }
    if(typeof obj.primaryBehavior==='string')readings.primaryBehavior=obj.primaryBehavior.slice(0,50);
    if(typeof obj.visitors==='string')readings.visitors=obj.visitors.slice(0,50);
    if(obj.state)setState(obj.state,{source:'host'});
    updateStatus();broadcast('pet-readings',{readings:{...readings}});
  }
  function setBalances(next={}){
    const total = ['copper','silver','gold','platinum'].reduce((sum,key,i)=>{
      const num=Number(next[key]??wallet[key]??0);
      return sum+Math.max(0,Math.floor(Number.isFinite(num)?num:0))*[1,10,100,1000][i];
    },0);
    wallet={copper:total%10,silver:Math.floor(total/10)%10,gold:Math.floor(total/100)%10,platinum:Math.floor(total/1000)};
    for(const [key,value] of Object.entries(wallet))setText(`.resource-counter[data-resource="${key}"] span`,value);
    broadcast('wallet',{wallet:{...wallet}});return {...wallet};
  }
  function showCareResult(message){lastAction=message;setText('#careResponse',message);setText('#lastActionReadout',message);notify(message);}
  async function care(action){
    if(!(action in CARE_WORDS))return;
    const name=CARE_WORDS[action];const detail={action,requestId:`shell-${Date.now()}-${++actionId}`};
    broadcast('care-request',detail);
    if(!adapter?.onCare){showCareResult(`${name}: ${CARE_DESCRIPTIONS[action]} Not installed yet; no cat or meter was changed.`);return;}
    try{
      const result=await adapter.onCare({...detail,profile});
      if(result?.state)setPetReadings(result);
      showCareResult(result?.message||`${name}: Onyx’s Adventures received this action.`);
      if(result?.success===true&&!['onyx_caring','onyx_listening'].includes(state)&&!professor)setState('onyx_purring');
    }catch(e){showCareResult(`${name} could not be completed: ${e.message}`);}
  }
  $$('[data-care]').forEach(btn=>btn.addEventListener('click',()=>care(btn.dataset.care)));

  function renderMood(){setText('#moodReadout',mood&&mood!=='skip'?`Your chosen check-in: ${mood}. No interpretation or score is applied.`:'No check-in required.');
    $$('[data-mood]').forEach(b=>b.setAttribute('aria-pressed',String(mood===b.dataset.mood)));}
  $$('[data-mood]').forEach(btn=>btn.addEventListener('click',()=>{
    const choice=btn.dataset.mood;mood=choice==='skip'?null:choice;renderMood();save();broadcast('check-in',{mood:mood||'skipped',userReported:true});
    if(choice==='skip'){setText('#moodReadout','Skipped. You owe no explanation.');return;}
    if(['sad','angry','exhausted'].includes(mood))setState('onyx_listening');
    addMessage('assistant',`You chose ${mood}. We can simply sit with that, or you can tell me what you need. No goal or worksheet is required.`);
  }));
  function addGoal(text,options={}){
    const value=String(text||'').trim().slice(0,180);if(!value)return false;
    const allowed=['Basic care','Physical comfort','Emotional care','Environment','Connection','Enjoyment'];
    const area=allowed.includes(options.area)?options.area:'Basic care';
    goals.push({id:`g${Date.now()}_${++actionId}`,text:value,smallest:String(options.smallest||'').trim().slice(0,180),area,cadence:['anytime','today','weekly'].includes(options.cadence)?options.cadence:'anytime',result:'open',created:new Date().toISOString()});
    save();renderGoals();broadcast('goal-created',{goal:value,area});return true;
  }
  $('#goalForm').addEventListener('submit',e=>{e.preventDefault();if(addGoal($('#goalInput').value,{area:$('#goalArea').value,smallest:$('#goalSmallest').value,cadence:$('#goalCadence').value})){$('#goalInput').value='';$('#goalSmallest').value='';setText('#goalFeedback','Gentle goal saved. Changing it or stopping is allowed.');}});
  $('#addRestGoal').addEventListener('click',()=>addGoal('Intentional rest — no productivity required',{area:'Physical comfort',smallest:'Pause for a moment'}));
  $$('[data-meadow-goal]').forEach(btn=>btn.addEventListener('click',()=>{addGoal(btn.dataset.meadowGoal,{area:btn.dataset.meadowGoal.includes('water')?'Basic care':'Enjoyment'});setText('#goalFeedback','Optional meadow moment added. Never required.');}));
  $('#clearCompletedGoals').addEventListener('click',()=>{goals=goals.filter(x=>!(x.result==='done'||x.result==='attempted'||x.done));renderGoals();save();setText('#goalFeedback','Finished and attempted goals cleared. Paused and open ones remain.');});
  function renderGoals(){
    const el=$('#goalList');el.replaceChildren();
    if(!goals.length){const li=document.createElement('li');li.textContent='No goals required. Add one whenever you like.';el.append(li);return;}
    for(const g of goals){
      const li=document.createElement('li');li.className='enhanced-goal'+((g.result==='done'||g.done)?' done':'');
      const content=document.createElement('div');content.className='goal-description';
      const label=document.createElement('strong');label.textContent=g.text;content.append(label);
      const meta=document.createElement('small');meta.textContent=`${g.area||'Basic care'} · ${g.cadence==='weekly'?'Weekly intention':g.cadence==='today'?'Today':'Anytime'}`;content.append(meta);
      if(g.smallest){const small=document.createElement('small');small.textContent='Smallest version: '+g.smallest;content.append(small);}
      const controls=document.createElement('div');controls.className='goal-actions';
      const state=document.createElement('select');state.setAttribute('aria-label',`Progress for ${g.text}`);
      const current=g.result||(g.done?'done':'open');
      for(const [value,text] of [['open','Open'],['done','Done'],['partly','Partly done'],['attempted','Attempted'],['paused','Intentionally paused']]){
        const opt=document.createElement('option');opt.value=value;opt.textContent=text;state.append(opt);
      }
      state.value=current;
      state.addEventListener('change',()=>{g.result=state.value;g.done=state.value==='done';save();renderGoals();broadcast('goal-updated',{id:g.id,result:g.result,userConfirmed:true});setText('#goalFeedback',`Recorded: ${state.options[state.selectedIndex]?.text||g.result}. Every outcome counts.`);});
      const smallest=document.createElement('button');smallest.type='button';smallest.textContent='Make smaller';smallest.setAttribute('aria-label',`Use the smallest version of ${g.text}`);
      smallest.disabled=!g.smallest;smallest.addEventListener('click',()=>{const before=g.text;g.text=g.smallest;g.smallest=before;renderGoals();save();setText('#goalFeedback','Goal reduced to the smaller version.');});
      const del=document.createElement('button');del.type='button';del.textContent='×';del.setAttribute('aria-label',`Delete ${g.text}`);del.addEventListener('click',()=>{goals=goals.filter(x=>x.id!==g.id);renderGoals();save();});
      controls.append(state,smallest,del);li.append(content,controls);el.append(li);
    }
  }
  function focusUpdate(){
    if(!focusActive){setText('#focusReadout',focusRemaining?`Paused at ${formatFocus(focusRemaining)} · no penalty`:'No timer running.');return;}
    setText('#focusReadout',`Quiet focus or rest: ${formatFocus(focusRemaining)} left`);
  }
  function formatFocus(seconds){const value=Math.ceil(Math.max(0,seconds));return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`;}
  function focusTick(){if(!focusActive)return;if(paused||document.hidden){focusLastTick=performance.now();return;}const now=performance.now();const dt=Math.min(2,(now-focusLastTick)/1000);focusLastTick=now;focusRemaining=Math.max(0,focusRemaining-dt);focusUpdate();if(focusRemaining===0){focusActive=false;clearInterval(focusTimer);focusTimer=null;setText('#focusReadout','Focus interval complete. Rest, stop, or record your own progress; nothing was assumed.');notify('Your optional focus interval ended.');}}
  $('#focusStart').addEventListener('click',()=>{if(prefs.noTimers){setText('#focusReadout','Timed tasks are muted in Accessibility. Uncheck “No timed tasks / prompts” to opt into a timer.');return;}if(!focusRemaining)focusRemaining=Math.min(180,Math.max(1,Number($('#focusMinutes').value)||2))*60;focusActive=true;focusLastTick=performance.now();if(!focusTimer)focusTimer=setInterval(focusTick,250);focusUpdate();});
  $('#focusPause').addEventListener('click',()=>{focusActive=false;focusUpdate();});
  $('#focusStop').addEventListener('click',()=>{focusActive=false;focusRemaining=0;clearInterval(focusTimer);focusTimer=null;focusUpdate();});
  function currentMeadowObservation(){
    const label=($('#worldOverview')?.textContent||'').split('·')[0].trim()||'the meadow';
    const nearby=($('#worldOverview')?.textContent||'').match(/(\d+) birds nearby/i);
    return `I took a moment to view ${label}${nearby?` (${nearby[1]} visible bird agents nearby)`:''}. No Onyx observation was inferred.`;
  }
  $('#observeMeadow').addEventListener('click',()=>setText('#meadowMomentReadout',currentMeadowObservation()));
  function captureSceneToJournal(){const message=currentMeadowObservation();journals.unshift({id:`j${Date.now()}_${++actionId}`,text:message,kind:'meadow',date:new Date().toISOString()});save();renderJournal();setText('#journalMeadowReadout','Saved a user-initiated scenery observation locally.');setText('#meadowMomentReadout','Observation saved to your private local journal.');broadcast('journal-created',{localOnly:true,kind:'meadow'});}
  $('#saveMeadowMoment').addEventListener('click',captureSceneToJournal);
  $('#journalCaptureScene').addEventListener('click',captureSceneToJournal);
  $('#journalForm').addEventListener('submit',e=>{
    e.preventDefault();const value=$('#journalInput').value.trim();
    if(!value){setText('#journalStatus','Write as much or as little as you wish before saving.');return;}
    journals.unshift({id:`j${Date.now()}_${++actionId}`,text:value,date:new Date().toISOString()});
    $('#journalInput').value='';save();renderJournal();setText('#journalStatus',storageOk?'Note saved locally to this browser profile.':'Note kept only while this page is open; export it to keep a copy.');
    broadcast('journal-created',{localOnly:true});
  });
  function renderJournal(){
    const el=$('#journalList');el.replaceChildren();
    if(!journals.length){const p=document.createElement('p');p.textContent='No notes yet.';el.append(p);return;}
    for(const note of journals){
      const item=document.createElement('article');item.className='journal-item';
      const date=document.createElement('small');date.textContent=new Date(note.date).toLocaleString();
      const content=document.createElement('p');content.textContent=note.text;
      const del=document.createElement('button');del.textContent='Delete note';del.type='button';del.addEventListener('click',()=>{
        if(!confirm('Delete this local note?'))return;journals=journals.filter(x=>x.id!==note.id);save();renderJournal();
      });item.append(date,content,del);el.append(item);
    }
  }
  function download(filename,obj){
    const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  $('#exportJournal').addEventListener('click',()=>download('onyx-adventures-journal.json',{profile,journals}));
  $('#exportShellData').addEventListener('click',()=>download('onyx-adventures-shell-data.json',{version:2,profile,prefs,goals,journals,mood,transcript: prefs.persistChat?transcript:[]}));
  $('#clearShellData').addEventListener('click',()=>{
    if(!confirm('Clear this profile’s locally saved goals, notes, preferences and chat transcript?'))return;
    try{localStorage.removeItem(getKey());}catch(_){}
    prefs={...DEFAULT_PREFS};goals=[];journals=[];mood=null;transcript=[];professor=false;listeningOnly=false;
    setProfessor(false);applyPreferences(false);renderGoals();renderJournal();renderMood();renderMessages();
    setText('#adventureSettingsStatus','Local shell data cleared for this profile.');
  });

  // Compact conversational surface: safe guided local actions, optional real AI adapter.
  function addMessage(role,text,saveChange=true){
    const record={role:role==='user'?'user':'assistant',text:String(text),time:new Date().toISOString()};
    transcript.push(record);if(transcript.length>250)transcript=transcript.slice(-250);
    const div=document.createElement('div');div.className=`chat-line ${record.role}`;
    const label=document.createElement('strong');label.textContent=record.role==='user'?'You':'Onyx';
    const copy=document.createElement('span');copy.textContent=record.text;
    div.append(label,copy);$('#chatLog').append(div);$('#chatLog').scrollTop=$('#chatLog').scrollHeight;
    if(saveChange&&prefs.persistChat)save();
  }
  function renderMessages(){
    $('#chatLog').replaceChildren();const copy=[...transcript];transcript=[];
    for(const msg of copy)addMessage(msg.role,msg.text,false);
    if(!copy.length)addMessage('assistant','The old man is here. You can talk, check in, ask me to listen, or simply rest. No assignment required.',false);
  }
  function displayWorksheet(){
    const el=$('#worksheetArea');el.hidden=false;el.replaceChildren();
    const title=document.createElement('strong');title.textContent='Original DBT-informed worksheet · Pause, notice, choose';
    const intro=document.createElement('p');intro.textContent='Optional reflection, not an assessment or a diagnosis. Skip any field.';
    const form=document.createElement('form');form.className='worksheet-fields';form.id='worksheetForm';
    const qs=[['Situation','What happened, in a sentence?'],['Feelings / body','What are you noticing?'],['Next kind action','What is one small, safe next step?']];
    for(const [id,question] of qs){
      const label=document.createElement('label');label.textContent=question;
      const area=document.createElement('textarea');area.rows=2;area.maxLength=2000;area.name=id;label.append(area);form.append(label);
    }
    const actions=document.createElement('div');actions.className='worksheet-actions';
    const exportBtn=document.createElement('button');exportBtn.className='btn';exportBtn.type='submit';exportBtn.textContent='Export worksheet';
    const closeBtn=document.createElement('button');closeBtn.className='btn';closeBtn.type='button';closeBtn.textContent='Close';closeBtn.addEventListener('click',()=>el.hidden=true);
    actions.append(exportBtn,closeBtn);form.append(actions);el.append(title,intro,form);
    form.addEventListener('submit',e=>{e.preventDefault();const answers={};for(const field of form.elements)if(field.name)answers[field.name]=field.value;download('onyx-dbt-reflection.json',{type:'DBT-informed personal reflection',date:new Date().toISOString(),answers});addMessage('assistant','Worksheet exported. No entry is sent to a provider or stored in the chat automatically.');});
  }
  function guidedResponse(message){
    const text=message.toLowerCase().trim();
    if(SAFETY.test(text)){
      setState('onyx_caring');
      return 'I am taking this seriously. If you may act on this now or are in immediate danger, call your local emergency number. In the U.S. you can call or text 988 for immediate crisis support. If possible, move away from anything you might use to hurt yourself and contact someone who can stay with you. This shell cannot monitor your safety.';
    }
    if(/\b(just listen|no advice|i need to vent|let me explain)\b/i.test(text)){
      listeningOnly=true;setState('onyx_listening');return 'I am listening. No worksheet, goal or fixing. Tell me what you need to say.';
    }
    if(/\b(advice please|you can advise|help me decide|okay, suggestions|suggestions now)\b/i.test(text))listeningOnly=false;
    if(listeningOnly){setState('onyx_listening');return 'I am here and following. Keep going whenever you are ready.';}
    if(/\b(worksheet|handout|dbt|distress tolerance|emotion regulation|coping skill|mindfulness)\b/i.test(text)&&professor){
      setState('onyx_advising_professor');
      if(/\bworksheet\b/i.test(text)){displayWorksheet();return 'Tiny Bowtie Professor reporting. I opened a short, optional reflection worksheet in this same chat. None of the fields are mandatory.';}
      if(/\bhandout|distress tolerance|coping skill\b/i.test(text))return 'DBT-informed mini handout — STOP:\nS: Stop what you are doing for a moment.\nT: Take a step back, if it is safe to do so.\nO: Observe thoughts, feelings, body sensations and the situation.\nP: Proceed mindfully, choosing a next step that helps rather than harms.\n\nYou can say “DBT worksheet” for a printable reflection. This is skill education, not medical treatment.';
      if(/\bmindfulness\b/i.test(text))return 'A short mindfulness practice: notice one thing you can see, one sound you can hear, and one physical point of contact. Return to what is here without arguing with the thoughts that arrive. Skipping it is okay.';
      return 'We can work with mindfulness, distress tolerance, emotion regulation or interpersonal effectiveness. Ask for a worksheet or skill handout, or describe the situation in your own words.';
    }
    if(awaitingGoal){awaitingGoal=false;if(addGoal(message))return 'A small goal is now on your list. It can be changed or skipped. No shame ledger in this household.';}
    if(/\b(tiny goal|small goal|one goal)\b/i.test(text)){awaitingGoal=true;return 'One little thing, or rest. Tell me the exact tiny action you want on your list.';}
    if(/\b(check in|how am i|mood)\b/i.test(text)){openPanel('goals');return 'We can check in without a score. Choose a mood button in Self-care, or just tell me how your day has been.';}
    if(/\b(journal|reflection note|write it down)\b/i.test(text)){openPanel('journal');return 'Journal opened. One word is enough; saving is your choice.';}
    if(/\b(rest|pause|low energy|tired)\b/i.test(text)){setState('onyx_snuggly');return 'Rest counts. I can nap while you do nothing at all. Want to pause nonessential activity? The pause button is above.';}
    if(/\b(grounding|breathing|overwhelmed|panicking)\b/i.test(text)){setState('onyx_caring');return 'We can keep it simple. Notice one object near you and how your body is supported right now. You do not have to change your breathing. If you want, describe just one thing that would make this minute gentler.';}
    if(/\b(feed|water|brush|pet onyx|blanket|tuck in)\b/i.test(text)){openPanel('care');return 'His Majesty’s comfort department is open. Real WASM cat sprites and their sleeping tents are present; each cat uses their real food and water sprite frames whenever hungry or thirsty.';}
    if(/\b(thank you|thanks|goodnight|good night)\b/i.test(text)){setState('onyx_snuggly');return 'A solemn little blink from the emperor. I am still here whenever you return.';}
    setState(professor?'onyx_advising_professor':'onyx_thoughtful');
    return professor?
      'I am here in Professor mode. For a tailored open-ended conversation, connect the approved Onyx AI backend. Locally I can guide a DBT skill handout, open a worksheet or help set a tiny goal.':
      'I hear you. This standalone shell has guided check-ins and self-care tools, but a full conversational reply needs the connected Onyx AI backend. You can ask me to listen, rest, journal or start a tiny goal.';
  }
  async function handleUserMessage(raw){
    const message=String(raw||'').trim();if(!message||chatPending)return;
    // The three-channel synchronized chat owns game input; the legacy local
    // Onyx-only reply system remains a fallback if the bridge is unavailable.
    if(window.OnyxCatChat?.sendFromGame)return window.OnyxCatChat.sendFromGame(message);
    if(message.length>8000){addMessage('assistant','Please send a shorter message.');return;}
    openPanel('chat');addMessage('user',message);
    const exit=EXITS.some(re=>re.test(message));
    const negative=/\b(?:don't|do not|not|never)\b.{0,30}\b(?:professor|dbt|worksheet)\b/i.test(message);
    const activate=!exit&&!negative&&ACTIVATORS.some(re=>re.test(message));
    if(exit){setProfessor(false);listeningOnly=false;$('#worksheetArea').hidden=true;addMessage('assistant','The professor hat is off. Back to regular Onyx and an ordinary chat.');return;}
    if(activate&&!professor){setProfessor(true);addMessage('assistant','Tiny Bowtie Professor is here. I can help with structured DBT-informed skills and optional worksheets. I am a support companion, not a licensed clinician.');}
    else if(!activate&&!professor){
      if(/\b(i feel|i'm feeling|i am scared|i'm sad|i feel awful)\b/i.test(message))setState('onyx_caring');
      else setState('onyx_listening');
    }
    if(adapter?.replyToChat){
      chatPending=true;$('#chatSend').disabled=true;
      try{
        const response=await adapter.replyToChat({text:message,mode:professor?'professor':'normal',profile,context:transcript.slice(-16).map(m=>({role:m.role,text:m.text})),listenOnly:listeningOnly});
        if(response?.state&&VALID_STATES.has(response.state))setState(response.state,{source:'chat-adapter'});
        if(typeof response==='string'&&response.trim())addMessage('assistant',response);
        else if(response&&typeof response.text==='string')addMessage('assistant',response.text);
        else addMessage('assistant','The connected Onyx backend did not return a reply.');
      }catch(e){addMessage('assistant',`The chat connection failed: ${e.message}. Local check-in tools remain available.`);}
      finally{chatPending=false;$('#chatSend').disabled=false;}
      return;
    }
    addMessage('assistant',guidedResponse(message));
  }
  $('#chatForm').addEventListener('submit',e=>{e.preventDefault();const msg=$('#chatInput').value;$('#chatInput').value='';handleUserMessage(msg);});
  $('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('#chatForm').requestSubmit();}});
  $$('[data-chat-prompt]').forEach(btn=>btn.addEventListener('click',()=>handleUserMessage(btn.dataset.chatPrompt)));
  $('#clearChat').addEventListener('click',()=>{
    if(!confirm('Clear the chat visible in this shell?'))return;
    transcript=[];listeningOnly=false;$('#worksheetArea').hidden=true;renderMessages();save();
  });
  $('#exportChat').addEventListener('click',()=>download('onyx-adventures-chat.json',{profile,transcript}));

  function connect(nextAdapter){
    if(!nextAdapter||typeof nextAdapter!=='object')throw new Error('connect(adapter) expects an object');
    adapter=nextAdapter;
    updateStatus();applyPreferences(false);updateAudio(false);setPause(paused,false);
    broadcast('connected',{capabilities:{care:!!adapter.onCare,chat:!!adapter.replyToChat,readings:!!adapter.getPetState}});
    if(adapter.getPetState){Promise.resolve().then(()=>adapter.getPetState()).then(x=>{if(x)setPetReadings(x);}).catch(e=>console.warn('Pet state:',e));}
    return api;
  }
  function disconnect(){adapter=null;updateStatus();broadcast('disconnected');}
  function mount(element){
    if(!(element instanceof Element))throw new Error('mount requires a DOM element');
    if(element===viewport||element.contains(viewport))throw new Error('Cannot mount the viewport inside itself');
    viewport.replaceChildren(element);viewport.setAttribute('aria-label','Connected Onyx’s Adventures outdoor display');
    broadcast('game-mounted');return element;
  }
  function getSnapshot(){return {profile,mode:professor?'professor':'normal',state,paused,volume,wallet:{...wallet},readings:{...readings},preferences:{...prefs},goalCount:goals.length,journalCount:journals.length,connected:!!adapter};}
  const api=Object.freeze({connect,disconnect,mount,openPanel,closePanel,setProfile,setPetReadings,setState,setBalances,setVolume,setPaused:setPause,care,sendChat:handleUserMessage,getSnapshot});
  window.onyxAdventuresShell=api;
  // Optional namespaced data events from the game runtime.
  window.addEventListener('onyx-adventures:pet-state',e=>{if(e.detail)setPetReadings(e.detail);});
  window.addEventListener('onyx-adventures:wallet',e=>{if(e.detail)setBalances(e.detail);});
  restore();updateStatus();setBalances(wallet);setProfessor(false,false);
  setText('#adventureSettingsStatus',storageOk?'Changes save locally when possible.':'Storage blocked: export to save.');
  broadcast('ready',{version:'1.0',shellOnly:true});
})();
