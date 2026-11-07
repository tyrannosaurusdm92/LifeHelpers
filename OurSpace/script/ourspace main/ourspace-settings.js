/* OurSpace ⚙ master-nav Settings — user-owned notifications, recovery and PWA.
 * No SMS/paid routing. Only the backend can verify an email and persist subscriptions.
 * No guest/admin preview writes, no service-account secrets in the browser. */
(() => {'use strict';
const CATALOG = [{"code":"01","key":"call","name":"Calls / missed calls","emoji":"📞"},{"code":"02","key":"generic","name":"General notification","emoji":"🔔"},{"code":"03","key":"quick","name":"Quick Chat","emoji":"⚡"},{"code":"04","key":"chat","name":"Chats","emoji":"🗨️"},{"code":"05","key":"room","name":"Rooms","emoji":"🏰"},{"code":"06","key":"pin","name":"Pinned messages","emoji":"📌"},{"code":"07","key":"calendar","name":"Calendar / tasks / appointments","emoji":"📆"},{"code":"08","key":"onyx-writing","name":"Onyx writing","emoji":"📝"},{"code":"09","key":"onyx-thinking","name":"Onyx thinking","emoji":"💭"},{"code":"10","key":"onyx-replied","name":"Onyx responded","emoji":"💬"},{"code":"11","key":"onyx-important","name":"Onyx important alert","emoji":"📢"},{"code":"12","key":"onyx-pet","name":"Onyx pet alerts","emoji":"🐈‍⬛"},{"code":"13","key":"onyx-care","name":"Onyx care","emoji":"💚"},{"code":"14","key":"therapy","name":"Therapy","emoji":"🧠"},{"code":"15","key":"purchase","name":"Purchase","emoji":"🛍️"},{"code":"16","key":"share","name":"Shared link or media","emoji":"🔗"},{"code":"17","key":"voice","name":"Voice messages","emoji":"🎤"},{"code":"18","key":"selfcare","name":"Self care","emoji":"🌿"}];
const PRESETS = {all:CATALOG.map(x=>x.code),most:['01','02','03','04','05','06','07','10','11','12','13','14','15','16','17','18'],partial:['01','03','04','07','10','11','14','18'],highlights:['01','04','07','11']};
const VALID = new Set(CATALOG.map(x=>x.code));
const $=s=>document.querySelector(s);
const auth=()=>window.OurSpaceAuth;
const pwa=()=>window.OurSpacePWA;
const who=document.documentElement.dataset.profile;
if(!['william','jasper'].includes(who)||!$('#masterNav'))return;
const allowed=()=>auth()?.isAuthenticated?.()&&!auth()?.isAdmin?.()&&auth()?.profile?.()===who;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active=false,collapsed=false,currentTab='alerts',settings=null,positions={x:null,y:null,w:null,h:null};
let emailChallenge='',addChallenge='',emailStage='none',pendingEmail='';
let codes={email:new Set(PRESETS.all),app:new Set(PRESETS.all)},modes={email:'all',app:'all'},lastState=null;
const panel=document.createElement('section');panel.id='osSettingsPanel';panel.hidden=true;
panel.className='os-settings-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','OurSpace account and alert settings');
panel.dataset.designGroup='OurSpace Settings';panel.dataset.designKind='surface';panel.dataset.designTarget='master-settings';
panel.innerHTML=`<header class="os-settings-title" id="osSettingsDrag"><strong>⚙️ OurSpace Settings</strong><div class="os-settings-window-controls"><button type="button" id="osSettingsReduce" title="Reduce or expand" aria-label="Reduce or expand Settings">−</button><button type="button" id="osSettingsClose" aria-label="Close Settings">×</button></div></header>
 <div class="os-settings-content">
  <nav class="os-settings-tabs" aria-label="Settings sections"><button type="button" data-os-settings-tab="alerts" aria-selected="true">🔔 Alerts</button><button type="button" data-os-settings-tab="account" aria-selected="false">✉️ Account</button></nav>
  <div id="osSettingsAlerts" class="os-settings-section">
   <p>Notifications inside OurSpace retain their emojis. Installed-app push uses categories <b>01–18</b>, with a device-dependent unread-count badge.</p>
   <div class="os-settings-icon-preview"><img src="../../assets/images/app/ourspace-app-192.png" alt="Installed OurSpace app icon preview"><output id="osSettingsIconCode" aria-label="Current notification category">—</output><span>App icon preview · numeric codes rotate here while OurSpace is open</span></div>
   <div class="os-settings-preset-groups">
    ${['email','app'].map(channel=>`<fieldset class="os-settings-preset" data-os-channel="${channel}"><legend>${channel==='email'?'✉️ Email alerts':'📱 Installed-app alerts'}</legend><div class="os-settings-preset-buttons">${Object.keys(PRESETS).map(mode=>`<button type="button" data-os-preset="${mode}" data-os-channel="${channel}" aria-pressed="${mode==='all'}">${mode[0].toUpperCase()+mode.slice(1)}</button>`).join('')}</div></fieldset>`).join('')}
   </div>
   <p class="os-settings-muted">Use either preset, then individually check or uncheck categories. Email and app selections are independent.</p>
   <div class="os-settings-code-list" id="osSettingsCodeList" role="group" aria-label="18 individual alert types">
    <div class="os-settings-code-header"><span>Notification type</span><span>Email</span><span>App</span></div>
    ${CATALOG.map(x=>`<div class="os-settings-code-row" data-os-code="${x.code}"><label for="osEmailCode${x.code}"><code>${x.code}</code> <span aria-hidden="true">${x.emoji}</span> ${escape(x.name)}</label><input id="osEmailCode${x.code}" type="checkbox" data-os-alert-channel="email" data-os-alert-code="${x.code}" checked aria-label="Email ${escape(x.name)}"><input id="osAppCode${x.code}" type="checkbox" data-os-alert-channel="app" data-os-alert-code="${x.code}" checked aria-label="App ${escape(x.name)}"></div>`).join('')}
   </div>
   <div class="os-settings-actions"><button type="button" id="osSettingsSave">Save notification selections</button><button type="button" id="osSettingsSubscribeApp">Enable app push notifications</button><button type="button" id="osSettingsUnsubscribeApp">Disable app push on this device</button></div>
   <p class="os-settings-muted" id="osSettingsDeviceStatus"></p>
  </div>
  <div id="osSettingsAccount" class="os-settings-section" hidden>
   <h3>Verified email addresses</h3><p>Add up to five email addresses per account, including the primary address. Each new address needs a six-digit verification code.</p>
   <div id="osSettingsEmails" class="os-settings-email-list"></div>
   <form id="osSettingsAddEmail"><label>New recovery email<input required type="email" name="email" autocomplete="email" placeholder="address@example.com"></label><button type="submit">Send new-email code</button></form>
   <form id="osSettingsAddEmailConfirm" hidden><label>Code for new recovery email<input required name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code"></label><button type="submit">Verify and add email</button><button type="button" id="osSettingsAddResend">Resend code</button></form>
   <hr><h3>Subscribe to email notifications</h3><form id="osSettingsEmailRequest"><label>Choose your OurSpace email<select id="osSettingsEmailSelect" name="email" required></select></label><button type="submit">Subscribe / request code</button></form>
   <form id="osSettingsEmailVerify" hidden><label>Six-digit notification code<input name="code" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required></label><button type="submit">Verify email alerts</button><button type="button" id="osSettingsEmailResend">Request new code</button></form>
   <hr><h3>Change password</h3><form id="osSettingsPassword"><label>Current password<input type="password" name="currentPassword" autocomplete="current-password" required></label><label>New password<input type="password" name="newPassword" minlength="8" autocomplete="new-password" required></label><button type="submit">Change password</button></form>
  </div>
  <p class="os-settings-feedback" id="osSettingsStatus" role="status" aria-live="polite"></p>
 </div><div class="os-settings-resize" id="osSettingsResize" role="separator" title="Resize Settings" aria-label="Resize Settings"></div>`;
document.body.append(panel);
const btn=$('#osOpenSettings');if(!btn)return;
function status(msg,error=false){const el=$('#osSettingsStatus');el.textContent=String(msg||'');el.dataset.error=String(error);}
function requireLogin(){if(!allowed())throw new Error('Sign in to your own OurSpace account to change settings. Admin preview cannot change account data.');}
async function call(action,data){requireLogin();return auth().request(action,data||{});}
function toggle(open){active=!!open;panel.hidden=!active;btn.setAttribute('aria-expanded',String(active));if(active){switchTab(currentTab);load().catch(err=>status(err.message,true));$('#osSettingsClose').focus();}else btn.focus();}
btn.addEventListener('click',()=>toggle(!active));$('#osSettingsClose').addEventListener('click',()=>toggle(false));
document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'&&panel.contains(document.activeElement))toggle(false)});
function switchTab(t){currentTab=t;for(const tab of panel.querySelectorAll('[data-os-settings-tab]'))tab.setAttribute('aria-selected',String(tab.dataset.osSettingsTab===t));$('#osSettingsAlerts').hidden=t!=='alerts';$('#osSettingsAccount').hidden=t!=='account';}
panel.querySelectorAll('[data-os-settings-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.osSettingsTab)));
$('#osSettingsReduce').addEventListener('click',()=>{collapsed=!collapsed;panel.classList.toggle('os-settings-reduced',collapsed);$('#osSettingsReduce').textContent=collapsed?'+':'−';$('#osSettingsReduce').setAttribute('aria-label',collapsed?'Expand Settings':'Reduce Settings')});
function drag(handle,resize){let down=null;handle.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,input,select'))return;const r=panel.getBoundingClientRect();down={id:e.pointerId,x:e.clientX,y:e.clientY,l:r.left,t:r.top,w:r.width,h:r.height};try{handle.setPointerCapture(e.pointerId)}catch(_){}e.preventDefault()});handle.addEventListener('pointermove',e=>{if(!down||e.pointerId!==down.id)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(resize){panel.style.width=Math.max(330,Math.min(innerWidth-8,down.w+dx))+'px';panel.style.height=Math.max(200,Math.min(innerHeight-10,down.h+dy))+'px';}else{panel.style.left=Math.max(0,Math.min(innerWidth-64,down.l+dx))+'px';panel.style.top=Math.max(0,Math.min(innerHeight-54,down.t+dy))+'px';panel.style.right='auto';}});const end=e=>{if(down?.id===e.pointerId)down=null};handle.addEventListener('pointerup',end);handle.addEventListener('pointercancel',end);}
drag($('#osSettingsDrag'),false);drag($('#osSettingsResize'),true);
function repaint(){for(const channel of ['email','app']){for(const input of panel.querySelectorAll(`[data-os-alert-channel="${channel}"]`))input.checked=codes[channel].has(input.dataset.osAlertCode);for(const b of panel.querySelectorAll(`[data-os-preset][data-os-channel="${channel}"]`))b.setAttribute('aria-pressed',String(b.dataset.osPreset===modes[channel]));}}
panel.querySelectorAll('[data-os-preset]').forEach(b=>b.addEventListener('click',()=>{const ch=b.dataset.osChannel;codes[ch]=new Set(PRESETS[b.dataset.osPreset]);modes[ch]=b.dataset.osPreset;repaint()}));
panel.querySelectorAll('[data-os-alert-code]').forEach(input=>input.addEventListener('change',()=>{const ch=input.dataset.osAlertChannel,code=input.dataset.osAlertCode;if(input.checked)codes[ch].add(code);else codes[ch].delete(code);repaint()}));
async function save(){const payload={email:{mode:modes.email,codes:[...codes.email].sort()},app:{mode:modes.app,codes:[...codes.app].sort()}};const result=await call('settings.alerts.save',payload);status('Notification choices saved. Existing verified subscriptions are updated; new email addresses need one-time verification.');return result;}
$('#osSettingsSave').addEventListener('click',()=>save().catch(e=>status(e.message,true)));
function paintEmails(){const box=$('#osSettingsEmails'),list=settings?.emailAddresses||[];box.replaceChildren();const sel=$('#osSettingsEmailSelect');sel.replaceChildren();for(const o of list){const line=document.createElement('div');line.className='os-settings-email-row';const label=document.createElement('span');label.textContent=o.email+(o.primary?' · Primary':'')+(o.accountVerified?' · Verified':' · Unverified')+(o.alertSubscribed?' · Alerts on':'');line.append(label);if(!o.primary){const p=document.createElement('button');p.type='button';p.textContent='Set primary';p.addEventListener('click',async()=>{const current=prompt('Enter your current OurSpace password to change the primary email:');if(current===null)return;try{await call('settings.email.primary',{email:o.email,currentPassword:current});status('Primary email updated.');await load()}catch(e){status(e.message,true)}});line.append(p);const rm=document.createElement('button');rm.type='button';rm.textContent='Remove';rm.addEventListener('click',async()=>{if(!confirm('Remove this recovery email from your account?'))return;try{await call('auth.contact.remove',{type:'email',value:o.email});await load();status('Recovery email removed.')}catch(e){status(e.message,true)}});line.append(rm)}if(o.alertSubscribed){const off=document.createElement('button');off.type='button';off.textContent='Unsubscribe alerts';off.addEventListener('click',async()=>{try{await call('settings.alerts.email.unsubscribe',{email:o.email});await load();status('Email alerts disabled for '+o.email)}catch(e){status(e.message,true)}});line.append(off)}box.append(line);if(o.accountVerified){const opt=document.createElement('option');opt.value=o.email;opt.textContent=o.email;sel.append(opt)}}$('#osSettingsAddEmail').hidden=(settings?.remainingEmailSlots??5)<=0;}
async function load(){if(!allowed()){status('Sign in to your own profile to manage notifications. This preview does not send emails.');return;}const result=await call('settings.alerts.get',{});settings=result;for(const ch of ['email','app']){const cfg=result.settings?.[ch];if(cfg){codes[ch]=new Set((cfg.codes||[]).filter(x=>VALID.has(x)));modes[ch]=PRESETS[cfg.mode]?cfg.mode:'all'}}repaint();paintEmails();try{const d=await pwa()?.diagnostic?.();$('#osSettingsDeviceStatus').textContent=d?`App push: ${d.notificationPermission}; subscribed in browser: ${d.subscribedInBrowser}; VAPID configured: ${d.vapidPublicKeyConfigured}`:'App push client is not loaded.';}catch(e){$('#osSettingsDeviceStatus').textContent=e.message}}
function bindForm(selector,fn){$(selector).addEventListener('submit',async e=>{e.preventDefault();const button=e.currentTarget.querySelector('[type=submit]');button.disabled=true;try{await fn(new FormData(e.currentTarget));}catch(err){status(err.message,true)}finally{button.disabled=false}})}
bindForm('#osSettingsAddEmail',async data=>{pendingEmail=String(data.get('email')||'').trim();const r=await call('auth.contact.add.request',{type:'email',value:pendingEmail});addChallenge=r.challengeId||'';$('#osSettingsAddEmailConfirm').hidden=false;status('Six-digit email code requested. Check '+pendingEmail+'.')});
bindForm('#osSettingsAddEmailConfirm',async data=>{await call('auth.contact.add.complete',{type:'email',value:pendingEmail,code:String(data.get('code')||''),challengeId:addChallenge});$('#osSettingsAddEmailConfirm').hidden=true;status('Recovery email verified and added. Enable notifications separately if desired.');await load()});
$('#osSettingsAddResend').addEventListener('click',async()=>{try{const r=await call('auth.contact.add.request',{type:'email',value:pendingEmail});addChallenge=r.challengeId||'';status('New recovery email code requested.')}catch(e){status(e.message,true)}});
async function subscribeEmail(email){pendingEmail=email;const r=await call('settings.alerts.email.request',{email});if(r.alreadyVerified){await call('settings.alerts.email.enable',{email});status('Email alerts enabled for '+email+'.');$('#osSettingsEmailVerify').hidden=true;await load()}else{emailChallenge=r.challengeId||'';$('#osSettingsEmailVerify').hidden=false;status('A six-digit alert subscription code has been requested for '+email+'.')}}
bindForm('#osSettingsEmailRequest',async data=>{await save();await subscribeEmail(String(data.get('email')||''))});
bindForm('#osSettingsEmailVerify',async data=>{await call('settings.alerts.email.verify',{email:pendingEmail,code:String(data.get('code')||''),challengeId:emailChallenge});$('#osSettingsEmailVerify').hidden=true;await load();status('Email alerts verified and subscribed. You can change checkboxes without another code.')});
$('#osSettingsEmailResend').addEventListener('click',()=>subscribeEmail(pendingEmail).catch(e=>status(e.message,true)));
bindForm('#osSettingsPassword',async data=>{await call('settings.password.change',{currentPassword:String(data.get('currentPassword')||''),newPassword:String(data.get('newPassword')||'')});$('#osSettingsPassword').reset();status('Password updated.')});
$('#osSettingsSubscribeApp').addEventListener('click',async()=>{try{await save();if(!pwa()?.subscribe)throw new Error('The installed-app push client is unavailable.');await pwa().subscribe();status('App push subscription created for this device. Live delivery still depends on a configured Firebase/Web Push service.');await load();}catch(e){status(e.message,true)}});
$('#osSettingsUnsubscribeApp').addEventListener('click',async()=>{try{await pwa()?.unsubscribe?.();status('App push disabled on this device.');await load();}catch(e){status(e.message,true)}});
// Code rotations belong to the website's app-icon preview, never the immutable OS icon art.
let displayed=[],idx=0,rotation=null;
function updatePreview(){const val=$('#osSettingsIconCode');if(!val)return;val.textContent=displayed.length?displayed[idx%displayed.length]:'—';}
function setCodes(data){const values=data?.rotatingCodes||data?.codes||[];displayed=[...new Set(values.map(String).filter(x=>VALID.has(x)))].sort();idx=0;updatePreview();}
window.addEventListener('ourspace:push-state',e=>setCodes(e.detail));
const alertCode = event => {
 const kind=String(event?.kind||'').toLowerCase(),category=String(event?.category||'').toLowerCase();
 if(/missed|call|ring/.test(kind+' '+category))return '01';
 if(/quick/.test(kind+' '+category))return '03';
 if(/room/.test(kind+' '+category))return '05';
 if(/pin/.test(kind+' '+category))return '06';
 if(/calendar|task|appointment/.test(kind+' '+category))return '07';
 if(/onyx/.test(kind)){if(/writ/.test(kind))return '08';if(/think/.test(kind))return '09';if(/repl|answer|respond/.test(kind))return '10';if(/important|urgent/.test(kind))return '11';if(/care/.test(kind))return '13';return '12';}
 if(/therap|dbt/.test(kind+' '+category))return '14';
 if(/purchase|store/.test(kind+' '+category))return '15';
 if(/share|link/.test(kind+' '+category))return '16';
 if(/voice/.test(kind+' '+category))return '17';
 if(/self.?care/.test(kind+' '+category))return '18';
 if(/messag|text|chat/.test(kind+' '+category))return '04';
 return '02';
};
window.addEventListener('ourspace:notifications-updated',e=>{const d=e.detail;if(d?.rotatingCodes)setCodes(d);else if(Array.isArray(d?.alerts))setCodes({codes:d.alerts.filter(x=>!x.read).map(alertCode)});});
window.addEventListener('ourspace:messenger-alert',e=>{const category=e.detail?.type;if(category){const code=alertCode({kind:category,category});if(!displayed.includes(code))displayed.push(code);displayed.sort();updatePreview()}});
rotation=setInterval(()=>{if(active&&displayed.length>1){idx=(idx+1)%displayed.length;updatePreview()}},3000);
window.OurSpaceSettings={open:()=>toggle(true),close:()=>toggle(false),refresh:load};
})();