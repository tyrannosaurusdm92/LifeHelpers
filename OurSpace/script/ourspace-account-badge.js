/* OurSpace account badge: backend authoritative count + platform-supported PWA badge.
   Browsers provide numeric OS badges, not arbitrary emoji overlays; the tab icon
   and in-app announcement can show the requested ‼️[#] faithfully. */
(()=>{'use strict';
 if(new URLSearchParams(location.search).get('public')==='1')return;
 const auth=window.OurSpaceAuth;const canonical=document.querySelector('link[rel="icon"]');
 const baseIcon=canonical?.getAttribute('href')||'../images/icon-192.png';
 const status={count:0,lastFetch:0,connected:false};let currentPage=document.documentElement.dataset.ourspaceCurrentPage||'profile';
 const allow=()=>Boolean(auth?.isAuthenticated?.()&&!auth?.isAdmin?.());
 const safeCount=n=>Math.max(0,Math.min(9999,Number.isFinite(+n)?Math.floor(+n):0));
 function markTab(n){
   document.title=document.title.replace(/^‼️\[\d+\] /,'');
   if(!n){if(canonical)canonical.href=baseIcon;return}
   document.title=`‼️[${n}] `+document.title;
   if(!canonical)return;
   try{
     const c=document.createElement('canvas');c.width=96;c.height=96;const x=c.getContext('2d');
     const icon=new Image();icon.onload=()=>{
       x.clearRect(0,0,96,96);x.drawImage(icon,0,0,96,96);
       x.fillStyle='#ae1826';x.beginPath();x.roundRect(28,58,66,37,9);x.fill();
       x.strokeStyle='#fff';x.lineWidth=2;x.stroke();x.fillStyle='#fff';
       x.textAlign='center';x.textBaseline='middle';x.font='900 18px system-ui';
       x.fillText('‼️'+(n>99?'99+':n),61,76,62);
       canonical.href=c.toDataURL('image/png');
     };icon.src=baseIcon;
   }catch(_){}
 }
 async function update(n){n=safeCount(n);status.count=n;status.lastFetch=Date.now();
   markTab(n);
   try{if(n>0)await navigator.setAppBadge?.(n);else await navigator.clearAppBadge?.()}catch(_){}
   window.dispatchEvent(new CustomEvent('ourspace:badge-change',{detail:{count:n,label:n?'‼️['+n+']':''}}));
 }
 async function refresh(){if(!allow())return;try{
   const r=await auth.request('pwa.badge.state',{});if(r?.ok===false)return;
   status.connected=true;await update(r.badgeCount??0);
 }catch(_){status.connected=false;}}
 function onChange(){if(allow())refresh();else update(0)}
 window.addEventListener('ourspace:auth',onChange);window.addEventListener('ourspace:signed-out',onChange);
 window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 window.addEventListener('ourspace:notification-changed',refresh);
 navigator.serviceWorker?.addEventListener?.('message',event=>{if(event.data?.type==='ourspace:notification-changed')refresh();});
 // Rate-limited polling is a fallback for hosts without web-push subscriptions.
 setInterval(()=>{if(!document.hidden)refresh()},60000);
 if(allow())refresh();
 window.OurSpaceAccountBadge={refresh,getState:()=>({...status,page:currentPage})};
})();
