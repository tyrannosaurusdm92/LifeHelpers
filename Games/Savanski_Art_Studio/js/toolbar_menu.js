/* ===== Original Savanski 3D Editor toolbar/menu JavaScript, root-scoped for coexistence ===== */
(()=>{"use strict";
const root=document.querySelector("#savanski-3d-toolbar");
if(!root)return;
const q=(s,c=root)=>c.querySelector(s), qa=(s,c=root)=>[...c.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const toolbar=q(".sav-toolbar");
function panel(key){return q(`.sav-panel[data-panel="${key}"]`)}
function tool(key){return q(`.sav-tool[data-tool="${key}"]`)}
function close(key){const p=panel(key);if(p&&!p.classList.contains("pinned"))p.classList.remove("open");tool(key)?.setAttribute("aria-pressed","false")}
function position(key,btn){const p=panel(key);if(!p||p.classList.contains("pinned"))return;const rr=toolbar.getBoundingClientRect(),br=(btn||tool(key)).getBoundingClientRect();const w=Math.min(parseFloat(getComputedStyle(p).getPropertyValue("--panel-w"))||420,innerWidth-16);p.style.setProperty("--panel-x",clamp(br.left-rr.left,8,Math.max(8,rr.width-w-8))+"px")}
function open(key,btn){const p=panel(key);if(!p)return;qa(".sav-panel").forEach(x=>{if(x!==p&&!x.classList.contains("pinned"))x.classList.remove("open")});qa(".sav-tool").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.tool===key)));position(key,btn);p.classList.add("open")}
qa(".sav-tool").forEach(b=>b.addEventListener("click",()=>panel(b.dataset.tool)?.classList.contains("open")&&!panel(b.dataset.tool)?.classList.contains("pinned")?close(b.dataset.tool):open(b.dataset.tool,b)));
qa("[data-close]").forEach(b=>b.addEventListener("click",()=>close(b.dataset.close)));
qa("[data-pin]").forEach(b=>b.addEventListener("click",()=>{const p=panel(b.dataset.pin);if(!p)return;const pin=!p.classList.contains("pinned");if(pin){const r=p.getBoundingClientRect();p.style.setProperty("--pin-x",clamp(r.left,6,innerWidth-r.width-6)+"px");p.style.setProperty("--pin-y",clamp(r.top,6,innerHeight-60)+"px")}p.classList.toggle("pinned",pin);p.classList.add("open")}));
qa(".sav-panel-head").forEach(h=>h.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;const p=h.closest(".sav-panel");if(!p)return;if(!p.classList.contains("pinned")){const r=p.getBoundingClientRect();p.classList.add("pinned","open");p.style.setProperty("--pin-x",r.left+"px");p.style.setProperty("--pin-y",r.top+"px")}const r=p.getBoundingClientRect(),sx=e.clientX,sy=e.clientY;h.setPointerCapture?.(e.pointerId);const mv=ev=>{p.style.setProperty("--pin-x",clamp(r.left+ev.clientX-sx,6,innerWidth-r.width-6)+"px");p.style.setProperty("--pin-y",clamp(r.top+ev.clientY-sy,6,innerHeight-50)+"px")};const up=()=>{h.removeEventListener("pointermove",mv);h.removeEventListener("pointerup",up);h.removeEventListener("pointercancel",up)};h.addEventListener("pointermove",mv);h.addEventListener("pointerup",up);h.addEventListener("pointercancel",up)}));
qa("[data-action]").forEach(b=>b.addEventListener("click",()=>{qa(".sav-btn.active").forEach(x=>{if(x.closest(".sav-section")===b.closest(".sav-section"))x.classList.remove("active")});b.classList.add("active");window.dispatchEvent(new CustomEvent("savanski:tool",{detail:{action:b.dataset.action,label:b.textContent.trim()}}))}));
qa("[data-control]").forEach(el=>el.addEventListener("input",()=>{const out=el.closest(".sav-slider")?.querySelector("output");if(out)out.textContent=el.value+(el.dataset.suffix||"");window.dispatchEvent(new CustomEvent("savanski:control",{detail:{control:el.dataset.control,value:el.value}}))}));
const hub=q(".sav-hub"),orb=q(".sav-hub-orb");
if(hub&&orb){let dragged=false;orb.addEventListener("click",()=>{if(dragged){dragged=false;return}hub.classList.toggle("open")});q(".sav-hub-close")?.addEventListener("click",()=>hub.classList.remove("open"));orb.addEventListener("pointerdown",e=>{const r=hub.getBoundingClientRect(),sx=e.clientX,sy=e.clientY;let moved=false;orb.setPointerCapture?.(e.pointerId);const mv=ev=>{if(Math.hypot(ev.clientX-sx,ev.clientY-sy)>4)moved=true;if(!moved)return;hub.style.left=clamp(r.left+ev.clientX-sx,4,innerWidth-82)+"px";hub.style.top=clamp(r.top+ev.clientY-sy,4,innerHeight-82)+"px";hub.style.bottom="auto"};const up=()=>{orb.removeEventListener("pointermove",mv);orb.removeEventListener("pointerup",up);orb.removeEventListener("pointercancel",up);dragged=moved};orb.addEventListener("pointermove",mv);orb.addEventListener("pointerup",up);orb.addEventListener("pointercancel",up)})}
qa("[data-open]").forEach(b=>b.addEventListener("click",()=>{open(b.dataset.open,tool(b.dataset.open));hub?.classList.remove("open")}));
addEventListener("resize",()=>qa(".sav-panel.open:not(.pinned)").forEach(p=>position(p.dataset.panel,tool(p.dataset.panel))));
})();

