(function(){
  'use strict';
  function detectProfile(){const val=((document.body&&document.body.dataset&&document.body.dataset.ourspaceUser)||document.title||location.pathname||'').toLowerCase(); if(val.includes('jasper'))return 'jasper'; if(val.includes('william'))return 'william'; return 'william';}
  function render(){
    const all=window.OURSPACE_POSITIVE_MESSAGES||{}; const data=all[detectProfile()]||all.shared||{}; const affirm=(data.positive_affirmations||[]).filter(Boolean); const marquees=(data.marquee_details||[]).map(m=>m.full_text||m).filter(Boolean); if(!affirm.length&&!marquees.length)return;
    const pages=document.querySelectorAll('.page');
    if(pages.length){pages.forEach((page,idx)=>{let box=page.querySelector(':scope > .os-page-positive'); if(!box){box=document.createElement('section'); box.className='os-page-positive'; box.innerHTML='<div class="os-page-marquee" aria-live="polite"><span></span></div><div class="os-page-affirmation" aria-live="polite"></div>'; const tb=page.querySelector(':scope > .page-toolbar'); if(tb)tb.insertAdjacentElement('afterend',box); else page.prepend(box);} const n=Math.floor(Date.now()/15000)+idx; const a=affirm[n%affirm.length]||''; const m=marquees[n%marquees.length]||a; const ae=box.querySelector('.os-page-affirmation'); const me=box.querySelector('.os-page-marquee span'); if(ae)ae.textContent=a; if(me)me.textContent=m;});}
    let login=document.querySelector('#authScreen .os-login-positive, .os-login-positive, #ourspaceGlobalPositive');
    if(!pages.length && !login){login=document.createElement('section'); login.id='ourspaceGlobalPositive'; login.className='os-page-positive os-login-positive'; login.innerHTML='<div class="os-page-marquee" aria-live="polite"><span></span></div><div class="os-page-affirmation" aria-live="polite"></div>'; const target=document.querySelector('main, .auth-card, .login-card, body'); if(target&&target!==document.body)target.prepend(login); else document.body.prepend(login);}
    if(login){const n=Math.floor(Date.now()/15000); const a=affirm[n%affirm.length]||''; const m=marquees[n%marquees.length]||a; const ae=login.querySelector('.os-page-affirmation'); const me=login.querySelector('.os-page-marquee span'); if(ae)ae.textContent=a; if(me)me.textContent=m;}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render); else setTimeout(render,0);
  setInterval(render,15000);
})();
