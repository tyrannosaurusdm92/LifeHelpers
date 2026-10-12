/* Onyx feeding: real normalized 12 SVG frames from user-provided Pass15 art.
   Modes eat/drink, 3 images per side. Stable grounded paws, separate left/right.
   A feeding event does NOT automatically consume inventory: optional onBite callback. */
(function(root){'use strict';
 const current=(typeof document!=='undefined'&&document.currentScript?.src)||'';
 const rootPath=current?new URL('../assets/frames/',current).href:'assets/frames/';
 const url=(mode,side,frame)=>rootPath+'onyx_'+mode+'_'+side+'_'+String(frame).padStart(2,'0')+'.svg';
 // The bowl is a live world object: food cannot be consumed once it moves,
 // falls out of reach, or becomes hidden by furniture during a held feeding.
 const bowlCheck=(m,j)=>{const b=j.opts.bowl;if(!b)return {ok:true};
  const s=m.getState(),reach=Number(j.opts.reachPx??86);
  if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(reach)||reach<=0)return {ok:false,reason:'invalid-bowl'};
  if(Math.hypot(b.x-s.x,b.y-s.y)>reach)return {ok:false,reason:'bowl-out-of-reach'};
  if(!root.OnyxBasePhysics.clearApproach(m.getWorld(),s,b,4))return {ok:false,reason:'bowl-obstructed'};
  return {ok:true};};
 const def={id:'onyx-base-eat_drink' ,aliases:['eat_drink','eat','drink','feed'],kind:'feeding',action:'feed',durationMs:2600,
  onStart(m,j){j.data.mode=/^(water|drink|lapping)$/i.test(j.opts.mode||'')?'drink':'eat';
   const d=(j.opts.direction||m.getState().direction).replaceAll('-','_');j.data.side=['west','south_west','north_west','left'].includes(d)?'left':(['east','north_east','south_east','right'].includes(d)?'right':m.getState().lastSide);
   // Optional bowl proximity validator: host must provide world coordinates for realism.
   return bowlCheck(m,j);},
  onUpdate(m,j){
   const valid=bowlCheck(m,j);if(!valid.ok){m._emit('feeding-blocked',{reason:valid.reason,mode:j.data.mode,bowl:j.opts.bowl});return valid;}
   if(j.data.lastBite===undefined)j.data.lastBite=0;const duration=j.durationMs;
   const n=Math.floor(j.elapsedMs/360);if(n>j.data.lastBite&&(j.opts.loop===true||j.elapsedMs<duration-200)){j.data.lastBite=n;
    if(typeof j.opts.onBite==='function')j.opts.onBite({mode:j.data.mode,bite:n,frame:j.data.mode==='drink'?'lap':'chew'});
    m._emit(j.data.mode==='drink'?'lap':'bite',{bite:n,mode:j.data.mode});}
   return {ok:true};},
  sample(m,j){const t=j.hold?j.elapsedMs%j.durationMs:j.elapsedMs,duration=j.durationMs;
   const frame=t<duration*.12?1:t>duration*.91?3:([1,2,1,2,3,2][Math.floor(t/155)%6]);
   return {kind:'feeding_svg',row:10,phase:frame-1,mode:j.data.mode,side:j.data.side,url:url(j.data.mode,j.data.side,frame),visualSource:'user-supplied-12-SVG-frames'};}
 };
 (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
})(typeof window!=='undefined'?window:globalThis);
