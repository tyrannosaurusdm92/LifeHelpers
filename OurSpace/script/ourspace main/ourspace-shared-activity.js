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
    body:clean(i.body,600),url:link(i.url),driveFileId:clean(i.driveFileId,130),
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
async function shareCollection(collection){
 if(!ready())throw Error('Sign in to share a collection.');
 if(!collection||!['audio','visual','bulletin'].includes(collection.category))
  throw Error('Select an Audio, Visual, or Bulletin collection.');
 const id=clean(collection.id,100),name=clean(collection.name,140);
 if(!id||!name)throw Error('Collection needs a name and ID.');
 const entries=Array.isArray(collection.entries)?collection.entries:[];
 const raw={id:'collection-'+who()+'-'+collection.category+'-'+id,
  type:'collection',author:who(),title:'Shared '+collection.category+' collection: '+name,
  body:name+' is available to '+other()+' in OurSpace.',
  source:'OurSpace Shared Collections',createdAt:new Date().toISOString(),
  metadata:{sharedCollection:{category:collection.category,id,name,
   collectionType:collection.collectionType||'folder',entries}}};
 const item=normalize(raw,who());
 // Do not claim that a shared collection is available until the backend ACK.
 const confirmed=await sendRemote(item);
 if(!confirmed)throw Error('No authenticated partner delivery was confirmed.');
 merge([item]);try{channel?.postMessage({type:'updated'})}catch(_){}
 return item;
}
window.OurSpaceActivity=Object.freeze({publish,list,refresh,sharedCollections,
 shareCollection,connected:()=>lastConnected});
/* Each account owns a wishlist preference; only user-submitted item previews
 * are sent to their partner's Feed. No real-money checkout or price scraping. */
const wishlistScope='store',wishlistKey='wishlist-v1';
const wishlistUrl=v=>{try{const u=new URL(String(v||''));return /^https?:$/.test(u.protocol)?u.href:''}catch{return ''}};
const wishlistNormalize=item=>{
 const price=Math.floor(Number(item?.pricePlatinum)||0);
 if(!Number.isSafeInteger(price)||price<0||price>1000000000)
  throw Error('Enter an expected value between 0 and one billion platinum.');
 const name=clean(item?.name||item?.label,160),url=wishlistUrl(item?.url);
 if(!name||(!url&&!item?.catalogItemId))throw Error('A label and shopping link are required for custom wishlist items.');
 return{id:clean(item?.id||('wish-'+globalThis.crypto?.randomUUID?.()||Date.now()),100),
  name,url,image:wishlistUrl(item?.image),pricePlatinum:price,
  catalogItemId:clean(item?.catalogItemId,120),
  createdAt:item?.createdAt||new Date().toISOString()};
};
let wishQueue=Promise.resolve();
async function listWishlist(){
 if(!ready())throw Error('Sign in to load this account wishlist.');
 const result=await auth().request('preference.get',{profileKey:who(),
  scope:wishlistScope,key:wishlistKey},{timeout:45000});
 return(Array.isArray(result.value?.items)?result.value.items:[])
  .slice(0,300).flatMap(x=>{try{return[wishlistNormalize(x)]}catch{return[]}});
}
function wishlistChange(fn){
 const p=wishQueue.catch(()=>{}).then(async()=>{
  const old=await listWishlist(),next=fn(old);
  await auth().request('preference.set',{profileKey:who(),scope:wishlistScope,key:wishlistKey,
   value:{schema:'ourspace.wishlist.v1',profileKey:who(),items:next.items.slice(0,250)}},{timeout:45000});
  window.dispatchEvent(new Event('ourspace:wishlist-updated'));
  return next;
 });
 wishQueue=p;return p;
}
function wishlistAdd(input){
 const item=wishlistNormalize(input);
 return wishlistChange(items=>{
  const idx=items.findIndex(x=>x.id===item.id||x.url===item.url);
  if(idx>=0)item.id=items[idx].id;
  const next=[item,...items.filter(x=>x.id!==item.id)];
  return{items:next,item};
 }).then(({item:record})=>{
  publish({id:'wish-'+who()+'-'+record.id,key:'wish-'+who()+'-'+record.id,
   type:'wishlist',author:who(),title:record.name,
   body:'Added to wishlist · '+record.pricePlatinum.toLocaleString()+' platinum',
   url:record.url,image:record.image,source:'OurSpace Wishlist',
   metadata:{wishlist:{id:record.id,pricePlatinum:record.pricePlatinum}}});
  return record;
 });
}
function wishlistRemove(id){
 return wishlistChange(items=>({items:items.filter(x=>x.id!==id)}));
}
window.OurSpaceWishlist=Object.freeze({list:listWishlist,add:wishlistAdd,
 remove:wishlistRemove,available:ready});

window.addEventListener('storage',e=>{if(e.key===KEY){
 items=read().map(x=>normalize(x));window.dispatchEvent(new Event('ourspace:activity-updated'));
}});
window.addEventListener('focus',()=>{if(ready())void refresh()});
if(ready()){
 void refresh();setInterval(()=>{if(document.visibilityState!=='hidden')void refresh()},60000);
}
})();