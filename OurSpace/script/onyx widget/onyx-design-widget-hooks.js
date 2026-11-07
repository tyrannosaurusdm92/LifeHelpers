/* Standalone Onyx Design Widget hooks: no Design Widget code, DOM or assets are loaded. */
(()=>{'use strict';
 const surfaces=new Map();
 const buttons=()=>[...document.querySelectorAll('[data-onyx-design-toggle]')];
 const currentTab=()=>document.getElementById('onyxWidget')?.dataset.onyxTab||'health';
 function keyFor(button){
   const base=button.dataset.designSurface||'widget';
   return base==='widget'?'widget:'+currentTab():base;
 }
 function synchronize(){buttons().forEach(button=>{
   const active=!!surfaces.get(keyFor(button));
   button.setAttribute('aria-pressed',String(active));
   button.dataset.designRequested=active?'visible':'hidden';
 });}
 function toggle(button){
   const key=keyFor(button),next=!surfaces.get(key);
   surfaces.set(key,next);synchronize();
   const detail=Object.freeze({surface:key,tab:currentTab(),visible:next,requestedBy:'onyx-widget',hookOnly:true});
   // Connected Design Widget can listen to either event and mount/unmount itself later.
   window.dispatchEvent(new CustomEvent('onyx:design-widget-toggle',{detail}));
   document.dispatchEvent(new CustomEvent('ourspace:design-widget-toggle',{detail}));
   return next;
 }
 document.addEventListener('click',event=>{
   const button=event.target.closest?.('[data-onyx-design-toggle]');
   if(button){event.preventDefault();event.stopPropagation();toggle(button);return;}
   if(event.target.closest?.('[data-onyx-professor-settings-shortcut]')){
     event.preventDefault();
     // Professor has its own small display settings dialog; Work settings live in another fullscreen shell.
     const dialog=document.getElementById('onyxProfessorDisplaySettings');
     if(dialog){if(dialog.open)dialog.close();else dialog.showModal();}
   }
 },true);
 const professorShell=document.getElementById('onyxProfessorFullscreenShell');
 const sizeSelect=document.getElementById('onyxProfessorTextSize');
 const motionControl=document.getElementById('onyxProfessorReducedEffects');
 if(sizeSelect&&professorShell)sizeSelect.addEventListener('change',()=>professorShell.style.setProperty('--professor-text-scale',sizeSelect.value));
 if(motionControl&&professorShell)motionControl.addEventListener('change',()=>professorShell.classList.toggle('onyx-reduced-effects',motionControl.checked));
 const widget=document.getElementById('onyxWidget');
 if(widget&&window.MutationObserver)new MutationObserver(synchronize).observe(widget,{attributes:true,attributeFilter:['data-onyx-tab','class']});
 const api=Object.freeze({toggle:(surface)=>{
   const button=buttons().find(b=>keyFor(b)===surface);
   return button?toggle(button):false;
 },requestedVisible:surface=>!!surfaces.get(surface),sync:synchronize});
 window.OnyxDesignWidgetHooks=api;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',synchronize,{once:true});else synchronize();
})();
