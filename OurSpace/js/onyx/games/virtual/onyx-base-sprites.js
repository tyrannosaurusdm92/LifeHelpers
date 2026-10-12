/* 2D full-body sprite renderer. Onyx remains default. Other provided animals
   are explicitly opt-in REFERENCES and never replace Onyx within the game. */
(function(root){'use strict';
 const DIRS=['east','south_east','south','south_west','west','north_west','north','north_east'];
 const SIX=['east','south_east','south_west','west','north_west','north_east'];
 const ROWS=Object.freeze({idle:0,walk:1,run:2,dash:3,dashjump:4,jump:5,duck:6,drop:7,stretch:8,reach:9,inspect:10,feed:11,sit:12,stand:13,search:14,sit2:15,curl:16,lounge:17,loaf:18,sleep:19,pounce:20,hunt:21});
 const FOX_DIR=Object.freeze({east:6,south_east:7,south:8,south_west:1,west:2,north_west:3,north:4,north_east:5});
 const ALLOWED=['onyx','catai','fox','fox_normal','fox_plain','catndog_cat','catndog_dog'];
 function artView(dir,side){if(dir==='south')return side==='left'?'south_west':'south_east';if(dir==='north')return side==='left'?'north_west':'north_east';return SIX.includes(dir)?dir:'east';}
 function at(dir,side,row,phase){const view=artView(dir,side),col=SIX.indexOf(view)*5+((Math.floor(phase)%5)+5)%5;return {sx:col*64,sy:row*64,sw:64,sh:64,col,row,authoredView:view,requestedDirection:dir,approximate:dir==='north'||dir==='south'};}
 class Sprites{
  constructor(options={}){
   this.path=options.atlasUrl||'assets/images/games/virtual/atlases/onyx_meow_sprite_atlas.png';this.cataiRoot=options.cataiRoot||'assets/catai-black/';this.referenceRoot=options.referenceRoot||'assets/references/';
   this.style=ALLOWED.includes(options.style)?options.style:'onyx';this.cache=new Map();this.pending=new Map();this.atlas=null;
   this.atlasReady=this.load(this.path).then(im=>{this.atlas=im;return im});
  }
  load(path){if(this.cache.has(path))return Promise.resolve(this.cache.get(path));if(this.pending.has(path))return this.pending.get(path);
   if(typeof Image==='undefined')return Promise.resolve(null);
   const task=new Promise(resolve=>{let img=new Image();img.onload=()=>{this.cache.set(path,img);this.pending.delete(path);resolve(img);};img.onerror=()=>{this.cache.set(path,null);this.pending.delete(path);resolve(null);};img.src=path;});this.pending.set(path,task);return task;
  }
  cached(path){if(this.cache.has(path))return this.cache.get(path);this.load(path);return null;}
  preloadCatai(){for(const d of DIRS)this.load(this.cataiRoot+'rotations/'+d.replace('_','-')+'.png');}
  setStyle(v){if(!ALLOWED.includes(v))return false;this.style=v;if(v==='catai')this.preloadCatai();return true;}
  cataiPath(s){const dir=(s.direction||'east').replace('_','-'),phase=Math.floor(s.phase||0);
   if(s.kind==='feed')return this.cataiRoot+(s.mode==='drink'?'drinking':'eating')+'/'+dir+'/frame_'+String(phase%(s.mode==='drink'?8:11)).padStart(3,'0')+'.png';
   if(s.kind==='move')return this.cataiRoot+'running-8-frames/'+dir+'/frame_'+String(phase%8).padStart(3,'0')+'.png';
   return this.cataiRoot+'rotations/'+dir+'.png';
  }
  foxData(s){let state=s.kind==='move'||s.row===ROWS.walk||s.row===ROWS.run?'Walk':'Idle';
   let style=this.style==='fox_plain'?'Plain_':this.style==='fox_normal'?'Normal_':'';
   const file='Fox_'+style+state+'_dir'+FOX_DIR[s.direction||'east']+'.png';
   let path=this.referenceRoot+'fox/'+state.toLowerCase()+'/'+file;
   let max=state==='Walk'?12:24,phase=((Math.floor(s.phase||0)%max)+max)%max;
   return {path,sx:(phase%6)*256,sy:Math.floor(phase/6)*256,sw:256,sh:256};
  }
  catDogData(s){const animal=this.style==='catndog_dog'?'dog':'cat';let action=s.kind==='move'?(s.pace==='run'?'run':'walk'):
    ['jump_up','jump_down','jump_across','play_hunt'].includes(s.action)?'jump':s.action==='feed'?'idle':'idle';
   const row={idle:0,walk:1,run:2,jump:3,fall:4,slide:5}[action];
   const count=['idle','walk'].includes(action)?10:8,phase=((Math.floor(s.phase||0)%count)+count)%count;
   return {path:this.referenceRoot+'catndog/'+animal+'-reference-sheet.png',sx:phase*128,sy:row*128,sw:128,sh:128};
  }
  draw(ctx,s,x,y,scale=2){if(!ctx)return false;ctx.imageSmoothingEnabled=false;
   // Default Onyx atlas and its 12 carefully normalized left/right feeding frames.
   if(this.style==='onyx'||s.kind==='feeding_svg'&&this.style==='onyx'){
    if(s.kind==='feeding_svg'){const im=this.cached(s.url);if(im){ctx.drawImage(im,x-32*scale,y-58*scale,64*scale,64*scale);return true;}/* Never turn invisible while feeding SVG is loading. */const base=this.atlas;if(!base)return false;const a=at(s.direction,s.side,ROWS.feed,s.phase??0);ctx.drawImage(base,a.sx,a.sy,Math.min(64,base.width-a.sx),64,x-32*scale,y-58*scale,64*scale,64*scale);return true;}
    const im=this.atlas;if(!im)return false;const a=at(s.direction,s.side,s.row??0,s.phase??0);
    ctx.drawImage(im,a.sx,a.sy,Math.min(64,im.width-a.sx),64,x-32*scale,y-58*scale,64*scale,64*scale);return true;
   }
   if(this.style==='catai'){
    const sprite={...s};if(sprite.kind==='feeding_svg'){sprite.kind='feed';sprite.mode=s.mode;}
    const im=this.cached(this.cataiPath(sprite));if(!im)return false;
    ctx.drawImage(im,x-32*scale,y-58*scale,64*scale,64*scale);return true;
   }
   if(this.style.startsWith('fox')){
    let data=this.foxData(s),im=this.cached(data.path);if(!im)return false;
    ctx.drawImage(im,data.sx,data.sy,256,256,x-32*scale,y-58*scale,64*scale,64*scale);return true;
   }
   if(this.style.startsWith('catndog')){
    const data=this.catDogData(s),im=this.cached(data.path);if(!im)return false;
    const width=64*scale,height=64*scale;
    ctx.save();if(['west','north_west','south_west'].includes(s.direction)){ctx.translate(2*x,0);ctx.scale(-1,1);}
    ctx.drawImage(im,data.sx,data.sy,data.sw,data.sh,x-width/2,y-58*scale,width,height);ctx.restore();return true;
   }return false;
  }
 }
 root.OnyxBaseSprites=Object.freeze({DIRS,SIX,ROWS,FOX_DIR,ALLOWED,artView,at,Sprites});
})(typeof window!=='undefined'?window:globalThis);
