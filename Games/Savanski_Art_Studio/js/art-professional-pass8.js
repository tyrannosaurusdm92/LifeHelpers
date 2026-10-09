
(function(){
'use strict';
const Studio=()=>window.LFStudio, Engine=()=>Studio()?.engine, Adv=()=>window.LFAdvancedController;
const root=()=>document.querySelector('#savanski-art-toolbar');
const panel=n=>root()?.querySelector(`[data-panel="${n}"]`);
const section=(host,title,html)=>{const body=host?.querySelector('.sav-panel-body');if(!body)return null;const s=document.createElement('section');s.className='sav-section sav-professional-section sav-pass8-section';s.innerHTML=`<h3>${title}</h3>${html}`;body.appendChild(s);return s};
const ctrl=(host,name)=>host?.querySelector(`[data-art8-control="${name}"]`);
const val=(host,name,def=0)=>{const e=ctrl(host,name);if(!e)return def;if(e.type==='checkbox')return !!e.checked;if(e.type==='number'||e.type==='range')return Number(e.value);return e.value};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const toast=(m,t='success')=>Studio()?.toast?.(m,t);
const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
const K=()=>window.SavanskiPass8Wasm?.kernel||{};
const state={mode:null,currentId:null,dragNode:-1,patchedRenderer:false};

function vectorObject(){
 const a=Adv();const o=a?.store?.selected?.();return o?.type==='vector-path'?o:null;
}
function vectorNodes(o){return Array.isArray(o?.meta?.vectorNodes)?o.meta.vectorNodes:[]}
function recomputeBounds(o){
 const pts=vectorNodes(o);if(!pts.length)return;
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(const p of pts){minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y)}
 const sw=Math.max(2,Number(o.style?.strokeWidth)||2),pad=sw*2+4;
 o.geometry={...(o.geometry||{}),x:minX-pad,y:minY-pad,width:Math.max(1,maxX-minX+pad*2),height:Math.max(1,maxY-minY+pad*2)};
 o.updatedAt=Date.now();
}
function drawVectorPath(ctx,o,offsetX=0,offsetY=0){
 const pts=vectorNodes(o);if(!pts.length)return false;
 const g=o.geometry||{},smooth=clamp(o.meta?.vectorSmoothness??.65,0,1),closed=!!o.meta?.vectorClosed;
 const X=p=>p.x-(g.x||0)+offsetX,Y=p=>p.y-(g.y||0)+offsetY;
 ctx.beginPath();ctx.moveTo(X(pts[0]),Y(pts[0]));
 if(pts.length===1){ctx.arc(X(pts[0]),Y(pts[0]),1.5,0,Math.PI*2)}
 else{
  const count=closed?pts.length:pts.length-1;
  for(let i=0;i<count;i++){
   const p0=pts[(i-1+pts.length)%pts.length],p1=pts[i],p2=pts[(i+1)%pts.length],p3=pts[(i+2)%pts.length];
   if(!closed){
    const q0=i===0?p1:p0,q3=i===pts.length-2?p2:p3;
    if(smooth<=.001){ctx.lineTo(X(p2),Y(p2));continue}
    const c1={x:p1.x+(p2.x-q0.x)*smooth/6,y:p1.y+(p2.y-q0.y)*smooth/6};
    const c2={x:p2.x-(q3.x-p1.x)*smooth/6,y:p2.y-(q3.y-p1.y)*smooth/6};
    ctx.bezierCurveTo(X(c1),Y(c1),X(c2),Y(c2),X(p2),Y(p2));
   }else{
    if(smooth<=.001){ctx.lineTo(X(p2),Y(p2));continue}
    const c1={x:p1.x+(p2.x-p0.x)*smooth/6,y:p1.y+(p2.y-p0.y)*smooth/6};
    const c2={x:p2.x-(p3.x-p1.x)*smooth/6,y:p2.y-(p3.y-p1.y)*smooth/6};
    ctx.bezierCurveTo(X(c1),Y(c1),X(c2),Y(c2),X(p2),Y(p2));
   }
  }
  if(closed)ctx.closePath();
 }
 return true;
}
function patchVectorRenderer(){
 const C=window.LFAdvanced?.SceneRenderer;if(!C||C.prototype.__savanskiPass8Vector)return;
 const old=C.prototype.renderLocal;
 C.prototype.renderLocal=function(o,b,w,h,pad){
  if(o?.type!=='vector-path')return old.call(this,o,b,w,h,pad);
  const c=makeCanvas(w+pad*2,h+pad*2),ctx=c.getContext('2d',{willReadFrequently:true}),s=o.style||{};
  ctx.save();ctx.translate(pad,pad);ctx.globalAlpha=clamp(s.opacity??1,0,1);
  if(drawVectorPath(ctx,o,0,0)){
   if(o.meta?.vectorClosed&&s.fill&&s.fill!=='transparent'){ctx.fillStyle=s.fill;ctx.fill(o.meta?.fillRule==='evenodd'?'evenodd':'nonzero')}
   if((Number(s.strokeWidth)||0)>0){ctx.strokeStyle=s.stroke||s.color||'#000000';ctx.lineWidth=Math.max(.5,Number(s.strokeWidth)||1);ctx.lineCap=s.lineCap||'round';ctx.lineJoin=s.lineJoin||'round';ctx.stroke()}
  }
  ctx.restore();return c;
 };
 C.prototype.__savanskiPass8Vector=true;
 state.patchedRenderer=true;
}
function applyTransformPoint(p,o){
 const g=o.geometry||{},tr=o.transform||{},cx=(g.x||0)+(g.width||1)/2,cy=(g.y||0)+(g.height||1)/2;
 let x=(p.x-cx)*(tr.scaleX??1),y=(p.y-cy)*(tr.scaleY??1);
 const a=(Number(tr.rotation)||0)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),rx=x*ca-y*sa,ry=x*sa+y*ca;
 return{x:cx+(tr.x||0)+rx,y:cy+(tr.y||0)+ry};
}
function inverseTransformPoint(p,o){
 const g=o.geometry||{},tr=o.transform||{},cx=(g.x||0)+(g.width||1)/2,cy=(g.y||0)+(g.height||1)/2;
 let x=p.x-cx-(tr.x||0),y=p.y-cy-(tr.y||0);
 const a=-(Number(tr.rotation)||0)*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),rx=x*ca-y*sa,ry=x*sa+y*ca;
 return{x:cx+rx/((tr.scaleX??1)||.00001),y:cy+ry/((tr.scaleY??1)||.00001)};
}
function renderVectorNodes(){
 const e=Engine(),o=vectorObject();if(!e||!o||state.mode!=='edit')return;
 const ctx=e.octx,pts=vectorNodes(o),r=Math.max(4,e.width/350);
 ctx.save();ctx.lineWidth=Math.max(1,e.width/1800);ctx.strokeStyle='#071013';ctx.fillStyle='#00FFFF';
 for(let i=0;i<pts.length;i++){const p=applyTransformPoint(pts[i],o);ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();ctx.stroke()}
 ctx.restore();
}
function patchOverlay(){
 const e=Engine();if(!e||e.__savanskiPass8VectorOverlay)return;
 const old=e.renderOverlay.bind(e);e.renderOverlay=function(){old();renderVectorNodes()};e.__savanskiPass8VectorOverlay=true;
}
function updateVectorStyle(host){
 const a=Adv(),o=vectorObject();if(!a||!o)return;
 o.style={...(o.style||{}),stroke:val(host,'vector-stroke','#000000'),fill:val(host,'vector-fill','#FFFFFF'),strokeWidth:Math.max(0,val(host,'vector-width',4)),opacity:1};
 o.meta.vectorSmoothness=clamp(val(host,'vector-smooth',.65),0,1);o.meta.fillRule=val(host,'vector-rule','nonzero');
 recomputeBounds(o);a.store.changed?.('update',o);a.render?.();Engine()?.renderOverlay?.();
}
function beginVector(host){
 const a=Adv();if(!a)return toast('Advanced object engine is not ready.','error');
 state.mode='create';state.currentId=null;state.dragNode=-1;
 toast('Vector Pen active: click the canvas to place nodes. Use Finish Open or Close Path when done.');
 Engine()?.renderOverlay?.();
}
function finishVector(closed,host){
 const a=Adv();let o=state.currentId?a?.store?.list?.().find(x=>x.id===state.currentId):vectorObject();
 if(!o||o.type!=='vector-path'||vectorNodes(o).length<2)return toast('Place at least two path nodes first.','error');
 o.meta.vectorClosed=!!closed;updateVectorStyle(host);state.mode=null;state.currentId=null;Engine()?.renderOverlay?.();
 toast(closed?'Vector path closed.':'Open vector path finished.');
}
function deleteLast(){
 const a=Adv();const o=state.currentId?a?.store?.list?.().find(x=>x.id===state.currentId):vectorObject();if(!o)return;
 const pts=vectorNodes(o);if(!pts.length)return;pts.pop();if(!pts.length){a.store.remove(o.id);state.currentId=null}else{recomputeBounds(o);a.store.changed?.('update',o)}a.render?.();Engine()?.renderOverlay?.();
}
function deleteVector(){const a=Adv(),o=vectorObject();if(!a||!o)return toast('Select a vector path first.','error');a.store.remove(o.id);state.mode=null;state.currentId=null;Engine()?.renderOverlay?.()}
function renderVectorToCanvas(o){
 const e=Engine(),a=Adv();if(!e||!a||!o)return null;const c=makeCanvas(e.width,e.height),x=c.getContext('2d',{willReadFrequently:true});a.renderer.render(x,{clear:true,objects:[o]});return c;
}
function vectorToSelection(){
 const e=Engine(),o=vectorObject();if(!e||!o)return toast('Select a vector path first.','error');const c=renderVectorToCanvas(o),src=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height),m=makeCanvas(c.width,c.height),mx=m.getContext('2d'),im=mx.createImageData(c.width,c.height);
 let minX=c.width,minY=c.height,maxX=-1,maxY=-1,count=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4,a=src.data[i+3];if(a){im.data[i]=im.data[i+1]=im.data[i+2]=255;im.data[i+3]=a;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);count++}}
 if(!count)return toast('The vector path rendered no selectable pixels.','error');mx.putImageData(im,0,0);e.precisionSelectionMask=m;e.selection={x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,precision:true};e.renderOverlay();toast('Vector path converted to a precision selection.');
}
function vectorToMask(){
 const e=Engine(),o=vectorObject(),l=e?.activeLayer?.();if(!e||!o||!l)return toast('Select a vector path and an Art layer first.','error');const c=renderVectorToCanvas(o),src=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,c.width,c.height),m=makeCanvas(c.width,c.height),mx=m.getContext('2d'),im=mx.createImageData(c.width,c.height);
 for(let i=0;i<src.data.length;i+=4){im.data[i]=im.data[i+1]=im.data[i+2]=255;im.data[i+3]=src.data[i+3]}mx.putImageData(im,0,0);
 const snap=e.history.capture('Vector mask');l.mask=m;e.history.push(snap);e.render();e.emit('layers');toast('Vector path applied as an editable layer mask.');
}
function rasterizeVector(){
 const e=Engine(),o=vectorObject();if(!e||!o)return toast('Select a vector path first.','error');const c=renderVectorToCanvas(o),snap=e.history.capture('Rasterize vector copy'),l=e.createLayer(`${o.name||'Vector Path'} raster`,'raster');l.canvas.getContext('2d').drawImage(c,0,0);e.canvas().layers.push(l);e.activeLayerId=l.id;e.history.push(snap);e.render();e.emit('layers');Studio()?.renderLayers?.();toast('Rasterized copy created; the vector path remains editable.');
}
function pointerCoords(ev){const e=Engine(),r=e.overlay.getBoundingClientRect();return{x:clamp((ev.clientX-r.left)*e.width/r.width,0,e.width),y:clamp((ev.clientY-r.top)*e.height/r.height,0,e.height)}}
function bindVectorPointer(){
 const e=Engine();if(!e||e.overlay.__savanskiPass8VectorPointer)return;
 const ov=e.overlay;
 ov.addEventListener('pointerdown',ev=>{
  if(state.mode!=='create'&&state.mode!=='edit')return;
  const a=Adv();if(!a)return;const p=pointerCoords(ev);
  ev.preventDefault();ev.stopImmediatePropagation();
  if(state.mode==='create'){
   let o=state.currentId?a.store.list().find(x=>x.id===state.currentId):null;
   if(!o){const host=panel('shapes');o=a.store.add('vector-path',{name:'Editable Vector Path',geometry:{x:p.x,y:p.y,width:1,height:1},meta:{vectorNodes:[p],vectorClosed:false,vectorSmoothness:clamp(val(host,'vector-smooth',.65),0,1),fillRule:val(host,'vector-rule','nonzero')},style:{stroke:val(host,'vector-stroke',e.primary||'#000000'),fill:val(host,'vector-fill',e.secondary||'#ffffff'),strokeWidth:Math.max(0,val(host,'vector-width',4)),opacity:1}});state.currentId=o.id}
   else{o.meta.vectorNodes.push(p);recomputeBounds(o);a.store.changed?.('update',o)}
   a.store.select(o.id);a.render?.();e.renderOverlay();return;
  }
  const o=vectorObject();if(!o)return;
  const pts=vectorNodes(o);let best=-1,bd=Infinity;for(let i=0;i<pts.length;i++){const q=applyTransformPoint(pts[i],o),d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd){bd=d;best=i}}
  const threshold=Math.max(10,e.width/120);if(best>=0&&bd<=threshold){a.store.snapshot?.('Move vector node');state.dragNode=best;ov.setPointerCapture?.(ev.pointerId)}
 },true);
 ov.addEventListener('pointermove',ev=>{
  if(state.mode!=='edit'||state.dragNode<0)return;const a=Adv(),o=vectorObject();if(!a||!o)return;ev.preventDefault();ev.stopImmediatePropagation();const p=inverseTransformPoint(pointerCoords(ev),o);o.meta.vectorNodes[state.dragNode]=p;recomputeBounds(o);a.store.changed?.('update',o);a.render?.();e.renderOverlay()
 },true);
 const up=ev=>{if(state.dragNode>=0){ev.preventDefault();ev.stopImmediatePropagation();state.dragNode=-1;Adv()?.markDirty?.();Engine()?.renderOverlay?.()}};
 ov.addEventListener('pointerup',up,true);ov.addEventListener('pointercancel',up,true);
 ov.__savanskiPass8VectorPointer=true;
}
function setEditMode(on){state.mode=on?'edit':null;state.currentId=null;Engine()?.renderOverlay?.();toast(on?'Vector node editing enabled. Drag cyan nodes on the canvas.':'Vector node editing disabled.')}
function syncVectorControls(host){
 const o=vectorObject();if(!o)return;const q=(n,v)=>{const e=ctrl(host,n);if(e)e.value=v};
 q('vector-stroke',o.style?.stroke||'#000000');q('vector-fill',o.style?.fill||'#ffffff');q('vector-width',o.style?.strokeWidth??4);q('vector-smooth',o.meta?.vectorSmoothness??.65);q('vector-rule',o.meta?.fillRule||'nonzero');
}

