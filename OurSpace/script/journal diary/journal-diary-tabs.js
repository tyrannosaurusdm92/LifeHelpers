/* Two actual OurSpace tabs, each with its own native in-document component. */
(()=>{'use strict';
if(document.documentElement.dataset.ourspaceCurrentPage!=='journal'||!window.OurSpaceAuth?.authorize?.(document.documentElement.dataset.profile))return;
const app=document.getElementById('osJournalDiaryPage');if(!app)return;
const tabs=[...app.querySelectorAll('[data-jd-tab]')];
const frames=[...app.querySelectorAll('[data-jd-module]')];
function show(tab,updateHistory){
 if(!['journal','diary'].includes(tab))tab='journal';
 for(const btn of tabs){const on=btn.dataset.jdTab===tab;btn.setAttribute('aria-selected',String(on));btn.tabIndex=on?0:-1;}
 for(const frame of frames){const on=frame.dataset.jdModule===tab;frame.hidden=!on;frame.setAttribute('aria-hidden',String(!on));}
 if(updateHistory){const url=new URL(location.href);url.searchParams.set('tab',tab);history.replaceState(null,'',url.toString());}
 app.dataset.activeTab=tab;
 window.dispatchEvent(new CustomEvent('ourspace:journal-diary-tab',{detail:{tab}}));
}
for(const btn of tabs){btn.addEventListener('click',()=>show(btn.dataset.jdTab,true));btn.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
 const next=e.key==='Home'?'journal':e.key==='End'?'diary':btn.dataset.jdTab==='journal'?'diary':'journal';
 show(next,true);app.querySelector(`[data-jd-tab="${next}"]`)?.focus();
});}
show(new URLSearchParams(location.search).get('tab')||'journal',false);
window.OurSpaceJournalDiaryTabs={show};
})();
