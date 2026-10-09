
(function(){
'use strict';
const A=window.Savanski3D;if(!A)return;const S=A.state;
const root=()=>document.querySelector('#savanski-3d-toolbar');
const panel=n=>root()?.querySelector(`[data-panel="${n}"]`);
const section=(host,title,html)=>{const body=host?.querySelector('.sav-panel-body');if(!body)return null;const s=document.createElement('section');s.className='sav-section sav-professional-section sav-pass8-section';s.innerHTML=`<h3>${title}</h3>${html}`;body.appendChild(s);return s};
const ctrl=(host,name)=>host?.querySelector(`[data-pro3d8-control="${name}"]`);
const val=(host,name,def=0)=>{const e=ctrl(host,name);if(!e)return def;if(e.type==='checkbox')return !!e.checked;if(e.type==='number'||e.type==='range')return Number(e.value);return e.value};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const K=()=>window.SavanskiPass8Wasm?.kernel||{};
const state={retopo:{target:null,placing:false,editing:false,drag:-1,points:[],faces:[],helper:null},installed:false};

function mesh(){const m=S.selected;return m?.isMesh&&!m.userData?.savanskiUiHelper?m:null}
function disposeObj(o){o?.traverse?.(x=>{x.geometry?.dispose?.();if(Array.isArray(x.material))x.material.forEach(m=>m?.dispose?.());else x.material?.dispose?.()})}
function clearRetopoHelper(){
 const r=state.retopo;if(r.helper){S.scene?.remove(r.helper);disposeObj(r.helper);r.helper=null}
}
function retopoReadout(){
 const e=panel('geometry')?.querySelector('[data-pro3d8-retopo-readout]');if(!e)return;const r=state.retopo;
 e.textContent=`${r.target?.name||'No target'} · ${r.points.length} vertices · ${Math.floor(r.faces.length/3)} triangles${r.placing?' · placing':''}${r.editing?' · editing':''}`;
}
function rebuildRetopoHelper(){
 const r=state.retopo;clearRetopoHelper();if(!S.scene||!window.THREE||(!r.points.length&&!r.faces.length)){retopoReadout();return}
 const g=new THREE.Group();g.name='Savanski Retopology Draft';g.userData.savanskiUiHelper=true;
 const scale=Math.max(.006,new THREE.Box3().setFromObject(r.target||A.ensureRoot()).getSize(new THREE.Vector3()).length()/240||.02);
 const geo=new THREE.SphereGeometry(scale,10,7),mat=new THREE.MeshBasicMaterial({color:0x00ffff,depthTest:false,transparent:true,opacity:.95});
 for(let i=0;i<r.points.length;i++){const p=r.points[i],m=new THREE.Mesh(geo,mat);m.position.set(p.x,p.y,p.z);m.renderOrder=999;m.userData.savanskiUiHelper=true;g.add(m)}
 const verts=[];
 for(let i=0;i<r.faces.length;i+=3){const a=r.points[r.faces[i]],b=r.points[r.faces[i+1]],c=r.points[r.faces[i+2]];if(!a||!b||!c)continue;for(const [u,v] of [[a,b],[b,c],[c,a]])verts.push(u.x,u.y,u.z,v.x,v.y,v.z)}
 if(verts.length){const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));const line=new THREE.LineSegments(eg,new THREE.LineBasicMaterial({color:0xfff600,depthTest:false,transparent:true,opacity:.95}));line.renderOrder=998;line.userData.savanskiUiHelper=true;g.add(line)}
 if(r.points.length>1){const pv=[];for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i];pv.push(a.x,a.y,a.z,b.x,b.y,b.z)}const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pv,3));const pl=new THREE.LineSegments(pg,new THREE.LineDashedMaterial({color:0xff8a00,dashSize:scale*3,gapSize:scale*2,depthTest:false}));pl.computeLineDistances?.();pl.userData.savanskiUiHelper=true;g.add(pl)}
 S.scene.add(g);r.helper=g;retopoReadout();
}
function setRetopoTarget(){
 const m=mesh();if(!m)return A.toast('Select the dense/sculpted surface mesh first.','error');state.retopo.target=m;state.retopo.points=[];state.retopo.faces=[];state.retopo.drag=-1;rebuildRetopoHelper();A.toast(`Retopology surface set: ${m.name||'Mesh'}.`,'success');
}
function hitTarget(ev){
 const t=state.retopo.target;if(!t||!S.renderer||!S.camera)return null;const rect=S.renderer.domElement.getBoundingClientRect();S.pointer.set((ev.clientX-rect.left)/rect.width*2-1,-((ev.clientY-rect.top)/rect.height*2-1));S.raycaster.setFromCamera(S.pointer,S.camera);const hit=S.raycaster.intersectObject(t,false)[0];if(!hit)return null;
 const host=panel('geometry'),off=Number(val(host,'retopo-offset',.002))||0,p=hit.point.clone(),n=(hit.face?.normal||new THREE.Vector3(0,1,0)).clone(),nm=new THREE.Matrix3().getNormalMatrix(t.matrixWorld);n.applyMatrix3(nm).normalize();p.addScaledVector(n,off);return p;
}
function nearestProjected(ev){
 const r=state.retopo,rect=S.renderer.domElement.getBoundingClientRect(),mx=ev.clientX-rect.left,my=ev.clientY-rect.top;let best=-1,bd=Infinity;
 for(let i=0;i<r.points.length;i++){const p=new THREE.Vector3(r.points[i].x,r.points[i].y,r.points[i].z).project(S.camera),sx=(p.x+1)*.5*rect.width,sy=(1-p.y)*.5*rect.height,d=Math.hypot(sx-mx,sy-my);if(d<bd){bd=d;best=i}}
 return bd<=14?best:-1;
}
function installRetopoPointer(){
 const c=S.renderer?.domElement;if(!c||c.__savanskiPass8Retopo)return;
 c.addEventListener('pointerdown',ev=>{
  const r=state.retopo;if((!r.placing&&!r.editing)||!r.target)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  if(r.editing){const i=nearestProjected(ev);if(i>=0){r.drag=i;c.setPointerCapture?.(ev.pointerId)}return}
  const p=hitTarget(ev);if(!p)return;r.points.push({x:p.x,y:p.y,z:p.z});rebuildRetopoHelper()
 },true);
 c.addEventListener('pointermove',ev=>{const r=state.retopo;if(!r.editing||r.drag<0)return;ev.preventDefault();ev.stopImmediatePropagation();const p=hitTarget(ev);if(!p)return;r.points[r.drag]={x:p.x,y:p.y,z:p.z};rebuildRetopoHelper()},true);
 const end=ev=>{if(state.retopo.drag>=0){ev.preventDefault();ev.stopImmediatePropagation();state.retopo.drag=-1;rebuildRetopoHelper()}};
 c.addEventListener('pointerup',end,true);c.addEventListener('pointercancel',end,true);c.__savanskiPass8Retopo=true;
}
function togglePlace(on){const r=state.retopo;if(!r.target)return A.toast('Set a retopology surface first.','error');r.placing=!!on;if(on)r.editing=false;retopoReadout();A.toast(on?'Surface vertex placement enabled. Click the sculpt surface.':'Surface vertex placement disabled.','success')}
function toggleEdit(on){const r=state.retopo;if(!r.target)return A.toast('Set a retopology surface first.','error');r.editing=!!on;if(on)r.placing=false;retopoReadout();A.toast(on?'Retopology point editing enabled. Drag cyan points; they remain snapped to the target surface.':'Retopology point editing disabled.','success')}
function undoRetopoPoint(){const r=state.retopo;if(!r.points.length)return;r.points.pop();r.faces=r.faces.filter(i=>i<r.points.length);rebuildRetopoHelper()}
function addTri(){
 const r=state.retopo,n=r.points.length;if(n<3)return A.toast('Place at least three retopology vertices first.','error');r.faces.push(n-3,n-2,n-1);rebuildRetopoHelper()
}
function addQuad(){
 const r=state.retopo,n=r.points.length;if(n<4)return A.toast('Place at least four retopology vertices first.','error');const a=n-4,b=n-3,c=n-2,d=n-1;r.faces.push(a,b,c,a,c,d);rebuildRetopoHelper()
}
function makeStrip(){
 const r=state.retopo,n=r.points.length;if(n<4||n%2)return A.toast('Quad Strip expects an even number of vertices placed as successive left/right pairs.','error');r.faces=[];for(let i=2;i<n;i+=2){const a=i-2,b=i-1,c=i,d=i+1;r.faces.push(a,b,d,a,d,c)}rebuildRetopoHelper();A.toast(`Quad strip built: ${Math.floor(r.faces.length/6)} quads.`,'success')
}
function clearDraft(){state.retopo.points=[];state.retopo.faces=[];state.retopo.drag=-1;rebuildRetopoHelper()}
function buildRetopoMesh(){
 const r=state.retopo;if(!r.target||r.points.length<3||r.faces.length<3)return A.toast('Place surface vertices and create at least one face first.','error');A.pushHistory?.('Build retopology mesh');
 const rootObj=A.ensureRoot(),pts=[];rootObj.updateMatrixWorld?.(true);for(const p of r.points){const q=new THREE.Vector3(p.x,p.y,p.z);rootObj.worldToLocal(q);pts.push(q.x,q.y,q.z)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setIndex(r.faces.slice());g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
 const mat=new THREE.MeshStandardMaterial({color:0x00ffff,roughness:.78,metalness:0,side:THREE.DoubleSide,transparent:true,opacity:.94});const m=new THREE.Mesh(g,mat);m.name=`${r.target.name||'Mesh'} Retopology`;m.castShadow=true;m.receiveShadow=true;m.userData.savanskiRetopology={sourceUuid:r.target.uuid,createdAt:Date.now(),manualSurfaceSnap:true};
 rootObj.add(m);A.selectObject(m);A.refreshSceneList?.();A.updateProjectStats?.();clearDraft();r.target=r.target;A.toast('Editable surface-retopology mesh created. Generate UVs, refine topology, then rig/weight it like any Savanski mesh.','success')
}

/* Mask/Face-Set aware region posing for pre-rig proportion changes and corrective sculpt deformation. */
function poseVertexWeights(m,scope){
 const g=m.geometry,p=g.getAttribute('position'),weights=new Float32Array(p.count);weights.fill(1);
 const mask=g.getAttribute('savanskiMask');if(mask)for(let i=0;i<p.count;i++)weights[i]*=1-clamp(mask.getX(i),0,1);
 if(scope==='faceset'){
  const fs=g.userData?.savanskiFaceSets;if(!fs?.labels?.length||!fs.active)return null;weights.fill(0);const idx=g.index?.array,labels=fs.labels,active=fs.active;
  for(let t=0;t<labels.length;t++)if(labels[t]===active){const ids=idx?[idx[t*3],idx[t*3+1],idx[t*3+2]]:[t*3,t*3+1,t*3+2];for(const i of ids)if(i<p.count)weights[i]=mask?1-clamp(mask.getX(i),0,1):1}
 }
 return weights;
}
function poseRegion(kind){
 const m=mesh();if(!m)return A.toast('Select a mesh first.','error');const host=panel('sculpt'),scope=val(host,'pose-scope','unmasked'),w=poseVertexWeights(m,scope);if(!w)return A.toast('Active Face Set required for Face Set pose scope.','error');const g=m.geometry,p=g.getAttribute('position');if(!p)return;
 let sum=0,c=new THREE.Vector3(),v=new THREE.Vector3();for(let i=0;i<p.count;i++){const wi=w[i];if(wi<=0)continue;v.fromBufferAttribute(p,i);c.addScaledVector(v,wi);sum+=wi}if(sum<=1e-7)return A.toast('No unmasked vertices are available for this pose deformation.','error');c.multiplyScalar(1/sum);
 const strength=clamp(val(host,'pose-strength',1),0,1),axisName=val(host,'pose-axis','z'),axis=new THREE.Vector3(axisName==='x'?1:0,axisName==='y'?1:0,axisName==='z'?1:0),angle=(Number(val(host,'pose-angle',15))||0)*Math.PI/180,tx=Number(val(host,'pose-x',0))||0,ty=Number(val(host,'pose-y',0))||0,tz=Number(val(host,'pose-z',0))||0,delta=new THREE.Vector3(tx,ty,tz),q=new THREE.Quaternion();
 A.pushHistory?.(kind==='rotate'?'Pose sculpt region rotate':'Pose sculpt region translate');
 for(let i=0;i<p.count;i++){const wi=clamp(w[i]*strength,0,1);if(wi<=0)continue;v.fromBufferAttribute(p,i);if(kind==='rotate'){q.setFromAxisAngle(axis,angle*wi);v.sub(c).applyQuaternion(q).add(c)}else v.addScaledVector(delta,wi);p.setXYZ(i,v.x,v.y,v.z)}
 p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();S.helper?.update?.();A.syncInspector?.();A.updateProjectStats?.();A.toast(kind==='rotate'?'Pose-region rotation applied.':'Pose-region translation applied.','success')
}

function installUI(){
 installRetopoPointer();
 const geo=panel('geometry'),sculpt=panel('sculpt');
 if(geo&&!geo.querySelector('[data-savanski-pass8-retopo]')){
  section(geo,'Surface Retopology / Poly Build',`
   <div data-savanski-pass8-retopo>
    <div class="launcher-choice-row"><button data-pro3d8="retopo-target">Use Selected as Surface</button><button data-pro3d8="retopo-place">Place Vertices</button><button data-pro3d8="retopo-stop">Stop Placement</button></div>
    <div class="launcher-choice-row"><button data-pro3d8="retopo-edit">Edit / Drag Points</button><button data-pro3d8="retopo-stop-edit">Stop Point Edit</button><button data-pro3d8="retopo-undo">Undo Vertex</button></div>
    <label>Surface offset <input data-pro3d8-control="retopo-offset" type="number" min="-1" max="1" step=".001" value=".002"></label>
    <div class="launcher-choice-row"><button data-pro3d8="retopo-tri">Face from Last 3</button><button data-pro3d8="retopo-quad">Quad from Last 4</button><button data-pro3d8="retopo-strip">Quad Strip from Pairs</button></div>
    <div class="launcher-choice-row"><button data-pro3d8="retopo-build">Build Retopology Mesh</button><button data-pro3d8="retopo-clear">Clear Draft</button></div>
    <p data-pro3d8-retopo-readout>No target · 0 vertices · 0 triangles</p>
    <p class="sav-help">Place cyan vertices directly on a dense sculpt. Faces stay surface-snapped and become a separate editable low-topology mesh for UVs, weights, rigging and animation.</p>
   </div>`);
 }
 if(sculpt&&!sculpt.querySelector('[data-savanski-pass8-pose]')){
  section(sculpt,'Pose Sculpt Region',`
   <div data-savanski-pass8-pose>
    <div class="compact-grid">
     <label>Scope <select data-pro3d8-control="pose-scope"><option value="unmasked">All Unmasked</option><option value="faceset">Active Face Set + Mask</option></select></label>
     <label>Axis <select data-pro3d8-control="pose-axis"><option value="x">X</option><option value="y">Y</option><option value="z" selected>Z</option></select></label>
     <label>Angle ° <input data-pro3d8-control="pose-angle" type="number" min="-180" max="180" step="1" value="15"></label>
     <label>Strength <input data-pro3d8-control="pose-strength" type="range" min="0" max="1" step=".01" value="1"></label>
     <label>Move X <input data-pro3d8-control="pose-x" type="number" step=".01" value="0"></label>
     <label>Move Y <input data-pro3d8-control="pose-y" type="number" step=".01" value="0"></label>
     <label>Move Z <input data-pro3d8-control="pose-z" type="number" step=".01" value="0"></label>
    </div>
    <div class="launcher-choice-row"><button data-pro3d8="pose-rotate">Rotate Region</button><button data-pro3d8="pose-translate">Translate Region</button></div>
    <p class="sav-help">Uses the existing sculpt mask or active Sculpt Region / Face Set. Useful for pre-rig proportion changes, ear/limb repositioning and corrective deformations without moving protected vertices.</p>
   </div>`);
 }
 root()?.addEventListener('click',ev=>{
  const b=ev.target.closest('[data-pro3d8]');if(!b)return;const a=b.dataset.pro3d8;
  if(a==='retopo-target')setRetopoTarget();
  else if(a==='retopo-place')togglePlace(true);
  else if(a==='retopo-stop')togglePlace(false);
  else if(a==='retopo-edit')toggleEdit(true);
  else if(a==='retopo-stop-edit')toggleEdit(false);
  else if(a==='retopo-undo')undoRetopoPoint();
  else if(a==='retopo-tri')addTri();
  else if(a==='retopo-quad')addQuad();
  else if(a==='retopo-strip')makeStrip();
  else if(a==='retopo-build')buildRetopoMesh();
  else if(a==='retopo-clear')clearDraft();
  else if(a==='pose-rotate')poseRegion('rotate');
  else if(a==='pose-translate')poseRegion('translate');
 });
 retopoReadout();
}
function boot(){if(!window.Savanski3D?.state?.renderer)return setTimeout(boot,60);if(state.installed)return;state.installed=true;installUI()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));else setTimeout(boot,0);
})();
