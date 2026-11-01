/* record_player canonical light/dark display mode. No UI framework or Shadow DOM. */
(() => {
  'use strict';
  const doc = document.getElementById('recordPlayerFlow');if(!doc||new URLSearchParams(location.search).get('public')==='1'||(new URLSearchParams(location.search).get('page')||'profile')!=='profile')return;
  const key = 'ourspace-ui-mode';
  const systemMode = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  let mode = 'light';
  try { mode = localStorage.getItem(key) || systemMode(); } catch (_) { mode = systemMode(); }
  if(mode!=='dark') mode='light';
  doc.dataset.uiTheme = mode;
  function draw() {
    let b = document.getElementById('ourspaceThemeControl');
    if(!b) { b=document.createElement('button');b.id='ourspaceThemeControl';b.type='button';b.setAttribute('aria-label','Toggle light and dark mode');b.addEventListener('click',()=>{
      mode=doc.dataset.uiTheme==='dark'?'light':'dark'; doc.dataset.uiTheme=mode;
      try{localStorage.setItem(key,mode)}catch(_ ){}
      draw();
    });doc.appendChild(b); }
    b.textContent=(mode==='dark'?'☀ Light mode':'☾ Dark mode');
    b.setAttribute('aria-pressed',String(mode==='dark'));
    b.title='Switch appearance';
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',draw,{once:true});
  else draw();
})();
