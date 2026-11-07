/* OurSpace two-profile activity ledger. Uses the existing authenticated backend when available.
   Keeps metadata (not private diary content or media blobs) in shared origin storage so
   William and Jasper can see each other's feed cards on the same installation. */
(()=>{'use strict';
 const KEY='ourspace.activity.shared.v1',LIMIT=180;
 const who=()=>document.documentElement.dataset.profile==='jasper'?'jasper':'william';
 const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch(_){return []}};
 const validLink=v=>{try{const u=new URL(String(v||''),location.href);return /^(http:|https:)$/.test(u.protocol)?u.href:''}catch(_){return ''}};
 const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
 const validThumb=v=>{v=String(v||'');return /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(v)&&v.length<55000?v:''};
 const normalize=item=>{
  const raw=item||{},kind=String(raw.type||'post').toLowerCase();
  return {id:String(raw.id||raw.key||((globalThis.crypto?.randomUUID?.()||Date.now())+'-'+Math.random().toString(36).slice(2))),
   key:String(raw.key||raw.id||''),type:['post','news','pin','image','video','music','media','share','link','project'].includes(kind)?kind:'post',
   author:['william','jasper'].includes(raw.author)?raw.author:who(),title:clean(raw.title).slice(0,240),body:clean(raw.body).slice(0,3000),
   url:validLink(raw.url),image:validThumb(raw.image)||validLink(raw.image),source:clean(raw.source||'OurSpace Local').slice(0,100),
   reason:clean(raw.reason||kind).slice(0,80),createdAt:!Number.isNaN(Date.parse(raw.createdAt))?raw.createdAt:new Date().toISOString(),
   metadata:{local:true,library:clean(raw.metadata?.library||'').slice(0,40),assetId:clean(raw.metadata?.assetId||'').slice(0,120)}};
 };
 let items=read().map(normalize);
 function store(){
  let compact=items.slice(0,LIMIT);
  try{localStorage.setItem(KEY,JSON.stringify(compact))}
  catch(_){compact=compact.map((x,i)=>i>=35?{...x,image:''}:x);
   try{localStorage.setItem(KEY,JSON.stringify(compact))}catch(_){compact=compact.map(x=>({...x,image:''}));try{localStorage.setItem(KEY,JSON.stringify(compact.slice(0,80)))}catch(__){}}}
 }
 function merge(arr,notify=true){const map=new Map(items.map(x=>[x.id,x]));for(const raw of arr||[]){const x=normalize(raw);map.set(x.id,{...(map.get(x.id)||{}),...x})}
  items=[...map.values()].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,LIMIT);store();
  if(notify)window.dispatchEvent(new CustomEvent('ourspace:activity-updated',{detail:{count:items.length}}));
 }
 let channel;try{channel=new BroadcastChannel('ourspace-two-person-activity');channel.onmessage=e=>{if(e.data?.type==='updated'){items=read();window.dispatchEvent(new Event('ourspace:activity-updated'))}}}catch(_){}
 async function sendRemote(entry){
  const auth=window.OurSpaceAuth;
  if(!auth?.token?.()||auth.isAdmin?.()||auth.profile?.()!==entry.author)return;
  // Exact existing record.save action; backend may reject until its feed bucket is enabled.
  try{await auth.request('record.save',{bucket:'feed',key:entry.id,value:{...entry,metadata:{...entry.metadata,local:false}}})}catch(err){console.info('OurSpace: feed entry saved locally; remote publication unavailable.',err?.message||err)}
 }
 function publish(raw,{remote=true}={}){
  const x=normalize(raw);merge([x]);try{channel?.postMessage({type:'updated'})}catch(_){}
  if(remote)void sendRemote(x);
  return x;
 }
 const list=()=>items.map(x=>({...x,metadata:{...x.metadata}}));
 window.OurSpaceActivity=Object.freeze({publish,list,refresh:()=>{items=read();window.dispatchEvent(new Event('ourspace:activity-updated'))}});
 window.addEventListener('storage',e=>{if(e.key===KEY){items=read();window.dispatchEvent(new Event('ourspace:activity-updated'))}});
})();
