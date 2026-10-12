/* Onyx research-backed weighted sprite exposure. No external library or assets. */
(function(root){'use strict';
 const finite=v=>Number.isFinite(v),clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function loop(elapsedMs,durationMs,weights=[1,1,1,1,1],options={}){
  if(options.reducedMotion)return 0;
  const n=Array.isArray(weights)&&weights.length?weights.length:5;
  if(!finite(elapsedMs)||!finite(durationMs)||durationMs<=0)return 0;
  const ws=Array.from({length:n},(_,i)=>finite(weights?.[i])?Math.max(0,weights[i]):1);
  const total=ws.reduce((a,b)=>a+b,0);
  if(total<=0)return 0;
  let pct=((elapsedMs%durationMs)+durationMs)%durationMs/durationMs;
  if(options.reverse)pct=1-pct-Number.EPSILON;
  if(options.pingPong){pct=pct<.5?pct*2:(1-pct)*2;}
  let sum=0;for(let i=0;i<n;i++){sum+=ws[i]/total;if(pct<sum)return i;}
  return n-1;
 }
 function oneShot(elapsedMs,durationsMs,{reverse=false,reducedMotion=false}={}){
  if(!Array.isArray(durationsMs)||!durationsMs.length||reducedMotion)return 0;
  const a=durationsMs.map(x=>finite(x)&&x>0?x:1),total=a.reduce((x,y)=>x+y,0);
  let rem=clamp(finite(elapsedMs)?elapsedMs:0,0,total);if(reverse)rem=total-rem;
  for(let i=0;i<a.length;i++){if(rem<a[i])return i;rem-=a[i];}
  return a.length-1;
 }
 // Six actual drawings are retained; north/south use the nearest side-derived 3/4 view.
 function facing(direction,prior='right'){
  if(direction==='north')return prior==='left'?'north_west':'north_east';
  if(direction==='south')return prior==='left'?'south_west':'south_east';
  return ['east','west','north_east','north_west','south_east','south_west'].includes(direction)?direction:'east';
 }
 root.OnyxBaseFlipbook=Object.freeze({version:'34.0',loop,oneShot,facing});
})(typeof window!=='undefined'?window:globalThis);
