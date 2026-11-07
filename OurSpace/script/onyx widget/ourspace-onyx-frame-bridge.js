/* Same-origin iframe bridge. Onyx remains the original module; OurSpace owns page navigation, Household and Design Studio. */
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
 let last='';
 function sync(){
  const fullscreen=fullscreenIds.some(id=>{const n=document.getElementById(id);return n&&!n.hidden});
  const opened=!!(bubble?.getAttribute('aria-expanded')==='true'||popout?.getAttribute('aria-hidden')==='false');
  const mode=fullscreen?'fullscreen':opened?'panel':'bubble';
  if(mode===last)return;last=mode;send({type:'ourspace:onyx-frame-layout',mode});
 }
 const observe=(el,attributes)=>{if(el)new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:attributes})};
 observe(root,['data-runtime-mode']);observe(bubble,['aria-expanded']);observe(popout,['aria-hidden','hidden','class']);
 for(const id of fullscreenIds)observe(document.getElementById(id),['hidden','class']);
 document.addEventListener('click',()=>requestAnimationFrame(sync));
 document.addEventListener('ourspace:design-widget-toggle',event=>{
  send({type:'ourspace:onyx-design-toggle',surface:event.detail?.surface||'widget',visible:event.detail?.visible});
 });
 window.addEventListener('load',sync);requestAnimationFrame(sync);
})();
