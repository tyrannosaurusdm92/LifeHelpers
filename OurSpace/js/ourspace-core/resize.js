/* OurSpace floating navigation resizer.
   Scope is deliberately narrow. Regular modules, cards, workspace panels,
   iframe viewports and the footer Messenger are NEVER resize targets.
   Onyx's external widget has its own existing responsive resize module.
*/
(() => {
  'use strict';
  const EDGES = ['n','s','e','w','nw','ne','sw','se'];
  const MIN = .75, MAX = 2;
  const account = document.documentElement.dataset.profile === 'jasper' ? 'jasper' : 'william';
  const keyPrefix = `ourspace/${account}/nav-popouts-pass11/`;
  const registered = new WeakMap();
  const targets = '.master-nav, .site-page .jump-nav > .jump-panel, .our-jump > .our-jump-panel, .os-floating-menu, .os-popout-menu, [data-os-resizable-menu]';
  const clamp = (v,min,max) => Math.max(min, Math.min(v,max));
  const store = {
    read(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    write(key,val) { try { localStorage.setItem(key,val); } catch (_) {} }
  };
  let selected = null;
  let nextScan = false;
  function label(el) {
    if (el.matches('.master-nav')) return 'Master nav';
    if (el.matches('.jump-panel')) return 'Jump nav';
    return (el.getAttribute('aria-label') || el.querySelector('h2,h3')?.textContent || 'Pop-out menu').trim().slice(0,48);
  }
  function status() {
    let node = document.getElementById('osNavSizeIndicator');
    if (!node) {
      node = document.createElement('output');
      node.id = 'osNavSizeIndicator';
      node.className = 'os-nav-size-indicator';
      node.setAttribute('aria-live','off');
      document.body.appendChild(node);
    }
    return node;
  }
  function select(rec) {
    selected?.el.classList.remove('os-nav-selected');
    selected = rec;
    rec.el.classList.add('os-nav-selected');
    updateStatus(rec);
  }
  function percent(rec) {
    const width = rec.el.offsetWidth || rec.base.w;
    const height = rec.el.offsetHeight || rec.base.h;
    const relative = Math.sqrt(width / rec.base.w * height / rec.base.h);
    return Math.round(clamp(relative,MIN,MAX) * 100);
  }
  function updateStatus(rec) {
    if (selected === rec) status().textContent = `${rec.label} · ${percent(rec)}%`;
  }
  function save(rec) {
    store.write(rec.key,JSON.stringify({w:rec.el.offsetWidth,h:rec.el.offsetHeight}));
    updateStatus(rec);
  }
  // Style special anchored jump navigation using its existing CSS custom properties.
  function size(rec,w,h) {
    const el = rec.el;
    const rect=el.getBoundingClientRect();
    const layoutWidth=el.offsetWidth || rect.width;
    const visualScale=Math.max(.1,rect.width / Math.max(1,layoutWidth));
    const viewportW=Math.max(100,(innerWidth - 16) / visualScale);
    const viewportH=Math.max(100,(innerHeight - 26) / visualScale);
    w=clamp(w,Math.min(rec.base.w*MIN,viewportW),Math.min(rec.base.w*MAX,viewportW));
    h=clamp(h,Math.min(rec.base.h*MIN,viewportH),Math.min(rec.base.h*MAX,viewportH));
    if(el.matches('.our-jump-panel')) {
      el.parentElement?.style.setProperty('--our-panel-width',w+'px');
      el.parentElement?.style.setProperty('--our-panel-height',h+'px');
      el.style.height=h+'px';
    } else {
      el.style.setProperty('width',w+'px');
      el.style.setProperty('height',h+'px');
      if(el.matches('.jump-panel')) el.style.maxHeight='calc(100dvh - 28px)';
    }
    el.dispatchEvent(new CustomEvent('bottomdragresize', {bubbles:true,detail:{width:w,height:h,scale:percent(rec)/100}}));
    updateStatus(rec);
  }
  function reset(rec) {
    const el=rec.el;
    if(el.matches('.our-jump-panel')) {
      el.parentElement?.style.removeProperty('--our-panel-width');
      el.parentElement?.style.removeProperty('--our-panel-height');
    }
    for(const k of ['width','height','max-height'])el.style.removeProperty(k);
    store.write(rec.key,'');
    updateStatus(rec);
  }
  function pointer(rec,edge,event) {
    if(event.button !== undefined && event.button !== 0)return;
    event.preventDefault();event.stopPropagation();
    select(rec);
    const handle=event.currentTarget;
    const start={x:event.clientX,y:event.clientY,w:rec.el.offsetWidth,h:rec.el.offsetHeight};
    const rect=rec.el.getBoundingClientRect();
    const scale=Math.max(.1,rect.width / Math.max(1,start.w));
    try{handle.setPointerCapture(event.pointerId)}catch(_){}
    function move(ev) {
      const dx=(ev.clientX-start.x)/scale,dy=(ev.clientY-start.y)/scale;
      const w=(edge.includes('w')||edge.includes('e'))?start.w+(edge.includes('w')?-dx:dx):start.w;
      const h=(edge.includes('n')||edge.includes('s'))?start.h+(edge.includes('n')?-dy:dy):start.h;
      size(rec,w,h);
    }
    function end() {
      handle.removeEventListener('pointermove',move);
      handle.removeEventListener('pointerup',end);
      handle.removeEventListener('pointercancel',end);
      try{handle.releasePointerCapture(event.pointerId)}catch(_){}
      save(rec);
    }
    handle.addEventListener('pointermove',move);
    handle.addEventListener('pointerup',end);
    handle.addEventListener('pointercancel',end);
  }
  function install(el) {
    if(registered.has(el) || el.closest('#messenger-plugin-root,#ourOnyxLayer,#page-portal,.portal-auth-panel'))return;
    // Do not resize internal iframe frames, ordinary cards, modules or outer page containers.
    if(el.matches('iframe,.module,.card,.site-page,.shell,.page-frame,#skillsBookFrame,#blankProofFrame'))return;
    if(getComputedStyle(el).display === 'none' || !el.offsetWidth || !el.offsetHeight)return;
    const id=el.id || el.closest('[data-jump-nav]')?.dataset.jumpNav || Array.from(document.querySelectorAll(targets)).indexOf(el);
    const rec={el,label:label(el),key:keyPrefix+id,base:{w:el.offsetWidth,h:el.offsetHeight}};
    registered.set(el,rec);
    el.classList.add('os-nav-resizable');
    if(getComputedStyle(el).position === 'static')el.style.position='relative';
    const saved=store.read(rec.key);
    if(saved) {try {const s=JSON.parse(saved);if(Number.isFinite(s.w)&&Number.isFinite(s.h))size(rec,s.w,s.h);}catch(_) {}}
    EDGES.forEach(edge=>{
      const grip=document.createElement('span');
      grip.className='os-resize-handle';grip.dataset.edge=edge;
      grip.setAttribute('role','separator');grip.setAttribute('aria-label',`Resize ${rec.label}: ${edge}`);
      grip.title='Drag to resize · Double-click for 100%';
      grip.addEventListener('pointerdown',ev=>pointer(rec,edge,ev));
      grip.addEventListener('dblclick',ev=>{ev.preventDefault();ev.stopPropagation();select(rec);reset(rec);});
      el.appendChild(grip);
    });
    // Original on-screen +/- resizing, but only for pop-out navigation.
    const controls=document.createElement('div');
    controls.className='os-resize-controls';
    controls.setAttribute('aria-label',`${rec.label} size`);
    for(const [title,factor] of [['Smaller',.9],['Larger',1.1],['Reset size',null]]) {
      const btn=document.createElement('button');btn.type='button';btn.textContent=title;
      btn.addEventListener('click',e=>{
        e.stopPropagation();select(rec);
        if(factor===null)reset(rec);
        else size(rec,rec.el.offsetWidth*factor,rec.el.offsetHeight*factor);
        save(rec);
      });
      controls.appendChild(btn);
    }
    el.appendChild(controls);
    // Controls should not permanently add to the menu's measured default height.
    controls.style.position='absolute';controls.style.top='100%';controls.style.right='0';
    controls.style.zIndex='2147483490';controls.style.display='none';
    el.addEventListener('mouseenter',()=>{controls.style.display='flex';});
    el.addEventListener('mouseleave',()=>{controls.style.display='none';});
    el.addEventListener('focusin',()=>{controls.style.display='flex';});
    el.addEventListener('focusout',e=>{if(!el.contains(e.relatedTarget))controls.style.display='none';});
    el.addEventListener('pointerdown',()=>select(rec),{passive:true});
  }
  function scan() {
    nextScan=false;
    document.querySelectorAll(targets).forEach(install);
  }
  function schedule() {
    if(nextScan)return;nextScan=true;requestAnimationFrame(scan);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  window.addEventListener('ourspace:page-active',schedule);
  document.addEventListener('click',schedule,{passive:true});
  document.addEventListener('keyup',schedule,{passive:true});
  window.addEventListener('resize',()=>{
    if(selected) {
      const r=selected;
      if(r.el.getBoundingClientRect().right>innerWidth || r.el.getBoundingClientRect().bottom>innerHeight)
        size(r,r.el.offsetWidth,r.el.offsetHeight);
    }
  },{passive:true});
})();
