#!/usr/bin/env node
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const rootDir=path.resolve(__dirname,'../..'); const vendor=path.join(rootDir,'vendor/three/classic');
const ctx={console,setTimeout,clearTimeout,TextDecoder,TextEncoder,ArrayBuffer,Uint8Array,Uint16Array,Uint32Array,Int32Array,Float32Array,Float64Array,DataView,Math,JSON,Date,performance:{now:()=>Date.now()}}; ctx.window=ctx;ctx.self=ctx;ctx.global=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['three.js','inflate.js','NURBSUtils.js','NURBSCurve.js','FBXLoader.js']) vm.runInContext(fs.readFileSync(path.join(vendor,f),'utf8'),ctx,{filename:f});
const b=fs.readFileSync(path.join(rootDir,'models/fbx/cat.fbx')); const ab=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength); const root=new ctx.FBXLoader().parse(ab,'');
root.updateMatrixWorld(true);
function objInfo(o){let bb=null;if(o.geometry&&o.geometry.attributes&&o.geometry.attributes.position){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;bb={min:b.min.toArray(),max:b.max.toArray(),size:[b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z]};} return {name:o.name,type:o.type,parent:o.parent&&o.parent.name,position:o.position.toArray(),scale:o.scale.toArray(),rotation:[o.rotation.x,o.rotation.y,o.rotation.z],worldPosition:o.getWorldPosition(new ctx.Vector3()).toArray(),bboxLocal:bb,vertices:o.geometry?.attributes?.position?.count||0};}
const objects=[];root.traverse(o=>{if(/Cat|Sphere|eye|Head|Nose|Mouth|Spine|Hip|Thigh|Calf|Paw|Tail|Shoulder/i.test(o.name)||o.isSkinnedMesh)objects.push(objInfo(o));});
const cat=root.getObjectByName('Cat');
let bones=[]; if(cat&&cat.skeleton){bones=cat.skeleton.bones.map((bone,i)=>({index:i,...objInfo(bone)}));}
const out={objects,bones,animations:root.animations.map((a,i)=>({index:i,name:a.name,duration:a.duration,tracks:a.tracks.map(t=>t.name)}))};
fs.writeFileSync(path.join(rootDir,'development/audits/model_anatomy_dump.json'),JSON.stringify(out,null,2));
console.log(JSON.stringify({objects:objects.filter(o=>/Sphere|Cat$/i.test(o.name)),bones:bones.filter(b=>/Head|Nose|Mouth|Spine|Hip|Thigh|Calf|Tail/i.test(b.name)),animations:out.animations.map(a=>({index:a.index,name:a.name,duration:a.duration,tracks:a.tracks.length}))},null,2));
