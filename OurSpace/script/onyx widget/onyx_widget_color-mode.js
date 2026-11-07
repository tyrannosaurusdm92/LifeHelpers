(()=>{'use strict';
const KEY='ourspace.colorMode.v1';
const root=document.documentElement;
function valid(mode){return mode==='light'||mode==='dark';}
function systemMode(){return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
function currentMode(){return root.dataset.colorMode==='light'?'light':'dark';}
function paint(mode,persist){
 if(!valid(mode))mode='dark';
 root.dataset.colorMode=mode;root.style.colorScheme=mode;
 if(persist)try{localStorage.setItem(KEY,mode);}catch(_){}
 document.querySelectorAll('[data-color-mode-toggle]').forEach(button=>{
  const next=mode==='dark'?'light':'dark';
  button.textContent='Use '+next+' mode';
  button.setAttribute('aria-label','Use '+next+' mode');
  button.title='Switch to '+next+' appearance';
 });
 window.dispatchEvent(new CustomEvent('ourspace:color-mode-change',{detail:{mode:mode}}));
}
let initial=systemMode();
try{const saved=localStorage.getItem(KEY);if(valid(saved))initial=saved;}catch(_){}
paint(initial,false);
document.addEventListener('DOMContentLoaded',()=>paint(currentMode(),false),{once:true});
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-color-mode-toggle]');
 if(!button)return;
 event.preventDefault();
 paint(currentMode()==='dark'?'light':'dark',true);
});
window.addEventListener('storage',event=>{if(event.key===KEY&&valid(event.newValue))paint(event.newValue,false);});
})();