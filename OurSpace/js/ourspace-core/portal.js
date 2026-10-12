/* Portal sign-in, recovery, install, and local preview access. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const client=window.OurSpaceBackend;
const form=$('#portalLoginForm'),identity=$('#portalUsername'),password=$('#portalPassword'),remember=$('#portalRememberPassword'),status=$('#portalAuthStatus');
const out=$('#portalSignedOutView'),inside=$('#portalSignedInView'),signOut=$('#portalLogoutButton');
const info=$('#portalSignedInAs'),choose=$('#portalSelectedProfile');let recoveryId='',recoveryChallenge='';
const setStatus=(txt,error=false)=>{if(status){status.textContent=txt;status.className='portal-status'+(error?' error':' ok')}};
const destination=(p)=>'assets/code/'+(p==='jasper'?'jasper':'william')+'.html#retrobuilder';
function showInside(profile,admin=false){out.classList.add('portal-hidden');inside.classList.remove('portal-hidden');signOut.classList.remove('portal-hidden');info.textContent=admin?'Preview both spaces':(profile==='jasper'?'Welcome, Jasper':'Welcome, William');
 $$('.portal-profile-open').forEach(el=>{el.hidden=!admin&&el.dataset.profile!==profile;});}
function showOut(){out.classList.remove('portal-hidden');inside.classList.add('portal-hidden');signOut.classList.add('portal-hidden');}
form?.addEventListener('submit',async e=>{e.preventDefault();const id=identity.value.trim(),pw=password.value;if(!id||!pw){setStatus('Enter your email or phone and password.',true);return;}
 const button=form.querySelector('[type=submit]');button.disabled=true;setStatus('Signing in…');
 try{const result=await client.signIn(id,pw,remember.checked);password.value='';
  if(result.admin){showInside('',true);}else{showInside(result.user.profileKey,false);location.assign(destination(result.user.profileKey));}
 }catch(err){setStatus(err.message,true);}finally{button.disabled=false;}
});
$('#portalTogglePassword')?.addEventListener('click',e=>{const show=password.type==='password';password.type=show?'text':'password';e.currentTarget.textContent=show?'Hide Password':'Show Password';e.currentTarget.setAttribute('aria-pressed',String(show));});
signOut?.addEventListener('click',async()=>{await client.signOut();showOut();setStatus('Signed out.');});
$$('.portal-profile-open').forEach(b=>b.addEventListener('click',()=>{const target=b.dataset.profile;if(client.isAdmin()||client.profile()===target)location.assign(destination(target));}));
const modal=$('#portalRecovery'),rStatus=$('#portalRecoveryStatus'),rStep1=$('#portalRecoveryStepOne'),rStep2=$('#portalRecoveryStepTwo'),rStep3=$('#portalRecoveryStepThree');
const recoveryStatus=t=>{rStatus.textContent=t||''};
$('#portalForgotPassword')?.addEventListener('click',()=>{recoveryStatus('');rStep1.hidden=false;rStep2.hidden=true;rStep3.hidden=true;modal.showModal();});
$('#portalRecoveryClose')?.addEventListener('click',()=>modal.close());
$('#portalRecoveryStart')?.addEventListener('submit',async e=>{e.preventDefault();recoveryId=$('#portalRecoveryIdentity').value.trim();const b=$('#portalRecoveryStart button[type=submit]');b.disabled=true;recoveryStatus('Checking recovery options…');
 try{const r=await client.request('auth.password.forgot',{identifier:recoveryId});
  if(r.selectionRequired&&Array.isArray(r.options)&&r.options.length){const choice=$('#portalRecoveryOptions');choice.replaceChildren();for(const o of r.options){const opt=document.createElement('option');opt.value=o.optionId;opt.textContent=(o.type==='phone'?'Text ':'Email ')+(o.masked||o.destination||'');choice.append(opt);}$('#portalRecoveryChoose').hidden=false;recoveryStatus('Choose where to receive your code.');}
  else{recoveryChallenge=r.challengeId||'';rStep1.hidden=true;rStep2.hidden=false;recoveryStatus(r.message||'Enter the code you received.');}
 }catch(err){recoveryStatus(err.message);}finally{b.disabled=false;}
});
$('#portalRecoveryChoose')?.addEventListener('submit',async e=>{e.preventDefault();const b=e.currentTarget.querySelector('[type=submit]');b.disabled=true;try{const r=await client.request('auth.password.forgot',{identifier:recoveryId,optionId:$('#portalRecoveryOptions').value});recoveryChallenge=r.challengeId||'';rStep1.hidden=true;rStep2.hidden=false;recoveryStatus(r.message||'Check your messages.');}catch(err){recoveryStatus(err.message);}finally{b.disabled=false;}});
$('#portalRecoveryResend')?.addEventListener('click',async()=>{try{const r=await client.request('auth.password.forgot',{identifier:recoveryId});recoveryChallenge=r.challengeId||recoveryChallenge;recoveryStatus(r.message||'A new code was requested.');}catch(err){recoveryStatus(err.message);}});
$('#portalRecoveryVerify')?.addEventListener('submit',async e=>{e.preventDefault();rStep2.hidden=true;rStep3.hidden=false;recoveryStatus('Enter a new password to finish.');});
$('#portalRecoveryComplete')?.addEventListener('submit',async e=>{e.preventDefault();const code=$('#portalRecoveryCode').value.trim(),newPassword=$('#portalRecoveryNewPassword').value;
 if(!code||!newPassword){recoveryStatus('Enter the code and your new password.');return;}
 try{await client.request('auth.password.reset',{identifier:recoveryId,code,newPassword,challengeId:recoveryChallenge});modal.close();setStatus('Password updated. Sign in with your new password.');}
 catch(err){rStep3.hidden=false;recoveryStatus(err.message);}
});
$('#portalRecoveryShowPassword')?.addEventListener('click',e=>{const f=$('#portalRecoveryNewPassword');f.type=f.type==='password'?'text':'password';e.currentTarget.textContent=f.type==='password'?'Show Password':'Hide Password';});
const appButton=$('#portalDownloadAppButton');let installEvent=null;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;});
appButton?.addEventListener('click',async()=>{if(installEvent){const e=installEvent;installEvent=null;e.prompt();try{await e.userChoice;}catch(_){}return;}
 const a=document.createElement('a');a.href='assets/images/ourspace-core/ourspace-icon-512.png';a.download='OurSpace-icon.png';a.click();
 const help=$('#portalInstallHint');if(help)help.textContent='To add OurSpace to your home screen, use your browser’s Install App or Add to Home Screen option.';
});
function updateNav(){const master=$('#masterNav'),panel=master?.querySelector('.master-panel');$('#masterToggle')?.addEventListener('click',()=>master?.classList.toggle('collapsed'));$('#resetMasterNav')?.addEventListener('click',()=>{master.style.left='12px';master.style.top='12px';});
 const h=$('#masterHandle');if(h){let p=null;h.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=master.getBoundingClientRect();p={x:e.clientX,y:e.clientY,l:r.left,t:r.top};h.setPointerCapture(e.pointerId);});h.addEventListener('pointermove',e=>{if(!p)return;master.style.left=Math.max(5,Math.min(innerWidth-master.offsetWidth-5,p.l+e.clientX-p.x))+'px';master.style.top=Math.max(5,Math.min(innerHeight-master.offsetHeight-5,p.t+e.clientY-p.y))+'px';master.style.right='auto';});h.addEventListener('pointerup',()=>p=null);}
 $$('.page-route').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.page==='portal'){window.scrollTo(0,0);return;}const p=client.isAdmin()?($('#themeSelect').value):client.profile();if(!p){setStatus('Sign in first.',true);return;}location.assign(destination(p).replace('#retrobuilder','#'+b.dataset.page));}));
 $('#themeSelect')?.addEventListener('change',()=>{if(!client.isAdmin()){const p=client.profile();if(p&&$('#themeSelect').value!==p)$('#themeSelect').value=p;}});
 $('#routeSearch')?.addEventListener('input',e=>{$$('.page-route').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(e.target.value.toLowerCase()));});
 $('#navGroup04')?.addEventListener('click',e=>{const children=$('#navGroup04Items'),open=e.currentTarget.getAttribute('aria-expanded')!=='true';e.currentTarget.setAttribute('aria-expanded',String(open));children.hidden=!open;});
 if(panel)panel.setAttribute('aria-label','Go to a page');}
updateNav();
if(client.isAdmin())showInside('',true);else if(client.isAuthenticated()){
 const p=client.profile();if(p)showInside(p,false);
}
})();

/* Register the existing single root worker for installed OurSpace icon and notifications. */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register(new URL('service-worker.js',document.baseURI).href,{scope:new URL('./',document.baseURI).pathname}).catch(()=>{});
}