/* Multi-direction resize system. It follows the supplied bottom-drag
   pattern: ResizeObserver is the source of truth, while pointer handles
   extend the interaction to every edge and corner. */
(()=>{"use strict";
const root=document.querySelector("#savanski-3d-toolbar");
if(!root||!("ResizeObserver" in window))return;
const TARGETS=".sav-panel,.sav-hub-panel,.font-menu";
const EDGES=["n","s","e","w","ne","nw","se","sw"];
const SCALE_MIN=10/18;
const SCALE_MAX=40/18;
const state=new WeakMap();
const wired=new WeakSet();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const px=n=>`${Math.round(n*100)/100}px`;

function sized(base,scale,min=2,max=160){return clamp(base*scale,min,max)}
function setScaledVars(el,scale){
  const v=(name,base,min,max)=>el.style.setProperty(name,px(sized(base,scale,min,max)));
  v("--sav-f10",10,10,40);v("--sav-f11",11,10,40);v("--sav-f12",12,10,40);v("--sav-f15",15,10,40);
  v("--sav-icon-size",18,10,40);v("--sav-swatch-size",18,10,40);
  v("--sav-gap3",3,2,8);v("--sav-gap4",4,2,10);v("--sav-gap5",5,3,12);v("--sav-gap7",7,4,16);v("--sav-gap8",8,4,18);
  v("--sav-pad5",5,3,12);v("--sav-pad6",6,3,14);v("--sav-pad7",7,4,16);v("--sav-pad8",8,4,18);v("--sav-pad9",9,5,20);v("--sav-pad10",10,6,22);
  v("--sav-radius5",5,3,11);v("--sav-radius6",6,3,13);v("--sav-radius7",7,4,15);v("--sav-radius8",8,4,18);v("--sav-radius10",10,5,22);v("--sav-radius11",11,6,24);
  v("--sav-head-h",39,31,87);v("--sav-action-size",29,24,64);v("--sav-button-h",35,27,78);v("--sav-input-h",33,27,73);v("--sav-output-h",26,22,58);v("--sav-option-h",34,27,76);
  v("--sav-preset-min",105,70,230);v("--sav-slider-label",80,60,176);v("--sav-slider-track",120,82,264);v("--sav-slider-output",58,48,128);v("--sav-font-options-h",280,150,620);
  el.style.setProperty("--sav-ui-scale",String(Math.round(scale*1000)/1000));
}

function originalCols(grid){
  for(let n=6;n>=2;n--)if(grid.classList.contains(`cols-${n}`))return n;
  if(grid.classList.contains("sav-hub-grid"))return 3;
  if(grid.classList.contains("sav-subgrid"))return 2;
  return 0;
}
function reflowGrids(el,scale){
  const gap=sized(5,scale,3,12);
  el.querySelectorAll(".sav-grid,.sav-hub-grid,.sav-subgrid").forEach(grid=>{
    const maxCols=originalCols(grid);if(!maxCols)return;
    const width=grid.clientWidth;if(!width)return;
    const baseMin=maxCols>=5?64:maxCols===4?78:maxCols===3?96:128;
    const wanted=Math.max(1,Math.min(maxCols,Math.floor((width+gap)/(sized(baseMin,scale,58,280)+gap))));
    grid.style.gridTemplateColumns=`repeat(${wanted},minmax(0,1fr))`;
  });
}
function applyScale(el){
  const s=state.get(el);if(!s||!s.baseW||!s.baseH)return;
  const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return;
  const wr=r.width/s.baseW,hr=r.height/s.baseH;
  const scale=clamp(Math.sqrt(Math.max(.01,wr)*Math.max(.01,hr)),SCALE_MIN,SCALE_MAX);
  setScaledVars(el,scale);
  requestAnimationFrame(()=>reflowGrids(el,scale));
  const detail={width:r.width,height:r.height,scale,defaultWidth:s.baseW,defaultHeight:s.baseH};
  el.dispatchEvent(new CustomEvent("bottomdragresize",{bubbles:true,detail}));
  el.dispatchEvent(new CustomEvent("savanski:uiresize",{bubbles:true,detail}));
}
function captureBaseline(el){
  let s=state.get(el);if(!s){s={};state.set(el,s)}
  if(s.baseW&&s.baseH)return true;
  const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;
  s.baseW=r.width;s.baseH=r.height;
  el.dataset.savDefaultWidth=String(Math.round(r.width*100)/100);
  el.dataset.savDefaultHeight=String(Math.round(r.height*100)/100);
  setScaledVars(el,1);
  requestAnimationFrame(()=>reflowGrids(el,1));
  return true;
}

function wrapScrollSurface(el){
  if(!(el.matches(".sav-hub-panel,.font-menu"))||el.querySelector(":scope > .sav-resize-scroll"))return;
  const wrap=document.createElement("div");wrap.className="sav-resize-scroll";
  [...el.children].forEach(child=>wrap.appendChild(child));
  el.appendChild(wrap);
}

function viewportRectFor(el){
  if(el.classList.contains("sav-panel"))return {mode:"fixed",parent:null,parentRect:{left:0,top:0}};
  const parent=el.offsetParent||el.parentElement;
  return {mode:"absolute",parent,parentRect:parent?.getBoundingClientRect?.()||{left:0,top:0}};
}
function commitRect(el,mode,parentRect,x,y,w,h){
  el.style.width=px(w);el.style.height=px(h);
  el.style.maxWidth="none";el.style.maxHeight="none";
  if(mode==="fixed"){
    el.style.setProperty("--pin-x",px(x));
    el.style.setProperty("--pin-y",px(y));
  }else{
    el.style.left=px(x-parentRect.left);
    el.style.top=px(y-parentRect.top);
    el.style.right="auto";el.style.bottom="auto";
  }
}
function normalizeForResize(el){
  const r=el.getBoundingClientRect();
  if(el.classList.contains("sav-panel")){
    el.classList.add("pinned","open","sav-user-sized");
    el.style.setProperty("--pin-x",px(r.left));
    el.style.setProperty("--pin-y",px(r.top));
  }else el.classList.add("sav-user-sized");
  const pos=viewportRectFor(el);
  commitRect(el,pos.mode,pos.parentRect,r.left,r.top,r.width,r.height);
  return {r,pos};
}
function resetSize(el){
  if(!captureBaseline(el))return;
  const s=state.get(el),r=el.getBoundingClientRect(),pos=viewportRectFor(el);
  const w=Math.min(s.baseW,Math.max(120,innerWidth-8));
  const h=Math.min(s.baseH,Math.max(90,innerHeight-8));
  let x=clamp(r.left,4,Math.max(4,innerWidth-w-4));
  let y=clamp(r.top,4,Math.max(4,innerHeight-h-4));
  el.classList.add("sav-user-sized");
  if(el.classList.contains("sav-panel"))el.classList.add("pinned","open");
  commitRect(el,pos.mode,pos.parentRect,x,y,w,h);
  setScaledVars(el,1);requestAnimationFrame(()=>reflowGrids(el,1));
}
function beginResize(e,el,edge){
  if(e.button!==undefined&&e.button!==0)return;
  e.preventDefault();e.stopPropagation();
  if(!captureBaseline(el))return;
  const {r,pos}=normalizeForResize(el),s=state.get(el);
  const sx=e.clientX,sy=e.clientY;
  const minW=Math.min(Math.max(el.matches(".font-menu")?160:180,Math.min(s.baseW*.42,260)),Math.max(100,innerWidth-8));
  const minH=Math.min(Math.max(el.matches(".font-menu")?120:110,Math.min(s.baseH*.30,220)),Math.max(80,innerHeight-8));
  el.classList.add("sav-resizing");
  const handle=e.currentTarget;handle.setPointerCapture?.(e.pointerId);
  const move=ev=>{
    const dx=ev.clientX-sx,dy=ev.clientY-sy;
    let x=r.left,y=r.top,w=r.width,h=r.height;
    if(edge.includes("e"))w=clamp(r.width+dx,minW,Math.max(minW,innerWidth-r.left-4));
    if(edge.includes("s"))h=clamp(r.height+dy,minH,Math.max(minH,innerHeight-r.top-4));
    if(edge.includes("w")){
      const nx=clamp(r.left+dx,4,r.right-minW);w=r.right-nx;x=nx;
    }
    if(edge.includes("n")){
      const ny=clamp(r.top+dy,4,r.bottom-minH);h=r.bottom-ny;y=ny;
    }
    if(x+w>innerWidth-4)w=Math.max(minW,innerWidth-4-x);
    if(y+h>innerHeight-4)h=Math.max(minH,innerHeight-4-y);
    commitRect(el,pos.mode,pos.parentRect,x,y,w,h);
  };
  const end=()=>{
    el.classList.remove("sav-resizing");
    handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",end);handle.removeEventListener("pointercancel",end);
  };
  handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",end);handle.addEventListener("pointercancel",end);
}
function addHandles(el){
  EDGES.forEach(edge=>{
    if(el.querySelector(`:scope > .sav-resize-handle[data-edge="${edge}"]`))return;
    const h=document.createElement("span");h.className="sav-resize-handle";h.dataset.edge=edge;
    h.setAttribute("role","separator");h.setAttribute("aria-label",`Resize ${edge} edge`);h.title="Drag to resize · double-click to restore default size";
    h.addEventListener("pointerdown",e=>beginResize(e,el,edge));
    h.addEventListener("dblclick",e=>{e.preventDefault();e.stopPropagation();resetSize(el)});
    el.appendChild(h);
  });
}
function wire(el){
  if(wired.has(el))return;wired.add(el);
  wrapScrollSurface(el);el.classList.add("sav-resizable");addHandles(el);observer.observe(el);
  captureBaseline(el);
}
const observer=new ResizeObserver(entries=>entries.forEach(entry=>{
  const el=entry.target;if(!captureBaseline(el))return;applyScale(el);
}));
root.querySelectorAll(TARGETS).forEach(wire);
const mo=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  if(node.matches?.(TARGETS))wire(node);
  node.querySelectorAll?.(TARGETS).forEach(wire);
})));
mo.observe(root,{subtree:true,childList:true});
addEventListener("resize",()=>root.querySelectorAll(`${TARGETS}.sav-user-sized`).forEach(el=>{
  const r=el.getBoundingClientRect(),pos=viewportRectFor(el);
  const w=Math.min(r.width,Math.max(100,innerWidth-8)),h=Math.min(r.height,Math.max(80,innerHeight-8));
  const x=clamp(r.left,4,Math.max(4,innerWidth-w-4)),y=clamp(r.top,4,Math.max(4,innerHeight-h-4));
  commitRect(el,pos.mode,pos.parentRect,x,y,w,h);
}));
})();


