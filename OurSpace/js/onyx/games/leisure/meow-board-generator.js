/* A recipe owns a growing sequence of puzzle boards. The 50 authored boards
   supply masks and mechanics, while each visit gets a new opening and terrain. */
(function(root){'use strict';
  const Pack=root.GardenBoardPack;
  const PREFIX='meow.retro.board-sequence.v1.';
  const memory=new Map();
  const key=(x,y)=>x+':'+y;
  const hash=text=>{let h=2166136261;for(const ch of String(text)){h=Math.imul(h^ch.charCodeAt(0),16777619)}return h>>>0};
  const rng=seed=>{let x=seed>>>0;return()=>((x=Math.imul(x,1664525)+1013904223>>>0)/4294967296)};
  const shuffled=(items,random)=>{const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  function reserve(recipeId){
    if(!recipeId)throw new Error('A recipe ID is required to generate a board.');
    const storageKey=PREFIX+encodeURIComponent(recipeId);
    let persisted=0n;
    try{const raw=root.localStorage?.getItem(storageKey);if(raw&&/^\d+$/.test(raw))persisted=BigInt(raw)}catch(_){}
    const next=(persisted>(memory.get(storageKey)||0n)?persisted:(memory.get(storageKey)||0n))+1n;
    memory.set(storageKey,next);
    try{root.localStorage?.setItem(storageKey,String(next))}catch(_){}
    return next;
  }
  function protectedCells(def){
    const cells=new Set();
    for(const marker of def.mechanicMarkers||[])cells.add(key(marker.x,marker.y));
    for(const piece of def.specialPieces||[])cells.add(key(piece.x,piece.y));
    for(const linked of def.satelliteBoards||[]){
      const effect=linked.effect||{};
      for(const cell of [...(effect.cells||[]),...(effect.entryCells||[]),...(effect.exitCell?[effect.exitCell]:[])])cells.add(key(cell.x,cell.y));
    }
    return cells;
  }
  function openingPocket(def,random,protectedSet){
    const options=[];
    for(const [width,height,mode] of [[3,2,'row'],[2,3,'column']])
      for(let y=0;y<=def.size.height-height;y++)for(let x=0;x<=def.size.width-width;x++){
        const cells=[];
        for(let dy=0;dy<height;dy++)for(let dx=0;dx<width;dx++)cells.push({x:x+dx,y:y+dy});
        if(cells.some(c=>def.rows[c.y]?.[c.x]!=='1'||protectedSet.has(key(c.x,c.y))))continue;
        const occupied=cells.reduce((sum,c)=>sum+(def.blockers||[]).some(b=>b.x===c.x&&b.y===c.y)+(def.hazards||[]).some(h=>h.x===c.x&&h.y===c.y),0);
        options.push({cells,mode,occupied});
      }
    if(!options.length)throw new Error('Board type '+def.number+' has no playable opening.');
    const min=Math.min(...options.map(x=>x.occupied));
    const best=options.filter(x=>x.occupied===min);
    return best[Math.floor(random()*best.length)];
  }
  function varyTerrain(def,pocket,protectedSet,random){
    const avoid=new Set(pocket.map(c=>key(c.x,c.y)));
    const occupied=new Set();
    const source=[...(def.blockers||[]).map(x=>({type:'blockers',value:x})),...(def.hazards||[]).map(x=>({type:'hazards',value:x}))];
    const result={blockers:[],hazards:[]};
    for(const item of source)if(protectedSet.has(key(item.value.x,item.value.y))&&!avoid.has(key(item.value.x,item.value.y))){
      result[item.type].push(item.value);occupied.add(key(item.value.x,item.value.y));
    }
    const available=shuffled(def.rows.flatMap((row,y)=>[...row].flatMap((cell,x)=>cell==='1'&&!avoid.has(key(x,y))&&!protectedSet.has(key(x,y))&&!occupied.has(key(x,y))?[{x,y}]:[])),random);
    for(const item of shuffled(source.filter(x=>!protectedSet.has(key(x.value.x,x.value.y))||avoid.has(key(x.value.x,x.value.y))),random)){
      const pos=available.pop();if(!pos)throw new Error('No space for authored terrain on board type '+def.number);
      result[item.type].push({...item.value,x:pos.x,y:pos.y});
    }
    def.blockers=result.blockers;def.hazards=result.hazards;
  }
  function next(recipeId,phase){
    if(phase!=='market'&&phase!=='garden')throw new Error('Unknown puzzle phase.');
    const ordinal=reserve(recipeId),offset=BigInt(hash(recipeId)%50);
    const number=Number((ordinal-1n+offset)%50n)+1;
    const def=Pack.get('board-type'+number);
    if(!def)throw new Error('Missing board type '+number);
    const seed=hash(recipeId+':'+phase+':'+ordinal);
    const random=rng(seed),protectedSet=protectedCells(def);
    // Keep the pocket in fixed cells for this recipe and template. The base-three
    // code then occupies the same coordinates on every return to this type.
    const pocket=openingPocket(def,rng(hash(recipeId+':board-type'+number+':pocket')),protectedSet);
    varyTerrain(def,pocket.cells,protectedSet,random);
    def.seed=seed;def.id='generated-'+encodeURIComponent(recipeId)+'-'+ordinal+'-'+phase;def.name+=' · #'+ordinal;
    def.generation={recipeId,phase,serial:String(ordinal),templateId:'board-type'+number,cycle:String((ordinal-1n)/50n),pocket:pocket.cells,pocketMode:pocket.mode};
    return def;
  }
  function opening(game){
    const def=game.def,meta=def.generation;
    if(!meta)return false;
    const palette=game.palette||def.ingredientPalette;
    if(palette.length<6)throw new Error('Generated boards need six available ingredients.');
    const pocket=meta.pocket,openingCells=new Set(pocket.map(c=>key(c.x,c.y)));
    const coords=[];
    for(let y=0;y<def.size.height;y++)for(let x=0;x<def.size.width;x++){
      if(game.grid[y]?.[x]&&!openingCells.has(key(x,y)))coords.push({x,y});
    }
    // Affine arithmetic in base three is reversible while the counter fits the
    // board. Each recipe/template pair owns a fixed permutation, so successive
    // visits change many ingredient cells without risking an earlier opening.
    const saltRng=rng(hash(meta.recipeId+':'+meta.templateId+':opening'));
    let capacity=1n,salt=0n,multiplier=0n;
    for(let i=0;i<coords.length;i++){
      salt+=BigInt(Math.floor(saltRng()*3))*capacity;
      const digit=i===0?1+Math.floor(saltRng()*2):Math.floor(saltRng()*3);
      multiplier+=BigInt(digit)*capacity;
      capacity*=3n;
    }
    const cycle=BigInt(meta.cycle),overflow=cycle>=capacity;
    let encoded=(cycle*multiplier+salt)%capacity;
    for(const {x,y} of coords){
      const digit=Number(encoded%3n);encoded/=3n;
      game.grid[y][x].piece=((x+y)%2)*3+digit;
    }
    // A B A / C A D has an immediate Market trace via the two diagonals.
    // Swapping the middle pair creates a Garden row of three A tiles.
    const A=def.seed%6,B=(A+1)%6,C=(A+2)%6,D=(A+3)%6;
    const pattern=meta.pocketMode==='column'?[A,C,B,A,A,D]:[A,B,A,C,A,D];
    pattern.forEach((piece,i)=>{game.grid[pocket[i].y][pocket[i].x].piece=piece});
    if(game.findMatches){
      if(game.findMatches().cells.size||!game.ensureMove())throw new Error('Generated Garden opening has no legal swap.');
      game.renderAll();
    }else{
      if(!game.hasChain())throw new Error('Generated Market opening has no legal trace.');
      game.refresh();
    }
    // The serial is shown on the board, even beyond the enormous unique tile
    // encoding range. It also distinguishes a new visit if storage is restored.
    const board=game.shell||game.root;
    if(board){board.dataset.boardSerial=meta.serial;board.dataset.boardType=meta.templateId;}
    return {encodedCells:coords.length,overflow};
  }
  root.MEOWBoardGenerator=Object.freeze({next,opening});
})(window);
