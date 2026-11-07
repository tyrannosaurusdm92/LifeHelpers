/* Feature media/news from their original full pages into the existing profile modules.
 * No replacement player/carousel/news module is created here. Shared profile data uses
 * the original module storage keys and de-duplicates by source ID. */
(()=>{'use strict';
const page=new URLSearchParams(location.search).get('page')||'profile';const who=document.documentElement.dataset.profile||'william';
if(new URLSearchParams(location.search).get('public')==='1')return;
const collection={visual:'pictures',audio:'music',feed:'news'};
const storageKey=kind=>'myspace_module_'+who+'_'+kind;
function cleanURL(url){try{const u=new URL(String(url||''),location.href);return /^https?:$/.test(u.protocol)?u.href:''}catch(_){return ''}}
function getList(kind){try{const x=JSON.parse(localStorage.getItem(storageKey(kind))||'[]');return Array.isArray(x)?x:[]}catch(_){return []}}
function idbBlob(dbName,id){return new Promise(resolve=>{try{const req=indexedDB.open(dbName);req.onerror=()=>resolve(null);req.onsuccess=()=>{const db=req.result;try{const tx=db.transaction('blobs','readonly');const r=tx.objectStore('blobs').get(id);r.onsuccess=()=>{resolve(r.result instanceof Blob?r.result:r.result?.blob||null);db.close()};r.onerror=()=>{resolve(null);db.close()}}catch(_){db.close();resolve(null)}}}catch(_){resolve(null)}})}
const readBlobAsData=blob=>new Promise(resolve=>{if(!(blob instanceof Blob)||blob.size>2200000){resolve('');return}const fr=new FileReader();fr.onload=()=>resolve(typeof fr.result==='string'?fr.result:'');fr.onerror=()=>resolve('');fr.readAsDataURL(blob)});
function upsert(kind,entry){const old=getList(kind),id=entry.ourspaceFeatureKey;if(!id)return false;
 const index=old.findIndex(x=>x.ourspaceFeatureKey===id);if(index>=0)old[index]={...old[index],...entry};else old.unshift(entry);
 try{localStorage.setItem(storageKey(kind),JSON.stringify(old.slice(0,250)))}catch(err){throw new Error('The browser could not save that featured item. Use a hosted link or free storage space.')}
 window.OurSpaceModuleControllers?.[kind==='pictures'?'carousel_gallery_module':kind==='news'?'profile_news':'']?.upsertFeatured?.(entry);
 window.dispatchEvent(new CustomEvent('ourspace:profile-feature-updated',{detail:{profile:who,kind,entry}}));return true;
}
function getCandidates(){if(page==='visual')return (window.OurSpaceVisualPlayer?.getLibrary?.().assets||[]).filter(x=>x.kind==='image'||x.kind==='video').map(x=>({key:x.id,label:(x.title||x.name||'Visual')+' · '+(x.kind||'media'),obj:x}));
 if(page==='audio')return (window.OurSpaceMedia?.getLibrary?.().tracks||[]).map(x=>({key:x.id,label:(x.title||x.name||'Song')+' — '+(x.artist||''),obj:x}));
 if(page==='feed')return (window.OurSpaceFeedBridge?.getItems?.()||[]).map(x=>({key:x.id||x.key,label:(x.title||x.body||'Article').slice(0,130),obj:x}));return []}
if(['visual','audio','feed'].includes(page)){
 const host=document.querySelector(`[data-ourspace-page="${page}"] .os-page-content`);if(!host)return;
 const panel=document.createElement('section');panel.className='os-feature-panel';panel.setAttribute('aria-label','Feature content on profile');
 panel.innerHTML=`<strong>${page==='visual'?'Send a favorite picture to the profile carousel':page==='audio'?'Send a favorite song to the retro record player':'Send a favorite article to Profile News'}</strong><div class="os-feature-controls"><select aria-label="Choose item to feature" id="osFeatureSelect"><option value="">Choose an item</option></select><button type="button" id="osFeatureRefresh">Refresh choices</button><button type="button" id="osFeatureSend">Feature on profile</button></div><output role="status" id="osFeatureStatus"></output>`;
 host.prepend(panel);
 let candidates=[];const select=panel.querySelector('select'),status=panel.querySelector('output');
 function refresh(){const current=select.value;candidates=getCandidates();select.replaceChildren(new Option(candidates.length?'Choose an item':'Nothing in this library yet',''));
 for(const item of candidates){const option=document.createElement('option');option.value=String(item.key||'');option.textContent=item.label;select.append(option)}if(candidates.some(x=>String(x.key)===current))select.value=current;status.textContent=`${candidates.length} available. ${candidates.length?'Choose one and select Feature on profile.':'Add content to the original page first.'}`}
 panel.querySelector('#osFeatureRefresh').addEventListener('click',refresh);
 panel.querySelector('#osFeatureSend').addEventListener('click',async()=>{
 const item=candidates.find(x=>String(x.key)===select.value);if(!item){status.textContent='Select an item first.';return}
 try{const x=item.obj;let entry;
 if(page==='visual'){
  let image=cleanURL(x.remoteUrl||x.url||x.downloadUrl||x.externalUrl||'');
  const localRef=!image?String(x.id||''):'';
  if(!image && x.kind==='image')image=await readBlobAsData(await idbBlob('ourspace_visual_player_v1',x.id));
  entry={ourspaceFeatureKey:'visual:'+x.id,id:'os-feature-visual-'+x.id,caption:x.title||x.name||'Favorite picture',title:x.title||x.name||'',image,osVisualDbId:localRef,kind:x.kind||'image',description:x.description||''};
  if(x.kind==='video'&&!image){entry.url=cleanURL(x.remoteUrl||x.url||'');}
  upsert('pictures',entry);
 }else if(page==='audio'){
  const src=cleanURL(x.remoteUrl||x.url||x.downloadUrl||x.externalUrl||x.audio||'');
  entry={ourspaceFeatureKey:'audio:'+x.id,id:'os-feature-audio-'+x.id,title:x.title||x.name||'Untitled track',artist:x.artist||'',album:x.album||'',url:src,audio:src,osAudioDbId:src?'':x.id};
  upsert('music',entry);
 }else{
  entry={ourspaceFeatureKey:'feed:'+item.key,id:'os-feature-news-'+item.key,title:x.title||'Untitled article',body:x.body||x.summary||'',summary:x.summary||'',url:cleanURL(x.url||x.link||''),source:x.source||'',author:x.author||'',createdAt:x.createdAt||new Date().toISOString(),image:cleanURL(x.image||'')};
  upsert('news',entry);
 }
 status.textContent='Featured on '+who+'’s profile. The original profile module has been updated.';
 // Server-side compatibility is optional; never claim success when unavailable.
 if(window.OurSpaceAuth?.isAuthenticated?.()){
   try{await window.OurSpaceAuth.request('profile.feature.save',{profileKey:who,kind:collection[page],item:entry});status.textContent+=' Account synchronization confirmed.'}
   catch(_){status.textContent+=' Saved in this browser; cross-device publishing requires a compatible backend.'}
 }
 }catch(err){status.textContent=err.message||'Could not feature the selected item.'}
 });
 setTimeout(refresh,450);window.addEventListener('ourspace:media-ready',refresh);
}
// The retro player consumes its own track-sync messages; keep its bundled music intact.
if(page==='profile'){
 async function syncRecordPlayer(){if(!document.querySelector('#retroPlayer'))return;
  const local=getList('music');const urls=[];
  for(const [i,x] of local.entries()){
   let src=cleanURL(x.url||x.audio||x.file||'');
   if(!src&&x.osAudioDbId){const blob=await idbBlob('ourspace_media_player_v1',x.osAudioDbId);if(blob)src=URL.createObjectURL(blob)}
   if(src)urls.push({sourceIndex:i,src,title:x.title||'Untitled track',artist:x.artist||'Unknown',album:x.album||''});
  }
  window.postMessage({channel:'ourspace-record',kind:'sync',tracks:urls},location.origin==='null'?'*':location.origin);
 }
 function syncCarousel(){const root=document.querySelector('[data-os-design-scope="carousel_gallery_module"]');if(!root)return;
 const items=getList('pictures');const cur=items[0];if(!cur||cur.image||!cur.osVisualDbId)return;
 idbBlob('ourspace_visual_player_v1',cur.osVisualDbId).then(blob=>{if(!blob)return;const img=root.querySelector('[data-carousel-image]');if(img){img.src=URL.createObjectURL(blob);img.hidden=false}});
 }
 window.addEventListener('message',e=>{if(e.source===window&&e.data?.channel==='ourspace-record'&&e.data?.kind==='ready')syncRecordPlayer()});
 window.addEventListener('ourspace:profile-feature-updated',()=>{syncRecordPlayer();syncCarousel()});
 setTimeout(()=>{syncRecordPlayer();syncCarousel()},700);
}
})();
