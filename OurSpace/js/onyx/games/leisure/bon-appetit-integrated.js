/* Bon Appétit · Order → prep → cook → assemble → serve, inside Game Ready. */
window.MeowBonAppetitFactory = function(host, factoryOptions) {
  'use strict';
  const factory=factoryOptions||{};
  const shell=window.gameShell,D=window.MeowData,E=window.MeowEngine,K=window.MeowKitchen;
  const $=s=>document.querySelector(s),base=new URL(document.baseURI);
  const asset=p=>new URL(p,base).href;
  const art='assets/images/games/leisure/Bon-Appetit/';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=id=>D.catalog[id]?.name||id;
  const icon=(id,cls='')=>`<img class="food-art ${cls}" src="${asset(D.catalog[id].asset)}" alt="${esc(label(id))}" draggable="false">`;
  const vesselNames={pan:'Frying pan',bowl:'Mixing bowl',pot:'Stockpot',finish:'Sauce & garnish'};
  const phaseNames={brief:'Onyx’s order',sort:'Choose the ingredients',measure:'Measure & prepare',preassemble:'Build the baking dish',route:'Route the cookware',cook:'Cook to order',oven:'Bake & finish',flavor:'Sauce & season',assemble:'Assemble the dish',tasting:'Onyx is tasting…',results:'The imperial verdict'};
  const saveKey='meow:bon-appetit:progress:v1';
  let progress;try{progress=JSON.parse(localStorage.getItem(saveKey)||'null')}catch(_){}
  progress=Object.assign({coins:0,served:0,best:{},recent:[],lastRecipe:null,assist:{},boosters:{steady:2,stock:2}},progress||{});
  if(!Array.isArray(progress.recent))progress.recent=[];
  let disposed=false,run=null,paused=false,volume=shell.volume,options=shell.accessibility,held=false,move={x:0,y:0},lastPhase='',lastItem='',notice='',noticeTTL=0,aimIndex=0,groupIndex=0,aimVector={x:0,y:0},aim={x:.5,y:.5},micLevel=0,micStream=null,micContext=null,micAnalyser=null,micBuffer=null,uiTime=0,lastTick=performance.now(),lastPaint=0,lastCheckpoint=0,lastRepeat=0;
  const previousCheckpoint=shell.checkpoint;
  const root=document.createElement('section');root.className='ba-game is-welcome';root.dataset.shellInteractive='true';root.setAttribute('aria-label','Bon Appétit');
  root.innerHTML=`<header class="ba-banner"><div class="ba-brand"><span>FEED HIM MEOW</span><strong>Bon Appétit<span aria-hidden="true"> ✦</span></strong></div><div class="ba-stepper" aria-label="Order progress"></div><span class="ba-order-number">TABLE 01</span></header><div class="ba-layout"><div class="ba-supervisor-slot"><div class="ba-pass-through-window" aria-hidden="true"><div class="ba-dining-room"><span class="ba-dining-arch"></span><span class="ba-dining-table"></span><span class="ba-dining-chair ba-dining-chair-left"></span><span class="ba-dining-chair ba-dining-chair-right"></span></div></div><aside class="ba-onyx-aside"><button class="ba-onyx" data-ba="onyx" aria-label="Take hungry Onyx’s order"><span class="onyx-sprite" aria-hidden="true"></span><span class="ba-tap-label">Take his order · R</span></button><span class="ba-mood">HUNGRY</span></aside><div class="ba-counter-front" aria-hidden="true"><span>THE CHEF’S PASS</span></div></div><main class="ba-workspace"></main><aside class="ba-ticket" aria-label="Recipe order ticket"></aside></div><footer class="ba-feedback"><span class="ba-message" role="status" aria-live="polite">A hungry gentleman has arrived.</span><span class="ba-input-hint">Click Onyx to take his order</span></footer><div class="ba-pause-veil" hidden><span>Ⅱ</span><strong>Kitchen paused</strong><button data-ba="resume" class="ba-btn">Resume</button></div>`;
  if(host){host.replaceChildren(root);}else{shell.mount(root);}
  const workspace=root.querySelector('.ba-workspace'),ticket=root.querySelector('.ba-ticket'),sprite=root.querySelector('.onyx-sprite'),portrait=root.querySelector('.ba-onyx-aside'),supervisor=root.querySelector('.ba-supervisor-slot');
  const flipbooks=new Map();let portraitLoad=0;
  function syncFlipbook(){try{const svg=sprite.querySelector('svg');if(!svg?.pauseAnimations)return;if(options.reduced||window.matchMedia('(prefers-reduced-motion: reduce)').matches){svg.pauseAnimations();svg.setCurrentTime(0);}else if(paused)svg.pauseAnimations();else svg.unpauseAnimations();}catch(_){}}
  function parkPortrait(){if(portrait.parentElement!==supervisor)supervisor.prepend(portrait);}
  function placePortrait(){const slot=workspace.querySelector('.ba-hero-slot');if(slot)slot.prepend(portrait);}
  const audio={map:new Map(),volume:1,
    play(name,loop=false){if(!this.volume)return;let a=this.map.get(name);if(!a){const resultAudio={purr:'assets/audio/games/leisure/Bon-Appetit_result/purring_result.mp3',grumble:'assets/audio/games/leisure/Bon-Appetit_result/judgmental_result.mp3'};a=new Audio(asset(resultAudio[name]||('assets/audio/games/leisure/Bon-Appetit/'+name+'.wav')));this.map.set(name,a);}a.loop=loop;a.volume=this.volume*(loop?.16:.48);if(!loop)a.currentTime=0;a.play().catch(()=>{});},
    stop(name){const a=this.map.get(name);if(a){a.pause();a.currentTime=0;}},
    set(v){this.volume=v;for(const a of this.map.values())a.volume=v*(a.loop?.16:.48);if(v===0)for(const a of this.map.values())a.pause();},
    pause(){for(const a of this.map.values())a.pause();},
    sync(){if(!paused&&run?.phase==='cook'&&volume>0)this.play('sizzle',true);else this.stop('sizzle');}
  };
  audio.set(volume);
  function persist(){try{localStorage.setItem(saveKey,JSON.stringify(progress));}catch(_){}shell.setResources({coin:progress.coins});}
  function freshSeed(){const a=new Uint32Array(1);if(window.crypto?.getRandomValues)crypto.getRandomValues(a);else a[0]=Date.now()^Math.random()*4294967295;return a[0]||1;}
  function onyx(mood='hungry'){
    if(!['hungry','purring','judgmental'].includes(mood))mood='hungry';
    const source=asset(art+'onyx_'+mood+'_MEOW.svg');
    if(sprite.dataset.mood!==mood||!sprite.querySelector('svg,img')){
      sprite.dataset.mood=mood;const request=++portraitLoad;
      // Put the supplied SVG into the scene as an image before attempting to
      // inline it. This keeps Onyx visible in exported file:// builds where
      // fetch is blocked, while HTTP builds still get native SMIL controls.
      const image=document.createElement('img');image.className='flipbook-image';image.src=source;image.alt=`Onyx ${mood} flipbook`;image.draggable=false;image.decoding='async';
      image.addEventListener('error',()=>{if(request===portraitLoad&&!sprite.querySelector('svg')){sprite.textContent='Onyx';say('The Onyx flipbook asset is missing from this package.');}},{once:true});
      sprite.replaceChildren(image);
      if(!flipbooks.has(source))flipbooks.set(source,source.startsWith('file:')?Promise.reject(new Error('Local SVG stays as an image.')):fetch(source).then(response=>{if(!response.ok)throw new Error('Flipbook unavailable');return response.text();}));
      flipbooks.get(source).then(text=>{
        if(request!==portraitLoad)return;
        const svg=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;
        if(svg.localName!=='svg')throw new Error('Invalid flipbook');
        svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('aria-hidden','true');
        sprite.replaceChildren(document.importNode(svg,true));syncFlipbook();
      }).catch(()=>{});
    }
    portrait.querySelector('.ba-mood').textContent=mood.toUpperCase();
    portrait.querySelector('.ba-onyx').setAttribute('aria-label',!run?'Take hungry Onyx’s order':run.phase==='results'?'Onyx is '+mood:'Hungry Onyx is waiting for his meal');
    shell.setOnyx({mood,src:null});syncFlipbook();
  }
  function say(text,kind='info'){notice=text;noticeTTL=4;const el=root.querySelector('.ba-message');el.textContent=text;el.dataset.kind=kind;}
  function stopMic(){if(micStream)micStream.getTracks().forEach(t=>t.stop());micStream=null;micLevel=0;if(micContext)micContext.close().catch(()=>{});micContext=null;micAnalyser=null;micBuffer=null;}
  async function startMic(){
    if(run?.phase!=='oven'||paused)return;
    if(micStream){stopMic();render();return;}
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Microphone is unavailable here.');
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false},video:false});
      if(run?.phase!=='oven'||paused){stream.getTracks().forEach(t=>t.stop());return;}
      micStream=stream;micContext=new (window.AudioContext||window.webkitAudioContext)();await micContext.resume();micAnalyser=micContext.createAnalyser();micAnalyser.fftSize=1024;micBuffer=new Uint8Array(1024);micContext.createMediaStreamSource(stream).connect(micAnalyser);say('Microphone on. Sound energy drives the air pump. Hold R works too.');render();
    }catch(_){say('Microphone unavailable. Hold R or the air button to complete the oven.');stopMic();render();}
  }
  function closeMenus(){for(const name of ['game','patience','onyx','route','boosters','accessibility','settings','controls','chat'])shell.closePanel(name);shell.setPaused(false);}
  function normalizeRecipe(){
    if(!run)return;const r=run.recipe;
    shell.setRecipe({recipeId:r.id,recipeName:r.name,difficulty:r.band.replaceAll('_',' '),ingredients:r.ingredients.map(id=>({id,name:label(id)+' · '+(r.amounts[id]||'to taste')})),cookwareRoute:[...new Set(Object.values(r.routes))],objective:phaseNames[run.phase]});
    let instructions=$('#baSourceInstructions');
    if(!instructions){instructions=document.createElement('div');instructions.id='baSourceInstructions';instructions.className='section';$('#hud-route .hud-panel-body').append(instructions);}
    instructions.innerHTML='<h3>Recipe instructions</h3><ol>'+r.sourceSteps.map(step=>'<li>'+esc(step)+'</li>').join('')+'</ol>';
  }
  function startOrder(config={}){
    stopMic();held=false;closeMenus();
    const seed=config.seed||freshSeed(),recipeId=config.recipeId||E.pickOrder(D,seed,progress.recent).id;
    run=new E.Run(D,{...config,seed,recipeId,priorScores:null});run.a11y={...options};factory.onStart?.(run.checkpoint());run.event('bon-appetit:started');run.event('onyx:hungry');
    lastPhase='';lastItem='';aimIndex=0;groupIndex=0;aimVector={x:0,y:0};noticeTTL=0;uiTime=-1;progress.lastRecipe=run.recipe.id;progress.recent=[run.recipe.id,...progress.recent.filter(id=>id!==run.recipe.id)].slice(0,8);persist();
    onyx();shell.setPhase('bon-appetit',{substage:'order-presented'});normalizeRecipe();updateBoosters();
    shell.setRunStatus({order:progress.served+1,householdMode:'solo',progress:'Order taken',objectives:run.recipe.ingredients.map(label).join(', ')});checkpoint();audio.play('order');render();say('Onyx’s recipe is in his speech bubble. Read it, then start preparing.');
  }
  function waitForOrder(){stopMic();held=false;closeMenus();parkPortrait();run=null;lastPhase='';lastItem='';shell.clearCheckpoint();shell.setPhase('bon-appetit',{substage:'waiting-for-order'});welcome();say('A fresh appetite. Click hungry Onyx to take his next order.');}
  function checkpoint(){if(run)shell.setCheckpoint(run.checkpoint());}
  function restore(snapshot){try{stopMic();closeMenus();run=E.Run.restore(D,snapshot);run.a11y={...options};lastPhase='';lastItem='';normalizeRecipe();onyx('hungry');render();if(run.phase==='results')showResult();say('Saved order resumed.');}catch(_){waitForOrder();say('That save cannot be resumed. Click Onyx for a fresh order.');}}
  function updateBoosters(){shell.setBoosters([
    {id:'steady',name:'Steady paw',icon:'🐾',description:'Maintain target heat or complete the oven air cycle. Same rewards.',phases:['bon-appetit'],quantity:progress.boosters.steady},
    {id:'stock',name:'Second helping',icon:'✦',description:'Recover one discarded required portion before cookware routing ends.',phases:['bon-appetit'],quantity:progress.boosters.stock}
  ]);}
  function stepper(){
    const p=run?.phase;const groups=[['Order',['brief']],['Prep',['sort','measure','route','preassemble']],['Cook',['cook','oven']],['Flavor',['flavor']],['Assemble',['assemble']],['Serve',['tasting','results']]];
    const active=p?groups.findIndex(g=>g[1].includes(p)):-1;
    root.querySelector('.ba-stepper').innerHTML=groups.map((g,i)=>`<span class="${i===active?'current':i<active?'done':''}" ${i===active?'aria-current="step"':''}><b>${i<active?'✓':i+1}</b>${g[0]}</span>`).join('');
  }
  function welcome(){
    parkPortrait();root.classList.add('is-welcome','is-hero');root.classList.remove('is-playing');root.dataset.phase='hungry';onyx();stepper();
    workspace.innerHTML=`<div class="ba-customer-scene ba-arrival"><div class="ba-hero-note"><span class="ba-eyebrow">THE NIGHT KITCHEN IS OPEN</span><h1>A table<br> for <em>Onyx.</em></h1><p>Cook. Assemble. Serve.</p></div><div class="ba-hero-slot"></div><div class="ba-hero-dialog"><div class="ba-speech-bubble"><span class="ba-speaker">ONYX</span><p>“I have made a reservation.<br> It is for my dinner.”</p></div><p class="ba-click-instruction">Click hungry Onyx to take his order.</p>${previousCheckpoint?.module==='bon_appetit'?'<button class="ba-text-btn" data-ba="continue">Continue saved order</button>':''}<small>${D.recipeCount.toLocaleString()} recipes · ${progress.served} dinners served</small></div></div>`;
    ticket.innerHTML='';placePortrait();
  }
  function renderTicket(){
    if(!run)return;
    const r=run.recipe,present=new Set(run.plate.items.map(x=>x.id));
    ticket.innerHTML=`<div class="ba-ticket-head"><span>ORDER TICKET</span><b>01</b></div><h2>${esc(r.name)}</h2><div class="ba-ticket-meta">${esc(r.band.replaceAll('_',' '))} · ${r.ingredients.length} ingredients${r.ovenRequired?' · oven':''}</div><ol class="ba-ingredient-list">${r.ingredients.map(id=>`<li class="${present.has(id)?'on-plate':''}">${icon(id)}<div><strong>${esc(label(id))}</strong><span>${esc(r.amounts[id]||'1 finish portion')}</span></div><span class="ba-route-label" title="Recipe cookware">${present.has(id)?'✓':r.routes[id]}</span></li>`).join('')}</ol><div class="ba-ticket-note">Target heat: ${r.heatTarget[0]}–${r.heatTarget[1]}<br> ${r.flavors.length?'Finish: '+r.flavors.map(label).join(', '):'No added sauces or seasonings.'}</div><button class="ba-text-btn" data-ba="recipe">Full ticket & instructions ↗</button>`;
  }
  function stageTitle(title,help){return `<div class="ba-stage-heading"><span class="ba-eyebrow">${esc(phaseNames[run.phase])}</span><h1>${title}</h1><p>${help}</p></div>`;}
  function counterFood(items,cls=''){return `<div class="ba-portions ${cls}">${items.map(x=>`<span title="${esc(label(x.id))}">${icon(x.id)}</span>`).join('')}</div>`;}
  function renderBrief(){
    const r=run.recipe;
    return `<div class="ba-customer-scene ba-order-scene"><div class="ba-hero-note"><span class="ba-eyebrow">ORDER TAKEN · TABLE 01</span><h1>His order<br> is in.</h1><div class="ba-order-food">${r.ingredients.slice(0,5).map(id=>icon(id)).join('')}</div><p>${r.ingredients.length} ingredients · ${esc(r.band.replaceAll('_',' '))}</p></div><div class="ba-hero-slot"></div><div class="ba-hero-dialog"><div class="ba-speech-bubble" role="status"><span class="ba-speaker">ONYX’S ORDER</span><p>“Tonight, I require<br> <strong>${esc(r.name)}.</strong>”</p><details class="ba-bubble-ingredients"><summary>Ingredients & amounts (${r.ingredients.length})</summary><ul>${r.ingredients.map(id=>`<li><strong>${esc(label(id))}</strong><span>${esc(r.amounts[id]||'to taste')}</span></li>`).join('')}</ul></details></div><button class="ba-btn primary" data-ba="begin">Start preparing <span>R →</span></button><button class="ba-text-btn" data-ba="recipe">Full recipe & instructions</button></div></div>`;
  }
  const toolNames={cup:'Measuring cup / spoon',scale:'Kitchen scale',count:'Count & portion',taste:'Taste-dose spoon'};
  const amountText=(n,unit)=>Number(n.toFixed(3))+' '+unit;
  function renderMeasure(){
    const item=run.current(),spec=run.currentMeasure();if(!item||!spec)return '';
    return `${stageTitle('Measure, then prepare.',`Prepare <strong>${esc(label(item.id))}</strong>. The order asks for <strong>${esc(spec.source)}</strong>${spec.qualitative?' · one gentle finishing dose.':'.'}`)}<div class="ba-measuring-scene"><div class="ba-measuring-food">${icon(item.id)}<strong>${esc(label(item.id))}</strong><small>${run.measureIndex+1} / ${run.accepted.length} portions</small></div><div class="ba-measuring-tool" data-tool="${run.measureTool}"><span class="ba-tool-icon">${{cup:'▥',scale:'⚖',count:'◉',taste:'♧'}[run.measureTool]}</span><output id="baMeasuredAmount">${amountText(run.measureFill,spec.unit)}</output><div class="ba-measure-scale"><i id="baMeasureFill"></i><b></b><span>ORDER TARGET</span></div><small>${spec.qualitative?'To taste · a light dose, not an exact weight':'Target: '+esc(spec.source)}</small></div></div><label class="ba-tool-select">Tool<select id="baMeasureTool" aria-label="Measuring tool">${Object.entries(toolNames).map(([id,name])=>`<option value="${id}" ${id===run.measureTool?'selected':''}>${name}</option>`).join('')}</select></label><div class="ba-stage-actions"><button class="ba-btn" data-ba="measure-less" aria-label="Remove a measured increment">−</button><button class="ba-btn" data-ba="measure-more">+ ${amountText(spec.step,spec.unit)}</button><button class="ba-btn hold" data-hold="measure">Hold to fill <span>R</span></button><button class="ba-btn primary" data-ba="measure-confirm">Portion & prepare <span>B →</span></button></div><div class="ba-inline-help">Use ${toolNames[spec.tool].toLowerCase()}. Stop at the requested amount. +/- provides discrete control.</div>`;
  }
  function renderPreassembly(){
    return `${stageTitle('Build the baking dish.', 'Add the prepared components before baking. The oven will show this exact batch.')}<div class="ba-assembly-scene"><div class="ba-component-tray">${Object.entries(run.vessels).filter(([,items])=>items.some(x=>!run.recipe.flavors.includes(x.id))).map(([name,items])=>{const core=items.filter(x=>!run.recipe.flavors.includes(x.id)),added=core.every(x=>run.preBatch.some(b=>b.uid===x.uid));return `<button class="ba-component ${added?'added':''}" data-ba="batch-add" data-group="${name}">${counterFood(core)}<strong>${vesselNames[name]}</strong><small>${added?'✓ In baking dish':'Add to dish →'}</small></button>`;}).join('')}</div><div class="ba-baking-dish">${counterFood(run.preBatch)}<span>${run.preBatch.length?'Prepared baking batch':'Baking dish is empty'}</span></div></div><div class="ba-stage-actions"><button class="ba-btn primary" data-ba="batch-bake">Put dish in oven <span>B →</span></button></div>`;
  }
  function renderSort(){
    const item=run.current();if(!item)return'';
    return `${stageTitle('A little quality control.',`Send this order’s ingredients to the prep tray. Reject anything that does not belong.`)}<div class="ba-prep-scene"><div class="ba-feed-label">INCOMING <b>${run.index+1} / ${run.pool.length}</b></div><div class="ba-sort-rail"><div class="ba-moving-food">${icon(item.id)}<strong>${esc(label(item.id))}</strong></div><div class="ba-fall-track"><i></i></div><div class="ba-selector" aria-hidden="true"><span>↙</span><b>◆</b><span>↘</span></div></div><div class="ba-sort-destinations"><button class="ba-destination prep ${run.selected===0?'selected':''}" data-ba="yum"><span class="ba-metal-tray">${counterFood(run.accepted.slice(-6))}</span><strong>✓ YUM · Prep tray</strong><small>${run.accepted.length} kept</small></button><button class="ba-destination reject ${run.selected===1?'selected':''}" data-ba="yuck"><span class="ba-reject-hatch"><b>↓</b></span><strong>✕ YUCK · Reject slot</strong><small>${run.rejected.length} rejected</small></button></div></div><div class="ba-inline-help">Click a destination · Rotate / arrows to choose · R to release · X to inspect</div>`;
  }
  function vessel(name,items,interactive=false){return `<${interactive?'button':'div'} class="ba-vessel-card ${run?.selected===['pan','bowl','pot'].indexOf(name)?'selected':''}" ${interactive?'data-ba="route" data-vessel="'+name+'"':''}><div class="ba-vessel-visual ${name}"><span class="ba-vessel-body"></span>${counterFood(items)}<i class="ba-steam">⌇⌇⌇</i></div><strong>${vesselNames[name]}</strong><small>${items.length} component${items.length===1?'':'s'}</small></${interactive?'button':'div'}>`;}
  function renderRoute(){
    const item=run.current();if(!item)return'';
    return `${stageTitle('Everything has its place.',`The ticket gives each ingredient’s vessel. Route <strong>${esc(label(item.id))}</strong>.`)}<div class="ba-route-scene"><div class="ba-routing-food">${icon(item.id)}<strong>${esc(label(item.id))}</strong><span>${run.routeIndex+1} / ${run.accepted.length}</span></div><div class="ba-vessels">${['pan','bowl','pot'].map(name=>vessel(name,run.vessels[name],true)).join('')}</div></div><div class="ba-inline-help">Click cookware · Rotate / ← → to choose · R to send · X for the recipe route</div>`;
  }
  function renderCook(){
    return `${stageTitle('Keep a steady simmer.',`Twirl the joystick to maintain the marked heat band, or hold the heat button / R.`)}<div class="ba-cook-scene"><div class="ba-cooktops">${['pan','pot'].filter(name=>run.vessels[name].some(x=>run.plan.stoveIds.includes(x.id))).map(name=>`<div class="ba-burner" style="background-image:url('${asset(art+(name==='pan'?'grill.png':'cooktop.png'))}')">${vessel(name,run.vessels[name])}</div>`).join('')}</div><div class="ba-cook-monitor"><div class="ba-heat-label"><strong id="baHeatLabel">Good heat</strong><span id="baHeatNumber">50</span></div><div class="ba-heat-meter"><span class="ba-heat-band" style="left:${run.recipe.heatTarget[0]}%;width:${run.recipe.heatTarget[1]-run.recipe.heatTarget[0]}%">TARGET</span><i id="baHeatNeedle"></i></div><div class="ba-progress-label"><span>Cooking time</span><b id="baCookProgress">0%</b></div><progress id="baCookBar" max="1" value="0" aria-label="Cooking progress"></progress></div></div><div class="ba-stage-actions"><button class="ba-btn hold" data-hold="heat">Hold to maintain heat <span>R</span></button><button class="ba-btn primary" data-ba="finish-cook">Lift off heat <span>→</span></button></div><div class="ba-inline-help">Lift at 100% cooking time. Too cold leaves it raw; too hot can scorch it.</div>`;
  }
  function renderOven(){
    return `${stageTitle('Into the finishing oven.',`Feed the air pump with the large button or hold R. A microphone is optional.`)}<div class="ba-oven-scene"><div class="ba-new-oven"><div class="ba-oven-controls"><b>ONYX KITCHEN / 01</b><span id="baOvenDisplay">0%</span><i></i><i></i></div><div class="ba-oven-window"><div class="ba-oven-rack"></div><div class="ba-oven-dish">${counterFood(run.preBatch)}</div><div class="ba-oven-glow"></div></div><div class="ba-oven-handle"></div><div class="ba-air-pump"><i></i><i></i><i></i><span>AIR</span></div></div><progress id="baOvenBar" max="1" value="${run.ovenProgress}" aria-label="Oven air progress"></progress></div><div class="ba-stage-actions"><button class="ba-btn hold" data-hold="oven">Hold to pump air <span>R</span></button><button class="ba-text-btn" data-ba="microphone">${micStream?'Turn off microphone':'Enable microphone'}</button><button class="ba-text-btn" data-ba="finish-oven">Remove early</button></div>`;
  }
  function renderFlavor(){
    const r=run.recipe;
    return `${stageTitle('The finishing touch.',r.flavors.length?`Shoot the requested flavors: <strong>${r.flavors.map(id=>esc(label(id))).join(', ')}</strong>.`:'This recipe needs no extra flavor. Leave the decoys alone and finish.')}<div class="ba-flavor-gallery"><div class="ba-gallery-shelf"></div>${run.targets.map((id,i)=>{const n=run.flavorHits[id]||0;return `<button class="ba-flavor-target ${i===aimIndex?'aimed':''} ${n?'hit':''}" data-ba="shoot" data-id="${id}" data-index="${i}" aria-label="Apply ${esc(label(id))}">${icon(id)}<strong>${esc(label(id))}</strong><small>${n?'Applied ×'+n:run.accepted.some(x=>x.id===id)?'Prepared portion':'No prepared stock'}</small><span class="ba-crosshair" aria-hidden="true">⊕</span></button>`;}).join('')}<div class="ba-flavor-launcher" aria-hidden="true">↟</div><svg class="ba-shot-svg" aria-hidden="true"><line id="baShot" x1="50%" y1="100%" x2="50%" y2="50%"/></svg></div><div class="ba-stage-actions"><button class="ba-btn primary" data-ba="finish-flavor">Finish seasoning <span>B →</span></button></div><div class="ba-inline-help">Click to shoot · Aim / arrows + R · X inspects · Extra shots can over-season</div>`;
  }
  const cookedMap={steak:'cooked_pismis_biftek.png',steak_counter_whole:'cooked_pismis_biftek.png',beef_tenderloin_raw:'cooked_pismis_biftek.png',ground_beef_raw:'cooked_pismis_kofte.png',hamburger_patty_raw:'cooked_pismis_kofte.png',pork_chop_counter_whole:'cooked_pismis_pirzola.png',pork_tenderloin_raw:'cooked_pismis_pirzola.png',sausage_links:'cooked_pismis_sucuk.png',italian_sausage:'cooked_pismis_sucuk.png',tomatoes:'cooked_kozlenmis_domates.png',tomato_whole:'cooked_kozlenmis_domates.png',tomatoes_whole:'cooked_kozlenmis_domates.png',potatoes:'cooked_patates_kizartmasi.png'};
  function plateHTML(){
    const items=run.plate.items;
    return `<div class="ba-plate ${!items.length?'empty':''}" role="img" aria-label="Plate: ${esc(items.length?items.map(x=>label(x.id)+(x.cookState==='raw'?' (undercooked)':x.cookState==='burned'?' (burned)':'')).join(', '):'empty')}"><div class="ba-plate-rim"></div>${items.map((item,i)=>{const a=i*2.39996,x=50+Math.cos(a)*Math.sqrt((i+1)/Math.max(1,items.length))*31,y=48+Math.sin(a)*Math.sqrt((i+1)/Math.max(1,items.length))*25;const cat=D.catalog[item.id],flavor=item.cookState==='finish',liquid=cat.category==='liquid'||/oil_bottle|butter/.test(item.id);if(flavor||liquid){const color=/tomato|barbecue|ketchup|hot_sauce|paprika|chili/.test(item.id)?'#9b3b24':/soy|worcester|gravy|browning|smoke/.test(item.id)?'#69452e':/mustard|honey|cheese/.test(item.id)?'#d5aa38':/cream|alfredo|milk|mayo|flour/.test(item.id)?'#eee4bc':/herb|basil|oregano|parsley|dill|chive|thyme|rosemary/.test(item.id)?'#49733c':'#b49b58';return `<span class="ba-plated-finish ${['seasoning','herb'].includes(cat.category)?'specks':'sauce'}" style="left:${x}%;top:${y}%;--finish-color:${color};--food-tilt:${(i%5-2)*25}deg;--finish-size:${Math.min(1.6,1+(item.hits||1)*.12)}" role="img" aria-label="${esc(label(item.id))}" title="${esc(label(item.id))}"></span>`;}let src=cookedMap[item.id]&&item.cookState==='cooked'?asset(art+cookedMap[item.id]):asset(cat.asset);return `<img src="${src}" class="ba-plated-food ${item.cookState||''} ${item.isJunk?'junk':''}" style="left:${x}%;top:${y}%;--food-scale:${Math.max(.62,1-items.length*.012)};--food-tilt:${(i%5-2)*9}deg" alt="${esc(label(item.id))}" title="${esc(label(item.id))}">`;}).join('')}${!items.length?'<span class="ba-empty-label">Your plate is waiting</span>':''}</div>`;
  }
  function renderAssembly(){
    const groups=run.availableGroups();
    return `${stageTitle('Build his dinner.',`Move the cooked components onto the plate. Only the portions you kept are available.`)}<div class="ba-assembly-scene"><div class="ba-component-tray">${Object.entries(groups).map(([name,items])=>{const added=items.every(x=>run.plate.items.some(p=>p.uid===x.uid));return `<button draggable="true" data-ba="assemble" data-group="${name}" class="ba-component ${added?'added':''}" aria-pressed="${added}">${counterFood(items)}<strong>${vesselNames[name]}</strong><small>${added?'✓ On plate · click to remove':'Add to plate →'}</small></button>`;}).join('')||'<p class="ba-warning">No components survived preparation. You can still serve this plate for feedback.</p>'}</div><div class="ba-plating-area" data-drop="plate">${plateHTML()}<span class="ba-plate-caption">Click components or drag them onto the plate</span></div></div><div class="ba-stage-actions"><button class="ba-btn primary" data-ba="serve">Serve Onyx <span>R →</span></button></div>`;
  }
  function renderTasting(){
    return `<div class="ba-customer-scene ba-taste-scene"><div class="ba-hero-note"><span class="ba-eyebrow">DINNER IS SERVED</span><h1>A moment,<br> chef.</h1><p>The actual plate is on his table.</p></div><div class="ba-hero-slot"><div class="ba-hero-dish">${plateHTML()}</div></div><div class="ba-hero-dialog"><div class="ba-speech-bubble" role="status"><span class="ba-speaker">ONYX</span><p>“At last.<br> Allow me to inspect<br> the tribute.”</p></div><p class="ba-tasting-caption">Hungry Onyx is tasting…</p></div></div>`;
  }
  function renderResults(){
    const r=run.result,good=r.stars>=3;
    return `<div class="ba-customer-scene ba-verdict-scene"><div class="ba-hero-note"><span class="ba-eyebrow">${good?'IMPERIAL APPROVAL':'THE IMPERIAL NOTES'}</span><h1>${good?'The emperor<br> approves.':'Let’s refine<br> the tribute.'}</h1><div class="ba-stars" aria-label="${r.stars} out of 5 stars">${'<span>★</span>'.repeat(r.stars)}${'<i>☆</i>'.repeat(5-r.stars)}</div><div class="ba-final-score"><b>${r.score}</b><span>/ 100</span></div><p class="ba-reward">+ ${r.coins} coins</p></div><div class="ba-hero-slot"><div class="ba-hero-dish">${plateHTML()}</div></div><div class="ba-hero-dialog"><div class="ba-speech-bubble"><span class="ba-speaker">ONYX</span><p>${good?'“Acceptable tribute.<br> I shall require seconds.”':'“I have several notes.<br> We can improve this dinner.”'}</p></div><details class="ba-results-details"><summary>How the dish scored</summary><div class="ba-score-breakdown">${Object.entries({Sorting:r.metrics.sort,Measuring:r.metrics.measuring,Cookware:r.metrics.route,Cooking:r.metrics.cooking,Flavor:r.metrics.flavor,Assembly:r.metrics.completeness}).map(([key,n])=>`<div><span>${key}</span><meter min="0" max="1" value="${n}">${Math.round(n*100)}%</meter><b>${Math.round(n*100)}%</b></div>`).join('')}</div><ul>${r.reasons.map(reason=>`<li>${esc(reason)}</li>`).join('')}</ul></details><div class="ba-stage-actions"><button class="ba-btn primary" data-ba="next">New order <span>R →</span></button><button class="ba-btn" data-ba="replay">Try this dish again</button></div></div></div>`;
  }
  function render(){
    if(!run){welcome();return;}
    parkPortrait();const p=run.phase,hero=['brief','tasting','results'].includes(p);root.dataset.phase=p;root.classList.remove('is-welcome');root.classList.toggle('is-hero',hero);root.classList.toggle('is-playing',!hero);stepper();renderTicket();
    const renderers={brief:renderBrief,sort:renderSort,measure:renderMeasure,route:renderRoute,preassemble:renderPreassembly,cook:renderCook,oven:renderOven,flavor:renderFlavor,assemble:renderAssembly,tasting:renderTasting,results:renderResults};
    workspace.innerHTML=renderers[p]?.()||'';placePortrait();
    if(p!==lastPhase||['sort','route'].includes(p))workspace.scrollTop=0;
    if(p==='assemble'){const groups=Object.keys(run.availableGroups());if(run.plate.items.length&&(p!==lastPhase||groupIndex>=groups.length)&&groups.every(g=>run.availableGroups()[g].every(x=>run.plate.items.some(p=>p.uid===x.uid))))groupIndex=groups.length;root.querySelectorAll('[data-ba="assemble"]').forEach((b,i)=>b.classList.toggle('keyboard-picked',i===groupIndex));root.querySelector('[data-ba="serve"]')?.classList.toggle('keyboard-picked',groupIndex>=groups.length);}
    root.querySelector('.ba-input-hint').textContent=({brief:'R · begin',sort:'← → select · R release',route:'← → vessel · R route',measure:'R · fill / B · confirm',preassemble:'R · add / B · bake',cook:'Twirl / hold R · B finish',oven:'Hold R · pump air',flavor:'Aim · R shoot · B finish',assemble:'← → choose · R add / serve',tasting:'Onyx is tasting',results:'R · next order'})[p]||'';
    if(lastPhase!==p){
      if(lastPhase==='oven')stopMic();audio.sync();held=false;groupIndex=0;
      if(p!=='results'){onyx('hungry');shell.setStage(p);shell.setRunStatus({order:progress.served+1,progress:phaseNames[p],currentGoal:phaseNames[p],objectives:run.recipe.ingredients.map(label).join(', ')});}
      checkpoint();lastPhase=p;lastItem='';
      if(p==='cook')say('Maintain target heat. Lift off when cooking time reaches 100%.');
      if(p==='oven')say('Hold the air button or R. No microphone is required.');
    }
    paintMeters();
  }
  function showResult(){
    const r=run.result;if(!r)return;
    if(!run.rewarded){progress.coins+=r.coins;progress.served++;progress.best[run.recipe.id]=Math.max(progress.best[run.recipe.id]||0,r.stars);run.rewarded=true;persist();window.dispatchEvent(new CustomEvent('reward:granted',{detail:{runId:run.id,recipeId:run.recipe.id,coins:r.coins}}));}
    shell.showVerdict(r.stars);onyx(r.mood);checkpoint();render();audio.play(r.mood==='purring'?'purr':'grumble');
    say(r.mood==='purring'?'Prrrr. '+r.stars+' stars. Dinner has imperial approval.':r.stars+' stars. Onyx’s notes are on the results card.',r.stars>=3?'good':'bad');
    try{factory.onResult?.(r,run.checkpoint());}catch(error){console.warn('Bon Appetit result callback failed',error);}
  }
  function syncEvents(){
    if(!run)return;
    for(const e of run.drainEvents()){
      window.dispatchEvent(new CustomEvent(e.type,{detail:{...e,runId:run.id,recipeId:run.recipe.id}}));
      if(e.type==='bon-appetit:portion-prepared')audio.play('prep_chop');
      else if(e.type==='bon-appetit:batch-assembled'||e.type==='bon-appetit:component-assembled')audio.play('dish_drop');
      else if(e.type==='bon-appetit:yum-correct'||e.type==='bon-appetit:yuck-correct')audio.play('portion_pickup');
      else if(e.type.endsWith('-correct'))audio.play('success');
      else if(e.type.endsWith('-wrong')||e.type.endsWith('junk-to-yum'))audio.play('mistake');
      if(e.type==='stars:calculated')showResult();
    }
    const log=run.log.at(-1);if(log&&log.time>uiTime){uiTime=log.time;say(log.text,log.kind);}
  }
  function paintMeters(){
    if(!run)return;const p=run.phase;
    if(p==='sort'||p==='route'){root.style.setProperty('--fall',Math.min(1,run.fall));root.style.setProperty('--gate-angle',(run.selected==null?0:run.selected===0?-27:27)+'deg');}
    if(p==='measure'){const spec=run.currentMeasure();if($('#baMeasuredAmount'))$('#baMeasuredAmount').textContent=amountText(run.measureFill,spec.unit);$('#baMeasureFill')?.style.setProperty('width',(run.measureFill/spec.target*50)+'%');}
    if(p==='cook'){
      const h=run.heat,[lo,hi]=run.recipe.heatTarget,c=Math.min(1,run.cookElapsed/run.recipe.cookSeconds);
      $('#baHeatNeedle')?.style.setProperty('left',h+'%');if($('#baHeatNumber'))$('#baHeatNumber').textContent=Math.round(h);
      if($('#baHeatLabel'))$('#baHeatLabel').textContent=h<lo?'↓ Too cold':h>hi?'↑ Too hot':'✓ Target heat';
      if($('#baCookProgress'))$('#baCookProgress').textContent=Math.round(c*100)+'%';if($('#baCookBar'))$('#baCookBar').value=c;
      root.dataset.doneness=run.cookState;
      root.querySelector('[data-ba="finish-cook"]')?.classList.toggle('ready',c>=1);
    }
    if(p==='oven'){if($('#baOvenBar'))$('#baOvenBar').value=run.ovenProgress;if($('#baOvenDisplay'))$('#baOvenDisplay').textContent=Math.round(run.ovenProgress*100)+'%';root.style.setProperty('--air',run.air);}
    root.querySelector('.ba-onyx').classList.toggle('is-idle',!run||p==='brief'||p==='results');
  }
  function phaseAction(){if(paused)return;
    if(!run){startOrder();return;}
    switch(run.phase){case'brief':run.begin();render();break;case'measure':break;case'preassemble':{const groups=Object.keys(run.vessels).filter(name=>run.vessels[name].some(item=>!run.recipe.flavors.includes(item.id)&&!run.preBatch.some(x=>x.uid===item.uid)));if(groups.length)run.addBatchGroup(groups[0]);else run.beginOven();render();break;}case'sort':run.sortTo(['yum','yuck'][run.selected??0]);render();break;case'route':run.routeTo(['pan','bowl','pot'][run.selected??0]);render();break;case'flavor':shoot(run.targets[aimIndex]||run.targets[0]);break;case'assemble':{const groups=Object.keys(run.availableGroups()),name=groups[groupIndex];if(name){const items=run.availableGroups()[name];if(items.every(x=>run.plate.items.some(p=>p.uid===x.uid)))run.undoGroup(name);else run.addGroup(name);groupIndex=Math.min(groups.length,groupIndex+1);audio.play('plate');render();}else{run.serve();render();}break;}case'results':waitForOrder();break;}
  }
  function finishStep(){if(!run||paused)return;if(run.phase==='measure')run.confirmMeasure();else if(run.phase==='preassemble')run.beginOven();else if(run.phase==='cook')run.finishCook();else if(run.phase==='oven')run.finishOven();else if(run.phase==='flavor')run.finishFlavor();render();}
  function inspect(){if(!run)return;const item=run.current();if(item){const id=item.id;say(label(id)+(run.recipe.ingredients.includes(id)?' belongs in this recipe. Cookware: '+vesselNames[run.recipe.routes[id]]+'.':' does not belong in this recipe. Send to YUCK.'));}else if(run.phase==='flavor'){const id=run.targets[aimIndex];say(label(id)+(run.recipe.flavors.includes(id)?' is required. Apply one portion.':' is a decoy. Leave it alone.'));}else shell.openPanel('route');}
  function shoot(id){if(!id||paused||!run)return;const result=run.shoot(id);audio.play('shoot');const i=run.targets.indexOf(id),target=root.querySelector(`[data-index="${i}"]`),gallery=root.querySelector('.ba-flavor-gallery');if(target&&gallery){const t=target.getBoundingClientRect(),g=gallery.getBoundingClientRect(),line=$('#baShot');line?.setAttribute('x2',(t.left+t.width/2-g.left)+'');line?.setAttribute('y2',(t.top+t.height/2-g.top)+'');gallery.classList.remove('shot');void gallery.offsetWidth;gallery.classList.add('shot');target.querySelector('small').textContent='Applied ×'+(run.flavorHits[id]||0);target.classList.toggle('hit',(run.flavorHits[id]||0)>0);}
    const log=run.log.at(-1);if(log)say(log.text,result?'good':'bad');checkpoint();
  }
  function setAim(i){if(!run?.targets.length)return;aimIndex=((i%run.targets.length)+run.targets.length)%run.targets.length;root.querySelectorAll('.ba-flavor-target').forEach((el,index)=>el.classList.toggle('aimed',index===aimIndex));}
  root.addEventListener('click',e=>{
    const b=e.target.closest('[data-ba]');if(!b)return;const action=b.dataset.ba;
    if(action==='resume'){closeMenus();return;}if(paused)return;
    switch(action){
      case'onyx':if(!run)phaseAction();else if(run.phase==='results'){audio.play(run.result.mood==='purring'?'purr':'grumble');}else say('“The ticket contains my demands. I shall supervise.”');break;
      case'order':phaseAction();break;case'begin':run.begin();render();break;
      case'yum':run.sortTo('yum');render();break;case'yuck':run.sortTo('yuck');render();break;
      case'route':run.routeTo(b.dataset.vessel);render();break;
      case'measure-more':run.adjustMeasure(run.currentMeasure().step);paintMeters();break;case'measure-less':run.adjustMeasure(-run.currentMeasure().step);paintMeters();break;case'measure-confirm':run.confirmMeasure();render();break;
      case'batch-add':run.addBatchGroup(b.dataset.group);render();break;case'batch-bake':run.beginOven();render();break;
      case'finish-cook':run.finishCook();render();break;case'finish-oven':run.finishOven();render();break;
      case'finish-flavor':run.finishFlavor();render();break;
      case'shoot':setAim(Number(b.dataset.index));shoot(b.dataset.id);break;
      case'assemble':{const name=b.dataset.group,items=run.availableGroups()[name];if(items.every(x=>run.plate.items.some(p=>p.uid===x.uid)))run.undoGroup(name);else run.addGroup(name);const groups=Object.keys(run.availableGroups());if(groups.every(g=>run.availableGroups()[g].every(x=>run.plate.items.some(p=>p.uid===x.uid))))groupIndex=groups.length;render();checkpoint();break;}
      case'serve':run.serve();audio.play('plate');render();break;
      case'next':if(typeof factory.onNext==='function')factory.onNext();else waitForOrder();break;case'replay':startOrder({seed:freshSeed(),recipeId:run.recipe.id});break;
      case'continue':restore(previousCheckpoint);break;
      case'recipe':shell.openPanel('route');break;case'microphone':startMic();break;
    }
    syncEvents();
  });
  root.addEventListener('change',e=>{if(e.target.id==='baMeasureTool'){run.chooseMeasureTool(e.target.value);render();}});
  root.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-hold]');if(!b||paused)return;e.preventDefault();b.setPointerCapture(e.pointerId);held=true;b.classList.add('held');audio.play('click');});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(name,e=>{const b=e.target.closest('[data-hold]');if(b){held=false;b.classList.remove('held');}});
  root.addEventListener('keydown',e=>{if(e.target.matches('[data-hold]')&&['Space','Enter'].includes(e.code)){e.preventDefault();e.stopPropagation();held=true;}});
  root.addEventListener('keyup',e=>{if(e.target.matches('[data-hold]')&&['Space','Enter'].includes(e.code)){e.preventDefault();e.stopPropagation();held=false;}});
  root.addEventListener('dragstart',e=>{const b=e.target.closest('[data-group]');if(!b||paused)return;e.dataTransfer.setData('text/plain',b.dataset.group);});
  root.addEventListener('dragover',e=>{if(e.target.closest('[data-drop="plate"]')&&!paused)e.preventDefault();});
  root.addEventListener('drop',e=>{if(!e.target.closest('[data-drop="plate"]')||paused||run?.phase!=='assemble')return;e.preventDefault();run.addGroup(e.dataTransfer.getData('text/plain'));audio.play('plate');render();checkpoint();});
  root.addEventListener('pointermove',e=>{if(run?.phase!=='flavor'||paused||!e.target.closest('.ba-flavor-gallery'))return;const nodes=[...root.querySelectorAll('.ba-flavor-target')];let distance=Infinity,index=0;nodes.forEach((el,i)=>{const r=el.getBoundingClientRect(),d=Math.hypot(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2));if(d<distance){distance=d;index=i;}});setAim(index);});
  root.addEventListener('contextmenu',e=>{e.preventDefault();const b=e.target.closest('[data-index]');if(b)setAim(Number(b.dataset.index));inspect();});
  const adapter={
    onInput(e){
      if(e.type==='game-command'&&e.command==='recipe-brief'){shell.closePanel('game');shell.openPanel('route');return;}
      if(e.type==='game-command'&&e.command==='new-order'){waitForOrder();return;}
      if(e.type==='pause')return;
      if(paused)return;
      if(e.type==='rotate'&&run){run.rotate(e.delta);if(['sort','route'].includes(run.phase))render();}
      if(e.type==='move'){
        const old=move;move={x:e.x||0,y:e.y||0};
        if(run&&e.active&&Math.hypot(old.x,old.y)<.3){
          if(['sort','route'].includes(run.phase)){if(run.selected===null)run.select(move.x<-.25||move.y<-.25?0:run.phase==='route'&&move.y>.25?2:1);else run.select(run.selected+(move.x<-.25||move.y<-.25?-1:1));render();}
          else if(run.phase==='flavor')setAim(aimIndex+(move.x<-.25||move.y<-.25?-1:1));
          else if(run.phase==='assemble'){const count=Object.keys(run.availableGroups()).length+1;groupIndex=(groupIndex+(move.x<-.25||move.y<-.25?-1:1)+count)%count;render();}
        }
      }
      if(e.type==='aim'&&e.source==='gamepad'){aimVector={x:e.x,y:e.y};aim.x=Math.max(0,Math.min(1,aim.x+e.x*(root.classList.contains('precision')?.012:.04)));aim.y=Math.max(0,Math.min(1,aim.y+e.y*(root.classList.contains('precision')?.012:.04)));const gallery=root.querySelector('.ba-flavor-gallery');if(gallery){const g=gallery.getBoundingClientRect();let best=Infinity;root.querySelectorAll('.ba-flavor-target').forEach((el,i)=>{const r=el.getBoundingClientRect(),d=Math.hypot(aim.x*g.width-(r.left+r.width/2-g.left),aim.y*g.height-(r.top+r.height/2-g.top));if(d<best){best=d;setAim(i);}});}}
      if(e.type==='action'){
        if(e.action==='R'){held=e.pressed;if(e.pressed){lastRepeat=performance.now();phaseAction();}}
        else if(e.pressed&&e.action==='B')finishStep();
        else if(e.pressed&&e.action==='X')inspect();
        else if(e.pressed&&e.action==='Y')shell.openPanel('route');
        else if(e.pressed&&e.action==='A')shell.openPanel('game');
        else if(e.action==='Z')root.classList.toggle('precision',e.pressed);
      }
    },
    setPaused(value){paused=!!value;if(run)run.paused=paused;held=false;move={x:0,y:0};aimVector={x:0,y:0};root.querySelector('.ba-pause-veil').hidden=!paused;root.classList.toggle('ba-is-paused',paused);syncFlipbook();if(paused){audio.pause();if(micContext?.state==='running')micContext.suspend();}else{audio.sync();if(micContext?.state==='suspended')micContext.resume();}},
    setVolume(value){volume=value;audio.set(value);audio.sync();},
    setAccessibility(settings){options={...settings};if(run)run.a11y={...options};root.classList.toggle('ba-reduced',!!settings.reduced);root.classList.toggle('ba-large-targets',!!settings.largeTargets);progress.assist=options;syncFlipbook();},
    getCheckpoint(){return run?run.checkpoint():previousCheckpoint;},
    continueRun(snapshot){restore(snapshot);},
    restartPhase(){if(run)startOrder({recipeId:run.recipe.id});},
    requestAssist({assist}){
      const names={'sort-snap':'sortSnap','heat-hold':'heatHold','oven-hold':'ovenHold','flavor-aim':'aimAssist','slower':'slowSorter'};
      if(assist==='objective-focus'){inspect();return;}
      const option=names[assist]||'nonTimed';options[option]=true;if(run)run.a11y={...options};
      const input=$(`[data-a11y="${option}"]`);if(input)input.checked=true;say('Assistance enabled. Your rewards stay the same.');
    },
    activateBooster({boosterId}){
      if(!run||!progress.boosters[boosterId])return{success:false,reason:'No portions of this booster remain.'};
      if(boosterId==='steady'){
        if(!['cook','oven'].includes(run.phase))return{success:false,reason:'Use during cooking or the oven step.'};
        run.effects[run.phase==='cook'?'steadyHeat':'steadyOven']=true;
      }else if(boosterId==='stock'){
        if(!['sort','measure'].includes(run.phase))return{success:false,reason:'Use before cookware routing begins.'};
        const item=run.rejected.find(x=>x.required&&!run.accepted.some(a=>a.id===x.id));if(!item)return{success:false,reason:'No discarded recipe portion needs recovering.'};
        run.rejected=run.rejected.filter(x=>x.uid!==item.uid);run.accepted.push(item);say(label(item.id)+' recovered for cookware routing.');
      }
      const phrases={steady:'Hold steady, chef. I am watching the heat.',stock:'A second helping. Waste is beneath us.'};
      if(!phrases[boosterId])return{success:false,reason:'That kitchen booster is unavailable.'};
      progress.boosters[boosterId]--;persist();checkpoint();render();updateBoosters();say('“'+phrases[boosterId]+'”');window.MEOWAudio?.cue('booster');return{success:true};
    }
  };
  // Restore accessibility settings through the shell so its visible checkboxes agree.
  for(const [key,value]of Object.entries(progress.assist||{})){const input=$(`[data-a11y="${key}"]`);if(input&&input.checked!==value){input.checked=value;input.dispatchEvent(new Event('change'));}}
  if(factory.register!==false)shell.registerGame(adapter);persist();updateBoosters();shell.setPhase('bon-appetit',{substage:'waiting-for-order'});welcome();
  window.BonAppetit=Object.freeze({
    startRun(config={}){startOrder(config);return run.checkpoint();},
    getState(){return run?run.checkpoint():{phase:'hungry'};},
    restore,version:'2.0.0'
  });
  function loop(now){
    if(disposed)return;
    const dt=Math.min(.08,Math.max(0,(now-lastTick)/1000));lastTick=now;
    if(!paused){
      if(run){
        if(micAnalyser){micAnalyser.getByteTimeDomainData(micBuffer);let energy=0;for(const b of micBuffer)energy+=((b-128)/128)**2;micLevel=Math.max(0,Math.min(1,(Math.sqrt(energy/micBuffer.length)-.025)*15));}
        const phaseBefore=run.phase;
        run.tick(dt,{heatHeld:held,blowHeld:held,mic:micLevel,sweep:options.simplifiedRotation&&Math.hypot(move.x,move.y)>.3});
        if(phaseBefore!==run.phase){if(run.phase==='assemble')groupIndex=0;render();}
        if(run.phase==='flavor'&&(aimVector.x||aimVector.y)){const speed=root.classList.contains('precision')?.2:.7;aim.x=Math.max(0,Math.min(1,aim.x+aimVector.x*dt*speed));aim.y=Math.max(0,Math.min(1,aim.y+aimVector.y*dt*speed));const gallery=root.querySelector('.ba-flavor-gallery');if(gallery){const g=gallery.getBoundingClientRect();let best=Infinity,index=0;root.querySelectorAll('.ba-flavor-target').forEach((el,i)=>{const r=el.getBoundingClientRect(),d=Math.hypot(aim.x*g.width-(r.left+r.width/2-g.left),aim.y*g.height-(r.top+r.height/2-g.top));if(d<best){best=d;index=i;}});setAim(index);}}
        if(held&&phaseBefore==='flavor'&&run.phase==='flavor'&&now-lastRepeat>550){lastRepeat=now;shoot(run.targets[aimIndex]);}
        const item=run.current()?.uid||'';if(item!==lastItem){lastItem=item;if(['sort','route'].includes(run.phase))render();}
        syncEvents();
        if(now-lastCheckpoint>1800){checkpoint();lastCheckpoint=now;}
      }
      if(now-lastPaint>70){paintMeters();lastPaint=now;}
      noticeTTL=Math.max(0,noticeTTL-dt);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  function dispose(){disposed=true;stopMic();held=false;audio.pause();root.remove();}
  window.addEventListener('pagehide',()=>{if(!disposed){checkpoint();stopMic();audio.pause();persist();}});
  window.addEventListener('blur',()=>{held=false;move={x:0,y:0};});
  return Object.freeze({
    startRun(config={}){startOrder(config);return run.checkpoint();},
    getState(){return run?run.checkpoint():{phase:'hungry'};},
    restore,
    nextOrder:waitForOrder,
    onInput:adapter.onInput,
    setPaused:adapter.setPaused,
    setVolume:adapter.setVolume,
    setAccessibility:adapter.setAccessibility,
    getCheckpoint:adapter.getCheckpoint,
    continueRun:adapter.continueRun,
    restartPhase:adapter.restartPhase,
    requestAssist:adapter.requestAssist,
    activateBooster:adapter.activateBooster,
    dispose,
    root,
    version:'2.0.0'
  });
};
