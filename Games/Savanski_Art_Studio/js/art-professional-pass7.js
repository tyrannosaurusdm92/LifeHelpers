(function(){
'use strict';
const Studio=()=>window.LFStudio, Engine=()=>Studio()?.engine;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const panel=n=>document.querySelector(`#savanski-art-toolbar [data-panel="${n}"]`);
const section=(host,title,html)=>{const body=host?.querySelector('.sav-panel-body');if(!body)return null;const s=document.createElement('section');s.className='sav-section sav-professional-section sav-pass7-section';s.innerHTML=`<h3>${title}</h3>${html}`;body.appendChild(s);return s};
const ctrl=(host,name)=>host?.querySelector(`[data-art7-control="${name}"]`);
const val=(host,name,def=0)=>{const e=ctrl(host,name);if(!e)return def;if(e.type==='checkbox')return !!e.checked;if(e.type==='number'||e.type==='range')return Number(e.value);return e.value};
const toast=(m,t='success')=>Studio()?.toast?.(m,t);
const K=()=>window.SavanskiPass7Wasm?.kernel||{};
const state={pick:null,refImage:null,refUrl:null};

function rawCoords(e,ev){const r=e.overlay.getBoundingClientRect();return{x:clamp((ev.clientX-r.left)*e.width/r.width,0,e.width),y:clamp((ev.clientY-r.top)*e.height/r.height,0,e.height)}}
function projectState(e){
 if(!e?.project)return null;
 return e.project.savanskiAssistantState||(e.project.savanskiAssistantState={
  enabled:true,snap:false,type:'two-point',vp1:{x:e.width*.25,y:e.height*.34},vp2:{x:e.width*.75,y:e.height*.34},
  angle:0,opacity:.55,spacing:120,
  reference:null
 });
}
function dist2(a,b){const dx=a.x-b.x,dy=a.y-b.y;return dx*dx+dy*dy}
function projectPointToLine(p,a,b){
 const vx=b.x-a.x,vy=b.y-a.y,den=vx*vx+vy*vy;if(den<1e-9)return{x:a.x,y:a.y};
 const t=((p.x-a.x)*vx+(p.y-a.y)*vy)/den;return{x:a.x+t*vx,y:a.y+t*vy};
}
function snapPoint(e,p){
 const st=projectState(e),d=e.drag;if(!st?.enabled||!st.snap||!d||!['paint','shape'].includes(d.kind))return p;
 const start=d.start||d.last||p,mode=st.type;
 if(mode==='ruler'){
  const a=(Number(st.angle)||0)*Math.PI/180,dir={x:Math.cos(a),y:Math.sin(a)};
  return projectPointToLine(p,start,{x:start.x+dir.x*1000,y:start.y+dir.y*1000});
 }
 const cand=[];
 if(st.vp1)cand.push(projectPointToLine(p,start,st.vp1));
 if(mode==='two-point'&&st.vp2)cand.push(projectPointToLine(p,start,st.vp2));
 if(!cand.length)return p;
 cand.sort((x,y)=>dist2(x,p)-dist2(y,p));return cand[0];
}
function installCoordSnap(){
 const e=Engine();if(!e||e.__savanskiPass7Coords)return;
 const old=e.coords.bind(e);e.__savanskiPass7RawCoords=old;
 e.coords=function(ev){const p=old(ev);return snapPoint(this,p)};
 e.__savanskiPass7Coords=true;
}
function loadReferenceImage(st){
 const ref=st?.reference;if(!ref?.dataUrl){state.refImage=null;state.refUrl=null;return null}
 if(state.refUrl===ref.dataUrl&&state.refImage)return state.refImage;
 const im=new Image();im.onload=()=>Engine()?.renderOverlay?.();im.src=ref.dataUrl;state.refImage=im;state.refUrl=ref.dataUrl;return im;
}
function drawAssistants(e){
 const st=projectState(e);if(!st)return;const x=e.octx;
 if(st.reference?.dataUrl){
  const im=loadReferenceImage(st);
  if(im?.complete&&im.naturalWidth){
   const r=st.reference,scale=Math.max(.02,Number(r.scale)||1),w=(r.w||im.naturalWidth)*scale,h=(r.h||im.naturalHeight)*scale;
   x.save();x.globalAlpha=clamp(r.opacity??.55,.05,1);x.drawImage(im,Number(r.x)||0,Number(r.y)||0,w,h);x.restore();
  }
 }
 if(!st.enabled)return;
 x.save();x.globalAlpha=clamp(st.opacity,.08,1);x.lineWidth=Math.max(1,e.width/1900);x.strokeStyle='#00A7C4';x.fillStyle='#FFF600';x.setLineDash([Math.max(4,e.width/420),Math.max(3,e.width/620)]);
 if(st.type==='ruler'){
  const a=(Number(st.angle)||0)*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a),nx=-dy,ny=dx,spacing=Math.max(20,Number(st.spacing)||120),diag=Math.hypot(e.width,e.height),count=Math.ceil(diag/spacing);
  for(let i=-count;i<=count;i++){const cx=e.width/2+nx*i*spacing,cy=e.height/2+ny*i*spacing;x.beginPath();x.moveTo(cx-dx*diag,cy-dy*diag);x.lineTo(cx+dx*diag,cy+dy*diag);x.stroke()}
 }else{
  const vps=[st.vp1].concat(st.type==='two-point'?[st.vp2]:[]).filter(Boolean),step=Math.max(80,Number(st.spacing)||120);
  for(const vp of vps){
   for(let px=0;px<=e.width;px+=step){x.beginPath();x.moveTo(vp.x,vp.y);x.lineTo(px,0);x.stroke();x.beginPath();x.moveTo(vp.x,vp.y);x.lineTo(px,e.height);x.stroke()}
   for(let py=0;py<=e.height;py+=step){x.beginPath();x.moveTo(vp.x,vp.y);x.lineTo(0,py);x.stroke();x.beginPath();x.moveTo(vp.x,vp.y);x.lineTo(e.width,py);x.stroke()}
  }
  if(st.vp1&&st.vp2){x.strokeStyle='#EC5800';x.beginPath();x.moveTo(st.vp1.x,st.vp1.y);x.lineTo(st.vp2.x,st.vp2.y);x.stroke()}
  x.setLineDash([]);for(const [i,vp] of vps.entries()){x.fillStyle=i?'#EC5800':'#FFF600';x.beginPath();x.arc(vp.x,vp.y,Math.max(5,e.width/350),0,Math.PI*2);x.fill();x.strokeStyle='#001010';x.stroke()}
 }
 x.restore();
}
function patchOverlay(){
 const e=Engine();if(!e||e.__savanskiPass7Overlay)return;const old=e.renderOverlay.bind(e);
 e.renderOverlay=function(){old();drawAssistants(this)};
 e.__savanskiPass7Overlay=true;
}
function updateAssistantReadout(){
 const e=Engine(),st=projectState(e),host=panel('layout')?.querySelector('[data-art7-assistant-readout]');if(!host||!st)return;
 const f=p=>p?`${Math.round(p.x)}, ${Math.round(p.y)}`:'—';
 host.textContent=`${st.type} · VP1 ${f(st.vp1)} · VP2 ${f(st.vp2)} · snap ${st.snap?'on':'off'}`;
}
function syncAssistantControls(){
 const e=Engine(),st=projectState(e),host=panel('layout');if(!host||!st)return;
 const map={enabled:'assistant-enabled',snap:'assistant-snap',type:'assistant-type',angle:'assistant-angle',opacity:'assistant-opacity',spacing:'assistant-spacing'};
 for(const [k,n] of Object.entries(map)){const el=ctrl(host,n);if(!el)continue;if(el.type==='checkbox')el.checked=!!st[k];else el.value=st[k]}
 updateAssistantReadout();
}
function beginPick(which){const e=Engine();if(!e)return;state.pick=which;toast(`Click the canvas to place ${which==='vp1'?'vanishing point 1':'vanishing point 2'}.`)}
function installAssistantPicker(){
 const e=Engine();if(!e||e.__savanskiPass7AssistantPicker)return;
 e.overlay.addEventListener('pointerdown',ev=>{
  if(!state.pick)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  const st=projectState(e),p=rawCoords(e,ev);st[state.pick]={x:p.x,y:p.y};state.pick=null;updateAssistantReadout();e.renderOverlay();
 },true);
 e.__savanskiPass7AssistantPicker=true;
}
function assistantControlChanged(ev){
 const e=Engine(),st=projectState(e);if(!st)return;const n=ev.target?.dataset?.art7Control;if(!n||!n.startsWith('assistant-'))return;
 const key=n.replace('assistant-','').replace('enabled','enabled').replace('snap','snap').replace('type','type').replace('angle','angle').replace('opacity','opacity').replace('spacing','spacing');
 if(['enabled','snap'].includes(key))st[key]=!!ev.target.checked;else if(['angle','opacity','spacing'].includes(key))st[key]=Number(ev.target.value);else st[key]=ev.target.value;
 e.renderOverlay();updateAssistantReadout();
}
function clearAssistants(){const e=Engine(),st=projectState(e);if(!st)return;st.vp1={x:e.width*.25,y:e.height*.34};st.vp2={x:e.width*.75,y:e.height*.34};st.enabled=false;state.pick=null;syncAssistantControls();e.renderOverlay();toast('Drawing assistants hidden and reset.')}
function uploadReference(input){
 const e=Engine(),st=projectState(e),file=input?.files?.[0];if(!e||!st||!file)return;
 if(!file.type.startsWith('image/'))return toast('Choose an image file for the reference board.','error');
 const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const fit=Math.min(e.width*.38/im.naturalWidth,e.height*.38/im.naturalHeight,1);st.reference={dataUrl:String(fr.result),x:20,y:20,w:im.naturalWidth,h:im.naturalHeight,scale:fit,opacity:.55};state.refImage=im;state.refUrl=String(fr.result);syncReferenceControls();e.renderOverlay();toast('Reference image added as a non-exporting overlay.','success')};im.src=String(fr.result)};fr.readAsDataURL(file);
}
function syncReferenceControls(){
 const e=Engine(),st=projectState(e),host=panel('layout'),r=st?.reference;if(!host)return;
 for(const [n,v] of [['reference-x',r?.x??20],['reference-y',r?.y??20],['reference-scale',r?.scale??1],['reference-opacity',(r?.opacity??.55)*100]]){const el=ctrl(host,n);if(el)el.value=v}
 const out=host.querySelector('[data-art7-reference-readout]');if(out)out.textContent=r?`Reference overlay · ${r.w}×${r.h}px · not exported`:'No reference image loaded.';
}
function referenceControlChanged(ev){
 const e=Engine(),st=projectState(e),r=st?.reference,n=ev.target?.dataset?.art7Control;if(!r||!n?.startsWith('reference-'))return;
 const v=Number(ev.target.value);if(n==='reference-x')r.x=v;if(n==='reference-y')r.y=v;if(n==='reference-scale')r.scale=Math.max(.02,v);if(n==='reference-opacity')r.opacity=clamp(v/100,.05,1);e.renderOverlay();syncReferenceControls();
}
function removeReference(){const e=Engine(),st=projectState(e);if(!st)return;st.reference=null;state.refImage=null;state.refUrl=null;syncReferenceControls();e.renderOverlay();toast('Reference overlay removed.')}
function makeMask(e){
 const sel=e.selection;if(!sel)return null;
 const x0=Math.max(0,Math.floor(sel.x)),y0=Math.max(0,Math.floor(sel.y)),x1=Math.min(e.width,Math.ceil(sel.x+sel.w)),y1=Math.min(e.height,Math.ceil(sel.y+sel.h)),w=x1-x0,h=y1-y0;if(w<=0||h<=0)return null;
 const mask=new Uint8Array(w*h),pm=e.precisionSelectionMask,prec=pm?.getContext?pm.getContext('2d',{willReadFrequently:true}).getImageData(x0,y0,w,h).data:null;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;mask[i]=prec?(prec[i*4+3]>96?1:0):1}
 return{x:x0,y:y0,w,h,mask};
}
function smartInpaint(){
 const e=Engine(),l=e?.activeLayer?.();if(!e||!l||l.locked)return toast('Select an unlocked raster layer first.','error');
 const m=makeMask(e);if(!m)return toast('Create a rectangular or precision selection first.','error');
 const count=m.mask.reduce((s,v)=>s+v,0);if(count<1)return toast('The selected repair area is empty.','error');
 if(m.w*m.h>4500000)return toast('Smart Inpaint area is too large. Reduce the selection for this browser pass.','error');
 const radius=Math.max(1,Math.min(6,Math.round(val(panel('retouch'),'inpaint-radius',2)))),src=l.canvas.getContext('2d',{willReadFrequently:true}),img=src.getImageData(m.x,m.y,m.w,m.h),data=img.data,n=m.w*m.h,known=new Uint8Array(n),queued=new Uint8Array(n),q=new Int32Array(n);for(let i=0;i<n;i++)known[i]=m.mask[i]?0:1;
 let head=0,tail=0;const hasKnown=(x,y)=>{for(let yy=Math.max(0,y-1);yy<=Math.min(m.h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(m.w-1,x+1);xx++)if((xx!==x||yy!==y)&&known[yy*m.w+xx])return true;return false};
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++){const i=y*m.w+x;if(!known[i]&&hasKnown(x,y)){q[tail++]=i;queued[i]=1}}
 const gauss=K().sv7_gaussian||((d,s)=>1/(1+d*d/(Math.max(.001,s*s))));
 while(head<tail){const i=q[head++],x=i%m.w,y=(i/m.w)|0;if(known[i])continue;let sr=0,sg=0,sb=0,sa=0,sw=0;
   for(let yy=Math.max(0,y-radius);yy<=Math.min(m.h-1,y+radius);yy++)for(let xx=Math.max(0,x-radius);xx<=Math.min(m.w-1,x+radius);xx++){const j=yy*m.w+xx;if(!known[j])continue;const d=Math.hypot(xx-x,yy-y),w=gauss(d,Math.max(1,radius*.75));const k=j*4;sr+=data[k]*w;sg+=data[k+1]*w;sb+=data[k+2]*w;sa+=data[k+3]*w;sw+=w}
   if(sw<=0)continue;const k=i*4;data[k]=sr/sw;data[k+1]=sg/sw;data[k+2]=sb/sw;data[k+3]=sa/sw;known[i]=1;
   for(let yy=Math.max(0,y-1);yy<=Math.min(m.h-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(m.w-1,x+1);xx++){const j=yy*m.w+xx;if(!known[j]&&!queued[j]){q[tail++]=j;queued[j]=1}}
 }
 const snap=e.history.capture('Smart Inpaint');src.putImageData(img,m.x,m.y);e.history.push(snap);e.render();e.emit?.('layers');Studio()?.renderLayers?.();toast(`Smart Inpaint filled ${count.toLocaleString()} selected pixels.`,'success');
}
function frequencySeparation(){
 const e=Engine(),src=e?.activeLayer?.();if(!e||!src||src.locked)return toast('Select an unlocked raster layer first.','error');
 const radius=Math.max(1,Math.min(80,Number(val(panel('retouch'),'frequency-radius',8))||8)),snap=e.history.capture('Frequency Separation'),w=e.width,h=e.height;
 const low=e.createLayer(`${src.name} · Low Frequency`,'raster'),detail=e.createLayer(`${src.name} · High Frequency`,'raster'),lc=low.canvas.getContext('2d'),dc=detail.canvas.getContext('2d',{willReadFrequently:true});
 lc.save();lc.filter=`blur(${radius}px)`;lc.drawImage(src.canvas,0,0);lc.restore();
 const orig=src.canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h),lo=lc.getImageData(0,0,w,h),hi=dc.createImageData(w,h);
 for(let i=0;i<orig.data.length;i+=4){hi.data[i]=clamp(orig.data[i]-lo.data[i]+128,0,255);hi.data[i+1]=clamp(orig.data[i+1]-lo.data[i+1]+128,0,255);hi.data[i+2]=clamp(orig.data[i+2]-lo.data[i+2]+128,0,255);hi.data[i+3]=orig.data[i+3]}
 dc.putImageData(hi,0,0);detail.blendMode='overlay';detail.opacity=1;
 const layers=e.canvas().layers,idx=layers.findIndex(x=>x.id===src.id);layers.splice(idx+1,0,low,detail);src.visible=false;e.activeLayerId=detail.id;e.history.push(snap);e.render();e.emit?.('layers');Studio()?.renderLayers?.();toast(`Frequency separation created · radius ${radius}px.`,'success');
}
function inject(){
 const root=document.querySelector('#savanski-art-toolbar');if(!root||root.dataset.professionalPass7==='1')return;root.dataset.professionalPass7='1';
 section(panel('layout'),'Drawing Assistants & Reference Board',`<div class="sav-grid cols-3"><label class="sav-field"><span>Assistant</span><select data-art7-control="assistant-type"><option value="two-point">2-Point Perspective</option><option value="one-point">1-Point Perspective</option><option value="ruler">Parallel / Ruler</option></select></label><label class="sav-field"><span>Ruler Angle °</span><input data-art7-control="assistant-angle" type="number" min="-180" max="180" value="0"></label><label class="sav-field"><span>Guide Spacing px</span><input data-art7-control="assistant-spacing" type="number" min="20" max="1000" value="120"></label></div><div class="sav-grid cols-4"><label class="sav-check"><input data-art7-control="assistant-enabled" type="checkbox" checked>Show</label><label class="sav-check"><input data-art7-control="assistant-snap" type="checkbox">Snap brush/shape strokes</label><label class="sav-field"><span>Opacity</span><input data-art7-control="assistant-opacity" type="range" min="0.08" max="1" step="0.01" value="0.55"></label><button class="sav-btn" data-art7="assistant-clear">Reset / Hide</button></div><div class="sav-grid cols-3"><button class="sav-btn" data-art7="pick-vp1">Place VP1</button><button class="sav-btn" data-art7="pick-vp2">Place VP2</button><div class="sav-live-item" data-art7-assistant-readout></div></div><hr><div class="sav-grid cols-3"><label class="sav-field"><span>Reference Image</span><input data-art7-reference-file type="file" accept="image/*"></label><button class="sav-btn" data-art7="reference-remove">Remove Reference</button><div class="sav-live-item" data-art7-reference-readout>No reference image loaded.</div></div><div class="sav-grid cols-4"><label class="sav-field"><span>X</span><input data-art7-control="reference-x" type="number" value="20"></label><label class="sav-field"><span>Y</span><input data-art7-control="reference-y" type="number" value="20"></label><label class="sav-field"><span>Scale</span><input data-art7-control="reference-scale" type="number" min="0.02" max="10" step="0.01" value="1"></label><label class="sav-field"><span>Opacity %</span><input data-art7-control="reference-opacity" type="number" min="5" max="100" value="55"></label></div><p class="sav-pro-note">Assistants and reference images are editor overlays only and are not exported. Perspective snapping constrains brush and shape endpoints to the selected perspective family without creating a new drawing toolbar.</p>`);
 section(panel('retouch'),'Smart Repair & Frequency Separation',`<div class="sav-grid cols-3"><label class="sav-field"><span>Inpaint Neighborhood</span><input data-art7-control="inpaint-radius" type="number" min="1" max="6" value="2"></label><button class="sav-btn" data-art7="smart-inpaint">Smart Inpaint Selection</button><span class="sav-live-item">Uses the current rectangle/precision mask.</span></div><div class="sav-grid cols-3"><label class="sav-field"><span>Separation Radius px</span><input data-art7-control="frequency-radius" type="number" min="1" max="80" value="8"></label><button class="sav-btn" data-art7="frequency-separate">Create Low + Detail Layers</button><span class="sav-live-item">Original is preserved but hidden.</span></div><p class="sav-pro-note">Smart Inpaint is a local diffusion-style repair for removing small objects, dust, gaps, and background remnants. Frequency Separation creates editable low-frequency color/tone and high-frequency texture layers for retouching without flattening the source.</p>`);
 root.addEventListener('click',ev=>{const b=ev.target.closest('[data-art7]');if(!b)return;ev.preventDefault();ev.stopPropagation();switch(b.dataset.art7){case'pick-vp1':return beginPick('vp1');case'pick-vp2':return beginPick('vp2');case'assistant-clear':return clearAssistants();case'reference-remove':return removeReference();case'smart-inpaint':return smartInpaint();case'frequency-separate':return frequencySeparation();}});
 root.addEventListener('input',ev=>{assistantControlChanged(ev);referenceControlChanged(ev)});
 root.querySelector('[data-art7-reference-file]')?.addEventListener('change',ev=>uploadReference(ev.target));
 installCoordSnap();installAssistantPicker();patchOverlay();syncAssistantControls();syncReferenceControls();Engine()?.on?.('project',()=>setTimeout(()=>{syncAssistantControls();syncReferenceControls();Engine()?.renderOverlay?.()},0));
}
function boot(){if(!window.LFStudio?.engine)return setTimeout(boot,80);window.SavanskiPass7Wasm?.init?.();inject()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));else setTimeout(boot,0);
window.SavanskiArtProfessionalPass7={smartInpaint,frequencySeparation,beginPick};
})();