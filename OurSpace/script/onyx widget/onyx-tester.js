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
  async function api(action, data={}, signal) {
    if(!Object.values(ACTIONS).includes(action))throw new Error('Unsupported tester action.');
    const payload={action,data:{...data,...(active()?{testerToken:state.token}:{})}};
    if(!active() && ![ACTIONS.request,ACTIONS.verify,ACTIONS.contract,ACTIONS.chat].includes(action))throw new Error('Tester verification required.');
    // A verified tester session intentionally works without logging in to either real account.
    // No user-supplied email destination or elevated permission is ever accepted here.
    const target=window.OurSpaceBackend?.endpoint||ENDPOINT;
    let response;
    try {response=await fetch(target,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),redirect:'follow',signal:signal||AbortSignal.timeout(90000)});}
    catch(e){throw new Error(e?.name==='AbortError'?'Tester request was cancelled or timed out.':'Cannot reach the Onyx backend.');}
    if(!response.ok)throw new Error('Onyx backend HTTP '+response.status+'.');
    let result;try{result=await response.json();}catch(_){throw new Error('Onyx backend returned an unreadable response.');}
    if(!result || result.ok===false)throw new Error(String(result?.error||result?.message||'Tester request was rejected.'));
    return result;
  }
  async function verifyCode(code){const r=await api(ACTIONS.verify,{code:String(code||'').trim()}); if(!r.testerToken || !r.expiresAt)throw new Error('The backend did not issue a tester session.');state.token=r.testerToken;state.expiresAt=r.expiresAt;state.selectedProfile='';state.pendingCode=false;remember();return r;}
  async function select(profile){const p=String(profile||'').toLowerCase();if(!profiles.has(p))throw new Error('Choose William or Jasper.');const r=await api(ACTIONS.select,{profileKey:p});state.selectedProfile=r.selectedProfile||p;remember();return r;}
  async function end(){if(active())await api(ACTIONS.exit,{});clear();return {ok:true,message:'Tester mode ended.'};}
  async function chat(message,options={}){
    if(!active())throw new Error('Tester mode is not active.');
    if(!state.selectedProfile)throw new Error('Select William or Jasper before chatting.');
    const r=await api(ACTIONS.chat,{message:String(message),...(options.threadId?{threadId:options.threadId}:{}),supportMode:options.supportMode||'chat',webSearch:false,autoRemember:false,allowWrites:false,allowExternalTools:false},options.signal);
    if(r.selectedProfile && profiles.has(r.selectedProfile)){state.selectedProfile=r.selectedProfile;remember();}
    return r;
  }
  async function tryConversation(message, {tab='health'}={}) {
    const text=String(message||'').trim();if(!text)return null;
    const specialRequest=requestIntent(text),selected=selectIntent(text),exit=exitIntent(text),isCode=/^\d{6}$/.test(text);
    if(!active()&&!specialRequest&&!(isCode&&state.pendingCode))return null;
    try {
      let r;
      if(active() && exit)r=await end();
      else if(active() && selected)r=await select(selected);
      else if(!active()&&specialRequest){r=await api(ACTIONS.request,{message:text});state.pendingCode=Boolean(r.verificationPending);remember();}
      else if(!active()&&isCode&&state.pendingCode)r=await verifyCode(text);
      else if(active()&&specialRequest)r={ok:true,message:'Tester mode is already active. You can select William or Jasper.'};
      else if(active())r=await chat(text,{supportMode:tab==='health'?'health':'chat'});
      if(!r)return null;
      return {text:String(r.response||r.onyxReply||r.message||'Onyx tester updated.'),state:r.professorActive?'advising_professor':'listening',testerMode:true,professorActive:!!r.professorActive,activateProfessorBubble:!!r.professorActive,artifacts:[],citations:[]};
    }catch(err){if(/expired|invalid tester session/i.test(String(err?.message||'')))clear();return {error:true,publicError:String(err?.message||'Tester request failed.')};}
  }
  window.OnyxTester=Object.freeze({api,chat,tryConversation,verifyCode,select,end,active,publicStatus,requestIntent,selectIntent,exitIntent,clear});
  remember();
})();
