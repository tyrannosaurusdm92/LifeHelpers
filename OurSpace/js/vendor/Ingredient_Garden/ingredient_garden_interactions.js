(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.IngredientGardenInteractions=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  function xy(i,cols){return {r:Math.floor(i/cols),c:i%cols};}
  function index(r,c,cols){return r*cols+c;}
  function inside(r,c,rows,cols){return r>=0&&r<rows&&c>=0&&c<cols;}
  function adjacent(a,b,cols,diagonal){
    const A=xy(a,cols),B=xy(b,cols),dr=Math.abs(A.r-B.r),dc=Math.abs(A.c-B.c);
    return diagonal?(dr<=1&&dc<=1&&(dr+dc)>0):(dr+dc===1);
  }

  // Grid-cell interpolation for fast mouse/touch drags. It intentionally emits
  // adjacent cells only, so Trace mode can never jump over a board cell.
  function interpolateIndices(a,b,rows,cols){
    if(a==null||b==null)return [];
    const A=xy(a,cols),B=xy(b,cols),dr=B.r-A.r,dc=B.c-A.c;
    const steps=Math.max(Math.abs(dr),Math.abs(dc));
    if(!steps)return [a];
    const out=[a];
    let last=a;
    for(let s=1;s<=steps;s++){
      const r=Math.round(A.r+(dr*s/steps)),c=Math.round(A.c+(dc*s/steps));
      if(!inside(r,c,rows,cols))continue;
      const n=index(r,c,cols);
      if(n!==last){out.push(n);last=n;}
    }
    if(out[out.length-1]!==b)out.push(b);
    return out;
  }

  function traceStep(trace,board,target,rows,cols,diagonal=true){
    if(!Array.isArray(trace)||!trace.length||!board?.[target])return {changed:false,action:'reject'};
    const last=trace[trace.length-1];
    const previous=trace.length>1?trace[trace.length-2]:null;
    if(target===last)return {changed:false,action:'same'};
    if(target===previous){trace.pop();trace.loopClosed=false;return {changed:true,action:'backtrack'};}
    if(board[target]?.id!==board[trace[0]]?.id)return {changed:false,action:'wrong-type'};
    if(!adjacent(last,target,cols,diagonal))return {changed:false,action:'too-far'};
    // Donor-inspired closed-loop rule: after tracing at least four unique matching
    // cells, returning to the first cell closes the ingredient loop. The first
    // cell is not duplicated in the path, so normal no-reuse semantics remain.
    if(target===trace[0]&&trace.length>=4){trace.loopClosed=true;return {changed:true,action:'loop-close'};}
    if(trace.includes(target))return {changed:false,action:'repeat'};
    trace.push(target);trace.loopClosed=false;
    return {changed:true,action:'extend'};
  }

  function traceLoopClear(board,trace,blockedIndices){
    if(!Array.isArray(trace)||!trace.loopClosed||trace.length<4)return null;
    const id=board?.[trace[0]]?.id;if(!id)return null;const blocked=blockedIndices instanceof Set?blockedIndices:new Set(blockedIndices||[]);
    const clear=new Set();
    (board||[]).forEach((p,i)=>{if(p?.id===id&&!blocked.has(i))clear.add(i);});
    return {id,clear,count:clear.size};
  }

  function swipeNeighbor(start,dx,dy,rows,cols,minDistance=18){
    if(start==null||Math.hypot(dx,dy)<minDistance)return null;
    const A=xy(start,cols);
    let r=A.r,c=A.c;
    if(Math.abs(dx)>=Math.abs(dy))c+=dx>0?1:-1;
    else r+=dy>0?1:-1;
    return inside(r,c,rows,cols)?index(r,c,cols):null;
  }

  function keyboardNeighbor(start,key,rows,cols){
    const A=xy(start??0,cols);let r=A.r,c=A.c;
    const k=String(key||'').toLowerCase();
    if(k==='arrowleft'||k==='a')c--;
    else if(k==='arrowright'||k==='d')c++;
    else if(k==='arrowup'||k==='w')r--;
    else if(k==='arrowdown'||k==='s')r++;
    else return start??0;
    r=Math.max(0,Math.min(rows-1,r));c=Math.max(0,Math.min(cols-1,c));
    return index(r,c,cols);
  }

  function bestSwapHint(board,rows,cols,Board,targetIds){
    const goals=new Set(targetIds||[]),swaps=Board?.legalSwaps?.(board,rows,cols)||[];
    let best=null,bestScore=-Infinity;
    for(const pair of swaps){
      const [a,b]=pair,copy=board.map(Board.clonePiece);
      Board.swap(copy,a,b);
      const special=Board.specialSwapClear?.(copy,a,b,rows,cols);
      const rs=Board.runs(copy,rows,cols),set=special?.clear?new Set(special.clear):new Set();
      rs.forEach(r=>r.indices.forEach(i=>set.add(i)));
      let score=set.size*10;
      for(const i of set)if(goals.has(copy[i]?.id))score+=28;
      const created=Board.specialsForRuns?.(rs,[b,a])||[];
      created.forEach(s=>{score+=s.special==='color'?70:s.special==='area'?48:34;});
      if(special?.clear?.size)score+=55+special.clear.size*3;
      // Prefer moves that touch an outstanding goal even when the cleared set is
      // mostly filler, and slightly prefer the larger direct match on ties.
      if(goals.has(copy[a]?.id)||goals.has(copy[b]?.id))score+=12;
      if(score>bestScore){bestScore=score;best=pair;}
    }
    return best;
  }

  function bestTraceHint(board,rows,cols,min=3,maxDepth=12,nodeBudget=6000,targetIds,blockedIndices){
    const goals=new Set(targetIds||[]),blocked=blockedIndices instanceof Set?blockedIndices:new Set(blockedIndices||[]);let budget=Math.max(200,Number(nodeBudget)||6000),best=[],bestScore=-Infinity,bestLoop=false;
    const neighbors=(i)=>{const A=xy(i,cols),out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;const r=A.r+dr,c=A.c+dc,n=inside(r,c,rows,cols)?index(r,c,cols):-1;if(n>=0&&!blocked.has(n))out.push(n);
    }return out;};
    const visibleCount=id=>board.reduce((n,p,i)=>n+(!blocked.has(i)&&p?.id===id?1:0),0);
    function consider(path,id){
      const loop=path.length>=4&&neighbors(path[path.length-1]).includes(path[0]);
      const score=path.length*12+(goals.has(id)?80:0)+(loop?120+visibleCount(id)*8:0);
      if(score>bestScore){bestScore=score;best=path.slice();bestLoop=loop;}
    }
    function dfs(path,used,id){
      if(--budget<=0)return true;consider(path,id);if(path.length>=maxDepth)return false;
      const ns=neighbors(path[path.length-1]);
      ns.sort((a,b)=>neighbors(b).filter(n=>!used.has(n)&&board[n]?.id===id).length-neighbors(a).filter(n=>!used.has(n)&&board[n]?.id===id).length);
      for(const n of ns){if(used.has(n)||board[n]?.id!==id)continue;used.add(n);path.push(n);dfs(path,used,id);path.pop();used.delete(n);if(budget<=0)return true;}
      return false;
    }
    const starts=board.map((p,i)=>({p,i})).filter(x=>x.p&&!blocked.has(x.i)).sort((a,b)=>(goals.has(b.p.id)?1:0)-(goals.has(a.p.id)?1:0));
    for(const {p,i} of starts){if(budget<=0)break;dfs([i],new Set([i]),p.id);}
    if(best.length<min)return null;if(bestLoop)best.loopClosed=true;return best;
  }

  function traceSpecial(chainLength,rng,thresholds){
    const n=Math.max(0,Number(chainLength)||0),list=thresholds||[];
    const rule=list.find(t=>n>=Number(t.min||0)&&(t.max==null||n<=Number(t.max)));
    const effect=rule?.effect||'normal_clear';
    if(effect==='line_special')return rng()<.5?'row':'col';
    if(effect==='area_or_ingredient_special')return n>=10&&rng()<.5?'color':'area';
    if(effect==='premium_chain')return 'color';
    return null;
  }

  return Object.freeze({
    version:'3.2.0',xy,index,inside,adjacent,interpolateIndices,traceStep,traceLoopClear,swipeNeighbor,keyboardNeighbor,
    bestSwapHint,bestTraceHint,traceSpecial
  });
});
