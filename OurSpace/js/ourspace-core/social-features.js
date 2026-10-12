/* OurSpace social surfaces: one public-media source for Profile, Feed, Audio and Visual.
   Uses ONLY the existing Apps Script actions; sharing never publishes private messages. */
(()=>{'use strict';
const $=(q,r=document)=>r.querySelector(q);
const user=document.documentElement.dataset.profile==='jasper'?'jasper':'william';
const partner=user==='william'?'jasper':'william';
const display=x=>x==='william'?'William':'Jasper';
let client=null;try{client=window.parent?.OurSpaceBackend||window.OurSpaceBackend;}catch(_){}
const canWrite=()=>!!client?.token?.()&&client.profile?.()===user&&!client.isAdmin?.()&&document.documentElement.dataset.publicView!=='true';
const valid=x=>{try{const u=new URL(String(x||''));return /^(https?:)$/.test(u.protocol)?u.href:null}catch(_){return null}};
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e};
const link=(label,url)=>{const a=make('a','os-social-link',label);a.href=valid(url)||'#';a.rel='noopener noreferrer';a.target='_blank';return a};
const button=(label,fn)=>{const b=make('button','os-social-action',label);b.type='button';b.addEventListener('click',fn);return b};
const state={william:{media:[],links:[],published:false},jasper:{media:[],links:[],published:false}};
const captured=new WeakSet();
let pending=false;
const mediaKind=m=>String(m.kind||m.mediaKind||'').toLowerCase();
const normalizedMedia=items=>(Array.isArray(items)?items:[]).filter(m=>valid(m.url)&&['music','image','video'].includes(mediaKind(m))).map(m=>({...m,url:valid(m.url),kind:mediaKind(m)}));
const normalizedLinks=items=>(Array.isArray(items)?items:[]).filter(m=>valid(m.url||m.link)).map(m=>({...m,url:valid(m.url||m.link)}));
async function refresh(){
 if(!client||pending)return;pending=true;
 try{
  if(canWrite()){
   const [ownMedia,ownLinks]=await Promise.all([client.request('public.media.list'),client.request('public.link.list')]);
   state[user]={...state[user],media:normalizedMedia(ownMedia.media),links:normalizedLinks(ownLinks.links)};
  }
  for(const who of [user,partner]){
   try{
    const result=await client.request('public.profile.get',{profileKey:who});
    const existing=state[who];state[who]={...existing,published:true,profile:result.profile,
      media:who===user&&canWrite()?existing.media:normalizedMedia([...(result.musicPlayer?.items||[]),...(result.visualPlayer?.items||[])]),
      links:who===user&&canWrite()?existing.links:normalizedLinks(result.links)};
   }catch(_){if(who===partner){state[who]={media:[],links:[],published:false}}}
  }
  renderAll();
 }catch(error){showStatus('Public sharing unavailable: '+error.message,true);renderAll()}
 finally{pending=false}
}
function openConversation(who,source){
 if(who===user)return;
 window.dispatchEvent(new CustomEvent('ourspace:open-conversation',{detail:{id:'dm-jasper-william',source:source||'profile',page:true}}));
}
function jump(page){window.ourspaceNavigatePage?.(page);const route=$(`.page-route[data-page="${page}"]`);if(!window.ourspaceNavigatePage)route?.click()}
function piece(m,who){
 const card=make('article','os-social-card');
 const kind=mediaKind(m),url=valid(m.url);if(!url)return card;
 const bar=make('div','os-social-card-heading');bar.append(make('strong','',m.title||'Untitled'),make('small','',display(who)+' · '+kind));card.append(bar);
 if(kind==='image'){const img=make('img','os-social-media');img.src=url;img.loading='lazy';img.alt=m.title||'Shared image';card.append(img)}
 if(kind==='video'){const v=make('video','os-social-media');v.src=url;v.controls=true;v.preload='none';v.playsInline=true;card.append(v)}
 if(kind==='music'){const a=make('audio','os-social-audio');a.controls=true;a.preload='none';a.src=url;card.append(a)}
 if(m.artist)card.append(make('p','os-social-detail',m.artist));
 const actions=make('div','os-social-actions');actions.append(link('Open original',url));
 actions.append(button('Share in chat',()=>{
  if(!canWrite()){showStatus('Sign in before sharing a link in a private conversation.',true);return}
  const text=`${display(who)} shared ${m.title||kind}: ${url}`;
  if(window.ourspaceMessenger?.sendText){window.ourspaceMessenger.sendText('dm-jasper-william',text).catch(err=>showStatus(err.message,true));openConversation(partner,'media');}
  else showStatus('Messenger is not ready.',true)
 }));
 if(who!==user&&canWrite())actions.append(button('Message '+display(who),()=>openConversation(who,'media')));
 card.append(actions);return card;
}
function buildSection(id,title,target,description){
 const root=$(target);if(!root)return null;
 let section=$('#'+id,root);if(section)return section;
 section=make('section','os-social-section');section.id=id;
 section.append(make('h2','',title));if(description)section.append(make('p','os-social-intro',description));
 const result=make('div','os-social-grid');result.dataset.socialResults='';section.append(result);root.prepend(section);return section;
}
function showStatus(text,error=false){for(const node of document.querySelectorAll('[data-os-social-status]')){node.textContent=text;node.dataset.error=String(error)}}
function publisher(section,kinds){
 if(!section||section.querySelector('form')||!canWrite())return;
 const form=make('form','os-social-publish');form.setAttribute('aria-label','Publish selected media to public profile');
 const legend=make('strong','', 'Publish to my public profile');form.append(legend);
 const type=make('select');type.name='kind';type.setAttribute('aria-label','Media kind');for(const k of kinds){const o=make('option','',k==='music'?'Music':k==='image'?'Image':'Video');o.value=k;type.append(o)}
 const title=make('input');title.name='title';title.placeholder='Title';title.required=true;title.maxLength=240;title.setAttribute('aria-label','Title');
 const url=make('input');url.name='url';url.type='url';url.placeholder='https://… (public link)';url.required=true;url.setAttribute('aria-label','Public HTTPS link');
 const artist=make('input');artist.name='artist';artist.placeholder='Artist (optional)';artist.setAttribute('aria-label','Artist (optional)');
 const submit=make('button','os-social-action','Publish');submit.type='submit';
 form.append(type,title,url,artist,submit);
 form.addEventListener('submit',async e=>{e.preventDefault();if(!canWrite())return;
  const input=Object.fromEntries(new FormData(form));const clean=valid(input.url);if(!clean){showStatus('Enter a public HTTP(S) URL.',true);return}
  submit.disabled=true;try{await client.request('public.media.upsert',{kind:input.kind,url:clean,title:input.title,artist:input.artist||''});form.reset();showStatus('Published to your public media.');await refresh()}
  catch(error){showStatus('Not published: '+error.message,true)}finally{submit.disabled=false}
 });
 const status=make('p','os-social-status');status.dataset.osSocialStatus='';status.setAttribute('role','status');form.append(status);section.insertBefore(form,section.querySelector('[data-social-results]'));
}
function renderMedia(section,allowed){if(!section)return;const target=section.querySelector('[data-social-results]');target.replaceChildren();let total=0;
 for(const who of [user,partner]){
  const items=state[who].media.filter(m=>allowed.includes(m.kind));if(!items.length)continue;
  const group=make('div','os-social-group');group.append(make('h3','',display(who)+(who===user?(state[who].published?' · My published media':' · Public media awaiting profile publication'):' · Published media')));
  const grid=make('div','os-social-gallery');items.slice(-24).reverse().forEach(m=>grid.append(piece(m,who)));group.append(grid);target.append(group);total+=items.length;
 }
 if(!total)target.append(make('p','os-social-empty','No published items available yet. Personal media and private chats are not automatically public.'));
}
function renderFeed(section){if(!section)return;const host=section.querySelector('[data-social-results]');host.replaceChildren();let count=0;
 for(const who of [user,partner]){
  const data=state[who];const items=[...data.media.map(m=>({name:m.title,url:m.url,type:m.kind,kind:m.kind})),...data.links.map(l=>({name:l.name||'Link',url:l.url,type:'link'}))];
  const group=make('div','os-social-group');group.append(make('h3','',display(who)));
  if(items.length){for(const item of items.slice(-20).reverse()){
   const row=make('article','os-social-feed-item');const label=make('strong','',item.name||'Published item');row.append(label,make('span','', ' · '+item.type+' · '));row.append(link('View',item.url));row.append(button('Send to chat',()=>{
    if(!canWrite())return showStatus('Sign in to message.',true);
    window.ourspaceMessenger?.sendText?.('dm-jasper-william',`${display(who)} shared: ${item.name||'Link'} — ${item.url}`).catch(err=>showStatus(err.message,true));
   }));group.append(row);count++;
  }}else group.append(make('p','os-social-empty',data.published?'No public updates yet.':'Public profile not published or unavailable.'));
  host.append(group);
 }
 if(!count)host.append(make('p','os-social-empty','Feed remains private until items are explicitly published.'));
}
function renderProfile(section){if(!section)return;const host=section.querySelector('[data-social-results]');host.replaceChildren();
 for(const who of [user,partner]){
  const data=state[who],row=make('article','os-social-profile-card');
  row.append(make('h3','',display(who)));row.append(make('p','',data.profile?.headline|| (data.published?'Published profile':'Profile not publicly published')));
  if(data.profile?.bio)row.append(make('p','',data.profile.bio.slice(0,340)));
  const actions=make('div','os-social-actions');
  if(data.published){actions.append(link('View public profile',new URL(`assets/code/${who}.html?public=1`,document.baseURI).href));actions.append(button('View '+display(who)+' media',()=>jump('visual')))}
  if(who!==user&&canWrite())actions.append(button('Message '+display(who),()=>openConversation(who,'profile')));
  row.append(actions);host.append(row);
 }
}
function publisherLink(section){
 if(!section||!canWrite()||section.querySelector('[data-os-link-publish]'))return;
 const form=make('form','os-social-publish');form.dataset.osLinkPublish='';
 form.append(make('strong','','Share an approved public link from Feed'));
 const title=make('input');title.name='title';title.placeholder='Link title';title.required=true;title.setAttribute('aria-label','Public link title');
 const url=make('input');url.name='url';url.type='url';url.required=true;url.placeholder='https://…';url.setAttribute('aria-label','Public link URL');
 const submit=make('button','os-social-action','Publish link');submit.type='submit';
 form.append(title,url,submit);
 form.addEventListener('submit',async e=>{e.preventDefault();const address=valid(url.value);if(!address)return showStatus('Enter a valid public HTTP(S) link.',true);
  submit.disabled=true;try{await client.request('public.link.upsert',{name:title.value,url:address,description:'ourspace:feed'});form.reset();showStatus('Link published.');await refresh()}
  catch(err){showStatus('Link not published: '+err.message,true)}finally{submit.disabled=false}
 });
 const notice=make('p','os-social-status');notice.dataset.osSocialStatus='';notice.setAttribute('role','status');form.append(notice);
 section.insertBefore(form,section.querySelector('[data-social-results]'));
}
function connectPlayingMedia(){
 for(const page of ['audio','visual']){
  const host=$(`#page-${page} [data-embedded-module]`),root=host?.shadowRoot;
  if(!root||captured.has(root))continue;
  captured.add(root);
  const getForm=()=> $(`#osSocial${page==='audio'?'Audio':'Visual'}Connections form.os-social-publish`);
  const fill=el=>{
   const src=valid(el.currentSrc||el.src);if(!src)return;
   const form=getForm();if(!form)return;
   form.elements.url.value=src;
   form.elements.title.value=el.title||el.alt||'Selected '+page;
   if(form.elements.kind)form.elements.kind.value=page==='audio'?'music':el.tagName.toLowerCase()==='video'?'video':'image';
   showStatus('Selected public URL copied into publishing form. Review before publishing.');
  };
  root.addEventListener('play',event=>{const el=event.target;if(['AUDIO','VIDEO'].includes(el.tagName))fill(el)},true);
  if(page==='visual')root.addEventListener('click',event=>{const el=event.target.closest?.('img,video');if(el)fill(el)},true);
 }
}
function renderAll(){
 const home=buildSection('osSocialProfileConnections','William · Jasper · Public profiles','#page-retrobuilder','The private profiles connect here to explicitly published public pages; Messages remain private.');renderProfile(home);
 const feed=buildSection('osSocialFeedConnections','William & Jasper · Shared public updates','#page-feed','Published music, photos, videos and links from both profiles. Private messages never appear here.');publisherLink(feed);renderFeed(feed);
 const audio=buildSection('osSocialAudioConnections','Music shared by William and Jasper','#page-audio','Play published music; publish public links explicitly.');publisher(audio,['music']);renderMedia(audio,['music']);
 const visual=buildSection('osSocialVisualConnections','Photos & videos shared by William and Jasper','#page-visual','Only items deliberately published to a public profile appear here.');publisher(visual,['image','video']);renderMedia(visual,['image','video']);connectPlayingMedia();
}
window.OurSpaceSocial={refresh,publicState:()=>({[user]:{media:state[user].media.length,links:state[user].links.length},[partner]:{media:state[partner].media.length,links:state[partner].links.length}})};
window.addEventListener('ourspace:page-changed',()=>{renderAll();refresh()});
window.addEventListener('ourspace:native-mounted',()=>renderAll());
window.addEventListener('ourspace:public-profile-design-saved',refresh);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{renderAll();refresh()},{once:true});else {renderAll();refresh()}
})();
