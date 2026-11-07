/* Same-origin geometry bridge: clip the full-viewport iframe to Onyx's
   interactive bubble and module, so it can move/resize without covering OurSpace. */
(()=>{'use strict';
 const q=new URLSearchParams(location.search);
 if(q.get('embedded')!=='1'||window.parent===window)return;
 const profile=q.get('profile')==='jasper'?'jasper':'william';
 const root=document.documentElement;
 root.dataset.profile=profile;root.dataset.ourspaceProfile=profile;
 document.body.dataset.profile=profile;
 root.classList.add('ourspace-onyx-embedded');
 const send=data=>{try{window.parent.postMessage({...data,profile},location.origin)}catch(_){}};
 const widget=document.getElementById('onyxWidget'),bubble=document.getElementById('onyxBubble'),popout=document.getElementById('onyxPopout');
 const fullscreenIds=['slowPetGame','onyxLeisureFullscreen','onyxWorkFullscreenShell','onyxProfessorFullscreenShell'];
 let lastMode='',lastGeometry='',scheduled=false;
 const rect=el=>{
  if(!el)return null;
  const r=el.getBoundingClientRect();
  return r.width>0&&r.height>0?{x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)}:null;
 };
 function sync(){
  scheduled=false;
  const fullscreen=fullscreenIds.some(id=>{const n=document.getElementById(id);return n&&!n.hidden});
  const opened=!!(bubble?.getAttribute('aria-expanded')==='true'||popout?.getAttribute('aria-hidden')==='false');
  const mode=fullscreen?'fullscreen':opened?'panel':'bubble';
  if(mode!==lastMode){lastMode=mode;send({type:'ourspace:onyx-frame-layout',mode});}
  const geometry={mode,bubble:rect(bubble),panel:opened?rect(popout):null};
  const signature=JSON.stringify(geometry);
  if(signature!==lastGeometry){lastGeometry=signature;send({type:'ourspace:onyx-frame-geometry',...geometry});}
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}
 const observe=(el,attributes)=>{if(el)new MutationObserver(schedule).observe(el,{attributes:true,attributeFilter:attributes})};
 observe(root,['data-runtime-mode']);observe(widget,['class','style']);observe(bubble,['aria-expanded','style']);
 observe(popout,['aria-hidden','hidden','class','style']);
 for(const id of fullscreenIds)observe(document.getElementById(id),['hidden','class']);
 if('ResizeObserver'in window){const ro=new ResizeObserver(schedule);for(const el of [widget,bubble,popout])if(el)ro.observe(el);}
 for(const name of ['onyx:widget-move','onyx:open-change','onyx:uiresize','onyx:fullscreen-change'])window.addEventListener(name,schedule);
 window.addEventListener('pointermove',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 document.addEventListener('click',schedule);
 document.addEventListener('ourspace:design-widget-toggle',event=>{
  send({type:'ourspace:onyx-design-toggle',surface:event.detail?.surface||'widget',visible:event.detail?.visible});
 });
 window.addEventListener('load',schedule);schedule();
})();