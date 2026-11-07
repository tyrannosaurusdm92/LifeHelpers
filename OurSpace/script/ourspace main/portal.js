(()=>{'use strict';
const $=s=>document.querySelector(s),auth=window.OurSpaceAuth;
const login=$('#loginForm'),status=$('#portalStatus'),recover=$('#recoveryDialog'),recoveryStatus=$('#recoveryStatus');
const show=(msg,error=false)=>{status.textContent=msg;status.style.color=error?'#F47745':'#1b6651'};
const rshow=(msg,error=false)=>{recoveryStatus.textContent=msg;recoveryStatus.style.color=error?'#F47745':'#1b6651'};
let installPrompt=null,recoveryId='';
function goProfile(who){location.assign('assets/code/'+who+'.html?page=profile')}
function showAdmin(){login.hidden=true;$('#previewChooser').hidden=false;$('#previewChooser').querySelectorAll('[data-admin-open]').forEach(b=>b.addEventListener('click',()=>goProfile(b.dataset.adminOpen),{once:true}));show('Choose the profile to preview.');}
if(auth.isAdmin())showAdmin();else if(auth.isAuthenticated())goProfile(auth.profile());
login?.addEventListener('submit',async e=>{
 e.preventDefault();const identifier=$('#accountId').value.trim(),password=$('#password').value,button=$('#signInButton');
 if(!identifier||!password)return show('Enter your email and password, or use Forgot password to create your first password.',true);
 button.disabled=true;show('Signing in…');
 try{const result=await auth.signIn(identifier,password,$('#rememberDevice').checked);if(result.admin)showAdmin();else {if($('#rememberPassword').checked&&window.PasswordCredential&&navigator.credentials?.store)navigator.credentials.store(new PasswordCredential({id:identifier,password})).catch(()=>{});goProfile(result.profile)}}catch(err){show(err.message,true)}finally{button.disabled=false}
});
$('#togglePassword')?.addEventListener('click',()=>{const field=$('#password'),b=$('#togglePassword');field.type=field.type==='password'?'text':'password';b.textContent=field.type==='password'?'Show':'Hide';b.setAttribute('aria-pressed',String(field.type!=='password'))});
// Recovery uses only the existing backend's signup and reset actions.
// The backend can validate any unexpired code for the matching account and
// purpose when challengeId is omitted. Keep delayed email codes usable.
let recoveryMode='reset',recoveryExpiresAt=0,lastCodeRequestAt=0,codeRequestBusy=false,recoveryTicker=null;
const resendWaitMs=90000;
const recoveryEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const recoveryStep=s=>{['Start','Choose','Code'].forEach(part=>$('#recovery'+part).hidden=part.toLowerCase()!==s)};
const hint=msg=>{$('#recoveryModeHint').textContent=msg};
function setVisible(fieldId,buttonId,visible,caption){
 const f=$('#'+fieldId),b=$('#'+buttonId);if(!f||!b)return;
 f.type=visible?'text':'password';b.textContent=visible?'Hide':'Show';
 b.setAttribute('aria-pressed',String(visible));
 b.setAttribute('aria-label',(visible?'Hide ':'Show ')+caption);
}
for(const [field,button,name] of [
 ['newPasswordInput','recoveryToggleNewPassword','new password'],
 ['confirmNewPasswordInput','recoveryToggleConfirmPassword','password confirmation']
]){
 $('#'+button)?.addEventListener('click',()=>setVisible(field,button,$('#'+field).type==='password',name));
}
function updateCodeNotice(){
 const resend=$('#recoveryResend'),note=$('#recoveryCodeNotice');
 if(!resend||!note)return;
 const remaining=lastCodeRequestAt?Math.max(0,resendWaitMs-(Date.now()-lastCodeRequestAt)):0;
 resend.disabled=codeRequestBusy||remaining>0;
 resend.textContent=remaining>0?'Resend available in '+Math.ceil(remaining/1000)+'s':'Send another code';
 if(recoveryExpiresAt){
  const mins=Math.ceil((recoveryExpiresAt-Date.now())/60000);
  note.textContent=mins>0
   ? 'The newest code expires at '+new Date(recoveryExpiresAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+' ('+mins+' min remaining). Older codes can still work if unexpired.'
   : 'The newest code may have expired. Request another code to continue.';
 }else note.textContent='An emailed code is only valid until the backend expiry time. If email is delayed, wait before requesting another.';
}
function stopTicker(){if(recoveryTicker!==null)clearInterval(recoveryTicker);recoveryTicker=null}
function startTicker(){stopTicker();recoveryTicker=setInterval(updateCodeNotice,1000);updateCodeNotice()}
function showRecovery(){
 recoveryId='';recoveryMode='reset';recoveryExpiresAt=0;lastCodeRequestAt=0;codeRequestBusy=false;stopTicker();
 $('#recoveryIdentifier').value=$('#accountId').value.trim();
 $('#recoveryCodeInput').value='';$('#newPasswordInput').value='';$('#confirmNewPasswordInput').value='';
 $('#recoveryOption').replaceChildren();
 $('#recoveryRememberDevice').checked=$('#rememberDevice').checked;
 $('#recoveryRememberPassword').checked=$('#rememberPassword').checked;
 setVisible('newPasswordInput','recoveryToggleNewPassword',false,'new password');
 setVisible('confirmNewPasswordInput','recoveryToggleConfirmPassword',false,'password confirmation');
 recoveryStep('start');hint('Enter your OurSpace account email to receive an email verification code.');
 rshow('');updateCodeNotice();if(!recover.open)recover.showModal();$('#recoveryIdentifier').focus();
}
$('#forgotLink')?.addEventListener('click',e=>{e.preventDefault();showRecovery()});
$('#recoveryClose')?.addEventListener('click',()=>recover.close());
recover?.addEventListener('close',stopTicker);
function freshSetupSecret(){
 const bytes=new Uint8Array(24);
 if(!globalThis.crypto?.getRandomValues)throw new Error('Secure browser randomness is unavailable.');
 globalThis.crypto.getRandomValues(bytes);
 return Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
}
async function issueRecoveryCode(){
 if(codeRequestBusy)return;
 codeRequestBusy=true;const first=!lastCodeRequestAt;
 lastCodeRequestAt=Date.now();updateCodeNotice();
 const send=$('#recoveryChoose button[type="submit"]');if(send)send.disabled=true;
 rshow(first?'Requesting a six-digit email code…':'Requesting another code. Earlier unexpired codes remain usable…');
 try{
  let result;
  if(recoveryMode==='first-time'){
   // The backend requires a password in the request, but only stores the
   // password supplied at successful email verification, not this placeholder.
   result=await auth.request('auth.signup',{
    email:recoveryId,verificationDestinationType:'email',password:freshSetupSecret()
   },{timeout:90000});
   if(!result?.signupPending||!result?.verificationRequired||!result?.challengeId)
    throw new Error('The backend did not confirm an email verification challenge.');
  }else{
   result=await auth.request('auth.password.forgot',{
    identifier:recoveryId,optionId:$('#recoveryOption').value,delivery:'email'
   },{timeout:90000});
   if(!result?.requested||result?.selectionRequired||!result?.challengeId)
    throw new Error('The backend did not confirm a password reset email.');
  }
  recoveryExpiresAt=Date.parse(result.expiresAt||'')||0;
  recoveryStep('code');startTicker();
  hint('Enter the emailed code for '+recoveryId+' and create your password. Avoid repeated resend requests.');
  rshow('Email request accepted. Check your inbox or spam; delivery can take time. Use a code before its expiry.');
  $('#recoveryCodeInput').focus();
 }catch(err){
  if(err?.deliveryUnconfirmed){
   recoveryExpiresAt=0;recoveryStep('code');startTicker();
   hint('The email request could not be confirmed. You may still enter a code if one arrives.');
   rshow('The request timed out, but a code might still arrive. Avoid requesting another immediately.',true);
   $('#recoveryCodeInput').focus();
  }else{
   if(first)lastCodeRequestAt=0;
   rshow(err.message||'Email request failed.',true);
  }
 }finally{codeRequestBusy=false;if(send)send.disabled=false;updateCodeNotice()}
}
$('#recoveryStart')?.addEventListener('submit',async e=>{
 e.preventDefault();recoveryId=$('#recoveryIdentifier').value.trim().toLowerCase();
 if(!recoveryEmail(recoveryId))return rshow('Enter a valid account email address.',true);
 const btn=e.currentTarget.querySelector('[type="submit"]');btn.disabled=true;
 rshow('Checking your account’s verified recovery email…');
 try{
  const result=await auth.request('auth.recovery.options',{identifier:recoveryId},{timeout:45000});
  const select=$('#recoveryOption');select.replaceChildren();
  if(result.found===false){
   recoveryMode='first-time';
   const opt=document.createElement('option');opt.value='first-time';
   opt.textContent='Email verification for '+recoveryId;select.append(opt);
   hint('First-time password setup: the backend creates the account only after email verification.');
  }else{
   recoveryMode='reset';
   const emails=(Array.isArray(result.options)?result.options:[]).filter(o=>o?.type==='email'&&o.optionId);
   if(!emails.length)throw new Error('The backend did not return a verified recovery email for this account.');
   for(const item of emails){
    const opt=document.createElement('option');opt.value=String(item.optionId);
    opt.textContent=String(item.label||'Email')+' · '+String(item.destination||'verified address');
    select.append(opt);
   }
   hint('Password recovery: a six-digit code will be sent to your verified email.');
  }
  if(select.options.length===1)await issueRecoveryCode();
  else{recoveryStep('choose');rshow('Choose the email address for your code.')}
 }catch(err){rshow(err.message||'Could not check recovery methods.',true)}
 finally{btn.disabled=false}
});
$('#recoveryChoose')?.addEventListener('submit',async e=>{
 e.preventDefault();if(!codeRequestBusy&&!lastCodeRequestAt)await issueRecoveryCode();
});
$('#recoveryResend')?.addEventListener('click',async()=>{
 if(!codeRequestBusy&&(!lastCodeRequestAt||Date.now()-lastCodeRequestAt>=resendWaitMs))await issueRecoveryCode();
});
async function rememberRecoveryPassword(email,password){
 if(!$('#recoveryRememberPassword').checked)return;
 if(typeof PasswordCredential==='undefined'||!navigator.credentials?.store)return;
 try{await navigator.credentials.store(new PasswordCredential({id:email,password}))}catch(_){}
}
$('#recoveryCode')?.addEventListener('submit',async e=>{
 e.preventDefault();
 const code=$('#recoveryCodeInput').value.replace(/\D/g,'');
 const password=$('#newPasswordInput').value,confirm=$('#confirmNewPasswordInput').value;
 if(!/^\d{6}$/.test(code))return rshow('Enter the six-digit code from your email.',true);
 if(password.length<8)return rshow('Password must be at least eight characters.',true);
 if(password!==confirm)return rshow('The passwords do not match.',true);
 const btn=e.currentTarget.querySelector('[type="submit"]');btn.disabled=true;
 const rememberDevice=$('#recoveryRememberDevice').checked;let passwordSaved=false;
 rshow('Verifying your emailed code and saving the password…');
 try{
  let session;
  if(recoveryMode==='first-time'){
   // No challengeId: the backend checks all unexpired SIGNUP_CONTACT codes
   // for this email, including an older code delivered after a resend.
   const result=await auth.request('auth.signup',{
    email:recoveryId,verificationDestinationType:'email',
    verificationCode:code,password,rememberThisDevice:rememberDevice
   },{timeout:90000});
   if(!result?.sessionToken)throw new Error('The backend did not confirm account creation.');
   passwordSaved=true;session=auth.acceptSession(result,rememberDevice);
  }else{
   // No challengeId: the backend checks unexpired RESET_PASSWORD codes.
   const result=await auth.request('auth.password.reset',{
    identifier:recoveryId,code,newPassword:password
   },{timeout:90000});
   if(!result?.reset)throw new Error('The backend did not confirm the password update.');
   passwordSaved=true;session=await auth.signIn(recoveryId,password,rememberDevice);
  }
  $('#rememberDevice').checked=rememberDevice;
  $('#rememberPassword').checked=$('#recoveryRememberPassword').checked;
  await rememberRecoveryPassword(recoveryId,password);
  $('#recoveryCodeInput').value='';$('#newPasswordInput').value='';$('#confirmNewPasswordInput').value='';
  stopTicker();recover.close();show('Password saved. Signed in successfully.');
  goProfile(session.profile);
 }catch(err){
  if(passwordSaved){
   $('#accountId').value=recoveryId;$('#password').value='';
   $('#rememberDevice').checked=rememberDevice;
   $('#rememberPassword').checked=$('#recoveryRememberPassword').checked;
   await rememberRecoveryPassword(recoveryId,password);
   stopTicker();recover.close();
   show('Your password was saved. Sign in with the new password.',false);
  }else{
   const error=err.message||'The code was not accepted.';
   rshow(/invalid|expired/i.test(error)
     ? error+' If the email arrived late, check its expiry or try a different unexpired code. Request another only if needed.'
     : error,true);
  }
 }finally{btn.disabled=false}
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installApp').hidden=false});
window.addEventListener('appinstalled',()=>{installPrompt=null;$('#installHelp').hidden=true;$('#installApp').hidden=true;show('OurSpace installed.')});
$('#installApp')?.addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;return}$('#installHelp').hidden=!$('#installHelp').hidden});
if('serviceWorker'in navigator&&location.protocol==='https:'||location.hostname==='localhost')navigator.serviceWorker?.register('./service-worker.js').catch(()=>{});
})();
