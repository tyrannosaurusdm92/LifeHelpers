(()=>{
"use strict";
const q=id=>document.getElementById(id), qa=(s,r=document)=>[...r.querySelectorAll(s)];
const frame=q("happyHomeRoomFrame"),panel=document.querySelector('[data-panel="decor"]');
if(!frame||!panel)return;
const KEY="happy_home_room_placements_v4",MAX_SERVINGS=4;
let placements=[],selectedId=null,editorEnabled=false,ready=false,pourDialog=null,interactionToast=null;
try{placements=JSON.parse(localStorage.getItem(KEY)||"[]")||[]}catch{placements=[]}
const clone=v=>JSON.parse(JSON.stringify(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const catalog=()=>Array.isArray(window.HAPPY_HOME_STORE_CATALOG)?window.HAPPY_HOME_STORE_CATALOG:[];
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function updateOnyxDynamic(){try{window.OnyxRoomSpatial?.setDynamicPlacements?.(placements)}catch(_){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(placements))}catch{}updateOnyxDynamic()}
function send(type,payload={}){try{frame.contentWindow?.postMessage({source:"hh-inventory-parent",type,...payload},"*")}catch(_){}}
function inventory(){return window.HappyHomeStore?.getInventory?.()||{}}
function quantity(id){return Math.max(0,Number(inventory()[id]||0)|0)}
function placedCount(itemId){return placements.filter(p=>p.itemId===itemId).length}
function defaultSize(item){
  const g=(item.roomGroup||"").toLowerCase(),k=(item.interactiveType||"").toLowerCase();
  if(g.includes("bed")||k.includes("bed"))return[285,190];
  if(g.includes("water")||k.includes("fountain"))return[170,155];
  if(g.includes("food")||k.includes("bowl"))return[165,115];
  if(g.includes("toy")||k.includes("toy"))return[105,85];
  if(g.includes("tablet")||k.includes("tablet"))return[180,125];
  return[150,130];
}
function sleepImage(item){return item.sleepingImage||null}
function makePlacement(item){
  const [w,h]=defaultSize(item),n=placements.length;
  return {id:"placed-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8),itemId:item.id,name:item.name,image:item.image,
    sleepingImage:sleepImage(item),interactiveType:item.interactiveType||"object",roomGroup:item.roomGroup||"",renderer:item.renderer==="img"?"img":"object",
    slots:clone(item.slots||[]),contents:{},fountainOn:true,
    x:860+(n%5)*28,y:640+(n%3)*20,w,h,rotation:0,opacity:1,autoPerspective:true,
    affordances:(item.interactiveType==="bed"||String(item.category).toLowerCase().includes("bed"))?["Inspect","Enter","Lie","Nap","Knead"]:(item.accepts||[])};
}
function sync(){updateOnyxDynamic();send("sync",{placements});send("editor",{enabled:editorEnabled,selectedId});}
function selected(){return placements.find(p=>p.id===selectedId)||null}
function renderPlacementList(){
  const sel=q("inventoryPlacementSelect");if(!sel)return;sel.innerHTML='<option value="">No placed object selected</option>'+placements.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join("");
  sel.value=selectedId||"";sel.onchange=()=>{selectedId=sel.value||null;send("select",{id:selectedId});renderPlacementEditor()};
  renderPlacementEditor();
}
function renderPlacementEditor(){
  const p=selected(),box=q("inventoryPlacementEditor");if(!box)return;box.hidden=!p;
  if(!p)return;
  q("inventoryPosX").value=Math.round(p.x);q("inventoryPosY").value=Math.round(p.y);q("inventorySizeW").value=Math.round(p.w);q("inventorySizeH").value=Math.round(p.h);
  q("inventoryRotation").value=Number(p.rotation||0);q("inventoryOpacity").value=Math.round((p.opacity??1)*100);q("inventoryPerspective").checked=p.autoPerspective!==false;
  q("inventoryPlacementName").textContent=p.name+(p.sleepingImage?" · Onyx sleeping sprite linked":"");
}
function updateFromFields(){
  const p=selected();if(!p)return;p.x=Number(q("inventoryPosX").value)||0;p.y=Number(q("inventoryPosY").value)||0;p.w=clamp(Number(q("inventorySizeW").value)||130,40,900);p.h=clamp(Number(q("inventorySizeH").value)||130,40,700);
  p.rotation=Number(q("inventoryRotation").value)||0;p.opacity=clamp((Number(q("inventoryOpacity").value)||100)/100,.1,1);p.autoPerspective=q("inventoryPerspective").checked;save();send("upsert",{placement:p});renderPlacementList();
}
function nudge(dx,dy){const p=selected();if(!p)return;p.x+=dx;p.y+=dy;save();send("upsert",{placement:p});renderPlacementEditor()}
function placeItem(id){
  const item=catalog().find(i=>i.id===id);if(!item||item.placementMode!=="room-object")return;const qty=quantity(id);if(placedCount(id)>=qty)return;
  const p=makePlacement(item);placements.push(p);selectedId=p.id;save();sync();renderInventory();renderPlacementList();
}
function duplicateSelected(){const p=selected();if(!p)return;const qty=quantity(p.itemId);if(placedCount(p.itemId)>=qty)return;const c=clone(p);c.id="placed-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);c.x+=28;c.y+=20;placements.push(c);selectedId=c.id;save();sync();renderInventory();renderPlacementList()}
function storeSelected(){if(!selectedId)return;placements=placements.filter(p=>p.id!==selectedId);selectedId=null;save();sync();renderInventory();renderPlacementList()}
function setEditor(on){editorEnabled=!!on;send("editor",{enabled:editorEnabled,selectedId});}
function foodType(item){return String(item?.emits?.[0]||"")}
function ownedFoods(){return catalog().filter(i=>i.placementMode==="inventory-consumable"&&quantity(i.id)>0&&foodType(i))}
function isCompatible(slot,type){return Array.isArray(slot?.accepts)&&(slot.accepts.includes(type)||(type.startsWith("treat.")&&slot.accepts.includes("treat.*")))}
function bowls(){return placements.filter(p=>p.interactiveType==="bowl"&&Array.isArray(p.slots)&&p.slots.length)}
function slotsFor(bowl,type){return (bowl?.slots||[]).filter(s=>isCompatible(s,type))}
function ensureInteractionToast(){
  if(interactionToast)return interactionToast;
  interactionToast=document.createElement("div");interactionToast.id="hhInventoryInteractionToast";interactionToast.setAttribute("role","status");interactionToast.setAttribute("aria-live","polite");
  Object.assign(interactionToast.style,{position:"fixed",zIndex:"10001",left:"50%",bottom:"22px",transform:"translateX(-50%)",padding:"9px 14px",border:"1px solid #494949",borderRadius:"999px",background:"#242424",color:"#fff",font:"800 12px system-ui",boxShadow:"0 8px 24px #0006",opacity:"0",transition:"opacity .16s",pointerEvents:"none"});
  document.body.append(interactionToast);return interactionToast;
}
function toast(message){const t=ensureInteractionToast();t.textContent=message;t.style.opacity="1";clearTimeout(t._hideTimer);t._hideTimer=setTimeout(()=>t.style.opacity="0",2400)}
function ensurePourDialog(){
  if(pourDialog)return pourDialog;
  const style=document.createElement("style");style.textContent="#onyxFoodPourDialog{width:min(440px,calc(100vw - 28px));padding:0;border:1px solid #494949;border-radius:14px;background:#fff;color:#000;box-shadow:0 20px 65px #0007;font:14px system-ui}#onyxFoodPourDialog::backdrop{background:#1119}#onyxFoodPourDialog header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#dbdbdb;border-bottom:1px solid #494949}#onyxFoodPourDialog h2{font-size:16px;margin:0}#onyxFoodPourDialog .pour-body{display:grid;gap:12px;padding:16px}#onyxFoodPourDialog label{display:grid;gap:5px;font-size:12px;font-weight:800}#onyxFoodPourDialog select{min-width:0;padding:9px;border:1px solid #494949;border-radius:8px;background:#fff;color:#000}#onyxFoodPourDialog .pour-note{margin:0;color:#494949;font-size:12px;line-height:1.4}#onyxFoodPourDialog footer{display:flex;justify-content:flex-end;gap:8px;padding:0 16px 16px}#onyxFoodPourDialog button{border:1px solid #494949;border-radius:8px;padding:8px 12px;background:#b6b6b6;color:#000;font-weight:850;cursor:pointer}#onyxFoodPourDialog button[type=submit]{background:#242424;color:#fff}#onyxFoodPourDialog button:hover{background:#dbdbdb;color:#000}#onyxFoodPourDialog button[type=submit]:hover{background:#494949;color:#fff}";
  document.head.append(style);
  pourDialog=document.createElement("dialog");pourDialog.id="onyxFoodPourDialog";
  pourDialog.innerHTML='<form method="dialog" id="onyxFoodPourForm"><header><h2>Pour food into a bowl</h2><button type="button" data-pour-cancel aria-label="Close">×</button></header><div class="pour-body"><label>Food or treat<select id="onyxPourFood"></select></label><label>Bowl<select id="onyxPourBowl"></select></label><label>Compartment<select id="onyxPourSlot"></select></label><p class="pour-note" id="onyxPourNote" aria-live="polite"></p></div><footer><button type="button" data-pour-cancel>Cancel</button><button type="submit">Pour</button></footer></form>';
  document.body.append(pourDialog);
  pourDialog.querySelectorAll("[data-pour-cancel]").forEach(b=>b.addEventListener("click",()=>pourDialog.close()));
  q("onyxPourFood").addEventListener("change",refreshPourSlots);
  q("onyxPourBowl").addEventListener("change",refreshPourSlots);
  q("onyxPourForm").addEventListener("submit",e=>{e.preventDefault();const itemId=q("onyxPourFood").value,bowlId=q("onyxPourBowl").value,slotId=q("onyxPourSlot").value;if(pourIntoBowl(itemId,bowlId,slotId))pourDialog.close()});
  return pourDialog;
}
function refreshPourSlots(){
  const food=ownedFoods().find(i=>i.id===q("onyxPourFood")?.value),bowl=bowls().find(p=>p.id===q("onyxPourBowl")?.value),slotSelect=q("onyxPourSlot"),note=q("onyxPourNote");
  if(!slotSelect||!note)return;const compatible=slotsFor(bowl,foodType(food));
  slotSelect.innerHTML=compatible.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.label||s.id)+'</option>').join("");
  slotSelect.disabled=!compatible.length;
  note.textContent=!food?"No food or treats are owned yet. Buy a wet-food can, dry-food bag, or treat refill from the Store.":!bowl?"Place a compatible bowl in the room first.":!compatible.length?"This bowl has no compartment for that food type.":foodType(food)==="food.wet"?"Wet food pours into the wet-food compartment.":"Dry food and treats go into the dry-food compartment.";
}
function openPourFlow(itemId="",bowlId=""){
  const d=ensurePourDialog(),foodSelect=q("onyxPourFood"),bowlSelect=q("onyxPourBowl"),foodList=ownedFoods(),bowlList=bowls();
  foodSelect.innerHTML=foodList.map(i=>'<option value="'+esc(i.id)+'">'+esc(i.name)+' · owned ×'+quantity(i.id)+'</option>').join("");
  bowlSelect.innerHTML=bowlList.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.name)+'</option>').join("");
  if(itemId&&foodList.some(i=>i.id===itemId))foodSelect.value=itemId;
  if(bowlId&&bowlList.some(p=>p.id===bowlId))bowlSelect.value=bowlId;
  refreshPourSlots();
  if(typeof d.showModal==="function")d.showModal();else d.setAttribute("open","");
  foodSelect.focus();
}
function playPourSound(item){
  try{const dry=foodType(item)==="food.dry",url=dry?"assets/audio/games/virtual/inventory/food/quick-food-bag-shake.mp3":"assets/audio/games/virtual/inventory/food/pour-food-into-bowl.mp3";const audio=new Audio(url);audio.volume=.45;audio.play().catch(()=>{})}catch(_){}
}
function pourIntoBowl(itemId,bowlId,slotId){
  const item=catalog().find(i=>i.id===itemId),bowl=placements.find(p=>p.id===bowlId),type=foodType(item),slot=(bowl?.slots||[]).find(s=>s.id===slotId);
  if(!item||quantity(itemId)<1||!bowl||bowl.interactiveType!=="bowl"||!isCompatible(slot,type)){toast("Choose an owned food and a compatible bowl compartment.");return false}
  if(!window.HappyHomeStore?.consume?.(itemId,1)){toast("That food package is no longer in the inventory.");return false}
  bowl.contents=bowl.contents||{};
  bowl.contents[slot.id]={itemId:item.id,itemName:item.name,category:type,fillLevel:1,servings:MAX_SERVINGS,pouredAt:new Date().toISOString()};
  bowl.contentsUpdatedAt=new Date().toISOString();selectedId=bowl.id;save();send("upsert",{placement:bowl});renderInventory();renderPlacementList();playPourSound(item);
  toast(item.name+" poured into "+(slot.label||"the bowl")+". The bowl is full.");
  return true;
}
function activatePlacement(id){
  const p=placements.find(item=>item.id===id);if(!p)return;
  if(p.interactiveType==="bowl"){openPourFlow("",p.id);return}
  if(p.interactiveType==="fountain"){p.fountainOn=p.fountainOn===false;save();send("upsert",{placement:p});toast(p.name+(p.fountainOn?" is running; water is rippling.":" is turned off."));return}
  toast(p.name+" is ready to use.");
}
function renderInventory(){
  const grid=q("inventoryOwnedGrid");if(!grid)return;
  const inv=inventory(),owned=catalog().filter(i=>(inv[i.id]||0)>0);
  if(!owned.length){grid.innerHTML='<div class="hh-status">Nothing owned yet. Open the Store with button 5, purchase an item, then return here to place it.</div>';return;}
  grid.innerHTML=owned.map(i=>{
    const qty=Number(inv[i.id]||0),used=placedCount(i.id),left=Math.max(0,qty-used),placeable=i.placementMode==="room-object";
    const consumable=i.placementMode==="inventory-consumable"&&Array.isArray(i.emits)&&i.emits.length>0;
    const action=placeable?'<button type="button" data-place-item="'+esc(i.id)+'" '+(left<1?"disabled":"")+'>'+(left?"Place ("+left+" available)":"Already placed")+'</button>':consumable?'<button type="button" data-pour-item="'+esc(i.id)+'">Pour into a bowl</button>':'<button type="button" disabled>Use through object interaction</button>';
    return '<article class="hh-inventory-card"><img src="'+esc(i.image)+'" alt=""><strong>'+esc(i.name)+'</strong><small>Owned ×'+qty+(placeable?' · placed '+used:' · consumable')+'</small>'+action+'</article>';
  }).join("");
  qa("[data-place-item]",grid).forEach(b=>b.addEventListener("click",()=>placeItem(b.dataset.placeItem)));
  qa("[data-pour-item]",grid).forEach(b=>b.addEventListener("click",()=>openPourFlow(b.dataset.pourItem)));
}
function placeItem(id){
  const item=catalog().find(i=>i.id===id);if(!item||item.placementMode!=="room-object")return;const qty=quantity(id);if(placedCount(id)>=qty)return;
  const p=makePlacement(item);placements.push(p);selectedId=p.id;save();sync();renderInventory();renderPlacementList();
}
function duplicateSelected(){const p=selected();if(!p)return;const qty=quantity(p.itemId);if(placedCount(p.itemId)>=qty)return;const c=clone(p);c.id="placed-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);c.x+=28;c.y+=20;placements.push(c);selectedId=c.id;save();sync();renderInventory();renderPlacementList()}
function storeSelected(){if(!selectedId)return;placements=placements.filter(p=>p.id!==selectedId);selectedId=null;save();sync();renderInventory();renderPlacementList()}
function setEditor(on){editorEnabled=!!on;send("editor",{enabled:editorEnabled,selectedId});}
q("inventoryApplyBtn")?.addEventListener("click",updateFromFields);q("inventoryDuplicateBtn")?.addEventListener("click",duplicateSelected);q("inventoryStoreBtn")?.addEventListener("click",storeSelected);
q("inventoryNudgeLeft")?.addEventListener("click",()=>nudge(-8,0));q("inventoryNudgeRight")?.addEventListener("click",()=>nudge(8,0));q("inventoryNudgeUp")?.addEventListener("click",()=>nudge(0,-8));q("inventoryNudgeDown")?.addEventListener("click",()=>nudge(0,8));
q("inventoryOpenStore")?.addEventListener("click",()=>window.HappyHomeStore?.open?.());
panel.querySelectorAll(".decor-tab").forEach(b=>b.addEventListener("click",()=>{setTimeout(()=>{setEditor(panel.classList.contains("open")&&b.dataset.decorTab==="inventory");if(b.dataset.decorTab==="inventory"){renderInventory();renderPlacementList()}},0)}));
addEventListener("happy-home-decorating-toggle",e=>{if(!e.detail?.enabled)setEditor(false)});
addEventListener("happy-home-store-purchased",()=>{renderInventory();renderPlacementList()});
addEventListener("happy-home-store-inventory-changed",()=>{renderInventory();renderPlacementList()});
addEventListener("happy-home-store-use-item",e=>{const id=e.detail?.item?.id;if(id)openPourFlow(id)});
addEventListener("message",e=>{const d=e.data||{};if(d.source!=="hh-inventory-room")return;
  if(d.type==="ready"){ready=true;sync();return}
  if(d.type==="selected"){selectedId=d.placement?.id||null;renderPlacementList();return}
  if(d.type==="activate"){activatePlacement(d.id);return}
  if(d.type==="placement-preview"||d.type==="placement-updated"){const p=d.placement;if(!p?.id)return;const i=placements.findIndex(x=>x.id===p.id);if(i>=0)placements[i]={...placements[i],...p};else placements.push(p);selectedId=p.id;if(d.type==="placement-updated")save();renderPlacementEditor();return}
});
const storeButton=document.querySelector('.num-btn[data-system="5"]');
storeButton?.addEventListener("click",e=>{e.preventDefault();e.stopImmediatePropagation();window.HappyHomeStore?.open?.()},true);
frame.addEventListener("load",()=>setTimeout(sync,80));
updateOnyxDynamic();renderInventory();renderPlacementList();
window.HappyHomeInventoryPlacement=Object.freeze({getPlacements:()=>clone(placements),getBowlContents:id=>clone(placements.find(p=>p.id===id)?.contents||{}),sync,placeItem,storeSelected,setEditor,openPourFlow,pourIntoBowl});
})();
