
(function(global){
'use strict';
const A=global.LFAdvanced=global.LFAdvanced||{};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
function fileDataURL(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
class AdvancedController{
 constructor(studio){
  this.studio=studio;this.engine=studio.engine;this.store=new A.SceneStore();this.renderer=new A.SceneRenderer(this.engine.surface,this.store,()=>this.render());
  this.drag=null;this.muted=false;this.mode='art';this.savedShapePreset=null;this.install();
 }
 canvasId(){return this.engine.canvas()?.id||'canvas-1'}
 syncCanvas(){if(this.store.canvasId!==this.canvasId())this.store.setCanvas(this.canvasId())}
 active(){return !!this.engine.project && (!document.body.classList.contains('canvas-studio-open')||document.body.classList.contains('canvas-art-edit'))}
 install(){
  global.LFAdvancedController=this;this.syncCanvas();this.store.onChange(()=>{if(this.muted)return;this.render();this.syncPanels();this.markDirty()});
  this.patchEngine();this.bindPointers();this.bindKeyboard();this.bindLayerControls();this.bindObjectInspector();this.bindImport();
  const oldRenderLayers=this.studio.renderLayers.bind(this.studio);this.studio.renderLayers=()=>{oldRenderLayers();this.appendObjectLayers()};
  const oldOpen=this.studio.openWorkspace.bind(this.studio);this.studio.openWorkspace=()=>{oldOpen();this.syncCanvas();this.renderer.resize(this.engine.width,this.engine.height);this.render();this.appendObjectLayers()};
  const oldUpdatePage=this.studio.updateCanvas.bind(this.studio);this.studio.updateCanvas=()=>{oldUpdatePage();this.syncCanvas();this.render();this.appendObjectLayers()};
  this.render();
 }
 patchEngine(){
   const e=this.engine,self=this,origRender=e.render.bind(e),origOverlay=e.renderOverlay.bind(e),origNew=e.newProject.bind(e),origSer=e.serialize.bind(e),origDes=e.deserialize.bind(e),origImport=e.importImage.bind(e),origImportData=e.importImageDataUrl.bind(e);
   e.render=function(){origRender();self.syncCanvas();self.renderer.resize(e.width,e.height);self.renderer.render(e.sctx,{clear:false});self.renderSelectionOnly();};
   e.renderOverlay=function(){origOverlay();self.renderSelectionOnly();};
   e.newProject=async function(opts){await origNew(opts);self.store.clear();self.store.setCanvas(self.canvasId());self.renderer.resize(e.width,e.height);self.render();return e.project};
   e.serialize=async function(){const data=await origSer();data.advancedScene=self.store.serialize();data.schemaVersion='3.0.0';return data};
   e.deserialize=async function(data){await origDes(data);self.store.clear();if(data?.advancedScene)self.store.load(data.advancedScene);self.store.setCanvas(self.canvasId());self.renderer.resize(e.width,e.height);self.render()};
   e.importImage=async function(file){if(!self.active())return origImport(file);const src=await fileDataURL(file),im=await self.loadImage(src),scale=Math.min(e.width/im.naturalWidth,e.height/im.naturalHeight,1),w=im.naturalWidth*scale,h=im.naturalHeight*scale,o=self.store.add('image',{name:file.name.replace(/\.[^.]+$/,''),geometry:{x:(e.width-w)/2,y:(e.height-h)/2,width:w,height:h},meta:{src,fileName:file.name,mime:file.type},style:{opacity:1,blendMode:'source-over'}});self.render();self.openInspector();return o};
   e.importImageDataUrl=async function(src,name='Imported Image'){if(!self.active())return origImportData(src,name);const im=await self.loadImage(src),scale=Math.min(e.width/im.naturalWidth,e.height/im.naturalHeight,1),w=im.naturalWidth*scale,h=im.naturalHeight*scale,o=self.store.add('generated-image',{name,geometry:{x:(e.width-w)/2,y:(e.height-h)/2,width:w,height:h},meta:{src,generated:true},style:{opacity:1,blendMode:'source-over'}});self.render();self.openInspector();return o};
   const origDel=e.deleteLayer.bind(e),origDup=e.duplicateLayer.bind(e),origMove=e.moveLayerOrder.bind(e),origCopy=e.copy.bind(e),origCut=e.cut.bind(e),origPaste=e.paste.bind(e);
   e.deleteLayer=function(id){if(self.store.selected())return self.store.remove();return origDel(id)};
   e.duplicateLayer=function(){if(self.store.selected())return self.store.duplicate();return origDup()};
   e.moveLayerOrder=function(delta){if(self.store.selected())return self.store.reorder(self.store.selectedId,delta);return origMove(delta)};
   e.copy=function(){if(self.store.selected())return self.store.copy();return origCopy()};
   e.cut=function(){if(self.store.selected())return self.store.cut();return origCut()};
   e.paste=function(){if(self.store.clipboard)return self.store.paste();return origPaste()};
   const h=e.history,undo=h.undo.bind(h),redo=h.redo.bind(h);h.undo=()=>self.store.undoStack.length?self.store.undo():undo();h.redo=()=>self.store.redoStack.length?self.store.redo():redo();
 }
 loadImage(src){return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=src})}
 coords(ev){return this.engine.coords(ev)}
 render(){if(!this.engine.project)return;this.muted=true;try{this.engine.render()}finally{this.muted=false}}
 renderSelectionOnly(){if(!this.engine.project)return;const o=this.store.selected();if(o)this.renderer.drawSelection(this.engine.overlay,o)}
 markDirty(){if($('#statusSave'))$('#statusSave').textContent='Unsaved changes'}
 bindPointers(){
   const ov=this.engine.overlay;
   for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])ov.addEventListener(type,e=>this.pointer(type,e),true);
 }
 pointer(type,e){
   if(!this.active())return;this.syncCanvas();const tool=this.engine.tool||'select';
   const supported=['select','move','brush','pencil','marker','airbrush','spray','eraser','line','rectangle','roundrect','ellipse','triangle','arrow','star','heart','speech','fill','text','crop','eyedropper','calligraphy','crayon','watercolor','oil','pixel','texture','blur-brush','sharpen-brush','dodge','burn','smudge','clone-stamp'];
   if(!supported.includes(tool))return;
   e.preventDefault();e.stopImmediatePropagation();const p=this.coords(e);
   if(type==='pointerdown')this.pointerDown(tool,p,e);
   else if(type==='pointermove')this.pointerMove(tool,p,e);
   else this.pointerUp(tool,p,e);
 }
 pointerDown(tool,p,e){
   this.engine.overlay.setPointerCapture?.(e.pointerId);
   if(tool==='select'||tool==='move'){const hit=this.renderer.hitTest(p.x,p.y);this.store.select(hit?.id||null);if(hit&&!hit.locked){this.store.snapshot('Move object');this.drag={kind:'move',id:hit.id,start:p,base:{...hit.transform}}}this.syncPanels();return}
   if(tool==='eyedropper'){const d=this.engine.sctx.getImageData(Math.max(0,Math.floor(p.x)),Math.max(0,Math.floor(p.y)),1,1).data,color=`#${[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('')}`;this.engine.primary=color;this.engine.emit('color',color);this.studio.setPrimary?.(color);return}
   if(tool==='fill'){this.store.add('fill',{name:'Editable Fill',geometry:{x:0,y:0,width:this.engine.width,height:this.engine.height},style:{fill:this.engine.primary,color:this.engine.primary,opacity:this.engine.opacity,blendMode:'source-over'}});return}
   if(tool==='text'){const text=global.prompt('Text','Canvas Title');if(text==null)return;const size=Math.max(24,this.engine.width/18),o=this.store.add('text',{name:text.slice(0,40)||'Text',geometry:{x:p.x,y:p.y,width:Math.min(this.engine.width*.8,Math.max(220,text.length*size*.65)),height:size*1.65},meta:{text,fontFamily:'Arial',fontSize:size,dimensionMode:'2D',depth:0,depthColor:'#222222'},style:{fill:this.engine.primary,color:this.engine.primary,opacity:this.engine.opacity,stroke:'#ffffff',strokeWidth:0}});this.openInspector();return}
   if(tool==='crop'){const sel=this.store.selected();if(sel){this.store.snapshot('Crop object');this.drag={kind:'crop',id:sel.id,start:p,base:null};}return}
   if(['line','rectangle','roundrect','ellipse','triangle','arrow','star','heart','speech'].includes(tool)){const shape=tool==='roundrect'?'rounded-rectangle':tool,o=this.store.add('shape',{name:`${shape[0].toUpperCase()+shape.slice(1)} Shape`,geometry:{x:p.x,y:p.y,width:1,height:1,shape},style:{fill:tool==='line'?'transparent':this.engine.secondary,stroke:this.engine.primary,strokeWidth:Math.max(1,this.engine.brushSize/5),opacity:this.engine.opacity}});this.drag={kind:'shape',id:o.id,start:p};return}
   if(tool==='clone-stamp'&&e.altKey){this.cloneSource={x:p.x,y:p.y};this.studio.toast?.('Clone source sampled. Paint to create an editable Clone Stamp stroke.');return}
   if(['blur-brush','sharpen-brush','dodge','burn','smudge','clone-stamp'].includes(tool)){
     if(tool==='clone-stamp'&&!this.cloneSource){this.cloneSource={x:p.x,y:p.y};this.studio.toast?.('Clone source set. Paint elsewhere to create an editable Clone Stamp stroke.');return}
     const o=this.store.add('effect-stroke',{name:`${tool.replace(/-/g,' ')} effect`,geometry:{points:[{x:p.x,y:p.y,pressure:e.pressure||.5}]},meta:{effectKind:tool,cloneSource:this.cloneSource?{...this.cloneSource}:null},style:{size:this.engine.brushSize,opacity:this.engine.opacity,strength:.5,nibShape:'circle',spacing:.12}});this.drag={kind:'stroke',id:o.id};return
   }
   const kind=tool==='eraser'?'eraser-stroke': 'stroke',brushKind=tool==='spray'?'airbrush':tool,preset=global.LFBrushPresetActive&&((global.LFBrushPresetActive.kind==='spray'?'airbrush':global.LFBrushPresetActive.kind)===brushKind)?global.LFBrushPresetActive:null;
   const o=this.store.add(kind,{name:`${brushKind[0].toUpperCase()+brushKind.slice(1)} Stroke`,geometry:{points:[{x:p.x,y:p.y,pressure:e.pressure||.5}]},style:{color:this.engine.primary,fill:this.engine.primary,stroke:this.engine.primary,size:preset?.size||this.engine.brushSize,opacity:preset?.opacity??this.engine.opacity,brushKind,nibShape:preset?.nib||(tool==='texture'?'diamond':'circle'),nibCustomPath:preset?.nibCustomPath||null,pressure:true,spacing:preset?.spacing??.14,hardness:preset?.hardness,scatter:preset?.scatter,rotation:preset?.rotation,pressureCurve:preset?.pressureCurve,speedCurve:preset?.speedCurve,flow:preset?.flow,wetness:preset?.wetness,grain:preset?.grain}});
   this.drag={kind:'stroke',id:o.id};
 }
 pointerMove(tool,p,e){
   if(!this.drag)return;const o=this.store.list().find(x=>x.id===this.drag.id);if(!o)return;
   if(this.drag.kind==='move'){o.transform.x=this.drag.base.x+(p.x-this.drag.start.x);o.transform.y=this.drag.base.y+(p.y-this.drag.start.y);o.updatedAt=Date.now();this.render();return}
   if(this.drag.kind==='stroke'){o.geometry.points.push({x:p.x,y:p.y,pressure:e.pressure||.5});o.updatedAt=Date.now();this.render();return}
   if(this.drag.kind==='shape'){let x=Math.min(this.drag.start.x,p.x),y=Math.min(this.drag.start.y,p.y),w=Math.max(1,Math.abs(p.x-this.drag.start.x)),h=Math.max(1,Math.abs(p.y-this.drag.start.y));if(e.shiftKey){const s=Math.max(w,h);w=h=s;if(p.x<this.drag.start.x)x=this.drag.start.x-s;if(p.y<this.drag.start.y)y=this.drag.start.y-s}o.geometry={...o.geometry,x,y,width:w,height:h};this.render();return}
   if(this.drag.kind==='crop'){const b=this.renderer.bounds(o),x=Math.max(b.x,Math.min(this.drag.start.x,p.x)),y=Math.max(b.y,Math.min(this.drag.start.y,p.y)),x2=Math.min(b.x+b.w,Math.max(this.drag.start.x,p.x)),y2=Math.min(b.y+b.h,Math.max(this.drag.start.y,p.y));o.crop.x=(x-b.x)/b.w;o.crop.y=(y-b.y)/b.h;o.crop.width=Math.max(.001,(x2-x)/b.w);o.crop.height=Math.max(.001,(y2-y)/b.h);this.render()}
 }
 pointerUp(tool,p,e){
   if(!this.drag)return;const d=this.drag,o=this.store.list().find(x=>x.id===d.id);this.drag=null;if(o){o.updatedAt=Date.now();this.store.changed('update',o);this.openInspector(false)}
 }
 bindKeyboard(){
  document.addEventListener('keydown',e=>{if(!this.active()||e.target.matches('input,textarea,select'))return;const o=this.store.selected(),mod=e.ctrlKey||e.metaKey;if(o&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();const n=e.shiftKey?10:1;this.store.snapshot('Nudge object');o.transform.x+=(e.key==='ArrowRight'?n:e.key==='ArrowLeft'?-n:0);o.transform.y+=(e.key==='ArrowDown'?n:e.key==='ArrowUp'?-n:0);this.store.changed('update',o);return}if(o&&e.key==='Delete'){e.preventDefault();e.stopImmediatePropagation();this.store.remove();return}if(mod&&o&&e.key.toLowerCase()==='c'){e.preventDefault();e.stopImmediatePropagation();this.store.copy();return}if(mod&&o&&e.key.toLowerCase()==='x'){e.preventDefault();e.stopImmediatePropagation();this.store.cut();return}if(mod&&this.store.clipboard&&e.key.toLowerCase()==='v'){e.preventDefault();e.stopImmediatePropagation();this.store.paste();return}},true);
 }
 bindLayerControls(){
   const inputs=['layerOpacity','blendMode','layerScaleX','layerScaleY','layerRotation','layerX','layerY'];
   inputs.forEach(id=>$('#'+id)?.addEventListener(id==='blendMode'?'change':'input',e=>{const o=this.store.selected();if(!o)return;e.stopImmediatePropagation();if(id==='layerOpacity')o.style.opacity=+e.target.value/100;if(id==='blendMode')o.style.blendMode=e.target.value;if(id==='layerScaleX')o.transform.scaleX=(+e.target.value||.01)/100;if(id==='layerScaleY')o.transform.scaleY=(+e.target.value||.01)/100;if(id==='layerRotation')o.transform.rotation=+e.target.value||0;if(id==='layerX')o.transform.x=+e.target.value||0;if(id==='layerY')o.transform.y=+e.target.value||0;o.updatedAt=Date.now();this.store.changed('update',o)},true));
   $('#resetTransformBtn')?.addEventListener('click',e=>{const o=this.store.selected();if(!o)return;e.stopImmediatePropagation();this.store.update(o.id,{transform:{x:0,y:0,scaleX:1,scaleY:1,rotation:0,skewX:0,skewY:0,perspective:{tl:{x:0,y:0},tr:{x:0,y:0},br:{x:0,y:0},bl:{x:0,y:0}}}},'Reset object transform')},true);
 }
 bindImport(){/* engine import methods are patched; the shell file input continues to own file picking. */}
 appendObjectLayers(){
   const ul=$('#layerList');if(!ul||!this.engine.project)return;this.syncCanvas();const marker=document.createElement('li');marker.className='object-layer-divider';marker.textContent='Editable objects';ul.prepend(marker);
   [...this.store.list()].reverse().forEach(o=>{const li=document.createElement('li');li.className='layer-row object-layer'+(o.id===this.store.selectedId?' active':'');li.dataset.objectId=o.id;li.addEventListener('click',ev=>{ev.stopPropagation();this.store.select(o.id);this.openInspector(false);this.syncPanels()});const vis=document.createElement('button');vis.className='mini';vis.textContent=o.visible?'◉':'○';vis.addEventListener('click',ev=>{ev.stopPropagation();o.visible=!o.visible;this.store.changed('update',o)});const name=document.createElement('span');name.className='layer-name';name.textContent=(o.locked?'🔒 ':'')+o.name;const acts=document.createElement('span');acts.className='layer-actions';for(const [label,delta] of [['↑',1],['↓',-1]]){const b=document.createElement('button');b.className='mini';b.textContent=label;b.addEventListener('click',ev=>{ev.stopPropagation();this.store.select(o.id);this.store.reorder(o.id,delta)});acts.append(b)}li.append(vis,name,acts);ul.prepend(li)});
 }
 syncPanels(){
  const o=this.store.selected();if(!o)return;const set=(id,v)=>{const el=$('#'+id);if(el!=null)el.value=v};
  set('layerOpacity',Math.round((o.style.opacity??1)*100));set('blendMode',o.style.blendMode||'source-over');set('layerScaleX',(o.transform.scaleX??1)*100);set('layerScaleY',(o.transform.scaleY??1)*100);set('layerRotation',o.transform.rotation||0);set('layerX',o.transform.x||0);set('layerY',o.transform.y||0);
  this.syncInspector(o);this.appendObjectLayers();
 }
 openInspector(show=true){const p=$('#objectInspector');if(!p)return;if(show)p.classList.add('open');this.syncInspector(this.store.selected())}
 bindObjectInspector(){
   const panel=$('#objectInspector');if(!panel)return;
   panel.querySelectorAll('[data-object-field]').forEach(el=>{const ev=el.type==='range'||el.type==='color'?'input':'change';el.addEventListener(ev,()=>this.applyInspectorField(el))});
   $('#objectDuplicate')?.addEventListener('click',()=>this.store.duplicate());$('#objectDelete')?.addEventListener('click',()=>this.store.remove());$('#objectFront')?.addEventListener('click',()=>this.store.bringFront());$('#objectBack')?.addEventListener('click',()=>this.store.sendBack());
   $('#objectLock')?.addEventListener('click',()=>{const o=this.store.selected();if(o){o.locked=!o.locked;this.store.changed('update',o)}});$('#objectTextureBtn')?.addEventListener('click',()=>$('#textTextureInput')?.click());$('#objectClearTexture')?.addEventListener('click',()=>{const o=this.store.selected();if(o)this.store.update(o.id,{style:{texture:null}},'Clear texture')});$('#objectFontBtn')?.addEventListener('click',()=>$('#fontInput')?.click());
   $('#cropShape')?.addEventListener('change',e=>{const o=this.store.selected();if(o)this.store.update(o.id,{crop:{shape:e.target.value}},'Crop shape')});
   $('#brushNibShape')?.addEventListener('change',e=>{const o=this.store.selected();if(o)this.store.update(o.id,{style:{nibShape:e.target.value}},'Brush shape')});
   $('#objectCaptureShape')?.addEventListener('click',()=>{const o=this.store.selected();if(!o||o.type!=='shape')return this.studio.toast?.('Select a shape object first.');if(o.geometry?.shape==='line')return this.studio.toast?.('A line cannot form a closed crop or brush nib.');this.savedShapePreset={shape:o.geometry?.shape||'rectangle',customPath:o.geometry?.customPath?JSON.parse(JSON.stringify(o.geometry.customPath)):null};this.studio.toast?.('Shape captured as a reusable crop / brush preset.');});
   $('#objectApplyShapeCrop')?.addEventListener('click',()=>{const o=this.store.selected();if(!o||!this.savedShapePreset)return this.studio.toast?.('Capture a shape first, then select the object to crop.');const p=this.savedShapePreset;this.store.update(o.id,{crop:{shape:p.customPath?'custom':p.shape,customPath:p.customPath?JSON.parse(JSON.stringify(p.customPath)):null}},'Apply shape crop');});
   $('#objectApplyShapeNib')?.addEventListener('click',()=>{const o=this.store.selected();if(!o||!this.savedShapePreset)return this.studio.toast?.('Capture a shape first, then select a brush stroke.');const p=this.savedShapePreset;this.store.update(o.id,{style:{nibShape:p.customPath?'custom':p.shape,nibCustomPath:p.customPath?JSON.parse(JSON.stringify(p.customPath)):null}},'Apply shape brush nib');});
 }
 applyInspectorField(el){
   const o=this.store.selected();if(!o||o.locked)return;const path=el.dataset.objectField,value=el.type==='checkbox'?el.checked:(el.dataset.valueType==='number'?+el.value:el.value);this.store.snapshot(`Change ${path}`);let cur=o;const parts=path.split('.');for(let i=0;i<parts.length-1;i++)cur=cur[parts[i]]||(cur[parts[i]]={});cur[parts.at(-1)]=value;o.updatedAt=Date.now();this.store.changed('update',o);
 }
 syncInspector(o){
   if(!o)return;$$('[data-object-field]').forEach(el=>{let v=o;for(const p of el.dataset.objectField.split('.'))v=v?.[p];if(v==null)return;if(el.type==='checkbox')el.checked=!!v;else el.value=v});
   if($('#objectType'))$('#objectType').textContent=`${o.type} · ${o.name}`;if($('#cropShape'))$('#cropShape').value=o.crop?.shape||'free';if($('#brushNibShape'))$('#brushNibShape').value=o.style?.nibShape||'circle';
 }
}
function boot(){if(!global.LFStudio?.engine)return setTimeout(boot,20);if(global.LFAdvancedController)return;new AdvancedController(global.LFStudio)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));else setTimeout(boot,0);
A.AdvancedController=AdvancedController;
})(window);