(()=>{"use strict";
const BACKEND="https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec";
const fallback=["ABeeZee","Abril Fatface","Alegreya","Anton","Archivo","Arimo","Arvo","Barlow","Bebas Neue","Bitter","Cabin","Cairo","Caveat","Cinzel","Comfortaa","Cormorant Garamond","Crimson Text","Dancing Script","DM Sans","EB Garamond","Exo 2","Fira Sans","Fredoka","IBM Plex Mono","IBM Plex Sans","Inter","Josefin Sans","Karla","Lato","Libre Baskerville","Lobster","Lora","Merriweather","Montserrat","Noto Sans","Noto Serif","Nunito","Open Sans","Oswald","Pacifico","Playfair Display","Poppins","Quicksand","Raleway","Roboto","Roboto Condensed","Roboto Mono","Rubik","Source Sans 3","Space Grotesk","Ubuntu","Work Sans"];
const loaded=new Map();
function cssUrl(f){return "https://fonts.googleapis.com/css2?family="+encodeURIComponent(f).replace(/%20/g,"+")+"&display=swap"}
function loadFont(f){if(!f||["Arial","Georgia","Times New Roman","Verdana","Trebuchet MS","Courier New","Impact"].includes(f))return Promise.resolve();if(loaded.has(f))return loaded.get(f);const p=new Promise(res=>{const l=document.createElement("link");l.rel="stylesheet";l.href=cssUrl(f);l.onload=()=>document.fonts?.load?.(`16px "${f}"`).finally(res)||res();l.onerror=res;document.head.appendChild(l);setTimeout(res,5000)});loaded.set(f,p);return p}
function jsonp(){return new Promise((resolve,reject)=>{const cb="__savFont"+Date.now()+Math.random().toString(36).slice(2),s=document.createElement("script"),u=new URL(BACKEND);u.searchParams.set("action","studio.fonts.list");u.searchParams.set("namespace","ourspace");u.searchParams.set("callback",cb);let t;window[cb]=d=>{clearTimeout(t);delete window[cb];s.remove();resolve(d)};s.onerror=()=>{clearTimeout(t);delete window[cb];s.remove();reject()};t=setTimeout(()=>{delete window[cb];s.remove();reject()},12000);s.src=u;s.async=true;document.head.appendChild(s)})}
document.querySelector("#savanski-3d-toolbar").querySelectorAll("[data-font-picker]").forEach(picker=>{const btn=picker.querySelector("[data-font-button]"),menu=picker.querySelector("[data-font-menu]"),search=picker.querySelector("[data-font-search]"),box=picker.querySelector("[data-font-options]"),sel=picker.querySelector("[data-font-select]");let families=[],ready=false,observer=null;
function render(){const term=(search?.value||"").trim().toLowerCase();const list=families.filter(f=>!term||f.toLowerCase().includes(term));box.innerHTML="";const frag=document.createDocumentFragment();list.forEach(f=>{const b=document.createElement("button");b.type="button";b.className="font-option";b.textContent=f;b.dataset.family=f;b.style.fontFamily=`"${f}",sans-serif`;b.addEventListener("click",async()=>{await loadFont(f);btn.textContent=f;btn.style.fontFamily=`"${f}",sans-serif`;let o=[...sel.options].find(x=>x.value===f);if(!o){o=document.createElement("option");o.value=o.textContent=f;sel.appendChild(o)}sel.value=f;sel.dispatchEvent(new Event("change",{bubbles:true}));menu.hidden=true});frag.appendChild(b)});box.appendChild(frag);observer?.disconnect?.();if("IntersectionObserver"in window){observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){loadFont(e.target.dataset.family);observer.unobserve(e.target)}}),{root:box,rootMargin:"120px"});box.querySelectorAll(".font-option").forEach(x=>observer.observe(x))}}
async function catalog(){if(ready)return;families=fallback.slice();families=[...new Set(families)].sort((a,b)=>a.localeCompare(b));ready=true;render()}
btn.addEventListener("click",async()=>{await catalog();menu.hidden=!menu.hidden;if(!menu.hidden)search?.focus()});search?.addEventListener("input",render);document.addEventListener("pointerdown",e=>{if(!picker.contains(e.target))menu.hidden=true});sel?.addEventListener("change",()=>{btn.textContent=sel.value;btn.style.fontFamily=`"${sel.value}",sans-serif`})});
window.SavanskiGoogleFonts={backend:BACKEND,loadFont};
})();

