/* OurSpace PWA install + no-cost Web Push client.
 * Explicit opt-in, existing OurSpaceAuth identity, no SMS/PSTN or secrets.
 * Include as an ordinary script on each logged-in page (no HTML altered here).
 */
(()=>{'use strict';
const originalScript=document.currentScript?.src||new URL('script/app/ourspace-pwa-client.js',document.baseURI).href;
const appRoot=new URL('../../',originalScript);
const asset=name=>new URL(name,appRoot).href;
const URLS=Object.freeze({worker:asset('service-worker.js'),manifest:asset('ourspace.webmanifest'),config:asset('ourspace-pwa-config.json')});
const validCodes=Array.from({length:18},(_,i)=>String(i+1).padStart(2,'0'));
let worker=null,promptEvent=null,configPromise=null,firebaseApp=null,firebaseMessaging=null,firebaseSdk=null;
const subscribers=new Set();
const auth=()=>window.OurSpaceAuth;
function assertUser(){if(!auth()?.isAuthenticated?.()||auth()?.isAdmin?.())throw new Error('Sign in to your OurSpace account before enabling push notifications.');}
async function send(action,data={}){assertUser();if(typeof auth().request!=='function')throw new Error('OurSpaceAuth.request is unavailable.');return auth().request(action,data);}
function emit(name,detail){window.dispatchEvent(new CustomEvent('ourspace:'+name,{detail}));for(const cb of subscribers)try{cb(name,detail);}catch(_){}}
function setTag(rel,href){let node=document.querySelector('link[rel="'+rel+'"]');if(!node){node=document.createElement('link');node.rel=rel;document.head.appendChild(node);}node.href=href;}
function injectInstallMetadata(){
 // Adds install metadata only; does not modify the on-page OurSpace logo.
 setTag('manifest',URLS.manifest);
 setTag('apple-touch-icon',asset('assets/images/app/apple-touch-icon.png'));
 const tile=document.querySelector('meta[name="msapplication-TileImage"]')||document.createElement('meta');
 tile.name='msapplication-TileImage';tile.content=asset('assets/images/app/windows-150.png');if(!tile.parentNode)document.head.appendChild(tile);
 const webApp=document.querySelector('meta[name="apple-mobile-web-app-capable"]')||document.createElement('meta');
 webApp.name='apple-mobile-web-app-capable';webApp.content='yes';if(!webApp.parentNode)document.head.appendChild(webApp);
}
async function config(){
 if(!configPromise)configPromise=(async()=>{
  let doc={};try{const res=await fetch(URLS.config,{cache:'no-store'});if(res.ok)doc=await res.json();}catch(_){ }
  const inline=window.OurSpacePWAConfig||window.OURSPACE_PWA_CONFIG||{};
  return {...doc,...inline};
 })();return configPromise;
}
async function register(){
 if(!('serviceWorker' in navigator))throw new Error('This browser does not support service workers.');
 if(!window.isSecureContext)throw new Error('Install OurSpace from HTTPS, such as GitHub Pages.');
 if(!worker)worker=navigator.serviceWorker.register(URLS.worker,{scope:appRoot.pathname,updateViaCache:'none'});
 return worker;
}
function bytes(b64){const raw=atob(b64.replace(/-/g,'+').replace(/_/g,'/'));const a=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i);return a;}
async function firebase(){
 if(firebaseSdk)return firebaseSdk;
 const cfg=await config(),f=cfg.firebaseConfig;
 if(!f?.apiKey||!f?.projectId||!f?.appId||!f?.messagingSenderId)return null;
 const version=/^\d+\.\d+\.\d+$/.test(String(cfg.firebaseSdkVersion||''))?cfg.firebaseSdkVersion:'11.10.0';
 const [app,messaging]=await Promise.all([import('https://www.gstatic.com/firebasejs/'+version+'/firebase-app.js'),import('https://www.gstatic.com/firebasejs/'+version+'/firebase-messaging.js')]);
 if(!(await messaging.isSupported()))throw new Error('Firebase messaging is not available on this browser.');
 firebaseApp=app.getApps().length?app.getApp():app.initializeApp(f);
 firebaseMessaging=messaging.getMessaging(firebaseApp);
 // Foreground messages must update state, while the SW handles background notification display.
 messaging.onMessage(firebaseMessaging,payload=>{
  const d=payload?.data||{},code=/^(0[1-9]|1[0-8])$/.test(String(d.code||''))?String(d.code):'02';
  emit('notification-changed',{code,source:'fcm-foreground'});
 });
 firebaseSdk=messaging;return messaging;
}
function currentProfile(){return auth()?.profile?.()||'';}
function keyFor(sub){return 'ourspace.pwa.subscriptionId.'+currentProfile()+'.'+(sub?.endpoint?'web':'fcm');}
function storageGet(k){try{return localStorage.getItem(k)||'';}catch(_){return '';}}
function storagePut(k,v){try{if(v)localStorage.setItem(k,v);else localStorage.removeItem(k);}catch(_){}}
async function subscribe(){
 assertUser();
 if(!('Notification' in window))throw new Error('This browser does not support notifications.');
 // Must be invoked from a click/tap initiated by the user, not page load.
 const permission=await Notification.requestPermission();
 if(permission!=='granted')throw new Error('Notification permission was not granted.');
 const registration=await register(),cfg=await config();
 let push=null,method='web_push';
 if(cfg.firebaseConfig?.projectId&&cfg.vapidPublicKey){
  const sdk=await firebase();
  const token=await sdk.getToken(firebaseMessaging,{vapidKey:cfg.vapidPublicKey,serviceWorkerRegistration:registration});
  if(!token)throw new Error('Firebase did not return a device token.');
  push={fcmToken:token};method='fcm';
 }else if(cfg.vapidPublicKey){
  if(!registration.pushManager)throw new Error('PushManager is unavailable on this device.');
  const existing=await registration.pushManager.getSubscription();
  const sub=existing||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(cfg.vapidPublicKey)});
  push=sub.toJSON();
 }else throw new Error('The public VAPID key is not configured. No subscription was created.');
 const result=await send('pwa.push.subscribe',{push,channel:'web_push'});
 const subscriptionId=result?.subscriptionId||result?.subscription?.SubscriptionId||result?.subscription?.subscriptionId||'';
 if(subscriptionId)storagePut(keyFor(push),subscriptionId);
 emit('push-subscribed',{method,profileKey:currentProfile(),subscriptionId:subscriptionId||''});
 return {ok:true,method,profileKey:currentProfile(),backend:result};
}
async function unsubscribe(){
 assertUser();const registration=await register(),cfg=await config();
 const browserSub=await registration.pushManager?.getSubscription?.(),fcmReady=!!cfg.firebaseConfig?.projectId;
 let fcmToken='';if(fcmReady&&cfg.vapidPublicKey){try{const sdk=await firebase();fcmToken=await sdk.getToken(firebaseMessaging,{vapidKey:cfg.vapidPublicKey,serviceWorkerRegistration:registration})||'';}catch(_){}}
 const push=browserSub?.toJSON?.()||{};if(fcmToken)push.fcmToken=fcmToken;
 const id=storageGet(keyFor(fcmToken?{fcmToken}:push));
 if(!id)throw new Error('No exact saved subscription ID is available for this device. Other devices will remain subscribed.');
 // Revoke server-side subscription first, so other devices remain untouched.
 const result=await send('pwa.push.unsubscribe',{subscriptionId:id||undefined,endpoint:push.endpoint||undefined,push});
 if(fcmToken&&firebaseSdk?.deleteToken)try{await firebaseSdk.deleteToken(firebaseMessaging);}catch(_){ }
 if(browserSub)try{await browserSub.unsubscribe();}catch(_){ }
 storagePut(keyFor(fcmToken?{fcmToken}:push),'');
 emit('push-unsubscribed',{profileKey:currentProfile()});
 return result;
}
async function refreshBadge(){
 const current=auth();if(!current?.isAuthenticated?.()||current?.isAdmin?.())return {ok:false,reason:'not-signed-in'};
 const state=await send('pwa.badge.state',{}),count=Math.max(0,Math.trunc(Number(state.badgeCount)||0));
 try{if(count)await navigator.setAppBadge?.(count);else await navigator.clearAppBadge?.();}catch(_){ }
 const codes=Array.isArray(state.rotatingCodes)?state.rotatingCodes.filter(c=>validCodes.includes(String(c))):[];
 emit('push-state',{...state,badgeCount:count,rotatingCodes:codes});
 return state;
}
async function setPreference(channel,mode,codes){
 const approved=Array.isArray(codes)?codes.map(String).filter(c=>validCodes.includes(c)):undefined;
 return send('settings.alerts.save',{[channel]:{mode,...(approved?{codes:approved}:{})}});
}
async function getSettings(){return send('settings.alerts.get',{});}
async function requestEmailCode(email){return send('settings.alerts.email.request',{email});}
async function verifyEmailCode(email,code,challengeId){return send('settings.alerts.email.verify',{email,code,challengeId});}
async function getCatalog(){return send('pwa.push.catalog',{});}
async function diagnostic(){
 const c=await config();let sub=false,workerActive=false;
 try{const r=await register();workerActive=!!r.active;sub=!!(await r.pushManager?.getSubscription?.());}catch(_){ }
 return {ok:true,secureContext:window.isSecureContext,serviceWorker:workerActive,
  installed:matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,
  notificationPermission:('Notification' in window)?Notification.permission:'unavailable',
  subscribedInBrowser:sub,fcmConfiguredInClient:!!c.firebaseConfig?.projectId,
  vapidPublicKeyConfigured:!!c.vapidPublicKey,
  note:'Real push also requires backend Firebase/service account or web-push gateway configuration.'};
}
function listen(cb){subscribers.add(cb);return()=>subscribers.delete(cb);}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;emit('install-available',{});});
window.addEventListener('appinstalled',()=>{promptEvent=null;emit('installed',{});});
async function promptInstall(){if(!promptEvent)return {available:false,reason:'Use the browser Add to Home Screen / Install App menu.'};const event=promptEvent;promptEvent=null;await event.prompt();return event.userChoice;}
navigator.serviceWorker?.addEventListener('message',event=>{
 const msg=event.data||{};
 if(msg.type==='ourspace:notification-changed'){
  emit('notification-changed',msg);
  if(auth()?.isAuthenticated?.()&&!document.hidden)refreshBadge().catch(()=>{});
 }
 if(msg.type==='ourspace:push-subscription-expired')emit('push-subscription-expired',{});
 if(msg.type==='ourspace:open-notification')emit('open-notification',msg);
});
window.OurSpacePWA=Object.freeze({register,subscribe,unsubscribe,refreshBadge,getSettings,setPreference,requestEmailCode,verifyEmailCode,getCatalog,diagnostic,listen,promptInstall,config,urls:URLS});
function boot(){injectInstallMetadata();register().catch(()=>{});if(auth()?.isAuthenticated?.()&&!auth()?.isAdmin?.())refreshBadge().catch(()=>{});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('focus',()=>{if(auth()?.isAuthenticated?.()&&!auth()?.isAdmin?.())refreshBadge().catch(()=>{});});
})();
