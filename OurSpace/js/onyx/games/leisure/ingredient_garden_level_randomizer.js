(function (root, factory) {
  "use strict";
  const isNode = typeof module !== "undefined" && module.exports;
  const Core = isNode ? require("./garden_randomizer_core.js") : root.GardenRandomizerCore;
  const RecipeBridge = isNode ? require("./ingredient_garden_recipe_bridge.js") : root.IngredientGardenRecipeBridge;
  const Currency = isNode ? require("./ingredient_garden_currency.js") : root.IngredientGardenCurrency;
  const api = factory(Core, RecipeBridge, Currency);
  if (isNode) module.exports = api;
  root.IngredientGardenLevelRandomizer = api;
})(typeof window !== "undefined" ? window : globalThis, function (Core, RecipeBridge, Currency) {
  "use strict";
  if (!Core || !RecipeBridge || !Currency) throw new Error("Ingredient Garden randomizer dependencies are missing.");

  function sumOutstanding(objectives) {
    return (objectives || []).reduce(function (sum, item) { return sum + Math.max(0, Number(item.outstanding) || 0); }, 0);
  }

  function modeFor(rng, config) {
    return Core.weightedId(rng, config.modeWeights || { trace: 0.5, swap: 0.5 }) || "swap";
  }

  function difficultyFor(level, recipe, objectives, fishingModifier, config) {
    const d = config.difficulty || {};
    const ingredientCount = Math.max(1, Number(recipe.difficultyProfile && recipe.difficultyProfile.coreIngredientCount) || (recipe.ingredients || []).length);
    const totalUnits = sumOutstanding(objectives);
    const base = Math.min(Number(d.maximumBase) || 0.97,
      (Number(d.base) || 0.08) +
      Math.log2(level + 1) * (Number(d.levelLog2Weight) || 0) +
      ingredientCount * (Number(d.recipeIngredientWeight) || 0) +
      totalUnits * (Number(d.targetUnitWeight) || 0) +
      Math.max(1, Number(recipe.difficulty) || 1) * (Number(d.recipeDifficultyWeight) || 0)
    );
    const effective = base * Number(fishingModifier || 1);
    return { base: Number(base.toFixed(6)), fishingModifier: Number(fishingModifier || 1), effective: Number(effective.toFixed(6)), normalized: Number(Math.min(1, effective).toFixed(6)) };
  }

  function requiredMatchedTiles(objectives) {
    return (objectives || []).reduce(function (sum, item) {
      const rate = Math.max(0.01, Number(item.ingredientYieldRate) || 1);
      const remaining = Math.max(0, Number(item.outstanding) || 0);
      return sum + (remaining > 0 ? Math.ceil(remaining / rate) : 0);
    }, 0);
  }

  function chooseLimit(rng, level, difficulty, objectives, recipe, accessibility, config, mode) {
    const limits = config.limits || {}, pacing = config.pacing || {}, planning = pacing.movePlanning || {};
    const excludeTimed = !!(accessibility && accessibility.excludeTimedLevels);
    const timedAllowed = !excludeTimed && level >= (Number(limits.timedUnlockLevel) || 1);
    let type = "moves";
    if (timedAllowed) type = Core.weightedId(rng, { moves: Number(limits.moveWeight) || 0.82, time: Number(limits.timeWeight) || 0.18 }) || "moves";
    const ingredientCount = Math.max(1, objectives.filter(function (x) { return Number(x.outstanding) > 0; }).length || Number(recipe.difficultyProfile && recipe.difficultyProfile.coreIngredientCount) || (recipe.ingredients || []).length);
    const matchedTiles = Math.max(1, requiredMatchedTiles(objectives));
    const efficiencyMap = planning.expectedObjectiveTilesPerTurn || {};
    const expectedPerTurn = Math.max(1, Number(efficiencyMap[mode]) || (mode === "trace" ? 4 : 2.2));
    const productiveTurns = Math.max(1, Math.ceil(matchedTiles / expectedPerTurn));
    const safety = Math.max(1, (Number(planning.baseSafetyMultiplier) || 1.15) + difficulty.normalized * (Number(planning.difficultySafetyBonus) || 0.12));
    const diversityTurns = Math.ceil(ingredientCount * Math.max(0, Number(planning.ingredientDiversityTurns) || 0.25));
    const plannedMoves = Math.max(Number(planning.minimumMoveBudget) || 4, Math.ceil(productiveTurns * safety) + diversityTurns);
    if (type === "time") {
      const secondsPerTurn = Math.max(1, Number(planning.timedSecondsPerPlannedTurn) || 5);
      const baseSeconds = Math.max(0, Number(planning.timedBaseSeconds) || 18);
      const minSeconds = Math.max(1, Number(planning.minimumTimedSeconds) || Number((limits.timeSeconds || {}).minimum) || 40);
      const configuredMaxSeconds = Math.max(minSeconds, Number(planning.maximumTimedSeconds) || Number((limits.timeSeconds || {}).maximum) || 3600);
      const seconds = Math.ceil(baseSeconds + plannedMoves * secondsPerTurn);
      // Playability wins over an arbitrary ceiling: never shorten a timed board below its objective-derived plan.
      const maxSeconds = Math.max(configuredMaxSeconds, seconds);
      return { type: "time", timeSeconds: Math.floor(Core.clamp(seconds, minSeconds, maxSeconds)), moves: null, plannedMoves: plannedMoves, requiredMatchedTiles: matchedTiles, expectedObjectiveTilesPerTurn: expectedPerTurn };
    }
    const m = limits.moves || {};
    const minMoves = Math.max(1, Number(planning.minimumMoveBudget) || Number(m.minimum) || 4);
    const maxMoves = Math.max(plannedMoves, Number(m.maximum) || 999);
    return { type: "moves", moves: Math.floor(Core.clamp(plannedMoves, minMoves, maxMoves)), timeSeconds: null, plannedMoves: plannedMoves, requiredMatchedTiles: matchedTiles, expectedObjectiveTilesPerTurn: expectedPerTurn };
  }

  function activeIngredientPool(rng, recipe, objectives, ingredientCatalog, difficulty, config) {
    const required = objectives.filter(function (x) { return x.outstanding > 0; }).map(function (x) { return x.id; });
    const recipeDifficulty = Math.max(1, Math.min(6, Number(recipe && recipe.difficulty) || 1));
    const all = (ingredientCatalog && ingredientCatalog.ingredients || []).filter(function (x) {
      const minDifficulty = Math.max(1, Number(x.gardenMinimumDifficulty || x.minimumDifficulty || 1));
      return x.gardenCollectable !== false && x.fillerEligible !== false && minDifficulty <= recipeDifficulty;
    }).map(function (x) { return x.id; });
    const allowed = new Set(all);
    const invalidRequired = required.filter(function(id){ return !allowed.has(id); });
    if (invalidRequired.length) throw new Error('Recipe contains Ingredient Garden objectives above its difficulty band: ' + invalidRequired.join(', '));
    const board = config.board || {};
    const minActive = Math.max(required.length, Number(board.minimumActiveIngredients) || 5);
    const maxActive = Math.max(required.length, Number(board.maximumActiveIngredients) || 10);
    const desired = Math.floor(Core.clamp(minActive + Math.round(difficulty.normalized * 3), minActive, maxActive));
    const filler = Core.shuffle(rng, all.filter(function (id) { return required.indexOf(id) < 0; }));
    const pool = required.slice();
    for (let i = 0; pool.length < desired && i < filler.length; i += 1) pool.push(filler[i]);
    if (pool.length < 3) {
      for (let i = 0; pool.length < 3 && i < all.length; i += 1) if (pool.indexOf(all[i]) < 0) pool.push(all[i]);
    }
    return pool;
  }

  function spawnWeights(pool, objectives, config) {
    const rule = config.spawnWeights || {};
    const byId = Object.create(null);
    objectives.forEach(function (x) { byId[x.id] = x; });
    const maxOutstanding = Math.max(1, ...objectives.map(function (x) { return x.outstanding; }));
    const out = {};
    pool.forEach(function (id) {
      const obj = byId[id];
      if (!obj || obj.outstanding <= 0) out[id] = Number(rule.filler) || 1;
      else out[id] = (Number(rule.requiredBase) || 4.2) + (obj.outstanding / maxOutstanding) * (Number(rule.requiredOutstandingBonus) || 2.4);
    });
    return out;
  }

  function weightedIngredient(rng, candidates, weights) {
    return Core.weightedPick(rng, candidates, function (id) { return weights[id] == null ? 1 : weights[id]; });
  }

  function matchSet(board, rows, cols) {
    const found = new Set();
    function idx(r, c) { return r * cols + c; }
    for (let r = 0; r < rows; r += 1) {
      let start = 0;
      while (start < cols) {
        let end = start + 1;
        while (end < cols && board[idx(r, end)] === board[idx(r, start)]) end += 1;
        if (board[idx(r, start)] && end - start >= 3) for (let c = start; c < end; c += 1) found.add(idx(r, c));
        start = end;
      }
    }
    for (let c = 0; c < cols; c += 1) {
      let start = 0;
      while (start < rows) {
        let end = start + 1;
        while (end < rows && board[idx(end, c)] === board[idx(start, c)]) end += 1;
        if (board[idx(start, c)] && end - start >= 3) for (let r = start; r < end; r += 1) found.add(idx(r, c));
        start = end;
      }
    }
    return found;
  }

  function legalSwapExists(board, rows, cols) {
    function idx(r, c) { return r * cols + c; }
    for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) {
      const a = idx(r, c);
      const tests = [[r, c + 1], [r + 1, c]];
      for (let k = 0; k < tests.length; k += 1) {
        const rr = tests[k][0], cc = tests[k][1];
        if (rr >= rows || cc >= cols) continue;
        const b = idx(rr, cc);
        if (board[a] === board[b]) continue;
        const copy = board.slice();
        const t = copy[a]; copy[a] = copy[b]; copy[b] = t;
        if (matchSet(copy, rows, cols).size) return true;
      }
    }
    return false;
  }

  function traceChainExists(board, rows, cols, minChain) {
    const seen = new Set();
    function idx(r, c) { return r * cols + c; }
    for (let start = 0; start < board.length; start += 1) {
      if (seen.has(start)) continue;
      const type = board[start];
      if (!type) { seen.add(start); continue; }
      const stack = [start]; let count = 0;
      while (stack.length) {
        const pos = stack.pop();
        if (seen.has(pos) || board[pos] !== type) continue;
        seen.add(pos); count += 1;
        const r = Math.floor(pos / cols), c = pos % cols;
        for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) {
          if (!dr && !dc) continue;
          const rr = r + dr, cc = c + dc;
          if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
          const n = idx(rr, cc);
          if (!seen.has(n) && board[n] === type) stack.push(n);
        }
      }
      if (count >= minChain) return true;
    }
    return false;
  }

  function fillSwapBoard(rng, rows, cols, pool, weights) {
    const board = new Array(rows * cols);
    function idx(r, c) { return r * cols + c; }
    for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) {
      const banned = new Set();
      if (c >= 2 && board[idx(r, c - 1)] === board[idx(r, c - 2)]) banned.add(board[idx(r, c - 1)]);
      if (r >= 2 && board[idx(r - 1, c)] === board[idx(r - 2, c)]) banned.add(board[idx(r - 1, c)]);
      let candidates = pool.filter(function (id) { return !banned.has(id); });
      if (!candidates.length) candidates = pool;
      board[idx(r, c)] = weightedIngredient(rng, candidates, weights);
    }
    return board;
  }

  function topologyMask(rows, cols, id) {
    const mask = Array(rows * cols).fill(true);
    const off = (r,c) => { if (r>=0&&r<rows&&c>=0&&c<cols) mask[r*cols+c]=false; };
    if (id === "ring_bed") {
      const r0=Math.floor(rows/2)-1,c0=Math.floor(cols/2)-1; for(let r=r0;r<r0+2;r++)for(let c=c0;c<c0+2;c++)off(r,c);
    } else if (id === "diamond") {
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const edge=Math.min(r,rows-1-r)+Math.min(c,cols-1-c);if(edge<1)off(r,c);}
    } else if (id === "split_garden") {
      const c=Math.floor(cols/2)-1; for(let r=1;r<rows-1;r++) if(![2,5].includes(r)) { off(r,c); off(r,c+1); }
    } else if (id === "terraces") {
      off(0,0);off(0,1);off(1,0);off(0,cols-1);off(rows-1,0);off(rows-1,1);off(rows-2,0);off(rows-1,cols-1);
    } else if (id === "flower_cross") {
      const mr=Math.floor(rows/2),mc=Math.floor(cols/2); off(mr-1,mc-1);off(mr-1,mc);off(mr,mc-1);off(mr,mc);
      off(0,0);off(0,cols-1);off(rows-1,0);off(rows-1,cols-1);
    } else if (id === "twin_islands") {
      const c=Math.floor(cols/2)-1; for(let r=0;r<rows;r++) if(![1,4,6].includes(r)){off(r,c);off(r,c+1);}
    }
    return mask;
  }

  function topologyFor(rng, level, difficulty, config) {
    const b=config.board||{}; if(level < Number(b.topologyUnlockLevel||6)) return {id:"classic",mask:topologyMask(Number(b.rows)||8,Number(b.cols)||8,"classic")};
    const weights={...(b.topologyWeights||{classic:1})};
    if(difficulty.normalized<.28){weights.classic=(weights.classic||1)*2.2;weights.twin_islands=0;weights.split_garden=(weights.split_garden||0)*.35;}
    if(difficulty.normalized>.7){weights.ring_bed=(weights.ring_bed||0)*1.35;weights.twin_islands=(weights.twin_islands||0)*1.5;weights.flower_cross=(weights.flower_cross||0)*1.25;}
    const id=Core.weightedId(rng,weights)||"classic",rows=Number(b.rows)||8,cols=Number(b.cols)||8,mask=topologyMask(rows,cols,id);
    const minimum=Number(b.minimumActiveCells)||38; if(mask.filter(Boolean).length<minimum)return{id:"classic",mask:topologyMask(rows,cols,"classic")};
    return{id,mask};
  }

  function fillSwapBoardMasked(rng, rows, cols, pool, weights, mask) {
    const board = new Array(rows * cols).fill(null); const idx=(r,c)=>r*cols+c;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const at=idx(r,c); if(!mask[at]) continue; const banned=new Set();
      if(c>=2&&mask[idx(r,c-1)]&&mask[idx(r,c-2)]&&board[idx(r,c-1)]===board[idx(r,c-2)])banned.add(board[idx(r,c-1)]);
      if(r>=2&&mask[idx(r-1,c)]&&mask[idx(r-2,c)]&&board[idx(r-1,c)]===board[idx(r-2,c)])banned.add(board[idx(r-1,c)]);
      let candidates=pool.filter(id=>!banned.has(id));if(!candidates.length)candidates=pool;board[at]=weightedIngredient(rng,candidates,weights);
    }
    return board;
  }

  function generateBoard(rng, mode, pool, weights, config, topology) {
    const b=config.board||{},rows=Number(b.rows)||8,cols=Number(b.cols)||8,attempts=Number(b.maxGenerationAttempts)||240,mask=topology?.mask||topologyMask(rows,cols,"classic");
    for(let attempt=0;attempt<attempts;attempt++){
      const board=mode==="swap"?fillSwapBoardMasked(rng,rows,cols,pool,weights,mask):Array.from({length:rows*cols},(_,i)=>mask[i]?weightedIngredient(rng,pool,weights):null);
      if(mode==="swap"){
        if(!matchSet(board,rows,cols).size&&legalSwapExists(board,rows,cols))return{rows,cols,cells:board,activeMask:mask,topology:topology?.id||"classic",generationAttempts:attempt+1,startsPlayable:true};
      }else if(traceChainExists(board,rows,cols,Number((config.trace||{}).minimumChain)||3))return{rows,cols,cells:board,activeMask:mask,topology:topology?.id||"classic",generationAttempts:attempt+1,startsPlayable:true};
    }
    throw new Error("Unable to generate a playable Ingredient Garden board for this seed/configuration.");
  }

  function programFor(rng,level,difficulty,config){
    const defs=[
      {id:'calm_beds',unlock:1,weight:2.4,focus:null,description:'Open beds with light garden pressure.'},
      {id:'petal_release',unlock:14,weight:2.6,focus:'flower',description:'Strip flower petals to release protected ingredients.'},
      {id:'vine_watch',unlock:18,weight:2.7,focus:'vine',description:'Cut creeping vines before they lock more ingredients.'},
      {id:'muddy_patch',unlock:20,weight:2.0,focus:'mud',description:'Sticky mud and soft ground create a slower, messier planting bed.'},
      {id:'honey_hive',unlock:22,weight:2.15,focus:'honey',description:'Honey traps ingredients while bees drift between protected cells.'},
      {id:'quicksand_bog',unlock:26,weight:1.75,focus:'quicksand',description:'Quicksand periodically sinks unattended ingredients and forces quick rescues.'},
      {id:'thorn_maze',unlock:32,weight:2.0,focus:'thorn',description:'Layered thorns turn the board into a pruning puzzle.'},
      {id:'cascade_orchard',unlock:24,weight:2.0,focus:'cascade',description:'Pre-seeded specials reward deliberate chain reactions.'},
      {id:'relay_greenhouse',unlock:Number(config.multiBoard?.unlockLevel||18),weight:2.1,focus:'relay',description:'A linked mini-garden feeds effects into the main bed.'},
      {id:'mixed_ecology',unlock:48,weight:2.0,focus:'mixed',description:'Flowers, vines, bees, honey, mud, thorns, and cascades interact together.'}
    ].filter(x=>level>=x.unlock);
    const chosen=Core.weightedPick(rng,defs,x=>x.weight*(x.id==='mixed_ecology'?(.5+difficulty.normalized):1))||defs[0];return Core.clone(chosen);
  }

  function blockersFor(rng, level, difficulty, board, config, program) {
    const rules=config.blockers||{},hazards=config.hazards||{},available=(rules.types||[]).filter(x=>level>=Number(x.unlockLevel||1));if(!available.length)return[];
    const raw=Math.floor(difficulty.normalized*(Number(rules.countDifficultyWeight)||8)+Math.log2(level+1)*(Number(rules.levelLog2Weight)||.7)-3),count=Math.floor(Core.clamp(raw,0,Number(rules.maximumCells)||14));
    const rows=board.rows,cols=board.cols,eligible=(board.activeMask||board.cells.map(Boolean)).map((ok,i)=>ok&&board.cells[i]?i:null).filter(i=>i!=null),open=new Set(eligible),out=[];
    const typeWeight=x=>{let w=Number(x.weight)||1;if(program?.focus===x.id)w*=3.2;if(program?.focus==='mixed'&&['flower','vine','thorn','mud','quicksand','honey','bee'].includes(x.id))w*=1.65;if(program?.focus==='cascade'&&['concrete','chain'].includes(x.id))w*=.55;return w};
    const edge=i=>{const r=Math.floor(i/cols),c=i%cols;return r===0||c===0||r===rows-1||c===cols-1};
    const centerScore=i=>{const r=Math.floor(i/cols),c=i%cols;return Math.abs(r-(rows-1)/2)+Math.abs(c-(cols-1)/2)};
    for(let k=0;k<count&&open.size>12;k++){
      const type=Core.weightedPick(rng,available,typeWeight);if(!type)break;let candidates=[...open];
      if(type.id==='vine'){const e=candidates.filter(edge);if(e.length)candidates=e;}
      else if(type.id==='mud'||type.id==='quicksand'){
        const low=candidates.filter(i=>Math.floor(i/cols)>=Math.floor(rows*.45));if(low.length)candidates=low;
      }
      else if(type.id==='honey'){
        const mid=candidates.slice().sort((a,b)=>centerScore(a)-centerScore(b));candidates=mid.slice(0,Math.max(6,Math.ceil(mid.length*.65)));
      }
      else if(type.id==='bee'){
        const anchors=out.filter(x=>['flower','honey'].includes(x.type)).map(x=>x.cell);if(anchors.length){const near=candidates.filter(i=>anchors.some(f=>{const a=Math.floor(i/cols),b=i%cols,c=Math.floor(f/cols),d=f%cols;return Math.abs(a-c)+Math.abs(b-d)<=2}));if(near.length)candidates=near;}
      }
      else if(type.id==='flower'){
        const flowers=out.filter(x=>x.type==='flower').map(x=>x.cell);if(flowers.length){const near=new Set();for(const f of flowers){const r=Math.floor(f/cols),c=f%cols;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc,n=rr*cols+cc;if(rr>=0&&rr<rows&&cc>=0&&cc<cols&&open.has(n))near.add(n)}}if(near.size)candidates=[...near];}
        else candidates.sort((a,b)=>centerScore(a)-centerScore(b));
      } else if(type.id==='thorn'){
        const flowers=out.filter(x=>x.type==='flower').map(x=>x.cell);if(flowers.length){const near=candidates.filter(i=>flowers.some(f=>{const a=Math.floor(i/cols),b=i%cols,c=Math.floor(f/cols),d=f%cols;return Math.abs(a-c)+Math.abs(b-d)<=2}));if(near.length)candidates=near;}
      }
      const span=type.id==='flower'&&!out.some(x=>x.type==='flower')?Math.max(1,Math.ceil(candidates.length*.38)):candidates.length,cell=candidates[Math.floor(rng()*span)];if(cell==null)continue;open.delete(cell);let layer=Core.int(rng,1,Math.max(1,Number(type.maxLayer)||1));if(type.id==='flower'){const f=hazards.flower||{};layer=Core.int(rng,Number(f.minPetals)||2,Number(f.maxPetals)||4);}else if(type.id==='honey'){const h=hazards.honey||{};layer=Core.int(rng,Number(h.minLayers)||1,Number(h.maxLayers)||3);}else if(type.id==='quicksand'){const q=hazards.quicksand||{};layer=Core.int(rng,Number(q.minDepth)||1,Number(q.maxDepth)||3);}out.push({cell,type:type.id,layer});
    }
    return out;
  }

  function seedInitialSpecials(rng,board,difficulty,program){
    let count=program?.focus==='cascade'?Math.max(1,Math.round(1+difficulty.normalized*2)):difficulty.normalized>.74?1:0;if(!count)return[];const cells=(board.activeMask||[]).map((ok,i)=>ok&&board.cells[i]?i:null).filter(i=>i!=null),types=['row','col','area'];const out=[];for(const i of Core.shuffle(rng,cells).slice(0,count))out.push({cell:i,special:types[Core.int(rng,0,types.length-1)]});return out;
  }

  function satelliteFor(rng,level,difficulty,pool,weights,config,program){
    const m=config.multiBoard||{};if(m.enabled===false||level<Number(m.unlockLevel||18))return null;const chance=program?.focus==='relay'?1:Math.min(.88,Number(m.baseChance||.18)+difficulty.normalized*Number(m.difficultyChanceBonus||.42));if(rng()>chance)return null;
    const defs=m.layouts||[{id:"pollinator_plot",rows:4,cols:4,weight:1}],def=Core.weightedPick(rng,defs,x=>Number(x.weight)||1)||defs[0],rows=Math.max(3,Number(def.rows)||4),cols=Math.max(3,Number(def.cols)||4),cells=Array.from({length:rows*cols},()=>weightedIngredient(rng,pool,weights));
    // Guarantee at least one immediate 3+ cluster so the relay starts actionable.
    if(cells.length>=3){const id=weightedIngredient(rng,pool,weights);cells[0]=id;cells[1]=id;cells[cols]=id;}
    return{id:def.id||"pollinator_plot",rows,cols,cells,charges:Number(m.startingCharges)||1,maxCharges:Number(m.maxCharges)||4,effectMap:Core.clone(m.effectMap||{})};
  }

  function scoreThresholds(objectives, limit, difficulty, config) {
    const scoring = config.scoring || {};
    const total = requiredMatchedTiles(objectives);
    const objectiveValue = total * ((Number(scoring.pointsPerCleared) || 100) + (Number(scoring.targetBonusPerCleared) || 75));
    const efficiency = limit.type === "moves" ? (limit.moves || 20) * 25 : Math.round((limit.timeSeconds || 90) * 5);
    const base = Math.max(1000, Math.round(objectiveValue + efficiency + difficulty.normalized * 1200));
    const multipliers = scoring.starMultipliers || [0.65, 1, 1.35];
    return multipliers.map(function (m) { return Math.max(1, Math.round(base * Number(m))); });
  }

  function freeBoosterEligibility(result, config) {
    const hp = config.highPerformance || {};
    return !!(
      (hp.threeStars && Number(result.stars) >= 3) ||
      Number(result.bestChain || 0) >= Number(hp.traceChainAtLeast || 12) ||
      Number(result.bestCombo || 0) >= Number(hp.comboAtLeast || 5) ||
      Number(result.remainingLimitRatio || 0) >= Number(hp.remainingLimitRatioAtLeast || 0.35) ||
      (!!result.newPersonalBest && hp.personalBestRequiredForBestRule !== false)
    );
  }

  function chooseFreeBooster(seed, level, boostersConfig) {
    const rng = Core.rngFromSeed(Core.makeSeed("free-booster", seed, level));
    const boosters = (boostersConfig && boostersConfig.boosters || []).filter(function (b) { return level >= Number(b.unlockLevel || 1); });
    const weights = (boostersConfig && boostersConfig.freeAwardWeights) || {};
    const selected = Core.weightedPick(rng, boosters, function (b) { return Number(weights[b.id]) || 1; });
    return selected ? selected.id : null;
  }

  function generateLevel(options) {
    options = options || {};
    const config = options.config || {};
    const ingredientCatalog = options.ingredientCatalog || { ingredients: [] };
    const recipeCatalog = options.recipeCatalog || null;
    const level = Math.max(1, Math.floor(Number(options.level) || 1));
    const runSeed = String(options.runSeed == null ? ("level-" + level) : options.runSeed);
    let recipe = options.recipe ? Core.clone(options.recipe) : RecipeBridge.selectRecipe({ level: level, runSeed: runSeed, catalog: recipeCatalog, excludeRecipeIds: options.excludeRecipeIds });
    const allowedIds = (ingredientCatalog.allowedIngredientIds || RecipeBridge.ingredientIdsFrom(recipeCatalog));
    RecipeBridge.validateRecipe(recipe, allowedIds);
    const seed = Core.makeSeed("ingredient-garden-level", level, runSeed, recipe.id);
    const rng = Core.rngFromSeed(seed);
    // Interaction family is level-stable even when a replay creates a new run seed.
    const mode = modeFor(Core.rngFromSeed(Core.makeSeed("ingredient-garden-mode", level)), config);
    const objectives = RecipeBridge.computeObjectives(recipe, { level: level, runSeed: runSeed, fishInventory: options.fishInventory || {} }, config, ingredientCatalog);
    const fishMod = 1;
    const difficulty = difficultyFor(level, recipe, objectives, fishMod, config);
    const limit = chooseLimit(rng, level, difficulty, objectives, recipe, options.accessibility || {}, config, mode);
    const pool = activeIngredientPool(rng, recipe, objectives, ingredientCatalog, difficulty, config);
    const weights = spawnWeights(pool, objectives, config);
    const program = programFor(rng, level, difficulty, config);
    const topology = topologyFor(rng, level, difficulty, config);
    const board = generateBoard(rng, mode, pool, weights, config, topology);
    const blockers = blockersFor(rng, level, difficulty, board, config, program);
    const initialSpecials = seedInitialSpecials(rng, board, difficulty, program);
    const satelliteBoard = satelliteFor(rng, level, difficulty, pool, weights, config, program);
    const thresholds = scoreThresholds(objectives, limit, difficulty, config);
    const requiresFishing = RecipeBridge.requiresFishing(recipe, (config.fishing || {}).fishIngredientIds);
    const soloOrDuo = options.soloOrDuo === "duo" ? "duo" : "solo";
    return Core.clone({
      schemaVersion: 1,
      engine: "feed-him-meow-ingredient-garden-randomizer",
      level: level,
      seed: seed,
      runSeed: runSeed,
      mode: mode,
      recipeId: recipe.id,
      recipeName: recipe.name,
      recipeIngredients: recipe.ingredients,
      fishRequired: requiresFishing ? RecipeBridge.fishRequirements(recipe, (config.fishing || {}).fishIngredientIds) : [],
      fishInventory: options.fishInventory || {},
      fishingPerformance: options.fishingPerformance || null,
      fishingDifficultyModifier: fishMod,
      difficulty: difficulty,
      recipeDifficulty: Math.max(1, Number(recipe.difficulty) || 1),
      ingredientPoolPolicy: 'catalog.minimumDifficulty <= recipe.difficulty',
      gardenOutstanding: objectives,
      totalOutstandingUnits: sumOutstanding(objectives),
      activeIngredientPool: pool,
      spawnWeights: weights,
      limitType: limit.type,
      movesRemaining: limit.moves,
      timeRemaining: limit.timeSeconds,
      plannedMoves: Math.max(1, Number(limit.plannedMoves) || 1),
      requiredMatchedTiles: Math.max(1, Number(limit.requiredMatchedTiles) || requiredMatchedTiles(objectives)),
      expectedObjectiveTilesPerTurn: Math.max(1, Number(limit.expectedObjectiveTilesPerTurn) || (mode === "trace" ? 4 : 2.2)),
      ingredientYieldRate: RecipeBridge.yieldRateForLevel(level, config),
      ingredientYieldPercent: Math.round(RecipeBridge.yieldRateForLevel(level, config) * 100),
      recipeRequirementMultiplier: Math.max(1, Number(config.pacing && config.pacing.recipeRequirementMultiplier) || 1),
      objectiveMultiplier: Math.max(1, Number(config.pacing && config.pacing.objectiveMultiplier) || 1),
      runType: options.runType || "full",
      board: board,
      topology: topology.id,
      levelProgram: program,
      initialSpecials: initialSpecials,
      blockers: blockers,
      satelliteBoard: satelliteBoard,
      hazards: {
        vineCreepEveryTurns: Number(config.hazards?.vine?.creepEveryTurns)||2,
        beeMoveEveryTurns: Number(config.hazards?.bee?.moveEveryTurns)||3,
        quicksandSinkEveryTurns: Number(config.hazards?.quicksand?.sinkEveryTurns)||3,
        hazardClock: Core.clone(config.hazards?.hazardClock||{})
      },
      scoring: { starThresholds: { one: thresholds[0], two: thresholds[1], three: thresholds[2] }, pointsPerCleared: (config.scoring || {}).pointsPerCleared || 100 },
      soloOrDuo: soloOrDuo,
      activePlayer: soloOrDuo === "duo" ? ((config.duo || {}).firstPlayer || "Jasper") : null,
      nextDuoPlayer: soloOrDuo === "duo" ? ((config.duo || {}).secondPlayer || "William") : null,
      score: 0,
      stars: 0,
      wallet: Currency.normalize(options.wallet || {}),
      boosterInventory: Core.clone(options.boosterInventory || {}),
      bestScore: Math.max(0, Number(options.bestScore) || 0),
      bestStars: Math.floor(Core.clamp(options.bestStars || 0, 0, 3)),
      accessibility: Core.clone(options.accessibility || {}),
      generatedForReplay: !!options.isReplay
    });
  }

  function generateLevelBatch(accountLevel, pathConfig) {
    const perBatch = Math.max(1, Number(pathConfig && pathConfig.visibleLevelsPerPath) || Number(pathConfig && pathConfig.visibleLevelsPerBatch) || 45);
    accountLevel = Math.max(1, Math.floor(Number(accountLevel) || 1));
    const batch = Math.floor((accountLevel - 1) / perBatch) + 1;
    const start = (batch - 1) * perBatch + 1;
    const positions = (pathConfig && pathConfig.positions) || [];
    return Array.from({ length: perBatch }, function (_, i) {
      const level = start + i;
      const pos = positions[i] || { slot: i + 1, x: null, y: null };
      return { slot: i + 1, level: level, x: pos.x, y: pos.y, state: level < accountLevel ? "completed" : (level === accountLevel ? "current" : "locked") };
    });
  }

  function nextDuoPlayer(current, config) {
    const duo = (config && config.duo) || {};
    const first = duo.firstPlayer || "Jasper", second = duo.secondPlayer || "William";
    return current === first ? second : first;
  }

  return Object.freeze({
    version: "2.3.0-pass22-fractional-yield-dynamic-limits", generateLevel: generateLevel, generateLevelBatch: generateLevelBatch,
    freeBoosterEligibility: freeBoosterEligibility, chooseFreeBooster: chooseFreeBooster,
    nextDuoPlayer: nextDuoPlayer, matchSet: matchSet, legalSwapExists: legalSwapExists,
    traceChainExists: traceChainExists
  });
});
