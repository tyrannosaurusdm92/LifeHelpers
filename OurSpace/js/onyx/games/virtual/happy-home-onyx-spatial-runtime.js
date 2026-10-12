(()=>{
"use strict";
const W=1916,H=821,FAR_Y=522,NEAR_Y=821,FAR_PX=64,NEAR_PX=130;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const clone=v=>JSON.parse(JSON.stringify(v));
const scaleAtY=y=>{const t=clamp((Number(y)-FAR_Y)/(NEAR_Y-FAR_Y),0,1);return (FAR_PX/NEAR_PX)+(1-FAR_PX/NEAR_PX)*Math.pow(t,.85)};
const spriteSizeAtY=y=>Math.round(FAR_PX+(NEAR_PX-FAR_PX)*Math.pow(clamp((Number(y)-FAR_Y)/(NEAR_Y-FAR_Y),0,1),.85));
const floorBoundary=x=>x<366?553+(522-553)*(x/366):x<=1554?522:522+(553-522)*((x-1554)/(1916-1554));
const canWalkPoint=(x,y)=>x>=0&&x<=W&&y>=floorBoundary(x)&&y<=H;
let geo=null,index=new Map(),dynamicIndex=new Map(),baseStatic=null;
const allFeatures=()=>[...index.values(),...dynamicIndex.values()];
function reindex(){index=new Map((geo?.features||[]).map(f=>[f.properties?.id,f]).filter(x=>x[0]));}
async function load(){
 try{const r=await fetch("json/happy-home-onyx_interactions.geojson");geo=await r.json();baseStatic=clone(geo);reindex();}
 catch(_){geo=null;baseStatic=null;index=new Map();}
 return geo;
}
const getZone=id=>dynamicIndex.get(id)||index.get(id)||null;
const childIds=f=>{const p=f?.properties||{};return p.childFeatureIds||p.children||[]};
const childrenOf=id=>childIds(getZone(id)).map(getZone).filter(Boolean);
const descendantsOf=id=>{const out=[];const walk=x=>childrenOf(x).forEach(f=>{out.push(f);walk(f.properties.id)});walk(id);return out};
function pointInPolygon(pt,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const xi=ring[i][0],yi=ring[i][1],xj=ring[j][0],yj=ring[j][1];const hit=((yi>pt[1])!==(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi||1e-9)+xi);if(hit)inside=!inside}return inside}
function zonesAt(x,y){return allFeatures().filter(f=>f.geometry?.type==="Polygon"&&pointInPolygon([x,y],f.geometry.coordinates[0]||[]))}
function nearestInteraction(x,y,filter=null){let best=null,bd=Infinity;for(const f of allFeatures()){if(f.geometry?.type!=="Point")continue;if(filter&&!filter(f))continue;const [px,py]=f.geometry.coordinates,d=Math.hypot(px-x,py-y);if(d<bd){bd=d;best=f}}return best?{feature:best,distance:bd}:null}
function projectFloor(xFt,depthFt){const x=clamp(Number(xFt)||0,0,15),d=clamp(Number(depthFt)||0,0,20);const y=NEAR_Y-(d/20)*(NEAR_Y-FAR_Y);const farLeft=366*(d/20),farRight=W-362*(d/20);return {x:farLeft+(x/15)*(farRight-farLeft),y,size:spriteSizeAtY(y)}}
function rectCorners(p){const x=Number(p.x)||0,y=Number(p.y)||0,w=Math.max(1,Number(p.w)||1),h=Math.max(1,Number(p.h)||1),a=(Number(p.rotation)||0)*Math.PI/180,cx=x+w/2,cy=y+h/2;return [[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]].map(([px,py])=>{const dx=px-cx,dy=py-cy;return [cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a)]})}
function setDynamicPlacements(placements=[]){
 dynamicIndex=new Map();
 const root=getZone('onyx.dynamic-furniture');if(root){root.properties.dynamicChildFeatureIds=[];}
 for(const p of placements||[]){
  if(!p?.id)continue;const id=`onyx.dynamic.${p.id}`,children=[];const cx=(Number(p.x)||0)+(Number(p.w)||0)/2,cy=(Number(p.y)||0)+(Number(p.h)||0)*.58;
  const base={type:'Feature',properties:{id,label:p.name||p.itemId||'Placed object',role:'placed-furniture',parentId:'onyx.dynamic-furniture',children,childFeatureIds:children,placementId:p.id,itemId:p.itemId||'',interactiveType:p.interactiveType||'object',sleepingImage:p.sleepingImage||null,affordances:p.affordances||[],dynamic:true,hierarchyDepth:2},geometry:{type:'Polygon',coordinates:[rectCorners(p)]}};
  const wantsSleep=!!p.sleepingImage||String(p.interactiveType||'').toLowerCase().includes('bed')||String(p.roomGroup||'').toLowerCase().includes('bed');
  if(wantsSleep){const sid=id+'.sleep';children.push(sid);dynamicIndex.set(sid,{type:'Feature',properties:{id:sid,label:`${p.name||'Bed'} sleep spot`,role:'sleep-spot',parentId:id,children:[],childFeatureIds:[],grandchildFeatureIds:[],descendantFeatureIds:[],placementId:p.id,itemId:p.itemId||'',sleepingImage:p.sleepingImage||null,interactions:['Enter','Lie','Nap','Knead'],dynamic:true,hierarchyDepth:3},geometry:{type:'Point',coordinates:[cx,cy]}})}
  const iid=id+'.interact';children.push(iid);dynamicIndex.set(iid,{type:'Feature',properties:{id:iid,label:`${p.name||'Object'} interaction spot`,role:'object-interaction',parentId:id,children:[],childFeatureIds:[],grandchildFeatureIds:[],descendantFeatureIds:[],placementId:p.id,itemId:p.itemId||'',sleepingImage:p.sleepingImage||null,interactions:p.affordances||['Inspect'],dynamic:true,hierarchyDepth:3},geometry:{type:'Point',coordinates:[cx,cy]}});
  base.properties.descendantFeatureIds=[...children];base.properties.grandchildFeatureIds=[];dynamicIndex.set(id,base);if(root)root.properties.dynamicChildFeatureIds.push(id);
 }
 return [...dynamicIndex.values()];
}
function bboxRing(r){const xs=r.map(p=>p[0]),ys=r.map(p=>p[1]);return {minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)}}
function mapGeometry(g,fn){if(!g)return g;const ng=clone(g);if(ng.type==='Point')ng.coordinates=fn(ng.coordinates);else if(ng.type==='LineString'||ng.type==='MultiPoint')ng.coordinates=ng.coordinates.map(fn);else if(ng.type==='Polygon'||ng.type==='MultiLineString')ng.coordinates=ng.coordinates.map(r=>r.map(fn));else if(ng.type==='MultiPolygon')ng.coordinates=ng.coordinates.map(poly=>poly.map(r=>r.map(fn)));return ng}
function updateBuiltinFurniture(objectKey,bounds){
 if(objectKey!=='sectional-couch'||!bounds||!geo||!baseStatic)return false;
 const baseCouch=(baseStatic.features||[]).find(f=>f.properties?.id==='onyx.couch');const ring=baseCouch?.geometry?.coordinates?.[0];if(!ring)return false;
 const bb=bboxRing(ring),bw=Math.max(1,bb.maxX-bb.minX),bh=Math.max(1,bb.maxY-bb.minY),nx=Number(bounds.x)||0,ny=Number(bounds.y)||0,nw=Math.max(1,Number(bounds.w)||bw),nh=Math.max(1,Number(bounds.h)||bh);
 const tx=([x,y])=>[nx+(x-bb.minX)*(nw/bw),ny+(y-bb.minY)*(nh/bh)];
 const baseById=new Map((baseStatic.features||[]).map(f=>[f.properties?.id,f]));
 for(const f of geo.features||[]){const id=f.properties?.id;if(!id?.startsWith('onyx.couch'))continue;const src=baseById.get(id);if(src)f.geometry=mapGeometry(src.geometry,tx)}
 reindex();return true;
}
addEventListener('message',e=>{const d=e.data||{};if(d.source!=='happy-home-room')return;if(d.type==='catalog'&&Array.isArray(d.furniture)){const c=d.furniture.find(x=>x.objectKey==='sectional-couch');if(c?.bounds)updateBuiltinFurniture('sectional-couch',c.bounds)}if(d.type==='furniture-transform-state'&&d.objectKey&&d.bounds)updateBuiltinFurniture(d.objectKey,d.bounds)});
const api={W,H,FAR_Y,NEAR_Y,FAR_PX,NEAR_PX,scaleAtY,spriteSizeAtY,floorBoundary,canWalkPoint,projectFloor,load,getZone,childrenOf,descendantsOf,zonesAt,nearestInteraction,setDynamicPlacements,updateBuiltinFurniture,allFeatures,get data(){return geo},get dynamicFeatures(){return [...dynamicIndex.values()]}};
window.OnyxRoomSpatial=Object.freeze(api);window.HappyHomeOnyxSpatial=window.OnyxRoomSpatial;load();
})();