(()=>{"use strict";const s=document.querySelector('#savanski-3d-toolbar [data-control="material-search"]');if(!s)return;const box=s.closest(".sav-section")?.querySelector(".sav-preset-list");s.addEventListener("input",()=>{const q=s.value.trim().toLowerCase();box?.querySelectorAll("button").forEach(b=>b.hidden=!!q&&!b.textContent.toLowerCase().includes(q))})})();

/* ===== Original Savanski Art Studio toolbar/menu JavaScript, root-scoped for coexistence ===== */
(()=>{"use strict";
const root=document.querySelector("#savanski-art-toolbar");
if(!root)return;
const q=(s,c=root)=>c.querySelector(s), qa=(s,c=root)=>[...c.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const toolbar=q(".sav-toolbar");
function panel(key){return q(`.sav-panel[data-panel="${key}"]`)}
function tool(key){return q(`.sav-tool[data-tool="${key}"]`)}
function close(key){const p=panel(key);if(p&&!p.classList.contains("pinned"))p.classList.remove("open");tool(key)?.setAttribute("aria-pressed","false")}
function position(key,btn){const p=panel(key);if(!p||p.classList.contains("pinned"))return;const rr=toolbar.getBoundingClientRect(),br=(btn||tool(key)).getBoundingClientRect();const w=Math.min(parseFloat(getComputedStyle(p).getPropertyValue("--panel-w"))||420,innerWidth-16);p.style.setProperty("--panel-x",clamp(br.left-rr.left,8,Math.max(8,rr.width-w-8))+"px")}
function open(key,btn){const p=panel(key);if(!p)return;qa(".sav-panel").forEach(x=>{if(x!==p&&!x.classList.contains("pinned"))x.classList.remove("open")});qa(".sav-tool").forEach(x=>x.setAttribute("aria-pressed",String(x.dataset.tool===key)));position(key,btn);p.classList.add("open")}
qa(".sav-tool").forEach(b=>b.addEventListener("click",()=>panel(b.dataset.tool)?.classList.contains("open")&&!panel(b.dataset.tool)?.classList.contains("pinned")?close(b.dataset.tool):open(b.dataset.tool,b)));
qa("[data-close]").forEach(b=>b.addEventListener("click",()=>close(b.dataset.close)));
qa("[data-pin]").forEach(b=>b.addEventListener("click",()=>{const p=panel(b.dataset.pin);if(!p)return;const pin=!p.classList.contains("pinned");if(pin){const r=p.getBoundingClientRect();p.style.setProperty("--pin-x",clamp(r.left,6,innerWidth-r.width-6)+"px");p.style.setProperty("--pin-y",clamp(r.top,6,innerHeight-60)+"px")}p.classList.toggle("pinned",pin);p.classList.add("open")}));
qa(".sav-panel-head").forEach(h=>h.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;const p=h.closest(".sav-panel");if(!p)return;if(!p.classList.contains("pinned")){const r=p.getBoundingClientRect();p.classList.add("pinned","open");p.style.setProperty("--pin-x",r.left+"px");p.style.setProperty("--pin-y",r.top+"px")}const r=p.getBoundingClientRect(),sx=e.clientX,sy=e.clientY;h.setPointerCapture?.(e.pointerId);const mv=ev=>{p.style.setProperty("--pin-x",clamp(r.left+ev.clientX-sx,6,innerWidth-r.width-6)+"px");p.style.setProperty("--pin-y",clamp(r.top+ev.clientY-sy,6,innerHeight-50)+"px")};const up=()=>{h.removeEventListener("pointermove",mv);h.removeEventListener("pointerup",up);h.removeEventListener("pointercancel",up)};h.addEventListener("pointermove",mv);h.addEventListener("pointerup",up);h.addEventListener("pointercancel",up)}));
qa("[data-action]").forEach(b=>b.addEventListener("click",()=>{qa(".sav-btn.active").forEach(x=>{if(x.closest(".sav-section")===b.closest(".sav-section"))x.classList.remove("active")});b.classList.add("active");window.dispatchEvent(new CustomEvent("savanski:tool",{detail:{action:b.dataset.action,label:b.textContent.trim()}}))}));
qa("[data-control]").forEach(el=>el.addEventListener("input",()=>{const out=el.closest(".sav-slider")?.querySelector("output");if(out)out.textContent=el.value+(el.dataset.suffix||"");window.dispatchEvent(new CustomEvent("savanski:control",{detail:{control:el.dataset.control,value:el.value}}))}));
const hub=q(".sav-hub"),orb=q(".sav-hub-orb");
if(hub&&orb){let dragged=false;orb.addEventListener("click",()=>{if(dragged){dragged=false;return}hub.classList.toggle("open")});q(".sav-hub-close")?.addEventListener("click",()=>hub.classList.remove("open"));orb.addEventListener("pointerdown",e=>{const r=hub.getBoundingClientRect(),sx=e.clientX,sy=e.clientY;let moved=false;orb.setPointerCapture?.(e.pointerId);const mv=ev=>{if(Math.hypot(ev.clientX-sx,ev.clientY-sy)>4)moved=true;if(!moved)return;hub.style.left=clamp(r.left+ev.clientX-sx,4,innerWidth-82)+"px";hub.style.top=clamp(r.top+ev.clientY-sy,4,innerHeight-82)+"px";hub.style.bottom="auto"};const up=()=>{orb.removeEventListener("pointermove",mv);orb.removeEventListener("pointerup",up);orb.removeEventListener("pointercancel",up);dragged=moved};orb.addEventListener("pointermove",mv);orb.addEventListener("pointerup",up);orb.addEventListener("pointercancel",up)})}
qa("[data-open]").forEach(b=>b.addEventListener("click",()=>{open(b.dataset.open,tool(b.dataset.open));hub?.classList.remove("open")}));
addEventListener("resize",()=>qa(".sav-panel.open:not(.pinned)").forEach(p=>position(p.dataset.panel,tool(p.dataset.panel))));
})();

