(function(){
'use strict';
const uid=(p='id')=>`${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function makeCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function dataUrl(canvas){return canvas.toDataURL('image/png');}
function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src;});}
function hexToRgba(hex,a=1){const h=hex.replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255,a};}

class CanvasEngine{
 constructor(surface,overlay,stage){
  this.surface=surface;this.overlay=overlay;this.stage=stage;this.sctx=surface.getContext('2d',{willReadFrequently:true});this.octx=overlay.getContext('2d');
  this.project=null;this.canvasIndex=0;this.activeLayerId=null;this.tool='brush';this.primary='#000000';this.secondary='#ffffff';this.brushSize=18;this.opacity=1;this.brushKind='round';this.stabilization=0;this.brushSpacing=.12;this.brushScatter=0;this.brushFlow=1;this.brushPressure=true;this.brushTip='round';this.brushAngleJitter=0;this.pointerPressure=1;this.zoom=1;this.selection=null;this.drag=null;this.snap=false;this.guides=false;this.listeners={};this.clipboard=null;
  this.history=new window.LFHistory(this);this.bindPointers();
 }
 on(name,fn){(this.listeners[name]||(this.listeners[name]=[])).push(fn)}
 emit(name,payload){(this.listeners[name]||[]).forEach(fn=>{try{fn(payload);}catch(e){console.error(e)}})}
 safeName(){return (this.project?.name||'savanski-project').replace(/[^a-z0-9-_]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'savanski-project'}
 canvas(){return this.project?.canvases?.[this.canvasIndex]||null}
 layer(id=this.activeLayerId){return this.canvas()?.layers.find(l=>l.id===id)||null}
 activeLayer(){return this.layer()}
 dimensions(){const p=this.project;return p?{width:this.width,height:this.height,widthIn:p.widthIn,heightIn:p.heightIn,dpi:p.dpi}:null}
 createLayer(name='Layer',type='raster'){
   const canvas=makeCanvas(this.width,this.height);
   return {id:uid('layer'),name,type,visible:true,opacity:1,blendMode:'source-over',locked:false,canvas,mask:null,transform:{x:0,y:0,rotation:0,scaleX:1,scaleY:1,skewX:0,skewY:0},meta:type==='text'?window.LFTextEngine.defaultMeta(this.width,this.height):null};
 }
 createCanvas(index=0){const p={id:uid('canvas'),name:`Canvas ${index+1}`,layers:[]};const l=this.createLayer('Paint Layer','raster');p.layers.push(l);return p}
 async newProject(opts){
   const preset=window.LFCanvasSizeRegistry.get(opts.canvasSizeId);if(!preset)throw new Error('Select a canvas size preset.');
   this.width=Math.round(preset.widthIn*(opts.dpi||300));this.height=Math.round(preset.heightIn*(opts.dpi||300));
   this.surface.width=this.overlay.width=this.width;this.surface.height=this.overlay.height=this.height;
   this.project={id:uid('project'),name:opts.name||`Untitled ${opts.projectType==='canvas-set'?'Canvas Set':'Canvas'}`,projectType:opts.projectType||'canvas-design',canvasSizeId:preset.id,canvasSizeName:preset.name,category:preset.category,widthIn:preset.widthIn,heightIn:preset.heightIn,dpi:opts.dpi||300,canvasBase:opts.canvasBase||{kind:'transparent'},createdAt:Date.now(),updatedAt:Date.now(),canvases:[]};
   this.canvasIndex=0;this.project.canvases.push(this.createCanvas(0));this.activeLayerId=this.canvas().layers[0].id;
   if(this.project.projectType==='canvas-design')this.applyCanvasBase(this.project.canvasBase,false);
   this.selection=null;this.history.clear();this.render();this.emit('project');this.emit('layers');this.emit('canvas');
 }
 applyCanvasBase(base,push=true){
   if(!this.project||this.project.projectType!=='canvas-design')return;if(push)this.history.push(this.history.capture('Canvas Base'));
   const p=this.canvas();let layer=p.layers.find(l=>l.name==='Canvas Base');if(!layer){layer=this.createLayer('Canvas Base','raster');p.layers.unshift(layer);}const x=layer.canvas.getContext('2d');x.clearRect(0,0,this.width,this.height);
   base=base||{kind:'transparent'};this.project.canvasBase=base;
   if(base.kind==='solid'){x.fillStyle=base.value||'#ffffff';x.fillRect(0,0,this.width,this.height)}
   if(base.kind==='gradient'){const g=x.createLinearGradient(0,0,this.width,this.height);g.addColorStop(0,base.from||'#000');g.addColorStop(1,base.to||'#fff');x.fillStyle=g;x.fillRect(0,0,this.width,this.height)}
   layer.locked=true;this.render();this.emit('layers');
 }
 addLayer(type='raster',name){const snap=this.history.capture('Add Layer');const l=this.createLayer(name||({text:'Text',shape:'Shape',raster:'Paint Layer'}[type]||'Layer'),type);this.canvas().layers.push(l);this.activeLayerId=l.id;this.history.push(snap);this.render();this.emit('layers');return l}
 deleteLayer(id=this.activeLayerId){const p=this.canvas(),idx=p.layers.findIndex(l=>l.id===id);if(idx<0||p.layers.length<=1)return;const snap=this.history.capture('Delete Layer');p.layers.splice(idx,1);this.activeLayerId=p.layers[Math.min(idx,p.layers.length-1)].id;this.history.push(snap);this.render();this.emit('layers')}
 duplicateLayer(){const src=this.activeLayer();if(!src)return;const snap=this.history.capture('Duplicate Layer');const c=this.createLayer(`${src.name} copy`,src.type);c.visible=src.visible;c.opacity=src.opacity;c.blendMode=src.blendMode;c.locked=false;c.transform={...src.transform};c.meta=src.meta?JSON.parse(JSON.stringify(src.meta)):null;c.canvas.getContext('2d').drawImage(src.canvas,0,0);if(src.mask){c.mask=makeCanvas(this.width,this.height);c.mask.getContext('2d').drawImage(src.mask,0,0)}this.canvas().layers.push(c);this.activeLayerId=c.id;this.history.push(snap);this.render();this.emit('layers')}
 mergeDown(){const p=this.canvas(),idx=p.layers.findIndex(l=>l.id===this.activeLayerId);if(idx<=0)return;const snap=this.history.capture('Merge Down');const top=p.layers[idx],bottom=p.layers[idx-1];const temp=makeCanvas(this.width,this.height),t=temp.getContext('2d');this.drawLayerTo(t,bottom);this.drawLayerTo(t,top);bottom.canvas.getContext('2d').clearRect(0,0,this.width,this.height);bottom.canvas.getContext('2d').drawImage(temp,0,0);bottom.transform={x:0,y:0,rotation:0,scaleX:1,scaleY:1,skewX:0,skewY:0};bottom.opacity=1;bottom.blendMode='source-over';bottom.type='raster';bottom.meta=null;p.layers.splice(idx,1);this.activeLayerId=bottom.id;this.history.push(snap);this.render();this.emit('layers')}
 moveLayerOrder(delta){const p=this.canvas(),idx=p.layers.findIndex(l=>l.id===this.activeLayerId),to=clamp(idx+delta,0,p.layers.length-1);if(idx<0||to===idx)return;const snap=this.history.capture('Reorder Layer');const [l]=p.layers.splice(idx,1);p.layers.splice(to,0,l);this.history.push(snap);this.render();this.emit('layers')}
 selectLayer(id){if(this.layer(id)){this.activeLayerId=id;this.emit('layers');this.emit('activeLayer',this.layer(id))}}
 setTool(tool){this.tool=tool;this.selection=null;this.renderOverlay();this.emit('tool',tool)}
 setZoom(z){this.zoom=clamp(z,.1,4);this.stage.style.transform=`scale(${this.zoom})`;this.emit('zoom',this.zoom)}
 fit(){this.setZoom(1);this.stage.scrollIntoView({block:'center',inline:'center'})}
 addCanvas(){if(!this.project||this.project.projectType!=='canvas-set')return;const p=this.createCanvas(this.project.canvases.length);this.project.canvases.push(p);this.canvasIndex=this.project.canvases.length-1;this.activeLayerId=p.layers[0].id;this.history.clear();this.render();this.emit('canvas');this.emit('layers')}
 duplicateCanvas(){if(!this.project)return;const src=this.canvas();const p={id:uid('canvas'),name:`Canvas ${this.project.canvases.length+1}`,layers:src.layers.map(s=>{const l=this.createLayer(s.name,s.type);l.visible=s.visible;l.opacity=s.opacity;l.blendMode=s.blendMode;l.locked=s.locked;l.transform={...s.transform};l.meta=s.meta?JSON.parse(JSON.stringify(s.meta)):null;l.canvas.getContext('2d').drawImage(s.canvas,0,0);return l})};this.project.canvases.splice(this.canvasIndex+1,0,p);this.canvasIndex++;this.activeLayerId=p.layers.at(-1).id;this.render();this.emit('canvas');this.emit('layers')}
 deleteCanvas(){if(!this.project||this.project.canvases.length<=1)return;this.project.canvases.splice(this.canvasIndex,1);this.canvasIndex=clamp(this.canvasIndex,0,this.project.canvases.length-1);this.activeLayerId=this.canvas().layers.at(-1).id;this.history.clear();this.render();this.emit('canvas');this.emit('layers')}
 goCanvas(delta){if(!this.project)return;const n=clamp(this.canvasIndex+delta,0,this.project.canvases.length-1);if(n===this.canvasIndex)return;this.canvasIndex=n;this.activeLayerId=this.canvas().layers.at(-1)?.id;this.selection=null;this.history.clear();this.render();this.emit('canvas');this.emit('layers')}
 drawLayerTo(target,layer){if(!layer.visible)return;target.save();target.globalAlpha=layer.opacity;target.globalCompositeOperation=layer.blendMode||'source-over';const tr=layer.transform||{};target.translate(this.width/2+(tr.x||0),this.height/2+(tr.y||0));target.rotate((tr.rotation||0)*Math.PI/180);target.transform(tr.scaleX||1,Math.tan((tr.skewY||0)*Math.PI/180),Math.tan((tr.skewX||0)*Math.PI/180),tr.scaleY||1,0,0);target.translate(-this.width/2,-this.height/2);
   if(layer.mask){const temp=makeCanvas(this.width,this.height),tx=temp.getContext('2d');tx.drawImage(layer.canvas,0,0);tx.globalCompositeOperation='destination-in';tx.drawImage(layer.mask,0,0);target.drawImage(temp,0,0)}else target.drawImage(layer.canvas,0,0);target.restore();}
 render(){if(!this.project)return;const x=this.sctx;x.save();x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,this.width,this.height);for(const l of this.canvas().layers)this.drawLayerTo(x,l);x.restore();this.renderOverlay();this.emit('render')}
 renderOverlay(){if(!this.project)return;const x=this.octx;x.clearRect(0,0,this.width,this.height);if(this.guides){x.save();x.strokeStyle='rgba(0,120,255,.7)';x.lineWidth=Math.max(1,this.width/1800);x.setLineDash([this.width/200,this.width/300]);const margin=.125*this.project.dpi;x.strokeRect(margin,margin,this.width-margin*2,this.height-margin*2);x.strokeStyle='rgba(255,0,80,.45)';const safe=.25*this.project.dpi;x.strokeRect(safe,safe,this.width-safe*2,this.height-safe*2);x.restore()}
   if(this.selection){x.save();x.strokeStyle='#1687ff';x.fillStyle='rgba(22,135,255,.08)';x.lineWidth=Math.max(1,this.width/1600);x.setLineDash([this.width/220,this.width/260]);const s=this.selection;x.fillRect(s.x,s.y,s.w,s.h);x.strokeRect(s.x,s.y,s.w,s.h);x.restore()}}
 coords(ev){const r=this.overlay.getBoundingClientRect();return {x:clamp((ev.clientX-r.left)*this.width/r.width,0,this.width),y:clamp((ev.clientY-r.top)*this.height/r.height,0,this.height)}}
 bindPointers(){this.overlay.addEventListener('pointerdown',e=>this.pointerDown(e));this.overlay.addEventListener('pointermove',e=>this.pointerMove(e));this.overlay.addEventListener('pointerup',e=>this.pointerUp(e));this.overlay.addEventListener('pointercancel',e=>this.pointerUp(e));}
 ensureRaster(){let l=this.activeLayer();if(!l||l.locked)return null;if(l.type!=='raster'){l=this.addLayer('raster','Paint Layer')}return l}
 pointerDown(e){if(!this.project)return;this.pointerPressure=e.pointerType==='mouse'?1:clamp(+e.pressure||1,.05,1);const p=this.coords(e);this.overlay.setPointerCapture?.(e.pointerId);const l=this.activeLayer();
   if(this.tool==='eyedropper'){const d=this.sctx.getImageData(Math.floor(p.x),Math.floor(p.y),1,1).data;const h='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('');this.primary=h;this.emit('color',h);return}
   if(this.tool==='text'){window.LFTextEngine.insertAt(this,p.x,p.y);return}
   if(this.tool==='fill'){const r=this.ensureRaster();if(!r)return;const snap=this.history.capture('Fill');window.LFImageTools.floodFill(r.canvas,Math.floor(p.x),Math.floor(p.y),this.primary,this.opacity);this.history.push(snap);this.render();return}
   if(this.tool==='move'){if(!l||l.locked)return;this.drag={kind:'move',start:p,last:p,snapshot:this.history.capture('Move Layer'),base:{...l.transform}};return}
   if(this.tool==='clone-stamp'){if(e.altKey||!this.cloneSource){this.cloneSource=p;this.emit('cloneSource',p);return}const r=this.ensureRaster();if(!r)return;this.drag={kind:'clone',start:p,last:p,snapshot:this.history.capture('Clone Stamp'),offset:{x:this.cloneSource.x-p.x,y:this.cloneSource.y-p.y}};this.cloneSegment(r.canvas,p,p,this.drag.offset);this.render();return}
   if(['select','crop','magic-select'].includes(this.tool)){this.drag={kind:this.tool,start:p,last:p};this.selection={x:p.x,y:p.y,w:0,h:0};this.renderOverlay();return}
   if(['line','rectangle','roundrect','ellipse','triangle','star','arrow','heart','speech'].includes(this.tool)){const r=this.ensureRaster();if(!r)return;this.drag={kind:'shape',shape:this.tool,start:p,last:p,snapshot:this.history.capture('Shape')};return}
   if(['brush','pencil','marker','airbrush','calligraphy','crayon','watercolor','eraser','blur-brush','sharpen-brush','dodge','burn','smudge'].includes(this.tool)){const r=this.ensureRaster();if(!r)return;this.drag={kind:'paint',start:p,last:p,snapshot:this.history.capture(this.tool)};this.paintSegment(r.canvas,p,p,true);this.render();return}
 }
 pointerMove(e){if(!this.drag||!this.project)return;this.pointerPressure=e.pointerType==='mouse'?1:clamp(+e.pressure||1,.05,1);const p=this.coords(e),d=this.drag;
   if(d.kind==='paint'){const l=this.activeLayer();if(l&&!l.locked){const s=clamp(+this.stabilization||0,0,.95),q=s?{x:d.last.x+(p.x-d.last.x)*(1-s),y:d.last.y+(p.y-d.last.y)*(1-s)}:p;this.paintSegment(l.canvas,d.last,q,false);d.last=q;this.render()}return}
   if(d.kind==='clone'){const l=this.activeLayer();if(l&&!l.locked){this.cloneSegment(l.canvas,d.last,p,d.offset);d.last=p;this.render()}return}
   if(d.kind==='move'){const l=this.activeLayer();if(!l)return;let dx=p.x-d.start.x,dy=p.y-d.start.y;if(this.snap){const gx=this.width/20,gy=this.height/20;dx=Math.round((d.base.x+dx)/gx)*gx-d.base.x;dy=Math.round((d.base.y+dy)/gy)*gy-d.base.y}l.transform.x=d.base.x+dx;l.transform.y=d.base.y+dy;this.render();return}
   if(['select','crop','magic-select'].includes(d.kind)){this.selection=this.rectFrom(d.start,p);this.renderOverlay();return}
   if(d.kind==='shape'){d.last=p;this.render();this.previewShape(d.shape,d.start,p);return}
 }
 pointerUp(e){if(!this.drag)return;const p=this.coords(e),d=this.drag;this.drag=null;
   if(d.kind==='paint'||d.kind==='clone'||d.kind==='move'){this.history.push(d.snapshot);this.render();this.emit('layers');return}
   if(d.kind==='shape'){const l=this.activeLayer();if(l){this.drawShape(l.canvas,d.shape,d.start,p);this.history.push(d.snapshot);this.render()}return}
   if(d.kind==='crop'){this.selection=this.rectFrom(d.start,p);this.renderOverlay();this.cropToSelection();return}
   if(d.kind==='magic-select'){this.selection=this.rectFrom(d.start,p);this.renderOverlay();return}
 }
 rectFrom(a,b){return {x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(a.x-b.x),h:Math.abs(a.y-b.y)}}
 paintSegment(canvas,a,b,first){const x=canvas.getContext('2d',{willReadFrequently:true});const pressure=this.brushPressure?clamp(+this.pointerPressure||1,.05,1):1;const size=Math.max(1,this.brushSize*this.project.dpi/96*pressure);const flow=clamp(+this.brushFlow||1,.02,1);const dynamicAlpha=clamp(this.opacity*flow*pressure,0,1);x.save();x.globalAlpha=dynamicAlpha;x.lineWidth=size;x.lineJoin='round';x.lineCap=this.tool==='calligraphy'?'butt':'round';x.strokeStyle=this.primary;x.fillStyle=this.primary;
   if(this.tool==='eraser'){x.globalCompositeOperation='destination-out';x.strokeStyle=`rgba(0,0,0,${dynamicAlpha})`;}
   if(this.tool==='marker'){x.globalAlpha=dynamicAlpha*.42;x.lineWidth=size*1.5}
   if(this.tool==='pencil'){x.globalAlpha=Math.min(1,dynamicAlpha*.9);x.lineWidth=Math.max(1,size*.32);x.lineCap='square'}
   if(this.tool==='watercolor'){x.globalAlpha=dynamicAlpha*.11;x.lineWidth=size*2.1}
   if(this.tool==='crayon'){x.globalAlpha=dynamicAlpha*.62;x.lineWidth=size*1.2}
   if(this.tool==='airbrush'){const dist=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(dist/(size/5)));for(let i=0;i<=steps;i++){const t=i/steps,cx=a.x+(b.x-a.x)*t,cy=a.y+(b.y-a.y)*t;for(let n=0;n<10;n++){const ang=Math.random()*Math.PI*2,rad=Math.random()*size*.65;x.globalAlpha=dynamicAlpha*.08;x.beginPath();x.arc(cx+Math.cos(ang)*rad,cy+Math.sin(ang)*rad,Math.max(1,size*.06),0,Math.PI*2);x.fill()}}x.restore();return}
   if(['blur-brush','sharpen-brush','dodge','burn','smudge'].includes(this.tool)){x.restore();window.LFImageTools.localBrush(canvas,a,b,size,this.tool,dynamicAlpha);return}
   const dynamicBrush=(this.brushTip&&this.brushTip!=='round')||(+this.brushScatter||0)>0.001||(+this.brushSpacing||.12)>.14||(+this.brushAngleJitter||0)>0.001;
   if(dynamicBrush&&['brush','pencil','marker','calligraphy','crayon','watercolor','eraser'].includes(this.tool)){this.paintDynamicDabs(x,a,b,size,dynamicAlpha,first);x.restore();return}
   if(first){x.beginPath();x.moveTo(a.x,a.y);x.lineTo(a.x+.01,a.y+.01);x.stroke()}else{x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}
   if(this.tool==='crayon'){for(let i=0;i<5;i++){x.globalAlpha=dynamicAlpha*.09;x.beginPath();x.moveTo(a.x+(Math.random()-.5)*size,b.y+(Math.random()-.5)*size);x.lineTo(b.x+(Math.random()-.5)*size,b.y+(Math.random()-.5)*size);x.stroke()}}
   x.restore();}
 paintDynamicDabs(x,a,b,size,alpha,first){const dist=Math.hypot(b.x-a.x,b.y-a.y),spacing=Math.max(1,size*clamp(+this.brushSpacing||.12,.02,2)),steps=first?0:Math.max(1,Math.ceil(dist/spacing)),scatter=clamp(+this.brushScatter||0,0,2)*size,angleJitter=clamp(+this.brushAngleJitter||0,0,180)*Math.PI/180;for(let i=0;i<=steps;i++){const t=steps?i/steps:0,px=a.x+(b.x-a.x)*t+(Math.random()-.5)*2*scatter,py=a.y+(b.y-a.y)*t+(Math.random()-.5)*2*scatter,ang=(Math.random()-.5)*2*angleJitter;this.paintDab(x,px,py,size,alpha,ang)}}
 paintDab(x,cx,cy,size,alpha,angle=0){x.save();x.translate(cx,cy);x.rotate(angle);x.globalAlpha=alpha;const r=size/2,tip=this.brushTip||'round';x.beginPath();if(tip==='square')x.rect(-r,-r,size,size);else if(tip==='diamond'){x.moveTo(0,-r);x.lineTo(r,0);x.lineTo(0,r);x.lineTo(-r,0);x.closePath()}else if(tip==='triangle'){x.moveTo(0,-r);x.lineTo(r,r);x.lineTo(-r,r);x.closePath()}else if(tip==='star'){for(let i=0;i<10;i++){const rr=i%2?r*.45:r,a=-Math.PI/2+i*Math.PI/5,px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?x.lineTo(px,py):x.moveTo(px,py)}x.closePath()}else x.arc(0,0,r,0,Math.PI*2);x.fill();x.restore()}
 cloneSegment(canvas,a,b,offset){const ctx=canvas.getContext('2d');const size=Math.max(2,this.brushSize*this.project.dpi/96),dist=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(dist/Math.max(2,size*.25)));for(let i=0;i<=steps;i++){const t=i/steps,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t,sx=x+offset.x,sy=y+offset.y;const patch=makeCanvas(Math.ceil(size*2),Math.ceil(size*2)),px=patch.getContext('2d');px.drawImage(canvas,sx-size,sy-size,size*2,size*2,0,0,size*2,size*2);ctx.save();ctx.globalAlpha=this.opacity;ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.clip();ctx.drawImage(patch,x-size,y-size);ctx.restore()}}
 previewShape(shape,a,b){this.renderOverlay();const temp=this.octx;this.styleShape(temp);this.shapePath(temp,shape,a,b);temp.restore()}
 styleShape(x){x.save();x.globalAlpha=this.opacity;x.strokeStyle=this.primary;x.fillStyle=this.secondary;x.lineWidth=Math.max(1,this.brushSize*this.project.dpi/160);x.lineJoin='round'}
 drawShape(canvas,shape,a,b){const x=canvas.getContext('2d');this.styleShape(x);this.shapePath(x,shape,a,b);x.restore()}
 shapePath(x,shape,a,b){const r=this.rectFrom(a,b),cx=r.x+r.w/2,cy=r.y+r.h/2;x.beginPath();
   if(shape==='line'){x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();return}
   if(shape==='rectangle'){x.rect(r.x,r.y,r.w,r.h)}
   if(shape==='roundrect'){const rr=Math.min(r.w,r.h)*.12;x.roundRect?x.roundRect(r.x,r.y,r.w,r.h,rr):x.rect(r.x,r.y,r.w,r.h)}
   if(shape==='ellipse')x.ellipse(cx,cy,r.w/2,r.h/2,0,0,Math.PI*2)
   if(shape==='triangle'){x.moveTo(cx,r.y);x.lineTo(r.x+r.w,r.y+r.h);x.lineTo(r.x,r.y+r.h);x.closePath()}
   if(shape==='star'){this.polygonStar(x,cx,cy,5,Math.min(r.w,r.h)/2,Math.min(r.w,r.h)/4)}
   if(shape==='heart'){const w=r.w,h=r.h;x.moveTo(cx,r.y+h);x.bezierCurveTo(r.x-w*.1,r.y+h*.55,r.x,r.y+h*.15,cx,r.y+h*.35);x.bezierCurveTo(r.x+w,r.y+h*.15,r.x+w*1.1,r.y+h*.55,cx,r.y+h);x.closePath()}
   if(shape==='arrow'){const head=Math.min(r.w,r.h)*.35;x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();const ang=Math.atan2(b.y-a.y,b.x-a.x);x.beginPath();x.moveTo(b.x,b.y);x.lineTo(b.x-Math.cos(ang-Math.PI/6)*head,b.y-Math.sin(ang-Math.PI/6)*head);x.lineTo(b.x-Math.cos(ang+Math.PI/6)*head,b.y-Math.sin(ang+Math.PI/6)*head);x.closePath()}
   if(shape==='speech'){x.roundRect?x.roundRect(r.x,r.y,r.w,r.h*.8,Math.min(r.w,r.h)*.08):x.rect(r.x,r.y,r.w,r.h*.8);x.moveTo(r.x+r.w*.28,r.y+r.h*.8);x.lineTo(r.x+r.w*.18,r.y+r.h);x.lineTo(r.x+r.w*.42,r.y+r.h*.8)}
   x.fill();x.stroke();}
 polygonStar(x,cx,cy,points,outer,inner){let rot=-Math.PI/2;for(let i=0;i<points*2;i++){const rad=i%2?inner:outer,px=cx+Math.cos(rot)*rad,py=cy+Math.sin(rot)*rad;i?x.lineTo(px,py):x.moveTo(px,py);rot+=Math.PI/points}x.closePath()}
 cropToSelection(){const l=this.activeLayer(),s=this.selection;if(!l||l.locked||!s||s.w<2||s.h<2)return;const snap=this.history.capture('Crop Layer');const x=l.canvas.getContext('2d');const temp=makeCanvas(this.width,this.height),t=temp.getContext('2d');t.drawImage(l.canvas,s.x,s.y,s.w,s.h,s.x,s.y,s.w,s.h);x.clearRect(0,0,this.width,this.height);x.drawImage(temp,0,0);this.history.push(snap);this.selection=null;this.render()}
 copy(){const s=this.selection,l=this.activeLayer();if(!s||!l)return;const c=makeCanvas(Math.max(1,Math.round(s.w)),Math.max(1,Math.round(s.h)));c.getContext('2d').drawImage(l.canvas,s.x,s.y,s.w,s.h,0,0,c.width,c.height);this.clipboard=c;this.emit('clipboard')}
 cut(){const l=this.activeLayer();if(!l||l.locked||!this.selection)return;const snap=this.history.capture('Cut');this.copy();l.canvas.getContext('2d').clearRect(this.selection.x,this.selection.y,this.selection.w,this.selection.h);this.history.push(snap);this.render()}
 paste(){if(!this.clipboard)return;const l=this.ensureRaster();if(!l)return;const snap=this.history.capture('Paste');const x=l.canvas.getContext('2d'),px=this.selection?.x??(this.width-this.clipboard.width)/2,py=this.selection?.y??(this.height-this.clipboard.height)/2;x.drawImage(this.clipboard,px,py);this.history.push(snap);this.render()}
 selectAll(){this.selection={x:0,y:0,w:this.width,h:this.height};this.renderOverlay()}
 clearSelection(){this.selection=null;this.renderOverlay()}
 rotateLayer(deg){const l=this.activeLayer();if(!l||l.locked)return;const snap=this.history.capture('Rotate Layer');l.transform.rotation=(l.transform.rotation+deg)%360;this.history.push(snap);this.render();this.emit('layers')}
 flipLayer(axis){const l=this.activeLayer();if(!l||l.locked)return;const snap=this.history.capture('Flip Layer');if(axis==='x')l.transform.scaleX*=-1;else l.transform.scaleY*=-1;this.history.push(snap);this.render();this.emit('layers')}
 centerLayer(){const l=this.activeLayer();if(!l||l.locked)return;const snap=this.history.capture('Center Layer');l.transform.x=l.transform.y=0;this.history.push(snap);this.render()}
 addMask(){const l=this.activeLayer();if(!l)return;const snap=this.history.capture('Add Mask');l.mask=makeCanvas(this.width,this.height);const m=l.mask.getContext('2d');m.fillStyle='#fff';m.fillRect(0,0,this.width,this.height);this.history.push(snap);this.emit('layers');this.render()}
 removeMask(){const l=this.activeLayer();if(!l||!l.mask)return;const snap=this.history.capture('Remove Mask');l.mask=null;this.history.push(snap);this.render();this.emit('layers')}
 async importImage(file){const src=URL.createObjectURL(file);try{const im=await loadImage(src),l=this.addLayer('raster',file.name.replace(/\.[^.]+$/,''));const scale=Math.min(this.width/im.width,this.height/im.height,1),w=im.width*scale,h=im.height*scale;l.canvas.getContext('2d').drawImage(im,(this.width-w)/2,(this.height-h)/2,w,h);this.render();return l}finally{URL.revokeObjectURL(src)}}
 async importImageDataUrl(src,name='Imported Image'){const im=await loadImage(src),l=this.addLayer('raster',name),scale=Math.min(this.width/im.width,this.height/im.height,1),w=im.width*scale,h=im.height*scale;l.canvas.getContext('2d').drawImage(im,(this.width-w)/2,(this.height-h)/2,w,h);this.render();return l}
 async serialize(){if(!this.project)return null;return {...this.project,updatedAt:Date.now(),canvases:this.project.canvases.map(p=>({id:p.id,name:p.name,layers:p.layers.map(l=>({id:l.id,name:l.name,type:l.type,visible:l.visible,opacity:l.opacity,blendMode:l.blendMode,locked:l.locked,transform:l.transform,meta:l.meta,bitmap:dataUrl(l.canvas),mask:l.mask?dataUrl(l.mask):null}))}))}}
 async deserialize(data){
  const preset=window.LFCanvasSizeRegistry.get(data.canvasSizeId);if(!preset)throw new Error('This project uses an unknown canvas size preset.');
  this.width=Math.round(data.widthIn*data.dpi);this.height=Math.round(data.heightIn*data.dpi);this.surface.width=this.overlay.width=this.width;this.surface.height=this.overlay.height=this.height;
  const sourceCanvases=data.canvases||[];const canvases=[];
  for(const p of sourceCanvases){const canvas={id:p.id||uid('canvas'),name:p.name||`Canvas ${canvases.length+1}`,layers:[]};for(const layerData of p.layers){const l=this.createLayer(layerData.name,layerData.type);Object.assign(l,{id:layerData.id||l.id,visible:layerData.visible!==false,opacity:layerData.opacity??1,blendMode:layerData.blendMode||'source-over',locked:!!layerData.locked,transform:{...l.transform,...layerData.transform},meta:layerData.meta||null});if(layerData.bitmap){const im=await loadImage(layerData.bitmap);l.canvas.getContext('2d').drawImage(im,0,0)}if(layerData.mask){l.mask=makeCanvas(this.width,this.height);const im=await loadImage(layerData.mask);l.mask.getContext('2d').drawImage(im,0,0)}canvas.layers.push(l)}canvases.push(canvas)}
  if(!canvases.length)canvases.push(this.createCanvas(0));this.project={...data,canvases};this.canvasIndex=0;this.activeLayerId=this.canvas().layers.at(-1)?.id;this.selection=null;this.history.clear();this.render();this.emit('project');this.emit('canvas');this.emit('layers')
 }
 async saveLocal(){const data=await this.serialize();await window.LFStorage.put(data);this.emit('saved',data);return data}
}
window.LFCanvasEngine=CanvasEngine;
})();
