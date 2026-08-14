#!/usr/bin/env node
'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const packageRoot = path.resolve(__dirname, '../..');
const vendor = path.join(packageRoot, 'vendor/three/classic');
const fbxPath = path.join(packageRoot, 'models/fbx/cat.fbx');
const outputPath = path.join(packageRoot, 'development/audits/fbx_runtime_audit_latest.json');

const stats = {
  sourceRuntimeInfluences: {
    expandedWeightedVertices: 0,
    verticesOver4Influences: 0,
    maxInfluences: 0,
    rawDroppedWeightSum: 0,
    maxRawDroppedWeight: 0,
    examples: []
  }
};

const ctx = {
  console, setTimeout, clearTimeout, TextDecoder, TextEncoder,
  ArrayBuffer, Uint8Array, Uint16Array, Uint32Array, Int32Array,
  Float32Array, Float64Array, DataView, Math, JSON, Date,
  performance: { now: () => Date.now() },
  __skinStats: stats.sourceRuntimeInfluences
};
ctx.window = ctx;
ctx.self = ctx;
ctx.global = ctx;
ctx.globalThis = ctx;
vm.createContext(ctx);

for (const file of ['three.js', 'inflate.js', 'NURBSUtils.js', 'NURBSCurve.js']) {
  vm.runInContext(fs.readFileSync(path.join(vendor, file), 'utf8'), ctx, { filename: file });
}

let loaderSource = fs.readFileSync(path.join(vendor, 'FBXLoader.js'), 'utf8');
const needle = '\t\t\t\t\tif ( weights.length > 4 ) {';
if (!loaderSource.includes(needle)) throw new Error('Could not instrument this FBXLoader version');
const injection = `\t\t\t\t\tglobalThis.__skinStats.expandedWeightedVertices++;\n` +
`\t\t\t\t\tglobalThis.__skinStats.maxInfluences = Math.max(globalThis.__skinStats.maxInfluences, weights.length);\n` +
`\t\t\t\t\tif (weights.length > 4) {\n` +
`\t\t\t\t\t\tglobalThis.__skinStats.verticesOver4Influences++;\n` +
`\t\t\t\t\t\tvar __sorted = weights.slice().sort(function(a,b){return b-a;});\n` +
`\t\t\t\t\t\tvar __total = weights.reduce(function(a,b){return a+b;},0);\n` +
`\t\t\t\t\t\tvar __keep = __sorted.slice(0,4).reduce(function(a,b){return a+b;},0);\n` +
`\t\t\t\t\t\tvar __drop = Math.max(0,__total-__keep);\n` +
`\t\t\t\t\t\tglobalThis.__skinStats.rawDroppedWeightSum += __drop;\n` +
`\t\t\t\t\t\tglobalThis.__skinStats.maxRawDroppedWeight = Math.max(globalThis.__skinStats.maxRawDroppedWeight,__drop);\n` +
`\t\t\t\t\t\tif(globalThis.__skinStats.examples.length<8) globalThis.__skinStats.examples.push({count:weights.length,total:__total,top4:__keep,rawDropped:__drop});\n` +
`\t\t\t\t\t}\n\n${needle}`;
loaderSource = loaderSource.replace(needle, injection);
vm.runInContext(loaderSource, ctx, { filename: 'FBXLoader.instrumented.js' });

const buffer = fs.readFileSync(fbxPath);
const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
const root = new ctx.FBXLoader().parse(ab, '');
const cat = root.getObjectByName('Cat');
if (!cat || !cat.geometry) throw new Error('Cat mesh not found');

const p = cat.geometry.attributes.position;
const n = cat.geometry.attributes.normal;
const si = cat.geometry.attributes.skinIndex;
const sw = cat.geometry.attributes.skinWeight;
const triangleCount = Math.floor(p.count / 3);

let degenerateTriangles = 0;
let tinyTriangles = 0;
let nanTriangles = 0;
let minTriangleArea = Infinity;
let maxTriangleArea = 0;
let areaSum = 0;
function area(ax, ay, az, bx, by, bz, cx, cy, cz) {
  const abx = bx-ax, aby = by-ay, abz = bz-az;
  const acx = cx-ax, acy = cy-ay, acz = cz-az;
  const x = aby*acz-abz*acy, y = abz*acx-abx*acz, z = abx*acy-aby*acx;
  return 0.5 * Math.hypot(x,y,z);
}
for (let t=0; t<triangleCount; t++) {
  const i=t*3;
  const a=[p.getX(i),p.getY(i),p.getZ(i)];
  const b=[p.getX(i+1),p.getY(i+1),p.getZ(i+1)];
  const c=[p.getX(i+2),p.getY(i+2),p.getZ(i+2)];
  if ([...a,...b,...c].some(v => !Number.isFinite(v))) nanTriangles++;
  const A=area(...a,...b,...c);
  minTriangleArea=Math.min(minTriangleArea,A); maxTriangleArea=Math.max(maxTriangleArea,A); areaSum+=A;
  if (A<1e-12) degenerateTriangles++; else if (A<1e-7) tinyTriangles++;
}