/* Content-aware active-layer scale: local seam carving, preserving the overall document size. */
function imageBounds(canvas){
 const w=canvas.width,h=canvas.height,d=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;let minX=w,minY=h,maxX=-1,maxY=-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>2){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
 return maxX>=minX?{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1}:null;
}
function lumaAt(d,i){const k=K();return k.luma?k.luma(d[i]/255,d[i+1]/255,d[i+2]/255):(.2126*d[i]+.7152*d[i+1]+.0722*d[i+2])/255}
function findVerticalSeam(im,protect){
 const w=im.width,h=im.height,d=im.data,k=K(),cost=new Float32Array(w*h),parent=new Int8Array(w*h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,li=(y*w+Math.max(0,x-1))*4,ri=(y*w+Math.min(w-1,x+1))*4,ui=(Math.max(0,y-1)*w+x)*4,di=(Math.min(h-1,y+1)*w+x)*4,L=lumaAt(d,li),R=lumaAt(d,ri),U=lumaAt(d,ui),D=lumaAt(d,di),alpha=d[i+3]/255;let e=k.edge_energy?k.edge_energy(L,R,U,D,alpha):Math.abs(R-L)+Math.abs(D-U)+(1-alpha)*.35;if(protect)e+=protect[y*w+x]*1000;
   if(y===0){cost[x]=e;continue}let bx=x,bv=cost[(y-1)*w+x];if(x&&cost[(y-1)*w+x-1]<bv){bv=cost[(y-1)*w+x-1];bx=x-1}if(x<w-1&&cost[(y-1)*w+x+1]<bv){bv=cost[(y-1)*w+x+1];bx=x+1}cost[y*w+x]=e+bv;parent[y*w+x]=bx-x}
 let x=0,bv=cost[(h-1)*w];for(let q=1;q<w;q++)if(cost[(h-1)*w+q]<bv){bv=cost[(h-1)*w+q];x=q}const seam=new Int32Array(h);for(let y=h-1;y>=0;y--){seam[y]=x;if(y)x+=parent[y*w+x]}return seam;
}
function removeVertical(im,protect,seam){
 const w=im.width,h=im.height,out=new ImageData(w-1,h),pout=protect?new Float32Array((w-1)*h):null;
 for(let y=0;y<h;y++){const cut=seam[y];let nx=0;for(let x=0;x<w;x++){if(x===cut)continue;const si=(y*w+x)*4,di=(y*(w-1)+nx)*4;out.data[di]=im.data[si];out.data[di+1]=im.data[si+1];out.data[di+2]=im.data[si+2];out.data[di+3]=im.data[si+3];if(pout)pout[y*(w-1)+nx]=protect[y*w+x];nx++}}return{im:out,protect:pout};
}
function insertVertical(im,protect,seam){
 const w=im.width,h=im.height,out=new ImageData(w+1,h),pout=protect?new Float32Array((w+1)*h):null;
 for(let y=0;y<h;y++){const cut=seam[y];let nx=0;for(let x=0;x<w;x++){const si=(y*w+x)*4,di=(y*(w+1)+nx)*4;for(let c=0;c<4;c++)out.data[di+c]=im.data[si+c];if(pout)pout[y*(w+1)+nx]=protect[y*w+x];nx++;if(x===cut){const x2=Math.min(w-1,x+1),sj=(y*w+x2)*4,dj=(y*(w+1)+nx)*4;for(let c=0;c<4;c++)out.data[dj+c]=Math.round((im.data[si+c]+im.data[sj+c])/2);if(pout)pout[y*(w+1)+nx]=(protect[y*w+x]+protect[y*w+x2])/2;nx++}}}return{im:out,protect:pout};
}
function transposeImage(im,protect){
 const w=im.width,h=im.height,out=new ImageData(h,w),pout=protect?new Float32Array(w*h):null;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const si=(y*w+x)*4,di=(x*h+y)*4;for(let c=0;c<4;c++)out.data[di+c]=im.data[si+c];if(pout)pout[x*h+y]=protect[y*w+x]}return{im:out,protect:pout};
}
function carveAxis(im,protect,target,vertical=true){
 let x={im,protect};if(!vertical)x=transposeImage(x.im,x.protect);let cur=x.im.width,steps=Math.abs(target-cur);if(steps>240)throw new Error('Content-aware resize is limited to 240 seams per action. Use multiple passes.');
 while(x.im.width!==target){const seam=findVerticalSeam(x.im,x.protect);x=x.im.width>target?removeVertical(x.im,x.protect,seam):insertVertical(x.im,x.protect,seam)}
 if(!vertical)x=transposeImage(x.im,x.protect);return x;
}
function contentAwareScale(host){
 const e=Engine(),l=e?.activeLayer?.();if(!e||!l||l.type!=='raster'||l.locked)return toast('Select an unlocked raster layer first.','error');const b=imageBounds(l.canvas);if(!b)return toast('Active layer is empty.','error');
 const wp=clamp(val(host,'ca-width',100),55,145),hp=clamp(val(host,'ca-height',100),55,145),tw=Math.max(2,Math.round(b.w*wp/100)),th=Math.max(2,Math.round(b.h*hp/100));
 if(b.w*b.h>2500000)return toast('Content-aware layer scale is limited to 2.5 million source pixels per pass. Crop or reduce the layer first.','error');
 if(Math.abs(tw-b.w)+Math.abs(th-b.h)>240)return toast('Requested change exceeds 240 seams. Use several smaller content-aware passes.','error');
 const ctx=l.canvas.getContext('2d',{willReadFrequently:true}),src=ctx.getImageData(b.x,b.y,b.w,b.h);let protect=null;
 if(e.precisionSelectionMask){const md=e.precisionSelectionMask.getContext('2d',{willReadFrequently:true}).getImageData(b.x,b.y,b.w,b.h).data;protect=new Float32Array(b.w*b.h);for(let i=0;i<protect.length;i++)protect[i]=md[i*4+3]/255}
 const snap=e.history.capture('Content-aware layer scale');try{
   let r=carveAxis(src,protect,tw,true);r=carveAxis(r.im,r.protect,th,false);
   const tmp=makeCanvas(r.im.width,r.im.height);tmp.getContext('2d').putImageData(r.im,0,0);ctx.clearRect(0,0,e.width,e.height);
   const cx=b.x+b.w/2,cy=b.y+b.h/2;ctx.drawImage(tmp,Math.round(cx-r.im.width/2),Math.round(cy-r.im.height/2));
   e.history.push(snap);e.render();e.emit('layers');toast(`Content-aware layer scaled to ${r.im.width} × ${r.im.height}px inside the existing canvas.`);
 }catch(err){toast(err.message||String(err),'error')}
}

