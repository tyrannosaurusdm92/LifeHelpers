/* OurSpace × PrismShift: one persistent appearance setting for all standalone pages,
 * profiles, Skills, DBT worksheets, embedded widgets and game HUDs.
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
    // Visual assets are intentionally never darkened or inverted.
    '#recordPlayerFlow','.wordmark','.os-wordmark','.ourspace-logo',
    '#ourspaceLogo','[data-os-original-art]','[data-image-asset]',
    '#board-surface','.board-surface','#board-grid','#board-items',
    '[data-design-protected="bubble-interior"]',
    '#slowPetGame .game-scene','#slowPetGame .game-canvas',
    '#slowPetGame .game-world','#slowPetGame .game-map',
    '#slowPetGame .gameplay-surface','#slowPetGame .picnic-board',
    '#gameMount canvas','#gameMount img',
    '.picnic-board','.picnic-game-board','.onyx-static-image',
    // The actual corkboard and its pinned artwork are not a color-mode target.
    '#board-surface', '.board-surface',
    // Puzzle boards, ingredients, cats and level-map artwork are gameplay graphics;
    // their surrounding menus, result dialogs, chat and HUD remain themeable.
    '#gameMount .mm-grid', '#gameMount .mm-tile',
    '#gameMount .map-stage', '#gameMount .level-nodes',
    '.picnic-cat-sprite','.cat-sprite','.character-sprite',
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
    const label=toggle.querySelector('.os-appearance-label');if(label)label.textContent=dark?'Light Mode':'Dark Mode';toggle.classList.toggle('os-show-light',dark);
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
    if(inFrame()||document.documentElement.hasAttribute('data-os-design-widget-standalone')||document.getElementById('osPrismShiftToggle'))return;
    toggle=document.createElement('button');
    toggle.type='button';toggle.id='osPrismShiftToggle';toggle.className='os-appearance-toggle';window.__osDemoAppearanceToggle=toggle;
    toggle.setAttribute('data-prism-ignore','');toggle.setAttribute('aria-pressed','false');
    toggle.innerHTML='<span class="os-appearance-icon" aria-hidden="true">◑</span><span class="os-appearance-label">Dark Mode</span>';
    toggle.addEventListener('click',()=>setMode(mode==='dark'?'light':'dark'));
    const footer=document.getElementById('osMessengerFooter');
    const messengerScroll=document.querySelector('#sidebar-messenger-root .mp-menu-scroll');
    (footer||messengerScroll||document.body||root).appendChild(toggle);
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
      setMode:(next,options)=>setMode(next,options),toggle:()=>setMode(mode==='dark'?'light':'dark')
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootstrap,{once:true});else bootstrap();
})();

