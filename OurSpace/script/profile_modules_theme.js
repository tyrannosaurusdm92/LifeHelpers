/* Shared adaptation of the uploaded modules' identical light/dark-mode controllers.
   One control operates all 12 module roots, without a duplicate floating designer. */
(()=>{'use strict';const page=new URLSearchParams(location.search);if((page.get('page')||'profile')!=='profile'||page.get('public')==='1')return;
const who=document.documentElement.dataset.profile||'william',key='ourspace.profile-modules.theme.'+who;
let mode='light';try{mode=localStorage.getItem(key)||'light'}catch(_){}
function apply(){document.querySelectorAll('.pm-module-root').forEach(el=>el.dataset.uiTheme=mode);if(button)button.textContent=mode==='light'?'☾ Dark modules':'☀ Light modules'}
const button=document.createElement('button');button.type='button';button.id='pmThemeToggle';button.className='outline-button';button.textContent='☾ Dark modules';button.addEventListener('click',()=>{mode=mode==='light'?'dark':'light';try{localStorage.setItem(key,mode)}catch(_){}apply()});
const nav=document.querySelector('#masterNav .master-footer');if(nav)nav.prepend(button);apply();
})();
