#!/usr/bin/env node
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const rootDir=path.resolve(__dirname,'../..'), vendor=path.join(rootDir,'vendor/three/classic');
const ctx={console:{log(){},warn(){},error(){}},setTimeout,clearTimeout,TextDecoder,TextEncoder,ArrayBuffer,Uint8Array,Uint16Array,Uint32Array,Int32Array,Float32Array,Float64Array,DataView,Math,JSON,Date,performance:{now:()=>Date.now()}};ctx.window=ctx;ctx.self=ctx;ctx.global=ctx;ctx.globalThis=ctx;vm.createContext(ctx);
for(const f of ['three.js','inflate.js','NURBSUtils.js','NURBSCurve.js','FBXLoader.js'])vm.runInContext(fs.readFileSync(path.join(vendor,f),'utf8'),ctx,{filename:f});
const b=fs.readFileSync(path.join(rootDir,'models/fbx/cat.fbx'));const ab=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);const root=new ctx.FBXLoader().parse(ab,'');const cat=root.getObjectByName('Cat');
const p=cat.geometry.attributes.position, si=cat.geometry.attributes.skinIndex, sw=cat.geometry.attributes.skinWeight;
const out={position:Array.from(p.array),skinIndex:si?Array.from(si.array):[],skinWeight:sw?Array.from(sw.array):[],bones:cat.skeleton?cat.skeleton.bones.map(b=>b.name):[]};
fs.writeFileSync(path.join(rootDir,'development/audits/rest_mesh_runtime.json'),JSON.stringify(out));
