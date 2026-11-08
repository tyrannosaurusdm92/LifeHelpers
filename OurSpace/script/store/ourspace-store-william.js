/* Native OurSpace Store. Keeps the source catalog and shopping/cart logic, gated to this page.
 No iframe, Shadow DOM, standalone HTML or duplicate designer. */
(()=>{'use strict';
if(document.documentElement.dataset.ourspaceCurrentPage!=='store'||!window.OurSpaceAuth?.authorize?.(document.documentElement.dataset.profile))return;
window.STORE_CATALOG=[];window.STORE_CONFIG={"backendUrl":"","currency":"OurSpace fake platinum/gold/silver/copper","realMoney":false,"cashValue":false,"storeId":"dino-store","title":"Dino Store","theme":"dino","mode":"human","storeOwnerProfile":"william","requiredBuyerProfile":"william","subtitle":"Dino Store","heroTitle":"Something for Dino","heroText":"William can spend earned OurSpace currency here. Checkout saves a Dino Store request receipt.","relationshipNote":"William / Dino uses Dino Store."};


(()=>{
'use strict';
const cfg=window.STORE_CONFIG||{};
const catalog=[];
const storeRoot=document.getElementById('osStoreModule');
const $=(s,r=document)=>(r===document?storeRoot:r)?.querySelector(s), $$=(s,r=document)=>[...(r===document?storeRoot:r)?.querySelectorAll(s)||[]];
const state={query:'',category:'all',sort:'featured',affordable:false,shown:36,cart:new Map(),owned:new Map(),profile:'',token:'',balance:null,orders:[],busy:false};
const profileNames={william:'William / Dino',jasper:'Jasper / Squishy'};
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function totalCopper(item){return Number(item?.price?.totalCopper||0)}
function money(n){n=Math.max(0,Math.floor(Number(n)||0));const p=Math.floor(n/1000),g=Math.floor(n/100)%10,s=Math.floor(n/10)%10,c=n%10,a=[];if(p)a.push(`${p}p`);if(g)a.push(`${g}g`);if(s)a.push(`${s}s`);if(c||!a.length)a.push(`${c}c`);return a.join(' ')}
function findToken(){return window.OurSpaceAuth?.token?.()||''}
function findProfile(){return window.OurSpaceAuth?.profile?.()||document.documentElement.dataset.profile||''}
async function api(action,data={}){
 if(!state.token)throw new Error('Sign in to use OurSpace currency.');
 const result=await window.OurSpaceAuth.request(action,data);
 if(result?.ok===false)throw new Error(result.error||result.message||'Request failed');
 return result?.data&&typeof result.data==='object'?{...result,...result.data}:result;
}
function toast(msg,type=''){const t=$('#toast');t.className='toast '+type;t.textContent=msg;t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>t.hidden=true,5200)}
function setStatus(msg,type=''){const el=$('#status');el.className='notice '+type;el.textContent=msg;el.hidden=!msg}
function saveCart(){try{localStorage.setItem(`ourspace_store_cart_${cfg.storeId}`,JSON.stringify([...state.cart.entries()]))}catch{}}
function loadCart(){try{const v=JSON.parse(localStorage.getItem(`ourspace_store_cart_${cfg.storeId}`)||'[]');state.cart=new Map(Array.isArray(v)?v:[])}catch{state.cart=new Map()}}
function saveOwnedLocal(){try{localStorage.setItem(`ourspace_onyx_owned_${state.profile||'unknown'}`,JSON.stringify([...state.owned.entries()]))}catch{}}
function loadOwnedLocal(){if(cfg.mode!=='onyx')return;try{const v=JSON.parse(localStorage.getItem(`ourspace_onyx_owned_${state.profile||'unknown'}`)||'[]');state.owned=new Map(Array.isArray(v)?v:[])}catch{state.owned=new Map()}}
function buyerAllowed(){return cfg.mode==='onyx'||(state.profile&&state.profile===cfg.requiredBuyerProfile)}
function checkoutReason(){if(!state.token)return 'Sign in to use OurSpace currency.';if(cfg.mode!=='onyx'&&!buyerAllowed())return `${cfg.title} is for ${profileNames[cfg.storeOwnerProfile]}; ${profileNames[cfg.requiredBuyerProfile]} checks out so the fulfillment receipt goes to ${profileNames[cfg.storeOwnerProfile]}.`;return ''}
async function hydrateIdentity(){state.token=findToken();state.profile=findProfile();$('#connection').textContent=state.token?'Checking session…':'Catalog mode';if(state.token){try{const me=await api('me',{});const p=(me.user?.profileKey||me.session?.profileKey||state.profile||'').toLowerCase();if(['william','jasper'].includes(p))state.profile=p;$('#connection').textContent='OurSpace connected';}catch(e){$('#connection').textContent='Session needs sign-in';setStatus(e.message,'error')}}else setStatus('Catalog is available, but checkout is disabled until this page is opened from a signed-in OurSpace session.','');loadOwnedLocal();updateIdentity();if(state.token)await Promise.allSettled([refreshBalance(),cfg.mode==='onyx'?refreshOwned():refreshOrders()]);}
function updateIdentity(){const p=$('#profile');p.textContent=state.profile?profileNames[state.profile]:'Not signed in';const reason=checkoutReason();$('#buyer-note').textContent=reason||cfg.relationshipNote||'';renderAll()}
async function refreshBalance(){try{const out=await api('currency.balance',{});const b=out.balance||{};state.balance=Number(b.totalCopper??b.total_copper_units??out.balanceCopper??0);$('#balance').textContent=money(state.balance)}catch(e){$('#balance').textContent='—';if(!$('#status').textContent)setStatus(e.message,'error')}renderProducts();renderCart()}
function categories(){return [...new Set(catalog.map(i=>i.category||'Other'))].sort((a,b)=>a.localeCompare(b))}
function initFilters(){const s=$('#category');s.innerHTML='<option value="all">All categories</option>'+categories().map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}
function filterItems(){let arr=catalog.filter(i=>{const q=state.query.toLowerCase();const hay=`${i.name} ${i.category} ${i.notes||''} ${i.source||''}`.toLowerCase();if(q&&!hay.includes(q))return false;if(state.category!=='all'&&i.category!==state.category)return false;if(state.affordable&&state.balance!=null&&totalCopper(i)>state.balance)return false;return true});if(state.sort==='price-low')arr.sort((a,b)=>totalCopper(a)-totalCopper(b));else if(state.sort==='price-high')arr.sort((a,b)=>totalCopper(b)-totalCopper(a));else if(state.sort==='name')arr.sort((a,b)=>a.name.localeCompare(b.name));else if(state.sort==='category')arr.sort((a,b)=>a.category.localeCompare(b.category)||a.name.localeCompare(b.name));return arr}
function isOwned(i){return state.owned.has(i.id)||state.owned.has(i.backendItemId)}
function productVisual(i){if(i.image)return `<img loading="lazy" src="${esc(i.image)}" alt="">`;if(cfg.mode==='onyx'){if(i.effectType==='house-area-unlock')return '🏠';if(i.effectType==='design-tier-unlock')return '🛠️';if(i.effectType==='studio-blank-mesh')return '⬜';return '🐈‍⬛'}return esc(i.emoji||'🎁')}
function renderProducts(){const arr=filterItems(),shown=arr.slice(0,state.shown);$('#count').textContent=`${shown.length} of ${arr.length} items`;$('#products').innerHTML=shown.map(i=>{const owned=isOwned(i),restricted=!!i.restrictedCheckout,afford=state.balance==null||totalCopper(i)<=state.balance,reason=checkoutReason();let label=cfg.mode==='onyx'?(owned&&!i.repeatable?'Owned':'Unlock now'):'Add to cart';let disabled=restricted||!!reason||(!afford&&state.balance!=null)||(cfg.mode==='onyx'&&owned&&!i.repeatable);let details=[];if(i.tierName)details.push(i.tierName);if(i.source)details.push(i.source);if(i.palette)details.push(i.palette);return `<article class="product-card ${restricted?'restricted':''}" data-id="${esc(i.id)}"><div class="product-image">${productVisual(i)}</div><div class="product-body"><div class="meta"><span class="tag">${esc(i.category)}</span>${details.slice(0,2).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}${restricted?'<span class="tag">reference only</span>':''}</div><h3>${esc(i.name)}</h3><div class="product-note">${esc(restricted?'This source entry is preserved as reference data only and is not checkout-enabled in this build.':(i.notes||''))}</div><div class="price" aria-label="Price ${esc(money(totalCopper(i)))}">${esc(money(totalCopper(i)))}</div><div class="card-actions"><button class="buy" data-buy="${esc(i.id)}" ${disabled?'disabled':''}>${esc(label)}</button><button class="buy" type="button" data-wish-catalog="${esc(i.id)}">Add to wishlist</button></div></div></article>`}).join('')||'<div class="empty">No items match these filters.</div>';$('#loadMore').hidden=shown.length>=arr.length;$('[data-buy]').forEach(b=>b.addEventListener('click',()=>handleBuy(b.dataset.buy)));$('[data-wish-catalog]').forEach(b=>b.addEventListener('click',()=>void addCatalogWish(b.dataset.wishCatalog)))}
function cartItem(id){return catalog.find(i=>i.id===id)}
function handleBuy(id){const i=cartItem(id);if(!i)return;if(cfg.mode==='onyx')return autoBuyOnyx(i);if(i.restrictedCheckout)return toast('This source entry is reference-only in this build.','error');const n=Number(state.cart.get(id)||0)+1;state.cart.set(id,n);saveCart();renderCart();toast(`${i.name} added to cart.`)}
function renderCart(){if(cfg.mode==='onyx'){renderOwned();return}const rows=[...state.cart.entries()].map(([id,q])=>[cartItem(id),q]).filter(([i])=>i);$('#cartList').innerHTML=rows.length?rows.map(([i,q])=>`<div class="cart-row"><div><h4>${esc(i.name)}</h4><p>${esc(money(totalCopper(i)))} each</p></div><div class="qty"><button data-minus="${esc(i.id)}" aria-label="Remove one ${esc(i.name)}">−</button><strong>${q}</strong><button data-plus="${esc(i.id)}" aria-label="Add one ${esc(i.name)}">+</button></div></div>`).join(''):'<div class="empty">Your cart is empty.</div>';const total=rows.reduce((s,[i,q])=>s+totalCopper(i)*q,0);$('#cartTotal').textContent=money(total);const reason=checkoutReason();$('#checkout').disabled=!rows.length||!!reason||(state.balance!=null&&total>state.balance);$$('[data-minus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));$$('[data-plus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));}
function changeQty(id,d){const q=Number(state.cart.get(id)||0)+d;if(q<=0)state.cart.delete(id);else state.cart.set(id,q);saveCart();renderCart()}
function openCheckout(){const rows=[...state.cart.entries()].map(([id,q])=>[cartItem(id),q]).filter(([i])=>i);if(!rows.length)return;$('#checkoutSummary').innerHTML=rows.map(([i,q])=>`<div class="cart-row"><div><h4>${esc(i.name)}</h4><p>Qty ${q}</p></div><strong>${esc(money(totalCopper(i)*q))}</strong></div>`).join('');$('#checkoutModal').hidden=false;$('#orderNote').focus()}
async function submitCheckout(){if(state.busy)return;const reason=checkoutReason();if(reason)return toast(reason,'error');const rows=[...state.cart.entries()].map(([id,q])=>[cartItem(id),q]).filter(([i])=>i),total=rows.reduce((s,[i,q])=>s+totalCopper(i)*q,0);if(!rows.length)return;state.busy=true;$('#placeOrder').disabled=true;try{const items=rows.map(([i,q])=>({id:i.id,name:i.name,title:i.name,quantity:q,unitCostCopper:totalCopper(i),totalCopper:totalCopper(i)*q,category:i.category,source:i.source||'',notes:i.notes||'',fulfillmentProfile:cfg.storeOwnerProfile}));const out=await api('purchase.create',{profileKey:state.profile,storeName:cfg.title,items,totalCopper:total,spendCurrency:true,status:'requested',note:$('#orderNote').value.trim(),storeOwnerProfile:cfg.storeOwnerProfile,fulfillmentProfile:cfg.storeOwnerProfile,realMoney:false,cashValue:false});state.cart.clear();saveCart();$('#checkoutModal').hidden=true;$('#orderNote').value='';toast(`Order ${out.purchaseId||''} sent to ${profileNames[cfg.storeOwnerProfile]} for fulfillment.`,'success');setStatus(`Order placed with fake OurSpace currency. ${profileNames[cfg.storeOwnerProfile]} receives the fulfillment receipt through the existing backend flow.`,'success');await Promise.allSettled([refreshBalance(),refreshOrders()]);renderCart()}catch(e){toast(e.message,'error');setStatus(e.message,'error')}finally{state.busy=false;$('#placeOrder').disabled=false}}
async function refreshOrders(){if(!state.token)return;try{const out=await api('purchase.list',{});state.orders=out.rows||out.items||out.purchases||[];renderOrders()}catch{}}
function renderOrders(){const el=$('#ordersList');if(!el)return;const rows=state.orders.filter(o=>String(o.storeName||o.StoreName||'').toLowerCase().includes(cfg.title.toLowerCase())).slice(-15).reverse();el.innerHTML=rows.length?rows.map(o=>`<div class="owned-row"><div><h4>${esc(o.storeName||o.StoreName||cfg.title)}</h4><p>${esc(o.status||o.Status||'requested')} • ${esc(o.createdAt||o.CreatedAt||'')}</p></div><strong>${esc(money(o.totalCopper||o.TotalCopper||0))}</strong></div>`).join(''):'<div class="empty">No recent orders from this store.</div>'}
async function refreshOwned(){loadOwnedLocal();if(!state.token){renderOwned();return}try{const [rec,inv]=await Promise.allSettled([api('record.list',{bucket:'onyx-store-owned'}),api('onyx.inventory.list',{})]);const remote=new Map();if(rec.status==='fulfilled'){for(const r of (rec.value.records||[])){const v=r.json?tryJson(r.json):r.value||r.Json||{};const val=typeof v==='object'?v:tryJson(v);const id=val?.item?.id||val?.itemId||r.key||r.Key;if(id){const prev=remote.get(id);remote.set(id,{...val,source:'record',quantity:Number(prev?.quantity||0)+1});}}}if(inv.status==='fulfilled'){for(const row of (inv.value.inventory||[])){const item=row.item||{};const id=item.itemId||item.ItemId||row.itemId||row.ItemId;if(id)remote.set(id,{item:{id,name:item.name||item.Name||id,category:item.category||item.Category||'Backend Onyx Inventory'},quantity:Number(row.quantity||row.Quantity||1),source:'onyx.inventory'});}}if(remote.size)state.owned=remote;saveOwnedLocal()}catch{}renderOwned();renderProducts()}
function tryJson(v){try{return typeof v==='string'?JSON.parse(v):v}catch{return {}}}
function renderOwned(){const el=$('#cartList');if(!el)return;const vals=[...state.owned.values()];el.innerHTML=vals.length?vals.slice().reverse().slice(0,60).map(v=>{const item=v.item||v;const found=catalog.find(x=>x.id===item.id||x.backendItemId===item.id);const name=found?.name||item.name||item.id||'Onyx item';const mesh=found?.assetPath?`<a class="mesh-link" href="${esc(found.assetPath)}" download>Open blank mesh</a>`:'';return `<div class="owned-row"><div><h4>${esc(name)}</h4><p>${esc(found?.category||item.category||'Owned')}</p>${mesh}</div><span>✓</span></div>`}).join(''):'<div class="empty">Onyx has not unlocked anything from this storefront yet.</div>';$('#cartTotal').textContent=`${vals.length} owned`}
async function autoBuyOnyx(i){if(state.busy)return;const reason=checkoutReason();if(reason)return toast(reason,'error');if(isOwned(i)&&!i.repeatable)return;state.busy=true;renderProducts();const purchaseKey=`onyxlocal_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;try{let backendNative=false;let result=null;if(i.backendNative&&i.backendItemId){try{result=await api('onyx.shop.purchase',{profileKey:state.profile,itemId:i.backendItemId,note:'Purchased from Onyx Store frontend'});backendNative=true}catch{backendNative=false}}
if(!backendNative){const amount=totalCopper(i);if(amount>0)await api('currency.spend',{profileKey:state.profile,amountCopper:amount,reason:`Onyx Store: ${i.name}`,sourceType:'onyx-store-frontend',sourceId:purchaseKey});try{await api('record.save',{profileKey:state.profile,bucket:'onyx-store-owned',recordId:purchaseKey,key:i.id,value:{schema:'ourspace.onyx.store.owned.v1',purchaseId:purchaseKey,purchasedAt:new Date().toISOString(),item:i,automaticFulfillment:true,realMoney:false}})}catch(err){if(amount>0){try{await api('currency.earn',{profileKey:state.profile,amountCopper:amount,reason:`Rollback failed Onyx Store fulfillment: ${i.name}`,sourceType:'onyx-store-rollback',sourceId:purchaseKey+':rollback'})}catch{}}throw err}}
const ownedValue={item:i,purchaseId:result?.purchaseId||purchaseKey,purchasedAt:new Date().toISOString(),automaticFulfillment:true};if(i.repeatable){const old=state.owned.get(i.id)||{item:i,quantity:0};ownedValue.quantity=Number(old.quantity||0)+1}state.owned.set(i.id,ownedValue);saveOwnedLocal();toast(`${i.name} unlocked for Onyx automatically.`,'success');setStatus('Purchase complete. This Onyx Store item was fulfilled automatically; no human seller action is required.','success');await Promise.allSettled([refreshBalance(),refreshOwned()])}catch(e){toast(e.message,'error');setStatus(e.message,'error')}finally{state.busy=false;renderProducts()}}
function setupEvents(){const q=$('#search');q.addEventListener('input',()=>{state.query=q.value;state.shown=36;renderProducts()});$('#category').addEventListener('change',e=>{state.category=e.target.value;state.shown=36;renderProducts()});$('#sort').addEventListener('change',e=>{state.sort=e.target.value;renderProducts()});$('#affordable').addEventListener('change',e=>{state.affordable=e.target.checked;renderProducts()});$('#loadMore').onclick=()=>{state.shown+=36;renderProducts()};$('#checkout')?.addEventListener('click',openCheckout);$('#closeCheckout')?.addEventListener('click',()=>$('#checkoutModal').hidden=true);$('#cancelCheckout')?.addEventListener('click',()=>$('#checkoutModal').hidden=true);$('#placeOrder')?.addEventListener('click',submitCheckout);$('#refreshBalance').onclick=()=>refreshBalance();$('#mobileCart').onclick=()=>$('#sidebar').classList.toggle('open');$('#closeSidebar').onclick=()=>$('#sidebar').classList.remove('open');document.addEventListener('keydown',e=>{if(e.key==='Escape'){const m=$('#checkoutModal');if(m)m.hidden=true;$('#sidebar').classList.remove('open')}})}
let wishlistPanel=null,wishlistItems=[];
const wishlistService=()=>window.OurSpaceWishlist;
const linkSafe=value=>{try{const u=new URL(value);return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}};
const displayPlatinum=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString()+' platinum';
function prepareWishlistCart(item){
 const id='custom-wish-'+item.id;
 let product=catalog.find(x=>x.id===id);
 if(!product){
  const totalCopper=item.pricePlatinum*1000;
  if(!Number.isSafeInteger(totalCopper))throw Error('Wishlist value is too large for the cart.');
  product={id,name:item.name,category:'Wishlist',notes:'Wishlist request only; external purchase is not automatic.',
   source:item.url,image:item.image||'',emoji:'🎁',price:{totalCopper}};
  catalog.push(product);
 }
 return product;
}
function renderWishlist(){
 if(!wishlistPanel)return;
 const list=wishlistPanel.querySelector('[data-wishlist-items]');
 list.innerHTML=wishlistItems.length?wishlistItems.map(item=>`<article class="product-card" data-wishlist-id="${esc(item.id)}">
  <div class="product-image">${item.image?`<img src="${esc(item.image)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'🎁'}</div>
  <div class="product-body"><h3>${esc(item.name)}</h3>
   <div class="price">${esc(displayPlatinum(item.pricePlatinum))}</div>
   <div class="card-actions">${item.url?`<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">View item</a>`:'<span>OurSpace catalog item</span>'}
    <button class="buy" type="button" data-wishlist-cart="${esc(item.id)}">Add to cart</button>
    <button class="buy" type="button" data-wishlist-remove="${esc(item.id)}">Remove</button>
   </div></div></article>`).join(''):'<p class="empty">Your wishlist is empty. Add an item from the store or paste a shopping link.</p>';
 for(const btn of wishlistPanel.querySelectorAll('[data-wishlist-remove]'))
  btn.addEventListener('click',async()=>{
   btn.disabled=true;try{await wishlistService().remove(btn.dataset.wishlistRemove);await refreshWishlist()}
   catch(err){toast('Could not remove wishlist item: '+err.message,'error')}finally{btn.disabled=false}
  });
 for(const btn of wishlistPanel.querySelectorAll('[data-wishlist-cart]'))
  btn.addEventListener('click',()=>{
   const item=wishlistItems.find(x=>x.id===btn.dataset.wishlistCart);
   if(!item)return;
   try{const entry=prepareWishlistCart(item);handleBuy(entry.id)}
   catch(err){toast(err.message,'error')}
  });
}
async function refreshWishlist(){
 if(!wishlistService()?.available?.())return;
 try{
  wishlistItems=await wishlistService().list();
  wishlistItems.forEach(prepareWishlistCart);
  renderWishlist();
 }catch(err){toast('Wishlist is unavailable: '+err.message,'error')}
}
async function addCatalogWish(id){
 const item=catalog.find(x=>x.id===id);
 if(!item)return;
 if(!wishlistService()?.available?.())return toast('Sign in to use wishlists.','error');
 const url=linkSafe(item.sourceUrl||item.url||item.productUrl||item.link);
 // Canonical catalog items have stable IDs even without external shopping links.
 try{
  const value=Math.floor(totalCopper(item)/1000);
  await wishlistService().add({id:'catalog-'+item.id,catalogItemId:item.id,
   name:item.name,url,image:linkSafe(item.image),pricePlatinum:value});
  await refreshWishlist();toast('Added to your wishlist and partner Feed.','success');
 }catch(err){toast('Could not add to wishlist: '+err.message,'error')}
}
async function previewWishlistImage(){
 if(!wishlistPanel)return;
 const input=wishlistPanel.querySelector('[name="wishUrl"]'),
  image=wishlistPanel.querySelector('[name="wishImage"]');
 if(!input||!image)return;
 const url=linkSafe(input.value.trim());
 if(!url)return toast('Enter an HTTPS product link first.','error');
 if(/\.(?:png|jpe?g|webp|gif|avif)(?:[?#]|$)/i.test(url)){
  image.value=url;return toast('Product image URL detected.','success');
 }
 try{
  // Remote storefronts often prohibit cross-origin previews. No cookies/tokens sent.
  const r=await fetch(url,{method:'GET',credentials:'omit',referrerPolicy:'no-referrer',mode:'cors',signal:AbortSignal.timeout(9000)});
  if(!r.ok)throw Error('The store blocked a preview request.');
  const doc=new DOMParser().parseFromString((await r.text()).slice(0,250000),'text/html');
  const src=doc.querySelector('meta[property="og:image"],meta[name="twitter:image"]')?.content||'';
  const resolved=linkSafe(new URL(src,url).href);
  if(!resolved)throw Error('No product image was found.');
  image.value=resolved;
  if(!wishlistPanel.querySelector('[name="wishName"]').value){
   wishlistPanel.querySelector('[name="wishName"]').value=
    (doc.querySelector('meta[property="og:title"]')?.content||doc.title||'').slice(0,160);
  }
  toast('Image and product title discovered.','success');
 }catch(_){toast('This shop does not allow automatic previews here. Paste an image URL instead.','error')}
}
function installWishlist(){
 if(cfg.mode==='onyx'||!storeRoot||wishlistPanel)return;
 wishlistPanel=document.createElement('section');
 wishlistPanel.className='store-section';
 wishlistPanel.setAttribute('aria-label','Wishlist');
 wishlistPanel.innerHTML=`<div class="product-body"><h2>Wishlist</h2>
 <p>Your saved gift ideas appear on the other member's Feed. Platinum values are personal estimates, not real prices.</p>
 <form data-wishlist-form>
  <label>Item label <input required name="wishName" maxlength="160" placeholder="Comforter set"></label>
  <label>Shopping URL <input required name="wishUrl" type="url" placeholder="https://www.walmart.com/..."></label>
  <label>Image URL (optional) <input name="wishImage" type="url" placeholder="https://...image.jpg"></label>
  <button class="buy" type="button" data-wishlist-preview>Find image from link</button>
  <label>Estimated value in platinum <input required name="wishPlatinum" type="number" min="0" max="1000000000" step="1" placeholder="10000"></label>
  <button class="buy" type="submit">Add to wishlist</button>
 </form></div><div data-wishlist-items></div>`;
 storeRoot.append(wishlistPanel);
 wishlistPanel.querySelector('[data-wishlist-preview]').addEventListener('click',()=>void previewWishlistImage());
 wishlistPanel.querySelector('[data-wishlist-form]').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,btn=form.querySelector('[type="submit"]');
  const fields=new FormData(form);
  btn.disabled=true;
  try{
   await wishlistService().add({name:String(fields.get('wishName')||''),
    url:String(fields.get('wishUrl')||''),image:String(fields.get('wishImage')||''),
    pricePlatinum:Number(fields.get('wishPlatinum'))});
   form.reset();await refreshWishlist();toast('Wishlist updated and shared on partner Feed.','success');
  }catch(err){toast('Wishlist was not saved: '+err.message,'error')}
  finally{btn.disabled=false}
 });
 void refreshWishlist();
}
function renderAll(){renderProducts();renderCart();renderOrders()}
async function init(){document.getElementById('osStoreModule')?.classList.add('theme-'+cfg.theme);$('#storeTitle').textContent=cfg.title;$('#storeSubtitle').textContent=cfg.subtitle;$('#heroTitle').textContent=cfg.heroTitle;$('#heroText').textContent=cfg.heroText;$('#sidebarTitle').textContent=cfg.mode==='onyx'?'Owned by Onyx':'Cart';if(cfg.mode==='onyx'){$('#checkout').hidden=true;$('#checkoutModal').remove();$('#sidebarHint').textContent='Automatic fulfillment inventory';}else $('#sidebarHint').textContent=`Receipt goes to ${profileNames[cfg.storeOwnerProfile]}`;await hydrateIdentity();
 try{
  const localCatalog=await window.OurSpaceCanonical.catalog('shop');
  if(localCatalog.profile!==cfg.storeOwnerProfile)throw new Error('Store account mismatch.');
  catalog.splice(0,catalog.length,...localCatalog.entries.map(window.OurSpaceCanonical.toStoreItem));
  window.dispatchEvent(new CustomEvent('ourspace:canonical:store-ready',{detail:{profile:localCatalog.profile,count:catalog.length}}));
 }catch(error){console.warn('[OurSpace] Canonical store unavailable:',error.message);catalog.splice(0);const status=$('#status');if(status){status.hidden=false;status.textContent='Catalog unavailable. Check the OurSpace JSON files.';}}
 initFilters();loadCart();setupEvents();renderAll();installWishlist()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();

})();