let badNormals=0, zeroNormals=0;
if (n) for (let i=0;i<n.count;i++) {
  const x=n.getX(i),y=n.getY(i),z=n.getZ(i);
  if (![x,y,z].every(Number.isFinite)) badNormals++;
  if (Math.hypot(x,y,z)<1e-8) zeroNormals++;
}

const influenceCounts={};
let maxWeightSumError=0, zeroWeightVertices=0;
if (si && sw) for (let i=0;i<p.count;i++) {
  const weights=[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)];
  const count=weights.filter(v=>v>1e-6).length;
  influenceCounts[count]=(influenceCounts[count]||0)+1;
  const sum=weights.reduce((a,b)=>a+b,0);
  maxWeightSumError=Math.max(maxWeightSumError,Math.abs(1-sum));
  if(sum<1e-6) zeroWeightVertices++;
}

// Non-destructive manifold inspection by merging equal-position expanded vertices only in memory.
const keyToId=new Map(); const ids=[]; let nextId=0;
for(let i=0;i<p.count;i++){
  const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(6)).join(',');
  let id=keyToId.get(key); if(id===undefined){id=nextId++;keyToId.set(key,id);} ids.push(id);
}
const edges=new Map();
function addEdge(a,b){if(a>b){const t=a;a=b;b=t;} const k=a+','+b;edges.set(k,(edges.get(k)||0)+1);}
let collapsedAfterMerge=0;
for(let i=0;i+2<ids.length;i+=3){
  const a=ids[i],b=ids[i+1],c=ids[i+2];
  if(a===b||b===c||c===a){collapsedAfterMerge++;continue;}
  addEdge(a,b);addEdge(b,c);addEdge(c,a);
}
let boundaryEdges=0, nonManifoldEdges=0, maxEdgeUse=0; const edgeUseHistogram={};
for(const count of edges.values()){
  edgeUseHistogram[count]=(edgeUseHistogram[count]||0)+1; maxEdgeUse=Math.max(maxEdgeUse,count);
  if(count===1) boundaryEdges++; if(count>2) nonManifoldEdges++;
}

const inf=stats.sourceRuntimeInfluences;
inf.verticesOver4Percent = inf.expandedWeightedVertices ? 100*inf.verticesOver4Influences/inf.expandedWeightedVertices : 0;
inf.meanRawDroppedWeightOver4 = inf.verticesOver4Influences ? inf.rawDroppedWeightSum/inf.verticesOver4Influences : 0;
inf.note = 'Raw pre-truncation FBXLoader accumulation is diagnostic only; do not treat rawDroppedWeight as a normalized physical weight-loss percentage.';

const out={
  file:'models/fbx/cat.fbx',
  sourceRuntimeInfluences:inf,
  runtimeMesh:{
    vertexCount:p.count, triangleCount, indexed:!!cat.geometry.index,
    groups:cat.geometry.groups, boneCount:cat.skeleton ? cat.skeleton.bones.length : 0,
    influenceCountsAfterLegacyLoader:influenceCounts, maxWeightSumError, zeroWeightVertices,
    degenerateTriangles, tinyTriangles, nanTriangles,
    minTriangleArea, maxTriangleArea, meanTriangleArea:areaSum/triangleCount,
    normals:{present:!!n,count:n?n.count:0,badNormals,zeroNormals},
  },
  geometricInspection:{
    quantizationDecimals:6, uniqueGeometricVertices:nextId, collapsedTrianglesAfterPositionMerge:collapsedAfterMerge,
    uniqueEdges:edges.size, boundaryEdges, nonManifoldEdges, maxEdgeUse, edgeUseHistogram,
    note:'Position-merge inspection only. UV/normal seam duplicates are merged in memory; no source topology is edited.'
  },
  animations:root.animations.map((a,i)=>({index:i,name:a.name,duration:a.duration,tracks:a.tracks.length}))
};
fs.writeFileSync(outputPath,JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
