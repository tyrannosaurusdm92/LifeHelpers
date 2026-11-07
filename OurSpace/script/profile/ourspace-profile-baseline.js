/* Exact user-exported profile coordinates, shared between both profiles; read-only baseline.
   Layout is locked; there is no profile drag, resize, or grid editor. */
(()=>{'use strict';
 const root=document.documentElement;
 const args=new URLSearchParams(location.search);
 if(args.get('public')==='1'||(args.get('page')||'profile')!=='profile')return;
 const coordinates={"profileTitle":{"x":0,"y":0,"widthPx":560,"heightPx":60},"profile-photo":{"x":0,"y":74,"widthPx":560,"heightPx":360},"profile-identity":{"x":0,"y":448,"widthPx":560,"heightPx":200},"profile-about":{"x":0,"y":662,"widthPx":560,"heightPx":260},"profile-contact":{"x":0,"y":1744,"widthPx":560,"heightPx":280},"profile-donation":{"x":0,"y":936,"widthPx":560,"heightPx":340},"profile-tags":{"x":580,"y":460,"widthPx":960,"heightPx":420},"profile-interests":{"x":580,"y":100,"widthPx":960,"heightPx":340},"profile-music":{"x":0,"y":2706,"widthPx":560,"heightPx":500},"profile-projects":{"x":580,"y":1320,"widthPx":960,"heightPx":440},"networkNotice":{"x":580,"y":0,"widthPx":960,"heightPx":80},"profile-links":{"x":0,"y":1290,"widthPx":560,"heightPx":440},"profile-posts":{"x":580,"y":894,"widthPx":960,"heightPx":400},"profile-guestbook":{"x":0,"y":2038,"widthPx":560,"heightPx":320},"profile-gallery":{"x":580,"y":1780,"widthPx":960,"heightPx":520},"profile-bulletins":{"x":580,"y":2320,"widthPx":960,"heightPx":880},"profile-news":{"x":0,"y":2372,"widthPx":560,"heightPx":320}};
 const stage=document.querySelector('#profileApp .profile-content');if(!stage)return;
 const ids=Object.keys(coordinates);
 root.classList.add('os-profile-baseline');
 stage.style.setProperty('--os-profile-canvas-width','1754px');
 stage.style.setProperty('--os-profile-canvas-height','3285px');
 for(const id of ids){const b=coordinates[id],el=document.getElementById(id);if(!el)continue;
  el.style.setProperty('--os-fixed-x',b.x+'px');el.style.setProperty('--os-fixed-y',b.y+'px');
  el.style.setProperty('--os-fixed-width',b.widthPx+'px');el.style.setProperty('--os-fixed-height',b.heightPx+'px');
  if(el.classList.contains('pm-module-box')){
   const surface=el.querySelector('.pm-scale-surface');if(surface)surface.style.setProperty('--pm-visual-scale',String(b.widthPx/900));
   const space=el.querySelector('.pm-flow-space');if(space)space.style.setProperty('--os-pm-inner-height',Math.max(36,b.heightPx-28)+'px');
  }
 }
})();
