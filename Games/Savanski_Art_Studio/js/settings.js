(function(global){
'use strict';
const $=(q,r=document)=>r.querySelector(q);
const $$=(q,r=document)=>Array.from(r.querySelectorAll(q));
const B=global.SavanskiBackend;
if(!B)return;
const state={signedIn:false,user:null,storage:null,pricing:null,contract:null,auth:null,actions:new Set(),anchor:null,installPrompt:null,installEligible:true,installed:false};
const REMEMBERED_ID='savanski.rememberedIdentifier';
const PENDING_STORAGE='savanski.pendingStoragePurchase';
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function money(v){return '$'+Number(v||0).toFixed(2)}
function gib(bytes){return Number(bytes||0)/(1024*1024*1024)}
function bytesLabel(bytes){const n=Number(bytes||0);if(!isFinite(n)||n<=0)return '0 B';if(n>=1073741824)return (n/1073741824).toFixed(n>=10737418240?1:2)+' GiB';if(n>=1048576)return (n/1048576).toFixed(1)+' MiB';if(n>=1024)return (n/1024).toFixed(1)+' KiB';return n+' B'}
function setStatus(message,type=''){const el=$('#savSettingsStatus');if(!el)return;el.textContent=message||'';el.dataset.state=type}
function busy(button,on,label){if(!button)return;button.disabled=!!on;if(on){button.dataset.oldText=button.textContent;button.textContent=label||'Working…'}else if(button.dataset.oldText){button.textContent=button.dataset.oldText;delete button.dataset.oldText}}
function rememberIdentifier(value,remember){try{if(remember&&value)localStorage.setItem(REMEMBERED_ID,value);else if(!remember)localStorage.removeItem(REMEMBERED_ID)}catch(_){}}
function rememberedIdentifier(){try{return localStorage.getItem(REMEMBERED_ID)||''}catch(_){return ''}}
function addButtons(){
  const head=$('.studio-header-actions');
  if(head&&!$('#settingsBtn')){
    const b=document.createElement('button');b.id='settingsBtn';b.type='button';b.className='studio-header-icon';b.title='Account, storage, and settings';b.setAttribute('aria-label','Savanski settings');b.textContent='⚙';
    head.insertBefore(b,$('#themeBtn',head)||head.firstChild);
  }
  const top=$('#launcher .launcher-top');
  if(top&&!$('#launcherSettingsBtn')){
    let b=$$('button.icon-button',top).find(x=>x.textContent.trim()==='⚙');
    if(!b){b=document.createElement('button');b.type='button';b.className='icon-button sav-settings-launcher-button';b.textContent='⚙'}
    b.id='launcherSettingsBtn';b.title='Account, storage, and settings';b.setAttribute('aria-label','Savanski settings');b.classList.add('sav-settings-launcher-button');
    const theme=$('.theme-toggle',top);if(theme)top.insertBefore(b,theme);else top.appendChild(b);
  }
}
function panelHtml(){return `
<section class="sav-settings-window" id="savanskiSettingsWindow" aria-label="Savanski settings" hidden>
  <div class="sav-panel-head" id="savSettingsHead"><span class="sav-panel-icon">⚙</span><strong>Savanski Settings</strong><span class="sav-panel-actions"><button id="savSettingsClose" type="button" aria-label="Close settings">×</button></span></div>
  <div class="sav-settings-scroll">
    <div class="sav-settings-status" id="savSettingsStatus" role="status">Connecting to Savanski…</div>

    <section class="sav-section" id="savSettingsSignedOut">
      <h3>Sign In</h3>
      <form class="sav-settings-form" id="savSigninForm">
        <label class="sav-field"><span>Username, email, or phone</span><input id="savSigninIdentifier" name="username" autocomplete="username" required type="text"></label>
        <label class="sav-field"><span>Password</span><input id="savSigninPassword" name="password" autocomplete="current-password" required type="password"></label>
        <div class="sav-settings-two">
          <label class="sav-settings-check"><input id="savSigninRemember" type="checkbox"> Remember password / sign-in on this device</label>
          <label class="sav-settings-check"><input data-show-password="#savSigninPassword" type="checkbox"> Show password</label>
        </div>
        <p class="sav-settings-note">Savanski remembers the session token when selected. The password itself is left to your browser/password manager through standard password autocomplete.</p>
        <button class="sav-btn" id="savSigninBtn" type="submit">Sign In</button>
      </form>

      <details id="savSignupDetails"><summary>Create Account / Sign Up</summary><div class="sav-settings-details-body">
        <form class="sav-settings-form" id="savSignupForm">
          <div class="sav-settings-two"><label class="sav-field"><span>Username</span><input id="savSignupUsername" name="username" autocomplete="username" minlength="6" maxlength="20" pattern="[A-Za-z0-9._-]{6,20}" title="6–20 characters: letters, numbers, dots, underscores, or hyphens" required type="text"></label><label class="sav-field"><span>Display name</span><input id="savSignupDisplay" name="name" autocomplete="name" type="text"></label></div>
          <div class="sav-settings-two"><label class="sav-field"><span>Email</span><input id="savSignupEmail" name="email" autocomplete="email" type="email"></label><label class="sav-field"><span>Phone</span><input id="savSignupPhone" name="tel" autocomplete="tel" type="tel"></label></div>
          <p class="sav-settings-note">The tested backend requires at least one contact method: email or phone. Password fields use standard browser autocomplete so your browser/password manager can offer to remember them without Savanski storing plaintext passwords.</p>
          <div class="sav-settings-two"><label class="sav-field"><span>Password</span><input id="savSignupPassword" name="password" autocomplete="new-password" minlength="10" maxlength="128" required type="password"></label><label class="sav-field"><span>Confirm password</span><input id="savSignupPassword2" name="password-confirm" autocomplete="new-password" minlength="10" maxlength="128" required type="password"></label></div>
          <div class="sav-settings-two"><label class="sav-settings-check"><input id="savSignupRemember" type="checkbox"> Remember password / sign-in</label><label class="sav-settings-check"><input data-show-password="#savSignupPassword,#savSignupPassword2" type="checkbox"> Show passwords</label></div>
          <button class="sav-btn" id="savSignupBtn" type="submit">Create Account</button>
        </form>
      </div></details>

      <details id="savRecoveryDetails"><summary>Forgot Password</summary><div class="sav-settings-details-body">
        <form class="sav-settings-form" id="savRecoveryForm">
          <label class="sav-field"><span>Username, email, or phone</span><input id="savRecoveryIdentifier" autocomplete="username" required type="text"></label>
          <button class="sav-btn" id="savGetCodeBtn" type="button">Get Verification Code</button>
          <label class="sav-field"><span>6-digit verification code</span><input id="savRecoveryCode" autocomplete="one-time-code" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" type="text"></label>
          <div class="sav-settings-two"><label class="sav-field"><span>New password</span><input id="savRecoveryPassword" autocomplete="new-password" minlength="10" type="password"></label><label class="sav-field"><span>Confirm new password</span><input id="savRecoveryPassword2" autocomplete="new-password" minlength="10" type="password"></label></div>
          <label class="sav-settings-check"><input data-show-password="#savRecoveryPassword,#savRecoveryPassword2" type="checkbox"> Show new password</label>
          <button class="sav-btn" id="savResetPasswordBtn" type="submit">Enter Code & Reset Password</button>
          <p class="sav-settings-note" id="savRecoverySupport">Password recovery activates only when the connected backend advertises verification-code recovery routes.</p>
        </form>
      </div></details>
    </section>

    <section class="sav-section sav-settings-hidden" id="savSettingsSignedIn">
      <h3>Account</h3>
      <div class="sav-settings-account-card"><strong id="savAccountName">Signed in</strong><span id="savAccountContact"></span></div>
      <div class="sav-settings-inline-actions"><button class="sav-btn" id="savRefreshAccount" type="button">Refresh Account</button><button class="sav-btn" id="savSignoutBtn" type="button">Sign Out</button></div>
      <details><summary>Change Password</summary><div class="sav-settings-details-body"><form class="sav-settings-form" id="savChangePasswordForm"><label class="sav-field"><span>Current password</span><input id="savCurrentPassword" autocomplete="current-password" required type="password"></label><div class="sav-settings-two"><label class="sav-field"><span>New password</span><input id="savNewPassword" autocomplete="new-password" minlength="10" required type="password"></label><label class="sav-field"><span>Confirm new password</span><input id="savNewPassword2" autocomplete="new-password" minlength="10" required type="password"></label></div><label class="sav-settings-check"><input data-show-password="#savCurrentPassword,#savNewPassword,#savNewPassword2" type="checkbox"> Show passwords</label><button class="sav-btn" type="submit">Change Password</button></form></div></details>
      <button class="sav-btn sav-settings-danger" id="savSignoutAllBtn" type="button">Sign Out on All Devices</button>
    </section>

    <section class="sav-section" id="savInstallSection">
      <h3>Install Savanski</h3>
      <div class="sav-settings-two"><div class="sav-settings-stat">Browser app<br><strong id="savInstallState">Checking…</strong></div><div class="sav-settings-stat">Storage mode<br><strong id="savInstallStorageMode">Device only</strong></div></div>
      <button class="sav-btn" id="savInstallAppBtn" type="button">Install / Add App Icon</button>
      <p class="sav-settings-note" id="savInstallNote">Uses the bundled Savanski app manifest and icons. When the browser does not expose an install prompt, use its Install App / Add to Home Screen command.</p>
    </section>

    <section class="sav-section" id="savStorageSection">
      <h3>Cloud Storage</h3>
      <div class="sav-settings-storage-readout"><div class="sav-settings-stat">Plan / quota<br><strong id="savStorageQuota">Device only</strong></div><div class="sav-settings-stat">Used<br><strong id="savStorageUsed">0 B</strong></div></div>
      <div class="sav-settings-meter" aria-label="Cloud storage used"><span id="savStorageMeter"></span></div>
      <p class="sav-settings-note" id="savStorageNote">Sign in to attach cloud storage to an account.</p>
      <label class="sav-field"><span>Purchase storage amount</span><select id="savStorageSelect"></select></label>
      <div class="sav-settings-price"><span id="savStorageSelectionLabel">Add storage</span><strong id="savStoragePrice">—</strong></div>
      <button class="sav-btn sav-settings-pay" id="savStoragePayBtn" type="button">Pay Now with Stripe</button>
      <p class="sav-settings-note">Stripe opens in a new tab. Pay the amount shown above. The current backend uses an admin-approved payment claim before cloud quota becomes active.</p>
      <details><summary>Submit Stripe Payment Reference</summary><div class="sav-settings-details-body"><label class="sav-field"><span>Payment / receipt reference</span><input id="savPaymentReference" autocomplete="off" placeholder="Stripe payment or receipt reference" type="text"></label><button class="sav-btn" id="savSubmitClaimBtn" type="button">Submit Storage Claim</button><div class="sav-settings-note" id="savDonationHistory"></div></div></details>
    </section>
  </div>
</section>`}
function ensurePanel(){if($('#savanskiSettingsWindow'))return;document.body.insertAdjacentHTML('beforeend',panelHtml())}
function selectedStorage(){const el=$('#savStorageSelect');const amount=Number(el?.value||0);const max=Number(state.pricing?.maxStorageGiB||30),full=Number(state.pricing?.fullStoragePriceUsd||130);const raw=amount*full/max;const price=Math.ceil((raw-1e-9)*100)/100;return {gib:amount,usd:Math.min(full,price)}}
function populateStorageOptions(){const sel=$('#savStorageSelect');if(!sel)return;const options=state.pricing?.selectableStorageGiB||Array.from({length:Math.max(1,Math.min(30,Number(state.pricing?.maxStorageGiB||30)))},(_,i)=>i+1);const old=Number(sel.value||10);const max=Number(state.pricing?.maxStorageGiB||30),full=Number(state.pricing?.fullStoragePriceUsd||130);sel.innerHTML=options.map(n=>{const raw=Number(n)*full/max,usd=Math.min(full,Math.ceil((raw-1e-9)*100)/100);return `<option value="${Number(n)}">${Number(n)} GiB — ${money(usd)}</option>`}).join('');sel.value=String(options.includes(old)?old:(options.includes(10)?10:options[0]));updateStoragePrice()}
function updateStoragePrice(){const {gib:g,usd}=selectedStorage();$('#savStorageSelectionLabel').textContent=`Add ${g||0} GiB`;$('#savStoragePrice').textContent=g?money(usd):'—'}
function render(){
  const out=$('#savSettingsSignedOut'),inn=$('#savSettingsSignedIn');out?.classList.toggle('sav-settings-hidden',state.signedIn);inn?.classList.toggle('sav-settings-hidden',!state.signedIn);
  if(state.signedIn&&state.user){$('#savAccountName').textContent=state.user.displayName||state.user.username||'Savanski account';const contact=[state.user.username,state.user.email,state.user.phone].filter(Boolean).join(' · ');$('#savAccountContact').textContent=contact}
  const st=state.storage;const quota=Number(st?.quotaBytes||0),used=Number(st?.usedBytes||0);$('#savStorageQuota').textContent=state.signedIn?bytesLabel(quota):'Device only';$('#savStorageUsed').textContent=state.signedIn?bytesLabel(used):'0 B';const pct=quota>0?Math.min(100,used/quota*100):0;$('#savStorageMeter').style.width=pct+'%';
  $('#savStorageNote').textContent=state.signedIn?(quota>0?`${bytesLabel(Math.max(0,quota-used))} remaining. Account metadata sync stays available even when cloud file quota is full.`:'Account sync is active. Purchase storage to enable cloud project/assets/exports quota.'):'Guest projects stay on this device. Sign in before purchasing storage so the payment claim can attach to your account.';
  $('#savStoragePayBtn').disabled=!state.signedIn||!state.contract?.donation?.url;$('#savSubmitClaimBtn').disabled=!state.signedIn;
  populateStorageOptions();
}
function renderInstall(){
  const btn=$('#savInstallAppBtn'),stateEl=$('#savInstallState'),modeEl=$('#savInstallStorageMode'),note=$('#savInstallNote');if(!btn)return;
  const standalone=global.matchMedia?.('(display-mode: standalone)')?.matches||global.navigator?.standalone===true||state.installed;
  if(standalone){state.installed=true;btn.disabled=true;btn.textContent='Installed';if(stateEl)stateEl.textContent='Installed';if(note)note.textContent='Savanski is running as an installed browser app.'}
  else if(state.installPrompt){btn.disabled=false;btn.textContent='Install Savanski App';if(stateEl)stateEl.textContent='Ready to install'}
  else{btn.disabled=false;btn.textContent='Install / Add App Icon';if(stateEl)stateEl.textContent='Use browser install command';}
  if(modeEl)modeEl.textContent=state.signedIn?'Account sync':'Device only';
}
async function refreshInstallEligibility(){
  try{if(state.actions.has('pwa.install.eligible')){const c=B.context||{},out=await B.get('pwa.install.eligible',{sessionToken:c.sessionToken||'',deviceId:c.deviceId||''});state.installEligible=out?.eligible!==false}}catch(_){state.installEligible=true}renderInstall();
}
async function installApp(){
  if(state.installed)return;
  if(state.installPrompt){const prompt=state.installPrompt;state.installPrompt=null;try{await prompt.prompt();const choice=await prompt.userChoice;if(choice?.outcome==='accepted'){state.installed=true;setStatus('Savanski installation accepted.','ok');try{if(state.actions.has('pwa.install.record')){const c=B.context||{};await B.post('pwa.install.record',{sessionToken:c.sessionToken||'',deviceId:c.deviceId||'',platform:navigator.platform||navigator.userAgentData?.platform||'',displayMode:'standalone',metadata:{source:'settings'}})}}catch(_){}}else setStatus('Installation was canceled.','');}catch(e){setStatus('Browser installation prompt failed: '+e.message,'error')}finally{renderInstall()}return}
  setStatus('Your browser did not expose an automatic install prompt. Use its Install App or Add to Home Screen command; the bundled Savanski manifest and icons are ready for supported browsers.','ok');
}

async function refreshAll({quiet=false}={}){
  try{
    const tasks=[B.get('actions').catch(()=>({actions:[]})),B.authConfig().catch(()=>null),B.storagePricing().catch(()=>null),B.storageContract().catch(()=>null),B.bootstrap().catch(()=>({signedIn:false}))];
    const [actions,auth,pricing,contract,boot]=await Promise.all(tasks);state.actions=new Set(actions?.actions||[]);state.auth=auth||state.auth;state.pricing=pricing||state.pricing;state.contract=contract||state.contract;state.signedIn=!!boot?.signedIn;state.user=boot?.user||null;state.storage=boot?.storage||null;
    const recoveryAvailable=state.actions.has('auth.password.forgot')&&state.actions.has('auth.password.reset');$('#savGetCodeBtn').disabled=!recoveryAvailable;$('#savResetPasswordBtn').disabled=!recoveryAvailable;$('#savRecoverySupport').textContent=recoveryAvailable?'Use Get Verification Code, enter the code you receive, then choose a new password.':'The tested Savanski Backend v3.0.1 does not expose forgotten-password verification-code/reset routes. These controls are disabled rather than pretending a code was sent.';
    render();renderInstall();refreshInstallEligibility();if(!quiet)setStatus(state.signedIn?`Signed in as ${state.user?.username||state.user?.displayName||'account'}.`:'Guest mode: projects remain device-local until you sign in.','ok');
    if(state.signedIn)loadDonationHistory();
  }catch(e){render();if(!quiet)setStatus(e.message,'error')}
}
function open(anchor){state.anchor=anchor||state.anchor;const panel=$('#savanskiSettingsWindow');panel.hidden=false;$$('#settingsBtn,#launcherSettingsBtn').forEach(b=>b.setAttribute('aria-expanded','true'));panel.style.visibility='hidden';requestAnimationFrame(()=>{const a=state.anchor?.getBoundingClientRect?.();const r=panel.getBoundingClientRect();let left=Math.max(6,window.innerWidth-r.width-10),top=66;if(a){left=Math.min(Math.max(6,a.right-r.width),Math.max(6,window.innerWidth-r.width-6));top=Math.min(Math.max(6,a.bottom+6),Math.max(6,window.innerHeight-r.height-6))}panel.style.left=left+'px';panel.style.top=top+'px';panel.style.visibility='visible'});refreshAll({quiet:false})}
function close(){const p=$('#savanskiSettingsWindow');if(p)p.hidden=true;$$('#settingsBtn,#launcherSettingsBtn').forEach(b=>b.setAttribute('aria-expanded','false'))}
function bindDrag(){const panel=$('#savanskiSettingsWindow'),head=$('#savSettingsHead');if(!panel||!head)return;head.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=panel.getBoundingClientRect(),sx=e.clientX,sy=e.clientY;head.setPointerCapture?.(e.pointerId);const move=ev=>{panel.style.left=Math.min(Math.max(0,r.left+ev.clientX-sx),Math.max(0,innerWidth-panel.offsetWidth))+'px';panel.style.top=Math.min(Math.max(0,r.top+ev.clientY-sy),Math.max(0,innerHeight-panel.offsetHeight))+'px'};const up=ev=>{head.releasePointerCapture?.(ev.pointerId);head.removeEventListener('pointermove',move);head.removeEventListener('pointerup',up);head.removeEventListener('pointercancel',up)};head.addEventListener('pointermove',move);head.addEventListener('pointerup',up);head.addEventListener('pointercancel',up)})}
async function loadDonationHistory(){try{const out=await B.donationList();const items=out.items||[];state.storage=out.storage||state.storage;const el=$('#savDonationHistory');if(el)el.textContent=items.length?items.slice(-4).reverse().map(x=>`${money(x.claimedUsd)} · ${x.status}${x.approvedUsd?` · approved ${money(x.approvedUsd)}`:''}`).join(' | '):'No storage claims yet.';render()}catch(_){}}
function bind(){
  document.addEventListener('click',e=>{const b=e.target.closest('#settingsBtn,#launcherSettingsBtn');if(b){e.preventDefault();e.stopPropagation();open(b)}});
  $('#savSettingsClose').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#savanskiSettingsWindow').hidden)close()});
  $$('[data-show-password]').forEach(c=>c.addEventListener('change',()=>{const type=c.checked?'text':'password';$$(c.dataset.showPassword).forEach(i=>i.type=type)}));
  $('#savStorageSelect').addEventListener('change',updateStoragePrice);
  $('#savSigninForm').addEventListener('submit',async e=>{e.preventDefault();const btn=$('#savSigninBtn'),identifier=$('#savSigninIdentifier').value.trim(),password=$('#savSigninPassword').value,remember=$('#savSigninRemember').checked;try{busy(btn,true,'Signing in…');setStatus('Signing in…');const out=await B.signIn({identifier,password,rememberThisDevice:remember});rememberIdentifier(identifier,remember);state.signedIn=true;state.user=out.user;state.storage=out.storage;render();setStatus(`Signed in as ${out.user?.username||identifier}.`,'ok');global.dispatchEvent(new CustomEvent('savanski:account-changed',{detail:out}));loadDonationHistory()}catch(err){setStatus(err.message,'error')}finally{busy(btn,false)}});
  $('#savSignupForm').addEventListener('submit',async e=>{e.preventDefault();const btn=$('#savSignupBtn'),username=$('#savSignupUsername').value.trim(),displayName=$('#savSignupDisplay').value.trim(),email=$('#savSignupEmail').value.trim(),phone=$('#savSignupPhone').value.trim(),password=$('#savSignupPassword').value,confirm=$('#savSignupPassword2').value,remember=$('#savSignupRemember').checked;if(!email&&!phone){setStatus('Enter an email address or phone number.','error');return}if(password!==confirm){setStatus('The two passwords do not match.','error');return}try{busy(btn,true,'Creating…');setStatus('Creating account…');const out=await B.signUp({username,displayName,email,phone,password,rememberThisDevice:remember});rememberIdentifier(username,remember);state.signedIn=true;state.user=out.user;state.storage=out.storage;render();setStatus(`Account created. Signed in as ${out.user?.username||username}.`,'ok');global.dispatchEvent(new CustomEvent('savanski:account-changed',{detail:out}))}catch(err){setStatus(err.message,'error')}finally{busy(btn,false)}});
  $('#savGetCodeBtn').addEventListener('click',async()=>{const b=$('#savGetCodeBtn'),identifier=$('#savRecoveryIdentifier').value.trim();if(!identifier){setStatus('Enter your username, email, or phone first.','error');return}try{busy(b,true,'Sending…');const out=await B.forgotPassword(identifier);setStatus(out.message||'If the account has an email address, a verification code has been sent.','ok')}catch(err){setStatus(err.message,'error')}finally{busy(b,false)}});
  $('#savRecoveryForm').addEventListener('submit',async e=>{e.preventDefault();const b=$('#savResetPasswordBtn'),identifier=$('#savRecoveryIdentifier').value.trim(),code=$('#savRecoveryCode').value.trim(),password=$('#savRecoveryPassword').value,confirm=$('#savRecoveryPassword2').value;if(password!==confirm){setStatus('The two new passwords do not match.','error');return}try{busy(b,true,'Resetting…');const out=await B.resetPassword(identifier,code,password);B.clearSession();setStatus(out.message||'Password reset. Sign in with the new password.','ok');$('#savSigninIdentifier').value=identifier;$('#savSigninPassword').value='';$('#savRecoveryCode').value='';$('#savRecoveryPassword').value='';$('#savRecoveryPassword2').value=''}catch(err){setStatus(err.message,'error')}finally{busy(b,false)}});
  $('#savChangePasswordForm').addEventListener('submit',async e=>{e.preventDefault();const b=e.submitter,current=$('#savCurrentPassword').value,next=$('#savNewPassword').value,confirm=$('#savNewPassword2').value;if(next!==confirm){setStatus('The two new passwords do not match.','error');return}try{busy(b,true,'Changing…');await B.changePassword(current,next);e.currentTarget.reset();setStatus('Password changed.','ok')}catch(err){setStatus(err.message,'error')}finally{busy(b,false)}});
  $('#savSignoutBtn').addEventListener('click',async()=>{try{await B.signOut()}catch(_){}state.signedIn=false;state.user=null;state.storage=null;render();setStatus('Signed out. Guest projects remain on this device.','ok');global.dispatchEvent(new CustomEvent('savanski:account-changed',{detail:{signedIn:false}}))});
  $('#savSignoutAllBtn').addEventListener('click',async()=>{if(!confirm('Sign out of Savanski on all devices?'))return;try{await B.signOutAll();state.signedIn=false;state.user=null;state.storage=null;render();setStatus('Signed out on all devices.','ok')}catch(err){setStatus(err.message,'error')}});
  $('#savRefreshAccount').addEventListener('click',()=>refreshAll({quiet:false}));
  $('#savStoragePayBtn').addEventListener('click',()=>{if(!state.signedIn){setStatus('Sign in before purchasing storage.','error');return}const {gib:g,usd}=selectedStorage(),url=state.contract?.donation?.url||state.storage?.donationUrl||state.pricing?.donationUrl;if(!url){setStatus('Stripe payment link is unavailable from the backend.','error');return}try{localStorage.setItem(PENDING_STORAGE,JSON.stringify({gib:g,usd,at:new Date().toISOString()}))}catch(_){}setStatus(`Opening Stripe. Pay ${money(usd)} for ${g} GiB of storage credit, then return here to submit the payment reference.`,'ok');(()=>{const w=window.open(url,'_blank','noopener,noreferrer');if(w)w.opener=null;return w})()});
  $('#savSubmitClaimBtn').addEventListener('click',async()=>{if(!state.signedIn){setStatus('Sign in before submitting a storage claim.','error');return}const ref=$('#savPaymentReference').value.trim(),sel=selectedStorage();if(!ref){setStatus('Enter the Stripe payment or receipt reference.','error');return}const b=$('#savSubmitClaimBtn');try{busy(b,true,'Submitting…');const out=await B.donationClaim(Number(sel.usd.toFixed(2)),ref,`Requested storage: ${sel.gib} GiB`);$('#savPaymentReference').value='';setStatus(`Storage claim submitted for ${money(sel.usd)}. It is pending backend approval.`,'ok');loadDonationHistory();return out}catch(err){setStatus(err.message,'error')}finally{busy(b,false)}});
  $('#savInstallAppBtn')?.addEventListener('click',installApp);
  global.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.installPrompt=e;renderInstall()});
  global.addEventListener('appinstalled',()=>{state.installed=true;state.installPrompt=null;renderInstall();setStatus('Savanski installed.','ok')});
  global.addEventListener('savanski:backend-context',()=>refreshAll({quiet:true}));
}
function init(){addButtons();ensurePanel();bindDrag();bind();const remembered=rememberedIdentifier();if(remembered){$('#savSigninIdentifier').value=remembered;$('#savRecoveryIdentifier').value=remembered;$('#savSigninRemember').checked=true}refreshAll({quiet:true}).then(()=>setStatus(state.signedIn?`Signed in as ${state.user?.username||'account'}.`:'Guest mode: projects remain device-local until you sign in.','ok'))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
global.SavanskiSettings={open:()=>open($('#settingsBtn')||$('#launcherSettingsBtn')),close,refresh:()=>refreshAll({quiet:false})};
})(window);
