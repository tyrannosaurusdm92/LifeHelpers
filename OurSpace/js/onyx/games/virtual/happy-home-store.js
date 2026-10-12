(()=>{
  "use strict";
  const catalog=Array.isArray(window.HAPPY_HOME_STORE_CATALOG)?window.HAPPY_HOME_STORE_CATALOG:[];
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const modal=$("#happyHomeStore"),grid=$("#happyStoreGrid"),search=$("#happyStoreSearch"),category=$("#happyStoreCategory"),count=$("#happyStoreCount"),ownedReadout=$("#happyStoreOwned");
  if(!modal||!grid)return;

  const STORE_KEY="happy_home_inventory_v3";
  const GROUP_ORDER=Object.freeze(["Food","Treats","Beds","Bowls","Fountains","Toys","Tablets","Other"]);
  let inventory={},query="",cat="all";
  try{inventory=JSON.parse(localStorage.getItem(STORE_KEY)||"{}")||{}}catch(_){inventory={}}

  const esc=value=>String(value??"").replace(/[&<>\"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"}[char]));
  const money=item=>window.OnyxCurrency?.format?.(item?.price?.totalCopper||0)||`${Math.max(0,Number(item?.price?.totalCopper||0)|0)}c`;
  const qty=id=>Math.max(0,Number(inventory[id]||0)|0);
  const item=id=>catalog.find(entry=>entry.id===id)||null;
  const groupOf=entry=>entry.storeGroup||entry.category||"Other";
  function persist(){try{localStorage.setItem(STORE_KEY,JSON.stringify(inventory))}catch(_){}}

  const footer=ownedReadout?.parentElement;
  const balanceReadout=document.createElement("span");
  balanceReadout.id="happyStoreBalance";
  balanceReadout.className="hh-store-balance";
  balanceReadout.dataset.onyxCurrencyBalance="";
  balanceReadout.setAttribute("aria-label","Store balance");
  footer?.insertBefore(balanceReadout,ownedReadout||null);
  const status=document.createElement("div");
  status.id="happyStoreStatus";
  status.className="hh-store-status";
  status.setAttribute("role","status");
  status.setAttribute("aria-live","polite");
  modal.querySelector(".hh-store-shell")?.append(status);
  function note(message,tone="info"){
    status.textContent=message;
    status.dataset.tone=tone;
    status.hidden=!message;
  }

  function groups(){
    const present=[...new Set(catalog.map(groupOf))];
    return present.sort((a,b)=>{
      const ai=GROUP_ORDER.indexOf(a),bi=GROUP_ORDER.indexOf(b);
      return (ai<0?GROUP_ORDER.length:ai)-(bi<0?GROUP_ORDER.length:bi)||a.localeCompare(b);
    });
  }
  category.innerHTML='<option value="all">ALL STORE</option>'+groups().map(value=>`<option value="${esc(value)}">${esc(value).toUpperCase()}</option>`).join("");

  function visible(){
    const term=query.toLowerCase();
    return catalog.filter(entry=>{
      const group=groupOf(entry);
      if(cat!=="all"&&group!==cat)return false;
      return !term||(`${entry.name} ${entry.category} ${entry.notes||""} ${entry.scene||""}`).toLowerCase().includes(term);
    });
  }
  function render(){
    const entries=visible(),ownedIds=Object.keys(inventory).filter(key=>qty(key)>0),currency=window.OnyxCurrency;
    count.textContent=`${entries.length} of ${catalog.length} objects`;
    ownedReadout.textContent=`${ownedIds.length} types owned · ${ownedIds.reduce((total,key)=>total+qty(key),0)} total`;
    balanceReadout.textContent=currency?.format?.()||"Balance unavailable";
    balanceReadout.dataset.totalCopper=String(currency?.getState?.().totalCopper||0);
    if(modal.hidden){grid.innerHTML="";return}
    grid.innerHTML=entries.map(entry=>{
      const amount=qty(entry.id),owned=amount>0,group=groupOf(entry),canUse=entry.placementMode==="inventory-consumable"&&owned;
      const buyText=owned&&!entry.repeatable?"OWNED":owned&&entry.repeatable?"BUY AGAIN":"BUY";
      const affordable=Boolean(currency?.canAfford?.(entry.price?.totalCopper||0));
      return `<article class="hh-store-card" data-group="${esc(group)}"><div class="hh-store-image"><img loading="lazy" src="${esc(entry.image)}" alt="${esc(entry.name)}"></div><div class="hh-store-info"><h3>${esc(entry.name)}</h3><div class="hh-store-meta"><span>${esc(group)}</span><span>${esc(money(entry))}</span></div><div class="hh-store-badges"><span>${esc(entry.interactiveType||"object")}</span>${entry.assetKind?.includes("interactive")?"<span>interactive</span>":""}${owned?`<span>owned ×${amount}</span>`:""}</div><div class="hh-store-note">${esc(entry.notes||entry.source||"")}</div><div class="hh-store-actions"><button class="hh-store-buy ${owned&&!entry.repeatable?"is-owned":""} ${!affordable?"is-unaffordable":""}" type="button" data-store-buy="${esc(entry.id)}" ${owned&&!entry.repeatable?"disabled":""}>${buyText}</button>${canUse?`<button class="hh-store-use" type="button" data-store-use="${esc(entry.id)}">USE ×${amount}</button>`:""}</div></div></article>`;
    }).join("")||"<p>No store items match.</p>";
    $$('[data-store-buy]',grid).forEach(button=>button.addEventListener("click",()=>buy(button.dataset.storeBuy)));
    $$('[data-store-use]',grid).forEach(button=>button.addEventListener("click",()=>use(button.dataset.storeUse)));
  }
  function buy(id){
    const entry=item(id);
    if(!entry||(!entry.repeatable&&qty(id)>0))return;
    const price=Math.max(0,Number(entry.price?.totalCopper)||0);
    if(price<=0){note("This item has no valid price and cannot be purchased.","error");return}
    if(!window.OnyxCurrency){note("The shared wallet is unavailable. No purchase was made.","error");return}
    const request=new CustomEvent("happy-home-store-purchase-request",{cancelable:true,detail:{item:entry,price:entry.price,source:"Botanical Garden Store"}});
    if(!window.dispatchEvent(request))return;
    const payment=window.OnyxCurrency.spend(price,{reason:`Botanical Garden: ${entry.name}`,source:"virtual-health-store"});
    if(!payment.ok){
      note(`You need ${window.OnyxCurrency.format(payment.shortfall||price)} more for ${entry.name}. Earn currency in Feed Him MEOW, widget tools, or Work.`,"insufficient");
      window.dispatchEvent(new CustomEvent("happy-home-store-purchase-denied",{detail:{item:entry,price:entry.price,payment}}));
      render();
      return;
    }
    inventory[id]=qty(id)+1;
    persist();
    note(`Purchased ${entry.name} for ${window.OnyxCurrency.format(price)}.`,"success");
    window.dispatchEvent(new CustomEvent("happy-home-store-purchased",{detail:{item:entry,price:entry.price,quantity:qty(id),payment}}));
    render();
  }
  function use(id){const entry=item(id);if(!entry||qty(id)<1)return;window.dispatchEvent(new CustomEvent("happy-home-store-use-item",{detail:{item:entry,quantity:qty(id)}}))}
  function consume(id,amount=1){
    const current=qty(id);amount=Math.max(1,Number(amount)||1);
    if(current<amount)return false;
    inventory[id]=current-amount;if(inventory[id]<=0)delete inventory[id];persist();
    window.dispatchEvent(new CustomEvent("happy-home-store-inventory-changed",{detail:{item:item(id),id,quantity:qty(id),inventory:{...inventory}}}));render();return true;
  }
  function open(){modal.hidden=false;modal.setAttribute("aria-hidden","false");document.querySelector(".game-page")?.classList.add("store-open");search.focus();window.OnyxCurrency?.refresh?.();note("Store purchases use the shared balance earned in games, widget tools, and Work.");render()}
  function close(){modal.hidden=true;modal.setAttribute("aria-hidden","true");document.querySelector(".game-page")?.classList.remove("store-open")}
  function toggle(){modal.hidden?open():close()}

  search.addEventListener("input",()=>{query=search.value;render()});
  category.addEventListener("change",()=>{cat=category.value;render()});
  $("#happyStoreClose")?.addEventListener("click",close);
  $("#happyStoreClear")?.addEventListener("click",()=>{search.value="";category.value="all";query="";cat="all";render()});
  modal.addEventListener("click",event=>{if(event.target===modal)close()});
  addEventListener("keydown",event=>{if(!modal.hidden&&event.key==="Escape"){event.preventDefault();event.stopImmediatePropagation();close()}},true);
  addEventListener("onyx-currency-change",render);
  addEventListener("onyx-currency-refresh",render);
  window.HappyHomeStore=Object.freeze({open,close,toggle,isOpen:()=>!modal.hidden,getOwned:()=>Object.keys(inventory).filter(key=>qty(key)>0),getInventory:()=>({...inventory}),getQuantity:qty,isOwned:id=>qty(id)>0,getItem:item,consume,catalog});
  render();
})();
