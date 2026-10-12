/* onyx-base-eat_drink.js | Onyx Pass15 actual 12-frame feeding action.
 * Preserves input alpha, normalizes sprite footprint (51 x ~40px), and anchors paws y=61.
 * Scenes: eat/drink, left/right, 3 independent frames per scene.
 * Use: OnyxBaseMotion.perform('onyx-base-eat_drink',{mode:'drink',direction:'left',duration:2400});
 *     OnyxBaseMotion.eat({direction:'right'}); OnyxBaseMotion.drink({direction:'left'});
 * The 64x64 canvas player draws the 640px SVG at the same logical dimensions as native atlas.
 */
(function(root){'use strict';
  var scriptSrc=(typeof document!=='undefined'&&document.currentScript&&document.currentScript.src)||'';
  var assetRoot=scriptSrc?new URL('../../../assets/images/games/virtual/atlases/',scriptSrc).href:'../../../assets/images/games/virtual/atlases/';
  var kinds=['eat','drink'],sides=['left','right'];
  var key=(kind,side,num)=>'onyx_'+kind+'_'+side+'_'+('0'+num).slice(-2)+'.svg';
  var url=(kind,side,num)=>assetRoot+key(kind,side,num);
  var atlas=Object.create(null),active=null;
  // Reuses a cached Image for each SVG so srcdoc's frequent render ticks do not refetch assets.
  function load(kind,side,num){var id=key(kind,side,num);if(!atlas[id]){
    if(typeof Image==='undefined')return null;
    var image=new Image();image.decoding='async';image.src=url(kind,side,num);atlas[id]=image;
  }return atlas[id];}
  function preload(){if(typeof Image==='undefined')return;for(var kind of kinds)for(var side of sides)for(var i=1;i<=3;i++)load(kind,side,i);}
  function modeOf(v){return /^(drink|water|lap|lapping)$/i.test(String(v||''))?'drink':'eat';}
  function sideOf(v,dir){var word=String(v||'').toLowerCase().replace(/-/g,'_');
    if(/^(left|west|south_west|north_west)$/.test(word))return 'left';
    if(/^(right|east|south_east|north_east)$/.test(word))return 'right';
    if(typeof v==='number')dir=v;
    return ([2,3,4].includes(((Number(dir)||0)%6+6)%6))?'left':'right';
  }
  function timestamp(){return typeof performance!=='undefined'&&performance.now?performance.now():Date.now();}
  function resolveFrame(elapsed,duration){
    // Two head-lowered poses, a brief lift and settle. Cadence repeats after the third pose.
    var progress=Math.min(0.999999,Math.max(0,elapsed/Math.max(1,duration)));
    var cycle=[1,2,1,2,1,2,3,2,1],step=Math.floor((progress*3%1)*cycle.length);
    if(progress>=0.96)return 3;
    return cycle[Math.max(0,Math.min(cycle.length-1,step))];
  }
  function start(options){options=options||{};
    var kind=modeOf(options.mode||options.kind||options.behavior);
    var cat=root.OnyxBaseMotion?.getAdapter?.()?.getState?.()?.cat||null;
    var dir=cat?.dir;
    active={kind:kind,side:sideOf(options.direction||options.facing,dir),started:timestamp(),
      durationMs:Math.max(420,Number(options.durationMs||options.duration)||2400),
      loop:options.loop===true};
    preload();return {...active};
  }
  function stop(){active=null;}
  function state(){return active?{...active}:null;}
  function current(now){if(!active)return null;var t=Math.max(0,now-active.started);
    if(!active.loop&&t>=active.durationMs){stop();return null;}
    return {kind:active.kind,side:active.side,phase:resolveFrame(t,active.durationMs),elapsedMs:t};
  }
  function renderToCanvas(options){options=options||{};
    var frame=current(Number(options.now)||timestamp());if(!frame)return false;
    // If a different native animation overrides primary, release the feeding state.
    if(options.action&&options.action!=='primary'){stop();return false;}
    var img=load(frame.kind,frame.side,frame.phase),ctx=options.ctx,canvas=options.canvas;
    if(!img||!img.complete||!img.naturalWidth||!ctx||!canvas)return false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(img,0,0,canvas.width,canvas.height);
    canvas.dataset.frame=key(frame.kind,frame.side,frame.phase);
    canvas.dataset.spriteAction=frame.kind;
    canvas.dataset.renderer='svg-eating-drinking-normalized';
    canvas.dataset.direction=frame.side;
    canvas.dataset.phase=String(frame.phase-1);
    return true;
  }
  function sample(elapsedMs,options){options=options||{};
    var duration=Math.max(1,Number(options.durationMs||options.duration)||2400),
        kind=modeOf(options.mode||options.kind),side=sideOf(options.direction||options.facing,options.dir),
        frame=resolveFrame(Number(elapsedMs)||0,duration);
    return {id:'onyx-base-eat_drink',action:'primary',kind:'interaction',mode:kind,direction:side,
      progress:Math.min(1,Math.max(0,(Number(elapsedMs)||0)/duration)),frameIndex:frame,
      frameAsset:url(kind,side,frame),visualPlaceholder:false,baselinePx:61,logicalSize:[64,64]};
  }
  var def={id:'onyx-base-eat_drink',kind:'interaction',action:'primary',legacyAction:'primary',
    pose:'inspect',durationMs:2400,canHold:false,support:'twelve-normalized-user-supplied-svg-frames',
    visualPlaceholder:false,framesPerSide:3,frameSize:[640,640],logicalSize:[64,64],
    modes:['eat','drink'],directions:['left','right'],startVisual:start,stopVisual:stop,sample:sample};
  root.OnyxBaseFeedingVisual=Object.freeze({start,stop,preload,sample,renderToCanvas,getState:state,frameUrl:url,assetRoot});
  (root.OnyxBaseMotion?root.OnyxBaseMotion.register(def):(root.OnyxBaseMotionQueue||(root.OnyxBaseMotionQueue=[])).push(def));
  if(typeof Image!=='undefined'&&typeof requestIdleCallback==='function')requestIdleCallback(preload);
})(typeof window!=='undefined'?window:globalThis);
