/* Shared original Jump Nav bubble: page-specific links, movable and collapsible. */
(()=>{'use strict';
 if(new URLSearchParams(location.search).get('public')==='1')return;
 const $=(s,r=document)=>r.querySelector(s);
 const host=$('#profileJumpNav'),bubble=$('#profileJumpBubble'),menu=$('#profileJumpMenu'),links=$('#profileJumpLinks');
 if(!host||!bubble||!menu||!links)return;
 const who=document.documentElement.dataset.profile||'william';
 const page=document.documentElement.dataset.ourspaceCurrentPage||new URLSearchParams(location.search).get('page')||'profile';
 const sizeKey='ourspace.jump-menu.size.'+who, positionKey='ourspace.jump-nav.position.v2.'+who+'.'+page;
 const titles={profile:'Profile',household:'Household',journal:'Journal & Diary Cards',feed:'Feed',skills:'Skills',communication:'Communication',audio:'Audio',visual:'Visual',store:'Store'};
 let size={width:310,height:420};
 try{const a=JSON.parse(localStorage.getItem(sizeKey)||'null');if(a)size={width:Math.max(220,Math.min(750,Number(a.width)||310)),height:Math.max(170,Math.min(850,Number(a.height)||420))}}catch(_){}
 let position=null;try{const s=JSON.parse(localStorage.getItem(positionKey)||'null');if(Number.isFinite(s?.x)&&Number.isFinite(s?.y))position=s}catch(_){}
 function railLeft(){const rail=$('#sidebar-messenger-root .mp-sidebar.mp-vertical-menu');const r=rail?.getBoundingClientRect();if(r&&r.width>40)return r.left;const css=getComputedStyle(document.documentElement);return innerWidth-(parseFloat(css.getPropertyValue('--os-sidebar-width'))||Math.min(300,innerWidth*.25))-(parseFloat(css.getPropertyValue('--os-sidebar-right'))||0)}
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function applySize(){menu.style.width=Math.max(140,Math.min(innerWidth-16,railLeft()-8,size.width))+'px';menu.style.height=Math.min(innerHeight-80,size.height)+'px'}
 function defaultPosition(){return{x:Math.max(6,railLeft()-52-14),y:Math.max(6,(innerHeight-52)/2)}}
 function applyPosition(){const p=position||defaultPosition();const x=clamp(p.x,6,Math.max(6,railLeft()-52-4)),y=clamp(p.y,6,Math.max(6,innerHeight-52-6));host.style.left=Math.round(x)+'px';host.style.top=Math.round(y)+'px';host.style.right='auto';const isRight=x>innerWidth*.48;host.dataset.dock=isRight?'right':'left';if(isRight){menu.style.left='auto';menu.style.right='0'}else{menu.style.right='auto';menu.style.left='0'}return{x,y}}
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
 applySize();applyPosition();
 // Rail is populated after the jump script; adjust to the real rail geometry on arrival.
 const railObserver=new MutationObserver(()=>applyPosition());const rail=$('#sidebar-messenger-root');if(rail)railObserver.observe(rail,{childList:true,subtree:false});
 window.OurSpaceJumpNav={open,close,refresh:collect,reset(){position=null;localStorage.removeItem(positionKey);applyPosition()}};
})();