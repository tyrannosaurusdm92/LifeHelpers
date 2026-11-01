/* Replacement module light/dark theme, confined to the original module root. */
(()=>{'use strict';const root=document.getElementById('linksModuleRoot');if(!root)return;
 const profile=document.documentElement.dataset.profile==='jasper'?'jasper':'william';
 const KEY='ourspace.links.module.theme.'+profile;
 let mode='light';try{mode=localStorage.getItem(KEY)||'light'}catch(_){};
 const button=root.querySelector('[data-links-theme]');
 const draw=()=>{root.dataset.uiTheme=mode; if(button){button.textContent=mode==='dark'?'☀ Light mode':'☾ Dark mode';button.setAttribute('aria-pressed',String(mode==='dark'));}};
 button?.addEventListener('click',()=>{mode=mode==='light'?'dark':'light';try{localStorage.setItem(KEY,mode)}catch(_){}draw()});draw();
})();