/* Multi-direction resize system. It follows the supplied bottom-drag
   pattern: ResizeObserver is the source of truth, while pointer handles
   extend the interaction to every edge and corner. */
(()=>{"use strict";
const root=document.querySelector("#savanski-art-toolbar");
if(!root||!("ResizeObserver" in window))return;
const TARGETS=".sav-panel,.sav-hub-panel,.font-menu";
const EDGES=["n","s","e","w","ne","nw","se","sw"];
const SCALE_MIN=10/18;
const SCALE_MAX=40/18;
const state=new WeakMap();
const wired=new WeakSet();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const px=n=>`${Math.round(n*100)/100}px`;

function sized(base,scale,min=2,max=160){return clamp(base*scale,min,max)}
function setScaledVars(el,scale){
  const v=(name,base,min,max)=>el.style.setProperty(name,px(sized(base,scale,min,max)));
  v("--sav-f10",10,10,40);v("--sav-f11",11,10,40);v("--sav-f12",12,10,40);v("--sav-f15",15,10,40);
  v("--sav-icon-size",18,10,40);v("--sav-swatch-size",18,10,40);
  v("--sav-gap3",3,2,8);v("--sav-gap4",4,2,10);v("--sav-gap5",5,3,12);v("--sav-gap7",7,4,16);v("--sav-gap8",8,4,18);
  v("--sav-pad5",5,3,12);v("--sav-pad6",6,3,14);v("--sav-pad7",7,4,16);v("--sav-pad8",8,4,18);v("--sav-pad9",9,5,20);v("--sav-pad10",10,6,22);
  v("--sav-radius5",5,3,11);v("--sav-radius6",6,3,13);v("--sav-radius7",7,4,15);v("--sav-radius8",8,4,18);v("--sav-radius10",10,5,22);v("--sav-radius11",11,6,24);
  v("--sav-head-h",39,31,87);v("--sav-action-size",29,24,64);v("--sav-button-h",35,27,78);v("--sav-input-h",33,27,73);v("--sav-output-h",26,22,58);v("--sav-option-h",34,27,76);
  v("--sav-preset-min",105,70,230);v("--sav-slider-label",80,60,176);v("--sav-slider-track",120,82,264);v("--sav-slider-output",58,48,128);v("--sav-font-options-h",280,150,620);
  el.style.setProperty("--sav-ui-scale",String(Math.round(scale*1000)/1000));
}

function originalCols(grid){
  for(let n=6;n>=2;n--)if(grid.classList.contains(`cols-${n}`))return n;
  if(grid.classList.contains("sav-hub-grid"))return 3;
  if(grid.classList.contains("sav-subgrid"))return 2;
  return 0;
}
function reflowGrids(el,scale){
  const gap=sized(5,scale,3,12);
  el.querySelectorAll(".sav-grid,.sav-hub-grid,.sav-subgrid").forEach(grid=>{
    const maxCols=originalCols(grid);if(!maxCols)return;
    const width=grid.clientWidth;if(!width)return;
    const baseMin=maxCols>=5?64:maxCols===4?78:maxCols===3?96:128;
    const wanted=Math.max(1,Math.min(maxCols,Math.floor((width+gap)/(sized(baseMin,scale,58,280)+gap))));
    grid.style.gridTemplateColumns=`repeat(${wanted},minmax(0,1fr))`;
  });
}
function applyScale(el){
  const s=state.get(el);if(!s||!s.baseW||!s.baseH)return;
  const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return;
  const wr=r.width/s.baseW,hr=r.height/s.baseH;
  const scale=clamp(Math.sqrt(Math.max(.01,wr)*Math.max(.01,hr)),SCALE_MIN,SCALE_MAX);
  setScaledVars(el,scale);
  requestAnimationFrame(()=>reflowGrids(el,scale));
  const detail={width:r.width,height:r.height,scale,defaultWidth:s.baseW,defaultHeight:s.baseH};
  el.dispatchEvent(new CustomEvent("bottomdragresize",{bubbles:true,detail}));
  el.dispatchEvent(new CustomEvent("savanski:uiresize",{bubbles:true,detail}));
}
function captureBaseline(el){
  let s=state.get(el);if(!s){s={};state.set(el,s)}
  if(s.baseW&&s.baseH)return true;
  const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;
  s.baseW=r.width;s.baseH=r.height;
  el.dataset.savDefaultWidth=String(Math.round(r.width*100)/100);
  el.dataset.savDefaultHeight=String(Math.round(r.height*100)/100);
  setScaledVars(el,1);
  requestAnimationFrame(()=>reflowGrids(el,1));
  return true;
}

function wrapScrollSurface(el){
  if(!(el.matches(".sav-hub-panel,.font-menu"))||el.querySelector(":scope > .sav-resize-scroll"))return;
  const wrap=document.createElement("div");wrap.className="sav-resize-scroll";
  [...el.children].forEach(child=>wrap.appendChild(child));
  el.appendChild(wrap);
}

function viewportRectFor(el){
  if(el.classList.contains("sav-panel"))return {mode:"fixed",parent:null,parentRect:{left:0,top:0}};
  const parent=el.offsetParent||el.parentElement;
  return {mode:"absolute",parent,parentRect:parent?.getBoundingClientRect?.()||{left:0,top:0}};
}
function commitRect(el,mode,parentRect,x,y,w,h){
  el.style.width=px(w);el.style.height=px(h);
  el.style.maxWidth="none";el.style.maxHeight="none";
  if(mode==="fixed"){
    el.style.setProperty("--pin-x",px(x));
    el.style.setProperty("--pin-y",px(y));
  }else{
    el.style.left=px(x-parentRect.left);
    el.style.top=px(y-parentRect.top);
    el.style.right="auto";el.style.bottom="auto";
  }
}
function normalizeForResize(el){
  const r=el.getBoundingClientRect();
  if(el.classList.contains("sav-panel")){
    el.classList.add("pinned","open","sav-user-sized");
    el.style.setProperty("--pin-x",px(r.left));
    el.style.setProperty("--pin-y",px(r.top));
  }else el.classList.add("sav-user-sized");
  const pos=viewportRectFor(el);
  commitRect(el,pos.mode,pos.parentRect,r.left,r.top,r.width,r.height);
  return {r,pos};
}
function resetSize(el){
  if(!captureBaseline(el))return;
  const s=state.get(el),r=el.getBoundingClientRect(),pos=viewportRectFor(el);
  const w=Math.min(s.baseW,Math.max(120,innerWidth-8));
  const h=Math.min(s.baseH,Math.max(90,innerHeight-8));
  let x=clamp(r.left,4,Math.max(4,innerWidth-w-4));
  let y=clamp(r.top,4,Math.max(4,innerHeight-h-4));
  el.classList.add("sav-user-sized");
  if(el.classList.contains("sav-panel"))el.classList.add("pinned","open");
  commitRect(el,pos.mode,pos.parentRect,x,y,w,h);
  setScaledVars(el,1);requestAnimationFrame(()=>reflowGrids(el,1));
}
function beginResize(e,el,edge){
  if(e.button!==undefined&&e.button!==0)return;
  e.preventDefault();e.stopPropagation();
  if(!captureBaseline(el))return;
  const {r,pos}=normalizeForResize(el),s=state.get(el);
  const sx=e.clientX,sy=e.clientY;
  const minW=Math.min(Math.max(el.matches(".font-menu")?160:180,Math.min(s.baseW*.42,260)),Math.max(100,innerWidth-8));
  const minH=Math.min(Math.max(el.matches(".font-menu")?120:110,Math.min(s.baseH*.30,220)),Math.max(80,innerHeight-8));
  el.classList.add("sav-resizing");
  const handle=e.currentTarget;handle.setPointerCapture?.(e.pointerId);
  const move=ev=>{
    const dx=ev.clientX-sx,dy=ev.clientY-sy;
    let x=r.left,y=r.top,w=r.width,h=r.height;
    if(edge.includes("e"))w=clamp(r.width+dx,minW,Math.max(minW,innerWidth-r.left-4));
    if(edge.includes("s"))h=clamp(r.height+dy,minH,Math.max(minH,innerHeight-r.top-4));
    if(edge.includes("w")){
      const nx=clamp(r.left+dx,4,r.right-minW);w=r.right-nx;x=nx;
    }
    if(edge.includes("n")){
      const ny=clamp(r.top+dy,4,r.bottom-minH);h=r.bottom-ny;y=ny;
    }
    if(x+w>innerWidth-4)w=Math.max(minW,innerWidth-4-x);
    if(y+h>innerHeight-4)h=Math.max(minH,innerHeight-4-y);
    commitRect(el,pos.mode,pos.parentRect,x,y,w,h);
  };
  const end=()=>{
    el.classList.remove("sav-resizing");
    handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",end);handle.removeEventListener("pointercancel",end);
  };
  handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",end);handle.addEventListener("pointercancel",end);
}
function addHandles(el){
  EDGES.forEach(edge=>{
    if(el.querySelector(`:scope > .sav-resize-handle[data-edge="${edge}"]`))return;
    const h=document.createElement("span");h.className="sav-resize-handle";h.dataset.edge=edge;
    h.setAttribute("role","separator");h.setAttribute("aria-label",`Resize ${edge} edge`);h.title="Drag to resize · double-click to restore default size";
    h.addEventListener("pointerdown",e=>beginResize(e,el,edge));
    h.addEventListener("dblclick",e=>{e.preventDefault();e.stopPropagation();resetSize(el)});
    el.appendChild(h);
  });
}
function wire(el){
  if(wired.has(el))return;wired.add(el);
  wrapScrollSurface(el);el.classList.add("sav-resizable");addHandles(el);observer.observe(el);
  captureBaseline(el);
}
const observer=new ResizeObserver(entries=>entries.forEach(entry=>{
  const el=entry.target;if(!captureBaseline(el))return;applyScale(el);
}));
root.querySelectorAll(TARGETS).forEach(wire);
const mo=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
  if(node.nodeType!==Node.ELEMENT_NODE)return;
  if(node.matches?.(TARGETS))wire(node);
  node.querySelectorAll?.(TARGETS).forEach(wire);
})));
mo.observe(root,{subtree:true,childList:true});
addEventListener("resize",()=>root.querySelectorAll(`${TARGETS}.sav-user-sized`).forEach(el=>{
  const r=el.getBoundingClientRect(),pos=viewportRectFor(el);
  const w=Math.min(r.width,Math.max(100,innerWidth-8)),h=Math.min(r.height,Math.max(80,innerHeight-8));
  const x=clamp(r.left,4,Math.max(4,innerWidth-w-4)),y=clamp(r.top,4,Math.max(4,innerHeight-h-4));
  commitRect(el,pos.mode,pos.parentRect,x,y,w,h);
}));
})();


