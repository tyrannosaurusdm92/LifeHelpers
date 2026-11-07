(()=>{'use strict';
const $=s=>document.querySelector(s),auth=window.OurSpaceAuth;
const login=$('#loginForm'),status=$('#portalStatus'),recover=$('#recoveryDialog'),recoveryStatus=$('#recoveryStatus');
const show=(msg,error=false)=>{status.textContent=msg;status.style.color=error?'#F47745':'#1b6651'};
const rshow=(msg,error=false)=>{recoveryStatus.textContent=msg;recoveryStatus.style.color=error?'#F47745':'#1b6651'};
let installPrompt=null,recoveryId='',challengeId='';
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
// Both profiles have reserved owner emails in the EXISTING backend. An email
// with an active Users row takes the ordinary RESET_PASSWORD challenge path.
// A reserved email without a Users row takes its existing verified SIGNUP_CONTACT
// path instead. Neither path creates a password without a valid emailed code.
let recoveryMode='reset';
const recoveryEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const recoveryStep=step=>{
 $('#recoveryStart').hidden=step!=='start';
 $('#recoveryChoose').hidden=step!=='choose';
 $('#recoveryCode').hidden=step!=='code';
};
const pendingButton=(button,working)=>{if(button)button.disabled=!!working};
const stageHint=$('#recoveryModeHint');
function setRecoveryHint(msg){if(stageHint)stageHint.textContent=msg}
function showRecovery(){
 recoveryMode='reset';recoveryId='';challengeId='';
 $('#recoveryIdentifier').value=$('#accountId').value.trim();
 $('#recoveryCodeInput').value='';
 $('#newPasswordInput').value='';
 const confirm=$('#confirmNewPasswordInput');if(confirm)confirm.value='';
 $('#recoveryOption').replaceChildren();
 recoveryStep('start');
 setRecoveryHint('Enter your account email. If you have not created a password yet, you can verify your email and create one.');
 rshow('');
 if(!recover.open)recover.showModal();
 $('#recoveryIdentifier').focus();
}
$('#forgotLink')?.addEventListener('click',e=>{e.preventDefault();showRecovery()});
$('#recoveryClose')?.addEventListener('click',()=>recover.close());
$('#recoveryStart')?.addEventListener('submit',async e=>{
 e.preventDefault();
 recoveryId=$('#recoveryIdentifier').value.trim().toLowerCase();
 if(!recoveryId)return rshow('Enter your account email.',true);
 const button=e.currentTarget.querySelector('[type=submit]');
 pendingButton(button,true);rshow('Checking available email verification methods…');
 try{
  const r=await auth.request('auth.recovery.options',{identifier:recoveryId});
  const select=$('#recoveryOption');select.replaceChildren();
  const options=Array.isArray(r.options)?r.options:[];
  if(r.found===false){
   // The configured email belongs to a reserved OurSpace profile, but no
   // active account exists yet. The existing signup challenge will validate it.
   if(!recoveryEmail(recoveryId))throw new Error('Enter your registered email address to create your first password.');
   recoveryMode='first-time';
   const option=document.createElement('option');option.value='first-time';
   option.textContent='Email a verification code to '+recoveryId;
   select.appendChild(option);
   setRecoveryHint('First-time setup: verify this email, then create a password. Your account is created only after the code is accepted.');
   rshow('No password-based account was found. Use the registered email to set up your first password.');
  }else{
   recoveryMode='reset';
   // The attached backend only sends email codes (SMS is disabled).
   const emails=options.filter(o=>o&&o.type!=='phone');
   if(!emails.length)throw new Error('This account has no verified recovery email. Check that the email is attached to the active Users record.');
   for(const opt of emails){
    const option=document.createElement('option');
    option.value=String(opt.optionId||opt.id||'');
    option.textContent=String(opt.label||'Email')+(opt.destination?' · '+String(opt.destination):'');
    select.appendChild(option);
   }
   setRecoveryHint('Password recovery: choose your verified email to receive a 6-digit code.');
   rshow('Choose the email where you want your verification code.');
  }
  recoveryStep('choose');
 }catch(err){rshow(err.message||'Could not check your account.',true)}
 finally{pendingButton(button,false)}
});
function freshSetupSecret(){
 const bytes=new Uint8Array(24);
 if(!globalThis.crypto?.getRandomValues)throw new Error('A secure browser connection is required for first-time password setup.');
 globalThis.crypto.getRandomValues(bytes);
 return Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
}
async function sendRecoveryCode(){
 let result;
 if(recoveryMode==='first-time'){
  // The backend requires a password field before it issues a signup challenge.
  // This one-use random placeholder is NEVER saved as an account password:
  // signupPending is only a challenge; the password chosen after verification
  // is submitted to the existing auth.signup endpoint with the emailed code.
  result=await auth.request('auth.signup',{
    email:recoveryId,verificationDestinationType:'email',password:freshSetupSecret()
  });
  if(!result?.signupPending||!result?.verificationRequired||!result?.challengeId)
   throw new Error('The backend did not issue a first-time email verification challenge.');
 }else{
  result=await auth.request('auth.password.forgot',{
    identifier:recoveryId,optionId:$('#recoveryOption').value,delivery:'email'
  });
  if(!result?.requested||result?.selectionRequired||!result?.challengeId)
   throw new Error('No password-reset email was issued. Verify the recovery address on your account.');
 }
 challengeId=String(result.challengeId);
 return result;
}
$('#recoveryChoose')?.addEventListener('submit',async e=>{
 e.preventDefault();const button=e.currentTarget.querySelector('[type=submit]');
 pendingButton(button,true);rshow('Sending your six-digit email code…');
 try{
  const result=await sendRecoveryCode();
  recoveryStep('code');
  setRecoveryHint(recoveryMode==='first-time'
    ? 'Enter the emailed code, then choose your first OurSpace password.'
    : 'Enter the emailed code and choose a replacement password.');
  rshow(result.message||'Check your email for the six-digit code.');
  $('#recoveryCodeInput').focus();
 }catch(err){rshow(err.message||'Unable to send an email code.',true)}
 finally{pendingButton(button,false)}
});
$('#recoveryResend')?.addEventListener('click',async e=>{
 const button=e.currentTarget;pendingButton(button,true);rshow('Requesting another code…');
 try{const result=await sendRecoveryCode();rshow(result.message||'A new code has been sent. Use the most recent email.')}
 catch(err){rshow(err.message||'Unable to resend your code.',true)}
 finally{pendingButton(button,false)}
});
$('#recoveryCode')?.addEventListener('submit',async e=>{
 e.preventDefault();
 const code=$('#recoveryCodeInput').value.trim();
 const newPassword=$('#newPasswordInput').value;
 const confirm=$('#confirmNewPasswordInput')?.value??newPassword;
 if(!/^\d{6}$/.test(code))return rshow('Enter the six-digit code from your email.',true);
 if(newPassword.length<8)return rshow('Your new password must contain at least eight characters.',true);
 if(newPassword!==confirm)return rshow('The two passwords do not match.',true);
 const button=e.currentTarget.querySelector('[type=submit]');
 pendingButton(button,true);rshow('Verifying your email code and saving the new password…');
 let passwordSaved=false;
 try{
  let session;
  if(recoveryMode==='first-time'){
   const result=await auth.request('auth.signup',{
    email:recoveryId,verificationDestinationType:'email',
    verificationCode:code,challengeId,password:newPassword,
    rememberThisDevice:!!$('#rememberDevice').checked
   });
   if(!result?.sessionToken)throw new Error('The existing backend did not confirm a verified account.');
   passwordSaved=true;
   session=auth.acceptSession(result,$('#rememberDevice').checked);
  }else{
   const result=await auth.request('auth.password.reset',{
    identifier:recoveryId,code,newPassword,challengeId
   });
   if(!result?.reset)throw new Error('The backend did not confirm that your password was changed.');
   passwordSaved=true;
   session=await auth.signIn(recoveryId,newPassword,$('#rememberDevice').checked);
  }
  $('#recoveryCodeInput').value='';$('#newPasswordInput').value='';
  $('#confirmNewPasswordInput').value='';
  recover.close();show('Email verified. Your password has been saved and you are signed in.');
  goProfile(session.profile);
 }catch(err){
  if(passwordSaved){
   recover.close();$('#accountId').value=recoveryId;$('#password').value='';
   show('Your new password was saved. Please sign in with that password.',false);
  }else rshow(err.message||'The code could not be verified.',true);
 }finally{pendingButton(button,false)}
});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installApp').hidden=false});
window.addEventListener('appinstalled',()=>{installPrompt=null;$('#installHelp').hidden=true;$('#installApp').hidden=true;show('OurSpace installed.')});
$('#installApp')?.addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();installPrompt=null;return}$('#installHelp').hidden=!$('#installHelp').hidden});
if('serviceWorker'in navigator&&location.protocol==='https:'||location.hostname==='localhost')navigator.serviceWorker?.register('./service-worker.js').catch(()=>{});
})();
