/* OurSpace PUBLIC native profile mirror.
 * Reuses the exact profile-frame and 15 modules from jasper.html/william.html,
 * and their canonical CSS. Original scripts are NEVER executed in this viewer.
 * Only the published OurSpace -> AI Brain JSONP contract supplies profile data.
 */
(function(){
'use strict';
const q=new URLSearchParams(location.search);
const key=q.get('profile')==='jasper'?'jasper':q.get('profile')==='william'?'william':'';
const webApp='https://script.google.com/macros/s/AKfycbwhdSPEHXi81Z-72xCYNkuX7bti8LYMwQPnjOB-DliseOftVNnkCJuK-cfO1cAZGRf0/exec';
const message=document.getElementById('publicMessage');
const viewport=document.getElementById('publicViewport');
const host=document.getElementById('publicHost');
const $=(sel,root=document)=>root.querySelector(sel);
const $$=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const txt=(parent,tag,value,cls)=>{
  const item=document.createElement(tag);if(cls)item.className=cls;
  item.textContent=String(value||'');parent.appendChild(item);return item;
};
const safeUrl=value=>{
  if(typeof value!=='string'||!/^https?:\/\//i.test(value.trim()))return '';
  try{const u=new URL(value.trim());return /^https?:$/.test(u.protocol)?u.href:''}catch(_){return ''}
};
const insertLink=(parent,label,url)=>{
  const safe=safeUrl(url);if(!safe)return null;
  const a=txt(parent,'a',String(label||'Published link').slice(0,150));
  a.href=safe;a.rel='noopener noreferrer';a.target='_blank';return a;
};
const toItems=list=>Array.isArray(list)?list:[];
const announce=(status,reason='')=>{
 try{window.parent?.postMessage({type:'ourspace:public-profile-state',profileKey:key,status,reason},location.origin)}catch(_){}
};
const fail=reason=>{
 host.replaceChildren();viewport.hidden=true;message.hidden=false;message.textContent=reason;
 announce('error',reason);
};
if(!key){fail('Choose Jasper or William to view a published OurSpace profile.');return;}
document.documentElement.dataset.profile=key;
document.documentElement.dataset.ourspaceCurrentPage='profile';
document.title=(key==='jasper'?"Jasper's":"William's")+' published OurSpace profile';

let callbackId=0;
function fetchPublished(){
 return new Promise((resolve,reject)=>{
  let done=false,script=document.createElement('script');
  const callback='__osNativePublic'+(++callbackId);
  const timeout=setTimeout(()=>finish(new Error('Published profile request timed out')),45000);
  function finish(error,data){
    if(done)return;done=true;clearTimeout(timeout);
    script.remove();try{delete window[callback]}catch(_){window[callback]=undefined}
    if(error)reject(error);else resolve(data);
  }
  window[callback]=data=>finish(null,data);
  script.onerror=()=>finish(new Error('The public profile service did not respond'));
  script.src=webApp+'?action=ourspace.publicProfile&profileKey='+encodeURIComponent(key)+'&callback='+callback+'&nonce='+Date.now();
  script.async=true;document.head.appendChild(script);
 });
}
function readRecord(all){
 const r=all?.view==='ourspace-public-profiles'?all?.profiles?.[key]:all;
 if(!r||r.ok!==true||r.published!==true||r.profile?.profileKey!==key)return null;
 return r.profile;
}
async function fetchNativeTemplate(){
 const source=key+'.html';
 const r=await fetch(source,{cache:'no-store',credentials:'omit'});
 if(!r.ok)throw new Error('Native OurSpace profile template returned HTTP '+r.status);
 const html=await r.text();
 const doc=new DOMParser().parseFromString(html,'text/html');
 const app=doc.querySelector('#profileApp');
 const modules=app?app.querySelectorAll('.profile-box').length:0;
 if(!app||modules<15||!app.querySelector('#recordPlayerFlow')||!app.querySelector('#bulletinBoardFlow')){
  throw new Error('The native OurSpace module template is incomplete.');
 }
 // The native module layout is imported as DOM, never as an executable HTML page.
 const styleLinks=Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'));
 const anchor=$('link[href$="ourspace-native-public.css"]');
 styleLinks.forEach(l=>{
  const raw=l.getAttribute('href')||'';
  // All canonical asset paths are site-relative inside OurSpace/assets/code/.
  if(!/^(?:\.\.\/)+style\//i.test(raw))return;
  const copy=document.createElement('link');
  copy.rel='stylesheet';copy.href=raw;
  document.head.insertBefore(copy,anchor);
 });
 const cloned=document.importNode(app,true);
 const jumpSource=doc.querySelector('#profileJumpNav');
 const publicJump=jumpSource?document.importNode(jumpSource,true):null;
 if(publicJump){
   // Duplicate the original Profile/About Jump Nav *only*, excluding its
   // signed-in Onyx and Design Widget entries and without running their code.
   publicJump.querySelectorAll(
     '#profileJumpOnyxToggle,#profileJumpDesignToggle,'+
     '#profileJumpOnyxStatus,#profileJumpDesignStatus,[data-ourspace-onyx-widget]'
   ).forEach(el=>el.remove());
   publicJump.removeAttribute('data-design-target');
   publicJump.setAttribute('aria-label','Published profile section navigation');
 }
 // Enforce the published-only boundary even if a future signed-in page moves
 // widget containers into the profile frame. They are never public modules.
 cloned.querySelectorAll(
   '#designWidget,#designerPanel,#profileJumpNav,#profileJumpOnyxToggle,'+
   '#profileJumpDesignToggle,#ourspaceOnyxIntegrationFrame,'+
   '#sidebar-messenger-root,[data-ourspace-onyx-widget],' +
   '.os-onyx-embedded-frame,.onyx-popout,.onyx-widget,.mp-root,.mp-panel'
 ).forEach(el=>el.remove());
 // Untrusted HTML and account-only features never become active.
 cloned.querySelectorAll('script,style,iframe,object,embed,form,dialog,textarea,input,select,template').forEach(el=>el.remove());
 // Editing/export controls are absent from the public DOM, not just disabled.
 // A file input may already have been removed above, leaving its visible
 // "Import JSON" label behind; remove that label throughout *all* modules.
 cloned.querySelectorAll('.ms-actions,[data-import],label,button,a,summary,[role="button"]').forEach(el=>{
   if(el.matches('.ms-actions,[data-import]')||/\bimport\s+json\b/i.test(el.textContent||''))el.remove();
 });
 cloned.querySelectorAll('*').forEach(el=>{
  Array.from(el.attributes).forEach(attr=>{
   if(/^on/i.test(attr.name)||attr.name==='srcdoc'||attr.name==='formaction')el.removeAttribute(attr.name);
  });
  if(el.matches('a')){el.removeAttribute('href');el.removeAttribute('target');}
 });
 // Preserve native module artwork but eliminate private action controls.
 cloned.querySelectorAll('button').forEach(btn=>{
  const permitted=['playButton','previousButton','nextButton','rewindButton','forwardButton','fusionGalleryPrev','fusionGalleryNext'];
  if(!permitted.includes(btn.id)){
    btn.disabled=true;btn.setAttribute('aria-disabled','true');btn.tabIndex=-1;
    // Read-only buttons remain visibly native so bulletin/module layouts match.
    if(btn.closest('.mast-actions,.profile-photo-actions,.ms-actions,.editor-box,.profile-controls'))btn.hidden=true;
  }
 });
 cloned.querySelectorAll('[contenteditable],[draggable]').forEach(el=>{
  el.removeAttribute('contenteditable');el.removeAttribute('draggable');
 });
 cloned.querySelectorAll('audio,video').forEach(el=>{el.pause?.();el.removeAttribute('src');el.removeAttribute('autoplay');el.querySelectorAll('source').forEach(x=>x.remove());});
 cloned.querySelectorAll('[data-module-items],.ms-items,.profile-list,.gallery-grid').forEach(el=>el.replaceChildren());
 cloned.querySelectorAll('.profile-box').forEach(box=>{
  box.classList.remove('is-collapsed');
  box.removeAttribute('hidden');
  box.querySelectorAll('[data-empty]').forEach(el=>el.removeAttribute('data-empty'));
  box.querySelectorAll('.empty-state').forEach(el=>{
   el.textContent='No additional information published yet.';
  });
 });
 cloned.querySelectorAll('a[href^="javascript:"]').forEach(a=>a.remove());
 // Default OurSpace identity + existing module coordinates/styles stay intact.
 return {app:cloned,jump:publicJump};
}
function normalizeText(str,max=3000){return typeof str==='string'?str.slice(0,max):''}
function renderNative(data,app){
 const name=normalizeText(data.displayName|| (key==='jasper'?'Jasper':'William'),120);
 const title=$('#profileTitle',app);if(title)title.textContent=name+"'s space";
 const greet=$('#headerGreeting',app);if(greet)greet.textContent=key==='jasper'?"Squishy's Cottage":'Dino Nerdzone';
 const network=$('#networkNotice',app);if(network)network.textContent='Published OurSpace profile · '+name;
 const photo=$('#profilePictureDisplay',app);
 if(photo){
  // Canonical profilePictureDisplay is already an IMG element (not a wrapper).
  const url=safeUrl(data.avatarUrl);
  photo.hidden=!url;
  if(url){photo.src=url;photo.alt=name+' published profile image';photo.loading='lazy';}
  else photo.removeAttribute('src');
 }
 const photoEmpty=$('#profilePictureEmpty',app);
 if(photoEmpty)photoEmpty.hidden=Boolean(safeUrl(data.avatarUrl));
 const identity=$('#profile-identity .ms-card-body',app)||$('#profile-identity .module-body',app)||$('#profile-identity .box-body',app);
 if(identity){const info=txt(identity,'div','', 'os-public-readout');
  txt(info,'strong',name);if(data.headline)txt(info,'p',normalizeText(data.headline,240));
 }
 const bio=$('#aboutBio',app)||$('#aboutPublic',app)||$('#profile-about [data-module-items]',app);
 if(bio){bio.replaceChildren();txt(bio,'p',normalizeText(data.bio)||'No public biography has been shared.')}
 const interests=$('#interestsList',app)||$('#profile-interests [data-module-items]',app);
 if(interests){
  interests.replaceChildren();
  toItems(data.interests).slice(0,40).forEach(v=>{const str=normalizeText(v,120);if(str)txt(interests,'div',str,'os-public-interest')});
  if(!interests.childNodes.length)txt(interests,'p','No interests published yet.');
 }
 const tags=$('#fusionTagsList',app);
 if(tags){tags.replaceChildren();toItems(data.interests).slice(0,25).forEach(v=>{if(typeof v==='string'&&v.trim())txt(tags,'span',v.trim().slice(0,90),'os-public-tag')})}
 const projects=$('#profile-projects [data-module-items]',app);
 if(projects){projects.replaceChildren();toItems(data.projects).slice(0,24).forEach(p=>{
   if(!p||typeof p!=='object')return;
   const item=txt(projects,'div','','os-public-entry');
   txt(item,'strong',normalizeText(p.name||p.title,160));if(p.description)txt(item,'p',normalizeText(p.description,800));
   insertLink(item,'View project',p.url||p.link);
  });if(!projects.childNodes.length)txt(projects,'p','No projects published yet.');
 }
 const links=$('#linksList',app)||$('#profile-links [data-module-items]',app);
 if(links){links.replaceChildren();toItems(data.links).slice(0,200).forEach(entry=>{
  if(!entry||typeof entry!=='object')return;
  const row=txt(links,'div','','os-public-entry');
  if(!insertLink(row,entry.name||entry.title||'Published link',entry.url||entry.link)){row.remove();return}
  if(entry.description)txt(row,'p',normalizeText(entry.description,700));
 });if(!links.childNodes.length)txt(links,'p','No links published yet.')}
 const donation=$('#donatePreview',app);
 if(donation){donation.replaceChildren();toItems(data.donationMethods).slice(0,12).forEach(x=>{
  if(!x||typeof x!=='object')return;
  const item=txt(donation,'div','','os-public-entry');txt(item,'strong',normalizeText(x.name,160));
  insertLink(item,'Open support option',x.url||x.link);
 });
 const c=data.creatorDonation;
 if(c&&typeof c==='object')insertLink(donation,c.label||'Support the creator',c.url||c.donationUrl);
 }
 // The exact retro record player is ALWAYS present, regardless of the playlist.
 const player=$('#profile-music',app);if(player)player.classList.remove('is-collapsed');
 const audio=$('#audioElement',app);
 const tracks=toItems(data.musicPlayer?.items).filter(t=>t&&safeUrl(t.url)).slice(0,200);
 const song=data.favoriteSong&&safeUrl(data.favoriteSong.url)?data.favoriteSong:null;
 if(song&&!tracks.some(t=>t.url===song.url))tracks.unshift({title:song.title||'Favorite song',artist:song.artist||'',url:song.url});
 const list=$('#musicList',app);
 if(list){list.replaceChildren();tracks.forEach((t,i)=>{
  const el=txt(list,'li','','os-public-track');
  const button=txt(el,'button',normalizeText(t.title||'Published song',160));
  button.type='button';button.dataset.trackIndex=String(i);button.disabled=false;button.hidden=false;button.removeAttribute('aria-hidden');
 });if(!tracks.length)txt(list,'li','No published tracks yet.','os-public-track-empty');}
 const artist=$('#artistValue',app),titleValue=$('#titleValue',app),time=$('#currentTime',app),duration=$('#durationTime',app);
 const play=$('#playButton',app),prev=$('#previousButton',app),next=$('#nextButton',app);
 const rewind=$('#rewindButton',app),forward=$('#forwardButton',app),playIcon=$('#playIcon',app);
 let trackIndex=0;
 function select(index,auto=false){
  if(!audio||!tracks.length)return;
  trackIndex=(index+tracks.length)%tracks.length;const t=tracks[trackIndex];
  audio.src=safeUrl(t.url);audio.preload='none';
  if(artist)artist.textContent=normalizeText(t.artist||'',160);
  if(titleValue)titleValue.textContent=normalizeText(t.title||'Published track',170);
  $$('.os-public-track',list).forEach((x,i)=>x.classList.toggle('current',i===trackIndex));
  if(auto)audio.play().catch(()=>{});else audio.load();
 }
 const clock=sec=>{if(!Number.isFinite(sec))return '00:00';sec=Math.floor(sec);return Math.floor(sec/60).toString().padStart(2,'0')+':'+(sec%60).toString().padStart(2,'0')};
 if(audio){
  audio.addEventListener('timeupdate',()=>{if(time)time.textContent=clock(audio.currentTime)});
  audio.addEventListener('loadedmetadata',()=>{if(duration)duration.textContent=clock(audio.duration)});
  audio.addEventListener('play',()=>{if(playIcon)playIcon.textContent='❚❚';$('#vinyl',app)?.classList.add('is-playing')});
  audio.addEventListener('pause',()=>{if(playIcon)playIcon.textContent='▶';$('#vinyl',app)?.classList.remove('is-playing')});
  audio.addEventListener('ended',()=>select(trackIndex+1,true));
 }
 if(list)list.addEventListener('click',e=>{const b=e.target.closest('[data-track-index]');if(b)select(Number(b.dataset.trackIndex),true)});
 if(play)play.addEventListener('click',()=>{if(!audio||!tracks.length)return;if(!audio.src)select(0);if(audio.paused)audio.play().catch(()=>{});else audio.pause()});
 if(prev)prev.addEventListener('click',()=>select(trackIndex-1,true));
 if(next)next.addEventListener('click',()=>select(trackIndex+1,true));
 if(rewind)rewind.addEventListener('click',()=>{if(audio)audio.currentTime=Math.max(0,audio.currentTime-3)});
 if(forward)forward.addEventListener('click',()=>{if(audio)audio.currentTime=Math.min(audio.duration||0,audio.currentTime+3)});
 if(tracks.length)select(0);
 else {if(artist)artist.textContent='';if(titleValue)titleValue.textContent='No published tracks yet';}
 // The exact Bulletin pinboard ALWAYS renders, even when no pins are shared.
 const board=$('#profile-bulletins',app);if(board)board.classList.remove('is-collapsed');
 const privacy=$('#privacy-pill',app);if(privacy)privacy.textContent='PUBLIC VIEW';
 const boardName=$('#board-name',app);if(boardName)boardName.textContent='Published Bulletin';
 const boardSubtitle=$('#board-subtitle',app);if(boardSubtitle)boardSubtitle.textContent='Only approved public content';
 const boardItems=$('#board-items',app);
 if(boardItems){boardItems.replaceChildren();txt(boardItems,'div','No bulletin pins have been published to this public profile.','os-public-bulletin-note')}
 const boardStatus=$('#board-status',app);if(boardStatus)boardStatus.textContent='Read-only public bulletin';
 const footer=$('#profileApp .profile-footer',app)||$('.profile-footer',app);
 if(footer)footer.textContent='Published OurSpace profile · Read-only';
 // Gallery uses the native original Gallery module, not an external imitation.
 const gallery=$('#picturesList',app)||$('#profile-gallery [data-module-items]',app);
 if(gallery){gallery.replaceChildren();toItems(data.visualPlayer?.items).slice(0,80).forEach(media=>{
  if(!media||!safeUrl(media.url))return;
  const tile=txt(gallery,'figure','','os-public-gallery-item');
  if(media.kind==='image'){const img=txt(tile,'img','');img.src=safeUrl(media.url);img.alt=normalizeText(media.title||'Published photo',130);img.loading='lazy'}
  else if(media.kind==='video'){const video=txt(tile,'video','');video.src=safeUrl(media.url);video.controls=true;video.preload='none'}
  else {tile.remove();return}
  txt(tile,'figcaption',normalizeText(media.title||'Published media',130));
 });if(!gallery.childNodes.length)txt(gallery,'p','No published media yet.')}
 // Keep the original OurSpace Gallery carousel and its original control geometry.
 const pictures=toItems(data.visualPlayer?.items).filter(item=>item?.kind==='image'&&safeUrl(item.url)).slice(0,80);
 const galleryImg=$('#fusionGalleryImage',app),galleryCaption=$('#fusionGalleryCaption',app);
 const galleryCount=$('#fusionGalleryCounter',app),thumbs=$('#fusionGalleryThumbs',app);
 let pictureIndex=0;
 function showPicture(i){
   if(!pictures.length||!galleryImg)return;
   pictureIndex=(i+pictures.length)%pictures.length;
   const item=pictures[pictureIndex];
   galleryImg.src=safeUrl(item.url);
   galleryImg.alt=normalizeText(item.title||'Published picture',130);
   if(galleryCaption)galleryCaption.textContent=normalizeText(item.title||'',130);
   if(galleryCount)galleryCount.textContent=(pictureIndex+1)+' / '+pictures.length;
   if(thumbs)Array.from(thumbs.children).forEach((x,n)=>x.setAttribute('aria-current',String(n===pictureIndex)));
 }
 if(thumbs){thumbs.replaceChildren();pictures.forEach((item,i)=>{
   const b=txt(thumbs,'button',String(i+1));b.type='button';b.disabled=false;b.hidden=false;
   b.setAttribute('aria-label','Show published picture '+(i+1));
   b.addEventListener('click',()=>showPicture(i));
 });}
 $('#fusionGalleryPrev',app)?.addEventListener('click',()=>showPicture(pictureIndex-1));
 $('#fusionGalleryNext',app)?.addEventListener('click',()=>showPicture(pictureIndex+1));
 if(pictures.length)showPicture(0);
 else if(galleryCount)galleryCount.textContent='0 / 0';
 // No private account data, messages, posts, scrapbook, workspaces, or stored items are fetched.
}
function applyPublishedTheme(theme){
 if(!theme||typeof theme!=='object')return;
 if(theme.schema!=='ourspace.native-profile.css.v1'||typeof theme.css!=='string')return;
 if(theme.css.length>44000||/@import\b|javascript\s*:|expression\s*\(/i.test(theme.css))return;
 const style=document.createElement('style');style.id='ourspace-published-design';style.textContent=theme.css;document.head.appendChild(style);
}
function appendScript(path){
 return new Promise(resolve=>{
  const script=document.createElement('script');script.src=path;script.onload=resolve;script.onerror=resolve;document.body.appendChild(script);
 });
}
function sendHeight(){
 if(viewport.hidden)return;
 const width=1754;
 // Reserve the native 60px heart track and a small touch gutter without
 // moving or altering any original OurSpace module coordinates.
 const scale=Math.min(1,Math.max(300,window.innerWidth-78)/width);
 host.style.transform='scale('+scale+')';
 host.style.width=width+'px';
 host.style.height='auto';
 viewport.style.width=Math.ceil(width*scale)+'px';
 viewport.style.marginLeft=window.innerWidth<width+90?'0':'auto';
 viewport.style.marginRight=window.innerWidth<width+90?'0':'auto';
 const natural=Math.max(host.scrollHeight,$('#profileApp')?.scrollHeight||0,3420);
 const h=Math.max(500,Math.ceil(natural*scale)+28);
 viewport.style.height=h+'px';
 try{window.parent.postMessage({type:'ourspace:public-profile-height',profileKey:key,height:h},'*')}catch(_){}
}

function initPublicJumpNav(nav){
 if(!nav)return;
 // Native markup, selectors, icons, and resize handles come from the signed-in
 // Profile/About template. This is a public-only controller: no widget hooks,
 // edit buttons, private session stores, route changes or URL hashes.
 const bubble=nav.querySelector('#profileJumpBubble');
 const menu=nav.querySelector('#profileJumpMenu');
 const links=nav.querySelector('#profileJumpLinks');
 const closeButton=nav.querySelector('#profileJumpClose');
 if(!bubble||!menu||!links)return;
 const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
 const posKey='ourspace.public-profile-jump.position.'+key;
 const sizeKey='ourspace.public-profile-jump.size.'+key;
 let position=null,size={width:310,height:420},dragging=null,resizing=null,wasDragged=false;
 try{const p=JSON.parse(localStorage.getItem(posKey)||'null');if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))position=p}catch(_){}
 try{const p=JSON.parse(localStorage.getItem(sizeKey)||'null');if(Number.isFinite(p?.width)&&Number.isFinite(p?.height))size=p}catch(_){}
 const entries=new Map();
 function layout(){
   const availableRight=Math.max(80,innerWidth-74);
   const maxWidth=Math.max(200,Math.min(innerWidth-16,availableRight-12));
   menu.style.width=clamp(size.width,200,maxWidth)+'px';
   menu.style.height=clamp(size.height,170,Math.max(170,innerHeight-80))+'px';
   const p=position||{x:Math.min(80,availableRight-60),y:innerHeight*.30};
   const x=clamp(p.x,6,Math.max(6,availableRight-54));
   const y=clamp(p.y,6,Math.max(6,innerHeight-58));
   nav.style.left=Math.round(x)+'px';
   nav.style.top=Math.round(y)+'px';
   nav.style.right='auto';
   const right=x>innerWidth*.48;
   nav.dataset.dock=right?'right':'left';
   menu.style.left=right?'auto':'0';
   menu.style.right=right?'0':'auto';
   return {x,y};
 }
 function collect(){
   entries.clear();links.replaceChildren();
   const sections=document.querySelectorAll('#profileApp .profile-column > section.profile-box');
   sections.forEach(section=>{
     if(!section.id)return;
     const label=section.querySelector('.box-head .label')?.textContent?.trim()||section.dataset.designLabel||section.id;
     entries.set(section.id,{node:section,label});
   });
   for(const [id,item] of [...entries].slice(0,38)){
     const button=document.createElement('button');
     button.type='button';button.dataset.jumpTo=id;button.textContent=item.label;
     links.appendChild(button);
   }
   if(!links.children.length)links.textContent='No published profile sections.';
   const title=menu.querySelector('header strong');
   if(title)title.textContent='Profile · Jump';
 }
 function open(){
   collect();layout();menu.hidden=false;bubble.setAttribute('aria-expanded','true');
 }
 function close(){
   menu.hidden=true;bubble.setAttribute('aria-expanded','false');
 }
 bubble.addEventListener('click',()=>{if(wasDragged){wasDragged=false;return}menu.hidden?open():close()});
 closeButton?.addEventListener('click',()=>{close();bubble.focus()});
 links.addEventListener('click',e=>{
   const button=e.target.closest('[data-jump-to]');if(!button)return;
   const item=entries.get(button.dataset.jumpTo);if(!item)return;
   close();
   requestAnimationFrame(()=>item.node.scrollIntoView({
     behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',
     block:'start'
   }));
 });
 bubble.addEventListener('pointerdown',e=>{
   if(e.button!==0)return;
   const p=layout();
   dragging={id:e.pointerId,x:e.clientX,y:e.clientY,ox:p.x,oy:p.y,moved:false};
   bubble.setPointerCapture(e.pointerId);
 });
 bubble.addEventListener('pointermove',e=>{
   if(!dragging||dragging.id!==e.pointerId)return;
   const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;
   if(Math.hypot(dx,dy)<5&&!dragging.moved)return;
   dragging.moved=true;position={x:dragging.ox+dx,y:dragging.oy+dy};
   layout();
 });
 bubble.addEventListener('pointerup',e=>{
   if(!dragging||dragging.id!==e.pointerId)return;
   wasDragged=dragging.moved;
   if(wasDragged){
     position=layout();
     try{localStorage.setItem(posKey,JSON.stringify(position))}catch(_){}
   }
   dragging=null;try{bubble.releasePointerCapture(e.pointerId)}catch(_){}
 });
 bubble.addEventListener('pointercancel',()=>dragging=null);
 bubble.addEventListener('keydown',e=>{
   if(!e.altKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
   e.preventDefault();const p=layout();
   position={x:p.x+(e.key==='ArrowLeft'?-16:e.key==='ArrowRight'?16:0),
             y:p.y+(e.key==='ArrowUp'?-16:e.key==='ArrowDown'?16:0)};
   position=layout();
   try{localStorage.setItem(posKey,JSON.stringify(position))}catch(_){}
 });
 menu.querySelectorAll('[data-jump-resize]').forEach(handle=>{
   handle.addEventListener('pointerdown',e=>{
     if(e.button!==0)return;e.preventDefault();
     const r=menu.getBoundingClientRect();
     resizing={dir:handle.dataset.jumpResize,id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,h:r.height};
     handle.setPointerCapture(e.pointerId);
   });
   handle.addEventListener('pointermove',e=>{
     if(!resizing||resizing.id!==e.pointerId)return;
     const dx=e.clientX-resizing.x,dy=e.clientY-resizing.y,d=resizing.dir;
     size.width=Math.max(200,resizing.w+(d.includes('e')?dx:d.includes('w')?-dx:0));
     size.height=Math.max(170,resizing.h+(d.includes('s')?dy:d.includes('n')?-dy:0));
     layout();
   });
   handle.addEventListener('pointerup',e=>{
     if(!resizing||resizing.id!==e.pointerId)return;
     resizing=null;try{handle.releasePointerCapture(e.pointerId)}catch(_){}
     try{localStorage.setItem(sizeKey,JSON.stringify(size))}catch(_){}
   });
   handle.addEventListener('pointercancel',()=>resizing=null);
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){close();bubble.focus()}});
 window.addEventListener('resize',layout);
 layout();close();
 window.OurSpacePublicJumpNav={open,close,refresh:collect};
}

function initSizing(){
 let pending=false;
 function update(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sendHeight()})}
 window.addEventListener('resize',update);
 if('ResizeObserver'in window){
  const observer=new ResizeObserver(update);
  if($('#profileApp'))observer.observe($('#profileApp'));
 }
 document.fonts?.ready?.then(update).catch(()=>{});
 setTimeout(update,300);setTimeout(update,1600);update();
}
async function load(){
 try{
  const [response,template]=await Promise.all([fetchPublished(),fetchNativeTemplate()]);
  const data=readRecord(response);
  if(!data){fail('This OurSpace profile is not published or the public connection is unavailable.');return}
  const {app,jump}=template;
  host.replaceChildren(app);
  renderNative(data,app);
  if(jump){
    document.body.appendChild(jump);
    initPublicJumpNav(jump);
  }
  message.hidden=true;viewport.hidden=false;
  announce('ready');
  // Run only the existing native geometry and artwork fit. No account scripts.
  await appendScript('../../script/profile/ourspace-profile-baseline.js');
  await appendScript('../../script/profile/ourspace-profile-embedded-fit.js');
  applyPublishedTheme(data.theme);
  initSizing();
 }catch(error){fail('The published OurSpace profile could not be loaded.')}
}
load();
})();