(()=>{"use strict";
const BACKEND="https://script.google.com/macros/s/AKfycbyuKFvcQGFjmhnIIcgoZUmPtDPDZYMjsO64Wf0-lDjQCnvUwoHSoHLNppN-cSy7IETs/exec";
const fallback=["ABeeZee","Abril Fatface","Alegreya","Anton","Archivo","Arimo","Arvo","Barlow","Bebas Neue","Bitter","Cabin","Cairo","Caveat","Cinzel","Comfortaa","Cormorant Garamond","Crimson Text","Dancing Script","DM Sans","EB Garamond","Exo 2","Fira Sans","Fredoka","IBM Plex Mono","IBM Plex Sans","Inter","Josefin Sans","Karla","Lato","Libre Baskerville","Lobster","Lora","Merriweather","Montserrat","Noto Sans","Noto Serif","Nunito","Open Sans","Oswald","Pacifico","Playfair Display","Poppins","Quicksand","Raleway","Roboto","Roboto Condensed","Roboto Mono","Rubik","Source Sans 3","Space Grotesk","Ubuntu","Work Sans"];
const loaded=new Map();
function cssUrl(f){return "https://fonts.googleapis.com/css2?family="+encodeURIComponent(f).replace(/%20/g,"+")+"&display=swap"}
function loadFont(f){if(!f||["Arial","Georgia","Times New Roman","Verdana","Trebuchet MS","Courier New","Impact"].includes(f))return Promise.resolve();if(loaded.has(f))return loaded.get(f);const p=new Promise(res=>{const l=document.createElement("link");l.rel="stylesheet";l.href=cssUrl(f);l.onload=()=>document.fonts?.load?.(`16px "${f}"`).finally(res)||res();l.onerror=res;document.head.appendChild(l);setTimeout(res,5000)});loaded.set(f,p);return p}
function jsonp(){return new Promise((resolve,reject)=>{const cb="__savFont"+Date.now()+Math.random().toString(36).slice(2),s=document.createElement("script"),u=new URL(BACKEND);u.searchParams.set("action","studio.fonts.list");u.searchParams.set("namespace","ourspace");u.searchParams.set("callback",cb);let t;window[cb]=d=>{clearTimeout(t);delete window[cb];s.remove();resolve(d)};s.onerror=()=>{clearTimeout(t);delete window[cb];s.remove();reject()};t=setTimeout(()=>{delete window[cb];s.remove();reject()},12000);s.src=u;s.async=true;document.head.appendChild(s)})}
document.querySelector("#savanski-art-toolbar").querySelectorAll("[data-font-picker]").forEach(picker=>{const btn=picker.querySelector("[data-font-button]"),menu=picker.querySelector("[data-font-menu]"),search=picker.querySelector("[data-font-search]"),box=picker.querySelector("[data-font-options]"),sel=picker.querySelector("[data-font-select]");let families=[],ready=false,observer=null;
function render(){const term=(search?.value||"").trim().toLowerCase();const list=families.filter(f=>!term||f.toLowerCase().includes(term));box.innerHTML="";const frag=document.createDocumentFragment();list.forEach(f=>{const b=document.createElement("button");b.type="button";b.className="font-option";b.textContent=f;b.dataset.family=f;b.style.fontFamily=`"${f}",sans-serif`;b.addEventListener("click",async()=>{await loadFont(f);btn.textContent=f;btn.style.fontFamily=`"${f}",sans-serif`;let o=[...sel.options].find(x=>x.value===f);if(!o){o=document.createElement("option");o.value=o.textContent=f;sel.appendChild(o)}sel.value=f;sel.dispatchEvent(new Event("change",{bubbles:true}));menu.hidden=true});frag.appendChild(b)});box.appendChild(frag);observer?.disconnect?.();if("IntersectionObserver"in window){observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){loadFont(e.target.dataset.family);observer.unobserve(e.target)}}),{root:box,rootMargin:"120px"});box.querySelectorAll(".font-option").forEach(x=>observer.observe(x))}}
async function catalog(){if(ready)return;families=fallback.slice();families=[...new Set(families)].sort((a,b)=>a.localeCompare(b));ready=true;render()}
btn.addEventListener("click",async()=>{await catalog();menu.hidden=!menu.hidden;if(!menu.hidden)search?.focus()});search?.addEventListener("input",render);document.addEventListener("pointerdown",e=>{if(!picker.contains(e.target))menu.hidden=true});sel?.addEventListener("change",()=>{btn.textContent=sel.value;btn.style.fontFamily=`"${sel.value}",sans-serif`})});
window.SavanskiGoogleFonts={backend:BACKEND,loadFont};
})();

