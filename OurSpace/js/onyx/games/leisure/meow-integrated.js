/* Feed Him MEOW · integrated arcade cartridge. Retro Arcade is the only outer shell.
 * Level path, 5,001 recipe records, fifty generated board types, Market trace,
 * and Bon Appétit run in the SAME #gameViewport. No nested legacy shell. */
(()=>{'use strict';
const $=s=>document.querySelector(s), shell=window.gameShell, mini=window.MEOWShell;
const data=window.FHM_RUNTIME_DATA||{},catalog=data.ingredient_catalog||{},records=catalog.ingredients||[];
const byId=new Map(records.map(x=>[x.id,x]));
const library=window.FEED_HIM_MEOW_RECIPE_CATALOG||data.recipes||{};
const candidates=[...(library.featuredRecipes||[]),...(library.recipes||[])];
const pathData=data.level_path||{},positions=pathData.positions||[];
const target=document.createElement('div');target.id='gameMount';target.className='meow-integrated-viewport';
shell.mount(target);
const FRAGMENTS_PER_INGREDIENT=6;
const state={level:1,selectedLevel:1,mode:'solo',recipe:null,screen:'recipe',board:null,activeBoard:null,batchIndex:{market:0,garden:0},kind:null,paused:false,market:{},garden:{},bon:{},seed:1,genIndex:0,final:false,fullInventory:{},fragments:{market:{},garden:{}},boosters:{},bonAngle:0,padAim:0,accessibility:{},bonFinished:false,bonController:null,resumeBonSnapshot:null};
let integratedApi=null;
const safe=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clamp=(n,low,high)=>Math.max(low,Math.min(high,n));
const wholeCount=count=>Math.floor(Math.max(0,Number(count)||0)/FRAGMENTS_PER_INGREDIENT);
const wholeTarget=target=>Math.max(1,Math.ceil(Math.max(0,Number(target)||0)/FRAGMENTS_PER_INGREDIENT));
const goalLabel=goal=>`${wholeCount(goal?.count)}/${wholeTarget(goal?.target)}`;
function fragmentBucket(channel){
 if(!state.fragments||typeof state.fragments!=='object')state.fragments={market:{},garden:{}};
 if(!state.fragments[channel]||typeof state.fragments[channel]!=='object')state.fragments[channel]={};
 return state.fragments[channel];
}
function recordFragments(channel,id,count){
 const bucket=fragmentBucket(channel),added=Math.max(0,Number(count)||0);
 const prior=Object.prototype.hasOwnProperty.call(bucket,id)?Math.max(0,Number(bucket[id])||0):Math.max(0,Number(state.fullInventory[id])||0)*FRAGMENTS_PER_INGREDIENT;
 const total=prior+added,whole=wholeCount(total);
 bucket[id]=total;state.fullInventory[id]=whole;
 return {fragments:total,whole};
}
const asset=id=>{const r=byId.get(id);return (r?.runtimeAssetAlias||r?.sourceAsset||r?.asset||('assets/images/games/leisure/shared/ingredients/'+id+'.svg')).replace(/^\.\.\//g,'');};
const label=id=>byId.get(id)?.name||id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const store=(key,value)=>{try{localStorage.setItem('meow.retro.'+key,JSON.stringify(value))}catch(_){}};
const read=(key,fallback=null)=>{try{return JSON.parse(localStorage.getItem('meow.retro.'+key)||'null')??fallback}catch(_){return fallback}};
const announce=(type,detail={})=>window.dispatchEvent(new CustomEvent(type,{detail:{level:state.level,recipeId:state.recipe?.id,...detail}}));
function isFresh(id){return !!byId.get(id)?.marketEligible}
function isPantry(id){const r=byId.get(id);return !!(r&&(r.gardenEligible||r.category==='sauce'||r.liquid)&&!isFresh(id));}
function project(raw){if(!raw)return null;const ids=[...new Set([...(raw.gameplay?.requiredIngredientIds||[]),...(raw.ingredients||[]).map(x=>x.id),...(raw.gameplay?.requiredFlavorIds||[]),...(raw.seasonings||[]),...(raw.freshHerbs||[])].map(x=>catalog.legacyIngredientAliases?.[x]||x))].filter(x=>byId.has(x));
 const market=ids.filter(isFresh),garden=ids.filter(isPantry),flavors=[...new Set([...(raw.gameplay?.requiredFlavorIds||[]),...(raw.seasonings||[]),...(raw.freshHerbs||[])].map(x=>catalog.legacyIngredientAliases?.[x]||x))].filter(id=>byId.has(id));
 const cookwareRoute={};ids.forEach(id=>{const r=byId.get(id),c=(r.category||'').toLowerCase(),s=(r.subCategory||'').toLowerCase();cookwareRoute[id]=/(liquid|starch|stock|water|broth|rice|pasta)/.test(c+' '+s)?'pot':/(sauce|season|herb|dairy|spice|flour|sugar|pantry)/.test(c+' '+s)?'bowl':'pan'});
 return {...raw,recipeId:raw.id,recipeName:raw.name,requiredIds:[...new Set([...market,...garden])],marketIngredients:market,gardenIngredients:garden,flavorTargets:flavors,cookwareRoute,stoveHeatTarget:{min:55,max:78},ovenRequired:/bake|roast|oven|chicken|pastry|cake|pizza/i.test(raw.name),ovenBlowTarget:100};
}
const eligible=candidates.map(project).filter(r=>r&&r.marketIngredients.length>0&&r.gardenIngredients.length>0);
function ingredientBatches(kind){
 const ids=kind==='market'?state.recipe?.marketIngredients:state.recipe?.gardenIngredients;
 const size=kind==='market'?4:6,out=[];
 for(let i=0;i<(ids||[]).length;i+=size)out.push(ids.slice(i,i+size));
 return out;
}
function chooseRecipe(level,previousId=''){
 const diff=level<=10?1:level<=25?2:level<=50?3:level<=90?4:level<=140?5:6;
 let pool=eligible.filter(r=>r.difficulty===diff);if(!pool.length)pool=eligible;
 const alternatives=pool.filter(r=>r.id!==previousId);if(alternatives.length)pool=alternatives;
 const bytes=new Uint32Array(1);if(window.crypto?.getRandomValues)window.crypto.getRandomValues(bytes);
 const index=Math.floor((bytes[0]||Math.random()*0x100000000)/0x100000000*pool.length);
 return pool[Math.min(pool.length-1,index)]||project(library.featuredRecipes?.[0]);
}
function finishBoard(){if(!state.board)return;try{if(state.kind==='garden')window.MEOWGardenAdapter.destroy(state.board);else state.board.destroy()}catch(e){console.warn('Board shutdown:',e)}state.board=null;state.activeBoard=null;state.kind=null}
function stopBon(){try{state.bonController?.dispose?.()}catch(_){}state.bonController=null;state.bonFinished=true;if(integratedApi)shell.registerGame(integratedApi)}
function screenRoot(id){target.replaceChildren();let node=document.createElement('section');node.id='meowScreen';node.className='meow-screen meow-screen-'+id;target.appendChild(node);return node}
function phase(which,substage=''){window.MEOWFX?.stopIdle();state.screen=which;window.MEOWAudio?.stage(which);shell.setPhase(which,{substage});shell.setRunStatus({level:state.level,householdMode:state.mode,recipe:state.recipe?.name||'None',progress:which.replaceAll('-',' ')});}
function setRecipeUI(){const r=state.recipe;if(!r)return;shell.setRecipe({...r,ingredients:r.requiredIds.map(id=>({name:label(id),id})),marketIngredients:r.marketIngredients.map(id=>({id,name:label(id)})),gardenIngredients:r.gardenIngredients.map(id=>({id,name:label(id)})),objective:`Cook ${r.name}`})}
function highestUnlocked(){let i=1;for(;i<=5000;i++)if(!read('level-'+i)?.completed)break;return i}
function goLevels(page=null){finishBoard();stopBon();state.recipe=null;state.final=false;phase('level-select');shell.setOnyx({mood:'listening'});
 const host=screenRoot('levels');host.innerHTML=`<div id="levelSelectRoot"><header class="level-hud"><img class="level-logo" alt="Feed Him MEOW" src="assets/images/games/leisure/Ingredient_Garden/BOOT-logo-mini.webp"><div><h1 class="level-title">LEVEL SELECT</h1><b id="levelBatch"></b></div><div class="level-hud-stats"><div class="level-pill">ACCOUNT LEVEL <b id="accountLevel"></b></div><div class="level-pill warm" id="levelStarsTotal"></div><button class="meow-btn" id="mapPrev" hidden aria-label="Previous map page">◀</button><button class="meow-btn" id="mapNext" hidden aria-label="Next map page">▶</button><button class="meow-btn" id="meowContinue" hidden>▶ Continue</button></div></header><div id="levelMapScroller" class="level-map-scroller" role="region" tabindex="0" aria-label="Scrollable paw-path level map"><div class="map-stage"><div class="map-art" aria-hidden="true"></div><div id="levelNodes" class="level-nodes"></div></div></div></div><dialog id="levelModal" class="meow-dialog" aria-labelledby="selectTitle"><header><h2 id="selectTitle">LEVEL <span id="modalLevel">1</span></h2><button type="button" id="closeLevelModal" aria-label="Close">×</button></header><div class="meow-dialog-body"><div id="modalStars"></div><p>CHOOSE PLAYER MODE</p><div class="mode-choice-grid"><button class="mode-choice is-selected" id="modeSolo">Solo<small>One player</small></button><button class="mode-choice" id="modeDuo">Household Duo<small>William + Jasper</small></button></div><button class="meow-btn main" id="startChosen">GENERATE LEVEL RECIPE ▶</button></div></dialog>`;
 const unlocked=highestUnlocked(),lastBatch=Math.floor((unlocked-1)/45),batch=page===null?lastBatch:clamp(Number(page)||0,0,lastBatch),first=batch*45+1;$('#accountLevel').textContent=unlocked;$('#levelBatch').textContent=`Levels ${first}–${first+44}`;let totalStars=0;for(let i=1;i<unlocked;i++)totalStars+=read('level-'+i)?.bestStars||0;$('#levelStarsTotal').textContent=totalStars+' ★';$('#mapPrev').hidden=batch===0;$('#mapNext').hidden=batch>=lastBatch;$('#mapPrev').onclick=()=>goLevels(batch-1);$('#mapNext').onclick=()=>goLevels(batch+1);
 positions.forEach((pos,i)=>{const level=first+i,saved=read('level-'+level),stars=saved?.bestStars||0,kind=level<unlocked?'completed':level===unlocked?'current':'locked';const b=document.createElement('button');b.className='level-node '+kind;b.disabled=level>unlocked;b.dataset.level=level;b.style.cssText=`left:${pos.x}%;top:${pos.y}%;--paw-rotation:${pos.rotation||0}deg`;b.setAttribute('aria-label',`Level ${level}, ${kind}, ${stars} of 5 stars`);b.innerHTML=`<img class="paw-node" alt="" src="assets/images/games/leisure/level_select/${kind==='completed'?'mapsheet_map_point_1.webp':kind==='current'?'mapsheet_map_point.webp':'mapsheet_map_point_3.webp'}"><span class="level-number">${level}</span><small class="level-star-count">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</small>`;b.onclick=()=>selectLevel(level);$('#levelNodes').appendChild(b)});
 $('#closeLevelModal').onclick=()=>$('#levelModal').close();$('#modeSolo').onclick=()=>setMode('solo');$('#modeDuo').onclick=()=>setMode('duo');$('#startChosen').onclick=()=>{$('#levelModal').close();startLevel(state.selectedLevel)};
 const cp=read('checkpoint');if(cp){$('#meowContinue').hidden=false;$('#meowContinue').onclick=continueRun}
 requestAnimationFrame(()=>{const sc=$('#levelMapScroller');if(sc){const node=sc.querySelector('.level-node.current');if(node)sc.scrollTop=Math.max(0,node.offsetTop-sc.clientHeight*.65);else sc.scrollTop=sc.scrollHeight}});
 announce('level-select:shown',{unlocked});
}
function selectLevel(level){state.selectedLevel=level;$('#modalLevel').textContent=level;$('#modalStars').textContent='★'.repeat(read('level-'+level)?.bestStars||0)+'☆'.repeat(5-(read('level-'+level)?.bestStars||0));setMode(state.mode);$('#levelModal').showModal();announce('level:selected',{level});}
function setMode(mode){state.mode=mode;const solo=$('#modeSolo'),duo=$('#modeDuo');solo?.classList.toggle('is-selected',mode==='solo');duo?.classList.toggle('is-selected',mode==='duo')}
function startLevel(n){finishBoard();stopBon();state.level=clamp(Number(n)||1,1,5000);state.seed=0xF00D0000+state.level*7919;state.market={};state.garden={};state.bon={};state.fullInventory={};state.fragments={market:{},garden:{}};state.batchIndex={market:0,garden:0};state.recipe=null;state.genIndex=0;state.final=false;state.boosters={};state.resumeBonSnapshot=null;showGenerator(false)}
function recipeList(ids){return ids.length?ids.map(id=>`<li><img src="${safe(asset(id))}" alt="">${safe(label(id))}</li>`).join(''):'<li>None</li>'}
const generatorFlipbooks=new Map();
function mountGeneratorFlipbook(slot,mood='hungry'){
 if(!slot)return;
 const source=new URL(`assets/images/games/leisure/Bon-Appetit/onyx_${mood}_MEOW.svg`,document.baseURI).href;
 slot.dataset.flipbookSource=source;
 // Paint the real flipbook immediately. This keeps the order button visible
 // even when a file:// browser blocks fetch; the SVG image still animates.
 const image=document.createElement('img');image.className='flipbook-image';image.src=source;image.alt=`Onyx ${mood} flipbook`;image.draggable=false;image.decoding='async';
 image.addEventListener('error',()=>{if(slot.dataset.flipbookSource===source&&!slot.querySelector('svg'))slot.textContent='Onyx';},{once:true});
 slot.replaceChildren(image);
 if(!generatorFlipbooks.has(source))generatorFlipbooks.set(source,source.startsWith('file:')?Promise.reject(new Error('Local SVG stays as an image.')):fetch(source).then(r=>{if(!r.ok)throw new Error('Onyx flipbook unavailable');return r.text();}));
 generatorFlipbooks.get(source).then(text=>{if(slot.dataset.flipbookSource!==source)return;const svg=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;if(svg?.localName!=='svg')throw new Error('Invalid Onyx flipbook');svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('aria-hidden','true');slot.replaceChildren(document.importNode(svg,true));try{if(state.accessibility.reduced||window.matchMedia('(prefers-reduced-motion: reduce)').matches){svg.pauseAnimations?.();svg.setCurrentTime?.(0);}else svg.unpauseAnimations?.();}catch(_){}}).catch(()=>{});
}
function showGenerator(already=false){finishBoard();stopBon();phase('recipe');const el=screenRoot('recipe');el.innerHTML=`<article class="meow-generator"><p class="meow-eyebrow">LEVEL ${state.level} · RECIPE GENERATOR</p><h1>RECIPE GENERATOR</h1><p>Click hungry Onyx to take his order. He will give you one real recipe before the market and garden phases begin.</p><div class="recipe-wheel"><button type="button" id="generateRecipe" class="recipe-onyx-button" aria-label="Take hungry Onyx's recipe order"><span id="recipeOnyxSprite" class="recipe-onyx-sprite" aria-hidden="true"></span><b>HUNGRY</b></button><div><strong id="recipeTitle">Hungry Onyx is waiting</strong><small id="recipeMessage" class="recipe-speech" role="status">“Click me when you are ready for my order.”</small></div></div><section class="recipe-preview" id="recipePreview" hidden><h2 id="lockedRecipe"></h2><div class="recipe-columns"><div><h3>MARKET MADNESS</h3><ul id="recipeMarket"></ul></div><div><h3>INGREDIENT GARDEN</h3><ul id="recipeGarden"></ul></div><div><h3>BON APPÉTIT</h3><ul id="recipeFlavors"></ul></div></div></section><div class="meow-actions"><button class="meow-btn main" id="beginMarket" hidden>▶ MARKET MADNESS</button><button class="meow-btn" id="restartOrder">NEW ORDER</button></div></article>`;
 mountGeneratorFlipbook($('#recipeOnyxSprite'),'hungry');
 $('#generateRecipe').onclick=()=>{const previous=state.recipe?.id||'';state.genIndex++;state.recipe=chooseRecipe(state.level,previous);store('checkpoint',{level:state.level,step:'recipe',recipeId:state.recipe.id,mode:state.mode,fragments:state.fragments,inventory:state.fullInventory});setRecipeUI();announce('recipe:generated',{recipeId:state.recipe.id});window.MEOWFX?.word('ORDER TAKEN!','recipe');window.MEOWAudio?.cue('recipe');fillRecipePreview()};$('#beginMarket').onclick=()=>startBoard('market');$('#restartOrder').onclick=()=>startLevel(state.level);if(already&&state.recipe)fillRecipePreview();
}

function fillRecipePreview(){const r=state.recipe;$('#recipeTitle').textContent=r.name;$('#recipeMessage').textContent=`“Tonight I require ${r.name}. Take me to the market.”`;$('#lockedRecipe').textContent=r.name;$('#recipeMarket').innerHTML=recipeList(r.marketIngredients);$('#recipeGarden').innerHTML=recipeList(r.gardenIngredients);$('#recipeFlavors').innerHTML=recipeList(r.flavorTargets);$('#recipePreview').hidden=false;$('#generateRecipe').disabled=true;$('#generateRecipe').setAttribute('aria-label','Order taken: '+r.name);$('#beginMarket').hidden=false;}
function openBoardHost(){const n=screenRoot('board');n.classList.add('game-board-view');const h=document.createElement('div');h.className='meow-game-host';h.id='meowActiveBoard';n.appendChild(h);return h}
function boardData(kind){return window.MEOWBoardGenerator.next(state.recipe.id,kind)}
function paletteItem(id){return {id,name:label(id),path:asset(id)};}
function marketPalette(r){const ids=[...r.marketIngredients];const filler=window.MEOWBoardData.market.filter(x=>!ids.includes(x.id));for(const x of filler){if(ids.length>=Math.max(6,r.marketIngredients.length))break;ids.push(x.id)}return ids.map(id=>byId.has(id)?paletteItem(id):(window.MEOWBoardData.market.find(x=>x.id===id)||paletteItem(id)))}
function gardenPalette(r,def){const ids=[...r.gardenIngredients];for(const a of def.ingredientPalette){if(ids.length>=Math.max(6,r.gardenIngredients.length))break;if(!ids.includes(a.id))ids.push(a.id)}return ids.map(id=>byId.has(id)?paletteItem(id):(def.ingredientPalette.find(x=>x.id===id)||paletteItem(id)))}
function gardenGoals(game,r){
 const whole=clamp(Math.round(2+state.level/40),2,5),goals=r.gardenIngredients.map(id=>({id,name:label(id),target:whole*FRAGMENTS_PER_INGREDIENT,count:0,wholeTarget:whole}));
 game._recipeGoals=goals;game._collectedFragments={};
 game._trackRecipeMatches=tiles=>{
   const gains=new Map();
   for(const key of tiles){
     const [x,y]=key.split(':').map(Number),piece=game.grid[y]?.[x];
     if(!piece||piece.piece==null)continue;
     const item=game.def.ingredientPalette[piece.piece];if(!item)continue;
     const sourceId=item.id||catalog.legacyIngredientAliases?.[item.filename]||'';
     // Do not compare images or display labels: the same pantry item uses one canonical ID.
     game._collectedFragments[sourceId]=(game._collectedFragments[sourceId]||0)+1;
     const goal=goals.find(goal=>goal.id===sourceId);
     if(!goal||goal.count>=goal.target)continue;
     goal.count++;gains.set(sourceId,(gains.get(sourceId)||0)+1);
     announce('ingredient-garden:ingredient-collected',{ingredientId:sourceId,quantity:goal.count,target:goal.target,whole:wholeCount(goal.count),wholeTarget:wholeTarget(goal.target)});
   }
   if(gains.size){
     updateGardenGoals();updateStatus();
     const named=[...gains.keys()].map(id=>label(id));
     const complete=goals.every(goal=>goal.count>=goal.target);
     window.MEOWFX?.word(complete?'PANTRY COMPLETE!':named.length===1?named[0].toUpperCase()+' COLLECTED!':'PANTRY HAUL!','garden');
   }
 };
}

function forceGardenFinish(){if(state.kind!=='garden'||!state.board)return;
 const game=state.board;if(game.busy||game.completed||game.failed)return;
 const all=(game._recipeGoals||[]).every(g=>g.count>=g.target);
 if(!all&&!window.confirm('Finish Ingredient Garden now? Missing ingredients will affect Onyx’s final rating, but you can still cook in Bon Appétit.'))return;
 if(all){game.checkEnd();}else{game.failed=true;game.showResult(false);}
}
function updateGardenGoals(){const g=state.board;if(!g||state.kind!=='garden')return;const line=$('#gardenRecipeGoals');if(line){const btn=line.querySelector('#gardenFinishButton');if(btn)btn.remove();line.innerHTML=g._recipeGoals.map(x=>`<span class="meow-goal"><img src="${safe(asset(x.id))}" alt="">${safe(x.name)} <b>${goalLabel(x)}</b></span>`).join('');if(btn)line.append(btn)}}
function startBoard(kind){if(!state.recipe)return showGenerator();finishBoard();stopBon();phase(kind==='market'?'market-madness':'ingredient-garden');setRecipeUI();const root=openBoardHost(),batches=ingredientBatches(kind),index=state.batchIndex[kind]>=batches.length?0:state.batchIndex[kind],r={...state.recipe,[kind==='market'?'marketIngredients':'gardenIngredients']:batches[index]};state.batchIndex[kind]=index;state.kind=kind;
 try{const def=boardData(kind);state.activeBoard={...def.generation,batch:index+1,batchCount:batches.length};if(kind==='market'){
    root.classList.add('meow-market-host');const palette=marketPalette(r),whole=clamp(Math.round(1.5+state.level/100),2,3),goals=r.marketIngredients.map(id=>({id,target:whole*FRAGMENTS_PER_INGREDIENT,wholeTarget:whole}));
    state.board=window.MEOWMarket.create(def,root,{palette,goals});announce('market-madness:started',{level:state.level,board:def.number,serial:def.generation.serial,batch:index+1,batchCount:batches.length});
 }else{
    root.classList.add('meow-garden-host');const whole=clamp(Math.round(1.5+state.level/100),2,3),gd={...def,ingredientPalette:gardenPalette(r,def),objective:{...def.objective,primaryItem:label(r.gardenIngredients[0]),targetCount:whole},moves:Math.max(def.moves||30,90+r.gardenIngredients.length*12)};
    state.board=window.MEOWGardenAdapter.create(gd,root);gardenGoals(state.board,r);
    const strip=document.createElement('div');strip.id='gardenRecipeGoals';strip.className='meow-goal-strip';root.prepend(strip);updateGardenGoals();
    const continueBtn=document.createElement('button');continueBtn.type='button';continueBtn.id='gardenFinishButton';continueBtn.className='meow-btn';continueBtn.textContent='FINISH PANTRY → BON APPÉTIT';continueBtn.title='Continue with completed goals, or accept partial credit';
    strip.append(continueBtn);continueBtn.onclick=forceGardenFinish;
    announce('ingredient-garden:started',{level:state.level,board:def.number,serial:def.generation.serial,batch:index+1,batchCount:batches.length});
 }
 }catch(error){console.error('Failed to mount board:',error);root.innerHTML=`<div class="meow-error">Unable to start the board: ${safe(error.message||error)} <button id="boardRetry">Retry</button></div>`;$('#boardRetry').onclick=()=>startBoard(kind);state.board=null;state.activeBoard=null;return}
 setRecipeUI();window.MEOWFX?.startIdle(()=>idleNibble());state.board.paused=shell.paused;state.board.refresh?.();updateStatus();saveProgress(kind);setupBoosters();}
function updateStatus(){const g=state.board;if(!g)return;const goals=state.kind==='market'?g.goals:g._recipeGoals||[];const batch=state.activeBoard;shell.setRunStatus({level:state.level,score:g.score,movesRemaining:g.moves,progress:goals.map(x=>`${label(x.id)} ${goalLabel(x)}`).join(' · '),objectives:`${state.recipe.name} · ${state.kind==='market'?'Fresh ingredients':'Pantry ingredients'} · board ${batch?.batch||1}/${batch?.batchCount||1}`});}
function idleNibble(){if(shell.paused||!state.board||!['market','garden'].includes(state.kind))return false;
 const game=state.board;if(game.busy||game.completed||game.failed)return false;
 const possible=[];
 if(state.kind==='market'){
  for(let y=0;y<game.h;y++)for(let x=0;x<game.w;x++){
   if(!game.valid(x,y)||game.locked(x,y))continue;const tile=game.getCell(x,y);const item=game.palette[tile?.piece];
   if(tile&&item&&!state.recipe.marketIngredients.includes(item.id))possible.push({x,y,id:item.id,element:game.cells.get(x+':'+y)})}
 }else{
  for(const [key,el] of Object.entries(game.cellEls)){
   const [x,y]=key.split(':').map(Number),tile=game.grid[y]?.[x],item=game.def.ingredientPalette[tile?.piece];
   if(tile&&item&&!state.recipe.gardenIngredients.includes(item.id)&&!game.locks[key]&&!game.hazards[key]&&!game.blockers[key])possible.push({x,y,id:item.id,element:el});
  }
 }
 if(!possible.length){
  // If a recipe occupies every palette slot, Onyx still gets his harmless snack.
  // A nibble is visual only: no deduction from collected totals, moves or score.
  if(state.kind==='garden')for(const [key,el] of Object.entries(game.cellEls)){
   const [x,y]=key.split(':').map(Number),tile=game.grid[y]?.[x],item=game.def.ingredientPalette[tile?.piece];
   if(tile&&item&&!game.locks[key]&&!game.hazards[key]&&!game.blockers[key])possible.push({x,y,id:item.id,element:el});
  }
  else for(let y=0;y<game.h;y++)for(let x=0;x<game.w;x++){
   if(!game.valid(x,y)||game.locked(x,y))continue;
   const tile=game.getCell(x,y),item=game.palette[tile?.piece];if(item)possible.push({x,y,id:item.id,element:game.cells.get(x+':'+y)});
  }
 }
 if(!possible.length)return false;
 const c=possible[Math.floor(Math.random()*possible.length)],origin=state.kind;
 window.MEOWFX?.travel({mood:'hungry',target:c.element,words:['SNACK TAX!','THE VOID IS PECKISH!','NOM NOM!'],onArrive:()=>{
  if(state.kind!==origin||state.board!==game||shell.paused||game.busy||game.completed||game.failed)return;
  if(origin==='market'){
   const tile=game.getCell(c.x,c.y);if(!tile||!game.valid(c.x,c.y))return;
   // Playful, neutral nibble: replenish the tile immediately without costing moves or recipe goals.
   tile.piece=Math.floor(game.rand()*game.palette.length);tile.special=null;game.ensureChain();game.refresh();
  }else{
   const tile=game.grid[c.y]?.[c.x];if(!tile)return;
   tile.piece=null;tile.special=null;game.applyGravity();game.renderAll();game.ensureMove();
  }
  announce('onyx:hungry-snack',{ingredientId:c.id,phase:origin,penalty:0});window.MEOWAudio?.cue('nibble');
 }});
 return true;
}
function saveProgress(step){store('checkpoint',{step,level:state.level,recipeId:state.recipe?.id,mode:state.mode,market:state.market,garden:state.garden,bon:state.bon,bonSnapshot:state.bonController?.getCheckpoint?.()||state.bon?.checkpoint||null,inventory:state.fullInventory,fragments:state.fragments,seed:state.seed,activeBoard:state.activeBoard,batchIndex:state.batchIndex})}
const defs=[['imperial_paw_bop','Imperial Paw Bop'],['sticky_toe_beans','Sticky Toe-Beans'],['royal_side_eye','Royal Side-Eye'],['bowtie_blitz','Bowtie Blitz'],['void_pounce','Void Pounce'],['blep_shuffle','Blep Shuffle'],['snack_tax','Snack Tax'],['imperial_decree','Imperial Decree']];
const boosterPhrases={
 imperial_paw_bop:'One royal swat. You are welcome.',
 sticky_toe_beans:'Toe-beans can rearrange destiny.',
 royal_side_eye:'That does not belong in my dinner.',
 bowtie_blitz:'Bowtie straight. Counter tidy.',
 void_pounce:'The void has landed.',
 blep_shuffle:'Blep. A more promising arrangement.',
 snack_tax:'I have claimed a chef’s portion.',
 imperial_decree:'By royal decree, clear the lot.'
};
function setupBoosters(){const list=defs.map(([id,name])=>({id,name,count:state.boosters[id]??2,quantity:state.boosters[id]??2,phases:['market-madness','ingredient-garden','bon-appetit']}));shell.setBoosters(list)}
function boosterCell(g,point,kind){
 if(!point||point.pixelX==null)return kind==='garden'?g._meowCursor:g.cursor;
 const rect=target.getBoundingClientRect();const el=document.elementFromPoint(rect.left+point.pixelX,rect.top+point.pixelY)?.closest(kind==='garden'?'.garden-cell[data-x][data-y]':'.mm-tile[data-x][data-y]');
 if(!el||!(kind==='garden'?g.gridEl:g.gridEl).contains(el))return null;
 return {x:Number(el.dataset.x),y:Number(el.dataset.y)};
}
function marketHarvest(g,cells){
 let count=0;
 for(const key of new Set(cells.map(c=>c.x+':'+c.y))){const [x,y]=key.split(':').map(Number),tile=g.getCell(x,y);if(!tile)continue;
  const item=g.palette[tile.piece];if(item){g.collected[item.id]=(g.collected[item.id]||0)+1;for(const goal of g.goals)if(goal.id===item.id)goal.count=Math.min(goal.target,goal.count+1);g.score+=15;count++}
  g.blockers.delete(key);g.hazards.delete(key);tile.piece=null;tile.special=null;
 }
 if(!count)return false;g.progress=g.goals.reduce((sum,goal)=>sum+goal.count,0);g.gravity();g.ensureChain();g.refresh();
 if(g.goals.every(goal=>goal.count>=goal.target)){g.completed=true;g.end(true)}return true;
}
function gardenBooster(g,id,targets){
 if(g.busy||g.paused||g.completed||g.failed)return false;
 if(id==='blep_shuffle'){g.shuffle();return true}
 if(id==='snack_tax'){const goal=g._recipeGoals?.find(x=>x.count<x.target);if(!goal)return false;goal.count=Math.min(goal.target,goal.count+6);g._collectedFragments[goal.id]=(g._collectedFragments[goal.id]||0)+6;updateGardenGoals();g.renderAll();g.checkEnd();return true}
 const a=boosterCell(g,targets[0],'garden');if(!a||!g.playable(a.x,a.y)||g.locks[a.x+':'+a.y])return false;
 if(id==='sticky_toe_beans'){
  const b=boosterCell(g,targets[1],'garden');if(!b||!g.playable(b.x,b.y)||g.locks[b.x+':'+b.y]||a.x===b.x&&a.y===b.y)return false;
  g.busy=true;g.swapState(a.x,a.y,b.x,b.y);
  (async()=>{try{const matches=g.findMatches();if(matches.cells.size)await g.resolve(matches,b);if(!g.disposed){g.ensureMove();g.checkEnd()}}catch(error){console.error('Garden toe-beans recovered:',error)}finally{g.busy=false;if(!g.disposed)g.renderAll()}})();return true;
 }
 if(id==='royal_side_eye'){
  const key=a.x+':'+a.y,item=g.def.ingredientPalette[g.grid[a.y]?.[a.x]?.piece];
  if(!g.blockers[key]&&!g.hazards[key]&&(!item||state.recipe.gardenIngredients.includes(item.id)))return false;
  delete g.blockers[key];delete g.hazards[key];g.grid[a.y][a.x].piece=null;g.grid[a.y][a.x].special=null;g.applyGravity();g.ensureMove();g.renderAll();return true;
 }
 const modes={imperial_paw_bop:1,bowtie_blitz:10,void_pounce:8,imperial_decree:7};
 if(!modes[id])return false;void g.applyBoosterToCell(modes[id],a.x,a.y);return true;
}
function marketBooster(g,id,targets){
 if(g.busy||g.paused||g.completed||g.failed)return false;
 if(id==='blep_shuffle'){g.booster('shuffle');return true}
 if(id==='snack_tax'){const goal=g.goals.find(x=>x.count<x.target);if(!goal)return false;goal.count=Math.min(goal.target,goal.count+6);g.collected[goal.id]=(g.collected[goal.id]||0)+6;g.progress=g.goals.reduce((sum,x)=>sum+x.count,0);g.refresh();if(g.goals.every(x=>x.count>=x.target)){g.completed=true;g.end(true)}return true}
 const a=boosterCell(g,targets[0],'market');if(!a||!g.valid(a.x,a.y))return false;
 if(id==='sticky_toe_beans'){const b=boosterCell(g,targets[1],'market');if(!b||!g.valid(b.x,b.y)||a.x===b.x&&a.y===b.y)return false;const left=g.getCell(a.x,a.y),right=g.getCell(b.x,b.y);[left.piece,right.piece]=[right.piece,left.piece];[left.special,right.special]=[right.special,left.special];g.ensureChain();g.refresh();return true}
 if(id==='royal_side_eye'){const key=a.x+':'+a.y,item=g.palette[g.getCell(a.x,a.y).piece];if(!g.blockers.has(key)&&!g.hazards.has(key)&&(!item||state.recipe.marketIngredients.includes(item.id)))return false;g.blockers.delete(key);g.hazards.delete(key);g.getCell(a.x,a.y).piece=null;g.gravity();g.ensureChain();g.refresh();return true}
 const cells=[];if(id==='imperial_paw_bop')cells.push(a);
 else if(id==='bowtie_blitz'){for(let x=0;x<g.w;x++)cells.push({x,y:a.y});for(let y=0;y<g.h;y++)cells.push({x:a.x,y})}
 else if(id==='void_pounce'){for(let y=a.y-1;y<=a.y+1;y++)for(let x=a.x-1;x<=a.x+1;x++)cells.push({x,y})}
 else if(id==='imperial_decree'){const family=g.getCell(a.x,a.y).piece;for(let y=0;y<g.h;y++)for(let x=0;x<g.w;x++)if(g.getCell(x,y)?.piece===family)cells.push({x,y})}
 return marketHarvest(g,cells);
}
function applyBooster({boosterId,targets=[]}={}){
 const id=boosterId||'',g=state.board;if(!boosterPhrases[id]||(state.boosters[id]??2)<=0)return false;
 const applied=g?(state.kind==='garden'?gardenBooster(g,id,targets):marketBooster(g,id,targets)):false;
 if(!applied)return false;
 state.boosters[id]=(state.boosters[id]??2)-1;setupBoosters();announce('meow:booster-used',{id,remaining:state.boosters[id],phrase:boosterPhrases[id]});
 window.MEOWAudio?.cue('booster');window.MEOWFX?.word(boosterPhrases[id],'booster');updateStatus();return true;
}
function boardComplete(e){const report=e.detail||{};
 if(state.screen!=='market-madness'&&state.screen!=='ingredient-garden')return;
 if(!state.board||report.board!==state.board.def.number||report.serial!==state.board.def.generation?.serial)return;
 const kind=state.kind,game=state.board,success=!!report.success;
 const completedBatch=state.batchIndex[kind],totalBatches=ingredientBatches(kind).length;
 const goals=(kind==='market'?game.goals:game._recipeGoals)||[];
 const quality=success?clamp(1-(Math.max(0,(35-game.moves))/(kind==='market'?120:160)),.6,1):clamp(goals.reduce((s,g)=>s+Math.min(g.count||0,g.target||1),0)/Math.max(1,goals.reduce((s,g)=>s+(g.target||1),0))*.65,.08,.65);
 const snapshot={score:report.score||game.score||0,quality,goals:goals.map(x=>({...x,wholeCount:wholeCount(x.count),wholeTarget:wholeTarget(x.target)}))};
 if(kind==='market'){
  state.market={...snapshot,batches:[...(state.market.batches||[]),snapshot]};
  const collected=Object.keys(game.collected||{}).length?game.collected:Object.fromEntries(goals.map(x=>[x.id,x.count||0]));
  Object.entries(collected).forEach(([id,count])=>recordFragments('market',id,count));
 }else{
  state.garden={...snapshot,batches:[...(state.garden.batches||[]),snapshot]};
  const collected=Object.keys(game._collectedFragments||{}).length?game._collectedFragments:Object.fromEntries(goals.map(x=>[x.id,x.count||0]));
  Object.entries(collected).forEach(([id,count])=>recordFragments('garden',id,count));
 }
 state.batchIndex[kind]=completedBatch+1;
 const more=state.batchIndex[kind]<totalBatches;
 saveProgress(more?kind:kind==='market'?'garden':'bon');updateStatus();
 announce(kind==='market'?'market-madness:completed':'ingredient-garden:completed',{success,score:snapshot.score,partial:!success});
 window.MEOWFX?.word(success?(kind==='market'?'MARKET MAGIC!':'PANTRY POWER!'):'ONYX SAYS: ONWARD!',kind);
 // Both engines now share a guaranteed accessible completion panel, including partial-credit continuation.
 const overlay=game.shell?.querySelector('.meow-board-result')||game.root?.querySelector('.meow-board-result')||target.querySelector('.meow-board-result');
 if(!overlay)return;
 overlay.innerHTML='';const card=document.createElement('div');card.className='meow-result-card';
 const title=document.createElement('h2');title.textContent=success?(kind==='market'?'MARKET COLLECTED!':'PANTRY COLLECTED!'):'OUT OF MOVES';
 const detail=document.createElement('p');detail.textContent=state.recipe.name+' · Board '+(completedBatch+1)+'/'+totalBatches+(success?' · Ingredient goals reached!':' · Remaining ingredients will count as missing in the final verdict.');
 const advance=document.createElement('button');advance.className='meow-btn main';advance.id='advanceBoard';advance.textContent=more?'NEXT '+(kind==='market'?'MARKET':'GARDEN')+' BOARD ▶':kind==='market'?'CONTINUE TO INGREDIENT GARDEN ▶':'CONTINUE TO BON APPÉTIT ▶';
 advance.addEventListener('click',()=>{if(state.kind!==kind)return;more?startBoard(kind):kind==='market'?startBoard('garden'):startBon()});
 const replay=document.createElement('button');replay.className='meow-btn';replay.textContent='TRY A NEW BOARD';replay.addEventListener('click',()=>{state.batchIndex[kind]=completedBatch;startBoard(kind)});
 card.append(title,detail,advance,replay);overlay.append(card);
 window.MEOWAudio?.cue(success?'complete':'fail');
}
window.addEventListener('meow:boardcomplete',boardComplete);
async function startBon(){
 if(!state.recipe)return showGenerator();
 finishBoard();stopBon();state.final=false;state.bon={};phase('bon-appetit','waiting-for-order');
 const node=screenRoot('bon');node.innerHTML='<div class="meow-bon-loading">Loading the royal kitchen…</div>';state.bonFinished=false;
 try{
   const dataReady=window.MeowBonDataReady||Promise.resolve(window.MeowData);
   await dataReady;
   if(state.screen!=='bon-appetit')return;
   const inventory=Object.entries(state.fullInventory||{}).map(([id,quantity])=>({id,quantity}));
   state.bonController=window.MeowBonAppetitFactory(node,{register:false,inventory,onStart:()=>{state.final=false;state.bon={};},onResult:(result,snapshot)=>finalizeBon(result,snapshot),onNext:()=>startLevel(state.level+1)});
   const source=window.MeowData?.recipes?.find(recipe=>recipe.id===state.recipe.id);
   if(!source)throw new Error('The selected recipe is missing from Bon Appétit data.');
   state.bonController.startRun({recipeId:source.id,seed:(state.seed^0x9e3779b9)>>>0,inventory});
   if(state.resumeBonSnapshot){const snapshot=state.resumeBonSnapshot;state.resumeBonSnapshot=null;state.bonController.restore(snapshot);}
   announce('bon-appetit:started',{recipeId:source.id});saveProgress('bon');
 }catch(error){console.error('Failed to start Bon Appétit:',error);node.innerHTML=`<div class="meow-error">Unable to load Bon Appétit: ${safe(error.message||error)} <button id="bonRetry">Retry</button></div>`;$('#bonRetry').onclick=()=>startBon();}
}
function finalizeBon(result,snapshot){
 if(state.screen!=='bon-appetit'||state.final)return;
 state.final=true;state.bon={...result,score:result.score,stars:result.stars,mood:result.mood,checkpoint:snapshot};saveProgress('bon');
 const previous=read('level-'+state.level,{})||{};store('level-'+state.level,{completed:true,bestStars:Math.max(result.stars,previous.bestStars||0),lastStars:result.stars,bestScore:Math.max(result.score||0,previous.bestScore||0),recipeId:state.recipe?.id,updatedAt:Date.now()});store('checkpoint',null);
 shell.showVerdict(result.stars);shell.setOnyx({mood:result.mood});announce('stars:calculated',{stars:result.stars,score:result.score});announce(result.mood==='purring'?'onyx:purring':'onyx:judgmental',{stars:result.stars});announce('level:completed',{level:state.level,stars:result.stars});
}

function continueRun(){const cp=read('checkpoint');if(!cp?.recipeId)return goLevels();state.level=cp.level||1;state.mode=cp.mode||'solo';state.seed=cp.seed||1;state.market=cp.market||{};state.garden=cp.garden||{};state.bon=cp.bon||{};state.batchIndex={market:Math.max(0,Number(cp.batchIndex?.market)||0),garden:Math.max(0,Number(cp.batchIndex?.garden)||0)};state.resumeBonSnapshot=cp.bonSnapshot||cp.bon?.checkpoint||null;state.fullInventory=cp.inventory||{};state.fragments=cp.fragments||{market:{},garden:{}};state.recipe=project(candidates.find(x=>x.id===cp.recipeId));if(!state.recipe)return goLevels();if(cp.step==='garden')startBoard('garden');else if(cp.step==='bon')startBon();else if(cp.step==='market')startBoard('market');else showGenerator(true);}
function input(e){if(e.type==='game-command'){
 if(e.command==='level-select')goLevels();else if(e.command==='continue')continueRun();else if(e.command==='recipe-brief'){if(!state.recipe)showGenerator();else shell.openPanel('route')}else if(e.command==='restart-phase'){if(state.kind)startBoard(state.kind);else if(state.screen==='bon-appetit')startBon();else if(state.screen==='recipe')showGenerator(!!state.recipe)}return}
 if(e.type==='booster:request'){
  const boardAtRequest=state.board,screenAtRequest=state.screen;
  const targetTile=e.targets?.[0];const point=targetTile?.pixelX!=null?document.elementFromPoint((document.querySelector('#gameMount')?.getBoundingClientRect().left||0)+targetTile.pixelX,(document.querySelector('#gameMount')?.getBoundingClientRect().top||0)+targetTile.pixelY)?.closest('.garden-cell,.mm-tile'):null;
  const targetEl=point||((state.kind==='garden'&&boardAtRequest)?boardAtRequest.cellEls[`${boardAtRequest._meowCursor?.x||0}:${boardAtRequest._meowCursor?.y||0}`]:null)||target.querySelector('.mm-tile:not(.hole),.garden-cell:not(.hole)');
  const lines={...boosterPhrases,steady:'Hold steady, chef. I am watching the heat.',stock:'A second helping. Waste is beneath us.'};
  const deliver=()=>{
   const sameStage=state.board===boardAtRequest&&state.screen===screenAtRequest;
   const success=sameStage&&(state.screen==='bon-appetit'?!!state.bonController?.activateBooster?.({boosterId:e.boosterId})?.success:applyBooster(e));
   window.MEOWOnyxBoosters?.resolveRequest(e.boosterId,{accepted:!!success,message:success?'Onyx: “'+lines[e.boosterId]+'”':'Booster is not usable in this step.'});
   if(success&&state.screen==='bon-appetit')window.MEOWFX?.word(lines[e.boosterId],'booster');
  };
  // Bon already has the one visible Onyx in its window or tasting scene.
  // Keep that portrait in place rather than flying a duplicate over it.
  if(state.screen==='bon-appetit')deliver();
  else window.MEOWFX?.travel({mood:'purring',target:targetEl,words:[lines[e.boosterId]||'PAW POWER!'],onArrive:deliver});
  return;
 }
 if(e.type==='booster-request'){return}
 // Board pointer gestures already reach the board directly; no secondary virtual R action.
 if(e.type==='action'&&String(e.source||'').startsWith('viewport:'))return
 if(e.type==='assist'){if(state.board){if(state.kind==='garden')window.MEOWGardenAdapter.hint(state.board);else state.board.hint()}};
 if(shell.paused)return;
 if(state.board){const game=state.board;const translated=e.type==='move'?{type:'joystick:move',stick:'left',x:e.x,y:e.y,active:e.active,inputSource:e.source||'arcade'}:
   e.type==='action'?{type:'button',key:e.action,state:e.pressed?'down':'up',inputSource:e.source||'arcade'}:null;
  if(translated){if(state.kind==='garden')window.MEOWGardenAdapter.control(game,translated);else game.control(translated);if(e.type==='action'&&e.pressed)updateStatus()}
  return;}
 if(state.screen==='bon-appetit'){
  state.bonController?.onInput?.(e);
 }else if(state.screen==='level-select'&&e.type==='action'&&e.action==='R'&&e.pressed){const el=$('#levelModal');if(!el?.open)selectLevel(highestUnlocked());else $('#startChosen')?.click()}
 else if(state.screen==='recipe'&&e.type==='action'&&e.action==='R'&&e.pressed){if(!state.recipe)$('#generateRecipe')?.click();else $('#beginMarket')?.click()}
}
window.addEventListener('bon-appetit:dish-revealed',e=>{if(state.screen==='bon-appetit')saveProgress('bon');});
// Compatibility facade for older shell integrations. The live Bon Appétit controller uses MeowData/MeowEngine directly.
window.FHM={S:{get level(){return state.level},get seed(){return state.seed},get recipe(){return state.recipe},get settings(){return {...state.accessibility}},get paused(){return shell.paused},get phase(){return state.screen},get catalog(){return catalog},get junk(){return data.junk_catalog||{junk:[]}},get bon(){return state.bon},set bon(v){state.bon=v}},$,$$:s=>[...document.querySelectorAll(s)],emit:announce,rng:n=>{let x=n>>>0;return()=>((x=Math.imul(x,1664525)+1013904223>>>0)/4294967296)},record:id=>byId.get(id),resolveId:id=>id,name:label,asset,advance:what=>{if(what==='final'&&state.bonController?.getState)finalizeBon(state.bonController.getState(),state.bonController.getCheckpoint())},show:()=>{},cookwareFor:id=>state.recipe?.cookwareRoute?.[id]||'bowl'};

integratedApi={onInput:input,setPaused(p){window.MEOWAudio?.pause(!!p);state.paused=!!p;if(state.board){if(state.kind==='garden')window.MEOWGardenAdapter.setPaused(state.board,p);else state.board.setPaused(p)}if(state.screen==='bon-appetit')state.bonController?.setPaused?.(p)},setVolume(v){window.MEOWAudio?.volume(v);state.bonController?.setVolume?.(v)},setAccessibility(s){state.accessibility=s;state.bonController?.setAccessibility?.(s)},activateBooster(request){if(state.screen==='bon-appetit'&&state.bonController?.activateBooster)return state.bonController.activateBooster(request);const success=applyBooster(request);return {success,reason:success?'Effect applied':'Unavailable for current phase'}},getCheckpoint(){return state.screen==='bon-appetit'&&state.bonController?.getCheckpoint?.()||read('checkpoint')||{} }};
shell.registerGame(integratedApi);window.MEOWAudio?.volume(shell.volume);window.MEOWAudio?.stage(state.screen);
window.MEOWGame=Object.freeze({get current(){return {kind:state.kind,instance:state.board,number:state.board?.def.number||null,generation:state.activeBoard}},getState:()=>({...state}),start(kind,level=state.level){if(level!==state.level)startLevel(level);if(!state.recipe)state.recipe=chooseRecipe(state.level);return startBoard(kind)},sync:updateStatus,syncSoon:()=>setTimeout(updateStatus,120),showLevelSelect:()=>goLevels(),openMarket:()=>startBoard('market'),openGarden:()=>startBoard('garden'),getRecipe:()=>state.recipe,generateRecipe:()=>$('#generateRecipe')?.click(),startBon,showGenerator});
// The campaign always opens on its level map. An unfinished run is offered
// through Continue, never silently substituted for Level Select.
goLevels();
})();
