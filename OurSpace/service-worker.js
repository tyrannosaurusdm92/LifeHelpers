/* OurSpace PWA service worker — numeric push 01..18, scoped static caching only.
 * No login/API/user-content caching. No Firebase secrets or payment gateways here.
 * The installed icon is fixed by the OS; the numeric categories are delivered in
 * notification title/icon and the running app's custom overlay. OS badge = count/dot.
 */
'use strict';
const OS_CACHE='ourspace-static-pwa-v54-landing-styles-network-first';
const OS_PRECACHE=[
 './ourspace.webmanifest',
 './assets/images/app/ourspace-app-192.png',
 './assets/images/app/ourspace-app-512.png',
 './assets/images/app/ourspace-maskable-512.png',
 './assets/images/app/ourspace-notification-badge-96.png',
 './script/app/ourspace-pwa-client.js'
];
const OS_KEYS=Object.freeze({
 '01':'call','02':'generic','03':'quick','04':'chat','05':'room','06':'pin',
 '07':'calendar','08':'onyx-writing','09':'onyx-thinking','10':'onyx-replied',
 '11':'onyx-important','12':'onyx-pet','13':'onyx-care','14':'therapy',
 '15':'purchase','16':'share','17':'voice','18':'selfcare'
});
const OS_CODES=Object.freeze(Object.fromEntries(Object.entries(OS_KEYS).map(([k,v])=>[v,k])));
const OS_PAGES=new Set(['profile','household','journal','diary','feed','communication','audio','visual','store','skills']);
function osCode(raw){
 let code=String(raw?.code||raw?.pushCode||raw?.notificationCode||'').trim();
 if(Object.prototype.hasOwnProperty.call(OS_KEYS,code))return code;
 const key=String(raw?.category||raw?.key||raw?.kind||'').toLowerCase().trim().replaceAll('_','-').replaceAll('.','-');
 if(OS_CODES[key])return OS_CODES[key];
 if(/missed|phone|call|ring/.test(key))return '01';
 if(/onyx.*repl|onyx.*answer/.test(key))return '10';
 if(/onyx.*think/.test(key))return '09';
 if(/onyx.*writ|onyx.*typ/.test(key))return '08';
 if(/onyx.*important/.test(key))return '11';
 if(/onyx.*care/.test(key))return '13';
 if(/onyx/.test(key))return '12';
 if(/quick/.test(key))return '03';
 if(/messag|chat/.test(key))return '04';
 if(/room/.test(key))return '05';
 if(/pin/.test(key))return '06';
 if(/calendar|appointment|task|schedule/.test(key))return '07';
 if(/therap|dbt/.test(key))return '14';
 if(/selfcare|self-care/.test(key))return '18';
 if(/purchase|store|receipt/.test(key))return '15';
 if(/share|media|link/.test(key))return '16';
 if(/voice/.test(key))return '17';
 return '02';
}
function osSafeText(value,max){
 return String(value??'').replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0E\uFE0F\u200D]/gu,'').replace(/[\r\n]+/g,' ').trim().slice(0,max);
}
function osWindowUrl(raw){
 const profile=['william','jasper'].includes(raw?.profileKey)?raw.profileKey:'';
 const page=OS_PAGES.has(raw?.page)?raw.page:'communication';
 // Only construct own paths; never follow an arbitrary URL from push data.
 return new URL(profile?'./assets/code/'+profile+'.html?page='+encodeURIComponent(page):'./ourspace.html',self.registration.scope).href;
}
function osStaticPath(request){
 if(request.method!=='GET'||request.mode==='navigate'||request.cache==='no-store')return false;
 const url=new URL(request.url),scope=new URL(self.registration.scope);
 if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||url.search)return false;
 const rel=decodeURIComponent(url.pathname.slice(scope.pathname.length));
 return rel==='ourspace.webmanifest' ||
   /^assets\/images\/app\/[a-z0-9_-]+\.(?:png|ico|icns)$/i.test(rel) ||
   /^(?:script\/[^/]+\/[^/]+\.(?:js|wasm)|style\/[^/]+\/[^/]+\.css|json\/[^/]+\/[^/]+\.json)$/i.test(rel);
}
async function osBadge(value){
 if(!('setAppBadge' in self.navigator))return;
 try{
  if(value===undefined||value===null){await self.navigator.setAppBadge();return;}
  const count=Math.max(0,Math.min(9999,Math.trunc(Number(value)||0)));
  if(count)await self.navigator.setAppBadge(count);
  else if('clearAppBadge' in self.navigator)await self.navigator.clearAppBadge();
 }catch(_unsupported){}
}
async function osBroadcast(message){
 const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 for(const client of windows)client.postMessage(message);
}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(OS_CACHE);
 // Only these files are shipped here. Failure of one file must not prevent the app updating.
 await Promise.allSettled(OS_PRECACHE.map(asset=>cache.add(new Request(new URL(asset,self.registration.scope).href,{cache:'reload'}))));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(name=>name!==OS_CACHE&&(name.startsWith('ourspace-shell-')||name.startsWith('ourspace-myspace-shell-')||name.startsWith('ourspace-static-pwa-'))).map(name=>caches.delete(name)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request;if(!osStaticPath(request))return;
 event.respondWith((async()=>{
  const cache=await caches.open(OS_CACHE);
  // CSS is network-first so newly published styles cannot be masked by stale PWA data.
  if(request.destination==='style'||/\\.css$/i.test(new URL(request.url).pathname)){
   try{
    const network=await fetch(new Request(request,{cache:'no-cache'}));
    if(network.ok&&network.type==='basic'&&!/no-store|private/i.test(network.headers.get('Cache-Control')||''))await cache.put(request,network.clone());
    return network;
   }catch(error){
    const saved=await cache.match(request);
    if(saved)return saved;
    throw error;
   }
  }
  const stored=await cache.match(request);
  if(stored)return stored;
  const network=await fetch(request);
  if(network.ok&&network.type==='basic'&&!/no-store|private/i.test(network.headers.get('Cache-Control')||''))await cache.put(request,network.clone());
  return network;
 })());
});
self.addEventListener('push',event=>event.waitUntil((async()=>{
 let raw={};
 try{raw=event.data?.json()||{};}catch(_){raw={body:event.data?.text()||''};}
 const p=raw.push&&typeof raw.push==='object'?raw.push:raw;
 const data={...(p.data&&typeof p.data==='object'?p.data:{}),...(raw.data&&typeof raw.data==='object'?raw.data:{})};
 const combined={...raw,...p,...data},code=osCode(combined),title='OurSpace '+code;
 const body=osSafeText(combined.body||combined.message||'Open OurSpace to view your update.',300);
 const url=osWindowUrl(combined),tag='ourspace-'+code+'-'+osSafeText(combined.notificationId||combined.id||'alert',45);
 const number=combined.badgeCount??combined.unreadCount??combined.unreadTotal;
 const hasCount=number!==null&&number!==undefined&&Number.isFinite(Number(number));
 const count=hasCount?Math.max(0,Math.trunc(Number(number))):null;
 const options={body,tag,renotify:false,icon:new URL('./assets/images/app/ourspace-code-'+code+'-192.png',self.registration.scope).href,
  badge:new URL('./assets/images/app/ourspace-notification-badge-96.png',self.registration.scope).href,
  data:{url,code,notificationId:String(combined.notificationId||'').slice(0,120)}};
 // If no authoritative count was sent, use an OS dot (not fake a number).
 await osBadge(count);
 await self.registration.showNotification(title,options);
 await osBroadcast({type:'ourspace:notification-changed',code,badgeCount:count,category:OS_KEYS[code]});
})()));
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const dest=new URL(event.notification?.data?.url||'./ourspace.html',self.registration.scope);
  if(dest.origin!==self.location.origin||!dest.href.startsWith(self.registration.scope))return;
  const open=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  const existing=open.find(client=>client.url.startsWith(self.registration.scope));
  if(existing){
   if('navigate' in existing&&new URL(existing.url).pathname!==dest.pathname)try{await existing.navigate(dest.href);}catch(_){ }
   await existing.focus();existing.postMessage({type:'ourspace:open-notification',url:dest.href,code:event.notification?.data?.code||null});
  }else await self.clients.openWindow(dest.href);
 })());
});
self.addEventListener('pushsubscriptionchange',event=>event.waitUntil(osBroadcast({type:'ourspace:push-subscription-expired'})));
self.addEventListener('message',event=>{
 if(!event.data||typeof event.data!=='object')return;
 if(event.data.type==='ourspace:badge-sync')event.waitUntil(osBadge(event.data.badgeCount));
 if(event.data.type==='ourspace:badge-clear')event.waitUntil(osBadge(0));
 if(event.data.type==='ourspace:skip-waiting')event.waitUntil(self.skipWaiting());
});
