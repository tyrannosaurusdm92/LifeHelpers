/* Original OurSpace feed controller, loaded only on this page. */
if (new URLSearchParams(location.search).get("page")==="feed" && new URLSearchParams(location.search).get("public")!=="1") {
(() => {
'use strict';

const BACKEND_URL = '';
const PROFILE_KEYS = ['william','jasper'];
const PROFILE_NAMES = {william:'William', jasper:'Jasper'};
const STORE_KEY = 'ourspace.feed.client.v2';
const LOCAL_ITEMS_KEY = 'ourspace.feed.localItems.v2';
const PAGE_SIZE = 20;
const MAX_CACHE = 500;

const $ = (s,r=document) => r.querySelector(s);
const $$ = (s,r=document) => Array.from(r.querySelectorAll(s));
const roots = [$('#desktop-news--page-quad'), $('#mobile-news--page-quad')].filter(Boolean);
if (!roots.length) return;

const state = {
  items: [],
  visible: PAGE_SIZE,
  filters: {author:'all', type:'all', sort:'latest', query:''},
  newCount: 0,
  lastRefresh: '',
  sessionProfile: '',
  backendState: 'public',
};

function readJSON(key, fallback) {
  try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (_) { return fallback; }
}
function writeJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
function esc(v='') { return String(v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function text(v='') { const d=document.createElement('div'); d.innerHTML=String(v); return (d.textContent||'').replace(/\s+/g,' ').trim(); }
function safeURL(v='') { try { const u=new URL(v, location.href); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch (_) { return ''; } }
function nowISO() { return new Date().toISOString(); }
function parseDate(v) { const n=Date.parse(v||''); return Number.isFinite(n) ? n : 0; }
function displayTime(v) { const n=parseDate(v); return n ? new Date(n).toLocaleString() : ''; }
function stableId(item) {
  const raw=[item.type,item.author,item.url,item.title,item.createdAt,item.source,item.key].map(v=>String(v||'')).join('|');
  let h=2166136261; for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619)}
  return 'feed_'+(h>>>0).toString(36);
}
function normalizeType(v) {
  const s=String(v||'activity').toLowerCase();
  if (/pin/.test(s)) return 'pin';
  if (/post|status|journal|blog/.test(s)) return 'post';
  if (/share/.test(s)) return 'share';
  if (/link/.test(s)) return 'link';
  if (/music|song|audio/.test(s)) return 'music';
  if (/media|image|video|photo|gif/.test(s)) return 'media';
  if (/project/.test(s)) return 'project';
  if (/profile/.test(s)) return 'profile';
  if (/news|article/.test(s)) return 'news';
  return 'share';
}
function normalizeAuthor(v) {
  const s=String(v||'').toLowerCase();
  if (s.includes('william') || s === 'dino') return 'william';
  if (s.includes('jasper') || s === 'squishy') return 'jasper';
  return s || 'news';
}
function normalizeItem(raw={}) {
  const type=normalizeType(raw.type||raw.kind||raw.activityType||raw.bucket);
  const author=type==='news' ? 'news' : normalizeAuthor(raw.author||raw.profileKey||raw.ownerProfileKey||raw.fromProfile);
  const item={
    id: raw.id || raw.recordId || raw.eventId || raw.key || '',
    key: raw.key || '',
    type,
    author,
    title: text(raw.title||raw.name||raw.subject||''),
    body: text(raw.body||raw.note||raw.description||raw.summary||raw.text||''),
    url: safeURL(raw.url||raw.link||raw.href||raw.profileUrl||''),
    image: safeURL(raw.image||raw.imageUrl||raw.posterUrl||raw.thumbnailUrl||raw.avatarUrl||''),
    source: text(raw.source||raw.sourceLabel||raw.platform||'OurSpace'),
    reason: text(raw.reason||raw.action||raw.activity||''),
    createdAt: raw.createdAt||raw.updatedAt||raw.publishedAt||raw.time||nowISO(),
    metadata: raw.metadata||raw.meta||{},
  };
  item.id=item.id||stableId(item);
  return item;
}
function mergeItems(items, countAsNew=false) {
  const map=new Map(state.items.map(i=>[i.id,i]));
  let added=0;
  for(const raw of items||[]) {
    const item=normalizeItem(raw);
    const existing=map.get(item.id);
    if (!existing) { map.set(item.id,item); added++; }
    else map.set(item.id,{...existing,...item});
  }
  state.items=Array.from(map.values()).sort((a,b)=>parseDate(b.createdAt)-parseDate(a.createdAt)).slice(0,MAX_CACHE);
  if(countAsNew && added) state.newCount+=added;
  persistCache();
  renderAll();
  return added;
}
function persistCache() {
  writeJSON(STORE_KEY,{filters:state.filters,lastRefresh:state.lastRefresh,sessionProfile:state.sessionProfile});
  writeJSON(LOCAL_ITEMS_KEY,state.items.filter(i=>i.source==='OurSpace Local' || i.metadata?.local===true).slice(0,200));
}
function loadState() {
  const saved=readJSON(STORE_KEY,{});
  if(saved.filters) state.filters={...state.filters,...saved.filters};
  state.lastRefresh=saved.lastRefresh||'';
  state.sessionProfile=saved.sessionProfile||'';
  const locals=readJSON(LOCAL_ITEMS_KEY,[]);
  if(Array.isArray(locals)) mergeItems(locals,false);
}
function getSessionToken() {
  if (typeof window.OURSPACE_SESSION_TOKEN === 'string' && window.OURSPACE_SESSION_TOKEN) return window.OURSPACE_SESSION_TOKEN;
  const keys=['ourspace.sessionToken','ourspace.auth.sessionToken','ourspace.session.token','sessionToken'];
  for(const k of keys){try{const v=localStorage.getItem(k); if(v)return v}catch(_){}}
  try {
    const auth=JSON.parse(localStorage.getItem('ourspace.auth')||'null');
    if(auth?.sessionToken) return auth.sessionToken;
  } catch(_){}
  return '';
}
function jsonp(action, data={}) {
  return new Promise((resolve,reject)=>{
    const cb='__ourspaceFeed_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2);
    const params=new URLSearchParams({action,callback:cb});
    Object.entries(data).forEach(([k,v])=>{if(v!==undefined&&v!==null)params.set(k,typeof v==='object'?JSON.stringify(v):String(v))});
    const script=document.createElement('script');
    const timer=setTimeout(()=>done(new Error('Feed request timed out.')),15000);
    function done(err,val){clearTimeout(timer);try{delete window[cb]}catch(_){};script.remove();err?reject(err):resolve(val)}
    window[cb]=(payload)=>done(null,payload);
    script.onerror=()=>done(new Error('Feed request could not reach the public endpoint.'));
    script.src=BACKEND_URL+'?'+params.toString();
    document.head.appendChild(script);
  });
}
async function apiPost(action, data={}) {
  const token=getSessionToken();
  if(!token) throw new Error('No signed-in session is available.');
  const payload={action,sessionToken:token,data};
  const res=await fetch(BACKEND_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8','Accept':'application/json'},body:JSON.stringify(payload),redirect:'follow'});
  if(!res.ok) throw new Error(`Backend returned HTTP ${res.status}.`);
  const out=await res.json();
  if(out && out.ok===false) throw new Error(out.error||'Backend request failed.');
  return out;
}

function publicProfileItems(profileKey, response) {
  if(!response?.ok || !response.profile) return [];
  const p=response.profile, author=normalizeAuthor(profileKey), out=[];
  const stamp=p.updatedAt||nowISO();
  if(p.headline||p.bio) out.push(normalizeItem({type:'profile',author,title:p.headline||`${PROFILE_NAMES[author]||author} profile`,body:p.bio||'',url:p.profileUrl||p.appUrl||'',image:p.avatarUrl||'',source:'OurSpace Public Profile',reason:'profile',createdAt:stamp,key:`public-profile-${author}`}));
  (p.projects||[]).forEach((x,i)=>out.push(normalizeItem({type:'project',author,title:x.title||x.name||'',body:x.description||x.body||'',url:x.url||x.link||'',image:x.image||x.imageUrl||'',source:'OurSpace Public Profile',reason:'project',createdAt:x.updatedAt||stamp,key:`project-${author}-${i}-${x.title||x.name||''}`})));
  (response.links||[]).forEach((x,i)=>out.push(normalizeItem({type:'link',author,title:x.name||x.title||x.url||'',body:x.description||'',url:x.url||x.link||'',source:'OurSpace Public Profile',reason:'link',createdAt:x.updatedAt||stamp,key:`link-${author}-${x.id||i}`})));
  const media=[...(response.musicPlayer?.items||[]),...(response.visualPlayer?.items||[])];
  media.forEach((x,i)=>out.push(normalizeItem({type:x.kind==='music'?'music':'media',author,title:x.title||x.artist||'',body:x.description||'',url:x.url||'',image:x.posterUrl||((x.kind==='image')?x.url:''),source:'OurSpace Public Profile',reason:x.kind||'media',createdAt:x.updatedAt||stamp,key:`media-${author}-${x.id||i}`})));
  const song=p.favoriteSong||{};
  if(song.title||song.url) out.push(normalizeItem({type:'music',author,title:song.title||'',body:song.artist||'',url:song.url||song.link||'',image:song.artwork||song.image||'',source:'OurSpace Public Profile',reason:'favorite song',createdAt:stamp,key:`favorite-song-${author}`}));
  return out;
}

function unpackRecord(record, profileKey) {
  let value=record?.value;
  if(value===undefined && typeof record?.Json==='string'){try{value=JSON.parse(record.Json)}catch(_){}}
  if(value===undefined && record?.json!==undefined)value=record.json;
  if(value && typeof value==='string'){try{value=JSON.parse(value)}catch(_){}}
  const raw=(value && typeof value==='object') ? value : {body:String(value||'')};
  return normalizeItem({...raw,recordId:record.recordId||record.RecordId||record.id,profileKey:raw.profileKey||profileKey,createdAt:raw.createdAt||record.createdAt||record.CreatedAt||record.updatedAt||record.UpdatedAt,bucket:raw.bucket||record.bucket||record.Bucket,key:raw.key||record.key||record.Key,source:raw.source||'OurSpace'});
}
function snapshotItems(snapshot, profileKey) {
  const out=[];
  const s=snapshot||{};
  (s.genericRecords||[]).forEach(r=>{
    const bucket=String(r.bucket||'').toLowerCase();
    if(/feed|post|pin|share|link|activity|social/.test(bucket)) out.push(unpackRecord(r,profileKey));
  });
  (s.publicLinks||[]).forEach((x,i)=>out.push(normalizeItem({type:'link',author:profileKey,title:x.name||x.title||x.url||'',body:x.description||'',url:x.url||x.link||'',source:'OurSpace',reason:'link',createdAt:x.updatedAt||nowISO(),key:`snapshot-link-${profileKey}-${x.id||i}`})));
  (s.publicMedia||[]).forEach((x,i)=>out.push(normalizeItem({type:x.kind==='music'?'music':'media',author:profileKey,title:x.title||'',body:x.description||'',url:x.url||'',image:x.posterUrl||(x.kind==='image'?x.url:''),source:'OurSpace',reason:x.kind||'media',createdAt:x.updatedAt||nowISO(),key:`snapshot-media-${profileKey}-${x.id||i}`})));
  (s.privateLinks||[]).forEach((x,i)=>out.push(normalizeItem({type:'link',author:profileKey,title:x.Title||x.Label||x.Url||'',body:x.Notes||'',url:x.Url||'',source:'OurSpace',reason:'saved link',createdAt:x.CreatedAt||nowISO(),key:`private-link-${profileKey}-${x.LinkId||i}`})));
  (s.music||[]).forEach((x,i)=>out.push(normalizeItem({type:'music',author:profileKey,title:x.Title||x.Url||'',body:[x.Artist,x.Notes].filter(Boolean).join(' · '),url:x.Url||'',source:'OurSpace',reason:'music',createdAt:x.CreatedAt||nowISO(),key:`music-${profileKey}-${x.MusicId||i}`})));
  return out;
}
function notificationItems(response, profileKey) {
  const out=[];
  for(const n of response?.pending||[]) {
    const kind=String(n.Kind||n.kind||'');
    if(!/share|link|music|image|video|media|post|pin/i.test(kind)) continue;
    let payload={}; try{payload=JSON.parse(n.PayloadJson||n.payloadJson||'{}')}catch(_){}
    const author=normalizeAuthor(payload.fromProfile||payload.ownerProfileKey||'');
    out.push(normalizeItem({type:kind,author,title:n.Subject||n.subject||kind,body:n.Body||n.body||'',url:payload.url||'',source:'OurSpace Notification',reason:kind,createdAt:n.CreatedAt||n.createdAt||nowISO(),key:n.NotificationId||n.notificationId,metadata:{recipient:profileKey}}));
  }
  return out;
}
function sharedFileItems(response, kind) {
  const out=[];
  for(const f of response?.files||[]) {
    out.push(normalizeItem({type:kind==='music'?'music':'share',author:f.ownerProfileKey||f.profileKey||'',title:f.name||f.fileName||'',body:f.mimeType||'',url:f.url||f.driveUrl||'',source:'OurSpace Shared',reason:kind==='music'?'shared music':'shared media',createdAt:f.createdAt||f.modifiedAt||f.updatedAt||nowISO(),key:`shared-${kind}-${f.fileId||f.id||f.name}`}));
  }
  return out;
}

async function loadPublicProfiles() {
  if(!BACKEND_URL)return {items:[],ok:0};
  const results=await Promise.allSettled(PROFILE_KEYS.map(pk=>jsonp('public.profile.get',{profileKey:pk})));
  const items=[];
  results.forEach((r,i)=>{if(r.status==='fulfilled')items.push(...publicProfileItems(PROFILE_KEYS[i],r.value))});
  return {items,ok:results.filter(r=>r.status==='fulfilled').length};
}
async function loadSignedInActivity() {
  if(!BACKEND_URL)return {items:[],profileKey:'',connected:false};
  const token=getSessionToken();
  if(!token) return {items:[],profileKey:'',connected:false};
  const items=[]; let profileKey='';
  try {
    const snap=await apiPost('sync.snapshot',{});
    profileKey=normalizeAuthor(snap?.profileKey||'');
    if(profileKey) state.sessionProfile=profileKey;
    items.push(...snapshotItems(snap?.state||snap?.snapshot||{},profileKey));
  } catch(_) {}
  try {
    const notes=await apiPost('notification.list',{});
    const pk=normalizeAuthor(notes?.profileKey||profileKey||'');
    items.push(...notificationItems(notes,pk));
  } catch(_) {}
  for(const kind of ['media','music']) {
    try { const shared=await apiPost(kind==='media'?'shared.media.list':'shared.music.list',{limit:200}); items.push(...sharedFileItems(shared,kind)); } catch(_) {}
  }
  try {
    const records=await apiPost('record.list',{bucket:'feed'});
    const pk=profileKey||state.sessionProfile;
    (records?.records||[]).forEach(r=>items.push(unpackRecord(r,pk)));
  } catch(_) {}
  return {items,profileKey,connected:true};
}
async function refreshFeed({announce=true}={}) {
  setStatus('Refreshing Feed…');
  const [pub,auth]=await Promise.all([loadPublicProfiles(),loadSignedInActivity()]);
  mergeItems(pub.items,false);
  mergeItems(auth.items,false);
  state.backendState=auth.connected?'signed-in':'public';
  state.lastRefresh=nowISO();
  if(announce) state.newCount=0;
  persistCache();
  renderAll();
  setStatus(`Feed refreshed · ${pub.ok}/2 public profiles reachable · ${auth.connected?'signed-in activity connected':'public activity only'}.`);
}
function setStatus(message) { roots.forEach(r=>{const el=$('[data-feed-connection-state]',r);if(el)el.textContent=message}); }

function filteredItems() {
  const f=state.filters, q=f.query.trim().toLowerCase();
  let items=state.items.filter(i=>{
    if(f.author!=='all' && i.author!==f.author) return false;
    if(f.type!=='all' && i.type!==f.type) return false;
    if(q && !`${i.title} ${i.body} ${i.source} ${i.reason}`.toLowerCase().includes(q)) return false;
    return true;
  });
  items.sort((a,b)=>(f.sort==='oldest'?1:-1)*(parseDate(b.createdAt)-parseDate(a.createdAt)));
  return items;
}
function mediaMarkup(item) {
  if(item.image) return `<div class="feed-card-media"><img src="${esc(item.image)}" alt="" loading="lazy"></div>`;
  const label=item.type==='news'?'NEWS':item.type.toUpperCase();
  return `<div class="feed-card-media">${esc(label)}</div>`;
}
function cardMarkup(item) {
  const author=item.author==='news'?'News':(PROFILE_NAMES[item.author]||item.author||'OurSpace');
  const reason=item.reason||item.type;
  const href=item.url?`<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Open</a>`:'';
  return `<article class="feed-card" data-feed-type="${esc(item.type)}" data-feed-id="${esc(item.id)}">
    ${mediaMarkup(item)}
    <div class="feed-card-copy">
      <div class="feed-card-head"><span class="feed-author">${esc(author)}</span><span class="feed-kind">${esc(item.type)}</span>${reason?`<span class="feed-reason">${esc(reason)}</span>`:''}<time datetime="${esc(item.createdAt)}">${esc(displayTime(item.createdAt))}</time></div>
      ${item.title?`<h3>${esc(item.title)}</h3>`:''}
      ${item.body?`<p>${esc(item.body)}</p>`:''}
      <div class="feed-card-footer">${item.source?`<span>${esc(item.source)}</span>`:''}${href}</div>
    </div>
  </article>`;
}
function renderRoot(root) {
  const list=$('[data-feed-stream]',root), more=$('[data-feed-more]',root), count=$('[data-feed-new-count]',root);
  if(!list) return;
  $$('[data-feed-filter]',root).forEach(el=>{
    const k=el.dataset.feedFilter;
    if(el.value!==state.filters[k]) el.value=state.filters[k]??'';
  });
  const all=filteredItems(), shown=all.slice(0,state.visible);
  list.innerHTML=shown.length ? shown.map(cardMarkup).join('') : `<div class="feed-empty">No posts match these filters.</div>`;
  if(more){more.hidden=shown.length>=all.length;more.textContent=shown.length<all.length?`Show Older (${all.length-shown.length})`:'Show Older'}
  if(count){count.hidden=state.newCount<1;count.textContent=state.newCount?String(state.newCount):'';count.className='feed-new-dot'}
}
function renderAll(){roots.forEach(renderRoot)}
function syncFiltersFrom(root) {
  for(const el of $$('[data-feed-filter]',root)) state.filters[el.dataset.feedFilter]=el.value;
  state.visible=PAGE_SIZE;
  persistCache();
  renderAll();
}
roots.forEach(root=>{
  $$('[data-feed-filter]',root).forEach(el=>{
    el.addEventListener('change',()=>syncFiltersFrom(root));
    if(el.dataset.feedFilter==='query') el.addEventListener('input',()=>syncFiltersFrom(root));
  });
  $('[data-feed-refresh]',root)?.addEventListener('click',()=>refreshFeed());
  $('[data-feed-load-latest]',root)?.addEventListener('click',()=>{state.newCount=0;state.visible=PAGE_SIZE;renderAll();window.scrollTo({top:root.querySelector('.feed-stream-module')?.offsetTop||0,behavior:'smooth'})});
  $('[data-feed-more]',root)?.addEventListener('click',()=>{state.visible+=PAGE_SIZE;renderAll()});
});

document.addEventListener('ourspace:news-items', e=>{
  const d=e.detail||{}, source=d.sourceLabel||d.source||'News';
  const incoming=(d.entries||[]).map((x,i)=>normalizeItem({
    type:'news',author:'news',title:x.title||'',body:x.summary||'',url:x.url||'',image:x.image||'',
    source:x.source||source,reason:source,createdAt:x.time||d.refreshedAt||nowISO(),key:`news-${d.source}-${x.url||x.title||i}`
  }));
  mergeItems(incoming,true);
});
document.addEventListener('ourspace:feed',e=>{const d=e.detail; if(Array.isArray(d))mergeItems(d,true); else if(d)mergeItems([d],true)});
for(const kind of ['post','pin','share','link','media','project','music','profile']){
  document.addEventListener(`ourspace:${kind}`,e=>{const d=e.detail||{};mergeItems([{...d,type:kind}],true)});
}

async function publish(raw={}) {
  const item=normalizeItem({...raw,source:raw.source||'OurSpace Local',createdAt:raw.createdAt||nowISO(),metadata:{...(raw.metadata||{}),local:true}});
  mergeItems([item],true);
  const token=getSessionToken();
  if(token){
    try{
      await apiPost('record.save',{bucket:'feed',key:item.id,value:{...item,metadata:{...(item.metadata||{}),local:false}}});
      item.source='OurSpace';
      item.metadata.local=false;
      mergeItems([item],false);
    }catch(err){console.warn('OurSpace Feed: backend save unavailable; item remains local.',err)}
  }
  return item;
}
window.OurSpaceFeedBridge=Object.freeze({
  publish,
  refresh:()=>refreshFeed(),
  getItems:()=>state.items.map(x=>({...x})),
  post:data=>publish({...data,type:'post'}),
  pin:data=>publish({...data,type:'pin'}),
  share:data=>publish({...data,type:'share'}),
  link:data=>publish({...data,type:'link'}),
  media:data=>publish({...data,type:'media'}),
  project:data=>publish({...data,type:'project'}),
  music:data=>publish({...data,type:'music'}),
  profile:data=>publish({...data,type:'profile'}),
  endpoint:BACKEND_URL
});

loadState();
renderAll();
refreshFeed({announce:false});
setTimeout(()=>{if(!state.items.some(i=>i.type==='news')) roots[0]?.querySelector('[data-role="news-refresh-all"]')?.click()},1200);
window.addEventListener('focus',()=>refreshFeed({announce:false}));
setInterval(()=>refreshFeed({announce:false}), 5*60*1000);
})();

}
