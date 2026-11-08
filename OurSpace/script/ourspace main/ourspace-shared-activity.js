/* OurSpace account-to-account Feed.
 * 3.4.6 generic records are PRIVATE to the owner. Activity therefore travels
 * through the existing authenticated William/Jasper message channel.
 * Never transfer diary, therapy, unpublished profile media bytes, or tokens. */
(()=>{'use strict';
const KEY='ourspace.activity.shared.v1',CHANNEL='ourspace-activity-feed',LIMIT=400;
const who=()=>document.documentElement.dataset.profile==='jasper'?'jasper':'william';
const other=()=>who()==='william'?'jasper':'william';
const auth=()=>window.OurSpaceAuth;
const ready=()=>auth()?.isAuthenticated?.()&&!auth()?.isAdmin?.()&&auth()?.profile?.()===who()&&
 new URLSearchParams(location.search).get('public')!=='1';
const read=()=>{try{const arr=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(arr)?arr:[]}catch(_){return []}};
const clean=(v,n=240)=>String(v??'').replace(/\s+/g,' ').trim().slice(0,n);
const link=v=>{try{const u=new URL(String(v||''));return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}};
const validTypes=new Set(['post','news','pin','image','video','music','media','share','link','project','profile','game','wishlist','collection']);
function normalize(input,authorOverride){
 const x=input||{},type=clean(x.type||'post',24).toLowerCase(),author=authorOverride||x.author;
 const rawMeta=x.metadata&&typeof x.metadata==='object'?x.metadata:{};
 const safeMeta={local:false,library:clean(rawMeta.library,40),assetId:clean(rawMeta.assetId,120)};
 // Share metadata is explicit and bounded; do not transmit arbitrary app state.
 if(type==='collection'&&rawMeta.sharedCollection){
  const c=rawMeta.sharedCollection;
  const category=['audio','visual','bulletin'].includes(c.category)?c.category:'';
  if(category)safeMeta.sharedCollection={
   category,id:clean(c.id,100),name:clean(c.name,140),
   collectionType:clean(c.collectionType,40),
   entries:(Array.isArray(c.entries)?c.entries:[]).slice(0,70).map(i=>({
    id:clean(i.id,100),title:clean(i.title,160),kind:clean(i.kind,24),
    url:link(i.url),driveFileId:clean(i.driveFileId,130),
    folderId:clean(i.folderId,100)
   }))
  };
 }
 if(type==='wishlist'){
  const p=rawMeta.wishlist||{};
  safeMeta.wishlist={id:clean(p.id,100),pricePlatinum:Number.isSafeInteger(p.pricePlatinum)&&p.pricePlatinum>=0?p.pricePlatinum:0};
 }
 const id=clean(x.id||x.key||((globalThis.crypto?.randomUUID?.()||Date.now())+'-'+Math.random().toString(36).slice(2)),180);
 return{id,key:clean(x.key||id,180),type:validTypes.has(type)?type:'post',
  author:['william','jasper'].includes(author)?author:who(),
  title:clean(x.title,240),body:clean(x.body,2500),url:link(x.url),
  image:link(x.image),source:clean(x.source||'OurSpace',100),
  reason:clean(x.reason||type,80),
  createdAt:!Number.isNaN(Date.parse(x.createdAt))?x.createdAt:new Date().toISOString(),
  metadata:safeMeta};
}
let items=read().map(x=>normalize(x));
function persist(){try{localStorage.setItem(KEY,JSON.stringify(items.slice(0,LIMIT)))}catch(_){}}
function merge(values,announce=true){
 const map=new Map(items.map(x=>[x.id,x]));
 for(const v of values||[]){
  if(!v||typeof v!=='object'||!['william','jasper'].includes(v.author))continue;
  const x=normalize(v,v.author);map.set(x.id,x);
 }
 items=[...map.values()].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,LIMIT);
 persist();
 if(announce)window.dispatchEvent(new CustomEvent('ourspace:activity-updated',{detail:{count:items.length}}));
}
let channel;
try{channel=new BroadcastChannel('ourspace-two-person-activity');channel.onmessage=e=>{
 if(e.data?.type==='updated'){items=read().map(x=>normalize(x));window.dispatchEvent(new Event('ourspace:activity-updated'))}
}}catch(_){}
async function sendRemote(entry){
 if(!ready()||entry.author!==who())return false;
 const data={activity:{...entry,metadata:{...entry.metadata,local:false}},clientMessageId:entry.id};
 const result=await auth().request('message.send',{
  channelId:CHANNEL,fromProfile:who(),toProfile:other(),kind:'activity',
  text:entry.title||'New '+entry.type+' on OurSpace',...data},{timeout:45000});
 if(!result?.messageId)throw Error('Account did not confirm sharing this Feed update.');
 return true;
}
function publish(raw,{remote=true}={}){
 const x=normalize(raw,who());
 merge([x]);try{channel?.postMessage({type:'updated'})}catch(_){}
 if(remote&&ready())void sendRemote(x).catch(err=>console.warn('Feed item retained locally; partner delivery unconfirmed:',err.message));
 return x;
}
let pollBusy=false,lastConnected=false;
async function refresh(){
 if(!ready())return{items:list(),connected:false};
 if(pollBusy)return{items:list(),connected:lastConnected};
 pollBusy=true;
 try{
  const reply=await auth().request('message.list',{channelId:CHANNEL,limit:500},{timeout:45000});
  if(!Array.isArray(reply?.messages))throw Error('The account feed did not return messages.');
  const incoming=[];
  for(const msg of reply.messages){
   if(msg.channelId!==CHANNEL||msg.kind!=='activity'||!['william','jasper'].includes(msg.fromProfile))continue;
   const raw=msg.data?.activity;
   if(!raw||raw.author!==msg.fromProfile)continue;
   incoming.push(normalize(raw,msg.fromProfile));
  }
  merge(incoming);lastConnected=true;
  return{items:list(),connected:true};
 }catch(err){
  lastConnected=false;console.warn('Partner Feed unavailable; local items preserved:',err.message);
  return{items:list(),connected:false};
 }finally{pollBusy=false}
}
const list=()=>items.map(x=>({...x,metadata:{...x.metadata}}));
const sharedCollections=()=>list().filter(x=>x.type==='collection'&&x.metadata.sharedCollection);
window.OurSpaceActivity=Object.freeze({publish,list,refresh,sharedCollections,
 connected:()=>lastConnected});
window.addEventListener('storage',e=>{if(e.key===KEY){
 items=read().map(x=>normalize(x));window.dispatchEvent(new Event('ourspace:activity-updated'));
}});
window.addEventListener('focus',()=>{if(ready())void refresh()});
if(ready()){
 void refresh();setInterval(()=>{if(document.visibilityState!=='hidden')void refresh()},60000);
}
})();