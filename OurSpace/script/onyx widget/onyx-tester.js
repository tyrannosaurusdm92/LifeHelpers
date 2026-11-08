/* OurSpace / Onyx tester frontend adapter. Server owns authentication, profile isolation, and permissions.
   This file contains only documented action names and public response handling: no backend source,
   verification codes, hashed secrets, private dossiers, or privileged test fixtures. */
(() => {
  'use strict';
  const STORAGE_KEY = 'ourspace.onyx.tester.session.v1';
  const ACTIONS = Object.freeze({contract:'onyx.tester.contract',request:'onyx.tester.request',verify:'onyx.tester.verify',status:'onyx.tester.status',select:'onyx.tester.select',exit:'onyx.tester.exit',chat:'onyx.chat'});
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
  const profiles = new Set(['william','jasper']);
  let state = {token:'',expiresAt:'',selectedProfile:'',pendingCode:false};
  const safeStorage = () => {try{return window.sessionStorage;}catch(_){return null;}};
  try { const obj = JSON.parse(safeStorage()?.getItem(STORAGE_KEY)||'null'); if(obj && typeof obj === 'object' && Date.parse(obj.expiresAt)>Date.now() && typeof obj.token==='string') state={...state,...obj,pendingCode:false}; } catch (_) {}
  function remember() {
    try {
      if (state.token && Date.parse(state.expiresAt)>Date.now()) safeStorage()?.setItem(STORAGE_KEY, JSON.stringify({token:state.token,expiresAt:state.expiresAt,selectedProfile:state.selectedProfile}));
      else safeStorage()?.removeItem(STORAGE_KEY);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent('onyx:tester-state',{detail:publicStatus()}));
  }
  function clear() {state={token:'',expiresAt:'',selectedProfile:'',pendingCode:false};remember();}
  function active(){if(state.token && Date.parse(state.expiresAt)>Date.now())return true;if(state.token)clear();return false;}
  function publicStatus(){return {active:Boolean(state.token && Date.parse(state.expiresAt)>Date.now()),selectedProfile:state.selectedProfile||null,expiresAt:state.expiresAt||null,pendingCode:state.pendingCode};}
  const requestIntent = text => /\b(?:send|email|request|get|generate|give)\b[\s\S]{0,75}\btester\b[\s\S]{0,60}\b(?:code|verification|access)\b/i.test(String(text||'')) || /\btester\b[\s\S]{0,40}\b(?:verification|login|access)\b[\s\S]{0,40}\bcode\b/i.test(String(text||''));
  const selectIntent = text => { const m=String(text||'').trim().match(/^(?:onyx[,! ]+)?(?:switch(?:\s+tester)?\s+to|select|test\s+as|talk\s+to|use\s+profile|i(?:'m| am)\s+testing\s+as)\s+(william|jasper)[.! ]*$/i);return m?m[1].toLowerCase():''; };
  const exitIntent = text => /^(?:onyx[,! ]+)?(?:exit|end|stop|disable|leave)(?:\s+the)?\s+tester(?:\s+mode|\s+session)?[.! ]*$/i.test(String(text||'').trim());
  // Existing Apps Script public JSONP interface: read-only tester actions only.
  // This transport is used because hosted pages and file:// cannot reliably read
  // Apps Script's cross-origin POST redirects. Tester tokens/messages appear in
  // request URLs and may appear in browser/network logs: no private information.
  async function api(action, data={}, signal) {
    if(!Object.values(ACTIONS).includes(action))throw new Error('Unsupported tester action.');
    if(!active() && ![ACTIONS.request,ACTIONS.verify,ACTIONS.contract].includes(action))throw new Error('Tester verification required.');
    const payload={action,namespace:'ourspace.onyx',data:{...data,...(active()?{testerToken:state.token}:{})}};
    const serialized=JSON.stringify(payload);
    if(serialized.length>4500)throw new Error('Tester message is too long for the secure size limit of this read-only connection. Shorten it to about 3,000 characters.');
    const url=new URL(ENDPOINT);
    const random=(window.crypto?.randomUUID?.() || (Date.now()+'_'+Math.random().toString(36).slice(2))).replace(/[^A-Za-z0-9_]/g,'');
    const callback='__ourspaceOnyxTester_'+random;
    url.searchParams.set('callback',callback);
    url.searchParams.set('payload',serialized);
    if(url.href.length>8200)throw new Error('The tester request is too long for Google Apps Script.');
    return new Promise((resolve,reject)=>{
      let finished=false;
      const script=document.createElement('script');
      script.async=true;
      script.referrerPolicy='no-referrer';
      const timeoutMs=action===ACTIONS.chat?180000:45000;
      const cleanup=()=>{clearTimeout(timer);script.remove();try{delete window[callback];}catch(_){window[callback]=undefined;}signal?.removeEventListener('abort',cancel);};
      const finish=(error,result)=>{
        if(finished)return;
        finished=true;cleanup();
        if(error)return reject(error);
        if(!result||typeof result!=='object')return reject(new Error('Apps Script did not return JSON.'));
        if(result.ok===false||result.error)return reject(new Error(String(result.error||result.message||'Tester action failed.')));
        resolve(result);
      };
      const cancel=()=>finish(new Error('Tester request canceled.'));
      const timer=setTimeout(()=>finish(new Error(action===ACTIONS.chat?'The AI Brain did not respond within three minutes. Check the existing backend and try one short message.':'Tester backend did not respond in time.')),timeoutMs);
      if(signal?.aborted){cancel();return;}
      window[callback]=result=>finish(null,result);
      script.onerror=()=>finish(new Error('Cannot reach the existing OurSpace tester backend.'));
      signal?.addEventListener('abort',cancel,{once:true});
      script.src=url.toString();
      document.head.append(script);
    });
  }
  async function requestCode(email) {
    if(String(email||'').trim().toLowerCase()!=='williamsaville92@gmail.com')throw new Error('Enter the email address registered with the existing tester backend.');
    // The backend chooses the destination: this frontend never supplies a new mailbox.
    const result=await api(ACTIONS.request,{});
    state.pendingCode=result.verificationPending!==false;
    remember();
    return result;
  }
  async function resendCode(email){return requestCode(email);}
  async function verifyCode(code){const r=await api(ACTIONS.verify,{code:String(code||'').trim()}); if(!r.testerToken || !r.expiresAt)throw new Error('The backend did not issue a tester session.');state.token=r.testerToken;state.expiresAt=r.expiresAt;state.selectedProfile='';state.pendingCode=false;remember();return r;}
  async function select(profile){const p=String(profile||'').toLowerCase();if(!profiles.has(p))throw new Error('Choose William or Jasper.');const r=await api(ACTIONS.select,{profileKey:p});state.selectedProfile=r.selectedProfile||p;remember();return r;}
  async function end(){if(active())await api(ACTIONS.exit,{});clear();return {ok:true,message:'Tester mode ended.'};}
  async function chat(message,options={}){
    if(!active())throw new Error('Tester mode is not active.');
    if(!state.selectedProfile)throw new Error('Select William or Jasper before chatting.');
    const r=await api(ACTIONS.chat,{message:String(message),profileKey:state.selectedProfile,useBrain:true,mode:options.mode||'work',...(options.threadId?{threadId:options.threadId}:{}),supportMode:options.supportMode||'chat',context:options.context||{},webSearch:false,autoRemember:false,allowWrites:false,allowExternalTools:false},options.signal);
    if(r.selectedProfile && profiles.has(r.selectedProfile)){state.selectedProfile=r.selectedProfile;remember();}
    return r;
  }
  async function tryConversation(message, {tab='health'}={}) {
    const text=String(message||'').trim();if(!text)return null;
    // Tester controls and conversations belong exclusively to fullscreen Work.
    if(tab!=='work'||document.getElementById('onyxWorkFullscreenShell')?.hidden!==false)return null;
    const specialRequest=requestIntent(text),selected=selectIntent(text),exit=exitIntent(text),isCode=/^\d{6}$/.test(text);
    if(!active()&&!specialRequest&&!(isCode&&state.pendingCode))return null;
    try {
      let r;
      if(active() && exit)r=await end();
      else if(active() && selected)r=await select(selected);
      else if(!active()&&specialRequest){return null;}
      else if(!active()&&isCode&&state.pendingCode)r=await verifyCode(text);
      else if(active()&&specialRequest)r={ok:true,message:'Tester mode is already active. You can select William or Jasper.'};
      else if(active())r=await chat(text,{supportMode:tab==='health'?'health':'chat'});
      if(!r)return null;
      return {text:String(r.response||r.onyxReply||r.message||'Onyx tester updated.'),state:r.professorActive?'advising_professor':'listening',testerMode:true,professorActive:!!r.professorActive,activateProfessorBubble:!!r.professorActive,artifacts:[],citations:[]};
    }catch(err){if(/expired|invalid tester session/i.test(String(err?.message||'')))clear();return {error:true,publicError:String(err?.message||'Tester request failed.')};}
  }
  window.OnyxTester=Object.freeze({api,chat,tryConversation,requestCode,resendCode,verifyCode,select,end,active,publicStatus,requestIntent,selectIntent,exitIntent,clear});
  remember();
})();
