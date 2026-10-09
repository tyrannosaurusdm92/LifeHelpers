(function(){
'use strict';
const A=window.Savanski3D;if(!A)return;const S=A.state;
const root=()=>document.querySelector('#savanski-3d-toolbar');
const panel=n=>root()?.querySelector(`[data-panel="${n}"]`);
const section=(host,title,html)=>{const body=host?.querySelector('.sav-panel-body');if(!body)return null;const s=document.createElement('section');s.className='sav-section sav-professional-section sav-pass7-section';s.innerHTML=`<h3>${title}</h3>${html}`;body.appendChild(s);return s};
const ctrl=(host,name)=>host?.querySelector(`[data-pro3d7-control="${name}"]`);
const val=(host,name,def=0)=>{const e=ctrl(host,name);if(!e)return def;if(e.type==='checkbox')return !!e.checked;if(e.type==='number'||e.type==='range')return Number(e.value);return e.value};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const K=()=>window.SavanskiPass7Wasm?.kernel||{};
const state={pickFaceSet:false,lastStencil:null};

function mesh(){return S.selected?.isMesh&&!S.selected.userData?.savanskiUiHelper?S.selected:null}
function geomInfo(m=mesh()){
 if(!m?.geometry)return null;const g=m.geometry,p=g.getAttribute('position');if(!p)return null;
 const idx=g.index?.array,triCount=idx?Math.floor(idx.length/3):Math.floor(p.count/3);
 return{g,p,idx,triCount};
}
function vertexKey(p,i){return `${Math.round(p.getX(i)*1e5)},${Math.round(p.getY(i)*1e5)},${Math.round(p.getZ(i)*1e5)}`}
function triangleTopology(m=mesh()){
 const gi=geomInfo(m);if(!gi)return null;const {g,p,idx,triCount}=gi,verts=new Array(triCount),normals=new Array(triCount),edges=new Map(),adj=Array.from({length:triCount},()=>new Set()),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3();
 for(let t=0;t<triCount;t++){
  const ids=[idx?idx[t*3]:t*3,idx?idx[t*3+1]:t*3+1,idx?idx[t*3+2]:t*3+2];
  const keys=idx?ids.map(String):ids.map(i=>vertexKey(p,i));verts[t]={ids,keys};
  a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]);normals[t]=ab.copy(b).sub(a).cross(ac.copy(c).sub(a)).normalize().clone();
  for(const [u,v] of [[keys[0],keys[1]],[keys[1],keys[2]],[keys[2],keys[0]]]){const k=u<v?`${u}|${v}`:`${v}|${u}`;const list=edges.get(k)||[];list.push(t);edges.set(k,list)}
 }
 for(const list of edges.values())if(list.length>1)for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){adj[list[i]].add(list[j]);adj[list[j]].add(list[i])}
 return{...gi,verts,normals,adj};
}
function storeFaceSets(m,labels,type,threshold=0){
 const max=labels.reduce((a,b)=>Math.max(a,b),0);m.geometry.userData=m.geometry.userData||{};m.geometry.userData.savanskiFaceSets={labels:Array.from(labels),type,threshold,count:max,active:max?1:0,updatedAt:Date.now()};readout();return m.geometry.userData.savanskiFaceSets;
}
function initFaceSets(){
 const m=mesh(),host=panel('sculpt');if(!m)return A.toast('Select one mesh before creating sculpt regions.','error');const topo=triangleTopology(m);if(!topo)return;
 const mode=val(host,'faceset-mode','normal'),threshold=clamp(val(host,'faceset-angle',35),0,180),labels=new Int32Array(topo.triCount);A.pushHistory?.('Initialize sculpt regions');
 if(mode==='material'){
  const groups=topo.g.groups||[];let label=0;
  if(!groups.length){labels.fill(1);label=1}
  else{for(const gr of groups){label++;const first=Math.floor((gr.start||0)/3),count=Math.floor((gr.count||0)/3);for(let t=first;t<Math.min(topo.triCount,first+count);t++)labels[t]=label}for(let t=0;t<topo.triCount;t++)if(!labels[t])labels[t]=label||1}
 }else{
  const cos=Math.cos(threshold*Math.PI/180);let label=0;for(let s=0;s<topo.triCount;s++){if(labels[s])continue;label++;labels[s]=label;const q=[s];for(let h=0;h<q.length;h++){const t=q[h];for(const n of topo.adj[t]){if(labels[n])continue;if(mode==='normal'&&topo.normals[t].dot(topo.normals[n])<cos)continue;labels[n]=label;q.push(n)}}}
 }
 storeFaceSets(m,labels,mode,threshold);A.toast(`Sculpt regions initialized · ${m.geometry.userData.savanskiFaceSets.count} set(s).`,'success');
}
function faceSets(m=mesh()){return m?.geometry?.userData?.savanskiFaceSets||null}
function beginPickFaceSet(){if(!mesh())return A.toast('Select a mesh first.','error');if(!faceSets())return A.toast('Initialize sculpt regions first.','error');state.pickFaceSet=true;A.toast('Click a visible face to make its sculpt region active.','success')}
function installFacePicker(){
 if(S.renderer?.domElement?.__savanskiPass7FacePicker)return;const c=S.renderer?.domElement;if(!c)return;
 c.addEventListener('pointerdown',ev=>{if(!state.pickFaceSet)return;state.pickFaceSet=false;ev.preventDefault();ev.stopImmediatePropagation();const m=mesh();if(!m)return;const rect=c.getBoundingClientRect();S.pointer.set((ev.clientX-rect.left)/rect.width*2-1,-((ev.clientY-rect.top)/rect.height*2-1));S.raycaster.setFromCamera(S.pointer,S.camera);const hit=S.raycaster.intersectObject(m,false)[0],fs=faceSets(m);if(!hit||!fs)return A.toast('No sculpt-region face found.','error');const tri=Math.max(0,Math.min(fs.labels.length-1,hit.faceIndex|0)),label=fs.labels[tri]||0;fs.active=label;readout();A.toast(`Active sculpt region: ${label}`,'success')},true);c.__savanskiPass7FacePicker=true;
}
function readout(){
 const host=panel('sculpt')?.querySelector('[data-pro3d7-faceset-readout]'),m=mesh(),fs=faceSets(m);if(!host)return;host.textContent=fs?`${m.name||'Mesh'} · ${fs.count||0} sets · active ${fs.active||'—'} · ${fs.type||'custom'}`:'No sculpt regions on the selected mesh.';
}
function growShrink(dir){
 const m=mesh(),fs=faceSets(m),topo=triangleTopology(m);if(!m||!fs||!topo)return A.toast('Initialize and select a sculpt region first.','error');const active=fs.active|0;if(!active)return;A.pushHistory?.(dir>0?'Grow sculpt region':'Shrink sculpt region');const labels=Int32Array.from(fs.labels);
 if(dir>0){const take=[];for(let t=0;t<labels.length;t++)if(labels[t]===active)for(const n of topo.adj[t])if(labels[n]!==active)take.push(n);for(const n of take)labels[n]=active}
 else{const boundary=[];for(let t=0;t<labels.length;t++)if(labels[t]===active&&[...topo.adj[t]].some(n=>labels[n]!==active))boundary.push(t);for(const t of boundary){const counts=new Map();for(const n of topo.adj[t])if(labels[n]!==active){const l=labels[n]||0;counts.set(l,(counts.get(l)||0)+1)}let best=0,bn=-1;for(const [l,n] of counts)if(n>bn){best=l;bn=n}labels[t]=best}}
 fs.labels=Array.from(labels);readout();A.toast(dir>0?'Sculpt region grown by one ring.':'Sculpt region shrunk by one ring.','success');
}
function sculptMask(){const m=mesh();return m&&window.Savanski3DSculpt?.ensureMask?.(m)}
function maskRegion(invert=false){
 const m=mesh(),fs=faceSets(m),topo=triangleTopology(m),mask=sculptMask();if(!m||!fs||!topo||!mask)return A.toast('Select a mesh with sculpt regions first.','error');A.pushHistory?.(invert?'Mask active sculpt region':'Isolate active sculpt region');const active=fs.active|0,arr=mask.array;arr.fill(invert?0:1);
 const selectedVerts=new Set();for(let t=0;t<topo.triCount;t++)if(fs.labels[t]===active)for(const id of topo.verts[t].ids)selectedVerts.add(id);
 for(const i of selectedVerts)arr[i]=invert?1:0;mask.needsUpdate=true;A.toast(invert?'Active region protected by sculpt mask.':'Everything outside the active region is protected.','success');
}
function clearMask(){const m=sculptMask();if(!m)return;A.pushHistory?.('Clear sculpt mask');m.array.fill(0);m.needsUpdate=true;A.toast('Sculpt mask cleared.')}
function extractRegion(){
 const m=mesh(),fs=faceSets(m),active=fs?.active|0;if(!m||!fs||!active)return A.toast('Choose an active sculpt region first.','error');const src=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone(),triCount=Math.floor(src.getAttribute('position').count/3),take=[];for(let t=0;t<Math.min(triCount,fs.labels.length);t++)if(fs.labels[t]===active)take.push(t);if(!take.length)return A.toast('Active sculpt region is empty.','error');
 A.pushHistory?.('Extract sculpt region');const g=new THREE.BufferGeometry();for(const name of Object.keys(src.attributes)){const at=src.getAttribute(name),Ctor=at.array.constructor,out=new Ctor(take.length*3*at.itemSize);let o=0;for(const t of take)for(let k=0;k<3;k++){const vi=t*3+k,base=vi*at.itemSize;for(let c=0;c<at.itemSize;c++)out[o++]=at.array[base+c]}g.setAttribute(name,new THREE.BufferAttribute(out,at.itemSize,at.normalized))}
 g.computeBoundingBox();g.computeBoundingSphere();if(!g.getAttribute('normal'))g.computeVertexNormals();const mat=Array.isArray(m.material)?m.material[0]?.clone?.():m.material?.clone?.();const n=new THREE.Mesh(g,mat||A.makeMaterial());n.name=`${m.name||'Mesh'} · Region ${active}`;n.position.copy(m.position);n.rotation.copy(m.rotation);n.scale.copy(m.scale);n.castShadow=m.castShadow;n.receiveShadow=m.receiveShadow;A.ensureRoot().add(n);A.selectObject(n);A.updateProjectStats();A.toast(`Extracted sculpt region ${active} as a new mesh.`,'success');
}
function adjacencyForVertices(m=mesh()){
 const gi=geomInfo(m);if(!gi)return null;const {p,idx}=gi,adj=Array.from({length:p.count},()=>new Set());if(idx){for(let i=0;i<idx.length;i+=3){const a=idx[i],b=idx[i+1],c=idx[i+2];adj[a].add(b).add(c);adj[b].add(a).add(c);adj[c].add(a).add(b)}}else for(let i=0;i+2<p.count;i+=3){adj[i].add(i+1).add(i+2);adj[i+1].add(i).add(i+2);adj[i+2].add(i).add(i+1)}return adj;
}
function curvatureValues(m=mesh()){
 const gi=geomInfo(m),adj=adjacencyForVertices(m);if(!gi||!adj)return null;const {g,p}=gi;if(!g.getAttribute('normal'))g.computeVertexNormals();const n=g.getAttribute('normal'),out=new Float32Array(p.count),v=new THREE.Vector3(),avgN=new THREE.Vector3(),nn=new THREE.Vector3();
 for(let i=0;i<p.count;i++){avgN.set(0,0,0);let c=0;for(const j of adj[i]){avgN.add(nn.fromBufferAttribute(n,j));c++}if(!c){out[i]=0;continue}avgN.multiplyScalar(1/c).normalize();v.fromBufferAttribute(n,i).normalize();const dot=clamp(v.dot(avgN),-1,1);out[i]=clamp((K().sv7_cavity_from_normal_dot?K().sv7_cavity_from_normal_dot(dot,4):(1-dot)*4),0,1)}return out;
}
function curvatureToMask(){
 const m=mesh(),mask=sculptMask(),curv=curvatureValues(m),host=panel('sculpt');if(!m||!mask||!curv)return A.toast('Select a sculptable mesh first.','error');const strength=clamp(val(host,'curvature-strength',100)/100,0,1),invert=!!val(host,'curvature-invert',false);A.pushHistory?.('Curvature sculpt mask');for(let i=0;i<curv.length;i++){let v=curv[i]*strength;if(invert)v=1-v;mask.setX(i,clamp(v,0,1))}mask.needsUpdate=true;A.toast('Curvature-based sculpt mask applied.','success');
}
async function stencilToMask(input){
 const m=mesh(),mask=sculptMask(),uv=m?.geometry?.getAttribute('uv'),file=input?.files?.[0],host=panel('sculpt');if(!m||!mask)return A.toast('Select a sculptable mesh first.','error');if(!uv)return A.toast('Generate UVs before applying a UV stencil mask.','error');if(!file||!file.type.startsWith('image/'))return A.toast('Choose an image stencil.','error');
 const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{try{const c=document.createElement('canvas');c.width=Math.min(2048,img.naturalWidth||1024);c.height=Math.min(2048,img.naturalHeight||1024);const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,c.width,c.height);const d=x.getImageData(0,0,c.width,c.height).data,threshold=clamp(val(host,'stencil-threshold',50)/100,0,1),invert=!!val(host,'stencil-invert',false),luma=K().sv7_luma||((r,g,b)=>.2126*r+.7152*g+.0722*b);A.pushHistory?.('UV stencil sculpt mask');for(let i=0;i<mask.count;i++){const u=((uv.getX(i)%1)+1)%1,v=((uv.getY(i)%1)+1)%1,px=Math.min(c.width-1,Math.max(0,Math.round(u*(c.width-1)))),py=Math.min(c.height-1,Math.max(0,Math.round((1-v)*(c.height-1)))),k=(py*c.width+px)*4,lum=luma(d[k]/255,d[k+1]/255,d[k+2]/255),soft=K().sv7_smoothstep?K().sv7_smoothstep(Math.max(0,threshold-.12),Math.min(1,threshold+.12),lum):lum;mask.setX(i,invert?1-soft:soft)}mask.needsUpdate=true;state.lastStencil={name:file.name};A.toast(`Stencil mask applied · ${file.name}`,'success')}finally{URL.revokeObjectURL(url)}};img.onerror=()=>{URL.revokeObjectURL(url);A.toast('Could not read stencil image.','error')};img.src=url;
}
function fillTri(ctx,uv0,uv1,uv2,color,w,h){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(clamp(uv0.x,0,1)*w,(1-clamp(uv0.y,0,1))*h);ctx.lineTo(clamp(uv1.x,0,1)*w,(1-clamp(uv1.y,0,1))*h);ctx.lineTo(clamp(uv2.x,0,1)*w,(1-clamp(uv2.y,0,1))*h);ctx.closePath();ctx.fill()}
function bakeMap(){
 const m=mesh(),gi=geomInfo(m),host=panel('paint'),canvas=document.querySelector('#paintCanvas');if(!m||!gi||!canvas)return A.toast('Select a UV-mapped mesh first.','error');const uv=gi.g.getAttribute('uv');if(!uv)return A.toast('Generate UVs before baking a surface map.','error');if(!gi.g.getAttribute('normal'))gi.g.computeVertexNormals();const normal=gi.g.getAttribute('normal'),mode=val(host,'bake-mode','normal'),axis=val(host,'bake-axis','y'),curv=mode==='cavity'?curvatureValues(m):null,box=gi.g.boundingBox||((gi.g.computeBoundingBox(),gi.g.boundingBox)),min=box.min[axis],range=Math.max(1e-8,box.max[axis]-min),ctx=canvas.getContext('2d');A.pushHistory?.('Bake surface map');ctx.save();ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=mode==='normal'?'#8080ff':'#000';ctx.fillRect(0,0,canvas.width,canvas.height);
 const idx=gi.idx;for(let t=0;t<gi.triCount;t++){const ids=[idx?idx[t*3]:t*3,idx?idx[t*3+1]:t*3+1,idx?idx[t*3+2]:t*3+2],u=ids.map(i=>({x:uv.getX(i),y:uv.getY(i)}));let color='#8080ff';
  if(mode==='normal'){let nx=0,ny=0,nz=0;for(const i of ids){nx+=normal.getX(i);ny+=normal.getY(i);nz+=normal.getZ(i)}const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;color=`rgb(${Math.round((nx*.5+.5)*255)},${Math.round((ny*.5+.5)*255)},${Math.round((nz*.5+.5)*255)})`}
  else if(mode==='cavity'){const v=(curv[ids[0]]+curv[ids[1]]+curv[ids[2]])/3*255;color=`rgb(${v|0},${v|0},${v|0})`}
  else{let v=0;for(const i of ids)v+=(gi.p[axis==='x'?'getX':axis==='z'?'getZ':'getY'](i)-min)/range;v=Math.round(clamp(v/3,0,1)*255);color=`rgb(${v},${v},${v})`}
  fillTri(ctx,u[0],u[1],u[2],color,canvas.width,canvas.height);
 }ctx.restore();if(S.paintTexture)S.paintTexture.needsUpdate=true;A.toast(`${mode==='normal'?'Object-space normal':mode==='cavity'?'Curvature/cavity':'Height/displacement'} map baked to the Paint Canvas.`,'success');
}
function downloadBake(){const canvas=document.querySelector('#paintCanvas');if(!canvas)return;canvas.toBlob(b=>b&&A.downloadBlob(b,A.safeName(A.$('#projectName')?.value||'savanski','_baked-map.png')),'image/png')}
function inject(){
 const r=root();if(!r||r.dataset.professionalPass7==='1')return;r.dataset.professionalPass7='1';
 section(panel('sculpt'),'Sculpt Regions / Face Sets',`<div class="sav-grid cols-3"><label class="sav-field"><span>Initialize By</span><select data-pro3d7-control="faceset-mode"><option value="normal">Normal Regions</option><option value="loose">Loose Parts</option><option value="material">Material Groups</option></select></label><label class="sav-field"><span>Normal Angle °</span><input data-pro3d7-control="faceset-angle" type="number" min="0" max="180" value="35"></label><button class="sav-btn" data-pro3d7="faceset-init">Initialize Regions</button></div><div class="sav-grid cols-4"><button class="sav-btn" data-pro3d7="faceset-pick">Pick Active Set</button><button class="sav-btn" data-pro3d7="faceset-grow">Grow</button><button class="sav-btn" data-pro3d7="faceset-shrink">Shrink</button><button class="sav-btn" data-pro3d7="faceset-extract">Extract as Mesh</button></div><div class="sav-grid cols-3"><button class="sav-btn" data-pro3d7="faceset-isolate">Mask Outside Set</button><button class="sav-btn" data-pro3d7="faceset-mask">Mask Active Set</button><button class="sav-btn" data-pro3d7="mask-clear">Clear Sculpt Mask</button></div><div class="sav-live-surface" data-pro3d7-faceset-readout>No sculpt regions on the selected mesh.</div><p class="sav-pro-note">Face-set style regions let complex animals and humanoids isolate paws, ears, wings, facial areas, armor plates, or separate anatomical zones for focused sculpting and extraction.</p>`);
 section(panel('sculpt'),'Curvature & UV Stencil Masks',`<div class="sav-grid cols-3"><label class="sav-field"><span>Curvature Strength %</span><input data-pro3d7-control="curvature-strength" type="number" min="0" max="100" value="100"></label><label class="sav-check"><input data-pro3d7-control="curvature-invert" type="checkbox">Invert curvature</label><button class="sav-btn" data-pro3d7="curvature-mask">Curvature → Sculpt Mask</button></div><div class="sav-grid cols-4"><label class="sav-field"><span>Stencil Image</span><input data-pro3d7-stencil type="file" accept="image/*"></label><label class="sav-field"><span>Threshold %</span><input data-pro3d7-control="stencil-threshold" type="number" min="0" max="100" value="50"></label><label class="sav-check"><input data-pro3d7-control="stencil-invert" type="checkbox">Invert stencil</label><button class="sav-btn" data-pro3d7="mask-clear">Clear Mask</button></div><p class="sav-pro-note">Curvature masking protects or targets detailed folds and ridges. UV stencil images convert luminance into the existing sculpt-mask attribute, so patterned protection works with Savanski sculpt brushes instead of becoming a separate tool system.</p>`);
 section(panel('paint'),'Surface Detail Map Baking',`<div class="sav-grid cols-4"><label class="sav-field"><span>Bake</span><select data-pro3d7-control="bake-mode"><option value="normal">Object-Space Normals</option><option value="cavity">Curvature / Cavity</option><option value="height">Height / Displacement</option></select></label><label class="sav-field"><span>Height Axis</span><select data-pro3d7-control="bake-axis"><option value="x">X</option><option value="y" selected>Y</option><option value="z">Z</option></select></label><button class="sav-btn" data-pro3d7="bake-map">Bake to Paint Canvas</button><button class="sav-btn" data-pro3d7="download-bake">Download Baked PNG</button></div><p class="sav-pro-note">These are browser-local UV-space utility bakes. The normal bake is explicitly object-space; the cavity bake is curvature-derived; the height bake normalizes the selected local axis. They are not mislabeled as ray-traced AO or tangent-space cage baking.</p>`);
 r.addEventListener('click',ev=>{const b=ev.target.closest('[data-pro3d7]');if(!b)return;ev.preventDefault();ev.stopPropagation();switch(b.dataset.pro3d7){case'faceset-init':return initFaceSets();case'faceset-pick':return beginPickFaceSet();case'faceset-grow':return growShrink(1);case'faceset-shrink':return growShrink(-1);case'faceset-isolate':return maskRegion(false);case'faceset-mask':return maskRegion(true);case'faceset-extract':return extractRegion();case'mask-clear':return clearMask();case'curvature-mask':return curvatureToMask();case'bake-map':return bakeMap();case'download-bake':return downloadBake();}});
 r.querySelector('[data-pro3d7-stencil]')?.addEventListener('change',ev=>stencilToMask(ev.target));installFacePicker();readout();
}
function boot(){if(!window.Savanski3D?.state?.renderer)return setTimeout(boot,90);window.SavanskiPass7Wasm?.init?.();inject();A.selectObject&&(()=>{const old=A.selectObject;A.selectObject=function(o){const r=old(o);setTimeout(readout,0);return r}})()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));else setTimeout(boot,0);
window.Savanski3DProfessionalPass7={initFaceSets,beginPickFaceSet,growShrink,extractRegion,curvatureToMask,bakeMap};
})();