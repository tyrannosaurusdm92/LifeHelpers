(()=>{'use strict';
const $=s=>document.querySelector(s),auth=window.OurSpaceAuth;
const login=$('#loginForm'),status=$('#portalStatus'),recover=$('#recoveryDialog'),recoveryStatus=$('#recoveryStatus');
const show=(msg,error=false)=>{status.textContent=msg;status.style.color=error?'#F47745':'#1b6651'};
const rshow=(msg,error=false)=>{recoveryStatus.textContent=msg;recoveryStatus.style.color=error?'#F47745':'#1b6651'};
let installPrompt=null,recoveryId='';
function goProfile(who){location.assign('assets/code/'+who+'.html?page=profile')}
function showAdmin(){login.hidden=true;$('#previewChooser').hidden=false;$('#previewChooser').querySelectorAll('[data-admin-open]').forEach(b=>b.addEventListener('click',()=>goProfile(b.dataset.adminOpen),{once:true}));show('Choose the profile to preview.');}
// A locally cached token is not proof of a current account session.
async function restoreSavedSession(){
 if(auth.isAdmin())return showAdmin();
 if(!auth.isAuthenticated())return;
 const savedToken=auth.token();
 show('Checking your saved sign-in…');
 try{
  const result=await auth.request('auth.me',{}, {timeout:45000});
  if(auth.token()!==savedToken||auth.isAdmin())return; // A newer sign-in supersedes this check.
  if(!['william','jasper'].includes(result?.user?.profileKey)||result.user.profileKey!==auth.profile())
   throw new Error('The saved account identity does not match the server.');
  goProfile(result.user.profileKey);
 }catch(err){
  if(auth.token()!==savedToken||auth.isAdmin())return;
  if(err?.serverRejected&&/session|signed out|expired|user not found|missing session/i.test(err.message||'')){
   await auth.signOut(false);
   show('Your previous sign-in expired. Please sign in again.',true);
  }else show('Could not verify the previous sign-in. You can sign in again, or retry once the account service is available.',true);
 }
}
restoreSavedSession();
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
let recoveryIntent='reset',recoveryMode='reset',recoveryExpiresAt=0,lastCodeRequestAt=0,codeRequestBusy=false,recoveryTicker=null;
const recentCodeRequests=new Map(); // One active tab; never persist codes or passwords.
const resendWaitMs=90000;
const recoveryEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
function showDeliveryReceipt({confirmed=false,result=null,unknown=false}={}){
 const receipt=$('#recoveryDeliveryReceipt'),title=$('#recoveryReceiptTitle'),body=$('#recoveryReceiptText');
 if(!receipt||!title||!body)return;
 if(!confirmed&&!unknown){receipt.hidden=true;body.textContent='';return}
 receipt.hidden=false;
 const timestamp=new Date(result?.receiptAt||Date.now()).toLocaleTimeString([], {hour:'numeric',minute:'2-digit',second:'2-digit'});
 const target=result?.destination||result?.maskedDestination||'the selected recovery email';
 const expiry=result?.expiresAt?new Date(result.expiresAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}):'not provided';
 title.textContent=unknown?'Email request status: unconfirmed':'Email request status: accepted by backend';
 body.textContent=unknown
  ? 'At '+timestamp+', the browser could not confirm a response. An email might still arrive; sending another request may cause duplicate codes.'
  : 'Backend response received at '+timestamp+'. Destination: '+target+'. Code expires at '+expiry+
    '. This is a backend request receipt, not confirmation that an email reached Gmail.';
}

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
function showRecovery(intent='reset'){
 const priorEmail=recover?.open?$('#recoveryIdentifier').value.trim():$('#accountId').value.trim();
 recoveryIntent=intent==='signup'?'signup':'reset';
 recoveryId='';recoveryMode=recoveryIntent;recoveryExpiresAt=0;lastCodeRequestAt=0;codeRequestBusy=false;stopTicker();
 $('#recoveryIdentifier').value=priorEmail;
 $('#recoveryCodeInput').value='';$('#newPasswordInput').value='';$('#confirmNewPasswordInput').value='';
 $('#recoveryOption').replaceChildren();
 $('#recoveryRememberDevice').checked=$('#rememberDevice').checked;
 $('#recoveryRememberPassword').checked=$('#rememberPassword').checked;
 setVisible('newPasswordInput','recoveryToggleNewPassword',false,'new password');
 setVisible('confirmNewPasswordInput','recoveryToggleConfirmPassword',false,'password confirmation');
 $('#recoveryDialogTitle').textContent=recoveryIntent==='signup'?'Create your OurSpace account':'Reset your OurSpace password';
 $('#recoverySwitchMode').textContent=recoveryIntent==='signup'?'Already have an account? Reset password':'Need an account? Create one';
 $('#recoverySavePassword').textContent=recoveryIntent==='signup'?'Create account and sign in':'Reset password and sign in';
 recoveryStep('start');
 hint(recoveryIntent==='signup'
  ? 'Use your invited OurSpace email. An account is created only after you enter its emailed six-digit code and choose your password.'
  : 'Enter the email linked to your existing OurSpace account. A verified email code is required to reset its password.');
 rshow('');showDeliveryReceipt();updateCodeNotice();
 if(!recover.open)recover.showModal();
 $('#recoveryIdentifier').focus();
}
$('#forgotLink')?.addEventListener('click',e=>{e.preventDefault();showRecovery('reset')});
$('#createAccountLink')?.addEventListener('click',e=>{e.preventDefault();showRecovery('signup')});
$('#recoverySwitchMode')?.addEventListener('click',()=>showRecovery(recoveryIntent==='signup'?'reset':'signup'));
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
 if(lastCodeRequestAt&&Date.now()-lastCodeRequestAt<resendWaitMs){
  rshow('Please wait for the resend countdown before requesting another code.',true);return;
 }
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
  const receiptResult={...result,receiptAt:Date.now()};
  recentCodeRequests.set(recoveryMode+'|'+recoveryId,{at:lastCodeRequestAt,expiresAt:recoveryExpiresAt,confirmed:true,result:receiptResult});
  showDeliveryReceipt({confirmed:true,result:receiptResult});
  recoveryStep('code');startTicker();
  hint('Enter the emailed code for '+recoveryId+' and create your password. Avoid repeated resend requests.');
  rshow('Apps Script confirmed the email request. That does not confirm Gmail delivery; see the request receipt below.');
  $('#recoveryCodeInput').focus();
 }catch(err){
  if(err?.deliveryUnconfirmed){
   recentCodeRequests.set(recoveryMode+'|'+recoveryId,{at:lastCodeRequestAt,expiresAt:0,confirmed:false});
   showDeliveryReceipt({unknown:true});
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
 e.preventDefault();
 recoveryId=$('#recoveryIdentifier').value.trim().toLowerCase();
 if(!recoveryEmail(recoveryId))return rshow('Enter a valid account email address.',true);
 const btn=e.currentTarget.querySelector('[type="submit"]');btn.disabled=true;
 rshow('Checking account status with the backend…');
 try{
  const result=await auth.request('auth.recovery.options',{identifier:recoveryId},{timeout:45000});
  if(result?.found!==true&&result?.found!==false)throw new Error('The backend did not confirm account status.');
  const select=$('#recoveryOption');select.replaceChildren();
  if(recoveryIntent==='signup'){
   if(result.found)throw new Error('An account already exists for this email. Sign in or use Reset password instead.');
   recoveryMode='first-time';
   const option=document.createElement('option');
   option.value='first-time';option.textContent='Send verification email to '+recoveryId;select.append(option);
   hint('First-time registration: choose a password after your email code arrives. This does not overwrite an existing account.');
  }else{
   if(!result.found)throw new Error('No active account matches this email. Use Create account if this is your first sign-in.');
   recoveryMode='reset';
   const emails=(Array.isArray(result.options)?result.options:[]).filter(o=>o?.type==='email'&&o.optionId);
   if(!emails.length)throw new Error('This account has no email recovery destination. Contact the account administrator.');
   for(const item of emails){
    const option=document.createElement('option');option.value=String(item.optionId);
    option.textContent=String(item.label||'Email')+' · '+String(item.destination||'verified address');
    select.append(option);
   }
   hint('Password recovery: choose your verified email and request a six-digit security code.');
  }
  const previous=recentCodeRequests.get(recoveryMode+'|'+recoveryId);
  if(previous&&(previous.expiresAt>Date.now()||(!previous.confirmed&&Date.now()-previous.at<resendWaitMs))){
   lastCodeRequestAt=previous.at;recoveryExpiresAt=previous.expiresAt;
   recoveryStep('code');startTicker();
   if(previous.confirmed){
    showDeliveryReceipt({confirmed:true,result:previous.result});
    rshow('You already requested a code for this account. Enter it here, or use Send another code after the countdown.');
   }else{
    showDeliveryReceipt({unknown:true});
    rshow('The earlier request could not be confirmed. Check for the code before requesting another.',true);
   }
   $('#recoveryCodeInput').focus();
  }else{
   lastCodeRequestAt=0;recoveryExpiresAt=0;showDeliveryReceipt();
   recoveryStep('choose');
   rshow('No email has been requested yet. Select Send verification code to send one.');
  }
 }catch(err){
  recoveryStep('start');
  rshow(err.message||'Could not check the account status.',true);
 }finally{btn.disabled=false}
});
$('#recoveryChoose')?.addEventListener('submit',async e=>{
 e.preventDefault();
 await issueRecoveryCode();
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
  recentCodeRequests.delete(recoveryMode+'|'+recoveryId);
  stopTicker();recover.close();
  show(recoveryMode==='first-time'?'Account created and signed in.':'Password reset and signed in.');
  goProfile(session.profile);
 }catch(err){
  if(passwordSaved){
   recentCodeRequests.delete(recoveryMode+'|'+recoveryId);
   $('#accountId').value=recoveryId;$('#password').value='';
   $('#rememberDevice').checked=rememberDevice;
   $('#rememberPassword').checked=$('#recoveryRememberPassword').checked;
   await rememberRecoveryPassword(recoveryId,password);
   stopTicker();recover.close();
   show(recoveryMode==='first-time'?'Your account was created. Sign in using your new password.':'Your password was reset. Sign in using your new password.',false);
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