/* Inventory-pass helper surfaces. */
(()=>{"use strict";
const root=document.querySelector("#savanski-art-toolbar");if(!root)return;
root.querySelectorAll("[data-loader]").forEach(btn=>btn.addEventListener("click",()=>{
  const host=btn.closest("[data-live-panel]");
  const library=host?.querySelector("[data-loader-library]")?.value||"";
  window.dispatchEvent(new CustomEvent("savanski:loader",{detail:{loader:btn.dataset.loader,library}}));
}));
root.addEventListener("click",e=>{
  const swatch=e.target.closest("[data-palette-swatches] [data-color]");
  if(!swatch)return;
  const value=swatch.dataset.color,primary=root.querySelector('[data-control="primary-color"]');
  if(primary&&/^#[0-9a-f]{6}$/i.test(value||"")){
    primary.value=value;primary.dispatchEvent(new Event("input",{bubbles:true}));
  }
});
})();

/* ===== Studio mode switch ===== */
(()=>{"use strict";
const art=document.querySelector("#savanski-art-toolbar");
const three=document.querySelector("#savanski-3d-toolbar");
const buttons=[...document.querySelectorAll("[data-studio-mode]")];
if(!art||!three||buttons.length<2)return;

function activate(mode){
  const showArt=mode==="art";
  art.hidden=!showArt;
  three.hidden=showArt;
  buttons.forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.studioMode===mode)));
  try{localStorage.setItem("savanski-studio-mode",mode)}catch{}
  window.dispatchEvent(new CustomEvent("savanski:studio-mode",{detail:{mode}}));
}
buttons.forEach(btn=>btn.addEventListener("click",()=>activate(btn.dataset.studioMode)));

const themeButton=document.querySelector("[data-studio-theme]");
function setDarkShell(on){
  document.body.classList.toggle("studio-dark-shell",!!on);
  themeButton?.setAttribute("aria-pressed",String(!!on));
  try{localStorage.setItem("savanski-studio-dark-shell",on?"1":"0")}catch{}
  window.dispatchEvent(new CustomEvent("savanski:studio-theme",{detail:{dark:!!on}}));
}
if(themeButton){
  let initialDark=false;
  try{initialDark=localStorage.getItem("savanski-studio-dark-shell")==="1"}catch{}
  setDarkShell(initialDark);
  themeButton.addEventListener("click",()=>setDarkShell(!document.body.classList.contains("studio-dark-shell")));
}

document.querySelector("[data-studio-home]")?.addEventListener("click",()=>{
  const event=new CustomEvent("savanski:home",{cancelable:true,detail:{source:"studio-header"}});
  window.dispatchEvent(event);
  if(!event.defaultPrevented)activate("art");
});

let initial="art";
try{
  const saved=localStorage.getItem("savanski-studio-mode");
  if(saved==="3d"||saved==="art")initial=saved;
}catch{}
activate(initial);
})();
