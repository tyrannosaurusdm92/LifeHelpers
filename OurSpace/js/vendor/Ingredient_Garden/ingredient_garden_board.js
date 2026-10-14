(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.IngredientGardenBoard=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const clonePiece=p=>p?{id:p.id,special:p.special||null}:null;
  const pieceId=p=>p&&p.id||null;
  function xy(i,cols){return{r:Math.floor(i/cols),c:i%cols};}
  function index(r,c,cols){return r*cols+c;}
  function inside(r,c,rows,cols){return r>=0&&r<rows&&c>=0&&c<cols;}
  function adjacent(a,b,cols,diagonal){const A=xy(a,cols),B=xy(b,cols),dr=Math.abs(A.r-B.r),dc=Math.abs(A.c-B.c);return diagonal?(dr<=1&&dc<=1&&(dr+dc)>0):(dr+dc===1);}
  function orthogonalNeighbors(i,rows,cols){const {r,c}=xy(i,cols),out=[];for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const rr=r+dr,cc=c+dc;if(inside(rr,cc,rows,cols))out.push(index(rr,cc,cols));}return out;}
  function eightNeighbors(i,rows,cols){const {r,c}=xy(i,cols),out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc;if(inside(rr,cc,rows,cols))out.push(index(rr,cc,cols));}return out;}
  function swap(board,a,b){const t=board[a];board[a]=board[b];board[b]=t;return board;}

  function runs(board,rows,cols){
    const out=[];
    for(let r=0;r<rows;r++){
      let s=0;
      while(s<cols){
        const id=pieceId(board[index(r,s,cols)]);let e=s+1;
        while(e<cols&&id&&pieceId(board[index(r,e,cols)])===id)e++;
        if(id&&e-s>=3)out.push({id,orientation:'row',indices:Array.from({length:e-s},(_,k)=>index(r,s+k,cols))});
        s=e;
      }
    }
    for(let c=0;c<cols;c++){
      let s=0;
      while(s<rows){
        const id=pieceId(board[index(s,c,cols)]);let e=s+1;
        while(e<rows&&id&&pieceId(board[index(e,c,cols)])===id)e++;
        if(id&&e-s>=3)out.push({id,orientation:'col',indices:Array.from({length:e-s},(_,k)=>index(s+k,c,cols))});
        s=e;
      }
    }
    return out;
  }
  function matchSet(board,rows,cols){const s=new Set();runs(board,rows,cols).forEach(run=>run.indices.forEach(i=>s.add(i)));return s;}

  function matchGroups(runsList){
    const groups=[];
    for(const run of runsList||[]){
      const rset=new Set(run.indices);
      const touching=[];
      for(let gi=0;gi<groups.length;gi++){
        const g=groups[gi];
        if(g.id!==run.id)continue;
        if(run.indices.some(i=>g.indexSet.has(i)))touching.push(gi);
      }
      if(!touching.length){
        groups.push({id:run.id,runs:[run],indexSet:rset});
        continue;
      }
      const base=groups[touching[0]];
      base.runs.push(run);run.indices.forEach(i=>base.indexSet.add(i));
      for(let x=touching.length-1;x>=1;x--){
        const gi=touching[x],other=groups[gi];
        other.runs.forEach(r=>base.runs.push(r));other.indexSet.forEach(i=>base.indexSet.add(i));
        groups.splice(gi,1);
      }
    }
    return groups.map(g=>({id:g.id,runs:g.runs,indices:[...g.indexSet]}));
  }

  function specialForGroup(group,preferred=[]){
    if(!group?.runs?.length)return null;
    const membership=new Map();
    group.runs.forEach(run=>run.indices.forEach(i=>{
      const x=membership.get(i)||{row:false,col:false};x[run.orientation]=true;membership.set(i,x);
    }));
    const intersections=[...membership.entries()].filter(([,x])=>x.row&&x.col).map(([i])=>i);
    if(intersections.length){
      const at=preferred.find(i=>intersections.includes(i))??intersections[0];
      return{at,special:'area',group};
    }
    const longest=[...group.runs].sort((a,b)=>b.indices.length-a.indices.length)[0];
    const preferredHit=preferred.find(i=>longest.indices.includes(i));
    const at=preferredHit!=null?preferredHit:longest.indices[Math.floor(longest.indices.length/2)];
    if(longest.indices.length>=5)return{at,special:'color',group};
    if(longest.indices.length===4)return{at,special:longest.orientation==='row'?'row':'col',group};
    return null;
  }

  function specialsForRuns(runsList,preferred=[]){
    return matchGroups(runsList).map(g=>specialForGroup(g,preferred)).filter(Boolean);
  }
  function chooseSpecial(runsList,preferred=[]){return specialsForRuns(runsList,preferred)[0]||null;}

  function legalSwaps(board,rows,cols){
    const out=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const a=index(r,c,cols);
      for(const [rr,cc] of [[r,c+1],[r+1,c]]){
        if(rr>=rows||cc>=cols)continue;const b=index(rr,cc,cols);if(!board[a]||!board[b])continue;
        if(board[a].special||board[b].special){out.push([a,b]);continue;}
        const copy=board.map(clonePiece);swap(copy,a,b);if(matchSet(copy,rows,cols).size)out.push([a,b]);
      }
    }
    return out;
  }

  function component(board,start,rows,cols,diagonal=true){
    if(!board[start])return[];const id=pieceId(board[start]),seen=new Set(),stack=[start];
    while(stack.length){
      const p=stack.pop();if(seen.has(p)||pieceId(board[p])!==id)continue;seen.add(p);
      const ns=diagonal?eightNeighbors(p,rows,cols):orthogonalNeighbors(p,rows,cols);
      ns.forEach(n=>{if(!seen.has(n)&&pieceId(board[n])===id)stack.push(n);});
    }
    return[...seen];
  }
  function traceExists(board,rows,cols,min=3){for(let i=0;i<board.length;i++)if(component(board,i,rows,cols,true).length>=min)return true;return false;}
  function findTraceHint(board,rows,cols,min=3){
    for(let i=0;i<board.length;i++){
      const comp=component(board,i,rows,cols,true);if(comp.length<min)continue;const id=pieceId(board[i]),path=[i],used=new Set(path);
      while(path.length<Math.min(comp.length,Math.max(min,5))){
        const last=path[path.length-1];
        const next=comp.find(n=>!used.has(n)&&adjacent(last,n,cols,true)&&pieceId(board[n])===id);
        if(next==null)break;path.push(next);used.add(next);
      }
      if(path.length>=min)return path;
    }
    return null;
  }

  function addRow(out,r,cols){if(r<0)return;for(let c=0;c<cols;c++)out.add(index(r,c,cols));}
  function addCol(out,c,rows,cols){if(c<0)return;for(let r=0;r<rows;r++)out.add(index(r,c,cols));}
  function addArea(out,at,rows,cols,radius=1){const {r,c}=xy(at,cols);for(let dr=-radius;dr<=radius;dr++)for(let dc=-radius;dc<=radius;dc++){const rr=r+dr,cc=c+dc;if(inside(rr,cc,rows,cols))out.add(index(rr,cc,cols));}}

  function expandSpecials(board,seedSet,rows,cols,colorSwapId=null){
    const out=new Set(seedSet),queue=[...out],seen=new Set();
    while(queue.length){
      const i=queue.shift();if(seen.has(i))continue;seen.add(i);const p=board[i];if(!p||!p.special)continue;
      const add=new Set(),{r,c}=xy(i,cols);
      if(p.special==='row')addRow(add,r,cols);
      else if(p.special==='col')addCol(add,c,rows,cols);
      else if(p.special==='area')addArea(add,i,rows,cols,1);
      else if(p.special==='color'){
        const target=colorSwapId||p.id;
        board.forEach((q,n)=>{if(q&&q.id===target)add.add(n);});
      }
      add.forEach(n=>{if(!out.has(n)){out.add(n);queue.push(n);}});
    }
    return out;
  }

  function lineAreaCombo(out,lineAt,lineType,areaAt,rows,cols){
    const A=xy(areaAt,cols);
    if(lineType==='row'){
      for(let dr=-1;dr<=1;dr++){const rr=A.r+dr;if(rr>=0&&rr<rows)addRow(out,rr,cols);}
    }else{
      for(let dc=-1;dc<=1;dc++){const cc=A.c+dc;if(cc>=0&&cc<cols)addCol(out,cc,rows,cols);}
    }
    addArea(out,areaAt,rows,cols,1);out.add(lineAt);
  }

  // The board is already in post-swap state. Donor pass 3 expands non-color
  // special combinations explicitly instead of treating every combination as
  // two unrelated single activations.
  function specialSwapClear(board,a,b,rows,cols){
    const A=board[a],B=board[b];if(!A||!B||(!A.special&&!B.special))return null;
    if(A.special==='color'&&B.special==='color'){
      return{clear:new Set(board.map((p,i)=>p?i:null).filter(i=>i!=null)),label:'double-color'};
    }
    const colorAt=A.special==='color'?a:(B.special==='color'?b:null);
    if(colorAt!=null){
      const otherAt=colorAt===a?b:a,other=board[otherAt],target=other?.id||null,seed=new Set([colorAt,otherAt]);
      if(!target)return{clear:seed,label:'color'};
      if(other?.special&&other.special!=='color'){
        board.forEach((p,i)=>{if(p&&p.id===target){p.special=other.special;seed.add(i);}});
        return{clear:expandSpecials(board,seed,rows,cols,target),label:'color-'+other.special,colorTarget:target};
      }
      board.forEach((p,i)=>{if(p&&p.id===target)seed.add(i);});
      return{clear:expandSpecials(board,seed,rows,cols,target),label:'color',colorTarget:target};
    }

    if(A.special&&B.special){
      const out=new Set([a,b]),types=[A.special,B.special];
      if(A.special==='area'&&B.special==='area'){
        addArea(out,a,rows,cols,2);addArea(out,b,rows,cols,2);
        return{clear:expandSpecials(board,out,rows,cols),label:'area+area'};
      }
      if((A.special==='area'&&['row','col'].includes(B.special))||(B.special==='area'&&['row','col'].includes(A.special))){
        const areaAt=A.special==='area'?a:b,lineAt=A.special==='area'?b:a,lineType=A.special==='area'?B.special:A.special;
        lineAreaCombo(out,lineAt,lineType,areaAt,rows,cols);
        return{clear:expandSpecials(board,out,rows,cols),label:'area+'+lineType};
      }
      // Row/column pairs become an explicit cross / double-line event.
      if(['row','col'].includes(A.special)&&['row','col'].includes(B.special)){
        const pa=xy(a,cols),pb=xy(b,cols);
        if(A.special==='row')addRow(out,pa.r,cols);else addCol(out,pa.c,rows,cols);
        if(B.special==='row')addRow(out,pb.r,cols);else addCol(out,pb.c,rows,cols);
        return{clear:expandSpecials(board,out,rows,cols),label:types.join('+')};
      }
    }
    return{clear:expandSpecials(board,new Set([a,b]),rows,cols),label:[A.special,B.special].filter(Boolean).join('+')||'special'};
  }

  function collapseDetailed(board,rows,cols,makePiece){
    const moves=[],spawns=[];
    for(let c=0;c<cols;c++){
      const kept=[];
      for(let r=rows-1;r>=0;r--){
        const from=index(r,c,cols),p=board[from];
        if(p)kept.push({piece:p,from});
      }
      let k=0,spawnOrder=0;
      for(let r=rows-1;r>=0;r--){
        const to=index(r,c,cols);
        if(k<kept.length){
          const item=kept[k++];
          board[to]=item.piece;
          if(item.from!==to)moves.push({from:item.from,to,distance:Math.abs(xy(item.from,cols).r-r)});
        }else{
          const p=makePiece();board[to]=p;
          spawns.push({to,fromRow:-(++spawnOrder),distance:r+spawnOrder});
        }
      }
    }
    return{moves,spawns};
  }
  function collapse(board,rows,cols,makePiece){
    const d=collapseDetailed(board,rows,cols,makePiece);
    return [...new Set([...d.moves.map(x=>x.to),...d.spawns.map(x=>x.to)])];
  }

  function shuffleToPlayable(board,rows,cols,rng,mode,minTrace=3){
    const pieces=board.filter(Boolean).map(clonePiece);if(!pieces.length)return false;
    for(let attempt=0;attempt<240;attempt++){
      for(let i=pieces.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));const t=pieces[i];pieces[i]=pieces[j];pieces[j]=t;}
      for(let i=0;i<board.length;i++)board[i]=clonePiece(pieces[i%pieces.length]);
      if(mode==='swap'){if(!matchSet(board,rows,cols).size&&legalSwaps(board,rows,cols).length)return true;}
      else if(traceExists(board,rows,cols,minTrace))return true;
    }
    return false;
  }



  // PASS 12: blocker-aware board mechanics. Existing methods stay unchanged for
  // backwards compatibility; the runtime opts into these constrained variants.
  function asIndexSet(value){return value instanceof Set?value:new Set(value||[]);}
  function runsWithMask(board,rows,cols,matchBlocked){
    const blocked=asIndexSet(matchBlocked),out=[];
    for(let r=0;r<rows;r++){
      let s=0;
      while(s<cols){
        const si=index(r,s,cols),id=blocked.has(si)?null:pieceId(board[si]);let e=s+1;
        while(e<cols){const ei=index(r,e,cols);if(!id||blocked.has(ei)||pieceId(board[ei])!==id)break;e++;}
        if(id&&e-s>=3)out.push({id,orientation:'row',indices:Array.from({length:e-s},(_,k)=>index(r,s+k,cols))});
        s=Math.max(e,s+1);
      }
    }
    for(let c=0;c<cols;c++){
      let s=0;
      while(s<rows){
        const si=index(s,c,cols),id=blocked.has(si)?null:pieceId(board[si]);let e=s+1;
        while(e<rows){const ei=index(e,c,cols);if(!id||blocked.has(ei)||pieceId(board[ei])!==id)break;e++;}
        if(id&&e-s>=3)out.push({id,orientation:'col',indices:Array.from({length:e-s},(_,k)=>index(s+k,c,cols))});
        s=Math.max(e,s+1);
      }
    }
    return out;
  }
  function matchSetWithMask(board,rows,cols,matchBlocked){const set=new Set();runsWithMask(board,rows,cols,matchBlocked).forEach(run=>run.indices.forEach(i=>set.add(i)));return set;}
  function legalSwapsConstrained(board,rows,cols,opts={}){
    const locked=asIndexSet(opts.movementLocked),blocked=asIndexSet(opts.matchBlocked),out=[];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      const a=index(r,c,cols);if(locked.has(a)||!board[a])continue;
      for(const [rr,cc] of [[r,c+1],[r+1,c]]){
        if(rr>=rows||cc>=cols)continue;const b=index(rr,cc,cols);if(locked.has(b)||!board[b])continue;
        if(board[a].special||board[b].special){out.push([a,b]);continue;}
        const copy=board.map(clonePiece);swap(copy,a,b);if(matchSetWithMask(copy,rows,cols,blocked).size)out.push([a,b]);
      }
    }
    return out;
  }
  function componentConstrained(board,start,rows,cols,diagonal=true,blockedIndices){
    const blocked=asIndexSet(blockedIndices);if(blocked.has(start)||!board[start])return[];const id=pieceId(board[start]),seen=new Set(),stack=[start];
    while(stack.length){const p=stack.pop();if(seen.has(p)||blocked.has(p)||pieceId(board[p])!==id)continue;seen.add(p);const ns=diagonal?eightNeighbors(p,rows,cols):orthogonalNeighbors(p,rows,cols);ns.forEach(n=>{if(!seen.has(n)&&!blocked.has(n)&&pieceId(board[n])===id)stack.push(n);});}
    return[...seen];
  }
  function traceExistsConstrained(board,rows,cols,min=3,blockedIndices){for(let i=0;i<board.length;i++)if(componentConstrained(board,i,rows,cols,true,blockedIndices).length>=min)return true;return false;}
  function collapseDetailedConstrained(board,rows,cols,makePiece,fixedIndices){
    const fixed=asIndexSet(fixedIndices),moves=[],spawns=[];
    for(let c=0;c<cols;c++){
      let segmentBottom=rows-1;
      const flush=(top,bottom)=>{
        if(top>bottom)return;const kept=[];
        for(let r=bottom;r>=top;r--){const from=index(r,c,cols),p=board[from];if(p)kept.push({piece:p,from});}
        let k=0,spawnOrder=0;
        for(let r=bottom;r>=top;r--){const to=index(r,c,cols);if(k<kept.length){const item=kept[k++];board[to]=item.piece;if(item.from!==to)moves.push({from:item.from,to,distance:Math.abs(xy(item.from,cols).r-r)});}else{const piece=makePiece();board[to]=piece;spawns.push({to,fromRow:top-(++spawnOrder),distance:r-top+spawnOrder});}}
      };
      for(let r=rows-1;r>=-1;r--){const at=r>=0?index(r,c,cols):-1;if(r<0||fixed.has(at)){flush(r+1,segmentBottom);segmentBottom=r-1;}}
    }
    return{moves,spawns};
  }
  function shuffleToPlayableConstrained(board,rows,cols,rng,mode,minTrace=3,opts={}){
    const fixed=asIndexSet(opts.fixedIndices),locked=asIndexSet(opts.movementLocked),blocked=asIndexSet(opts.matchBlocked||opts.traceBlocked);
    const movable=[];for(let i=0;i<board.length;i++)if(!fixed.has(i)&&board[i])movable.push(clonePiece(board[i]));if(!movable.length)return false;
    const playable=()=>mode==='swap'?!matchSetWithMask(board,rows,cols,blocked).size&&legalSwapsConstrained(board,rows,cols,{movementLocked:locked,matchBlocked:blocked}).length>0:traceExistsConstrained(board,rows,cols,minTrace,blocked);
    for(let attempt=0;attempt<320;attempt++){
      for(let i=movable.length-1;i>0;i--){const j=Math.floor(rng()*(i+1)),t=movable[i];movable[i]=movable[j];movable[j]=t;}
      let k=0;for(let i=0;i<board.length;i++)if(!fixed.has(i))board[i]=clonePiece(movable[k++%movable.length]);
      if(playable())return true;
    }
    return false;
  }

  return Object.freeze({
    version:'3.2.0',clonePiece,pieceId,xy,index,inside,adjacent,orthogonalNeighbors,eightNeighbors,swap,runs,matchSet,matchGroups,
    legalSwaps,component,traceExists,findTraceHint,specialForGroup,specialsForRuns,chooseSpecial,expandSpecials,specialSwapClear,
    collapseDetailed,collapse,shuffleToPlayable,runsWithMask,matchSetWithMask,legalSwapsConstrained,componentConstrained,traceExistsConstrained,collapseDetailedConstrained,shuffleToPlayableConstrained
  });
});
