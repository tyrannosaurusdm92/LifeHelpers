/* OurSpace × PrismShift: one persistent appearance setting for all standalone pages,
 * profiles and other surviving pages.
 * Internal game art, photos, videos, canvases, SVGs and image-backed corkboards remain original.
 * The engine uses adaptive recoloring; NEVER apply CSS invert() to the full document.
 */
(function(){
  'use strict';
  const STORAGE_KEY='ourspace:appearance:prismshift:v1';
  const MESSAGE_TYPE='ourspace:prismshift:set-mode';
  const SELECTOR_IGNORE=[
    '[data-prism-ignore]','[data-prism-preserve]','[data-no-dark]',
    'svg','picture','canvas','video','img','object','embed',
    // The actual corkboard and its pinned artwork are not a color-mode target.
    '#board-surface', '.board-surface',
    // Puzzle boards, ingredients, cats and level-map artwork are gameplay graphics;
    // their surrounding menus, result dialogs, chat and HUD remain themeable.
    '#gameMount .mm-grid', '#gameMount .mm-tile',
    '#gameMount .map-stage', '#gameMount .level-nodes',
    '[data-game-graphics]', '[data-preserve-original-color]'
  ].join(',');
  const root=document.documentElement;
  let engine=null,mode='light',toggle=null,ready=false;
  let gradientMap=new Map(),gradientObserver=null,gradientQueue=new Set(),gradientQueued=false;
  const mediaQuery='img,video,canvas,picture,svg,object,embed,iframe,audio';
  const safeGet=()=>{try{return localStorage.getItem(STORAGE_KEY)}catch{return null}};
  const safeStore=v=>{try{localStorage.setItem(STORAGE_KEY,v)}catch{}};
  const clean=v=>v==='dark'?'dark':'light';
  const inFrame=()=>{try{return window.self!==window.top}catch{return true}};
  const isIgnored=el=>{try{return !!(el?.closest?.(SELECTOR_IGNORE))}catch{return false}};
  const themeRoot=()=>root.setAttribute('data-os-color-mode',mode);
  // Image URLs, image pixels, CSS background-image URLs, logos, animated content and
  // the actual corkboard texture are never run through the color transformer.
  function darkenGradient(value){
    if(!value||!/(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(value)||/url\s*\(/i.test(value))return null;
    const api=window.PrismShiftEngine;if(!api?.parseColor||!api?.remapSurface)return null;
    const converted=value.replace(/#[0-9a-f]{3,8}\b|(?:rgb|rgba|hsl|hsla)\([^()]*\)/ig,token=>{
      const rgb=api.parseColor(token);if(!rgb||rgb.a<0.005)return token;
      return api.toCss(api.remapSurface(rgb,{surfaceLightness:0.255}));
    });
    return converted!==value?converted:null;
  }
  function restoreGradients(){
    if(gradientObserver)gradientObserver.disconnect();
    gradientQueue.clear();gradientQueued=false;
    for(const [el,state] of gradientMap){
      if(!el.isConnected)continue;
      if(state.value)el.style.setProperty('--os-prism-gradient',state.value,state.priority);
      else el.style.removeProperty('--os-prism-gradient');
      if(!state.hadClass)el.classList.remove('os-prism-gradient');
    }
    gradientMap.clear();
  }
  function transformGradientElement(el){
    if(!el||el.nodeType!==1||!el.isConnected||el.matches(mediaQuery)||isIgnored(el)||gradientMap.has(el))return;
    const css=getComputedStyle(el),converted=darkenGradient(css.backgroundImage);
    if(!converted)return;
    gradientMap.set(el,{value:el.style.getPropertyValue('--os-prism-gradient'),priority:el.style.getPropertyPriority('--os-prism-gradient'),hadClass:el.classList.contains('os-prism-gradient')});
    el.style.setProperty('--os-prism-gradient',converted);
    el.classList.add('os-prism-gradient');
  }
  function flushGradients(){
    gradientQueued=false;
    if(mode!=='dark')return;
    let remaining=170;
    for(const el of gradientQueue){gradientQueue.delete(el);transformGradientElement(el);if(--remaining<=0)break;}
    if(gradientQueue.size)scheduleGradientFlush();
  }
  function scheduleGradientFlush(){if(gradientQueued)return;gradientQueued=true;if(window.requestIdleCallback)window.requestIdleCallback(flushGradients,{timeout:200});else if(window.requestAnimationFrame)window.requestAnimationFrame(flushGradients);else setTimeout(flushGradients,0);}
  function enqueueGradients(node){
    if(!node||node.nodeType!==1)return;
    if(isIgnored(node))return;
    gradientQueue.add(node);
    if(node.querySelectorAll)for(const el of node.querySelectorAll('*')){if(!isIgnored(el)&&!el.matches(mediaQuery))gradientQueue.add(el);}
    scheduleGradientFlush();
  }
  function startGradientMonitor(){
    if(mode!=='dark')return;
    enqueueGradients(document.body||root);
    gradientObserver=new MutationObserver(records=>{
      for(const rec of records){if(rec.type==='childList')for(const n of rec.addedNodes)enqueueGradients(n);}
    });
    gradientObserver.observe(root,{childList:true,subtree:true});
  }
  function updateButton(){
    if(!toggle)return;
    const dark=mode==='dark';
    toggle.setAttribute('aria-pressed',String(dark));
    toggle.setAttribute('aria-label',dark?'Turn on light mode':'Turn on dark mode');
    toggle.setAttribute('title',dark?'Switch OurSpace to light mode':'Switch OurSpace to dark mode');
    const ico=toggle.querySelector('.os-appearance-icon');if(ico)ico.textContent=dark?'◐':'◑';
    const label=toggle.querySelector('.os-appearance-label');if(label)label.textContent=dark?'Light Mode':'Dark mode';
  }
  function broadcastToFrames(){
    for(const frame of document.querySelectorAll('iframe')){
      try{frame.contentWindow?.postMessage({type:MESSAGE_TYPE,mode},location.origin==='null'?'*':location.origin)}catch{}
    }
  }
  function setMode(next,{save=true,broadcast=true}={}){
    next=clean(next);
    if(mode===next&&ready){updateButton();if(broadcast)broadcastToFrames();return mode;}
    // Only PrismShift's adaptive color mode is used. No root filters are installed.
    if(mode==='dark')restoreGradients();
    mode=next;themeRoot();
    if(engine)engine.setMode(mode,{persist:false});
    if(mode==='dark')startGradientMonitor();
    updateButton();
    if(save)safeStore(mode);
    if(broadcast)broadcastToFrames();
    document.dispatchEvent(new CustomEvent('ourspace:appearancechange',{detail:{mode},bubbles:false}));
    return mode;
  }
  function createToggle(){
    // The sign-in/landing screen is public: it must never render the
    // members-only Messenger drawer, wallet, or custom scroll rail.
    if(document.querySelector('.portal-screen'))return;
    // Public profile views and unsigned visitors cannot open Messenger.
    if(new URLSearchParams(location.search).get('public')==='1')return;
    const auth=window.OurSpaceAuth;
    if(!auth?.isAuthenticated?.()||auth?.isAdmin?.())return;
    if(inFrame()||document.getElementById('osPrismShiftToggle'))return;
    if(document.getElementById('sidebar-messenger-root'))return;
    // On isolated pages show the
    // same small heart drawer so the appearance control is not an orphaned floating button.
    const portal=new URL(new URL(document.baseURI).pathname.includes('/assets/code/')?'../../ourspace.html':'ourspace.html',document.baseURI);portal.searchParams.set('page','communication');const destination=portal.href;
    const currentProfile=document.documentElement.dataset.profile||'william';
    const cached=(()=>{try{return JSON.parse(localStorage.getItem('ourspace.messenger.v3.'+currentProfile)||'{}')}catch(_){return {}}})();
    const cachedUnread=Object.values(cached.unread||{}).reduce((sum,n)=>sum+(Number(n)||0),0);
    const cachedMessages=Object.values(cached.messages||{}).reduce((sum,rows)=>sum+(Array.isArray(rows)?rows.length:0),0);
    // 📆 always means today's organizer items, never number of chat messages.
    const cachedToday=(()=>{
      try{
        const d=JSON.parse(localStorage.getItem('ourspace_household_organizer_v1')||'{}');
        const n=new Date(),localDate=`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
        const due=t=>{if(!t||t.active===false)return false;const f=t.frequency||'on_demand';if(f==='on_demand'||f==='daily')return true;
          if(f==='weekly')return (t.weekdays||[]).map(Number).includes(n.getDay());
          if(f==='monthly')return Number(t.dayOfMonth||1)===n.getDate();
          if(f==='annually')return Number(t.month||1)===n.getMonth()+1&&Number(t.dayOfMonth||1)===n.getDate();
          return t.date===localDate||t.dueDate===localDate;};
        const done=new Set((d.completions||[]).filter(x=>x.date===localDate&&!x.undoneAt).map(x=>x.taskId));
        const tasks=(d.tasks||[]).filter(t=>(!t.assignee||t.assignee==='shared'||t.assignee===currentProfile)&&due(t)&&!done.has(t.id));
        const events=(d.events||[]).filter(e=>(!e.assignee||e.assignee==='shared'||e.assignee===currentProfile)&&(e.date===localDate||e.startDate===localDate||e.frequency==='daily'));
        return tasks.length+events.length;
      }catch(_){return 0}
    })();
    const cachedMissed=Math.max(0,Number(cached.missedCalls)||0);
    const siteName=currentProfile==='jasper'?"Squishy's Cottage":currentProfile==='william'?'Dino Nerdzone':'OurSpace';
    const aside=document.createElement('aside');aside.id='osLiteMessenger';aside.className='os-lite-messenger';
    const heartMarkup='<svg class="os-lite-heart-art" viewBox="0 0 56 65" aria-hidden="true"><path fill="#00FFFF" stroke="#083F40" stroke-width="2.2" d="M28 60 C20 53 3 38 3 23 C3 11 10 5 18 5 C23 5 26 9 28 13 C31 8 35 5 41 5 C50 5 54 12 54 23 C54 38 38 52 28 60Z"/><path fill="#FFF600" d="M28 51 C20 43 10 34 10 23 C10 16 14 12 19 12 C23 12 26 17 28 20 C30 16 35 12 40 12 C45 12 48 17 48 23 C48 34 37 44 28 51Z"/></svg>';
    aside.innerHTML=`<div id="osLitePageScrollRail" class="os-lite-page-rail" role="scrollbar" aria-label="Scroll the OurSpace page" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0"><span class="os-lite-page-fill" aria-hidden="true"></span><button type="button" class="os-lite-heart" aria-label="Open Messenger drawer" aria-expanded="false" aria-controls="osLiteMessengerPanel">${heartMarkup}</button></div>
      <nav id="osLiteMessengerPanel" class="os-lite-panel" aria-label="Messenger shortcuts" hidden>
        <div class="os-lite-entries">
          <a href="${destination}"><span>⚡</span><strong>Quick Chat</strong></a>
          <a href="${destination}"><span>🗨️</span><strong>Chats</strong></a>
          <a href="${destination}"><span>🏰</span><strong>Rooms</strong></a>
          <a href="${destination}"><span>📞</span><strong>[${cachedMissed}] missed</strong></a>
          <a href="${destination}"><span>📌</span><strong>[${cachedMessages}] messages</strong></a>
          <a href="${destination}"><span>📆</span><strong>[${cachedToday}] today</strong></a>
        </div>
        <div class="os-lite-footer"><button type="button" id="osPrismShiftToggle" class="os-lite-mode" aria-pressed="false"><span class="os-appearance-icon">◑</span> <span class="os-appearance-label">Dark mode</span></button>
          <div class="os-lite-wallet"><strong>Currency tracker</strong><span class="os-lite-name">${siteName}</span><output class="os-lite-denoms">Copper 0 · Silver 0 · Gold 0 · Platinum 0</output><small>10:1 exchange</small></div></div>
      </nav>`;
    (document.body||root).appendChild(aside);
    const handle=aside.querySelector('.os-lite-heart'),panel=aside.querySelector('.os-lite-panel');
    const rail=aside.querySelector('#osLitePageScrollRail');
    const scrollDoc=()=>{const native=document.scrollingElement||document.documentElement,full=document.fullscreenElement;
      if(full){const options=[full,...full.querySelectorAll('*')].filter(el=>el!==aside&&!aside.contains(el)&&el.scrollHeight>el.clientHeight+8&&/auto|scroll|overlay/.test(getComputedStyle(el).overflowY));
        if(options.length){options.sort((a,b)=>(b.scrollHeight-b.clientHeight)-(a.scrollHeight-a.clientHeight));return options[0]}
        if(full.scrollHeight>full.clientHeight+8)return full;}
      return native;};
    const scrollRange=el=>Math.max(0,el.scrollHeight-el.clientHeight);
    const start=.256,travel=.488;
    const railFraction=y=>{const b=rail.getBoundingClientRect();return Math.max(0,Math.min(1,((y-b.top)/Math.max(1,b.height)-start)/travel))};
    function railSync(){const el=scrollDoc(),total=scrollRange(el),v=total?el.scrollTop/total:0;
      rail.style.setProperty('--os-lite-heart-position',`${(start+v*travel)*100}%`);
      rail.setAttribute('aria-valuenow',String(Math.round(v*100)));rail.setAttribute('aria-disabled',String(!total));}
    function scrollToAt(y){const el=scrollDoc(),total=scrollRange(el);if(!total)return;el.scrollTop=railFraction(y)*total;railSync()}
    let dragId=null,heartDrag=null,suppressClick=false;
    rail.addEventListener('pointerdown',e=>{if(e.target===handle||handle.contains(e.target)||panel.hidden)return;if(e.button!==0&&e.pointerType!=='touch')return;e.preventDefault();dragId=e.pointerId;rail.setPointerCapture(dragId);scrollToAt(e.clientY)});
    rail.addEventListener('pointermove',e=>{if(e.pointerId===dragId)scrollToAt(e.clientY)});
    const release=e=>{if(dragId!==e.pointerId)return;dragId=null;try{rail.releasePointerCapture(e.pointerId)}catch(_){}};
    rail.addEventListener('pointerup',release);rail.addEventListener('pointercancel',release);
    handle.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType!=='touch')return;heartDrag={id:e.pointerId,startY:e.clientY,moved:false};handle.setPointerCapture(e.pointerId)});
    handle.addEventListener('pointermove',e=>{if(!heartDrag||heartDrag.id!==e.pointerId)return;if(Math.abs(e.clientY-heartDrag.startY)>6)heartDrag.moved=true;if(heartDrag.moved&&!panel.hidden){e.preventDefault();scrollToAt(e.clientY)}});
    handle.addEventListener('pointerup',e=>{if(!heartDrag||heartDrag.id!==e.pointerId)return;suppressClick=heartDrag.moved&&!panel.hidden;heartDrag=null;try{handle.releasePointerCapture(e.pointerId)}catch(_){}});
    handle.addEventListener('pointercancel',()=>{heartDrag=null;suppressClick=false});
    rail.addEventListener('wheel',e=>{if(panel.hidden)return;const el=scrollDoc();if(!scrollRange(el))return;e.preventDefault();el.scrollTop+=e.deltaY;railSync()},{passive:false});
    rail.addEventListener('keydown',e=>{if(e.target!==rail)return;const el=scrollDoc(),delta={'ArrowDown':48,'ArrowUp':-48,'PageDown':el.clientHeight*.85,'PageUp':-el.clientHeight*.85,Home:-Infinity,End:Infinity}[e.key];if(delta===undefined)return;e.preventDefault();el.scrollTop=delta===Infinity?scrollRange(el):delta===-Infinity?0:el.scrollTop+delta;railSync()});
    document.addEventListener('scroll',railSync,{capture:true,passive:true});window.addEventListener('resize',railSync,{passive:true});
    handle.addEventListener('click',e=>{if(suppressClick){e.preventDefault();suppressClick=false;return}panel.hidden=!panel.hidden;handle.setAttribute('aria-expanded',String(!panel.hidden));handle.setAttribute('aria-label',panel.hidden?'Open Messenger drawer':'Close Messenger drawer');requestAnimationFrame(railSync)});
    toggle=aside.querySelector('#osPrismShiftToggle');
    toggle.addEventListener('click',()=>setMode(mode==='dark'?'light':'dark'));
    function wallet(){let total=0;try{const data=JSON.parse(localStorage.getItem('ourspace_household_organizer_v1')||'{}');const m=(data.household?.members||[]).find(x=>x.id===currentProfile);total=Math.max(0,Math.floor(Number(m?.walletCopper)||0));}catch(_){}const w={platinum:Math.floor(total/1000),gold:Math.floor(total%1000/100),silver:Math.floor(total%100/10),copper:total%10};
      aside.querySelector('.os-lite-denoms').textContent=`Copper ${w.copper} · Silver ${w.silver} · Gold ${w.gold} · Platinum ${w.platinum}`;}
    wallet();window.addEventListener('storage',wallet);
    // If a standalone page is itself made fullscreen, keep the drawer visible.
    const parent=aside.parentNode;
    document.addEventListener('fullscreenchange',()=>{const fs=document.fullscreenElement;if(fs&&!fs.contains(aside))fs.appendChild(aside);else if(!fs&&aside.parentNode!==parent)parent.appendChild(aside);requestAnimationFrame(railSync)});
    updateButton();
  }
  function bootstrap(){
    if(ready)return;ready=true;
    const api=window.PrismShiftEngine;
    if(!api?.PrismShift){console.error('OurSpace appearance: PrismShift engine unavailable');return;}
    // Use only adaptive mode: filter invert() changes all pixels, including corkboard art.
    engine=new api.PrismShift({root:document,mode:'light',remember:false,syncTabs:false,
      strategy:'adaptive',observe:true,observeShadows:true,observeIframes:false,
      frameBudget:300,surfaceLightness:0.255,minimumContrast:4.5,
      ignoreSelector:SELECTOR_IGNORE,mediaCorrection:false
    });
    engine.start();
    themeRoot();
    createToggle();
    setMode(clean(safeGet()||root.getAttribute('data-os-color-mode')), {save:false});
    // Frame navigation may occur while dark mode is selected.
    document.addEventListener('load',event=>{
      if(event.target?.tagName==='IFRAME'){
        try{event.target.contentWindow?.postMessage({type:MESSAGE_TYPE,mode},location.origin==='null'?'*':location.origin)}catch{}
      }
    },true);
    window.addEventListener('storage',event=>{
      if(event.key===STORAGE_KEY)setMode(clean(event.newValue),{save:false});
    });
    window.addEventListener('message',event=>{
      if(event.source!==window.parent||!inFrame())return;
      if(event.origin!=='null'&&location.origin!=='null'&&event.origin!==location.origin)return;
      if(event.data?.type===MESSAGE_TYPE)setMode(event.data.mode,{save:false});
    });
    // Global API for modules/widgets that want to reflect or explicitly set appearance.
    window.OurSpaceAppearance=Object.freeze({
      get mode(){return mode},get engine(){return engine},
      setMode:next=>setMode(next),toggle:()=>setMode(mode==='dark'?'light':'dark')
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootstrap,{once:true});else bootstrap();
})();
