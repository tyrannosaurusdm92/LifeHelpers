/* Deterministic 52% assignment of the approved cadmium button class.
   Pre-existing Bulletin controls remain styled; the count stays exact when possible. */
(()=>{'use strict';
 const hue=c=>{const m=String(c||'').match(/\d+/g);return m&&m.length>=3?m.slice(0,3).map(Number):null};
 const isGold=el=>{
  if(el.closest('#bulletinBoardModule')&&el.matches('.gold-button,.nav-tile,.menu-action,.inspector-btn'))return true;
  const color=hue(getComputedStyle(el).backgroundColor);
  return !!color&&color[0]>155&&color[0]>color[2]*1.25&&color[1]>=100&&color[1]>color[2]*1.06;
 };
 // FNV-1a hash of an identity independent of account name, used as a stable preference.
 function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
 const isDestructive=el=>{
  // Do not paint cancel, delete or red-X exit controls as ordinary cyan buttons.
  const ident=[el.id,el.className,el.getAttribute('aria-label'),el.getAttribute('title'),
    el.getAttribute('data-action'),el.getAttribute('data-inspector'),el.textContent].join(' ').toLowerCase();
  return /(?:^|[^a-z])(cancel|delete|remove|destructive|danger|exit|close)(?:$|[^a-z])/.test(ident)
    || /[❌✖❎]/.test(ident);
};
const isEligible=el=>!el.closest('#designWidget,#osProfileGridToolbar,#osb-designWidget,[hidden]')&&el.type!=='hidden'&&!isDestructive(el);
 function identity(el,i){const ancestor=el.closest('[id],[data-ourspace-page]');const key=el.id||el.getAttribute('data-action')||el.getAttribute('data-route')||el.getAttribute('title')||el.textContent.trim().slice(0,65);return [ancestor?.id||ancestor?.getAttribute('data-ourspace-page')||'',key,el.parentElement?.className||'',i].join('|').replace(/\b(william|jasper|dino|squishy)\b/gi,'account')}
 let task=0,lastCount=-1;
 function assign(){task=0;
  const all=[...document.querySelectorAll('button,input[type="button"],input[type="submit"],input[type="reset"]')].filter(isEligible);
  for(const button of all)button.classList.remove('os-gold-52','os-original-gold');
  const goal=Math.round(all.length*.52);const already=all.filter(isGold);const remain=all.filter(el=>!already.includes(el));
  remain.sort((a,b)=>hash(identity(a,all.indexOf(a)))-hash(identity(b,all.indexOf(b))));
  const chosen=new Set(remain.slice(0,Math.max(0,goal-already.length)));
  for(const el of all){el.classList.toggle('os-gold-52',chosen.has(el));el.classList.toggle('os-original-gold',already.includes(el));}
  lastCount=all.length;document.documentElement.dataset.osGoldButtonCount=String(chosen.size+already.length);
  document.documentElement.dataset.osTotalButtonCount=String(all.length);
 }
 function queue(){if(task)return;task=requestAnimationFrame(assign)}
 document.addEventListener('click',e=>{const b=e.target.closest('button,.master-links a');if(!b||b.closest('#designWidget')||!b.matches('button.os-gold-52,button.os-original-gold,#masterNav button,#masterNav .master-links a'))return;
  // The clicked state uses the approved cadmium/persimmon colors; preserve pressed state.
  if(b.matches('button')){const group=b.parentElement;if(group)for(const other of group.children)if(other!==b)other.classList?.remove('os-button-clicked');b.classList.add('os-button-clicked');}
 },true);
 document.addEventListener('DOMContentLoaded',queue,{once:true});
 new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('ourspace:page-changed',queue);window.addEventListener('ourspace:page-active',queue);
 if(document.readyState!=='loading')queue();
 window.OurSpaceButtonPalette={refresh:queue};
})();
