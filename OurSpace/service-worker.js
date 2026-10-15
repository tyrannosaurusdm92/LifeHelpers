/* OurSpace installed-app alerts. One root service worker, no duplicate registrations.
 * Backend API and deployment are unchanged. Foreground updates use notification.list.
 * Background pushes require the existing backend web-push gateway to be configured. */
'use strict';
const ROOT = new URL('./',self.location.href);
const ICON = new URL('assets/images/ourspace-icon-192.png', ROOT).href;
const DB = 'ourspace-device-alert-settings-v1', STORE='settings';
self.addEventListener('install', event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event=>event.waitUntil(self.clients.claim()));
function dbOpen(){return new Promise((ok,bad)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'profileKey'})};r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error)});}
async function settings(profileKey,value){if(!['william','jasper','__active__'].includes(profileKey) || (value && profileKey==='__active__'))return null;const db=await dbOpen();try{
 if(value){const row={profileKey,systemNotifications:value.systemNotifications===true,appBadge:value.appBadge!==false,sound:value.sound===true,kinds:value.kinds||{},categories:value.categories||{},updatedAt:new Date().toISOString()};await new Promise((ok,bad)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(row);tx.objectStore(STORE).put({profileKey:'__active__',activeProfileKey:profileKey});tx.oncomplete=ok;tx.onerror=()=>bad(tx.error)});return row;}
 return await new Promise((ok,bad)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(profileKey);r.onsuccess=()=>ok(r.result||null);r.onerror=()=>bad(r.error)});
}finally{db.close();}}
function jsonPayload(event){if(!event.data)return {};try{return event.data.json()||{}}catch(_){try{return {body:event.data.text()}}catch(_){return {}}}}
function category(kind){kind=String(kind||'').toLowerCase();if(/come[._-]?back/.test(kind))return 'return';if(/therapy/.test(kind))return 'therapy';if(/^onyx/.test(kind))return /selfcare|self.care|care/.test(kind)?'selfcare':'return';if(/call/.test(kind))return 'calls';if(/voice/.test(kind))return 'voice';if(/message|messenger|text/.test(kind))return 'texts';if(/calendar|appointment|organizer|event/.test(kind))return 'calendar';if(/task/.test(kind))return 'tasks';if(/receipt|purchase|store/.test(kind))return 'purchase';if(/visit/.test(kind))return 'visitor';if(/selfcare|self.care/.test(kind))return 'selfcare';return 'other';}
function targetFor(profileKey,kind){const page=({calls:'communication',texts:'communication',voice:'communication',calendar:'household',tasks:'household',purchase:'store',visitor:'retrobuilder',therapy:'skills',selfcare:'skills',return:'retrobuilder'})[category(kind)]||'retrobuilder';return new URL(`assets/code/${profileKey}.html#${page}`,ROOT).href;}
self.addEventListener('message',event=>{const data=event.data;if(data?.type==='OURSPACE_DEVICE_ALERT_SETTINGS')event.waitUntil(settings(String(data.profileKey||'').toLowerCase(),data.settings||{}).catch(()=>{})); if(data?.type==='OURSPACE_DEVICE_ALERT_SIGNOUT')event.waitUntil((async()=>{const db=await dbOpen();await new Promise((ok,bad)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete('__active__');tx.oncomplete=ok;tx.onerror=bad});db.close();try{await self.navigator?.clearAppBadge?.()}catch(_){}})());});
self.addEventListener('push',event=>event.waitUntil((async()=>{
 const raw=jsonPayload(event),n=raw.notification&&typeof raw.notification==='object'?raw.notification:raw;
 const profileKey=String(n.profileKey||raw.profileKey||n.data?.profileKey||raw.data?.profileKey||'').toLowerCase();
 // Never assume the current account or expose an unknown recipient's information.
 if(!['william','jasper'].includes(profileKey))return;
 const [prefs,active]=await Promise.all([settings(profileKey).catch(()=>null), settings('__active__').catch(()=>null)]);
 if(!prefs || !prefs.systemNotifications || active?.activeProfileKey!==profileKey)return;
 const kind=String(n.kind||raw.kind||'system'),cat=category(kind);
 if(prefs.categories?.[cat]===false || (/^onyx/.test(kind)&&prefs.kinds?.onyx===false))return;
 const buyer=String(n.purchaserProfile||n.data?.purchaserProfile||raw.data?.purchaserProfile||'').toLowerCase();
 const purchaseTitle=cat==='purchase' && ['william','jasper'].includes(buyer)?`New purchase from ${buyer==='william'?'William':'Jasper'}`:'';
 const title=String(purchaseTitle||n.title||n.subject||({calls:'Incoming call',texts:'Incoming text',calendar:'Calendar event',tasks:'Task reminder',voice:'Incoming voice message',purchase:'New purchase',visitor:'Profile visitor',therapy:'Onyx therapy session',selfcare:'Onyx self-care reminder',return:'Onyx check-in'})[cat]||'OurSpace').slice(0,120);
 const body=String(n.body||n.message||'You have a new OurSpace notification.').slice(0,400);
 const tag=String(n.tag||n.id||n.notificationId||`ourspace-${kind}-${Date.now()}`);
 const url=targetFor(profileKey,kind);
 await self.registration.showNotification(title,{body,tag,renotify:false,icon:ICON,badge:ICON,silent:!prefs.sound,
  data:{url,kind,profileKey,notificationId:n.id||n.notificationId||''}});
 if(prefs.appBadge!==false){try{if(self.navigator?.setAppBadge)await self.navigator.setAppBadge(Math.max(1,Number(n.badgeCount||raw.badgeCount||1)||1))}catch(_){}}
 const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
 for(const client of clients)if(new URL(client.url).origin===self.location.origin)client.postMessage({type:'OURSPACE_PUSH_RECEIVED',payload:{title,body,kind,profileKey}});
})()));
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 event.waitUntil((async()=>{
  const data=event.notification.data||{},key=String(data.profileKey||'').toLowerCase();
  if(!['william','jasper'].includes(key))return;
  const target=targetFor(key,data.kind||'system');
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const client of clients){try{
   const u=new URL(client.url);
   // Open the correct profile, never steal a different user's current tab.
   if(u.origin===self.location.origin && u.pathname.endsWith(`/assets/code/${key}.html`)){
    await client.focus();client.postMessage({type:'OURSPACE_NOTIFICATION_OPEN',url:target,kind:data.kind,profileKey:key,notificationId:data.notificationId||''});return;
   }
  }catch(_){}}
  if(self.clients.openWindow)await self.clients.openWindow(target);
 })());
});