function installUI(){
 patchVectorRenderer();patchOverlay();bindVectorPointer();
 const shapes=panel('shapes'),transform=panel('transform');
 if(shapes&&!shapes.querySelector('[data-savanski-pass8-vector]')){
  const s=section(shapes,'Vector Pen / Bézier Paths',`
   <div data-savanski-pass8-vector>
    <div class="launcher-choice-row"><button data-art8="vector-start">Start Vector Path</button><button data-art8="vector-open">Finish Open</button><button data-art8="vector-close">Close Path</button></div>
    <div class="launcher-choice-row"><button data-art8="vector-edit">Edit Nodes</button><button data-art8="vector-stop-edit">Stop Node Edit</button><button data-art8="vector-undo-node">Undo Node</button><button data-art8="vector-delete">Delete Path</button></div>
    <div class="compact-grid">
     <label>Stroke <input data-art8-control="vector-stroke" type="color" value="#000000"></label>
     <label>Fill <input data-art8-control="vector-fill" type="color" value="#FFFFFF"></label>
     <label>Stroke px <input data-art8-control="vector-width" type="number" min="0" max="200" step=".5" value="4"></label>
     <label>Smoothness <input data-art8-control="vector-smooth" type="range" min="0" max="1" step=".01" value=".65"></label>
     <label>Fill rule <select data-art8-control="vector-rule"><option value="nonzero">Non-zero</option><option value="evenodd">Even-odd</option></select></label>
    </div>
    <div class="launcher-choice-row"><button data-art8="vector-selection">Path → Selection</button><button data-art8="vector-mask">Path → Layer Mask</button><button data-art8="vector-raster">Rasterize Copy</button></div>
    <p class="sav-help">Vector paths remain editable in project data. Start a path, click canvas nodes, then finish open or close it. Edit Nodes lets you drag the cyan anchors.</p>
   </div>`); 
  s.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',()=>updateVectorStyle(shapes)));
 }
 if(transform&&!transform.querySelector('[data-savanski-pass8-content-aware]')){
  section(transform,'Content-Aware Layer Scale',`
   <div data-savanski-pass8-content-aware>
    <div class="compact-grid">
     <label>Width % <input data-art8-control="ca-width" type="number" min="55" max="145" step="1" value="100"></label>
     <label>Height % <input data-art8-control="ca-height" type="number" min="55" max="145" step="1" value="100"></label>
    </div>
    <button data-art8="content-aware-scale">Scale Active Raster Intelligently</button>
    <p class="sav-help">Seam-carves the active raster content while keeping the document canvas unchanged. The current precision selection is treated as protected content. Large changes should be made in several passes.</p>
   </div>`);
 }
 root()?.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-art8]');if(!b)return;const action=b.dataset.art8;
  if(action==='vector-start')beginVector(shapes);
  else if(action==='vector-open')finishVector(false,shapes);
  else if(action==='vector-close')finishVector(true,shapes);
  else if(action==='vector-edit')setEditMode(true);
  else if(action==='vector-stop-edit')setEditMode(false);
  else if(action==='vector-undo-node')deleteLast();
  else if(action==='vector-delete')deleteVector();
  else if(action==='vector-selection')vectorToSelection();
  else if(action==='vector-mask')vectorToMask();
  else if(action==='vector-raster')rasterizeVector();
  else if(action==='content-aware-scale')contentAwareScale(transform);
 });
 Adv()?.store?.onChange?.((kind,o)=>{if(o?.type==='vector-path'||vectorObject())setTimeout(()=>{syncVectorControls(shapes);Engine()?.renderOverlay?.()},0)});
}
function boot(){if(!Engine()||!Adv()||!window.LFAdvanced?.SceneRenderer)return setTimeout(boot,50);installUI()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));else setTimeout(boot,0);
})();
