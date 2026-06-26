
(() => {
  'use strict';
  const ACCOUNTS_KEY = 'ourspace_accounts_v2';
  const SESSION_KEY = 'ourspace_session_v2';
  const LEGACY_SESSION_KEY = 'ourspace_session_v1';
  const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwL1e8Gv-o0wC8kAhseMwoNhs97OBvCfCB5FV4zwNnCRa9jYWbYwm2B-wYwUOjlnjg_vA/exec';
  const $ = (id) => document.getElementById(id);
  const isAdmin = () => location.hash.toLowerCase().includes('admin');
  function readJSON(key, fallback){try{return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));}catch{return fallback;}}
  function writeJSON(key, value){localStorage.setItem(key, JSON.stringify(value));}
  function normalizeEmail(value){return String(value || '').trim().toLowerCase();}
  function message(id, text, type=''){const el=$(id); if(!el) return; el.textContent=text || ''; el.className = 'message ' + type;}
  async function sha256(text){
    if(window.crypto && crypto.subtle){
      const data = new TextEncoder().encode(text);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2,'0')).join('');
    }
    let h = 0; for(let i=0;i<text.length;i++){h=((h<<5)-h)+text.charCodeAt(i); h|=0;} return 'fallback-' + Math.abs(h);
  }
  function accounts(){return readJSON(ACCOUNTS_KEY, {});}
  function saveAccounts(all){writeJSON(ACCOUNTS_KEY, all);}
  function targetPage(profile){return String(profile || 'william').toLowerCase().includes('jasper') ? 'jasper.html' : 'william.html';}
  function publicAccount(account){return {email:account.email,nickname:account.nickname,username:account.username,profile:account.profile,updatedAt:account.updatedAt,createdAt:account.createdAt};}
  async function sendBackend(action, payload){
    try{
      await fetch(BACKEND_URL, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({app:'OurSpace', action, payload, at:new Date().toISOString()})});
      return true;
    }catch{return false;}
  }
  function setSession(account, admin=false){
    writeJSON(SESSION_KEY, {email:account.email,nickname:account.nickname,username:account.username,profile:account.profile,admin,loginAt:new Date().toISOString()});
    localStorage.removeItem(LEGACY_SESSION_KEY);
  }
  function routeToProfile(profile, admin=false){location.href = targetPage(profile) + (admin ? '#admin' : '');}
  function activateTab(tab){
    document.querySelectorAll('[data-auth-tab]').forEach(btn => btn.setAttribute('aria-selected', btn.dataset.authTab === tab ? 'true' : 'false'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === tab + 'Panel'));
  }
  function initAdmin(){
    if(!isAdmin()) return;
    document.body.classList.add('admin-mode');
    const adminAccount = {email:'admin@ourspace.local', nickname:'Admin Tester', username:'Admin Tester', profile:'william', adminHash:true, createdAt:'hash-admin'};
    const all = accounts(); all[adminAccount.email] = {...(all[adminAccount.email] || {}), ...adminAccount}; saveAccounts(all); setSession(adminAccount, true);
    message('adminMessage', 'Admin hash active. Choose either duplicated user page to test without logging in.', 'success');
  }
  function init(){
    initAdmin();
    document.querySelectorAll('[data-auth-tab]').forEach(btn => btn.addEventListener('click', () => activateTab(btn.dataset.authTab)));
    $('togglePassword')?.addEventListener('click', () => {
      const input = $('loginPassword'); const hidden = input.type === 'password'; input.type = hidden ? 'text' : 'password'; $('togglePassword').textContent = hidden ? 'Hide' : 'Show';
    });
    $('toggleSignupPassword')?.addEventListener('click', () => {
      const input = $('signupPassword'); const hidden = input.type === 'password'; input.type = hidden ? 'text' : 'password'; $('toggleSignupPassword').textContent = hidden ? 'Hide' : 'Show';
    });
    $('toggleResetPassword')?.addEventListener('click', () => {
      const input = $('resetPassword'); const hidden = input.type === 'password'; input.type = hidden ? 'text' : 'password'; $('toggleResetPassword').textContent = hidden ? 'Hide' : 'Show';
    });
    $('loginForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const email = normalizeEmail($('loginEmail').value);
      const nickname = $('loginNickname').value.trim();
      const profile = $('loginProfile').value;
      const password = $('loginPassword').value;
      if(!email || !nickname || !password){message('loginMessage','Enter email, nickname/username, and password.','warning');return;}
      const all = accounts(); const existing = all[email];
      if(!existing){message('loginMessage','No browser-saved account exists for that email yet. Use Sign Up first.','warning');return;}
      const hash = await sha256(email + '::' + password);
      if(existing.passwordHash !== hash){message('loginMessage','That password does not match this browser-saved account.','warning'); await sendBackend('login_failed',{email,nickname,profile}); return;}
      const account = {...existing, nickname, username:nickname, profile, updatedAt:new Date().toISOString(), lastLoginAt:new Date().toISOString()}; all[email] = account; saveAccounts(all); setSession(account); await sendBackend('login_authorized', {account:publicAccount(account)}); message('loginMessage','Signed in. Opening your user page…','success'); routeToProfile(profile);
    });
    $('signupForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const email = normalizeEmail($('signupEmail').value);
      const nickname = $('signupNickname').value.trim();
      const profile = $('signupProfile').value;
      const password = $('signupPassword').value;
      if(!email || !nickname || !password){message('signupMessage','Enter email, nickname/username, and password.','warning');return;}
      const all = accounts(); const hash = await sha256(email + '::' + password);
      const account = {email,nickname,username:nickname,profile,passwordHash:hash,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),lastLoginAt:new Date().toISOString()};
      all[email] = account; saveAccounts(all); setSession(account); await sendBackend('account_saved',{account:publicAccount(account), passwordHash:hash}); message('signupMessage','Account saved. Opening your user page…','success'); routeToProfile(profile);
    });
    $('resetForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const email = normalizeEmail($('resetEmail').value);
      const password = $('resetPassword').value;
      const confirm = $('resetConfirm').value;
      if(!email || !password || password !== confirm){message('resetMessage','Enter matching new passwords.','warning');return;}
      const all = accounts(); const existing = all[email] || {email,nickname:email.split('@')[0],username:email.split('@')[0],profile:'william',createdAt:new Date().toISOString()};
      existing.passwordHash = await sha256(email + '::' + password); existing.updatedAt = new Date().toISOString(); all[email] = existing; saveAccounts(all); await sendBackend('password_reset_saved',{account:publicAccount(existing)}); message('resetMessage','Password updated in this browser and reset notice sent to backend.','success');
    });
    $('adminWilliam')?.addEventListener('click', () => routeToProfile('william', true));
    $('adminJasper')?.addEventListener('click', () => routeToProfile('jasper', true));
    $('installOurSpace')?.addEventListener('click', async () => message('installMessage','Use your browser menu to install/add OurSpace to your home screen. The PWA manifest and icon are already included.', 'success'));
    if('serviceWorker' in navigator){navigator.serviceWorker.register('./service-worker.js').catch(()=>{});}
  }
  init();
})();
