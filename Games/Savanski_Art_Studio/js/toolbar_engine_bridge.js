/* =========================================================
   SAVANSKI LARGE-STUDIO BRIDGE
   Connects the extracted static Art / 3D toolbar menus to the
   existing LFStudio + Savanski3D engines without changing Home.
   ========================================================= */
(()=>{
"use strict";
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
let activeWorkspace="studio";
let nav3DBound=false;
const artRoot=()=>$("#savanski-art-toolbar");
const threeRoot=()=>$("#savanski-3d-toolbar");
const studio=()=>window.LFStudio;
const u3d=()=>window.Savanski3D;
const fire=(el,type="change")=>{if(!el)return;el.dispatchEvent(new Event(type,{bubbles:true}))};
const click=(sel,root=document)=>{const el=$(sel,root);if(el){el.click();return el}return null};
const toast=(msg)=>{try{studio()?.toast?.(msg)}catch{}};

function closeToolbarPanels(root){
  if(!root)return;
  $$(".sav-panel",root).forEach(p=>{if(!p.classList.contains("pinned"))p.classList.remove("open")});
  $$(".sav-tool",root).forEach(b=>b.setAttribute("aria-pressed","false"));
  $(".sav-hub",root)?.classList.remove("open");
}

function switchWorkspace(name){
  name=name==="3d"?"3d":"studio";
  activeWorkspace=name;
  document.body.dataset.workspace=name;
  $("#workspace")?.classList.toggle("is-active",name==="studio");
  $("#u3dRoot")?.classList.toggle("is-active",name==="3d");
  const art=artRoot(),three=threeRoot();
  if(art)art.hidden=name!=="studio";
  if(three)three.hidden=name!=="3d";
  $$("[data-workspace-tab]").forEach(b=>{
    const on=b.dataset.workspaceTab===name;
    b.classList.toggle("active",on);
    b.setAttribute("aria-selected",String(on));
  });
  const title=$("#workspaceTitleText");if(title)title.textContent=name==="studio"?"Studio":"3D Editor";
  closeToolbarPanels(name==="studio"?three:art);
  if(name==="3d")requestAnimationFrame(()=>requestAnimationFrame(()=>{try{u3d()?.frameAll?.()}catch{}}));
}

function bindStudioUI(Studio){
  // Workspace tabs belong to the editor shell, not Home.
  $$("[data-workspace-tab]").forEach(b=>b.addEventListener("click",()=>{const mode=b.dataset.workspaceTab==="3d"?"3d":"studio";if(window.SavanskiProjectLibrary)window.SavanskiProjectLibrary.openHome(mode);else switchWorkspace(mode)}));

  // Keep the original hidden command bank alive for code that still targets its IDs.
  $$(".legacy-control-bank .ribbon-button[data-tool]").forEach(b=>b.addEventListener("click",()=>Studio.activateTool(b.dataset.tool)));
  $$(".legacy-control-bank [data-action]").forEach(b=>b.addEventListener("click",e=>{e.preventDefault();Studio.action(b.dataset.action)}));

  // Visible non-toolbar action buttons (canvas/layer controls and floating panels).
  $$("[data-action]").filter(b=>!b.closest("#savanski-art-toolbar,#savanski-3d-toolbar,.legacy-control-bank"))
    .forEach(b=>b.addEventListener("click",e=>{e.preventDefault();Studio.action(b.dataset.action)}));

  $("#layersBtn")?.addEventListener("click",()=>Studio.toggleLayers());
  $("#quickSave")?.addEventListener("click",()=>Studio.executeLocalAction?.("save")||Studio.action("save"));
  $("#quickImport")?.addEventListener("click",()=>Studio.requestImport?.(false));
  $("#undoBtn")?.addEventListener("click",()=>Studio.engine?.history?.undo?.());
  $("#redoBtn")?.addEventListener("click",()=>Studio.engine?.history?.redo?.());

  $("#brushSize")?.addEventListener("input",e=>{if(Studio.engine)Studio.engine.brushSize=+e.target.value});
  $("#toolOpacity")?.addEventListener("input",e=>{if(Studio.engine)Studio.engine.opacity=+e.target.value/100});
  $("#primaryColor")?.addEventListener("input",e=>Studio.setPrimary(e.target.value));
  $("#secondaryColor")?.addEventListener("input",e=>Studio.setSecondary(e.target.value));

  // New toolbar mirrors current editor colors/brush state on startup.
  syncArtToolbarFromStudio();
}

function switch3DPage(type,name,A=window.Savanski3D,S=A?.state){
  if(!A)return;
  const btnSel=type==="tool"?"[data-tooltab]":"[data-inspector]";
  const pageSel=type==="tool"?"[data-toolpage]":"[data-inspectorpage]";
  const key=type==="tool"?"tooltab":"inspector";
  A.$$(btnSel).forEach(b=>b.classList.toggle("active",b.dataset[key]===name));
  A.$$(pageSel).forEach(p=>p.classList.toggle("active",p.dataset[type==="tool"?"toolpage":"inspectorpage"]===name));
  if(type==="tool"&&S){
    if(name!=="sculpt"&&S.sculpt)A.setSculptMode?.(false);
    if(name!=="paint"&&S.directPaint)A.setDirectPaint?.(false);
  }
}
function bind3DNavigation(A=window.Savanski3D,S=A?.state){
  if(nav3DBound||!A)return;
  nav3DBound=true;
  A.$$("[data-tooltab]").forEach(b=>b.onclick=()=>switch3DPage("tool",b.dataset.tooltab,A,S));
  A.$$("[data-inspector]").forEach(b=>b.onclick=()=>switch3DPage("inspector",b.dataset.inspector,A,S));
}

function syncArtToolbarFromStudio(){
  const S=studio(),r=artRoot();if(!S||!r)return;
  const set=(c,v)=>{const el=$(`[data-control="${c}"]`,r);if(el&&v!=null)el.value=v};
  set("primary-color",S.engine?.primary||"#000000");
  set("fill-color",S.engine?.secondary||"#ffffff");
  set("brush-size",S.engine?.brushSize||18);
  set("brush-opacity",Math.round((S.engine?.opacity??1)*100));
}

function artSetPrimary(c){const S=studio();if(!S)return;S.setPrimary?.(c);const el=$('[data-control="primary-color"]',artRoot());if(el)el.value=c}
function artSetSecondary(c){const S=studio();if(!S)return;S.setSecondary?.(c);const el=$('[data-control="fill-color"]',artRoot());if(el)el.value=c}

const ART_SWATCHES={
 "identity-dodger-blue":"#1E90FF","identity-cyan":"#00FFFF","identity-lime":"#32CD32",
 "identity-cadmium-yellow":"#FFF600","identity-persimmon-orange":"#EC5800",
 "identity-cyan-void":"#001010","identity-frost-white":"#F2FFFF"
};
const ART_GRADIENTS={
 "gradient-blue-cyan":["#1E90FF","#00FFFF"],"gradient-cyan-lime":["#00FFFF","#32CD32"],
 "gradient-lime-yellow":["#32CD32","#FFF600"],"gradient-yellow-orange":["#FFF600","#EC5800"],
 "gradient-full":["#1E90FF","#EC5800"],"gradient-gray":["#FFFFFF","#000000"]
};
const BASE_COLORS={"base-transparent":{kind:"transparent"},"base-white":{kind:"solid",value:"#FFFFFF"},"base-black":{kind:"solid",value:"#000000"},
 "base-red":{kind:"solid",value:"#E51D37"},"base-blue":{kind:"solid",value:"#1E90FF"},"base-purple":{kind:"solid",value:"#8D43A3"},"base-pink":{kind:"solid",value:"#F28AA2"}};
const BASE_GRADIENTS={
 "base-gradient-blue-cyan":["#1E90FF","#00FFFF"],"base-gradient-cyan-lime":["#00FFFF","#32CD32"],
 "base-gradient-lime-yellow":["#32CD32","#FFF600"],"base-gradient-yellow-orange":["#FFF600","#EC5800"],
 "base-gradient-full":["#1E90FF","#EC5800"],"base-gradient-gray":["#FFFFFF","#000000"]
};
const CANVAS_IDS={
 "canvas-size-portrait-5-5-8-5":"canvas-portrait-5_5x8_5","canvas-size-portrait-6-9":"canvas-portrait-6x9",
 "canvas-size-portrait-5-8":"canvas-portrait-5x8","canvas-size-portrait-4-25-6-87":"canvas-portrait-4_25x6_87",
 "canvas-size-portrait-6-14-9-21":"canvas-portrait-6_14x9_21","canvas-size-portrait-7-10":"canvas-portrait-7x10",
 "canvas-size-portrait-8-5-11":"canvas-portrait-8_5x11","canvas-size-portrait-8-10":"canvas-portrait-8x10",
 "canvas-size-landscape-10-8":"canvas-landscape-10x8","canvas-size-square-10-10":"canvas-square-10x10",
 "canvas-size-square-12-12":"canvas-square-12x12"
};

function setObjectField(path,value,eventType="change"){
  const el=$(`[data-object-field="${path}"]`);
  if(!el)return false;
  if(el.type==="checkbox")el.checked=!!value;else el.value=value;
  fire(el,eventType);return true;
}
function setNib(v){
  const el=$("#brushNibShape");if(el){el.value=v;fire(el)}
  studio()?.activateTool?.("brush");
}
function setCrop(v){
  const el=$("#cropShape");if(el){el.value=v;fire(el)}
  studio()?.activateTool?.("crop");
}
function openPreset(kind,search=""){
  const S=studio();if(!S)return;
  S.togglePanel?.("presetCatalog",true);
  const k=$("#catalogKind"),q=$("#catalogSearch");
  if(k){k.value=kind;fire(k)}
  if(q){q.value=search;fire(q,"input")}
}
function updatePaletteSurface(colors){
  const host=$("[data-palette-swatches]",artRoot());if(!host)return;
  host.innerHTML="";
  colors.forEach(c=>{const b=document.createElement("button");b.type="button";b.dataset.color=c;b.title=c;b.style.background=c;host.appendChild(b)});
}
function clearActiveLayer(){
  const S=studio(),l=S?.engine?.activeLayer?.();if(!l?.canvas)return;
  const snap=S.engine.history?.capture?.("Clear active layer");
  l.canvas.getContext("2d")?.clearRect(0,0,l.canvas.width,l.canvas.height);
  if(snap)S.engine.history?.push?.(snap);
  S.engine.render?.();S.renderLayers?.();toast("Active layer cleared");
}
async function pasteClipboardImage(){
  const S=studio();if(!S||!navigator.clipboard?.read)return toast("Clipboard image paste is unavailable in this browser.");
  try{
    const items=await navigator.clipboard.read();
    for(const item of items){
      const type=item.types.find(t=>t.startsWith("image/"));
      if(type){const blob=await item.getType(type);const f=new File([blob],"clipboard-image."+type.split("/")[1],{type});await S.handleImport?.(f);return}
    }
    toast("No image found on the clipboard.");
  }catch(e){toast("Clipboard image paste was blocked by the browser.");}
}
function toggleTextStyle(k){
  const S=studio(),l=S?.engine?.activeLayer?.();
  if(!l||l.type!=="text"){S?.executeUI?.("text-inspector");return}
  l.meta[k]=!l.meta[k];window.LFTextEngine?.render?.(S.engine,l);S.syncTextInspector?.(l);
}
function applyArtGradient(action){
  const pair=ART_GRADIENTS[action];if(!pair)return false;
  const r=artRoot(),a=$('[data-control="gradient-from"]',r),b=$('[data-control="gradient-to"]',r),en=$('[data-control="gradient-enabled"]',r);
  if(a)a.value=pair[0];if(b)b.value=pair[1];if(en)en.checked=true;
  setObjectField("style.gradient.enabled",true);
  setObjectField("style.gradient.from",pair[0]);
  setObjectField("style.gradient.to",pair[1]);
  return true;
}
function routeArtAction(action){
  const S=studio();if(!S)return;
  const meta=(window.LF_TOOL_REGISTRY||[]).find(x=>x.id===action);
  if(meta?.mode==="local-tool")return S.activateTool?.(action);
  if(meta?.mode==="local-action")return S.executeLocalAction?.(action,{});
  if(meta?.mode==="ui")return S.executeUI?.(action,{});

  if(action in ART_SWATCHES)return artSetPrimary(ART_SWATCHES[action]);
  if(action.startsWith("swatch-"))return artSetPrimary("#"+action.slice(7));
  if(applyArtGradient(action))return;

  if(action in BASE_COLORS){S.canvasBase={...BASE_COLORS[action]};return toast("Canvas base selected for new canvases.")}
  if(action in BASE_GRADIENTS){const [from,to]=BASE_GRADIENTS[action];S.canvasBase={kind:"gradient",from,to};return toast("Gradient canvas base selected.")}
  if(action in CANVAS_IDS){const sel=$("#canvasSizeSelect");if(sel){sel.value=CANVAS_IDS[action];fire(sel)}return toast("Canvas size preset selected.")}

  if(action.startsWith("brush-catalog-")){
    const id=action.slice("brush-catalog-".length);
    if(id==="texture")return openPreset("brush","texture");
    return S.activateTool?.(id);
  }
  if(action.startsWith("shape-library-"))return openPreset("shape",action.slice("shape-library-".length));
  if(action.startsWith("nib-"))return setNib(action.slice(4).replace("captured-custom-shape","custom"));
  if(action.startsWith("crop-"))return setCrop(action.slice(5).replace("free--rectangle","rectangle").replace("captured-custom-shape","custom"));

  switch(action){
    case "image-import":case "overlay-image": return S.requestImport?.(false);
    case "paste-image-clipboard": return pasteClipboardImage();
    case "clear-active-layer": return clearActiveLayer();
    case "shape-capture": return click("#objectCaptureShape");
    case "shape-to-crop": return click("#objectApplyShapeCrop");
    case "shape-to-nib": return click("#objectApplyShapeNib");
    case "text-bold": return toggleTextStyle("bold");
    case "text-italic": return toggleTextStyle("italic");
    case "layer-lock":{
      const l=S.engine?.activeLayer?.();if(l){l.locked=!l.locked;S.renderLayers?.();toast(l.locked?"Layer locked":"Layer unlocked")}return;
    }
    case "replace-primary-with-fill": return artSetPrimary(S.engine?.secondary||"#ffffff");
    case "swap-primary-fill":{
      const p=S.engine?.primary||"#000000",f=S.engine?.secondary||"#ffffff";artSetPrimary(f);artSetSecondary(p);return;
    }
    case "default-black-white": artSetPrimary("#000000");artSetSecondary("#ffffff");return;
    case "extract-artwork-palette":{
      const p=S.engine?.primary||"#000000",f=S.engine?.secondary||"#ffffff";
      updatePaletteSurface([p,f,"#1E90FF","#00FFFF","#32CD32","#FFF600","#EC5800"]);return;
    }
    case "generate-color-harmony":{
      const p=S.engine?.primary||"#000000";updatePaletteSurface([p,"#1E90FF","#00FFFF","#32CD32","#FFF600","#EC5800"]);return;
    }
    case "apply-image-cleanup":{
      const mode=$('[data-control="image-cleanup"]',artRoot())?.value||"";
      if(/Near-White|Near-Black|Alpha Threshold/i.test(mode))return S.executeLocalAction?.("background-remove-local",{tolerance:34});
      if(/Posterize|Reduce Palette/i.test(mode))return S.executeLocalAction?.("pixelate",{size:6});
      if(/Despeckle|Defringe/i.test(mode))return S.executeLocalAction?.("clarity",{});
      return toast("Image cleanup applied through the local image toolset where supported.");
    }
    case "fill-pixel-selection":case "erase-pixel-selection":case "keep-only-selection":
    case "clear-pixel-selection":case "magic-color-select":case "contiguous-background-erase":
      return toast(action.replace(/-/g," ")+" is available through the selection tool.");
    case "texture-clear": return click("#objectClearTexture");
    case "texture-fill": return click("#objectTextureBtn");
  }
  // Final fallback: use the existing studio action path.
  try{return S.action?.(action)}catch(e){console.warn("Savanski art action",action,e)}
}

function mirrorValue(target,value,type="input"){
  if(!target)return;
  if(target.type==="checkbox")target.checked=!!value;
  else target.value=value;
  fire(target,type);
}
function routeArtControl(control,value,source){
  const S=studio();if(!S)return;
  const checked=source?.type==="checkbox"?source.checked:null;
  switch(control){
    case "primary-color": return artSetPrimary(value);
    case "fill-color": return artSetSecondary(value);
    case "brush-size": if(S.engine)S.engine.brushSize=+value;mirrorValue($("#brushSize"),value);return;
    case "brush-opacity": if(S.engine)S.engine.opacity=+value/100;mirrorValue($("#toolOpacity"),value);return;
    case "layer-opacity": return mirrorValue($("#layerOpacity"),value);
    case "blend-mode": return mirrorValue($("#blendMode"),value,"change");
    case "x": return mirrorValue($("#layerX"),value,"change");
    case "y": return mirrorValue($("#layerY"),value,"change");
    case "scale-x": return mirrorValue($("#layerScaleX"),(+value)*100,"change");
    case "scale-y": return mirrorValue($("#layerScaleY"),(+value)*100,"change");
    case "rotation": return mirrorValue($("#layerRotation"),value,"change");
    case "text-content": return mirrorValue($("#textValue"),value,"input");
    case "font-size": return mirrorValue($("#textSize"),value,"change");
    case "letter-spacing": return mirrorValue($("#letterSpacing"),value,"change");
    case "line-height": return mirrorValue($("#lineHeight"),value,"change");
    case "text-align": return setObjectField("meta.align",value);
    case "text-dimension": return setObjectField("meta.dimensionMode",value);
    case "outline-color": return mirrorValue($("#strokeColor"),value,"change");
    case "outline-width": return mirrorValue($("#strokeWidth"),value,"change");
    case "gradient-enabled": return setObjectField("style.gradient.enabled",checked);
    case "gradient-from": return setObjectField("style.gradient.from",value);
    case "gradient-to": return setObjectField("style.gradient.to",value);
    case "gradient-angle": return setObjectField("style.gradient.angle",value);
    case "border-enabled": return setObjectField("style.border.enabled",checked);
    case "border-color": return setObjectField("style.border.color",value);
    case "border-width": return setObjectField("style.border.width",value);
    case "border-style": return setObjectField("style.border.style",String(value).toLowerCase());
    case "skew-x": return setObjectField("transform.skewX",value);
    case "skew-y": return setObjectField("transform.skewY",value);
    case "persp-tl-x": return setObjectField("transform.perspective.tl.x",value);
    case "persp-tl-y": return setObjectField("transform.perspective.tl.y",value);
    case "persp-tr-x": return setObjectField("transform.perspective.tr.x",value);
    case "persp-tr-y": return setObjectField("transform.perspective.tr.y",value);
    case "persp-br-x": return setObjectField("transform.perspective.br.x",value);
    case "persp-br-y": return setObjectField("transform.perspective.br.y",value);
    case "persp-bl-x": return setObjectField("transform.perspective.bl.x",value);
    case "persp-bl-y": return setObjectField("transform.perspective.bl.y",value);
    case "brightness": return setObjectField("effects.brightness",value);
    case "contrast": return setObjectField("effects.contrast",value);
    case "saturation": return setObjectField("effects.saturation",value);
    case "hue": return setObjectField("effects.hue",value);
    case "grain": return setObjectField("effects.grain",value);
    case "selection-tolerance": if(S.engine)S.engine.selectionTolerance=+value;return;
    case "brush-hardness": if(S.engine)S.engine.brushHardness=+value/100;return;
    case "retouch-size": if(S.engine)S.engine.retouchSize=+value;return;
    case "retouch-strength": if(S.engine)S.engine.retouchStrength=+value/100;return;
  }
}

function threeClick(sel){return click(sel,$("#u3dRoot"))}
function threeTool(name){return threeClick(`[data-tooltab="${name}"]`)}
function threeInspect(name){return threeClick(`[data-inspector="${name}"]`)}
function setCheckbox(sel,on){
  const e=$(sel,$("#u3dRoot"));if(!e)return;
  if(e.checked!==!!on){e.checked=!!on;fire(e,"change")}
}
function set3DInput(sel,value,type="input"){
  const e=$(sel,$("#u3dRoot"));if(!e)return;
  e.value=value;fire(e,type);
}
function setAvatarPreset(name){
  const e=$("#avatarPreset",$("#u3dRoot"));if(!e)return;e.value=name;fire(e,"change");threeTool("avatar");
}
const MAT_COLORS={"mat-blue":"#1E90FF","mat-cyan":"#00FFFF","mat-lime":"#32CD32","mat-void":"#001010","mat-white":"#F2FFFF"};
const materialNameFromAction=a=>a.slice("material-".length).replace(/-/g," ");

function applyMaterialSwatch(action){
  const key=materialNameFromAction(action).toLowerCase();
  const item=(window.SAVANSKI_SWATCHES||[]).find(x=>{
    const n=(x.name+" "+x.file).toLowerCase().replace(/[·_.]/g," ").replace(/\s+/g," ");
    return key.split(" ").every(k=>n.includes(k));
  });
  if(item&&u3d()?.loadSwatch){threeTool("paint");u3d().loadSwatch(item);return true}
  return false;
}

const type3dState={text:"Savanski",font:"Arial",size:64,depth:12,color:"#005B7A",rx:0,ry:0,rz:0};
function create3DType(){
  const A=u3d(),T=window.THREE;if(!A||!T)return;
  const text=(type3dState.text||"Savanski").trim()||"Savanski";
  const font=type3dState.font||"Arial",color=type3dState.color||"#00ffff";
  const depth=Math.max(.02,Math.min(2,(+type3dState.depth||12)/54));
  const size=Math.max(8,+type3dState.size||64);
  const c=document.createElement("canvas"),ctx=c.getContext("2d");c.width=1024;c.height=256;
  ctx.clearRect(0,0,c.width,c.height);ctx.font=`900 ${size}px "${font}",sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillStyle=color;ctx.strokeStyle="rgba(0,0,0,.32)";ctx.lineWidth=Math.max(1,size*.02);ctx.strokeText(text,c.width/2,c.height/2);ctx.fillText(text,c.width/2,c.height/2);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;
  const ratio=Math.min(8,Math.max(1.5,ctx.measureText(text).width/(size*.9))),h=1.25,w=h*ratio;
  A.pushHistory?.("Create 3D type");
  const group=new T.Group();group.name="3D Type — "+text;
  const layers=Math.max(3,Math.min(18,Math.ceil(depth*18)));
  for(let i=0;i<layers;i++){
    const mat=new T.MeshStandardMaterial({map:tex,color:0xffffff,transparent:true,alphaTest:.05,roughness:.65,metalness:0,side:T.DoubleSide});
    const mesh=new T.Mesh(new T.PlaneGeometry(w,h),mat);mesh.position.z=-depth/2+(i/(layers-1))*depth;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
  group.rotation.set((+type3dState.rx||0)*Math.PI/180,(+type3dState.ry||0)*Math.PI/180,(+type3dState.rz||0)*Math.PI/180);
  group.position.y=1;A.ensureRoot().add(group);A.selectObject(group);A.frameObject(group);A.refreshSceneList();A.updateProjectStats();A.toast("3D type created","success");
}

function toggle3DCheckbox(sel){
  const e=$(sel,$("#u3dRoot"));if(!e)return;e.checked=!e.checked;fire(e,"change");
}
function route3DAction(action){
  const A=u3d();if(!A)return;
  // Project creation and opening belong to Home. The editor may add assets to an
  // already-open project, but it must not silently create or replace project identity.
  if(action==="new-3d"){window.SavanskiProjectLibrary?.openHome?.("3d");return}
  if(action==="import-3d"){window.SavanskiProjectLibrary?.openHome?.("3d",{intent:"import"});return}
  const map={
    "save-3d":"#saveLocalBtn","export-sas3d":"#exportProjectBtn",
    "export-glb":"#exportGlbBtn","export-obj":"#exportObjBtn","export-stl":"#exportStlBtn","export-ply":"#exportPlyBtn",
    "undo":"#u3dUndoBtn","redo":"#u3dRedoBtn","frame":"#frameBtn","grid":"#gridBtn","wireframe":"#wireBtn","toon-preview":"#toonBtn",
    "duplicate-selected":"#duplicateBtn","delete-selected":"#deleteBtn","simplify":"#simplifyBtn","tessellate":"#tessellateBtn",
    "weld":"#weldBtn","normals":"#normalsBtn","mirror-x":"#mirrorBtn","center-pivot":"#centerPivotBtn","merge-visible":"#mergeVisibleBtn",
    "sculpt-toggle":"#sculptToggle","texture-clear":"#clearPaintBtn","texture-fill":"#fillPaintBtn","texture-text-stamp":"#textStampBtn",
    "texture-download":"#downloadTextureBtn","direct-paint":"#directPaintToggle","apply-texture":"#applyCanvasTextureBtn",
    "remove-base-texture":"#removeTextureBtn","create-avatar":"#createAvatarBtn","avatar-reset":"#resetAvatarBtn","merge-skin":"#mergeAvatarBtn",
    "capture-current":"#capturePngBtn","capture-portrait":"#portraitPngBtn","capture-4view":"#sprite4Btn","capture-8dir":"#sprite8Btn",
    "capture-meta":"#spriteMetaBtn","reset-view":"#resetViewBtn","apply-transform":"#applyTransformBtn","object-apply-transform":"#applyTransformBtn",
    "help":"#helpBtn"
  };
  if(map[action])return threeClick(map[action]);
  if(action==="home"){window.dispatchEvent(new CustomEvent("savanski:home-request"));return}
  if(["move","rotate","scale"].includes(action))return threeClick(`[data-transform="${action==="move"?"translate":action}"]`);
  if(["box","sphere","capsule","cylinder","cone","torus","plane"].includes(action))return threeClick(`[data-primitive="${action}"]`);
  if(action==="disc")return threeClick('[data-primitive="circle"]');
  if(action==="torus-knot")return threeClick('[data-primitive="knot"]');
  if(["inflate","deflate","smooth","flatten","pinch","relax"].includes(action)){threeTool("sculpt");return threeClick(`[data-sculpt="${action}"]`)}
  if(action==="sculpt-symmetry-x")return toggle3DCheckbox("#symmetryX");
  if(action==="sculpt-continuous")return toggle3DCheckbox("#sculptContinuous");
  if(action in MAT_COLORS){threeInspect("material");set3DInput("#materialColor",MAT_COLORS[action],"change");return}
  if(action.startsWith("material-")&&applyMaterialSwatch(action))return;
  if(action==="material-wireframe")return toggle3DCheckbox("#wireMaterial");
  if(action==="double-sided")return toggle3DCheckbox("#doubleSide");
  if(action.startsWith("avatar-")&&["balanced","compact","tall","broad","slender"].includes(action.slice(7)))return setAvatarPreset(action.slice(7));
  if(action.startsWith("capture-view-")){
    threeTool("convert");const v=action.slice("capture-view-".length).replace("three-quarter","threequarter");set3DInput("#captureView",v,"change");return;
  }
  if(action==="capture-toon")return toggle3DCheckbox("#captureToon");
  if(action==="capture-shadow")return toggle3DCheckbox("#captureShadow");
  if(action==="scene-list"){threeTool("scene");sync3DLive();return}
  if(action==="scene-drop-import")return threeClick("#importBtn");
  if(action==="object-visible")return toggle3DCheckbox("#objectVisible");
  if(action==="object-cast-shadow")return toggle3DCheckbox("#objectCastShadow");
  if(action==="create-3d-text")return create3DType();
  if(action==="text-perspective"){
    const sel=A.state?.selected;if(sel){sel.rotation.set((+type3dState.rx||0)*Math.PI/180,(+type3dState.ry||0)*Math.PI/180,(+type3dState.rz||0)*Math.PI/180);A.syncInspector?.();A.status?.("3D type perspective updated")}return;
  }
}

function route3DControl(control,value,source){
  const checked=source?.type==="checkbox"?source.checked:null;
  const transformMap={"pos-x":"position.x","pos-y":"position.y","pos-z":"position.z","rot-x":"rotation.x","rot-y":"rotation.y","rot-z":"rotation.z","scale-x":"scale.x","scale-y":"scale.y","scale-z":"scale.z"};
  const objectMap={"obj-pos-x":"position.x","obj-pos-y":"position.y","obj-pos-z":"position.z","obj-rot-x":"rotation.x","obj-rot-y":"rotation.y","obj-rot-z":"rotation.z","obj-scale-x":"scale.x","obj-scale-y":"scale.y","obj-scale-z":"scale.z"};
  if(control in transformMap||control in objectMap){
    const k=(transformMap[control]||objectMap[control]),e=$(`[data-transform-input="${k}"]`,$("#u3dRoot"));if(e){e.value=value;fire(e,"change")}return;
  }
  switch(control){
    case "project-name": return set3DInput("#projectName",value,"input");
    case "simplify-amount": return set3DInput("#simplifyAmount",value,"input");
    case "tessellate-threshold": return set3DInput("#tessellateEdge",(+value<=1?+value*100:value),"input");
    case "sculpt-radius": return set3DInput("#sculptRadius",(+value<=2?+value*100:value),"input");
    case "sculpt-strength": return set3DInput("#sculptStrength",(+value<=1?+value*100:value),"input");
    case "sculpt-hardness": return set3DInput("#sculptHardness",(+value<=1?+value*100:value),"input");
    case "paint-color": return set3DInput("#paintColor",value,"input");
    case "paint-brush-size": return set3DInput("#paintSize",value,"input");
    case "paint-opacity": return set3DInput("#paintOpacity",value,"input");
    case "text-stamp": return set3DInput("#paintText",value,"input");
    case "material-base": threeInspect("material");return set3DInput("#materialColor",value,"change");
    case "metalness": return set3DInput("#materialMetalness",(+value<=1?+value*100:value),"input");
    case "roughness": return set3DInput("#materialRoughness",(+value<=1?+value*100:value),"input");
    case "material-opacity": return set3DInput("#materialOpacity",(+value<=1?+value*100:value),"input");
    case "material-shading":{
      const e=$("#materialStyle",$("#u3dRoot"));if(!e)return;
      const v=String(value).toLowerCase();
      const o=[...e.options].find(o=>o.value.toLowerCase().includes(v.split(" ")[0])||o.textContent.toLowerCase().includes(v.split(" ")[0]));
      if(o)e.value=o.value;fire(e,"change");return;
    }
    case "material-search": threeInspect("material");return set3DInput("#swatchSearch",value,"input");
    case "object-name": threeInspect("object");return set3DInput("#objectName",value,"change");
    case "capture-bg": threeTool("convert");return set3DInput("#captureBackground",value==="cyan"?"studio":value,"change");
    case "capture-cell": return set3DInput("#captureSize",value,"change");
    case "scene-search": threeTool("scene");return set3DInput("#sceneSearch",value,"input");
    case "scene-bg": return set3DInput("#sceneBackground",value,"input");
    case "key-light": return set3DInput("#lightIntensity",(+value<=5?+value*100:value),"input");
    case "env-light": return set3DInput("#hemiIntensity",(+value<=5?+value*100:value),"input");
    case "3d-text-content": type3dState.text=value;return;
    case "3d-font-size": type3dState.size=+value;return;
    case "3d-text-depth": type3dState.depth=+value;return;
    case "3d-depth-color": type3dState.color=value;return;
    case "3d-text-rot-x": type3dState.rx=+value;return;
    case "3d-text-rot-y": type3dState.ry=+value;return;
    case "3d-text-rot-z": type3dState.rz=+value;return;
  }
  const avatarMap={"avatar-stature":"stature","head-width":"headWidth","head-height":"headHeight","head-depth":"headDepth","shoulders":"shoulders","torso":"torso","waist":"waist","hips":"hips","arms":"arms","legs":"legs","limb-thickness":"limbs","hands":"hands","feet":"feet"};
  if(control in avatarMap){
    threeTool("avatar");
    const e=$(`[data-avatar="${avatarMap[control]}"]`,$("#u3dRoot"));if(e){
      const v=+value,mid=100,mapped=Math.max(+e.min||60,Math.min(+e.max||150,mid+(v-50)*.7));
      e.value=mapped;fire(e,"input");
    }
  }
}

function sync3DLive(){
  const A=u3d(),r=threeRoot();if(!A||!r)return;
  const scene=$('[data-live-panel="scene-object-list"]',r);
  if(scene){
    scene.innerHTML="";
    const objs=A.meshes?.()||[];
    if(!objs.length)scene.textContent="No mesh objects.";
    objs.forEach(o=>{const b=document.createElement("button");b.type="button";b.className="sav-live-item";b.textContent=o.name||o.type||"Mesh";b.onclick=()=>{A.selectObject?.(o);A.frameObject?.(o)};scene.appendChild(b)});
  }
  const info=$('[data-live-panel="mesh-information"]',r),o=A.state?.selected;
  if(info){
    info.innerHTML="";
    const data=o?[
      ["Name",o.name||"Selected object"],["Type",o.type||"Object"],
      ["Vertices",o.geometry?.attributes?.position?.count??"—"],
      ["Triangles",o.geometry?.index?Math.floor(o.geometry.index.count/3):o.geometry?.attributes?.position?Math.floor(o.geometry.attributes.position.count/3):"—"],
      ["UVs",o.geometry?.attributes?.uv?"Available":"None"]
    ]:[["Selection","Nothing selected"]];
    data.forEach(([k,v])=>{const d=document.createElement("div");d.className="sav-live-item";d.textContent=`${k}: ${v}`;info.appendChild(d)});
  }
}

window.addEventListener("savanski:tool",e=>{
  const action=e.detail?.action;if(!action)return;
  if(activeWorkspace==="3d")route3DAction(action);else routeArtAction(action);
});
window.addEventListener("savanski:control",e=>{
  const control=e.detail?.control;if(!control)return;
  const root=activeWorkspace==="3d"?threeRoot():artRoot();
  const source=$(`[data-control="${CSS.escape(control)}"]`,root);
  const value=source?.type==="checkbox"?source.checked:e.detail?.value;
  if(activeWorkspace==="3d")route3DControl(control,value,source);else routeArtControl(control,value,source);
});
window.addEventListener("savanski:loader",e=>{
  if(activeWorkspace!=="studio")return;
  const kind=e.detail?.library||"";
  openPreset(kind.includes("brush")?"brush":"shape",kind.replace(/-/g," "));
});

// Connect new Google-font pickers to the existing text / 3D-type systems.
document.addEventListener("change",e=>{
  const sel=e.target.closest?.("#savanski-art-toolbar [data-font-select],#savanski-3d-toolbar [data-font-select]");
  if(!sel)return;
  if(sel.closest("#savanski-art-toolbar")){
    const t=$("#textFont");if(t){let o=[...t.options].find(x=>x.value===sel.value);if(!o){o=document.createElement("option");o.value=o.textContent=sel.value;t.appendChild(o)}t.value=sel.value;fire(t,"change")}
  }else type3dState.font=sel.value;
});

// Keep new live panels useful when opened.
document.addEventListener("click",e=>{
  if(e.target.closest?.("#savanski-3d-toolbar .sav-tool,#savanski-3d-toolbar [data-open]"))requestAnimationFrame(sync3DLive);
});

document.body.dataset.workspace=document.body.dataset.workspace||"studio";
window.addEventListener("savanski:studio-mode",e=>{
  const mode=e.detail?.mode==="3d"?"3d":"studio";
  if(window.SavanskiProjectLibrary)window.SavanskiProjectLibrary.openHome(mode);else switchWorkspace(mode);
});
window.addEventListener("savanski:home",e=>{
  e.preventDefault?.();
  const launcher=$("#launcher");
  if(launcher) launcher.hidden=false;
});
window.addEventListener("savanski:home-request",()=>{
  const launcher=$("#launcher");
  if(launcher) launcher.hidden=false;
});
window.addEventListener("savanski:studio-theme",e=>{
  const dark=!!e.detail?.dark;
  document.documentElement.dataset.theme=dark?"dark":"light";
  try{studio()?.syncTheme?.()}catch{}
});
window.SavanskiToolbarMenus={switchWorkspace,bindStudioUI,bind3DNavigation,switch3DPage,sync3DLive};
window.SavanskiSingleShell=window.SavanskiToolbarMenus;
})();
