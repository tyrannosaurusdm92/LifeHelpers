(()=>{'use strict';
const $=s=>document.querySelector(s),auth=window.OurSpaceAuth;
const login=$('#loginForm'),status=$('#portalStatus'),recover=$('#recoveryDialog'),recoveryStatus=$('#recoveryStatus');
const show=(msg,error=false)=>{status.textContent=msg;status.style.color=error?'#a12525':'#1b6651'};
const rshow=(msg,error=false)=>{recoveryStatus.textContent=msg;recoveryStatus.style.color=error?'#a12525':'#1b6651'};
let installPrompt=null,recoveryId='',challengeId='';
function goProfile(who){location.assign('assets/code/'+who+'.html?page=profile')}
function showAdmin(){login.hidden=true;$('#previewChooser').hidden=false;$('#previewChooser').querySelectorAll('[data-admin-open]').forEach(b=>b.addEventListener('click',()=>goProfile(b.dataset.adminOpen),{once:true}));show('Choose the profile to preview.');}
if(auth.isAdmin())showAdmin();else if(auth.isAuthenticated())goProfile(auth.profile());
login?.addEventListener('submit',async e=>{
 e.preventDefault();const identifier=$('#accountId').value.trim(),password=$('#password').value,button=$('#signInButton');
 if(!identifier||!password)return show('Enter your email or phone and password.',true);
 button.disabled=true;show('Signing in…');
 try{const result=await auth.signIn(identifier,password,$('#rememberDevice').checked);if(result.admin)showAdmin();else {if($('#rememberPassword').checked&&window.PasswordCredential&&navigator.credentials?.store)navigator.credentials.store(new PasswordCredential({id:identifier,password})).catch(()=>{});goProfile(result.profile)}}catch(err){show(err.message,true)}finally{button.disabled=false}
});
$('#togglePassword')?.addEventListener('click',()=>{const field=$('#password'),b=$('#togglePassword');field.type=field.type==='password'?'text':'password';b.textContent=field.type==='password'?'Show':'Hide';b.setAttribute('aria-pressed',String(field.type!=='password'))});
$('#forgotLink')?.addEventListener('click',e=>{e.preventDefault();$('#recoveryStart').hidden=false;$('#recoveryChoose').hidden=true;$('#recoveryCode').hidden=true;$('#recoveryIdentifier').value=$('#accountId').value.trim();rshow('');recover.showModal()});
$('#recoveryClose')?.addEventListener('click',()=>recover.close());
$('#recoveryStart')?.addEventListener('submit',async e=>{
 e.preventDefault();recoveryId=$('#recoveryIdentifier').value.trim();if(!recoveryId)return rshow('Enter your account email or phone.',true);
 const btn=e.currentTarget.querySelector('[type=submit]');btn.disabled=true;rshow('Checking recovery methods…');
 try{const r=await auth.request('auth.recovery.options',{identifier:recoveryId});let options=r.options||r.deliveryOptions||r.methods||[];if(!Array.isArray(options))options=[];
 const select=$('#recoveryOption');select.replaceChildren();if(!options.length){const o=document.createElement('option');o.value='default';o.textContent=r.message||'Use the recovery method on your account';select.append(o)}
 for(const opt of options){const o=document.createElement('option');o.value=String(opt.id||opt.optionId||opt.value||'default');o.textContent=String(opt.label||opt.name||opt.description||'Recovery destination');select.append(o)}
 $('#recoveryStart').hidden=true;$('#recoveryChoose').hidden=false;rshow(r.message||'Choose a delivery method.');
 }catch(err){rshow(err.message,true)}finally{btn.disabled=false}
});
$('#recoveryChoose')?.addEventListener('submit',async e=>{e.preventDefault();const btn=e.currentTarget.querySelector('[type=submit]');btn.disabled=true;rshow('Requesting code…');try{const r=await auth.request('auth.password.forgot',{identifier:recoveryId,optionId:$('#recoveryOption').value});challengeId=r.challengeId||'';$('#recoveryChoose').hidden=true;$('#recoveryCode').hidden=false;rshow(r.message||'Enter the code sent to your chosen destination.')}catch(err){rshow(err.message,true)}finally{btn.disabled=false}});
$('#recoveryResend')?.addEventListener('click',async()=>{rshow('Requesting another code…');try{const r=await auth.request('auth.password.forgot',{identifier:recoveryId,optionId:$('#recoveryOption').value});challengeId=r.challengeId||challengeId;rshow(r.message||'Another code has been requested.')}catch(err){rshow(err.message,true)}});
$('#recoveryCode')?.addEventListener('submit',async e=>{e.preventDefault();const code=$('#recoveryCodeInput').value.trim(),newPassword=$('#newPasswordInput').value;if(!code||!newPassword)return rshow('Enter the code and a new password.',true);const btn=e.currentTarget.querySelector('[type=submit]');btn.disabled=true;rshow('Verifying code…');try{await auth.request('auth.password.reset',{identifier:recoveryId,code,newPassword,challengeId});recover.close();show('Password updated. Sign in with your new password.')}catch(err){rshow(err.message,true)}finally{btn.disabled=false}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installApp').hidden=false});
window.addEventListener('appinstalled',()=>{installPrompt=null;$('#installHelp').hidden=true;$('#installApp').hidden=true;show('OurSpace installed.')});
$('#installApp')?.addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;return}$('#installHelp').hidden=!$('#installHelp').hidden});
if('serviceWorker'in navigator&&location.protocol==='https:'||location.hostname==='localhost')navigator.serviceWorker?.register('./service-worker.js').catch(()=>{});
})();
