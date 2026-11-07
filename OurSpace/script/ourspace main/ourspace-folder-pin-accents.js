/* Per-item accent chooser for journal/music/visual folders and communication pins.
   Does not recolor page skins, resize modules, or create another message app. */
(()=>{'use strict';
 const palette=window.OurSpaceAccentPalette,profile=document.documentElement.dataset.profile||'william';if(!palette)return;
 if(new URLSearchParams(location.search).get('public')==='1')return;
 const page=document.documentElement.dataset.ourspaceCurrentPage||new URLSearchParams(location.search).get('page')||'profile';
 // Quick Chat pins exist on all pages, while folder controls are route-specific.
 const key='ourspace.item-accents.v1.'+profile, $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 let saved={};try{const a=JSON.parse(localStorage.getItem(key)||'{}');if(a&&typeof a==='object'&&!Array.isArray(a))saved=a}catch(_){}
 const selected=id=>palette.valid(saved[id])?saved[id]:palette.fromKey(id);
 const cssFor=(element,hex)=>{if(!element)return;const c=palette.choice(hex);element.style.setProperty('--os-accent',c.hex);element.style.setProperty('--os-accent-ink',palette.ink(c.hex));element.style.setProperty('--os-accent-edge',palette.ink(c.hex)==='#FFFFFF'?'#F0E6CF':'#2B3D22');};
 const pop=document.createElement('section');pop.className='os-accent-palette';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Color palette');
 pop.innerHTML='<div class="os-palette-head"><strong id="osAccentTitle">Choose accent color</strong><button type="button" data-oscolor-close aria-label="Close colors">×</button></div><div class="os-palette-scroll"></div>';
 document.body.append(pop);
 let active=null;
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const families=[...new Set(palette.colors.map(c=>c.family))];
 pop.querySelector('.os-palette-scroll').innerHTML=families.map(f=>`<div class="os-palette-group">${safe(f)}</div><div class="os-palette-swatches" role="group" aria-label="${safe(f)} shades">${palette.colors.filter(c=>c.family===f).map(c=>`<button type="button" class="os-palette-swatch" data-oscolor-choice="${c.hex}" title="${safe(c.name)} ${c.hex}" aria-label="${safe(c.name)} ${c.hex}" style="--shade:${c.hex};--ink:${palette.ink(c.hex)}">${c.family==='Purple'?'◆':'●'}</button>`).join('')}</div>`).join('');
 function hide(){pop.classList.remove('open');active=null}
 function show(id,anchor){if(!anchor)return;active={id,anchor};const sel=selected(id);$$('[data-oscolor-choice]',pop).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.oscolorChoice===sel)));
  $('#osAccentTitle',pop).textContent=(id.startsWith('pin:')?'Communication pin':'Folder')+' · Choose color';pop.classList.add('open');
  const r=anchor.getBoundingClientRect(),w=Math.min(340,innerWidth-16),h=Math.min(530,innerHeight*.7),rail=$('#sidebar-messenger-root .mp-sidebar.mp-vertical-menu')?.getBoundingClientRect();
  const limit=(rail?.width>50?rail.left-8:innerWidth-8);pop.style.left=Math.max(8,Math.min(limit-w,r.left-w+29))+'px';pop.style.top=Math.max(8,Math.min(innerHeight-h-8,r.top+26))+'px';
 }
 function setColor(id,hex){if(!palette.valid(hex))return;saved[id]=hex;try{localStorage.setItem(key,JSON.stringify(saved))}catch(_){}scan();window.dispatchEvent(new CustomEvent('ourspace:accent-updated',{detail:{profile,id,hex}}));hide()}
 pop.addEventListener('click',e=>{if(e.target.closest('[data-oscolor-close]'))return hide();const c=e.target.closest('[data-oscolor-choice]');if(c&&active)setColor(active.id,c.dataset.oscolorChoice)});
 document.addEventListener('pointerdown',e=>{if(pop.classList.contains('open')&&!pop.contains(e.target)&&!e.target.closest('.os-accent-color-trigger'))hide()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&pop.classList.contains('open'))hide()});
 function control(id){const b=document.createElement('button');b.type='button';b.className='os-accent-color-trigger';b.dataset.oscolorId=id;b.setAttribute('aria-label','Choose color for '+id.split(':')[0]);b.title='Choose an accent from 75 colors';b.textContent='🎨';return b}
 document.addEventListener('click',e=>{const btn=e.target.closest('.os-accent-color-trigger');if(!btn)return;e.preventDefault();e.stopPropagation();show(btn.dataset.oscolorId,btn)},true);
 function decorateFolder(el,id,controlParent){if(!el||!id)return;const full='folder:'+page+':'+id,shade=selected(full);el.dataset.osFolderAccent=full;cssFor(el,shade);
  const wrapper=controlParent||el.parentNode;
  if(!wrapper)return;let b=$$('[data-oscolor-id]',wrapper).find(x=>x.dataset.oscolorId===full);if(!b){b=control(full);wrapper.append(b)}cssFor(b,shade)
 }
 function decoratePins(){const room=(window.OurSpaceCommsUpgrade?.currentRoom?.()||window.ourspaceMessenger?.activeConversationId||'ourspace-shared');
  for(const row of $$('#oscom-thread .oscom-bubble[data-osmessage-id]')){
   const mid=row.dataset.osmessageId,pin=$('.oscom-pin-btn',row);if(!mid||!pin)continue;const id='pin:'+room+':'+mid,hex=selected(id);
   const pinned=pin.getAttribute('aria-pressed')==='true';
   if(pinned){pin.dataset.osPinAccent=id;cssFor(pin,hex);let trigger=$('.os-accent-color-trigger',row);if(!trigger){trigger=control(id);pin.insertAdjacentElement('afterend',trigger)}trigger.dataset.oscolorId=id;cssFor(trigger,hex);trigger.hidden=false;}
   else{delete pin.dataset.osPinAccent;pin.style.removeProperty('--os-accent');const trigger=$('.os-accent-color-trigger',row);if(trigger)trigger.hidden=true;}
  }
  for(const btn of $$('#oscomPinnedOverview [data-os-pin-go]')){
   const mid=btn.dataset.osPinGo,id='pin:'+(btn.dataset.osPinRoom||room)+':'+mid;btn.dataset.osPinAccent=id;cssFor(btn,selected(id))
  }
  for(const item of $$('#osQuickDock [data-os-pin-message]')){
   const id='pin:'+item.dataset.osPinRoom+':'+item.dataset.osPinMessage;item.dataset.osPinAccent=id;cssFor(item,selected(id))
  }
 }
 let running=false;
 function scan(){if(running)return;running=true;
  try{
   if(page==='journal'){
    for(const row of $$('.folder-tree-row[data-folder-row]')){const id=row.dataset.folderRow;decorateFolder(row,id,$('.folder-tree-actions',row)||row)}
    for(const wrap of $$('.folder-row-wrap')){const b=$('.folder-row[data-folder]',wrap);if(b)decorateFolder(b,b.dataset.folder,wrap)}
   }
   if(page==='audio'){
    for(const row of $$('.osm-item[data-drop-kind="folder"]')){const id=row.dataset.id;decorateFolder(row,id,$('.osm-actions',row)||row)}
   }
   if(page==='visual'){
    for(const btn of $$('[data-folder-drop-list] button[data-drop-kind="folder"]')){
     const id=btn.dataset.id,full='folder:visual:'+id,shade=selected(full);
     btn.dataset.osFolderAccent=full;cssFor(btn,shade);
     let extra=btn.nextElementSibling;if(!extra||extra.dataset.oscolorId!==full){extra=control(full);btn.insertAdjacentElement('afterend',extra)}cssFor(extra,shade)
    }
   }
   decoratePins();
  }finally{running=false}
 }
 let requested=false;function schedule(){if(requested)return;requested=true;requestAnimationFrame(()=>{requested=false;scan()})}
 const watch=page==='communication'?$('#osCommunicationModule'):page==='journal'?$('#osJournalDiaryPage')||$('[data-ourspace-page="journal"]'):page==='audio'?$('[data-ourspace-page="audio"]'):page==='visual'?$('[data-ourspace-page="visual"]'):null;
 if(watch){const obs=new MutationObserver(schedule);obs.observe(watch,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed','data-osmessage-id']})}
 const quick=$('#osQuickDock');if(quick){const obs=new MutationObserver(schedule);obs.observe(quick,{childList:true,subtree:true})}
 window.addEventListener('ourspace:accent-updated',schedule);
 scan();setTimeout(schedule,250);setTimeout(schedule,1500);
 window.OurSpaceItemAccents={get:id=>selected(id),set:setColor,scan};
})();