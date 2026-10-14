(()=>{
"use strict";
const W=1916,H=821,FAR_Y=522,NEAR_Y=821,FAR_SCALE=64/130;
const world=document.getElementById("world");
if(!world)return;
let layer=document.getElementById("runtimeAssetLayer");
if(!layer){layer=document.createElement("div");layer.id="runtimeAssetLayer";layer.setAttribute("aria-label","Happy Home placed inventory objects");world.appendChild(layer)}
Object.assign(layer.style,{position:"absolute",left:"0",top:"0",width:W+"px",height:H+"px",zIndex:"30",pointerEvents:"none",overflow:"visible"});
const style=document.createElement("style");
style.textContent=".hh-runtime-placement{isolation:isolate}.hh-runtime-placement[data-interactive=true]{cursor:pointer}.hh-runtime-placement[data-interactive=true]:focus-visible{outline:2px solid #242424;outline-offset:2px}.hh-runtime-placement object,.hh-runtime-placement img{pointer-events:none}.hh-runtime-overlays{position:absolute;inset:0;pointer-events:none;overflow:visible}.hh-food-fill{position:absolute;box-sizing:border-box;border:1px solid rgba(0,0,0,.42);box-shadow:inset 0 2px 4px rgba(255,255,255,.25),0 1px 2px rgba(0,0,0,.16);opacity:.92;overflow:hidden}.hh-food-fill[data-kind=food.wet]{background:radial-gradient(ellipse at 32% 28%,#dbdbdb 0,#929292 36%,#494949 100%)}.hh-food-fill[data-kind=food.dry]{background:radial-gradient(ellipse at 35% 25%,#fff 0,#b6b6b6 42%,#777 100%)}.hh-food-fill[data-kind^=treat.]{background:radial-gradient(ellipse at 35% 25%,#fff 0,#dbdbdb 60%,#777 100%)}.hh-food-label{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:800 8px/1 system-ui,sans-serif;color:#111;text-shadow:0 1px #fff9;white-space:nowrap}.hh-fountain-water{position:absolute;left:32%;top:44%;width:36%;height:25%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(219,219,219,.42),rgba(73,73,73,.12) 65%,transparent 72%);overflow:hidden}.hh-fountain-ripple{position:absolute;left:50%;top:50%;width:18%;height:30%;border:1px solid rgba(255,255,255,.9);border-radius:50%;transform:translate(-50%,-50%) scale(.5);animation:hh-water-ripple 2.1s ease-out infinite}.hh-fountain-ripple:nth-child(2){animation-delay:.7s}.hh-fountain-ripple:nth-child(3){animation-delay:1.4s}.hh-fountain-water[data-running=false]{opacity:.18}.hh-fountain-water[data-running=false] .hh-fountain-ripple{animation-play-state:paused;opacity:0}@keyframes hh-water-ripple{0%{transform:translate(-50%,-50%) scale(.5);opacity:.82}100%{transform:translate(-50%,-50%) scale(4.4);opacity:0}}@media(prefers-reduced-motion:reduce){.hh-fountain-ripple{animation:none!important;opacity:.25!important}}";
document.head.append(style);
let placements=[],editor=false,selectedId=null,drag=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const clone=v=>JSON.parse(JSON.stringify(v));
function floorBoundary(x){if(x<366)return 553+(522-553)*(x/366);if(x<=1554)return 522;return 522+(553-522)*((x-1554)/(1916-1554))}
function perspectiveScale(y){const t=clamp((y-FAR_Y)/(NEAR_Y-FAR_Y),0,1);return FAR_SCALE+(1-FAR_SCALE)*Math.pow(t,.85)}
function placementScale(p){return p.autoPerspective===false?1:perspectiveScale((p.y||0)+(p.h||100))}
function normalize(p){
  p={...p};p.x=Number(p.x)||0;p.y=Number(p.y)||0;p.w=clamp(Number(p.w)||130,40,900);p.h=clamp(Number(p.h)||130,40,700);
  p.rotation=Number(p.rotation)||0;p.opacity=clamp(Number(p.opacity??1),.1,1);p.autoPerspective=p.autoPerspective!==false;
  const s=placementScale(p),cx=p.x+p.w/2,minTop=floorBoundary(cx)-p.h*s;
  p.x=clamp(p.x,-p.w*.35,W-p.w*.65);p.y=clamp(Math.max(p.y,minTop),-p.h*.65,H-p.h*.25);
  return p;
}
function post(type,payload={}){try{parent.postMessage({source:"hh-inventory-room",type,...payload},"*")}catch(_){}}
function sourceBox(media,p){
  try{const svg=media.contentDocument?.documentElement,view=svg?.getAttribute("viewBox");if(view){const n=view.trim().split(/[ ,]+/).map(Number);if(n.length===4&&n[2]>0&&n[3]>0)return n}}
  catch(_){}
  const slots=p.slots||[],w=Math.max(470,...slots.map(s=>Number(s.cx||0)+Number(s.rx||0)+8)),h=Math.max(180,...slots.map(s=>Number(s.cy||0)+Number(s.ry||0)+8));
  return[0,0,w,h];
}
function contentRect(p,box){
  const scale=Math.min(p.w/box[2],p.h/box[3]),width=box[2]*scale,height=box[3]*scale;
  return{scale,left:(p.w-width)/2,top:(p.h-height)/2};
}
function renderBowlContents(overlays,p,media){
  const contents=p.contents||{},slots=p.slots||[];
  const box=sourceBox(media,p),rect=contentRect(p,box);
  for(const slot of slots){
    const food=contents[slot.id];if(!food)continue;
    const fill=document.createElement("span");fill.className="hh-food-fill";fill.dataset.kind=food.category||"food.dry";
    const cx=Number(slot.cx)||0,cy=Number(slot.cy)||0,rx=Math.max(1,Number(slot.rx)||10),ry=Math.max(1,Number(slot.ry)||8);
    Object.assign(fill.style,{left:(rect.left+(cx-rx)*rect.scale)+"px",top:(rect.top+(cy-ry)*rect.scale)+"px",width:(rx*2*rect.scale)+"px",height:(ry*2*rect.scale)+"px",borderRadius:slot.shape==="roundrect"?"38%":"50%"});
    fill.setAttribute("role","img");fill.setAttribute("aria-label",(food.itemName||"Food")+" filling "+(slot.label||"bowl compartment"));
    const label=document.createElement("span");label.className="hh-food-label";label.textContent=(food.category||"").startsWith("treat.")?"TREATS":(food.category==="food.wet"?"WET":"DRY");fill.append(label);overlays.append(fill);
  }
}
function renderFountain(overlays,p){
  const area=document.createElement("span");area.className="hh-fountain-water";area.dataset.running=String(p.fountainOn!==false);
  area.setAttribute("role","img");area.setAttribute("aria-label",p.fountainOn===false?"Fountain off":"Fountain on, water rippling");
  for(let i=0;i<3;i++){const ring=document.createElement("i");ring.className="hh-fountain-ripple";area.append(ring)}
  overlays.append(area);
}
function makeHandle(dir){
  const h=document.createElement("i");h.className="hh-runtime-handle hh-runtime-"+dir;h.dataset.handle=dir;
  Object.assign(h.style,{position:"absolute",width:"16px",height:"16px",background:"#fff",border:"2px solid #111",borderRadius:"3px",boxSizing:"border-box",zIndex:"4"});
  const pos={n:{left:"50%",top:"-8px"},s:{left:"50%",bottom:"-8px"},e:{right:"-8px",top:"50%"},w:{left:"-8px",top:"50%"},nw:{left:"-8px",top:"-8px"},ne:{right:"-8px",top:"-8px"},sw:{left:"-8px",bottom:"-8px"},se:{right:"-8px",bottom:"-8px"}}[dir];
  Object.assign(h.style,pos);if(["n","s"].includes(dir))h.style.transform="translateX(-50%)";if(["e","w"].includes(dir))h.style.transform="translateY(-50%)";return h;
}
function render(){
  layer.innerHTML="";
  for(const p0 of placements){
    const p=normalize(p0);Object.assign(p0,p);
    const interactive=["bowl","fountain","bed"].includes(p.interactiveType);
    const el=document.createElement("div");el.className="hh-runtime-placement";el.dataset.placementId=p.id;el.dataset.interactiveType=p.interactiveType||"object";el.dataset.interactive=String(interactive);el.title=interactive?(p.interactiveType==="fountain"?(p.name+(p.fountainOn===false?" · off":" · water rippling")):(p.name+" · click to use")):(p.name||"Placed item");
    el.setAttribute("role",interactive?"button":"img");el.setAttribute("aria-label",el.title);if(interactive)el.tabIndex=0;
    const s=placementScale(p);
    Object.assign(el.style,{position:"absolute",left:p.x+"px",top:p.y+"px",width:p.w+"px",height:p.h+"px",transformOrigin:"50% 100%",transform:"rotate("+p.rotation+"deg) scale("+s+")",opacity:String(p.opacity),pointerEvents:interactive||editor?"auto":"none",outline:selectedId===p.id&&editor?"2px solid #242424":"none",boxSizing:"border-box"});
    const media=document.createElement(p.renderer==="img"?"img":"object");
    if(media.tagName==="OBJECT"){media.type="image/svg+xml";media.data=p.image||""}else{media.src=p.image||"";media.alt=p.name||""}
    Object.assign(media.style,{width:"100%",height:"100%",display:"block",objectFit:"contain",pointerEvents:"none",userSelect:"none"});el.append(media);
    const overlays=document.createElement("span");overlays.className="hh-runtime-overlays";Object.assign(overlays.style,{position:"absolute",inset:"0",pointerEvents:"none"});
    const paint=()=>{overlays.innerHTML="";if(p.interactiveType==="bowl")renderBowlContents(overlays,p,media);if(p.interactiveType==="fountain")renderFountain(overlays,p)};
    if(media.tagName==="OBJECT")media.addEventListener("load",paint,{once:true});
    el.append(overlays);setTimeout(paint,0);
    if(editor&&selectedId===p.id){for(const dir of ["n","s","e","w","nw","ne","sw","se"])el.append(makeHandle(dir))}
    el.addEventListener("pointerdown",pointerDown);
    el.addEventListener("click",e=>{if(editor)return;if(interactive){post("activate",{id:p.id,interactiveType:p.interactiveType});e.preventDefault();e.stopPropagation()}});
    el.addEventListener("keydown",e=>{if(editor||!interactive||!(e.key==="Enter"||e.key===" "))return;e.preventDefault();post("activate",{id:p.id,interactiveType:p.interactiveType})});
    layer.append(el);
  }
}
function stagePoint(ev){const r=world.getBoundingClientRect(),sx=W/r.width,sy=H/r.height;return{x:(ev.clientX-r.left)*sx,y:(ev.clientY-r.top)*sy}}
function pointerDown(e){
  if(!editor)return;
  const el=e.currentTarget,id=el.dataset.placementId,p=placements.find(x=>x.id===id);if(!p)return;
  selectedId=id;const pt=stagePoint(e),handle=e.target.closest?.("[data-handle]")?.dataset.handle||"move";
  drag={id,handle,start:pt,before:clone(p)};el.setPointerCapture?.(e.pointerId);render();post("selected",{placement:clone(p)});
  e.preventDefault();e.stopPropagation();
}
function pointerMove(e){
  if(!drag)return;const p=placements.find(x=>x.id===drag.id);if(!p)return;const pt=stagePoint(e),dx=pt.x-drag.start.x,dy=pt.y-drag.start.y,b=drag.before;
  if(drag.handle==="move"){p.x=b.x+dx;p.y=b.y+dy}
  else{let x=b.x,y=b.y,w=b.w,h=b.h;if(drag.handle.includes("e"))w=b.w+dx;if(drag.handle.includes("s"))h=b.h+dy;if(drag.handle.includes("w")){x=b.x+dx;w=b.w-dx}if(drag.handle.includes("n")){y=b.y+dy;h=b.h-dy}p.x=x;p.y=y;p.w=Math.max(40,w);p.h=Math.max(40,h)}
  Object.assign(p,normalize(p));render();post("placement-preview",{placement:clone(p)});
}
function pointerUp(){if(!drag)return;const p=placements.find(x=>x.id===drag.id);drag=null;if(p)post("placement-updated",{placement:clone(p)})}
addEventListener("pointermove",pointerMove,true);addEventListener("pointerup",pointerUp,true);addEventListener("pointercancel",pointerUp,true);
addEventListener("message",e=>{const d=e.data||{};if(d.source!=="hh-inventory-parent")return;
  if(d.type==="sync"){placements=Array.isArray(d.placements)?clone(d.placements):[];if(selectedId&&!placements.some(p=>p.id===selectedId))selectedId=null;render();return}
  if(d.type==="editor"){editor=!!d.enabled;selectedId=d.selectedId||selectedId;render();return}
  if(d.type==="select"){selectedId=d.id||null;render();return}
  if(d.type==="upsert"){const p=normalize(clone(d.placement||{}));const i=placements.findIndex(x=>x.id===p.id);if(i>=0)placements[i]=p;else placements.push(p);selectedId=p.id;render();return}
  if(d.type==="remove"){placements=placements.filter(p=>p.id!==d.id);if(selectedId===d.id)selectedId=null;render();return}
});
post("ready",{width:W,height:H});
window.HappyHomePlacedObjects=Object.freeze({getPlacements:()=>clone(placements),getSelected:()=>selectedId,perspectiveScale,floorBoundary});
})();
