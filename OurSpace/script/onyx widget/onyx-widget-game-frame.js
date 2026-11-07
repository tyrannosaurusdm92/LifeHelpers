/* The floating Onyx widget owns the fullscreen Virtual & Health iframe.
 * No game scene, game HUD, or game runtime is mounted in this document. */
(()=>{
 'use strict';
 const host=document.getElementById('slowPetGame');
 const frame=document.getElementById('onyxHealthGameFrame');
 if(!host||!frame)return;
 const tag='catastrophic-health-iframe';
 const sameOrigin=e=>e.source===frame.contentWindow && (e.origin===location.origin || location.protocol==='file:');
 const active=()=>document.documentElement.dataset.runtimeMode==='slow-game'&&!host.hidden;
 let ready=false;
 function send(type,detail={}){
   if(!frame.contentWindow||frame.getAttribute('src')==='about:blank')return;
   frame.contentWindow.postMessage({source:'onyx-widget-host',type,...detail},location.protocol==='file:'?'*':location.origin);
 }
 function sync(){send('visibility',{visible:active()});}
 function forward(name){window.addEventListener(name,e=>{
   // Forward only serializable properties; DOM nodes and back-end objects must not cross frames.
   const raw=e.detail||{};
   const detail=name==='onyx:chat-line'?{
      tab:raw.tab,role:raw.role,content:String(raw.content||'').slice(0,8000),messageId:raw.messageId,restore:!!raw.restore
   }:name==='onyx:pet-action'?{action:String(raw.action||''),tab:raw.tab}:{};
   send('widget-event',{name,detail});
 });}
 ['onyx:chat-line','onyx:pet-action','ourspace:auth','ourspace:signed-out','onyx-currency-change','onyx-currency-refresh'].forEach(forward);
 window.addEventListener('message',event=>{
   if(!sameOrigin(event))return;
   const d=event.data||{};if(d.source!==tag)return;
   if(d.type==='ready'){ready=true;sync();return;}
   if(d.type==='exit'){window.OnyxShell?.exitToModule?.();return;}
   if(d.type==='open-chat'){window.OnyxShell?.openRuntimeChat?.('health');return;}
   if(d.type==='game-event'&&typeof d.name==='string'&&d.name.startsWith('onyx-adventures:')){
     window.dispatchEvent(new CustomEvent(d.name,{detail:{...d.detail,fromGameIframe:true}}));
   }
 });
 frame.addEventListener('load',()=>{ready=false;sync();});
 window.OnyxGameFrame=Object.freeze({frame,host,sync,status:()=>({loaded:ready,active:active(),src:frame.getAttribute('src')})});
 // Public API remains available to existing Onyx widget integrations.
 const api=Object.freeze({id:'catastrophic',name:'CAT-astrophic Cuteness',
  open(){window.OnyxShell?.enterSlowGame?.();return Promise.resolve(frame)},
  close(){window.OnyxShell?.exitToModule?.()},
  status(){return {loaded:ready,active:active(),iframe:true};}});
 window.OnyxAdventuresIntegration=api;
 window.CatastrophicIntegration=api;
})();
