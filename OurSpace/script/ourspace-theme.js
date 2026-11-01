/* Uniform white/black defaults; the existing design widget can override individual page parts. */
(()=>{'use strict';if(new URLSearchParams(location.search).get('public')==='1')return;
const who=document.documentElement.dataset.profile||'william',key='ourspace.profile-modules.theme.'+who;
let mode='light';try{mode=localStorage.getItem(key)||'light'}catch(_){ }
function apply(){const dark=mode==='dark';document.documentElement.dataset.ourspaceTheme=mode;document.querySelectorAll('.pm-module-root').forEach(el=>el.dataset.uiTheme=mode);if(button)button.textContent=dark?'☀ Light mode':'☾ Dark mode'}
const button=document.createElement('button');button.type='button';button.className='outline-button';button.id='pmThemeToggle';
button.addEventListener('click',()=>{mode=mode==='dark'?'light':'dark';try{localStorage.setItem(key,mode)}catch(_){ }apply()});
document.querySelector('#masterNav .master-footer')?.prepend(button);apply();
})();
