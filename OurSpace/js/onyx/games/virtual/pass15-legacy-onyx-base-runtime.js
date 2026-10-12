/* Onyx base movement runtime v1.0 | eight-way navigation / Trap-the-Cat-derived BFS concept.
 * Uses only public, existing OnyxImperialExpedition methods; never replaces the sprite renderer.
 * Load BEFORE the 18 onyx-base-*.js action modules.
 */
(function (root) {
  'use strict';
  if (root.OnyxBaseMotion) return;
  var registry = Object.create(null);
  var DIRECTION_ORDER = Object.freeze(['east','south_east','south','south_west','west','north_west','north','north_east']);
  var VECTORS = Object.freeze({east:[1,0],south_east:[Math.SQRT1_2,Math.SQRT1_2],south:[0,1],south_west:[-Math.SQRT1_2,Math.SQRT1_2],west:[-1,0],north_west:[-Math.SQRT1_2,-Math.SQRT1_2],north:[0,-1],north_east:[Math.SQRT1_2,-Math.SQRT1_2]});
  var SQRT2=Math.SQRT2, HEX_FOR_OCTANT=[0,1,1,2,3,4,4,5];
  var state={x:.5,y:.58,direction:'west',pace:'walk',action:'idle',moving:false,actionStarted:0};
  var adapter=null, job=null, rafId=0, lastFrame=0;
  function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
  function now(){return root.performance?.now?.()||Date.now();}
  function notify(name, detail){try{root.dispatchEvent(new CustomEvent(name,{detail:detail}));}catch (_) {}}
  function getAdapter(){return adapter||root.OnyxImperialExpedition||null;}
  function register(def){if(!def||typeof def.id!=='string'||!def.id.startsWith('onyx-base-'))throw Error('Invalid Onyx base module');if(registry[def.id])throw Error('Duplicate Onyx base module: '+def.id);registry[def.id]=Object.freeze(def);return registry[def.id];}
  function list(){return Object.keys(registry);}
  function descriptor(name){return registry[name]||registry['onyx-base-'+name]||null;}
  function bearing(dx,dy){var a=Math.hypot(Number(dx)||0,Number(dy)||0);if(a<1e-7)return state.direction;var sector=((Math.round(Math.atan2(dy,dx)/(Math.PI/4))%8)+8)%8;return DIRECTION_ORDER[sector];}
  function hexFacing(direction){var i=DIRECTION_ORDER.indexOf(direction);return HEX_FOR_OCTANT[i<0?0:i];}
  function syncPosition(){var cat=getAdapter()?.getState?.()?.cat;if(cat&&Number.isFinite(cat.x)&&Number.isFinite(cat.y)){state.x=cat.x;state.y=cat.y;}return {x:state.x,y:state.y};}
  function roomFloorAllows(x,y){var spatial=root.OnyxRoomSpatial;if(spatial?.canWalkPoint)return !!spatial.canWalkPoint(x*(spatial.W||1916),y*(spatial.H||821));return true;}
  function canOccupy(x,y,options){if(!Number.isFinite(x)||!Number.isFinite(y)||x<.045||x>.955||y<.11||y>.93)return false;var check=options?.canOccupy;if(typeof check==='function'&&!check(x,y))return false;return !options?.floorOnly||roomFloorAllows(x,y);}
  function heading(dx,dy,options){var direction=bearing(dx,dy),mode=options?.mode==='run'?'run':'walk';var movement=descriptor('onyx-base-move_'+direction);if(!movement)return null;state.direction=direction;state.pace=mode;var api=getAdapter();
    // Six source atlas facings; eight independent world-space vectors remain intact.
    // Face-vector mirrors the legacy renderer's six-sector direction choice.
    if(options?.applyFacing!==false&&api?.faceVector)api.faceVector(...movement.vector);
    var details={direction:direction,octant:DIRECTION_ORDER.indexOf(direction),legacyDirection:hexFacing(direction),vector:movement.vector.slice(),pace:mode,gait:movement.gaits[mode],frame:movement.frameAt(options?.elapsedMs||0,mode)};
    if(options?.emit!==false)notify('onyx-base-heading',details);return details;
  }
  function advance(direction,dtSeconds,options){options=options||{};var d=descriptor('onyx-base-move_'+direction);if(!d)return {ok:false,reason:'unknown-direction'};
    var dt=clamp(Number(dtSeconds)||0,0,.1),pace=options.pace==='run'?'run':'walk';
    var base=options.position||syncPosition(),step=d.step(base,dt,pace,options),from={x:base.x,y:base.y};
    if(!canOccupy(step.x,step.y,options))return {ok:false,reason:'blocked',position:from,direction:direction};
    state.x=step.x;state.y=step.y;state.moving=dt>0;var dirInfo=heading(...d.vector,{mode:pace,elapsedMs:options.elapsedMs,applyFacing:options.applyFacing,emit:false});
    if(options.applyPosition!==false)getAdapter()?.setCatPosition?.(step.x,step.y);
    var result={ok:true,position:{x:step.x,y:step.y},from,direction:direction,pace,frame:step.frame,legacyDirection:dirInfo.legacyDirection};notify('onyx-base-step',result);return result;
  }
  function readFrame(id,elapsedMs=0,options={}){var d=descriptor(id);if(!d)return null;return d.sample?d.sample(elapsedMs,options):d.frameAt(elapsedMs,options.pace||'walk');}
  function perform(name,options){options=options||{};var d=descriptor(name);if(!d||d.kind==='locomotion')return {ok:false,reason:'unknown-action'};
    if(job)stop();if(d.id!=='onyx-base-eat_drink')root.OnyxBaseFeedingVisual?.stop?.();state.action=d.action;state.actionStarted=now();var sample=d.sample(0,options);
    if(options.apply!==false){var api=getAdapter();if(api){var legacy=String(d.legacyAction||'idle');
      if(d.kind==='jump'&&typeof api.jumpForward==='function'&&options.nativeJump===true){api.jumpForward(options.distance||.045);}
      else if(typeof api.performCatAction==='function')api.performCatAction(legacy,{duration:options.duration||d.durationMs,hold:options.hold===true&&d.canHold===true});
      if(d.pose&&typeof api.applyPose==='function')api.applyPose(d.pose,{duration:Math.min(300,options.duration||d.durationMs)});
    }}
    if(options.apply!==false&&typeof d.startVisual==='function')d.startVisual(options);
    var payload={ok:true,id:d.id,action:d.action,frame:sample,sourceSupport:d.support,visualPlaceholder:!!d.visualPlaceholder,durationMs:options.durationMs||options.duration||d.durationMs};notify('onyx-base-action',payload);return payload;
  }
  function stop(){if(rafId&&typeof root.cancelAnimationFrame==='function')root.cancelAnimationFrame(rafId);rafId=0;lastFrame=0;job=null;state.moving=false;root.OnyxBaseFeedingVisual?.stop?.();notify('onyx-base-motion-stop',{...state});}
  function start(direction,options){options=options||{};var d=descriptor('onyx-base-move_'+direction);if(!d)return {ok:false,reason:'unknown-direction'};stop();syncPosition();var duration=Math.max(0,Number(options.durationMs)||500),elapsed=0,pace=options.pace==='run'?'run':'walk';
    var token=job={direction,pace};lastFrame=0;
    function tick(t){if(job!==token)return;if(!lastFrame)lastFrame=t;var dt=Math.min(.05,Math.max(0,(t-lastFrame)/1000));lastFrame=t;elapsed+=dt*1000;
      var result=advance(direction,dt,{pace,canOccupy:options.canOccupy,floorOnly:options.floorOnly!==false,elapsedMs:elapsed});
      if(!result.ok||elapsed>=duration){stop();options.onComplete?.(result);return;}
      rafId=root.requestAnimationFrame(tick);
    }
    if(typeof root.requestAnimationFrame!=='function')return {ok:false,reason:'animation-frame-unavailable'};
    rafId=root.requestAnimationFrame(tick);return {ok:true,direction,pace,durationMs:duration};
  }
  function blockedCell(x,y,cols,rows,blocked){if(x<0||y<0||x>=cols||y>=rows)return true;if(typeof blocked==='function')return !!blocked(x,y);if(blocked?.has)return blocked.has(x+','+y);if(Array.isArray(blocked))return blocked.some(p=>p.x===x&&p.y===y||p===x+','+y);return false;}
  function findPath(start,end,options){options=options||{};
    var cols=Math.max(1,Math.floor(options.cols||18)),rows=Math.max(1,Math.floor(options.rows||8)),blocked=options.blocked||new Set();
    var sx=Math.floor(start?.x),sy=Math.floor(start?.y),tx=Math.floor(end?.x),ty=Math.floor(end?.y);
    if([sx,sy,tx,ty].some(v=>!Number.isFinite(v))||blockedCell(sx,sy,cols,rows,blocked)||blockedCell(tx,ty,cols,rows,blocked))return [];
    var key=(x,y)=>x+','+y, h=(x,y)=>Math.hypot(tx-x,ty-y),open=[{x:sx,y:sy,g:0,f:h(sx,sy)}],best=new Map([[key(sx,sy),0]]),parent=new Map();
    var iterations=0,max=Math.min(30000,Math.max(64,cols*rows*16));
    while(open.length&&iterations++<max){open.sort((a,b)=>a.f-b.f||a.g-b.g||a.y-b.y||a.x-b.x);var item=open.shift(),k=key(item.x,item.y);if(item.g!==best.get(k))continue;
      if(item.x===tx&&item.y===ty){var path=[{x:tx,y:ty}];while(k!==key(sx,sy)){var prev=parent.get(k);if(!prev)return [];path.push({x:prev.x,y:prev.y});k=key(prev.x,prev.y);}return path.reverse();}
      for(var d of DIRECTION_ORDER){var v=VECTORS[d],dx=Math.sign(v[0]),dy=Math.sign(v[1]),nx=item.x+dx,ny=item.y+dy;
        if(blockedCell(nx,ny,cols,rows,blocked))continue;
        // Do not cut diagonally between two impassable cells.
        if(dx&&dy&&(!options.allowCornerCut)&&(blockedCell(item.x+dx,item.y,cols,rows,blocked)||blockedCell(item.x,item.y+dy,cols,rows,blocked)))continue;
        var g=item.g+(dx&&dy?SQRT2:1),nk=key(nx,ny);if(g>=((best.get(nk)??Infinity)-1e-9))continue;
        best.set(nk,g);parent.set(nk,item);open.push({x:nx,y:ny,g,f:g+h(nx,ny)});
      }
    }return [];
  }
  function followGridPath(path,options){options=options||{};if(!Array.isArray(path)||path.length<2)return {ok:false,reason:'path-too-short'};
    var index=1,cancelled=false,cols=options.cols||18,rows=options.rows||8,pace=options.pace||'walk';
    var pts=path.map(p=>({x:(p.x+.5)/cols,y:(p.y+.5)/rows}));
    var promise=new Promise(function(resolve){
      function next(){if(cancelled){resolve({ok:false,reason:'cancelled'});return;}if(index>=path.length){resolve({ok:true,arrived:true});return;}
        var prev=path[index-1],p=path[index++],direction=bearing(p.x-prev.x,p.y-prev.y),speed=pace==='run'?.32:.16,stepDist=Math.hypot(pts[index-1].x-pts[index-2].x,pts[index-1].y-pts[index-2].y);
        getAdapter()?.setCatPosition?.(pts[index-2].x,pts[index-2].y);state.x=pts[index-2].x;state.y=pts[index-2].y;
        start(direction,{durationMs:stepDist/speed*1000,pace,floorOnly:options.floorOnly!==false,onComplete:res=>{if(!res?.ok){resolve(res||{ok:false});return;}next();}});
      }next();
    });return {ok:true,promise,cancel:()=>{cancelled=true;stop();}};
  }
  var api=Object.freeze({schema:'onyx-base-motion/v1',register,list,descriptor,directions:DIRECTION_ORDER,vectors:VECTORS,bearing,hexFacing,heading,advance,walk:(dir,opts)=>start(dir,{...(opts||{}),pace:'walk'}),run:(dir,opts)=>start(dir,{...(opts||{}),pace:'run'}),perform,readFrame,findPath,followGridPath,stop,syncPosition,eat:options=>perform('onyx-base-eat_drink',{...(options||{}),mode:'eat'}),drink:options=>perform('onyx-base-eat_drink',{...(options||{}),mode:'drink'}),setAdapter:a=>{adapter=a||null;return !!getAdapter();},getState:()=>({...state}),getAdapter});
  root.OnyxBaseMotion=api;
  var queue=root.OnyxBaseMotionQueue||[];while(queue.length)register(queue.shift());
})(typeof window!=='undefined'?window:globalThis);
