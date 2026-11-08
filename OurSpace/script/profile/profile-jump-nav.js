/* Shared original Jump Nav bubble: page-specific links, movable and collapsible. */
(()=>{'use strict';
 if(new URLSearchParams(location.search).get('public')==='1')return;
 const $=(s,r=document)=>r.querySelector(s);
 const host=$('#profileJumpNav'),bubble=$('#profileJumpBubble'),menu=$('#profileJumpMenu'),links=$('#profileJumpLinks');
 if(!host||!bubble||!menu||!links)return;
 const who=document.documentElement.dataset.profile||'william';
 const page=document.documentElement.dataset.ourspaceCurrentPage||new URLSearchParams(location.search).get('page')||'profile';
 const sizeKey='ourspace.jump-menu.size.'+who, positionKey='ourspace.jump-nav.position.v2.'+who+'.'+page;
 const titles={profile:'Profile',household:'Household',skills:'Skills & DBT',journal:'Journal & Diary Cards',feed:'Feed',communication:'Communication',audio:'Audio',visual:'Visual',store:'Store'};

 // The separate current Onyx widget registers with this established Jump Nav hook.
 const onyxButton=$('#profileJumpOnyxToggle'),onyxStatus=$('#profileJumpOnyxStatus');
 const onyxVisibilityKey='ourspace.onyx.jump.visible.v1.'+who+'.'+page;
 let onyxDesired=null,onyxAdapter=null;
 const onyxRoots=new Set();
 try{
  const saved=localStorage.getItem(onyxVisibilityKey);
  if(saved==='true'||saved==='false')onyxDesired=saved==='true';
 }catch(_){}
 const onyxSelectors='[data-ourspace-onyx-widget],#onyxWidgetRoot,#onyx-widget-root,#onyxWidget';
 function widgetRoots(){
  const found=new Set();
  for(const el of document.querySelectorAll(onyxSelectors))found.add(el);
  for(const el of onyxRoots)if(el?.isConnected)found.add(el);else onyxRoots.delete(el);
  return [...found].filter(el=>{
   const scope=el.getAttribute('data-onyx-page')||el.closest('[data-ourspace-page]')?.getAttribute('data-ourspace-page');
   return !scope||scope===page;
  });
 }
 function widgetAvailable(){return widgetRoots().length>0||!!onyxAdapter}
 function widgetVisible(){
  if(onyxDesired!==null)return onyxDesired;
  if(onyxAdapter&&typeof onyxAdapter.isVisible==='function'){
   try{return !!onyxAdapter.isVisible({profileKey:who,page})}catch(_){}
  }
  return widgetRoots().some(el=>!el.hidden&&el.getAttribute('aria-hidden')!=='true');
 }
 function updateOnyxButton(){
  if(!onyxButton)return;
  const wanted=widgetVisible(),available=widgetAvailable();
  onyxButton.setAttribute('aria-pressed',String(wanted));
  onyxButton.setAttribute('aria-label',(wanted?'Hide':'Show')+' Onyx\'s Widget on '+(titles[page]||page));
  onyxButton.title=available?(wanted?'Hide':'Show')+' Onyx\'s Widget on this page':'Widget not installed; the visibility hook is ready';
  if(onyxStatus)onyxStatus.textContent=!available?(wanted?'Show when widget is connected':'Widget not connected'):(wanted?'Visible on this page · click to hide':'Hidden on this page · click to show');
 }
 function applyOnyxVisibility(visible,source,notify){
  onyxDesired=!!visible;
  try{localStorage.setItem(onyxVisibilityKey,String(onyxDesired))}catch(_){}
  for(const el of widgetRoots()){
   el.hidden=!onyxDesired;
   el.classList.toggle('os-onyx-hook-hidden',!onyxDesired);
   el.setAttribute('aria-hidden',String(!onyxDesired));
  }
  if(onyxAdapter){
   try{
    const handler=onyxDesired?onyxAdapter.show:onyxAdapter.hide;
    if(typeof handler==='function')handler.call(onyxAdapter,{profileKey:who,page,visible:onyxDesired,source});
   }catch(err){console.warn('OurSpace Onyx adapter visibility hook:',err)}
  }
  updateOnyxButton();
  if(notify!==false)document.dispatchEvent(new CustomEvent('ourspace:onyx-widget-visibility',{
   bubbles:true,detail:{visible:onyxDesired,profileKey:who,page,source:source||'jump-nav'}
  }));
  return onyxDesired;
 }
 function refreshOnyxWidget(){
  if(onyxDesired!==null)applyOnyxVisibility(onyxDesired,'widget-ready',true);
  else updateOnyxButton();
 }
 onyxButton?.addEventListener('click',()=>applyOnyxVisibility(!widgetVisible(),'jump-nav',true));
 document.addEventListener('ourspace:onyx-widget-ready',refreshOnyxWidget);
 // A future widget may mount after the page has loaded; do not modify or re-create it.
 if(typeof MutationObserver==='function'&&document.body){
  const widgetObserver=new MutationObserver(list=>{
   let found=false;
   for(const record of list){for(const node of record.addedNodes){
    if(node.nodeType!==1)continue;
    if(node.matches?.(onyxSelectors)||node.querySelector?.(onyxSelectors)){found=true;break}
   }if(found)break}
   if(found)refreshOnyxWidget();
  });
  widgetObserver.observe(document.body,{subtree:true,childList:true});
 }
 window.OurSpaceOnyxJumpHook={
  isVisible:widgetVisible,
  show:()=>applyOnyxVisibility(true,'api',true),
  hide:()=>applyOnyxVisibility(false,'api',true),
  toggle:()=>applyOnyxVisibility(!widgetVisible(),'api',true),
  register(root){
   const node=typeof root==='string'?document.querySelector(root):root;
   if(!node||node.nodeType!==1)throw new Error('Onyx widget root must be a DOM element or selector.');
   onyxRoots.add(node);refreshOnyxWidget();return node;
  },
  registerAdapter(adapter){
   if(!adapter||typeof adapter.show!=='function'||typeof adapter.hide!=='function')
    throw new Error('Onyx adapter requires show() and hide() methods.');
   onyxAdapter=adapter;refreshOnyxWidget();return true;
  },
  refresh:refreshOnyxWidget
 };
 updateOnyxButton();

 // Design Widget uses the existing OurSpace Design Studio; no duplicate panel or
 // legacy widget code is created. This launcher follows the page jump links.
 // Preferences are scoped to the signed-in account and the current page.
 const designButton=$('#profileJumpDesignToggle'),designStatus=$('#profileJumpDesignStatus');
 const designVisibilityKey='ourspace.design.jump.visible.v1.'+who+'.'+page;
 let designDesired=null;
 try{
  const saved=localStorage.getItem(designVisibilityKey);
  if(saved==='true'||saved==='false')designDesired=saved==='true';
 }catch(_){}
 function designRoot(){return $('#designWidget')}
 function designPanel(){return $('#designerPanel')}
 function designAvailable(){return !!(designRoot()||window.OurSpaceDesignWidget)}
 function designActive(){
  if(designDesired!==null)return designDesired;
  const root=designRoot(),panel=designPanel();
  return !!(root&&!root.hidden&&panel&&!panel.hidden);
 }
 function updateDesignButton(){
  if(!designButton)return;
  const active=designActive(),available=designAvailable();
  designButton.setAttribute('aria-pressed',String(active));
  designButton.setAttribute('aria-label',
   (active?'Hide':'Open')+' Design Widget on '+(titles[page]||page));
  designButton.title=available?(active?'Hide':'Open')+' Design Widget on this page':
   'Design Widget not connected; launcher is ready';
  if(designStatus)designStatus.textContent=!available?'Widget not connected':
   active?'Visible on this page · click to hide':'Open design editor';
 }
 function setDesignVisibility(visible,source,notify){
  designDesired=!!visible;
  try{localStorage.setItem(designVisibilityKey,String(designDesired))}catch(_){}
  const root=designRoot();
  if(root){
   root.hidden=!designDesired;
   root.classList.toggle('os-design-jump-hidden',!designDesired);
   root.setAttribute('aria-hidden',String(!designDesired));
  }
  if(designDesired){
   // Opening via the Jump Nav opens the real editor rather than a second copy.
   // If the panel was already expanded before being hidden, preserve its state.
   const panel=designPanel();
   if(!panel||panel.hidden){
    if(typeof window.OurSpaceDesignWidget?.open==='function'){
     try{window.OurSpaceDesignWidget.open()}catch(err){console.warn('OurSpace Design Widget open:',err)}
    }else{
     // A late-loaded replacement may respond to the event or explicit hook.
     const bubble=$('#designerBubble');if(bubble&&!bubble.hidden)bubble.click();
    }
   }
  }
  updateDesignButton();
  if(notify!==false)document.dispatchEvent(new CustomEvent('ourspace:design-widget-visibility',{
   bubbles:true,detail:{visible:designDesired,profileKey:who,page,source:source||'jump-nav'}
  }));
  return designDesired;
 }
 function refreshDesignWidget(){
  if(designDesired!==null){
   const root=designRoot();
   if(root){
    root.hidden=!designDesired;
    root.classList.toggle('os-design-jump-hidden',!designDesired);
    root.setAttribute('aria-hidden',String(!designDesired));
   }
  }
  updateDesignButton();
 }
 designButton?.addEventListener('click',()=>setDesignVisibility(!designActive(),'jump-nav',true));
 document.addEventListener('ourspace:design-widget-ready',refreshDesignWidget);
 // Keep labels in sync when the user opens or collapses the original floating widget.
 document.addEventListener('click',e=>{
  if(!e.target.closest?.('#designerBubble,#designerClose'))return;
  requestAnimationFrame(()=>{
   if(designDesired===null)updateDesignButton();
   else if(e.target.closest('#designerBubble')){
    designDesired=true;
    try{localStorage.setItem(designVisibilityKey,'true')}catch(_){}
    updateDesignButton();
   }else if(e.target.closest('#designerClose')&&designRoot()&&!designRoot().hidden){
    // Closing the editor leaves its original movable bubble available.
    // A subsequent nav click can open it again instead of unexpectedly hiding it.
    designDesired=null;
    try{localStorage.removeItem(designVisibilityKey)}catch(_){}
    updateDesignButton();
   }
  });
 });
 window.OurSpaceDesignJumpHook={
  isVisible:designActive,
  open:()=>setDesignVisibility(true,'api',true),
  show:()=>setDesignVisibility(true,'api',true),
  hide:()=>setDesignVisibility(false,'api',true),
  toggle:()=>setDesignVisibility(!designActive(),'api',true),
  refresh:refreshDesignWidget
 };
 if(designDesired!==null)setDesignVisibility(designDesired,'restore',false);
 else updateDesignButton();

 let size={width:310,height:420};
 try{const a=JSON.parse(localStorage.getItem(sizeKey)||'null');if(a)size={width:Math.max(220,Math.min(750,Number(a.width)||310)),height:Math.max(170,Math.min(850,Number(a.height)||420))}}catch(_){}
 let position=null;try{const s=JSON.parse(localStorage.getItem(positionKey)||'null');if(Number.isFinite(s?.x)&&Number.isFinite(s?.y))position=s}catch(_){}
 function railLeft(){
   const drawer=$('#sidebar-messenger-root');
   const isOpen=drawer?.classList.contains('os-drawer-open');
   const css=getComputedStyle(document.documentElement);
   const railWidth=Math.max(28,parseFloat(css.getPropertyValue('--os-page-heart-rail-width'))||36);
   if(!isOpen)return Math.max(76,innerWidth-railWidth-8);
   const drawerWidth=parseFloat(css.getPropertyValue('--os-sidebar-drawer-width'))||246;
   return Math.max(60,innerWidth-drawerWidth-railWidth-8);
 }
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function availableRight(){return Math.max(65,railLeft()-8)}
 function applySize(){
   menu.style.width=Math.max(140,Math.min(innerWidth-16,availableRight()-8,size.width))+'px';
   menu.style.height=Math.min(innerHeight-80,size.height)+'px';
 }
 // Position the Jump NAV on the left, away from the centered right-edge heart.
 function defaultPosition(){return{x:Math.min(80,Math.max(6,availableRight()-65)),y:Math.max(8,Math.min(innerHeight-62,innerHeight*.30))}}
 function applyPosition(){
   const p=position||defaultPosition();
   let x=clamp(p.x,6,Math.max(6,availableRight()-58));
   const y=clamp(p.y,6,Math.max(6,innerHeight-58));
   const heart=$('#osMessengerDrawerHeart');
   if(heart){const r=heart.getBoundingClientRect();if(x<r.right+6&&x+52>r.left-6&&y<r.bottom+6&&y+52>r.top-6)x=clamp(r.left-62,6,Math.max(6,availableRight()-58))}
   host.style.left=Math.round(x)+'px';host.style.top=Math.round(y)+'px';host.style.right='auto';
   const isRight=x>innerWidth*.48;host.dataset.dock=isRight?'right':'left';
   if(isRight){menu.style.left='auto';menu.style.right='0'}else{menu.style.right='auto';menu.style.left='0'}
   return{x,y}
 }
 const entries=new Map();
 function add(id,label,selector,tab){if(!selector)return;const node=typeof selector==='string'?$(selector):selector;if(!node||entries.has(id))return;entries.set(id,{node,label,tab})}
 function collect(){entries.clear();links.replaceChildren();
  if(page==='profile'){
   for(const section of document.querySelectorAll('#profileApp .profile-column > section.profile-box')){
    if(!section.id)continue;add(section.id,section.querySelector('.box-head .label')?.textContent?.trim()||section.dataset.designLabel||section.id,section)}
  }else{
   const section=$('[data-ourspace-page="'+(page==='diary'?'journal':page)+'"]');
   if(section){add('top','Page top',section);
    if(page==='journal'){
     add('journal-tab','Journal','#jdFrameJournal','journal');add('diary-tab','Diary Card','#jdFrameDiary','diary');
     const heads=[...section.querySelectorAll('.jd-page-heading h1,.jd-tabs button')];
     heads.forEach((h,i)=>{if(i>1)return;const tab=h.dataset.jdTab; if(tab)add('tab-'+tab,h.textContent.trim(),tab==='diary'?'#jdFrameDiary':'#jdFrameJournal',tab)})
    }
    if(page==='communication'){
     [['conversations','Conversations','#oscom-conversations'],['messages','Messages','#oscom-thread'],['pinned','Pinned messages','#oscomPinnedOverview'],['composer','Compose message','#oscom-compose-form']].forEach(([a,b,c])=>add(a,b,c));
    }
    if(page==='store'){
     [['catalog','Catalog','[data-ourspace-page="store"] #products'],['cart','Shopping cart','[data-ourspace-page="store"] #cart'],['checkout','Checkout','[data-ourspace-page="store"] [id*="checkout" i]']].forEach(([a,b,c])=>add(a,b,c));
    }
    const common='h1,h2,h3,[data-jump-anchor],.module-hd,.osm-section-title,.ospv-section-title';
    [...section.querySelectorAll(common)].filter(el=>el.getClientRects().length>0).slice(0,45).forEach((el,i)=>{
     const label=el.getAttribute('data-jump-label')||el.textContent?.replace(/\s+/g,' ').trim().slice(0,54);
     if(label&&label.length>1&&![...entries.values()].some(v=>v.label.toLowerCase()===label.toLowerCase()))add('section-'+i,label,el)
    });
   }else add('top','Page top','#ourspacePageArea');
  }
  for(const [id,item] of [...entries].slice(0,38)){
   const button=document.createElement('button');button.type='button';button.textContent=item.label;button.dataset.jumpTo=id;links.append(button)
  }
  if(!links.children.length)links.textContent='No sections on this page.';
  menu.querySelector('header strong').textContent=(titles[page]||'This page')+' · Jump';
 }
 function open(){collect();applySize();applyPosition();menu.hidden=false;bubble.setAttribute('aria-expanded','true')}
 function close(){menu.hidden=true;bubble.setAttribute('aria-expanded','false')}
 let dragging=null,blockedClick=false;
 bubble.addEventListener('pointerdown',e=>{if(e.button!==0)return;const p=applyPosition();dragging={id:e.pointerId,x:e.clientX,y:e.clientY,ox:p.x,oy:p.y,moved:false};bubble.setPointerCapture(e.pointerId)});
 bubble.addEventListener('pointermove',e=>{if(!dragging||dragging.id!==e.pointerId)return;const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;if(Math.hypot(dx,dy)<5&&!dragging.moved)return;dragging.moved=true;position={x:dragging.ox+dx,y:dragging.oy+dy};applyPosition()});
 bubble.addEventListener('pointerup',e=>{if(!dragging||dragging.id!==e.pointerId)return;blockedClick=dragging.moved;if(dragging.moved){const p=applyPosition();position=p;try{localStorage.setItem(positionKey,JSON.stringify(position))}catch(_){}}dragging=null;try{bubble.releasePointerCapture(e.pointerId)}catch(_){}});
 bubble.addEventListener('pointercancel',()=>dragging=null);
 bubble.addEventListener('click',()=>{if(blockedClick){blockedClick=false;return}menu.hidden?open():close()});
 $('#profileJumpClose')?.addEventListener('click',close);
 links.addEventListener('click',e=>{const btn=e.target.closest('[data-jump-to]');if(!btn)return;const item=entries.get(btn.dataset.jumpTo);if(!item)return;
  if(item.tab){const t=document.querySelector('[data-jd-tab="'+item.tab+'"]')||document.querySelector('[data-tab="'+item.tab+'"].jd-tab');t?.click()}
  close();requestAnimationFrame(()=>item.node.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}))
 });
 let resizing=null;
 for(const handle of menu.querySelectorAll('[data-jump-resize]')){
  handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();const r=menu.getBoundingClientRect();resizing={dir:handle.dataset.jumpResize,x:e.clientX,y:e.clientY,w:r.width,h:r.height,id:e.pointerId};handle.setPointerCapture(e.pointerId)});
  handle.addEventListener('pointermove',e=>{if(!resizing||resizing.id!==e.pointerId)return;const dx=e.clientX-resizing.x,dy=e.clientY-resizing.y,d=resizing.dir;size.width=Math.max(220,Math.min(innerWidth-16,resizing.w+(d.includes('e')?dx:d.includes('w')?-dx:0)));size.height=Math.max(170,Math.min(innerHeight-80,resizing.h+(d.includes('s')?dy:d.includes('n')?-dy:0)));applySize()});
  handle.addEventListener('pointerup',e=>{if(!resizing)return;resizing=null;try{handle.releasePointerCapture(e.pointerId)}catch(_){}try{localStorage.setItem(sizeKey,JSON.stringify(size))}catch(_){}});
 }
 bubble.addEventListener('keydown',e=>{if(e.altKey&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const p=applyPosition();position={x:p.x+(e.key==='ArrowLeft'?-16:e.key==='ArrowRight'?16:0),y:p.y+(e.key==='ArrowUp'?-16:e.key==='ArrowDown'?16:0)};position=applyPosition();try{localStorage.setItem(positionKey,JSON.stringify(position))}catch(_){}}});
 window.addEventListener('resize',()=>{applySize();applyPosition()});
 window.addEventListener('ourspace:messenger-drawer-state',()=>{applySize();applyPosition()});
 applySize();applyPosition();
 // Rail is populated after the jump script; adjust to the real rail geometry on arrival.
 const railObserver=new MutationObserver(()=>applyPosition());const rail=$('#sidebar-messenger-root');if(rail)railObserver.observe(rail,{childList:true,attributes:true,attributeFilter:['class','data-drawer-state'],subtree:false});
 window.OurSpaceJumpNav={open,close,refresh:collect,reset(){position=null;localStorage.removeItem(positionKey);applyPosition()}};
})();