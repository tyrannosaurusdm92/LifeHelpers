(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const auth=window.OurSpaceAuth,who=document.documentElement.dataset.profile,query=new URLSearchParams(location.search),page=query.get('page')||'profile',isPublic=query.get('public')==='1',pages=['profile','household','journal','diary','feed','communication','audio','visual','store'];
const profileName=who==='william'?'Dino Nerdzone':"Squishy's Cottage",displayName=who==='william'?'William':'Jasper';
const demoKey='ourspace.admin.preview.profile.'+who;
const validUrl=s=>{try{const u=new URL(s,location.href);return /^https?:$/.test(u.protocol)?u.href:''}catch(_){return ''}};
const publicUrl=()=>new URL(who+'.html?public=1',location.href).href;
const status=(message,error=false)=>{const e=$('#profileStatus');if(e){e.textContent=message;e.style.color=error?'#F47745':'#315f68'}};
const defaultProfile=()=>({displayName,handle:'',headline:'',pronouns:'',status:'',mood:'',location:'',hereFor:'',avatar:'',about:'',tags:'',musicInterest:'',movieInterest:'',bookInterest:'',gameInterest:'',posts:[],music:[],gallery:[],comments:[],links:[],projects:[]});
const keys=['displayName','handle','headline','pronouns','status','mood','location','hereFor','avatar','about','tags','musicInterest','movieInterest','bookInterest','gameInterest'];
const lists=['posts','music','gallery','comments','links','projects'];
let data=defaultProfile(),saveRunning=false;
function sanitizeObject(raw){const base=defaultProfile();if(!raw||typeof raw!=='object')return base;for(const key of keys)if(typeof raw[key]==='string')base[key]=raw[key].slice(0,key==='about'?10000:300);for(const key of lists){if(Array.isArray(raw[key]))base[key]=raw[key].slice(0,250).filter(x=>x&&typeof x==='object').map(x=>({id:String(x.id||'').slice(0,100),title:String(x.title||'').slice(0,120),body:String(x.body||'').slice(0,10000),name:String(x.name||'').slice(0,80),url:validUrl(x.url||''),artist:String(x.artist||'').slice(0,80),album:String(x.album||'').slice(0,80),date:String(x.date||'').slice(0,50)}))}return base}
function previewLoad(){try{data=sanitizeObject(JSON.parse(localStorage.getItem(demoKey)||'null'))}catch(_){data=defaultProfile()}window.OurSpaceLinksModule?.importLegacy?.(data.links)}
async function serverLoad(){try{const r=await auth.request('profile.get',{profileKey:who});const maybe=r?.profile||r?.data?.profile||r?.data;if(maybe&&typeof maybe==='object'){data=sanitizeObject(maybe);window.OurSpaceModuleMigration?.migrate?.(data);status('Profile loaded.')}else status('The server did not return a saved profile.');render() }catch(err){status('Could not load account profile: '+err.message,true)}}
async function save(){if(saveRunning)return;saveRunning=true;if(auth.isAdmin()){try{localStorage.setItem(demoKey,JSON.stringify(data));status('Preview saved on this browser only.')}catch(_){status('Preview changes are temporary in this browser session; export a snapshot for backup.',true)}saveRunning=false;return}
 try{await auth.request('profile.save',{profileKey:who,profile:data});status('Profile saved to your account.');queuePublishedSync()}catch(err){status('This edit is visible here but could not sync to the account: '+err.message,true)}finally{saveRunning=false}}
// Public publication is opt-in and separate from private profile.save.
// Only selected fields and explicitly selected, link-backed media leave the account.
let publicSyncTimer=null;
const publicLinkUrl=value=>{
 const href=validUrl(value);
 return href&&/^https?:\/\//i.test(href)?href:'';
};
const publishedPayload=selected=>{
 const entry={profileKey:who};
 if(selected.displayName)entry.displayName=data.displayName||displayName;
 if(selected.headline)entry.headline=data.headline||'';
 if(selected.about)entry.bio=data.about||'';
 if(selected.avatar)entry.avatarUrl=publicLinkUrl(data.avatar)||'';
 return entry;
};
async function syncPublishedGroup({enabled,action,listAction,removeAction,idField,listField,prefix,items,map}){
 if(!enabled)return;
 const rows=items.map((item,index)=>({id:prefix+index,details:map(item,index)}))
  .filter(x=>Boolean(x.details?.url)).slice(0,200);
 const current=await auth.request(listAction,{profileKey:who});
 const old=Array.isArray(current?.[listField])?current[listField]:[];
 for(const row of rows){
  await auth.request(action,{profileKey:who,[idField]:row.id,...row.details});
 }
 const kept=new Set(rows.map(x=>x.id));
 for(const entry of old){
  const id=String(entry.id||'');
  if(id.startsWith(prefix)&&!kept.has(id))await auth.request(removeAction,{profileKey:who,[idField]:id});
 }
}
async function syncPublicSelection(selected,publish=false){
 if(auth.isAdmin()||!auth.isAuthenticated?.()||auth.profile?.()!==who)
  throw new Error('Sign in as the owner to publish.');
 await auth.request('public.profile.save',publishedPayload(selected));
 await syncPublishedGroup({enabled:selected.links,action:'public.link.upsert',
  listAction:'public.link.list',removeAction:'public.link.remove',idField:'linkId',
  listField:'links',prefix:'os-profile-'+who+'-link-',items:
   window.OurSpaceLinksModule?.getEntries?.()||data.links,
  map:x=>({name:String(x.label||x.name||x.title||'Link').slice(0,160),
   url:publicLinkUrl(x.url||x.link),description:String(x.description||'').slice(0,1000)})});
 await syncPublishedGroup({enabled:selected.music,action:'public.media.upsert',
  listAction:'public.media.list',removeAction:'public.media.remove',idField:'publicMediaId',
  listField:'media',prefix:'os-profile-'+who+'-music-',items:data.music,
  map:x=>({kind:'music',title:x.title||'Track',artist:x.artist||'',
   description:x.body||'',url:publicLinkUrl(x.url)})});
 await syncPublishedGroup({enabled:selected.gallery,action:'public.media.upsert',
  listAction:'public.media.list',removeAction:'public.media.remove',idField:'publicMediaId',
  listField:'media',prefix:'os-profile-'+who+'-gallery-',items:data.gallery,
  map:x=>({kind:/\\.(mp4|webm|mov|m4v)(?:[?#]|$)/i.test(x.url||'')?'video':'image',
   title:x.title||'Photo',description:x.body||'',url:publicLinkUrl(x.url)})});
 if(publish)await auth.request('public.profile.publish',{profileKey:who,published:true});
}
function queuePublishedSync(){
 if(auth.isAdmin()||!auth.isAuthenticated?.())return;
 clearTimeout(publicSyncTimer);
 publicSyncTimer=setTimeout(async()=>{
  try{
   const saved=await auth.request('preference.get',{profileKey:who,
     scope:'public-profile',key:'selected-fields'});
   const selection=saved?.value;
   if(!selection||typeof selection!=='object')return;
   // Account edits never make an unpublished profile public automatically.
   const publicRecord=await auth.request('public.profile.get',{profileKey:who});
   if(publicRecord?.profile?.profileKey!==who)return;
   await syncPublicSelection(selection,false);
  }catch(err){console.warn('Public profile sync deferred. Private profile remains saved:',err.message)}
 },1000);
}
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined&&text!==null)el.textContent=String(text);if(className)el.className=className;return el}
function appendText(id,key){$$(`[data-bind="${key}"]`).forEach(el=>{el.textContent=data[key]||''})}
function renderIdentity(){for(const key of keys)appendText('',key);const title=$('#profileTitle'),greeting=$('#headerGreeting'),notice=$('#networkNotice');if(title)title.textContent=(data.displayName||displayName)+"'s space";if(greeting)greeting.textContent=profileName;if(notice)notice.textContent=(data.displayName||displayName)+' is in your OurSpace';}
function createRemoveButton(type,id){const btn=node('button','Remove','outline-button danger');btn.type='button';btn.dataset.removeType=type;btn.dataset.removeId=id;return btn}
function renderList(type,container){container.replaceChildren();for(const item of data[type]){const li=node('li');if(item.date)li.append(node('p',new Date(item.date).toLocaleString(),'item-meta'));if(item.title)li.append(node('strong',item.title));if(item.title&&item.body)li.append(node('p',''));if(item.body)li.append(node('p',item.body));if(item.name)li.append(node('strong',item.name));if(type==='music'){const b=node('button','Play · '+(item.title||'Track'),'outline-button');b.type='button';b.dataset.playId=item.id;li.replaceChildren(b);if(item.artist)li.append(node('span',' — '+item.artist))}li.append(createRemoveButton(type,item.id));container.append(li)}}
function renderGallery(){const grid=$('#galleryGrid');grid.replaceChildren();for(const item of data.gallery){if(!item.url)continue;const card=node('figure',null,'gallery-tile'),img=node('img');img.src=item.url;img.alt=item.title||'Profile photograph';img.loading='lazy';card.append(img,node('figcaption',item.title),createRemoveButton('gallery',item.id));grid.append(card)}}
function render(){renderIdentity();if($('#retroPlayer'))window.postMessage({channel:'ourspace-record',kind:'sync',tracks:data.music.map((t,i)=>({src:t.url,title:t.title,artist:t.artist,album:t.album,sourceIndex:i}))},location.origin==='null'?'*':location.origin);}
function editOpen(){const module=$('#profile-identity');if(!module)return;module.scrollIntoView({behavior:'smooth',block:'center'});module.querySelector('input[name="displayName"]')?.focus({preventScroll:true});}
function exportProfile(){const out=JSON.stringify({schema:'ourspace.profile.preview.v1',profile:who,exportedAt:new Date().toISOString(),data},null,2);download(out,who+'-ourspace-profile.json','application/json')}
function download(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000)}
function navigatePublic(){location.assign(publicUrl())}
function wireProfile(){
 $('#publishClose').addEventListener('click',()=>$('#publishProfile').close());$('#publishCancel').addEventListener('click',()=>$('#publishProfile').close());
 $('#publishForm').addEventListener('submit',async e=>{
  e.preventDefault();
  if(auth.isAdmin())return status('Preview mode cannot publish.',true);
  const check=k=>Boolean(e.currentTarget.elements.namedItem(k)?.checked);
  const selected={
   displayName:check('displayName'),headline:check('headline'),
   about:check('about'),avatar:check('avatar'),
   links:check('links'),music:check('music'),gallery:check('gallery')
  };
  const el=$('#publishStatus');el.textContent='Publishing selected fields…';
  try{
   await syncPublicSelection(selected,true);
   await auth.request('preference.set',{profileKey:who,scope:'public-profile',key:'selected-fields',value:selected});
   $('#publishProfile').close();
   status('Published selections synced to OurSpace and the external profile viewer.');
  }catch(err){el.textContent='Publication was not confirmed: '+err.message}
 });

 document.addEventListener('click',async e=>{const btn=e.target.closest('[data-action],[data-collapse],[data-remove-id],[data-play-id]');if(!btn)return;const act=btn.dataset.action;
 if(act==='edit'){editOpen();return}if(act==='publish'){if(auth.isAdmin())status('Preview mode cannot publish account information.',true);else $('#publishProfile').showModal();return}if(act==='copyLink'){try{await navigator.clipboard.writeText(publicUrl());status('Public profile URL copied.')}catch(_){status('Public profile URL: '+publicUrl())}return}
 if(act==='publicView'){navigatePublic();return}if(act==='signout'){await auth.signOut();location.replace('../../ourspace.html');return}if(act==='exportProfile'){exportProfile();return}
 if(btn.hasAttribute('data-collapse')){const box=btn.closest('.profile-box');box.classList.toggle('is-collapsed');const open=!box.classList.contains('is-collapsed');btn.textContent=open?'−':'+';btn.setAttribute('aria-expanded',String(open));return}
 if(btn.dataset.removeId){const arr=data[btn.dataset.removeType];if(!arr)return;data[btn.dataset.removeType]=arr.filter(x=>x.id!==btn.dataset.removeId);render();save();return}
 if(btn.dataset.playId){const index=data.music.findIndex(x=>x.id===btn.dataset.playId);if(index>=0)window.postMessage({channel:'ourspace-record',kind:'select',index,autoplay:true},location.origin==='null'?'*':location.origin);return}
 });
 $$('form[data-collection]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const type=form.dataset.collection;const fd=new FormData(form);const entry={id:String(Date.now())+'-'+String(Math.random()).slice(2,9),date:new Date().toISOString()};for(const [k,v] of fd.entries())entry[k]=String(v).trim();if('url'in entry){entry.url=validUrl(entry.url);if(!entry.url){status('Please use an http(s) URL.',true);return}}data[type].unshift(entry);if(data[type].length>250)data[type].length=250;form.reset();render();save()}));
 $('#moduleSearch')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();$$('#profileApp .profile-box').forEach(el=>el.hidden=!!q&&!el.querySelector('.label')?.textContent.toLowerCase().includes(q))});
 render();status(auth.isAdmin()?'Local preview mode. Account data is not accessible here.':'Your profile.');
}
function wireMaster(){const master=$('#masterNav'),toggle=$('#masterToggle'),drag=$('#masterDrag');let moved=false,active=null;
 const position=(x,y)=>{const r=master.getBoundingClientRect();master.style.left=Math.max(4,Math.min(innerWidth-r.width-4,x))+'px';master.style.top=Math.max(4,Math.min(innerHeight-r.height-4,y))+'px'};
 const toggleNav=()=>{const expanded=master.classList.toggle('expanded');master.classList.toggle('collapsed',!expanded);toggle.setAttribute('aria-expanded',String(expanded));toggle.textContent=expanded?'×':'NAV'};
 toggle.addEventListener('click',e=>{if(moved){moved=false;return}toggleNav()});
 function dragStart(e){if(e.button!==0)return;const r=master.getBoundingClientRect();active={x:e.clientX,y:e.clientY,left:r.left,top:r.top,moved:false,pointer:e.pointerId};e.currentTarget.setPointerCapture(e.pointerId)}
 function dragMove(e){if(!active||active.pointer!==e.pointerId)return;const dx=e.clientX-active.x,dy=e.clientY-active.y;if(Math.hypot(dx,dy)>5)active.moved=true;if(active.moved){position(active.left+dx,active.top+dy);moved=true}}
 function dragEnd(e){if(!active)return;const didMove=active.moved;active=null;try{e.currentTarget.releasePointerCapture(e.pointerId)}catch(_){}if(didMove){const r=master.getBoundingClientRect();try{localStorage.setItem('ourspace.nav.pos.'+who,JSON.stringify({x:r.left,y:r.top}))}catch(_){}}}
 for(const handle of [drag,toggle]){handle.addEventListener('pointerdown',dragStart);handle.addEventListener('pointermove',dragMove);handle.addEventListener('pointerup',dragEnd);handle.addEventListener('pointercancel',()=>active=null)}
 try{const s=JSON.parse(localStorage.getItem('ourspace.nav.pos.'+who)||'null');if(s&&Number.isFinite(s.x)&&Number.isFinite(s.y))position(s.x,s.y)}catch(_){}
 $('#navFilter').addEventListener('input',e=>{const q=e.target.value.toLowerCase();$$('.master-links a').forEach(x=>x.hidden=!x.textContent.toLowerCase().includes(q))});
 $$('a[data-page-link]').forEach(a=>a.setAttribute('aria-current',a.dataset.pageLink===page?'page':'false'));
 $('#resetMaster').addEventListener('click',()=>{master.style.left='12px';master.style.top='12px';localStorage.removeItem('ourspace.nav.pos.'+who)});
 $('#exportSnapshot').addEventListener('click',()=>{const clone=document.documentElement.cloneNode(true);clone.querySelector('#designWidget')?.remove();clone.querySelector('#masterNav')?.remove();clone.querySelector('#profileEdit')?.remove();clone.querySelector('#publicProfile')?.remove();clone.querySelectorAll('script').forEach(x=>x.remove());download('<!doctype html>\n'+clone.outerHTML,who+'-'+page+'-snapshot.html','text/html')});
 $('#signoutProfile').addEventListener('click',async()=>{await auth.signOut();location.replace('../../ourspace.html')});
 if(auth.isAdmin()){const b=$('#switchProfile');b.hidden=false;b.textContent=who==='william'?'Switch to Jasper':'Switch to William';b.addEventListener('click',()=>location.assign(who==='william'?'jasper.html?page=profile':'william.html?page=profile'))}
}
async function publicMode(){
 // Direct ?public=1 requests use the same exact native published-only renderer as
 // william.html's OurSpace dropdown. This frame runs no signed-in profile scripts.
 $('#profileApp').hidden=true;
 $('#masterNav').hidden=true;
 $('#designWidget').hidden=true;
 $('#profileJumpNav').hidden=true;
 $('#profileEdit')?.remove();
 const mount=$('#publicProfile');
 mount.hidden=false;
 mount.style.cssText='width:100%;max-width:none;padding:0;margin:0;min-height:100vh';
 mount.replaceChildren();
 const frame=node('iframe');
 frame.id='ourspaceNativePublicFrame';
 frame.title=(who==='jasper'?'Jasper':'William')+' · Published OurSpace profile';
 frame.loading='eager';
 frame.referrerPolicy='no-referrer';
 frame.style.cssText='display:block;width:100%;height:3200px;border:0;overflow:hidden';
 frame.src='public-profile.html?profile='+encodeURIComponent(who);
 mount.append(frame);
 const onMessage=e=>{
   if(e.origin!==location.origin||e.source!==frame.contentWindow)return;
   const info=e.data;
   if(info?.type!=='ourspace:public-profile-height'||info.profileKey!==who)return;
   const height=Number(info.height);
   if(Number.isFinite(height))frame.style.height=Math.min(12000,Math.max(500,height))+'px';
 };
 window.addEventListener('message',onMessage);
}
async function init(){if(isPublic){await publicMode();return}
 if(!pages.includes(page)){location.replace(who+'.html?page=profile');return}
 if(!auth.authorize(who)){location.replace('../../ourspace.html');return}
 if(page==='journal')document.documentElement.classList.add('os-jd-allowed');
 wireMaster();
 if(page!=='profile'){document.body.classList.add('blank-destination');$('#profileApp').hidden=true;$('#profileEdit')?.remove();return}
 if(auth.isAdmin()){previewLoad();wireProfile()}else{wireProfile();await serverLoad()}
}
init();
if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('../../service-worker.js').catch(()=>{});
})();
