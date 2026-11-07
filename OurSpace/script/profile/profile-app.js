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
 try{await auth.request('profile.save',{profileKey:who,profile:data});status('Profile saved to your account.')}catch(err){status('This edit is visible here but could not sync to the account: '+err.message,true)}finally{saveRunning=false}}
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
 $('#publishForm').addEventListener('submit',async e=>{e.preventDefault();if(auth.isAdmin())return status('Preview mode cannot publish.',true);const check=k=>Boolean(e.currentTarget.elements.namedItem(k)?.checked);const entry={profileKey:who};if(check('displayName'))entry.displayName=data.displayName;if(check('headline'))entry.headline=data.headline;if(check('about'))entry.bio=data.about;if(check('avatar'))entry.avatar=data.avatar;if(check('links'))entry.links=(window.OurSpaceLinksModule?.getEntries?.()||data.links).map(x=>({title:x.label||x.title||'Link',url:x.url}));if(check('music'))entry.music=data.music.map(x=>({title:x.title,artist:x.artist,url:x.url}));if(check('gallery'))entry.photos=data.gallery.map(x=>({title:x.title,url:x.url}));const statusEl=$('#publishStatus');statusEl.textContent='Publishing selected fields…';try{await auth.request('public.profile.save',entry);$('#publishProfile').close();status('Selected profile information published.')}catch(err){statusEl.textContent='Publication unavailable: '+err.message}});

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
 // Published-only display. The private profile application is never initialized.
 $('#profileApp').hidden=true;
 $('#masterNav').hidden=true;
 $('#designWidget').hidden=true;
 $('#profileJumpNav').hidden=true;
 $('#profileEdit')?.remove();
 const mount=$('#publicProfile');
 mount.hidden=false;
 mount.classList.add('os-public-published');
 mount.dataset.owner=who;
 mount.replaceChildren(node('p','Loading the published OurSpace profile…','os-public-message'));
 const safeUrl=v=>typeof v==='string'&&/^https?:\/\//i.test(v.trim())?validUrl(v.trim()):'';
 const addImage=(host,url,alt,css)=>{
   const src=safeUrl(url);if(!src)return false;
   const img=node('img',undefined,css||'');
   img.src=src;img.alt=String(alt||'Published image').slice(0,140);
   img.loading='lazy';img.referrerPolicy='no-referrer';
   host.append(img);return true;
 };
 const link=(label,url)=>{
   const src=safeUrl(url);if(!src)return null;
   const a=node('a',String(label||'Published link').slice(0,160));
   a.href=src;a.target='_blank';a.rel='noopener noreferrer';return a;
 };
 const section=(title)=>{
   const el=node('section',undefined,'os-public-section');
   el.append(node('h2',title));return el;
 };
 const text=(host,value)=>{if(typeof value==='string'&&value.trim())host.append(node('p',value.slice(0,3000)))};
 const cards=(host,entries)=>{
   (Array.isArray(entries)?entries:[]).slice(0,80).forEach(item=>{
     const data=item&&typeof item==='object'?item:{title:String(item)};
     const card=node('div',undefined,'os-public-card');
     const title=String(data.title||data.name||data.label||'').slice(0,180);
     if(title)card.append(node('h3',title));
     text(card,data.description||data.summary||data.body);
     addImage(card,data.imageUrl||data.image||data.posterUrl,title,'os-public-card-image');
     const a=link('Open',data.url||data.link);if(a)card.append(a);
     if(card.childNodes.length)host.append(card);
   });
 };
 try{
   const response=await auth.request('public.profile.get',{profileKey:who});
   const pub=response&&response.profile;
   // Fail closed for unpublished, invalid, or unavailable data; never request profile.get.
   if(!response||response.ok!==true||response.view!=='public-profile'||!pub||pub.profileKey!==who){
     mount.replaceChildren(node('p','This profile is not currently published.','os-public-message'));return;
   }
   const article=node('article',undefined,'os-public-container');
   const hero=node('header',undefined,'os-public-hero');
   const banner=node('div',undefined,'os-public-banner');
   addImage(banner,pub.bannerUrl,'Published profile banner','os-public-banner-image');
   hero.append(banner);
   const whoBox=node('div',undefined,'os-public-identity');
   const avatar=node('div',undefined,'os-public-avatar');
   if(!addImage(avatar,pub.avatarUrl,'Published profile image','os-public-avatar-image'))avatar.append(node('strong',who==='jasper'?'J':'W'));
   whoBox.append(avatar);
   const words=node('div',undefined,'os-public-identity-text');
   words.append(node('p',profileName,'os-public-eyebrow'));
   words.append(node('h1',String(pub.displayName||displayName).slice(0,120)));
   text(words,pub.headline);
   whoBox.append(words);hero.append(whoBox);article.append(hero);
   const grid=node('div',undefined,'os-public-grid');
   if(typeof pub.bio==='string'&&pub.bio.trim()){const about=section('About');text(about,pub.bio);grid.append(about)}
   if(Array.isArray(pub.interests)&&pub.interests.length){
     const interests=section('Interests'),tags=node('div',undefined,'os-public-tags');
     pub.interests.slice(0,40).forEach(x=>{if(typeof x==='string'&&x.trim())tags.append(node('span',x.slice(0,120)))});
     if(tags.childNodes.length){interests.append(tags);grid.append(interests)}
   }
   if(Array.isArray(pub.projects)&&pub.projects.length){
     const projects=section('Projects');cards(projects,pub.projects);
     if(projects.childNodes.length>1)grid.append(projects);
   }
   const links=Array.isArray(response.links)?response.links:[];
   if(links.length){
     const list=section('Shared links');
     links.slice(0,200).forEach(item=>{
       if(!item||typeof item!=='object')return;
       const a=link(item.name||item.title||'Published link',item.url||item.link);
       if(!a)return;
       const div=node('div',undefined,'os-public-link');
       div.append(a);text(div,item.description);list.append(div);
     });
     if(list.childNodes.length>1)grid.append(list);
   }
   if((Array.isArray(pub.donationMethods)&&pub.donationMethods.length)||pub.creatorDonation){
     const donation=section('Donation and support');
     cards(donation,pub.donationMethods);
     if(pub.creatorDonation&&typeof pub.creatorDonation==='object'){
       const a=link(pub.creatorDonation.label||'Support the creator',pub.creatorDonation.url||pub.creatorDonation.donationUrl);
       if(a)donation.append(a);
     }
     if(donation.childNodes.length>1)grid.append(donation);
   }
   const music=response.musicPlayer&&Array.isArray(response.musicPlayer.items)?response.musicPlayer.items:[];
   const favorite=pub.favoriteSong&&typeof pub.favoriteSong==='object'?pub.favoriteSong:null;
   if(music.length||favorite){
     const panel=section('Music');
     if(favorite&&favorite.title){
       panel.append(node('p','Favorite song: '+String(favorite.title).slice(0,160)+(favorite.artist?' — '+String(favorite.artist).slice(0,100):'')));
       const a=link('Open favorite song',favorite.url||favorite.link);if(a)panel.append(a);
     }
     music.slice(0,80).forEach(item=>{
       if(!item||typeof item!=='object')return;
       const card=node('div',undefined,'os-public-card');
       card.append(node('h3',String(item.title||'Published track').slice(0,150)));
       if(item.artist)text(card,String(item.artist).slice(0,120));
       const src=safeUrl(item.url);
       if(src){const audio=node('audio');audio.controls=true;audio.preload='none';audio.src=src;card.append(audio);
         const a=link('Open music',src);if(a)card.append(a);
       }
       panel.append(card);
     });
     if(panel.childNodes.length>1)grid.append(panel);
   }
   const visuals=response.visualPlayer&&Array.isArray(response.visualPlayer.items)?response.visualPlayer.items:[];
   if(visuals.length){
     const panel=section('Photos and videos'),gallery=node('div',undefined,'os-public-gallery');
     visuals.slice(0,80).forEach(item=>{
       if(!item||typeof item!=='object')return;
       const fig=node('figure'),kind=String(item.kind||'').toLowerCase(),src=safeUrl(item.url);
       if(kind==='image')addImage(fig,src,item.title||'Published image','os-public-gallery-image');
       if(kind==='video'&&src){const video=node('video');video.controls=true;video.preload='metadata';video.src=src;
         const poster=safeUrl(item.posterUrl);if(poster)video.poster=poster;fig.append(video);
       }
       if(!fig.childNodes.length){const a=link('Open published media',src);if(a)fig.append(a)}
       if(fig.childNodes.length){fig.append(node('figcaption',String(item.title||'Published media').slice(0,140)));gallery.append(fig)}
     });
     if(gallery.childNodes.length){panel.append(gallery);grid.append(panel)}
   }
   if(!grid.childNodes.length){const blank=section('Published profile');blank.append(node('p','No additional sections have been shared publicly yet.'));grid.append(blank)}
   article.append(grid,node('p','Read-only • Only information published in OurSpace appears here.','os-public-privacy'));
   mount.replaceChildren(article);
 }catch(_){mount.replaceChildren(node('p','This published profile is temporarily unavailable.','os-public-message'))}
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
