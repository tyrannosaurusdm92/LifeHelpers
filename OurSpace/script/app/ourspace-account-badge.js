/* OurSpace account notification overlay: category codes 01–18 in the running
 * web app/tab; platform launcher badges always show total unread number/dot.
 * Existing in-app Messenger emojis are unchanged; numeric push categories remain in the shared catalog.
 */
(()=>{'use strict';
if(new URLSearchParams(location.search).get('public')==='1')return;
const thisScript=document.currentScript?.src||new URL('script/app/ourspace-account-badge.js',document.baseURI).href;
const root=new URL('../../',thisScript),auth=()=>window.OurSpaceAuth;
const iconHref=code=>new URL('assets/images/app/'+(code?'ourspace-code-'+code+'-192.png':'ourspace-app-192.png'),root).href;
const allowed=()=>!!auth()?.isAuthenticated?.()&&!auth()?.isAdmin?.();
let counts={},codes=[],cursor=0,last='',status={count:0,lastFetch:0,connected:false,rotatingCodes:[]};
let timer=0,canonical=null,oldTitle='';
function iconTag(){if(!canonical){canonical=document.querySelector('link[rel="icon"]');if(!canonical){canonical=document.createElement('link');canonical.rel='icon';document.head.appendChild(canonical);}}return canonical;}
function setCode(code){
 if(code===last)return;last=code;
 // Replace only favicon, never the OurSpace logo inside the page.
 iconTag().href=iconHref(code);
 const overlay=document.querySelector('[data-ourspace-push-code],#ourspace-notification-code');
 if(overlay){overlay.textContent=code||'';overlay.hidden=!code;overlay.setAttribute('aria-label',code?'Pending OurSpace category '+code:'No pending notification categories');}
 window.dispatchEvent(new CustomEvent('ourspace:notification-code',{detail:{code,unreadByCode:{...counts}}}));
}
function rotate(){if(!codes.length){setCode('');return;}setCode(codes[cursor%codes.length]);cursor=(cursor+1)%codes.length;}
function sync(state){
 const n=Math.max(0,Math.floor(Number(state.badgeCount)||0));
 status={count:n,lastFetch:Date.now(),connected:true,rotatingCodes:Array.isArray(state.rotatingCodes)?state.rotatingCodes:[]};
 counts=state.unreadByCode&&typeof state.unreadByCode==='object'?state.unreadByCode:{};
 const next=(state.rotatingCodes||[]).map(String).filter(c=>/^(0[1-9]|1[0-8])$/.test(c));
 if(next.join(',')!==codes.join(',')){codes=next;cursor=0;last='';}
 rotate();
 try{if(n)navigator.setAppBadge?.(n);else navigator.clearAppBadge?.();}catch(_){ }
 window.dispatchEvent(new CustomEvent('ourspace:badge-change',{detail:{count:n,rotatingCodes:codes.slice()}}));
}
async function refresh(){
 if(!allowed()){sync({badgeCount:0,rotatingCodes:[],unreadByCode:{}});return status;}
 try{const result=await auth().request('pwa.badge.state',{});if(result?.ok!==false)sync(result);}catch(_){status.connected=false;}
 return status;
}
window.addEventListener('ourspace:push-state',event=>sync(event.detail||{}));
window.addEventListener('ourspace:auth',refresh);
window.addEventListener('ourspace:signed-out',refresh);
window.addEventListener('focus',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='ourspace:notification-changed')refresh();});
timer=setInterval(()=>{if(!document.hidden)rotate();},5000);
setInterval(()=>{if(!document.hidden)refresh();},60000);
if(allowed())refresh();
window.OurSpaceAccountBadge={refresh,getState:()=>({...status,unreadByCode:{...counts},currentCode:last})};
})();
