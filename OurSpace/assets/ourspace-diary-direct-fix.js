(function(){
  'use strict';
  function qs(sel,root){return (root||document).querySelector(sel);}
  function qsa(sel,root){return Array.from((root||document).querySelectorAll(sel));}
  function profile(){
    const b=document.body;
    const val=((b&&b.dataset&&b.dataset.ourspaceUser)||document.title||location.pathname||'').toLowerCase();
    if(val.includes('jasper')) return 'jasper';
    if(val.includes('william')) return 'william';
    return 'william';
  }
  function module(){return qs('.dbt-diary-module[data-save]');}
  function elements(){const m=module(); return m?qsa('input,textarea,select',m):[];}
  function key(){const m=module(); return (m&&m.dataset.storageKey)||('ourspace_dbt_diary_'+profile()+'_v2');}
  function status(msg){const s=qs('#status')||qs('.dbt-status'); if(s) s.textContent=msg||'';}
  function data(){const out={_savedAt:new Date().toISOString()}; elements().forEach(function(el){if(!el.name)return; out[el.name]=(el.type==='checkbox')?!!el.checked:el.value;}); return out;}
  function applyData(d){if(!d||typeof d!=='object')return; elements().forEach(function(el){if(!el.name || !(el.name in d))return; if(el.type==='checkbox')el.checked=!!d[el.name]; else el.value=d[el.name]||'';}); status(d._savedAt?'Loaded saved copy from '+new Date(d._savedAt).toLocaleString()+'.':'Loaded saved copy.');}
  window.saveBrowser=function(){try{localStorage.setItem(key(),JSON.stringify(data())); status('Saved at '+new Date().toLocaleString()+'.'); window.dispatchEvent(new CustomEvent('ourspace:diary-saved',{detail:{key:key()}}));}catch(e){status('Save failed in this browser.');}};
  window.loadBrowser=function(){try{const raw=localStorage.getItem(key()); if(!raw){status('No saved diary card found yet.');return;} applyData(JSON.parse(raw));}catch(e){status('Saved diary card could not be loaded.');}};
  window.clearSheet=function(){if(!confirm('Clear this visible diary card?')) return; elements().forEach(function(el){if(el.type==='checkbox')el.checked=false; else el.value='';}); status('Diary card cleared. Save again if you want this blank version saved.');};
  window.exportTxt=function(){
    const d=data(), lines=[]; const title=qs('.dbt-title-card h1')||qs('.os-diary-only-card h2');
    lines.push(title?title.textContent.trim():'Diary Card'); lines.push('Exported: '+new Date().toLocaleString()); lines.push('');
    elements().forEach(function(el){if(!el.name)return; const v=(el.type==='checkbox')?(el.checked?'yes':''):el.value; if(v) lines.push(el.name.replace(/_/g,' ')+': '+v);});
    const blob=new Blob([lines.join('\n')],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='diary-card_'+profile()+'_'+new Date().toISOString().slice(0,10)+'.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(a.href);},1000); status('TXT exported.');
  };
  window.savePng=function(){window.saveBrowser(); status('PNG export can vary by browser. Use Print or TXT if your browser blocks it.'); try{window.print();}catch(e){}};
  function mount(){
    const m=module(); if(!m)return;
    if(m.dataset.osDiaryBound==='1')return; m.dataset.osDiaryBound='1';
    elements().forEach(function(el){el.addEventListener('input',function(){clearTimeout(window.__ourspaceDiaryTimer); window.__ourspaceDiaryTimer=setTimeout(window.saveBrowser,500);}); el.addEventListener('change',function(){clearTimeout(window.__ourspaceDiaryTimer); window.__ourspaceDiaryTimer=setTimeout(window.saveBrowser,500);});});
    try{const raw=localStorage.getItem(key()); if(raw)applyData(JSON.parse(raw)); else status('Diary card ready.');}catch(e){status('Diary card ready.');}
  }
  function ensurePositiveBlocks(){
    const all=window.OURSPACE_POSITIVE_MESSAGES||{}; const d=all[profile()]||all.shared; if(!d)return;
    const aff=(d.positive_affirmations||[]).filter(Boolean); const mar=(d.marquee_details||[]).map(function(x){return x.full_text||x;}).filter(Boolean); if(!aff.length&&!mar.length)return;
    qsa('.page').forEach(function(page,idx){
      let box=page.querySelector(':scope > .os-page-positive');
      if(!box){box=document.createElement('section'); box.className='os-page-positive os-positive-runtime'; box.innerHTML='<div class="os-page-marquee" aria-live="polite"><span></span></div><div class="os-page-affirmation" aria-live="polite"></div>'; const tb=page.querySelector(':scope > .page-toolbar'); if(tb)tb.insertAdjacentElement('afterend',box); else page.prepend(box);}
      const n=Math.floor(Date.now()/15000)+idx; const a=aff[n%aff.length]||''; const m=mar[n%mar.length]||a; const ae=box.querySelector('.os-page-affirmation'); const me=box.querySelector('.os-page-marquee span'); if(ae)ae.textContent=a; if(me)me.textContent=m;
    });
    const login=qs('.os-login-positive'); if(login){const n=Math.floor(Date.now()/15000); const ae=login.querySelector('.os-page-affirmation'); const me=login.querySelector('.os-page-marquee span'); if(ae)ae.textContent=aff[n%aff.length]||''; if(me)me.textContent=mar[n%mar.length]||aff[n%aff.length]||'';}
  }
  function boot(){mount(); ensurePositiveBlocks();}
  window.OurSpaceDiaryDirect={mount:mount, positives:ensurePositiveBlocks};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else setTimeout(boot,0);
  setInterval(function(){mount(); ensurePositiveBlocks();},3000);
})();
