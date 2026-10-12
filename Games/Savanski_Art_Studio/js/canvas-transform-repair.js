/* Savanski Art Studio — editable transform handles and legacy raster lifting.
   Browser-only frontend repair; the routed Apps Script backend is untouched. */
(function (global) {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rad=v=>v*Math.PI/180;
  const key='__savanskiCanvasTransformRepair';
  function mount() {
    const ctl=global.LFAdvancedController;
    if(!ctl?.store||!ctl?.renderer||!ctl.engine?.project && !ctl.engine)return false;
    if(ctl[key])return true;
    ctl[key]=true;
    const proto=Object.getPrototypeOf(ctl);
    const down=proto.pointerDown,move=proto.pointerMove,up=proto.pointerUp;
    const engine=ctl.engine,store=ctl.store;
    function handles(o) {
      const b=ctl.renderer.bounds(o),t=o.transform||{};
      const cx=b.x+b.w/2+(t.x||0),cy=b.y+b.h/2+(t.y||0);
      const sx=t.scaleX??1,sy=t.scaleY??1,a=rad(t.rotation||0),co=Math.cos(a),si=Math.sin(a);
      const map=(x,y)=>({x:cx+x*co-y*si,y:cy+x*si+y*co});
      const w=b.w*sx/2,h=b.h*sy/2,hs=Math.max(6,engine.width/250);
      return {cx,cy,b,a,hs,points:[
        {type:'resize',corner:'tl',hx:-1,hy:-1,...map(-w,-h)},
        {type:'resize',corner:'tr',hx:1,hy:-1,...map(w,-h)},
        {type:'resize',corner:'br',hx:1,hy:1,...map(w,h)},
        {type:'resize',corner:'bl',hx:-1,hy:1,...map(-w,h)},
        {type:'rotate',corner:'rotation',...map(0,-Math.abs(h)-hs*3)}
      ]};
    }
    function handleAt(o,p) {
      const h=handles(o),radius=Math.max(9,engine.width/210);
      for(const pt of h.points.slice().reverse()) if(Math.hypot(p.x-pt.x,p.y-pt.y)<=radius) return {...h,pt};
      return null;
    }
    proto.pointerDown=function(tool,p,ev){
      if(tool==='select'||tool==='move'){
        const selected=store.selected(),h=selected&&!selected.locked?handleAt(selected,p):null;
        if(h){
          store.snapshot(h.pt.type==='rotate'?'Rotate object':'Resize object');
          this.drag={kind:'transform-handle',id:selected.id,action:h.pt.type,corner:h.pt.corner,
            hx:h.pt.hx||0,hy:h.pt.hy||0,center:{x:h.cx,y:h.cy},bounds:h.b,
            base:{...selected.transform},startAngle:Math.atan2(p.y-h.cy,p.x-h.cx)};
          ev.preventDefault();return;
        }
      }
      return down.call(this,tool,p,ev);
    };
    proto.pointerMove=function(tool,p,ev){
      const d=this.drag;
      if(!d||d.kind!=='transform-handle')return move.call(this,tool,p,ev);
      const obj=store.list().find(o=>o.id===d.id);
      if(!obj)return;
      const t=obj.transform,base=d.base;
      if(d.action==='rotate'){
        const next=Math.atan2(p.y-d.center.y,p.x-d.center.x);
        let angle=(base.rotation||0)+(next-d.startAngle)*180/Math.PI;
        if(ev.shiftKey)angle=Math.round(angle/15)*15;
        t.rotation=angle;
      }else{
        const a=rad(base.rotation||0),co=Math.cos(a),si=Math.sin(a);
        const dx=p.x-d.center.x,dy=p.y-d.center.y;
        const x=dx*co+dy*si,y=-dx*si+dy*co;
        const halfW=Math.max(1,d.bounds.w/2),halfH=Math.max(1,d.bounds.h/2);
        const sign=v=>v<0?-1:1;
        const sx=clamp(x/(d.hx*halfW),-32,32);
        const sy=clamp(y/(d.hy*halfH),-32,32);
        const nonzero=v=>Math.abs(v)<.025?sign(v)*.025:v;
        if(ev.shiftKey){
          const s=Math.max(Math.abs(sx/(base.scaleX||1)),Math.abs(sy/(base.scaleY||1)));
          t.scaleX=nonzero(sign(sx)*(Math.abs(base.scaleX||1)*s));
          t.scaleY=nonzero(sign(sy)*(Math.abs(base.scaleY||1)*s));
        }else{
          t.scaleX=nonzero(sx);t.scaleY=nonzero(sy);
        }
      }
      obj.updatedAt=Date.now();
      this.render();
    };
    proto.pointerUp=function(tool,p,ev){
      if(!this.drag||this.drag.kind!=='transform-handle')return up.call(this,tool,p,ev);
      const obj=store.list().find(o=>o.id===this.drag.id);
      this.drag=null;
      if(obj){obj.updatedAt=Date.now();store.changed('update',obj);this.openInspector(false)}
    };
    const oldSelect=engine.selectLayer.bind(engine);
    engine.selectLayer=function(id){
      if(store.selected())store.clearSelection();
      return oldSelect(id);
    };
    // An earlier CanvasEngine raster stroke is still editable as a complete layer.
    // For individual older raster marks, lift the selected pixels to a SceneStore image.
    const origUndo=store.undo.bind(store),origRedo=store.redo.bind(store);
    function restore(meta,undoing){
      const layer=engine.layer(meta.layerId);if(!layer)return;
      const x=layer.canvas.getContext('2d',{willReadFrequently:true});
      x.save();
      if(undoing)x.drawImage(meta.pixels,meta.x,meta.y);
      else{x.globalCompositeOperation='destination-out';x.drawImage(meta.pixels,meta.x,meta.y)}
      x.restore();engine.render();
    }
    store.undo=function(){
      const meta=this.undoStack.at(-1)?._rasterLift;
      const result=origUndo();
      if(result&&meta){restore(meta,true);this.redoStack.at(-1)._rasterLift=meta}
      return result;
    };
    store.redo=function(){
      const meta=this.redoStack.at(-1)?._rasterLift;
      const result=origRedo();
      if(result&&meta){restore(meta,false);this.undoStack.at(-1)._rasterLift=meta}
      return result;
    };
    function liftPixels(selectionOnly){
      if(!engine.project)return ctl.studio.toast?.('Open an artwork first.','error');
      const layer=engine.activeLayer();
      if(!layer||layer.locked||layer.type!=='raster')return ctl.studio.toast?.('Select an unlocked raster paint layer.','error');
      const sel=selectionOnly?engine.selection:null;
      if(selectionOnly&&(!sel||sel.w<1||sel.h<1))return ctl.studio.toast?.('Use the Selection toolkit to mark an area first.','error');
      let x=sel?Math.floor(sel.x):0,y=sel?Math.floor(sel.y):0;
      let right=sel?Math.ceil(sel.x+sel.w):engine.width,bottom=sel?Math.ceil(sel.y+sel.h):engine.height;
      x=clamp(x,0,engine.width-1);y=clamp(y,0,engine.height-1);
      right=clamp(right,x+1,engine.width);bottom=clamp(bottom,y+1,engine.height);
      const c=document.createElement('canvas');c.width=right-x;c.height=bottom-y;
      const ctx=c.getContext('2d',{willReadFrequently:true});
      ctx.drawImage(layer.canvas,x,y,c.width,c.height,0,0,c.width,c.height);
      const pixels=ctx.getImageData(0,0,c.width,c.height).data;
      let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
      for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++){
        if(pixels[(j*c.width+i)*4+3]===0)continue;
        if(i<minX)minX=i;if(j<minY)minY=j;if(i>maxX)maxX=i;if(j>maxY)maxY=j;
      }
      if(maxX<0)return ctl.studio.toast?.('No painted pixels were found in this area.','error');
      const crop=document.createElement('canvas');crop.width=maxX-minX+1;crop.height=maxY-minY+1;
      crop.getContext('2d').drawImage(c,minX,minY,crop.width,crop.height,0,0,crop.width,crop.height);
      const px=x+minX,py=y+minY;
      const obj=store.add('image',{name:layer.name+' · lifted art',geometry:{x:px,y:py,width:crop.width,height:crop.height},
        meta:{src:crop.toDataURL('image/png'),liftedFrom:layer.id},
        style:{opacity:1,blendMode:'source-over'}});
      // Move only the alpha-covered pixels; retain all other marks and layers.
      const lc=layer.canvas.getContext('2d',{willReadFrequently:true});lc.save();
      lc.globalCompositeOperation='destination-out';lc.drawImage(crop,px,py);lc.restore();
      const last=store.undoStack.at(-1);
      if(last)last._rasterLift={layerId:layer.id,pixels:crop,x:px,y:py};
      engine.selection=null;
      engine.render();
      store.select(obj.id);ctl.openInspector(false);
      ctl.studio.toast?.('Paint lifted to an editable layer. Drag, resize, rotate, reorder or duplicate it.');
    }
    ctl.liftRasterPixels=liftPixels;
    function installButtons(){
      const target=$('#savanski-art-toolbar [data-panel="layers"] .sav-panel-body');
      if(!target)return false;
      if(target.querySelector('[data-transform-repair]'))return true;
      const section=document.createElement('section');
      section.className='sav-section sav-expansion';
      section.dataset.transformRepair='true';
      section.innerHTML='<h3>Move & Transform Paint</h3><div class="sav-grid cols-2"><button class="sav-btn" type="button" data-lift="selection">Lift Selected Paint</button><button class="sav-btn" type="button" data-lift="layer">Lift Raster Layer</button></div><p class="sav-pro-note">Drawn strokes, spray paint and shapes are independently selectable using Select/Move. Drag the four corner handles to stretch, or the top handle to rotate. For older raster painting, select an area or lift an entire raster layer into an editable object. Undo/redo preserves the source pixels.</p>';
      target.appendChild(section);
      section.querySelector('[data-lift="selection"]').addEventListener('click',()=>liftPixels(true));
      section.querySelector('[data-lift="layer"]').addEventListener('click',()=>liftPixels(false));
      return true;
    }
    if(!installButtons()){
      let n=0;const retry=setInterval(()=>{if(installButtons()||++n>120)clearInterval(retry)},250);
    }
    return true;
  }
  if(!mount()){
    let count=0;const timer=setInterval(()=>{if(mount()||++count>180)clearInterval(timer)},100);
  }
})(window);
