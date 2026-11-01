/*
 * Onyx brain link bundle.
 * Consolidated from the Testing package brain/runtime modules in their original load order.
 * Chat uses the existing authenticated OurSpace onyx.chat backend with useBrain=true.
 * The large brain remains LifeHelpers/Onyx; profile-private retrieval remains backend-only.
 */

/* ===== bundled from onyx-backend.js ===== */
(function(root){
'use strict';

const ENDPOINT='https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
const ACTIONS=Object.freeze({
  chat:'onyx.chat',history:'onyx.chat.history',dbt:'onyx.dbt.suggest',health:'onyx.health',
  moduleContract:'onyx.module.contract',petContract:'onyx.pet.contract',petGet:'onyx.pet.state.get',petSave:'onyx.pet.state.save',
  capabilities:'onyx.ai.capabilities',webSearch:'onyx.ai.web.search',urlFetch:'onyx.ai.url.fetch',
  fileParse:'onyx.ai.file.parse',fileArchive:'onyx.ai.file.archive',imageGenerate:'onyx.ai.image.generate',fileUpload:'onyx.ai.file.upload',
  alertSubscribe:'onyx.alert.subscribe',alertUnsubscribe:'onyx.alert.unsubscribe',alertList:'onyx.alert.subscription.list',alertSend:'onyx.alert.send',
  notificationList:'notification.list',pushSubscribe:'pwa.push.subscribe',pushUnsubscribe:'pwa.push.unsubscribe',notificationContract:'pwa.notification.contract'
});
const ALLOWED_ACTIONS=new Set(Object.values(ACTIONS));
const MAX_UPLOAD_BYTES=25000*1024;
const AUTH_WAIT_MS=3200;
const status={online:false,lastAction:'',lastError:'',profileKey:'',moduleContract:null,petContract:null,capabilityContract:null,health:null,checkedAt:''};
let privateLastError='';
let volatileSessionToken='';
let volatileProfileKey='';
const listeners=new Set();
const AUTH_NONCE=(()=>{try{return crypto.randomUUID()}catch(_){return 'onyx-auth-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)}})();
const TRUSTED_MESSAGE_ORIGINS=new Set();
function normalizeOrigin(value){try{const raw=String(value||'').trim();if(!raw)return'';if(raw==='null')return'null';const u=new URL(raw,location.href);return u.origin&&u.origin!=='null'?u.origin:''}catch(_){return''}}
function trustOrigin(value){const origin=normalizeOrigin(value);if(origin)TRUSTED_MESSAGE_ORIGINS.add(origin);return origin}
trustOrigin(location.origin);
try{if(document.referrer)trustOrigin(new URL(document.referrer).origin)}catch(_){}
try{trustOrigin(document.documentElement?.dataset?.ourspaceHostOrigin)}catch(_){}
try{trustOrigin(document.querySelector('meta[name="ourspace-host-origin"]')?.content)}catch(_){}
try{const configured=root.ONYX_TRUSTED_HOST_ORIGINS;if(Array.isArray(configured))configured.forEach(trustOrigin);else if(typeof configured==='string')configured.split(',').forEach(trustOrigin)}catch(_){}
try{if(root.parent&&root.parent!==root)trustOrigin(root.parent.location.origin)}catch(_){}
try{if(root.opener&&!root.opener.closed)trustOrigin(root.opener.location.origin)}catch(_){}
function isTrustedMessageEvent(event){
  if(!event)return false;
  const trustedSource=event.source===root||event.source===root.parent||event.source===root.opener;
  if(!trustedSource)return false;
  const origin=String(event.origin||'');
  if(origin==='null'&&String(location.origin||'')==='null')return true;
  return TRUSTED_MESSAGE_ORIGINS.has(normalizeOrigin(origin));
}
function authTargetOrigins(target){
  const out=new Set();
  try{const direct=normalizeOrigin(target?.location?.origin);if(direct)out.add(direct)}catch(_){}
  if(target===root.parent){try{const ref=normalizeOrigin(document.referrer);if(ref)out.add(ref)}catch(_){}}
  for(const origin of TRUSTED_MESSAGE_ORIGINS)if(origin&&origin!=='null')out.add(origin);
  return [...out];
}
function postAuthRequest(target,packet){if(!target)return false;let sent=false;for(const origin of authTargetOrigins(target)){try{target.postMessage(packet,origin);sent=true}catch(_){}}return sent}
function abortError(){try{return new DOMException('Request cancelled.','AbortError')}catch(_){const e=new Error('Request cancelled.');e.name='AbortError';return e}}
function throwIfAborted(signal){if(signal?.aborted)throw abortError()}

function safeText(value,max=260){return String(value==null?'':value).replace(/[\r\n\t]+/g,' ').replace(/\s{2,}/g,' ').trim().slice(0,max)}
function publicError(error){
  const raw=safeText(error?.message||error||'');
  if(/session|sign.?in|auth/i.test(raw))return 'Sign in to OurSpace to use Onyx tools.';
  if(/too large|exceeds/i.test(raw))return raw.replace(/OurSpace/gi,'').trim().slice(0,180)||'That file is too large for this action.';
  if(/timeout|abort/i.test(raw))return 'Onyx could not finish that request.';
  if(/network|fetch|http/i.test(raw))return 'Onyx could not reach the service.';
  return 'Onyx could not complete that action.';
}
function emit(){
  const snap=Object.freeze(snapshot());
  listeners.forEach(fn=>{try{fn(snap)}catch(_){}});
  try{root.dispatchEvent(new CustomEvent('onyx:backend-status',{detail:snap}))}catch(_){}
}
function activeProfile(){
  if(['william','jasper','shared'].includes(volatileProfileKey))return volatileProfileKey;
  const accessKey=typeof root.OurSpaceAccess?.profileKey==='function'?root.OurSpaceAccess.profileKey():root.OurSpaceAccess?.profileKey;
  const candidates=[root.OurSpaceProfiles?.getActiveProfile?.(),accessKey,root.OurSpaceAccess?.getProfileKey?.(),document.documentElement.dataset.ourspaceProfile];
  try{if(root.parent&&root.parent!==root){const pa=root.parent.OurSpaceAccess,pk=typeof pa?.profileKey==='function'?pa.profileKey():pa?.profileKey;candidates.push(root.parent.OurSpaceProfiles?.getActiveProfile?.(),pk)}}catch(_){}
  for(const value of candidates){const key=String(value||'').trim().toLowerCase();if(['william','jasper','shared'].includes(key))return key;}
  try{for(const k of ['ourspace.auth.activeProfile','ourspace.activeProfile','ourspace_profile']){const v=String(localStorage.getItem(k)||'').toLowerCase();if(['william','jasper','shared'].includes(v))return v}}catch(_){}
  return status.profileKey||'shared';
}
function sessionToken(){
  if(volatileSessionToken)return volatileSessionToken;
  // Security boundary: Onyx no longer scans localStorage/sessionStorage for bearer credentials.
  // Auth comes from the host bridge, a short-lived in-memory handoff, or an already-live host global.
  const values=[root.OurSpaceAuth?.sessionToken,root.OURSPACE_SESSION_TOKEN,root.ourspaceSessionToken];
  try{if(root.parent&&root.parent!==root)values.push(root.parent.OurSpaceAuth?.sessionToken,root.parent.OURSPACE_SESSION_TOKEN,root.parent.ourspaceSessionToken)}catch(_){}
  for(const v of values)if(typeof v==='string'&&v.trim())return v.trim();
  return '';
}

function setAuthContext(context={}){
  const token=String(context.sessionToken||context.token||'').trim();
  const profile=String(context.profileKey||context.profile||'').trim().toLowerCase();
  if(token)volatileSessionToken=token;
  if(['william','jasper','shared'].includes(profile)){volatileProfileKey=profile;status.profileKey=profile;}
  status.lastError='';privateLastError='';emit();return snapshot();
}
function clearAuthContext(){volatileSessionToken='';volatileProfileKey='';status.profileKey='';status.online=false;emit();return snapshot()}
function requestAuthContext(){
  const packet={type:'ourspace-auth-request',module:'onyx',needs:['sessionToken','profileKey'],requestNonce:AUTH_NONCE,requestOrigin:normalizeOrigin(location.origin)};
  try{if(root.parent&&root.parent!==root)postAuthRequest(root.parent,packet)}catch(_){}
  try{if(root.opener&&!root.opener.closed)postAuthRequest(root.opener,packet)}catch(_){}
  try{root.dispatchEvent(new CustomEvent('ourspace:auth-request',{detail:{module:'onyx',requestNonce:AUTH_NONCE}}))}catch(_){}
}
async function waitForAuthContext(timeout=AUTH_WAIT_MS,signal){
  throwIfAborted(signal);
  if(hostRequest()||sessionToken())return true;
  requestAuthContext();
  const started=Date.now();
  while(Date.now()-started<Math.max(250,Number(timeout)||AUTH_WAIT_MS)){
    throwIfAborted(signal);
    if(hostRequest()||sessionToken())return true;
    await new Promise(resolve=>setTimeout(resolve,80));
  }
  throwIfAborted(signal);
  return Boolean(hostRequest()||sessionToken());
}
function acceptAuthMessage(event){
  const m=event?.data;if(!m||m.type!=='ourspace-auth-context')return;
  if(!isTrustedMessageEvent(event))return;
  const echoed=String(m.requestNonce||m.nonce||'');
  if(echoed&&echoed!==AUTH_NONCE)return;
  setAuthContext(m);
}
try{root.addEventListener('message',acceptAuthMessage)}catch(_){}
try{root.addEventListener('ourspace:auth-context',event=>setAuthContext(event?.detail||{}))}catch(_){}
try{root.addEventListener('pageshow',()=>{if(!available())requestAuthContext()})}catch(_){}
try{root.addEventListener('focus',()=>{if(!available())requestAuthContext()})}catch(_){}

function hostRequest(){
  const candidates=[root.OurSpaceBackend];
  try{if(root.parent&&root.parent!==root)candidates.push(root.parent.OurSpaceBackend)}catch(_){}
  return candidates.find(x=>x&&typeof x.request==='function')||null;
}
function withTimeout(value,ms,signal){
  let timer=0,abortHandler=null;
  const timeoutPromise=new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Backend timeout')),ms)});
  const races=[Promise.resolve(value),timeoutPromise];
  if(signal){races.push(new Promise((_,reject)=>{abortHandler=()=>reject(abortError());if(signal.aborted)abortHandler();else signal.addEventListener('abort',abortHandler,{once:true})}))}
  return Promise.race(races).finally(()=>{if(timer)clearTimeout(timer);if(signal&&abortHandler)signal.removeEventListener('abort',abortHandler)});
}
async function directRequest(action,data,timeout,signal){
  const token=sessionToken();if(!token)throw new Error('OurSpace session is not available.');
  throwIfAborted(signal);
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout||30000),relay=()=>ctl.abort();
  if(signal)signal.addEventListener('abort',relay,{once:true});
  try{
    const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,sessionToken:token,data:data||{}}),signal:ctl.signal,cache:'no-store',credentials:'omit'});
    if(!res.ok)throw new Error('Backend HTTP '+res.status);
    const out=await res.json();if(!out||out.ok===false)throw new Error(String(out?.error||out?.message||'Backend rejected request.'));throwIfAborted(signal);return out;
  }catch(error){if(signal?.aborted)throw abortError();throw error}
  finally{clearTimeout(timer);if(signal)signal.removeEventListener('abort',relay)}
}
async function request(action,data={},options={}){
  action=String(action||'');
  if(!ALLOWED_ACTIONS.has(action))throw new Error('Unsupported Onyx action.');
  status.lastAction=action;status.lastError='';privateLastError='';emit();
  try{
    const signal=options.signal;throwIfAborted(signal);
    if(!hostRequest()&&!sessionToken())await waitForAuthContext(options.authWaitMs||AUTH_WAIT_MS,signal);
    throwIfAborted(signal);
    const host=hostRequest();let out;
    if(host)out=await withTimeout(host.request(action,data,{...options,signal}),options.timeout||35000,signal);
    else out=await directRequest(action,data,options.timeout||35000,signal);
    throwIfAborted(signal);
    if(!out||out.ok===false)throw new Error(String(out?.error||out?.message||'Backend rejected request.'));
    status.online=true;status.checkedAt=new Date().toISOString();
    const returnedProfile=String(out.profileKey||out.profile||'').toLowerCase(),localProfile=activeProfile();
    if(['william','jasper','shared'].includes(returnedProfile))status.profileKey=returnedProfile;else if(!status.profileKey&&localProfile!=='shared')status.profileKey=localProfile;
    emit();return out;
  }catch(error){
    if(options.signal?.aborted){privateLastError='';status.lastError='';status.checkedAt=new Date().toISOString();emit();throw abortError()}
    privateLastError=safeText(error?.message||error,1000);status.online=false;status.lastError=publicError(error);status.checkedAt=new Date().toISOString();emit();throw error;
  }
}
async function resolveProfile(options={}){const p=activeProfile();throwIfAborted(options.signal);if(status.profileKey||p!=='shared')return p;if(!available())return'shared';try{const r=await request(ACTIONS.petGet,{}, {timeout:options.timeout||12000,signal:options.signal});throwIfAborted(options.signal);const resolved=String(r?.profileKey||r?.profile||'shared').toLowerCase();return ['william','jasper','shared'].includes(resolved)?resolved:'shared'}catch(error){if(options.signal?.aborted||error?.name==='AbortError')throw abortError();return'shared'}}
function stableThread(profileKey){const p=String(profileKey||status.profileKey||activeProfile()).toLowerCase();return 'ourspace-onyx-'+(['william','jasper','shared'].includes(p)?p:'shared')}
async function contracts(){
  const rows=await Promise.allSettled([
    request(ACTIONS.moduleContract,{}, {timeout:12000}),request(ACTIONS.petContract,{}, {timeout:12000}),
    request(ACTIONS.health,{}, {timeout:12000}),request(ACTIONS.capabilities,{}, {timeout:15000})
  ]);
  if(rows[0].status==='fulfilled')status.moduleContract=rows[0].value.contract||rows[0].value;
  if(rows[1].status==='fulfilled')status.petContract=rows[1].value.contract||rows[1].value;
  if(rows[2].status==='fulfilled')status.health=rows[2].value;
  if(rows[3].status==='fulfilled')status.capabilityContract=rows[3].value.contract||rows[3].value;
  status.profileKey=status.profileKey||activeProfile();emit();return snapshot();
}
async function capabilities(){const r=await request(ACTIONS.capabilities,{}, {timeout:15000});status.capabilityContract=r.contract||r;emit();return r}
async function history(limit=100,options={}){return request(ACTIONS.history,{limit:Math.max(1,Math.min(500,Number(limit)||100))},{timeout:options.timeout||18000,signal:options.signal})}
async function petGet(options={}){return request(ACTIONS.petGet,{}, {timeout:options.timeout||15000,signal:options.signal})}
async function petSave(data,options={}){return request(ACTIONS.petSave,data||{}, {timeout:options.timeout||18000,keepalive:options.keepalive===true,signal:options.signal})}
async function chat(data,options={}){return request(ACTIONS.chat,data||{}, {timeout:options.timeout||65000,signal:options.signal})}
async function dbtSuggest(data,options={}){return request(ACTIONS.dbt,data||{}, {timeout:options.timeout||45000,signal:options.signal})}
async function webSearch(query,options={}){return request(ACTIONS.webSearch,{query:String(query||''),reasoningEffort:options.reasoningEffort||'medium',maxOutputTokens:options.maxOutputTokens||1800,sessionId:options.sessionId||stableThread()}, {timeout:options.timeout||65000,signal:options.signal})}
async function urlFetch(url,options={}){return request(ACTIONS.urlFetch,{url:String(url||''),extract:options.extract||'readable text and useful structured data',cite:options.cite!==false,sessionId:options.sessionId||stableThread()}, {timeout:options.timeout||55000,signal:options.signal})}
function readFileDataUrl(file,signal){return new Promise((resolve,reject)=>{if(!(file instanceof Blob))return reject(new Error('A file is required.'));if(signal?.aborted)return reject(abortError());const reader=new FileReader(),onAbort=()=>{try{reader.abort()}catch(_){}reject(abortError())};if(signal)signal.addEventListener('abort',onAbort,{once:true});const done=fn=>value=>{if(signal)signal.removeEventListener('abort',onAbort);fn(value)};reader.onerror=done(()=>reject(new Error('File could not be read.')));reader.onabort=done(()=>reject(abortError()));reader.onload=done(()=>resolve(String(reader.result||'')));reader.readAsDataURL(file)})}
async function fileUpload(file,options={}){
  if(!(file instanceof Blob))throw new Error('A file is required.');
  if(Number(file.size||0)>MAX_UPLOAD_BYTES)throw new Error('Upload too large. 25,000 KB maximum.');
  const dataUrl=await readFileDataUrl(file,options.signal),fileName=safeText(file.name||options.fileName||'file',180)||'file',mimeType=file.type||options.mimeType||'application/octet-stream';
  const result=await request(ACTIONS.fileUpload,{fileName,mimeType,dataUrl,kind:options.kind||'onyx-ai-upload',purpose:options.purpose||'Onyx conversation attachment'}, {timeout:options.timeout||90000,signal:options.signal});
  return {...result,name:result?.name||result?.fileName||fileName,fileName:result?.fileName||result?.name||fileName,mimeType:result?.mimeType||mimeType,sizeBytes:Number(result?.sizeBytes||file.size||0)||0};
}
async function fileParse(input,options={}){
  const data={instructions:String(options.instructions||'Analyze this file faithfully for the user request. Preserve useful structure and state uncertainty.'),maxChars:Math.max(1000,Math.min(240000,Number(options.maxChars)||120000)),allowShared:options.allowShared===true,sessionId:options.sessionId||stableThread(),reasoningEffort:options.reasoningEffort||'medium',maxOutputTokens:options.maxOutputTokens||2000};
  if(typeof input==='string')data.fileId=input;
  else if(input&&input.fileId)data.fileId=String(input.fileId);
  else if(input instanceof Blob){const dataUrl=await readFileDataUrl(input,options.signal);data.dataUrl=dataUrl;data.fileName=safeText(input.name||'file',180);data.mimeType=input.type||'application/octet-stream'}
  else throw new Error('A file or file ID is required.');
  return request(ACTIONS.fileParse,data,{timeout:options.timeout||90000,signal:options.signal});
}
async function fileArchive(fileIds,name='onyx-files',options={}){return request(ACTIONS.fileArchive,{fileIds:(fileIds||[]).map(String).filter(Boolean).slice(0,50),name:safeText(name,100)||'onyx-files',allowShared:options.allowShared===true},{timeout:options.timeout||90000,signal:options.signal})}
async function imageGenerate(prompt,options={}){return request(ACTIONS.imageGenerate,{prompt:String(prompt||''),name:safeText(options.name||'onyx-image',100),width:options.width||1024,height:options.height||1024,count:Math.max(1,Math.min(4,Number(options.count)||1)),transparentBackground:options.transparentBackground===true,quality:options.quality||'auto',sessionId:options.sessionId||stableThread()},{timeout:options.timeout||120000,signal:options.signal})}

async function alertSubscribe(data,options={}){return request(ACTIONS.alertSubscribe,data||{},{timeout:options.timeout||30000,signal:options.signal})}
async function alertUnsubscribe(data,options={}){return request(ACTIONS.alertUnsubscribe,data||{},{timeout:options.timeout||30000,signal:options.signal})}
async function alertList(options={}){return request(ACTIONS.alertList,{}, {timeout:options.timeout||20000,signal:options.signal})}
async function alertSend(data,options={}){return request(ACTIONS.alertSend,data||{},{timeout:options.timeout||30000,signal:options.signal})}
function safeUrl(value){try{const u=new URL(String(value||''),location.href);return /^https?:$/i.test(u.protocol)?u.href:''}catch(_){return''}}
function normalizeFileRecord(value,kindHint='file'){
  if(!value||typeof value!=='object')return null;
  const url=safeUrl(value.url||value.driveUrl||value.downloadUrl||value.publicUrl||'');
  const name=safeText(value.name||value.fileName||value.title||'',180);
  const mimeType=safeText(value.mimeType||value.type||'',100);
  const fileId=safeText(value.fileId||value.id||value.assetId||'',220);
  const base64=typeof value.base64==='string'&&value.base64.length<=48*1024*1024?value.base64:'';
  if(!url&&!name&&!fileId&&!base64)return null;
  const kind=/^image\//i.test(mimeType)||kindHint==='image'?'image':kindHint;
  return {kind,name:name||(kind==='image'?'image.png':'file'),mimeType,fileId,url,base64,sizeBytes:Number(value.sizeBytes||0)||0};
}
function extractArtifacts(result){
  const out=[],seen=new Set();
  function add(v,hint){const n=normalizeFileRecord(v,hint);if(!n)return;const key=[n.fileId,n.url,n.name,n.base64?String(n.base64.length):''].join('|');if(seen.has(key))return;seen.add(key);out.push(n)}
  (result?.images||[]).forEach(v=>add(v,'image'));
  (result?.assets||[]).forEach(v=>add(v,/^image\//i.test(v?.mimeType||'')?'image':'file'));
  if(result?.file)add(result.file,'file');
  /* Upload/archive/image routes may return the created artifact at the top level. */
  if(result&&typeof result==='object'&&(result.driveFileId||result.fileId||result.url||result.driveUrl||result.downloadUrl||result.base64)){
    const top={...result,fileId:result.fileId||result.driveFileId||result.mediaId||'',name:result.name||result.fileName||result.title||'',url:result.url||result.driveUrl||result.downloadUrl||''};
    add(top,/^image\//i.test(top.mimeType||'')?'image':'file');
  }
  const traces=Array.isArray(result?.toolTrace)?result.toolTrace:[];
  for(const tr of traces){
    const stack=[tr?.result,tr?.output,tr?.data,tr?.asset,tr?.file,tr?.artifacts,tr?.images];
    for(const item of stack){if(Array.isArray(item))item.forEach(v=>add(v,/^image\//i.test(v?.mimeType||'')?'image':'file'));else add(item,/^image\//i.test(item?.mimeType||'')?'image':'file')}
  }
  return out.slice(0,24);
}
function snapshot(){const configuredEndpoint=String(root.OnyxConfig?.backendEndpoint||'').trim();return {online:Boolean(status.online),transportReady:Boolean(hostRequest()||sessionToken()),transport:hostRequest()?'host':sessionToken()?'direct':'none',endpointConfigured:Boolean(ENDPOINT),endpointMatchesConfig:Boolean(configuredEndpoint&&configuredEndpoint===ENDPOINT),lastAction:status.lastAction,lastError:status.lastError,profileKey:status.profileKey||activeProfile(),moduleContract:status.moduleContract,petContract:status.petContract,capabilityContract:status.capabilityContract,checkedAt:status.checkedAt}}
function available(){return Boolean(hostRequest()||sessionToken())}

root.OnyxBackendClient=Object.freeze({
  actions:ACTIONS,request,contracts,capabilities,history,petGet,petSave,chat,dbtSuggest,webSearch,urlFetch,fileUpload,fileParse,fileArchive,imageGenerate,alertSubscribe,alertUnsubscribe,alertList,alertSend,
  extractArtifacts,publicError,activeProfile,resolveProfile,stableThread,available,snapshot,setAuthContext,clearAuthContext,requestAuthContext,waitForAuthContext,isTrustedMessageEvent,
  onStatus(fn){if(typeof fn==='function')listeners.add(fn);return()=>listeners.delete(fn)}
});
if(!available())requestAuthContext();
})(window);

/* ===== bundled from onyx-memory.js ===== */
(function(root){'use strict';
function resolve({lane='virtual',requested='auto',serious=false}={}){const req=String(requested||'auto').toLowerCase();let policy=(req==='on'||req==='off')?req:(lane==='health'?'off':'on');if(serious)policy='off';return{policy,durable:policy==='on'&&!serious,protected:lane==='health',reason:serious?'serious/safety turns never auto-save':lane==='health'&&req==='auto'?'Health defaults to no durable memory':'user/lane policy'}}
root.OnyxMemory=Object.freeze({resolve});
})(window);

/* ===== bundled from onyx-data.js ===== */
(function(root){'use strict';
let shared=null,manifest=null,loading=null;
async function fetchJson(path){const r=await fetch(path,{cache:'force-cache'});if(!r.ok)throw new Error(path+' '+r.status);return r.json()}
async function load(){if(shared)return{shared,manifest};if(loading)return loading;loading=Promise.all([fetchJson('../../json/onyx_widget_onyx-shared.json'),fetchJson('../../json/onyx_widget_onyx-manifest.json').catch(()=>null)]).then(([s,m])=>{shared=s;manifest=m;return{shared,manifest}}).finally(()=>{loading=null});return loading}
function profileKey(value){const p=String(value||root.OnyxBackendClient?.activeProfile?.()||'shared').toLowerCase();return ['william','jasper','shared'].includes(p)?p:'shared'}
async function currentProfile(value){return{profileKey:profileKey(value),source:'authenticated-backend',containsPrivateFacts:false}}
async function core(){const d=await load();return d.shared?.conversationCore||null}
async function retrieve(query,options={}){await load();return{profileKey:profileKey(options.profileId),query:String(query||''),continuityQuery:String(query||''),topicAnchors:[],hits:[],context:'',authorityOrder:['authenticated-backend-private','shared-static'],backendAuthoritative:true,staticPrivateKnowledge:false}}
function stats(){return{staticPrivateKnowledge:false,sharedLoaded:Boolean(shared),manifestLoaded:Boolean(manifest)}}
root.OnyxDataRuntime=Object.freeze({load,currentProfile,core,retrieve,stats,profileKey});
})(window);

/* ===== bundled from onyx-safety.js ===== */
/*
  Onyx shared frontend safety kernel.
  One deterministic classifier for main chat, health fallback, router, and core.
  Backend safety remains authoritative when available; this kernel supplies a
  consistent local signal and emergency fallback without inventing diagnosis.
*/
(function(root){
'use strict';

const RX=Object.freeze({
  urgentOverride:/\b(right now|currently|this is real|not hypothetical|not fiction|actually me|i need help now|immediate danger|can(?:not|'t) stay safe)\b/i,
  contextual:/\b(for (?:a|my) (?:story|novel|script|game|character|worldbuilding|research|article|class|assignment)|fiction(?:al)?|roleplay|hypothetical|example sentence|quoted?|statistics?|histor(?:y|ical)|educational|writing (?:a|my)|in the book|in the story|a character|this character)\b/i,
  selfHarmDirect:/\b(i (?:want|plan|intend|am going|might) to (?:die|kill myself|end my life|hurt myself)|i (?:can(?:not|'t)) stay safe|i have the (?:pills|gun|weapon|means)|suicide plan|i(?:'m| am) going to overdose)\b/i,
  selfHarmConcern:/\b(suicid(?:e|al)?|self[- ]?harm|cut myself|hurt myself|wish i were dead|don'?t want to be alive|do not want to be alive|end my life|kill myself)\b/i,
  violenceDirect:/\b(i (?:want|plan|intend|am going|might) to (?:kill|shoot|stab|hurt|harm) (?:him|her|them|someone|people)|homicid(?:e|al)?)\b/i,
  thirdPartyConcern:/\b(my (?:friend|partner|spouse|mom|mother|dad|father|brother|sister|child|kid|roommate)|he|she|they|someone)\b.{0,80}\b(suicid|kill (?:themself|himself|herself)|hurt (?:themself|himself|herself)|overdose|can(?:not|'t) stay safe)\b/i,
  overdose:/\b(overdose|took too many|double dose|swallowed a bottle|poison(?:ed|ing)|too much medication)\b/i,
  breathing:/\b(can(?:not|'t) breathe|stopped breathing|severe shortness of breath|blue lips|turning blue)\b/i,
  chest:/\b(severe chest (?:pain|pressure)|crushing chest|chest pain.{0,80}(?:sweat|shortness of breath|dizz|nausea))\b/i,
  stroke:/\b(face droop|sudden.{0,50}(?:arm|leg).{0,30}weak|sudden.{0,50}slurred speech|suddenly can(?:not|'t) speak)\b/i,
  altered:/\b(unresponsive|won'?t wake|will not wake|passed out and won'?t|sudden confusion|can(?:not|'t) tell what is real.{0,50}danger)\b/i,
  allergy:/\b(anaphyl|throat closing|severe allergic.{0,60}(?:breath|swelling))\b/i,
  distressSelf:/\b(i(?:'m| am| feel| have been| was) (?:panick?ing|overwhelmed|terrified|unsafe|anxious|depressed|dissociat(?:ing|ed)?|grieving|in a flashback)|i(?:'m| am) having (?:a )?(?:panic attack|flashback|meltdown|shutdown)|my (?:anxiety|depression|grief|trauma|panic) (?:is|feels|got|has)|i can(?:not|'t) cope|i feel unsafe)\b/i,
  distressMention:/\b(panic|flashback|overwhelmed|dissociat|meltdown|shutdown|unsafe|terrified|trauma|grief|depress(?:ed|ion)?|anxi(?:ous|ety)|abuse|assault)\b/i
});

function clean(value){return String(value??'').replace(/\s+/g,' ').trim()}
function configuredCountry(){
  const values=[
    root.OnyxBackendClient?.snapshot?.().country,
    root.OnyxBackendClient?.snapshot?.().profileContext?.country,
    root.OnyxConfig?.country,
    document.documentElement?.dataset?.country,
    document.body?.dataset?.country
  ];
  for(const value of values){const v=String(value||'').trim();if(v)return v.toUpperCase()}
  return '';
}
function assess(message,context={}){
  const text=clean(message), contextual=RX.contextual.test(text), urgentOverride=RX.urgentOverride.test(text);
  const rawFlags={
    selfHarm:RX.selfHarmDirect.test(text),
    concern:RX.selfHarmConcern.test(text),
    violence:RX.violenceDirect.test(text),
    thirdPartyConcern:RX.thirdPartyConcern.test(text),
    overdose:RX.overdose.test(text),
    breathing:RX.breathing.test(text),
    chest:RX.chest.test(text),
    stroke:RX.stroke.test(text),
    altered:RX.altered.test(text),
    allergy:RX.allergy.test(text)
  };
  const physicalEmergency=rawFlags.overdose||rawFlags.breathing||rawFlags.chest||rawFlags.stroke||rawFlags.altered||rawFlags.allergy;
  const directBehavioral=rawFlags.selfHarm||rawFlags.violence;
  const contextualFirstPersonPhysical=Boolean(contextual&&physicalEmergency&&/\b(i|i'm|i am|me)\b/i.test(text));
  const contextualAmbiguity=Boolean(contextual&&!urgentOverride&&(directBehavioral||contextualFirstPersonPhysical));
  const emergency=Boolean(!contextualAmbiguity&&(!contextual||urgentOverride)&&(physicalEmergency||directBehavioral));
  const needsSafetyClarification=Boolean(contextualAmbiguity||(!contextual&&!emergency&&rawFlags.concern&&!rawFlags.thirdPartyConcern));
  const elevated=Boolean(emergency||needsSafetyClarification||rawFlags.thirdPartyConcern);
  const distress=Boolean(RX.distressSelf.test(text)||(!contextual&&RX.distressMention.test(text)&&/\b(i|i'm|i am|my|me)\b/i.test(text)));
  const flags={...rawFlags,contextual,urgentOverride,contextualAmbiguity,distress};
  const hits=Object.entries(flags).filter(([,value])=>value===true).map(([key])=>key);
  const category=emergency?'emergency':needsSafetyClarification?'clarify_safety':rawFlags.thirdPartyConcern?'concern_for_other':distress?'current_distress':RX.distressMention.test(text)?'informational_distress_mention':'ordinary';
  return {schema:'onyx.safety.frontend.v1',text,emergency,elevated,distress,needsSafetyClarification,category,flags,hits,action:emergency?'emergency_escalation':needsSafetyClarification?'brief_safety_clarification':rawFlags.thirdPartyConcern?'support_other_safety':distress?'support_current_distress':'normal_support',country:String(context.country||configuredCountry()||'').toUpperCase()};
}
function emergencyMessage(options={}){
  const country=String(options.country||configuredCountry()||'').toUpperCase();
  const lines=[
    'This may be an emergency. Contact local emergency services or go to the nearest emergency department if there is immediate danger, a possible overdose, severe breathing trouble, severe chest pain or pressure, sudden stroke-like symptoms, or someone cannot be kept safe.',
    'If possible, stay with the person, move away from immediate hazards, and involve a trusted person or clinician while help is being contacted.'
  ];
  if(options.includeUS988!==false&&country==='US')lines.push('In the United States, call or text 988 for suicide, mental-health, or substance-use crisis support; use 911 for life-threatening emergencies.');
  return lines.join(' ')
}
function clarificationMessage(){return 'I want to make sure I read that correctly. Is the self-harm or danger language about you or someone else right now, or is it fictional, quoted, historical, or hypothetical?'}
function groundingChoiceMessage(){return 'I can stay with you quietly, or we can use one low-demand grounding option: notice one neutral thing you can see, hold or touch a neutral texture, name one factual detail about where you are, reduce stimulation if that helps, or take a slower breath only if breathing exercises feel comfortable. You can also skip grounding and have me just listen.'}

root.OnyxSafetyKernel=Object.freeze({assess,isCrisis(message,context){return assess(message,context).emergency},isDistress(message,context){return assess(message,context).distress},emergencyMessage,clarificationMessage,groundingChoiceMessage,configuredCountry,patterns:RX});
try{root.dispatchEvent(new CustomEvent('onyx:safety-kernel-ready',{detail:{schema:'onyx.safety.frontend.v1'}}))}catch(_){}
})(window);

/* ===== bundled from onyx-wasm.js ===== */
(function(root){'use strict';
async function init(){await root.OnyxHealthRuntime?.init?.();return Boolean(root.OnyxHealthRuntime?.snapshot?.().wasmReady)}
function snapshot(){const runtime=root.OnyxHealthRuntime?.snapshot?.()||{};return{ready:Boolean(runtime.wasmReady),mode:runtime.mode||'unavailable'}}
root.OnyxWasm=Object.freeze({init,snapshot,get health(){return root.OnyxHealthRuntime?.engine?.wasm||null}});
})(window);

/* ===== bundled from onyx-health.js ===== */
(function(root){
'use strict';
// ../../script/onyx-health-utils.js
function normalizeText(value) {
  return String(value ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
}

const STOP_WORDS = new Set([
  "the","a","an","and","or","to","of","in","on","for","with","is","are","was","were",
  "i","me","my","it","that","this","you","your","we","our","but","if","so","at","as"
]);

function tokenize(value) {
  return normalizeText(value)
    .toLowerCase()
    .split(/[^a-z0-9+_'’-]+/g)
    .map(t => t.replace(/[’']/g, "'"))
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function unique(list) { return [...new Set((list || []).filter(Boolean))]; }
function clamp(n, min, max) { return Math.max(min, Math.min(max, Number(n))); }
function nowIso() { return new Date().toISOString(); }
function safeJsonParse(text, fallback = null) { try { return JSON.parse(text); } catch { return fallback; } }
function compactObject(obj) { return Object.fromEntries(Object.entries(obj || {}).filter(([,v]) => v !== undefined && v !== null && v !== "")); }
function assertString(value, name = "value", max = 16000) {
  const s = normalizeText(value);
  if (!s) throw new Error(`${name} is required`);
  if (s.length > max) throw new Error(`${name} exceeds ${max} characters`);
  return s;
}
function sanitizeUserText(value, max = 16000) { return String(value ?? "").replace(/\u0000/g, "").slice(0, max); }
function noSecrets(obj) {
  const s = JSON.stringify(obj ?? {});
  return !/sk-[A-Za-z0-9_-]{20,}|BEGIN PRIVATE KEY|AIza[0-9A-Za-z_-]{20,}/.test(s);
}
function stableHashJs(text) {
  let h = 2166136261 >>> 0;
  for (const ch of String(text ?? "")) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function redactForLogs(text, max = 4000) {
  let s = String(text ?? "");
  const rules = [
    [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]"],
    [/\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g, "[phone]"],
    [/\b\d{3}-\d{2}-\d{4}\b/g, "[ssn-like]"],
    [/\b(?:sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,})\b/g, "[secret]"]
  ];
  for (const [re, replacement] of rules) s = s.replace(re, replacement);
  return s.slice(0, max);
}

// ../../script/onyx-health-wasm.js

class OnyxHealthWasm {
  constructor() { this.instance = null; this.exports = null; this.ready = false; }

  async init(url = new URL('../../script/onyx-health-core.wasm', document.baseURI), fetchImpl = globalThis.fetch) {
    let result;
    if (typeof fetchImpl === "function" && /^https?:|^file:/.test(String(url))) {
      try {
        if (WebAssembly.instantiateStreaming && !String(url).startsWith("file:")) {
          try { result = await WebAssembly.instantiateStreaming(fetchImpl(url), {}); }
          catch {
            const response = await fetchImpl(url);
            if (!response.ok) throw new Error(`WASM fetch failed: ${response.status}`);
            result = await WebAssembly.instantiate(await response.arrayBuffer(), {});
          }
        } else if (!String(url).startsWith("file:")) {
          const response = await fetchImpl(url);
          if (!response.ok) throw new Error(`WASM fetch failed: ${response.status}`);
          result = await WebAssembly.instantiate(await response.arrayBuffer(), {});
        }
      } catch (err) { if (!String(url).startsWith("file:")) throw err; }
    }
    if (!result && String(url).startsWith("file:") && typeof process !== "undefined") {
      const { readFile } = await import("node:fs/promises");
      result = await WebAssembly.instantiate(await readFile(url), {});
    }
    if (!result) throw new Error("Unable to initialize Onyx health WASM core");
    this.instance = result.instance || result;
    this.exports = this.instance.exports;
    this.ready = true;
    return this;
  }

  get heapBase() { return this.ready ? Number(this.exports.__heap_base?.value ?? 66560) : 0; }
  _ensure(requiredBytes) {
    const mem = this.exports?.memory;
    if (!mem || mem.buffer.byteLength >= requiredBytes) return;
    mem.grow(Math.ceil((requiredBytes - mem.buffer.byteLength) / 65536));
  }
  _putI32(values, offset=0) {
    const arr = Int32Array.from(values || [], v => Number(v || 0) | 0);
    const ptr = this.heapBase + offset;
    this._ensure(ptr + arr.byteLength + 64);
    new Int32Array(this.exports.memory.buffer, ptr, arr.length).set(arr);
    return {ptr,arr};
  }

  hash(text, seed=0) {
    if (!this.ready) return stableHashJs(String(seed||"")+String(text??""));
    const bytes = new TextEncoder().encode(String(text ?? ""));
    const ptr = this.heapBase;
    this._ensure(ptr + bytes.length + 64);
    new Uint8Array(this.exports.memory.buffer, ptr, bytes.length).set(bytes);
    return seed && this.exports.fnv1a_seed ? this.exports.fnv1a_seed(ptr, bytes.length, seed>>>0)>>>0 : this.exports.fnv1a(ptr, bytes.length)>>>0;
  }
  mix(value){ return this.ready && this.exports.mix32 ? this.exports.mix32(Number(value)>>>0)>>>0 : stableHashJs(String(value)); }

  vectorOps(a, b) {
    if (!this.ready) return this._vectorOpsJs(a, b);
    const len = Math.min(a.length, b.length), A=this._putI32(a), B=this._putI32(b,A.arr.byteLength+32);
    return { dot:this.exports.dot_i32(A.ptr,B.ptr,len), a2:this.exports.sqsum_i32(A.ptr,len), b2:this.exports.sqsum_i32(B.ptr,len) };
  }
  weightedDot(a,b,w){
    const len=Math.min(a.length,b.length,w?.length??Infinity); if(!this.ready){let s=0;for(let i=0;i<len;i++)s+=Number(a[i]||0)*Number(b[i]||0)*Number(w?.[i]??1);return s;}
    const A=this._putI32(a), B=this._putI32(b,A.arr.byteLength+32), W=this._putI32(w||new Array(len).fill(1),A.arr.byteLength+B.arr.byteLength+64);
    return this.exports.weighted_dot_i32(A.ptr,B.ptr,W.ptr,len);
  }
  overlapCount(a,b){
    const len=Math.min(a.length,b.length); if(!this.ready){let s=0;for(let i=0;i<len;i++)if(a[i]&&b[i])s++;return s;}
    const A=this._putI32(a),B=this._putI32(b,A.arr.byteLength+32);return this.exports.overlap_count_i32(A.ptr,B.ptr,len);
  }
  sum(values) {
    if (!this.ready) return (values||[]).reduce((n, v) => n + Number(v || 0), 0);
    const A=this._putI32(values); return this.exports.sum_i32(A.ptr,A.arr.length);
  }
  trend(first, last, deadband = 1) {
    if (!this.ready) { const d = last - first; return d > deadband ? 1 : d < -deadband ? -1 : 0; }
    return this.exports.trend_i32(first | 0, last | 0, deadband | 0);
  }
  riskWeighted(flags) {
    const v = key => flags?.[key] ? 1 : 0;
    if (!this.ready) return Math.min(100, v("concern")*20 + ["selfHarm","violence","overdose","breathing","chest","stroke","altered","allergy"].reduce((n,k)=>n+v(k)*100,0));
    return this.exports.risk_weighted(v("selfHarm"),v("violence"),v("overdose"),v("breathing"),v("chest"),v("stroke"),v("altered"),v("allergy"),v("concern"));
  }

  bm25Term({tf=0,idf=1,docLen=1,avgLen=1,k1=1.2,b=0.75}={}){
    if(!this.ready){const norm=1-b+b*(docLen/Math.max(1,avgLen));return idf*((tf*(k1+1))/(tf+k1*norm||1));}
    return this.exports.bm25_term_i32(Math.round(tf),Math.round(idf*1000),Math.max(1,Math.round(docLen)),Math.max(1,Math.round(avgLen)),Math.round(k1*1000),Math.round(b*1000))/1000;
  }
  novelty(overlap,total){if(!this.ready)return total?Math.max(0,1-overlap/total):1;return this.exports.novelty_score_i32(overlap|0,total|0,1000)/1000;}
  recencyBoost(ageHours,halfLifeHours=168,maxBonus=1){if(!this.ready)return Math.max(0,maxBonus*Math.pow(.5,Math.max(0,ageHours)/Math.max(1,halfLifeHours)));return this.exports.recency_boost_i32(Math.max(0,ageHours|0),Math.max(1,halfLifeHours|0),Math.round(maxBonus*1000))/1000;}
  mmr({relevance=0,novelty=1,authority=0,continuity=0,lambda=.78}={}){
    if(!this.ready)return relevance*lambda+novelty*(1-lambda)+authority*.18+continuity*.12;
    return this.exports.mmr_score_i32(Math.round(relevance*1000),Math.round(novelty*1000),Math.round(authority*1000),Math.round(continuity*1000),Math.round(clamp(lambda,0,1)*1000))/1000;
  }
  contextBudget({maxChars=60000,reserveChars=14000,historyChars=18000,minimumRetrieval=6000}={}){
    if(!this.ready)return Math.max(minimumRetrieval,maxChars-reserveChars-historyChars);
    return this.exports.context_budget_i32(maxChars|0,reserveChars|0,historyChars|0,minimumRetrieval|0);
  }
  effort({chars=0,questions=0,complexityHits=0,safety=false}={}){
    const n=this.ready?this.exports.choose_effort_i32(chars|0,questions|0,complexityHits|0,safety?1:0):((safety||complexityHits>=2||chars>900)?3:(complexityHits||chars>300?2:1));
    return n>=3?'high':n===2?'medium':'low';
  }
  responseBudget({inputChars=0,requestedDetail=0,effort='medium'}={}){
    const e=effort==='high'?3:effort==='low'?1:2;
    if(!this.ready)return clamp(900+inputChars/3+requestedDetail*450+e*250,900,4200);
    return this.exports.response_budget_i32(inputChars|0,requestedDetail|0,e)|0;
  }
  simhash(hashes,weights){
    if(!hashes?.length)return 0;if(!this.ready){let acc=new Int32Array(32);for(let i=0;i<hashes.length;i++){const h=Number(hashes[i])>>>0,w=Number(weights?.[i]??1);for(let b=0;b<32;b++)acc[b]+=(h&(1<<b))?w:-w;}let o=0;for(let b=0;b<32;b++)if(acc[b]>=0)o|=(1<<b);return o>>>0;}
    const H=this._putI32(hashes),W=this._putI32(weights||new Array(hashes.length).fill(1),H.arr.byteLength+32);return this.exports.simhash_fold_i32(H.ptr,W.ptr,H.arr.length)>>>0;
  }
  hamming(a,b){if(this.ready&&this.exports.hamming32)return this.exports.hamming32(Number(a)>>>0,Number(b)>>>0);let x=(Number(a)>>>0)^(Number(b)>>>0),c=0;while(x){x&=x-1;c++;}return c;}

  _vectorOpsJs(a, b) { const len=Math.min(a.length,b.length);let dot=0,a2=0,b2=0;for(let i=0;i<len;i++){dot+=a[i]*b[i];a2+=a[i]*a[i];b2+=b[i]*b[i];}return {dot,a2,b2}; }
}

const healthWasm = new OnyxHealthWasm();

// ../../script/onyx-health-safety.js

const RX = Object.freeze({
  selfHarm: /(i (?:want|plan|intend|am going) to (?:die|kill myself|end my life)|suicide plan|i (?:can't|cannot) stay safe|i have the (?:pills|gun|weapon|means))/i,
  concern: /(suicid|self[- ]?harm|cut myself|wish i were dead|don't want to be alive|do not want to be alive)/i,
  violence: /(i (?:want|plan|intend|am going) to (?:kill|shoot|stab|hurt) (?:him|her|them|someone|people)|homicid)/i,
  overdose: /(overdose|took too many|double dose|swallowed a bottle|poisoning)/i,
  breathing: /(can't breathe|cannot breathe|stopped breathing|severe shortness of breath|blue lips|turning blue)/i,
  chest: /(severe chest (?:pain|pressure)|crushing chest|chest pain.*(?:sweat|shortness of breath|dizz|nausea))/i,
  stroke: /(face droop|sudden.*(?:arm|leg).*weak|sudden.*slurred speech|suddenly (?:can't|cannot) speak)/i,
  altered: /(unresponsive|won't wake|will not wake|passed out and won't|sudden confusion|can't tell what is real and.*danger)/i,
  allergy: /(anaphyl|throat closing|severe allergic.*(?:breath|swelling))/i
});

function assessImmediateRisk(message, wasm = null) {
  let shared=null; try{shared=globalThis.OnyxSafetyKernel?.assess?.(message)||null}catch{}
  if(shared){
    const score=wasm?.riskWeighted ? wasm.riskWeighted(shared.flags||{}) : (shared.emergency?100:shared.elevated?20:0);
    return { emergency:Boolean(shared.emergency), elevated:Boolean(shared.elevated), needsSafetyClarification:Boolean(shared.needsSafetyClarification), distress:Boolean(shared.distress), category:shared.category||'', flags:shared.flags||{}, hits:shared.hits||[], score, action:shared.action|| (shared.emergency?"emergency_escalation":shared.elevated?"support_and_direct_assessment":"normal_support") };
  }
  const text = normalizeText(message);
  const flags = Object.fromEntries(Object.entries(RX).map(([k,re]) => [k, re.test(text)]));
  const emergency = ["selfHarm","violence","overdose","breathing","chest","stroke","altered","allergy"].some(k => flags[k]);
  const elevated = emergency || flags.concern;
  const hits = Object.entries(flags).filter(([,v])=>v).map(([k])=>k);
  const score = wasm?.riskWeighted ? wasm.riskWeighted(flags) : (emergency ? 100 : elevated ? 20 : 0);
  return { emergency, elevated, flags, hits, score, action: emergency ? "emergency_escalation" : elevated ? "support_and_direct_assessment" : "normal_support" };
}

function emergencyMessage({country="", includeUS988=true}={}) {
  try{const shared=globalThis.OnyxSafetyKernel?.emergencyMessage?.({country,includeUS988});if(shared)return shared}catch{}
  const lines = [
    "This may be an emergency. Contact local emergency services or go to the nearest emergency department if there is immediate danger, a possible overdose, severe breathing trouble, severe chest pain or pressure, sudden stroke-like symptoms, or someone cannot be kept safe.",
    "If possible, stay with the person, move away from immediate hazards, and involve a trusted person or clinician while help is being contacted."
  ];
  if (includeUS988 && String(country).toUpperCase() === "US") lines.push("In the United States, call or text 988 for suicide, mental-health, or substance-use crisis support; use 911 for life-threatening emergencies.");
  return lines.join(" ");
}

const MEDICATION_BOUNDARIES = Object.freeze([
  "Do not start, stop, increase, decrease, split, combine, or taper a prescription based only on AI advice.",
  "For missed doses, interactions, pregnancy concerns, severe side effects, overdose, or withdrawal risk, contact a prescriber, pharmacist, poison service, urgent care, or emergency service as appropriate.",
  "The assistant may organize medication names, schedules, observed effects, questions, and existing clinician instructions without changing them."
]);

// ../../script/onyx-health-router.js

const ROUTES = [
  ["crisis", /(suicid|kill myself|end my life|self[- ]?harm|overdose|kill (him|her|them|someone)|hurt (him|her|them|someone))/i, 100],
  ["physical_health", /(chest pain|can.?t breathe|cannot breathe|shortness of breath|stroke|seizure|faint|passed out|blood pressure|fever|vomit|nausea|pain|oxygen|glucose|blood sugar|allerg)/i, 45],
  ["autism", /(autis|sensory|meltdown|shutdown|masking|unmask|stimming|nonspeaking|nonverbal|aac|transition|burnout)/i, 32],
  ["adhd", /(adhd|executive dysfunction|time blind|procrastinat|task initiation|working memory|distract|hyperfocus|can't start|cannot start)/i, 32],
  ["dbt", /(dbt|wise mind|distress tolerance|emotion regulation|chain analysis|radical acceptance|dear man|opposite action|check the facts|stop skill)/i, 30],
  ["cbt", /(cbt|thought record|cognitive distort|behavioral activation|automatic thought|reframe|core belief|worry)/i, 28],
  ["trauma", /(trauma|ptsd|cptsd|flashback|dissociat|triggered|hypervigil|freeze response)/i, 27],
  ["psychiatric", /(psychiatr|medication|antidepress|antipsych|mood stabil|mania|psychosis|hallucin|paranoi|ocd|depression|anxiety|panic)/i, 26],
  ["sleep", /(sleep|insomnia|nightmare|bedtime|circadian|can't sleep|cannot sleep)/i, 18],
  ["grief", /(grief|bereav|mourning|died|death|loss of|lost my)/i, 18],
  ["care_coordination", /(appointment|doctor|therapist|psychiatrist|clinician|provider|care plan|what should i tell|visit summary)/i, 16],
  ["executive_support", /(organize|plan|reminder|task|overwhelm|too much|where do i start)/i, 14]
];

function routeIntent(message, context = {}) {
  const text = normalizeText(message);
  const scored = [];
  let sharedRisk=null; try{ sharedRisk=globalThis.OnyxSafetyKernel?.assess?.(text,context)||null; }catch{}
  if(sharedRisk?.emergency) scored.push({name:'crisis',score:1000});
  for (const [name, re, weight] of ROUTES) {
    if(name==='crisis'&&sharedRisk) continue;
    if (re.test(text)) scored.push({name, score:weight});
  }
  for (const name of Array.isArray(context.supportAreas) ? context.supportAreas : []) scored.push({name, score:12});
  scored.sort((a,b)=>b.score-a.score);
  const categories = unique(scored.map(x=>x.name));
  if (!categories.length) categories.push("general_mental_health");
  return { primary: categories[0], categories: categories.slice(0, 6), scored, text };
}

function routeDomains(message) { return routeIntent(message).categories; }

// ../../script/onyx-health-supports.js

const DBT_TOOLS = Object.freeze({
  stop:{name:"STOP",domain:"dbt",steps:["Stop before acting if you can.","Take a small step back or pause.","Observe facts, urges, thoughts, body cues, and the environment.","Proceed with the next effective action rather than the strongest urge."]},
  chain_analysis:{name:"Behavior chain",domain:"dbt",steps:["Define the target behavior without judgment.","Identify the prompting event.","Trace vulnerabilities, thoughts, feelings, body cues, urges, and actions link by link.","Mark places where a skill or environmental change could interrupt the chain.","Plan one repair and one prevention step."]},
  check_facts:{name:"Check the facts",domain:"dbt",steps:["State the emotion and its action urge.","Describe observable facts only.","Notice assumptions or predictions.","Ask whether the emotion intensity fits the facts and threat level.","Choose problem solving, acceptance, or opposite action as appropriate."]},
  dear_man:{name:"DEAR MAN",domain:"dbt",steps:["Describe the facts.","Express your feelings or opinion.","Assert the request or boundary clearly.","Reinforce why cooperation helps.","Stay mindful of the goal.","Appear confident in a way that is accessible to you.","Negotiate if needed without abandoning core limits."]},
  distress_accessible:{name:"Accessible distress tolerance",domain:"dbt",steps:["Lower immediate demands and hazards.","Choose a tolerable grounding anchor: visual, auditory, tactile, cognitive, or relational.","Use breathing-focused skills only if breathing attention is comfortable and medically appropriate.","Use temperature or exertion-based skills only when physically safe.","Reassess safety and the next support connection."]}
});

const CBT_TOOLS = Object.freeze({
  thought_record:{name:"Thought record",domain:"cbt",steps:["Name the situation.","Write the automatic thought accurately.","Rate emotion intensity if useful.","List evidence that supports and does not support the thought.","Write a more balanced alternative.","Choose one small action based on the balanced view."]},
  behavioral_activation:{name:"Behavioral activation",domain:"cbt",steps:["Pick a tiny activity in care, connection, mastery, or pleasure.","Shrink it until it is realistically startable.","Schedule a cue or time.","Do the smallest version.","Notice the outcome without requiring mood to improve immediately."]},
  problem_solving:{name:"Problem solving",domain:"cbt",steps:["Define the problem in one sentence.","Separate controllable from uncontrollable parts.","Generate at least three possible responses.","Choose the least costly workable next step.","Set a review point."]},
  worry_container:{name:"Worry container",domain:"cbt",steps:["Write the worry down.","Decide whether action is possible now.","If yes, identify one action; if no, defer it to a planned review period.","Return attention to the current task using an external cue."]}
});

function buildAdhdPlan(problem,{energy="medium",timeMinutes=15}={}) {
  const base={domain:"adhd",problem:String(problem||"task"),principles:["Externalize memory instead of relying on recall.","Reduce start friction before optimizing the whole task.","Make time visible.","Use environmental cues and accountability when helpful."]};
  if(energy==="low") return {...base,plan:["Define the two-minute version.","Put the first needed object or file in reach.","Set one visible timer or alarm.","Stop after the minimum version unless continuing feels useful and sustainable."]};
  return {...base,plan:["Write the next physical action, not the whole project.",`Set a ${clamp(timeMinutes,5,45)}-minute work window.`,"Remove or cover one competing cue.","Start with a deliberately imperfect first pass.","Leave a visible note for the next action."]};
}

function autismSupportOptions({sensory=false,change=false,communication=false,burnout=false}={}) {
  const options=[];
  if(sensory) options.push("Identify which sensory channels are too intense or too low; change one input at a time when possible.");
  if(change) options.push("Make the change explicit: what stays the same, what changes, when, who is involved, and what the fallback is.");
  if(communication) options.push("Offer written, literal, asynchronous, yes/no, or scripted communication instead of assuming spontaneous speech is easiest.");
  if(burnout) options.push("Reduce demands, masking, and nonessential transitions; prioritize basic needs and recovery over productivity coaching.");
  if(!options.length) options.push("Ask what would make the environment or communication more predictable and tolerable before trying to change the person.");
  return {domain:"autism",options};
}

function accessibilityInstructions(profile={}) {
  const out=[];
  if(profile.lowEnergy) out.push("Use very small steps; offer a minimum-effort option first.");
  if(profile.cognitiveLoad==="low") out.push("Keep to one to three steps at a time; avoid dense paragraphs and long option lists.");
  if(profile.mobilityLimited) out.push("Do not assume standing, walking, exercise, showers, or leaving bed or chair are available; offer seated or lying-down alternatives.");
  if(profile.sensorySensitive) out.push("Do not assume breathing exercises, cold exposure, music, touch, bright visuals, or strong sensory input are soothing; offer alternatives.");
  if(profile.avoidBreathing) out.push("Do not lead with breathing exercises. Offer non-breathing grounding/support choices first unless the user explicitly asks for breathing.");
  if(profile.communication==="literal") out.push("Use concrete, literal wording and make implied social expectations explicit.");
  if(profile.communication==="minimal") out.push("Allow yes/no, scale, multiple-choice, or one-word responses.");
  if(profile.readingDifficulty) out.push("Use short headings, bullets, and plain language; offer a condensed version.");
  if(profile.interoceptionDifficulty) out.push("Do not require precise body-feeling labels; offer observable cues and simple choices.");
  return out;
}

function psychiatricCheckIn({sleep,mood,anxiety,energy,psychosisLike,medicationConcern}={}) {
  return {domain:"psychiatric",observations:{sleep,mood,anxiety,energy,psychosisLike:Boolean(psychosisLike),medicationConcern:Boolean(medicationConcern)},nextQuestions:["What changed from your usual baseline, and when?","How is this affecting sleep, eating, self-care, relationships, work or school, or safety?","Are there thoughts of self-harm, suicide, or harming someone else?","Any new medication, dose change, substance use, missed doses, or abrupt stopping?","Would a concise message for a clinician help?"]};
}

function physicalHealthSupport({symptom="",severity="unknown",knownCondition=false}={}) {
  return {domain:"physical_health",symptom:String(symptom||"unspecified"),severity,scope:"Support tracking, access, appointment preparation, pacing, and safety escalation; do not diagnose.",steps:["Check for emergency warning signs before self-management coaching.","Record onset, pattern, severity, triggers, associated symptoms, and what has already been tried.",knownCondition?"Compare with the person's clinician-provided action plan if one exists.":"Avoid assuming a cause from symptom pattern alone.","Identify access needs such as transport, mobility, communication, sensory support, caregiver help, telehealth, or written summaries.","Escalate worsening, severe, new, or concerning symptoms to an appropriate clinician or emergency service."]};
}

function traumaSupport({grounding=true,trigger=""}={}) {
  return {domain:"trauma",trigger:String(trigger||""),principles:["Orient to present safety without forcing disclosure.","Do not pressure memory retrieval or exposure.","Offer choice, predictability, and control.","Separate present facts from trauma-driven threat predictions without dismissing the reaction."],options:grounding?["Name a few present-time facts.","Choose one tolerable external anchor.","Reduce sensory or social demands if possible.","Decide whether connection, privacy, movement, stillness, or practical problem solving is most useful next."]:[]};
}

function griefSupport() {
  return {domain:"grief",principles:["Do not impose a timeline or stages as a required sequence.","Support practical needs as well as emotion.","Make room for mixed feelings, numbness, anger, relief, guilt, and ordinary moments.","Escalate safety concerns without treating grief itself as pathology."]};
}

function sleepSupport() {
  return {domain:"sleep",principles:["Treat sleep problems as multifactorial rather than a willpower failure.","Notice schedule, environment, pain, medication/substance timing, stress, sensory factors, and circadian cues.","Avoid medical claims about a cause without assessment.","Persistent or severe sleep change, especially with major mood or behavior change, can warrant clinician review."]};
}

function generalMentalHealthSupport() {
  return {domain:"general_mental_health",principles:["Listen before solving.","Reflect the concrete problem and the emotion without inventing a diagnosis.","Offer one manageable next step or ask what kind of help is wanted.","Use low-shame, autonomy-preserving language."]};
}

function supportForRoute(route, context={}) {
  switch(route){
    case "adhd": return buildAdhdPlan(context.problem||context.message,{energy:context.energy,timeMinutes:context.timeMinutes});
    case "autism": return autismSupportOptions(context.autism||{sensory:true,change:true,communication:true,burnout:Boolean(context.burnout)});
    case "dbt": return DBT_TOOLS[context.dbtTool] || DBT_TOOLS.stop;
    case "cbt": return CBT_TOOLS[context.cbtTool] || CBT_TOOLS.problem_solving;
    case "trauma": return traumaSupport(context);
    case "psychiatric": return psychiatricCheckIn(context);
    case "physical_health": return physicalHealthSupport(context);
    case "grief": return griefSupport();
    case "sleep": return sleepSupport();
    case "executive_support": return buildAdhdPlan(context.problem||context.message,{energy:context.energy,timeMinutes:context.timeMinutes});
    default: return generalMentalHealthSupport();
  }
}

// ../../script/onyx-health-retrieval.js

function vectorize(text, dims=256, hasher=stableHashJs) {
  const out = new Int32Array(dims);
  for (const token of tokenize(text)) out[hasher(token) % dims] += 1;
  return out;
}

function cosineSimilarity(aText,bText,{dims=256,wasm=null}={}) {
  const hasher = wasm?.hash ? x => wasm.hash(x) : stableHashJs;
  const a=vectorize(aText,dims,hasher), b=vectorize(bText,dims,hasher);
  let dot=0,a2=0,b2=0;
  if(wasm?.vectorOps) ({dot,a2,b2}=wasm.vectorOps(a,b));
  else for(let i=0;i<dims;i++){dot+=a[i]*b[i];a2+=a[i]*a[i];b2+=b[i]*b[i];}
  return a2&&b2 ? dot / Math.sqrt(a2*b2) : 0;
}

function rankItems(query,items,{k=8,wasm=null,textOf=x=>typeof x==="string"?x:JSON.stringify(x)}={}) {
  return (items||[]).map((item,index)=>({item,index,score:cosineSimilarity(query,textOf(item),{wasm})})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,k);
}

const POS = new Set("calm relieved hopeful okay good better safe supported proud happy glad connected manageable progress rest rested love cared capable".split(" "));
const NEG = new Set("sad hopeless awful bad worse anxious panic angry scared afraid lonely exhausted overwhelmed shame guilty numb unsafe hurt pain miserable desperate".split(" "));
const NEGATORS = new Set(["not","never","no","hardly","without"]);

function lexicalSentiment(text,{wasm=null}={}) {
  const toks=tokenize(text); const weights=[]; let negate=0;
  for(const t of toks){
    if(NEGATORS.has(t)){negate=2;continue;}
    let w=POS.has(t)?1:NEG.has(t)?-1:0;
    if(w && negate>0) w=-w;
    weights.push(w); if(negate>0) negate--;
  }
  const raw=wasm?.sum?wasm.sum(weights):weights.reduce((a,b)=>a+b,0);
  const score=weights.length?clamp(raw/Math.max(2,Math.sqrt(weights.length)*2),-1,1):0;
  const label=score>0.2?"positive":score<-0.2?"negative":Math.abs(score)<=0.05?"neutral":"mixed";
  return {label,score:Number(score.toFixed(3)),raw,matched:weights.filter(Boolean).length,note:"Lexical tone signal only; never use as a diagnosis or risk decision."};
}

function compactContext(items,maxChars=12000) {
  let out="";
  for(const x of items||[]){const line=JSON.stringify(x);if(out.length+line.length+1>maxChars)break;out+=line+"\n";}
  return out;
}

// ../../script/onyx-health-memory.js

class SessionMemory {
  constructor({maxTurns=16,persist=false,storage=null,key="onyx-health-session"}={}) {
    this.maxTurns=maxTurns; this.persist=persist; this.storage=storage; this.key=key; this.turns=[];
    if(persist) this.load();
  }
  add(role,text,meta={}) {
    this.turns.push({role:String(role||"user"),text:sanitizeUserText(text,8000),meta,at:nowIso()});
    this.turns=this.turns.slice(-this.maxTurns); this.save(); return this.turns;
  }
  clear(){this.turns=[];if(this.storage)try{this.storage.removeItem(this.key)}catch{}}
  save(){if(this.persist&&this.storage)try{this.storage.setItem(this.key,JSON.stringify(this.turns))}catch{}}
  load(){if(this.storage)try{const v=JSON.parse(this.storage.getItem(this.key)||"[]");if(Array.isArray(v))this.turns=v.slice(-this.maxTurns)}catch{}}
  history(){return this.turns.map(t=>({role:t.role,content:t.text}));}
  snapshot(){return this.turns.map(t=>({...t}));}
}

// ../../script/onyx-health-clinician.js
function buildClinicianHandoff(data={}) {
  const lines=[];
  const add=(label,v)=>{if(v!==undefined&&v!==null&&String(v).trim()!=="") lines.push(`${label}: ${Array.isArray(v)?v.join(", "):v}`);};
  add("Main concern",data.mainConcern); add("When it started or changed",data.onset); add("Current impact",data.impact);
  add("Safety concerns",data.safety); add("Medication or substance changes",data.medicationChanges); add("Physical symptoms",data.physicalSymptoms);
  add("What has helped",data.helped); add("What has made it worse",data.worse); add("Accessibility needs",data.accessibility); add("Questions for clinician",data.questions);
  return {title:"User-reviewed care summary",text:lines.join("\n"),disclaimer:"This summary organizes the user's report; it does not provide a diagnosis or replace clinical assessment."};
}

function symptomTimeline(entries=[]) {
  return entries.map((e,i)=>({order:i+1,date:e.date||null,symptom:e.symptom||"",severity:e.severity??null,functionImpact:e.functionImpact||"",context:e.context||""}));
}

function diagnosticBoundary() {
  return {screening:"can organize symptoms and screening results",diagnosis:"requires qualified clinical evaluation",medication:"prescribing and dose changes require an authorized clinician"};
}

function buildSupportPlan({goal,barriers=[],supports=[],energy="medium"}={}) {
  const smallest=energy==="low"?"Choose a version that takes about two minutes or less.":"Choose the smallest action that creates visible progress.";
  return {goal:String(goal||"stabilize and identify the next useful step"),barriers,supports,steps:[smallest,"Decide what cue will start the action.","Decide what makes stopping or resting allowed.","Identify who or what can help if the step becomes inaccessible.","Review what happened without grading yourself as a person."],review:"Keep what helped; change the environment, cue, size, or support for what did not."};
}

// ../../script/onyx-health-backend-bridge.js

class OnyxHealthBackendBridge {
  constructor({endpoint,getAuth=()=>({}),fetchImpl=globalThis.fetch}={}) {
    this.endpoint=endpoint; this.getAuth=getAuth; this.fetchImpl=fetchImpl;
  }

  async post(action,data={}) {
    const endpoint=assertString(this.endpoint,"endpoint",4096);
    if(typeof this.fetchImpl!=="function") throw new Error("fetch is unavailable");
    const auth=await this.getAuth();
    const payload={...(auth||{}),action:String(action),data};
    if(!noSecrets(data)) throw new Error("Refusing to send a provider secret through the Onyx health client");
    const response=await this.fetchImpl(endpoint,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8","Accept":"application/json"},body:JSON.stringify(payload)});
    const text=await response.text(); let parsed;
    try{parsed=JSON.parse(text);}catch{parsed={ok:false,error:`Non-JSON backend response (${response.status})`,raw:text.slice(0,1000)};}
    if(!response.ok || parsed?.ok===false) throw new Error(parsed?.error || `Backend request failed (${response.status})`);
    return parsed;
  }

  health(){return this.post("onyx.health",{});}
  dbtSuggest(message,extra={}){return this.post("onyx.dbt.suggest",{message:sanitizeUserText(message),...extra});}
  chat({message,history=[],context={},supportMode="",webSearch=false,useDrive=false,autoRemember=false,reasoningEffort="medium",maxOutputTokens=1200,...extra}={}) {
    return this.post("onyx.chat",{message:sanitizeUserText(message),history,context,supportMode,webSearch:Boolean(webSearch),useDrive:Boolean(useDrive),autoRemember:Boolean(autoRemember),reasoningEffort,maxOutputTokens,...extra});
  }
}

// ../../script/onyx-health-engine.js







class OnyxUnifiedHealthEngine {
  constructor({backend=null,wasm=healthWasm,memory=null,country="",accessibility={},knowledge=[]}={}) {
    this.backend=backend; this.wasm=wasm; this.country=country; this.accessibility=accessibility;
    this.memory=memory || new SessionMemory(); this.knowledge=Array.isArray(knowledge)?knowledge:[];
  }

  async init({wasmUrl}={}) {
    if(this.wasm && !this.wasm.ready) await this.wasm.init(wasmUrl || new URL('../../script/onyx-health-core.wasm',document.baseURI));
    return this;
  }

  analyze(message,context={}) {
    const text=assertString(message,"message");
    const risk=assessImmediateRisk(text,this.wasm);
    const route=routeIntent(text,context);
    const tone=lexicalSentiment(text,{wasm:this.wasm});
    const access=accessibilityInstructions(context.accessibility || this.accessibility || {});
    const supports=route.categories.filter(x=>x!=="crisis").slice(0,3).map(category=>supportForRoute(category,{...context,message:text}));
    const retrieved=rankItems(text,this.knowledge,{k:6,wasm:this.wasm}).map(x=>({score:Number(x.score.toFixed(4)),item:x.item}));
    return {schema:"onyx.health.analysis.v1",risk,route,tone,accessibility:access,supports,retrieved,medicationBoundaries:MEDICATION_BOUNDARIES};
  }

  async respond(message,options={}) {
    const analysis=this.analyze(message,options.context||{});
    this.memory.add("user",message,{route:analysis.route.primary,risk:analysis.risk.action});
    if(analysis.risk.emergency && options.localEmergencyFirst!==false) {
      const response=emergencyMessage({country:options.country||this.country,includeUS988:options.includeUS988!==false});
      this.memory.add("assistant",response,{localSafety:true});
      return {ok:true,local:true,safetyFirst:true,response,analysis};
    }
    if(!this.backend) return {ok:true,local:true,response:null,analysis,packet:this.buildBackendPacket(message,analysis,options)};
    const packet=this.buildBackendPacket(message,analysis,options);
    const remote=analysis.route.primary==="dbt" && options.preferDbtAction ? await this.backend.dbtSuggest(message,packet) : await this.backend.chat(packet);
    const response=String(remote.response||remote.onyxReply||remote.text||"");
    if(response) this.memory.add("assistant",response,{responseId:remote.responseId||"",route:analysis.route.primary});
    return {ok:true,local:false,response,analysis,remote};
  }

  buildBackendPacket(message,analysis,options={}) {
    const context=compactObject({
      healthAnalysis:{risk:analysis.risk,route:analysis.route,tone:analysis.tone,supports:analysis.supports,accessibility:analysis.accessibility},
      retrievedKnowledge:analysis.retrieved,
      userContext:options.context||{}
    });
    return {message,history:options.history||this.memory.history(),context,supportMode:options.supportMode||analysis.route.primary,webSearch:Boolean(options.webSearch),useDrive:Boolean(options.useDrive),autoRemember:Boolean(options.autoRemember),reasoningEffort:options.reasoningEffort||"medium",maxOutputTokens:Number(options.maxOutputTokens||1200)};
  }

  safeLogRecord(message,analysis) {
    return {message:redactForLogs(message),route:analysis.route.primary,risk:analysis.risk.action,tone:analysis.tone.label};
  }
}

// unified health host

'use strict';

const state={ready:false,wasmReady:false,error:'',initializedAt:'',mode:'fallback'};
let engine=null,initPromise=null,memoryProfile='';
const localTurns=[];

function currentProfile(){
  const candidates=[root.OnyxBackendClient?.snapshot?.().profileKey,root.OnyxBackendClient?.activeProfile?.(),root.OurSpaceProfiles?.getActiveProfile?.(),document.documentElement.dataset.ourspaceProfile];
  for(const value of candidates){const key=String(value||'').trim().toLowerCase();if(['william','jasper','shared'].includes(key))return key}
  return 'shared'
}
function ensureProfile(){const next=currentProfile();if(memoryProfile&&next!==memoryProfile){try{engine?.memory?.clear?.()}catch(_){}localTurns.length=0}memoryProfile=next;return next}
function safetyAssessment(message,context={}){try{return root.OnyxSafetyKernel?.assess?.(message,context)||null}catch(_){return null}}
function currentCountry(){try{return root.OnyxSafetyKernel?.configuredCountry?.()||''}catch(_){return''}}
function fallbackRoute(message){
  const text=String(message||'').toLowerCase(),risk=safetyAssessment(text);
  if(risk?.emergency)return{primary:'crisis',categories:['crisis']};
  if(/\b(dbt|wise mind|dear man|radical acceptance|opposite action|distress tolerance)\b/.test(text))return{primary:'dbt',categories:['dbt']};
  if(/\b(cbt|thought record|cognitive distort|automatic thought|reframe)\b/.test(text))return{primary:'cbt',categories:['cbt']};
  if(/\b(adhd|executive|task paralysis|time blind|procrastinat|working memory)\b/.test(text))return{primary:'adhd',categories:['adhd','executive_support']};
  if(/\b(autis|sensory|overstimulat|meltdown|shutdown|masking|burnout)\b/.test(text))return{primary:'autism',categories:['autism']};
  if(/\b(panic|flashback|trauma|dissociat|grounding)\b/.test(text))return{primary:'trauma',categories:['trauma']};
  if(/\b(appointment|doctor|clinician|psychiatr|therap|prescriber|medication|side effect|symptom)\b/.test(text))return{primary:'care_coordination',categories:['care_coordination','health']};
  return{primary:'general_mental_health',categories:['general_mental_health']}
}
function fallbackAnalyze(message,context={}){
  const text=String(message||''),route=fallbackRoute(text),shared=safetyAssessment(text,context),emergency=Boolean(shared?.emergency||route.primary==='crisis');
  const risk=shared?{emergency:shared.emergency,elevated:shared.elevated,needsSafetyClarification:shared.needsSafetyClarification,distress:shared.distress,category:shared.category,flags:shared.flags,hits:shared.hits,score:shared.emergency?100:shared.elevated?20:0,action:shared.action}:{emergency,elevated:emergency,flags:{},hits:[],score:emergency?100:0,action:emergency?'immediate_safety':'normal_support'};
  return{schema:'onyx.health.analysis.local-fallback.v3',risk,route,tone:{label:shared?.distress?'distressed':'neutral',score:0},accessibility:context.accessibility||{},supports:[],retrieved:[],localFallback:true}
}
async function init(){
  if(initPromise)return initPromise;
  initPromise=(async()=>{
    ensureProfile();
    if(location.protocol==='file:'){state.ready=true;state.mode='local-safety-fallback';state.initializedAt=new Date().toISOString();return true}
    try{
      engine=new OnyxUnifiedHealthEngine({backend:null,country:currentCountry(),knowledge:[]});
      await engine.init({wasmUrl:new URL('../../script/onyx-health-core.wasm',document.baseURI)});
      state.ready=true;state.wasmReady=Boolean(engine.wasm?.ready);state.mode='full';state.initializedAt=new Date().toISOString();return true
    }catch(error){state.ready=true;state.wasmReady=false;state.mode='local-safety-fallback';state.error=String(error?.message||error);state.initializedAt=new Date().toISOString();return false}
  })().finally(()=>{try{root.dispatchEvent(new CustomEvent('onyx:health-runtime-ready',{detail:snapshot()}))}catch(_){}});
  return initPromise
}
function snapshot(){return JSON.parse(JSON.stringify({...state,profileKey:ensureProfile()}))}
async function analyze(message,context={}){ensureProfile();await init();if(engine){try{return engine.analyze(String(message||''),context||{})}catch(_){}}return fallbackAnalyze(message,context)}
function addTurn(role,text,meta={}){const profileKey=ensureProfile();if(engine){try{return engine.memory.add(role,text,{...meta,profileKey})}catch(_){}}const turn={role:String(role||'user'),content:String(text||'').slice(0,16000),meta:{...meta,profileKey}};localTurns.push(turn);if(localTurns.length>80)localTurns.splice(0,localTurns.length-80);return localTurns.slice()}
function history(){ensureProfile();if(engine){try{return engine.memory.history()}catch(_){}}return localTurns.map(x=>({...x,meta:{...x.meta}}))}
function clear(){try{engine?.memory?.clear?.()}catch(_){}localTurns.length=0;memoryProfile=currentProfile()}
root.OnyxHealthRuntime=Object.freeze({init,analyze,addTurn,history,clear,snapshot,get engine(){return engine},get kernel(){return engine?.wasm||null}});
init();

})(window);

/* ===== bundled from onyx-dbt.js ===== */
(function(root){'use strict';
async function suggest(message,options={}){const backend=root.OnyxBackendClient;if(!backend?.dbtSuggest)throw new Error('DBT support is unavailable.');return backend.dbtSuggest(String(message||''),{...options,profileKey:backend.activeProfile?.()||'shared'})}
function analyze(message,context={}){return root.OnyxHealthRuntime?.analyze?.(String(message||''),{...context,supportAreas:['dbt']})||null}
root.OnyxDBT=Object.freeze({suggest,analyze});
})(window);

/* ===== bundled from onyx-retrieval.js ===== */
(function(root){'use strict';
const PERSONAL=/\b(?:my|our)\s+(?:project|repo|repository|notes?|draft|files?|codebase|drive|document|folder|workspace|records?|labs?)\b/i;
const EXPLICIT=/\b(?:use|check|read|search|look\s+(?:in|at)|open|compare|inspect|parse)\s+(?:my|our|the attached|these|this)\s+(?:files?|notes?|project|repo|repository|drive|folder|docs?|documents?|records?)\b/i;
const ATTACHED=/\b(?:attached|attachment|uploaded|selected file|this file|these files)\b/i;
function shouldUseDrive({text='',lane='',hasAttachments=false,hints={}}={}){if(hasAttachments||hints?.forceDrive)return true;const value=String(text||'');if(PERSONAL.test(value)||EXPLICIT.test(value)||ATTACHED.test(value))return true;if(String(lane)==='health'&&/\b(?:my (?:records?|labs?|appointment notes?|medical file)|attached)\b/i.test(value))return true;return false}
function policy(){return{privateProfileKnowledge:'backend-only',drive:'explicit-or-bound-context-only',staticClientRetrieval:'shared-safe-only'}}
root.OnyxRetrieval=Object.freeze({shouldUseDrive,policy});
})(window);

/* ===== bundled from onyx-conversation.js ===== */
(function(root){
'use strict';

const LANES=Object.freeze({
  virtual:{label:'Virtual Pet',defaultMode:'chat',state:'listening',web:'ask',drive:'selective',domains:['companionship','casual','pet-care']},
  health:{label:'Virtual Health',defaultMode:'auto',state:'listening',web:'source-sensitive',drive:'selective',domains:['companionship','pet-care','health','dbt','adhd','autism','life','stress','care','work-help']},
  leisure:{label:'Leisure',defaultMode:'chat',state:'thinking',web:'adaptive',drive:'selective',domains:['games','game-advice','hobbies','media','special-interests']},
  work:{label:'Work',defaultMode:'chat',state:'thoughtful',web:'adaptive',drive:'adaptive',domains:['ttrpg','writing','worldbuilding','coding','projects','research','files']}
});
const RX={
  crisis:/\b(suicid|kill myself|end my life|self[- ]?harm|hurt myself|overdose|cannot stay safe|can't stay safe|immediate danger|danger to myself|danger to someone|hurt someone|harm someone)\b/i,
  distress:/\b(panic|panicking|flashback|overwhelmed|dissociat|meltdown|shutdown|unsafe|terrified|trauma|grief|depressed|depression|anxious|anxiety|abuse|assault)\b/i,
  appointment:/\b(appointment|psychiatr|therap|doctor|clinician|prescriber|medication|side effect|symptom|diagnos|visit summary|what should i tell)\b/i,
  dbt:/\b(dbt|wise mind|dear man|tipp?|stop skill|opposite action|check the facts|radical acceptance|emotion regulation|distress tolerance|chain analysis)\b/i,
  cbt:/\b(cbt|thought record|cognitive distort|automatic thought|reframe|behavioral activation|core belief)\b/i,
  journal:/\b(journal|write this down|diary|reflect|reflection|process what happened)\b/i,
  ground:/\b(ground me|grounding|dissociat|flashback|panic attack|meltdown|shutdown)\b/i,
  executive:/\b(can't start|cannot start|stuck|executive|task paralysis|clean|shower|eat|drink|hygiene|routine|organize|organise|procrastinat|time blind|working memory)\b/i,
  current:/\b(latest|today|current|currently|recent|news|this week|this month|look up|search (?:the )?(?:web|internet)|research online|what happened|right now|as of|patch notes?|update|version|release|server status|price|availability)\b/i,
  source:/\b(source|citation|cite|verify|fact[- ]?check|official|documentation|docs|wiki|guide|walkthrough)\b/i,
  deep:/\b(deep|thorough|detailed|analy[sz]e|compare|figure out|walk me through|help me understand|complicated|complex|research|explain why|step by step)\b/i,
  concise:/\b(short|brief|quick|concise|one sentence|few words|tl;?dr)\b/i,
  creative:/\b(write|brainstorm|story|character|worldbuild|idea|design|code|program|debug|build|create|invent)\b/i,
  ttrpg:/\b(ttrpg|d&d|dnd|pathfinder|campaign|encounter|npc|worldbuild|tabletop|dice|dm\b|gm\b)\b/i,
  writing:/\b(writ(?:e|ing)|story|novel|fiction|fanfic|character|plot|scene|dialogue|worldbuild|lore|continuity)\b/i,
  coding:/\b(code|coding|javascript|typescript|html|css|json|wasm|webassembly|debug|repo|github|function|api|backend|frontend)\b/i,
  game:/\b(minecraft|fallout|game|gaming|quest|boss|build|seed|biome|villager|mod|dlc|craft|recipe|achievement|console|xbox|playstation|steam)\b/i,
  image:/\b(?:generate|create|make|draw|render|design)\b[\s\S]{0,80}\b(image|picture|art|portrait|illustration|map|logo|icon|sprite|graphic)\b|\b(image|picture|art|portrait|illustration|map|logo|icon|sprite|graphic)\b[\s\S]{0,80}\b(?:generate|create|make|draw|render|design)\b/i,
  archive:/\b(zip|archive|compressed folder|package (?:these|those|the files)|zipped folder)\b/i,
  fileWrite:/\b(?:create|make|generate|export|send|return|build)\b[\s\S]{0,80}\b(file|folder|zip|json|html|javascript|js\b|css\b|txt\b|markdown|md\b|csv\b|document)\b/i,
  fileRead:/\b(attached|attachment|file|document|pdf|zip|repo|repository|codebase|spreadsheet|sheet|image)\b/i,
  petTone:/\b(pet(?:ting)?|purr|snuggl|cuddl|scratch(?:ies)?|treat|feed|food|water|nap|sleepy|blanket|bow ?tie|meow|mrrp|good (?:boy|kitty)|come here|sit with me|keep me company|stay with me|slow blink|nuzzle)\b/i,
  workTone:/\b(work mode|professor|help me (?:with|build|fix|plan|write|code|research)|project|coding|code|debug|javascript|typescript|html|css|json|repo|github|research|analy[sz]e|compare|write|writing|worldbuild|ttrpg|document|spreadsheet|file|design|plan|explain|teach|steps?|guide)\b/i,
  references:/\b(it|that|this|those|them|same|again|earlier|before|what we talked about|the thing|that part|for that|about that|with that)\b/i,
  listenOnly:/\b(just listen|please (?:just )?listen|listen only|no advice|no solutions|don['’]?t (?:give me )?advice|do not (?:give me )?advice|don['’]?t fix (?:it|this|me)|do not fix (?:it|this|me)|let me vent|i (?:just )?need to vent|let me get this out|i don['’]?t want (?:advice|solutions)|i do not want (?:advice|solutions)|don['’]?t coach me|do not coach me)\b/i,
  question:/\?/g
};
const SENSITIVE_CONTINUITY_RX=/\b(suicid|self[- ]?harm|kill myself|overdose|panic|flashback|trauma|abuse|assault|dissociat|depress|anxi|psychiatr|therap|clinician|diagnos|medication|prescrib|side effect|symptom|medical|health condition|hospital|emergency|crisis|safety plan|dbt|cbt|grief)\b/i;
const CONTINUITY_STOP=new Set('the a an and or but if then this that these those it its my your our their to of in on for with from about is are was were be been being do does did can could would should will just very really what why how when where who which'.split(' '));
const PROFILE_STATES=new Map();
const HISTORY_TTL=30000,MAX_BACKEND_HISTORY=60,MAX_LOCAL_TURNS=64,MAX_TURN_CHARS=16000;

function clean(v){return String(v??'').trim()}
function abortError(){try{return new DOMException('Request cancelled.','AbortError')}catch(_){const e=new Error('Request cancelled.');e.name='AbortError';return e}}
function throwIfAborted(signal){if(signal?.aborted)throw abortError()}
function lower(v){return clean(v).toLowerCase()}
function safetyAssessment(text){try{return root.OnyxSafetyKernel?.assess?.(clean(text))||null}catch(_){return null}}
function crisisTest(text){const a=safetyAssessment(text);return a?Boolean(a.emergency):RX.crisis.test(clean(text))}
function distressTest(text){const a=safetyAssessment(text);return a?Boolean(a.distress):RX.distress.test(clean(text))}
function safetyClarifyTest(text){return Boolean(safetyAssessment(text)?.needsSafetyClarification)}
function laneId(v){const k=lower(v);return Object.prototype.hasOwnProperty.call(LANES,k)?k:'virtual'}
function normalizeRole(role){const r=lower(role);return ['assistant','onyx','bot','model'].includes(r)?'assistant':'user'}
function normalizeTurn(turn){if(!turn)return null;const content=clean(turn.content??turn.text??turn.message);if(!content)return null;const id=clean(turn.id??turn.messageId??turn.chatId??turn.backendId),createdAt=clean(turn.createdAt??turn.timestamp??turn.time),threadId=clean(turn.threadId),lane=clean(turn.lane??turn.tab),responseId=clean(turn.responseId),sensitivity=clean(turn.sensitivity??turn.category);return {role:normalizeRole(turn.role||turn.speaker),content:content.slice(0,MAX_TURN_CHARS),...(id?{id}:{}),...(createdAt?{createdAt}:{}),...(threadId?{threadId}:{}),...(lane?{lane}:{}),...(responseId?{responseId}:{}),...(sensitivity?{sensitivity}:{})}}
function turnKey(t){if(t.id)return'id\u0000'+t.id;if(t.createdAt)return'time\u0000'+t.role+'\u0000'+t.createdAt+'\u0000'+t.content;return''}
function sameOverlapTurn(a,b){if(!a||!b||a.role!==b.role||a.content!==b.content)return false;if(a.id&&b.id&&a.id===b.id)return true;if(a.createdAt&&b.createdAt)return a.createdAt===b.createdAt;if(a.id&&b.id&&a.id!==b.id)return !a.createdAt||!b.createdAt;return true}
function mergeHistory(...sources){const rows=[],seen=new Set();for(const source of sources){const incoming=[];for(const item of (source||[])){const t=normalizeTurn(item);if(!t)continue;const k=turnKey(t);if(k&&seen.has(k))continue;incoming.push(t)}let overlap=0,max=Math.min(rows.length,incoming.length,32);for(let k=max;k>0;k--){let ok=true;for(let i=0;i<k;i++){if(!sameOverlapTurn(rows[rows.length-k+i],incoming[i])){ok=false;break}}if(ok){overlap=k;break}}for(const t of incoming.slice(overlap)){const k=turnKey(t);if(k&&seen.has(k))continue;if(k)seen.add(k);rows.push(t)}}return rows.slice(-MAX_LOCAL_TURNS)}
function continuityWords(value){return new Set((lower(value).match(/[a-z0-9']{3,}/g)||[]).filter(w=>!CONTINUITY_STOP.has(w)).slice(0,80))}
function sensitiveContinuityTurn(turn){return SENSITIVE_CONTINUITY_RX.test(clean(turn?.content))}
function selectCrossTabContinuity(turns,text){const rows=turns||[],blocked=new Set();rows.forEach((t,i)=>{if(sensitiveContinuityTurn(t)){blocked.add(i);if(i>0)blocked.add(i-1);if(i+1<rows.length)blocked.add(i+1)}});const safe=rows.filter((_,i)=>!blocked.has(i)),query=continuityWords(text);if(!safe.length)return[];if(isFollowUpText(text))return safe.slice(-6).map(t=>({role:t.role,content:t.content.slice(0,1400),sensitivity:'non-sensitive'}));const scored=safe.slice(-30).map((t,i)=>{const words=continuityWords(t.content);let overlap=0;for(const w of query)if(words.has(w))overlap++;return{t,score:overlap+(i/1000)}}).filter(x=>x.score>=1).sort((a,b)=>b.score-a.score).slice(0,6).sort((a,b)=>safe.indexOf(a.t)-safe.indexOf(b.t));return scored.map(x=>({role:x.t.role,content:x.t.content.slice(0,1400),sensitivity:'non-sensitive'}))}
function historyFromBackend(result){const out=[],threadId=clean(result?.threadId);for(const row of (result?.messages||result?.history||[])){const structured=clean(row?.content??row?.text),role=clean(row?.role||row?.speaker);if(structured&&role){const t=normalizeTurn({...row,threadId:row?.threadId||threadId});if(t)out.push(t);continue}const chatId=clean(row?.chatId??row?.id??row?.messageId),createdAt=clean(row?.createdAt??row?.timestamp),lane=clean(row?.lane??row?.tab),meta=row?.meta&&typeof row.meta==='object'?row.meta:{},responseId=clean(row?.responseId??meta?.responseId),user=clean(row?.userText??row?.user??row?.message),assistant=clean(row?.onyxReply??row?.assistant??row?.response);if(user)out.push(normalizeTurn({id:chatId?chatId+':user':'',role:'user',content:user,createdAt,threadId,lane,sensitivity:row?.sensitivity||row?.category||''}));if(assistant)out.push(normalizeTurn({id:chatId?chatId+':assistant':responseId?'response:'+responseId+':assistant':'',role:'assistant',content:assistant,createdAt,threadId,lane,responseId,sensitivity:row?.sensitivity||row?.category||''}))}return out.filter(Boolean)}
function freshLane(threadId=''){return {threadId:String(threadId||''),turns:[],lastMode:'chat',lastTopic:'',topicAnchors:[],lastResponseId:'',turnNumber:0}}
function profileState(profile){const p=['william','jasper','shared'].includes(lower(profile))?lower(profile):'shared';if(!PROFILE_STATES.has(p))PROFILE_STATES.set(p,{profile:p,historyAt:0,persisted:[],lanes:{virtual:freshLane(),health:freshLane(),leisure:freshLane(),work:freshLane()}});return PROFILE_STATES.get(p)}
async function backendHistory(backend,profile,signal){const s=profileState(profile),now=Date.now();throwIfAborted(signal);if(s.persisted.length&&now-s.historyAt<HISTORY_TTL)return s.persisted.slice();try{const result=await backend.history(MAX_BACKEND_HISTORY,{signal});throwIfAborted(signal);s.persisted=historyFromBackend(result);s.historyAt=now;return s.persisted.slice()}catch(error){if(signal?.aborted||error?.name==='AbortError')throw abortError();return s.persisted.slice()}}
function mapHealthMode(primary){return ({crisis:'crisis',physical_health:'health',autism:'support',adhd:'executive',dbt:'dbt',cbt:'cbt',trauma:'ground',psychiatric:'appointment',sleep:'support',grief:'ground',care_coordination:'appointment',executive_support:'executive'})[String(primary||'')]||''}
function isFollowUpText(value){if(root.OnyxDataRuntime?.isFollowUpText)return root.OnyxDataRuntime.isFollowUpText(value);const t=clean(value),w=t.match(/[a-z0-9']+/gi)||[];return RX.references.test(t)||(w.length<=4&&/^(?:yes|no|okay|ok|why|how|what|it|that|this|same|again|more)[?! .]*$/i.test(t))}
function isListenOnly(text,requested,health){const r=lower(requested||'');if(crisisTest(text)||health?.risk?.emergency)return false;return r==='listen'||RX.listenOnly.test(text)}
function inferMode(text,requested,health,previousMode='',lane='virtual'){
  const r=lower(requested||'auto');if(r&&r!=='auto'&&r!=='listen'&&r!=='chat')return r;
  if(crisisTest(text)||health?.risk?.emergency)return'crisis';if(safetyClarifyTest(text)||health?.risk?.needsSafetyClarification)return'safety_clarify';if(isListenOnly(text,requested,health))return'listen';
  if(lane==='health'&&RX.workTone.test(text))return'work';
  if(lane==='health'&&RX.petTone.test(text)&&!RX.appointment.test(text)&&!RX.dbt.test(text)&&!RX.cbt.test(text))return'pet';
  if(RX.ground.test(text))return'ground';if(RX.dbt.test(text))return'dbt';if(RX.cbt.test(text))return'cbt';if(RX.appointment.test(text))return'appointment';if(RX.journal.test(text))return'journal';if(RX.executive.test(text))return'executive';
  const mapped=mapHealthMode(health?.route?.primary);if(lane==='health'&&mapped&&mapped!=='chat')return mapped;
  const prior=lower(previousMode);if(isFollowUpText(text)&&['dbt','cbt','appointment','journal','ground','executive','support','health','work','pet'].includes(prior))return prior;
  return lane==='health'?(prior==='work'?'work':prior==='pet'?'pet':'support'):'chat';
}
function compactPet(pet){return {energy:Math.round(Number(pet?.energy)||0),fullness:Math.round(Number(pet?.hunger??pet?.fullness)||0),joy:Math.round(Number(pet?.joy)||0),affection:Math.round(Number(pet?.affection)||0),comfort:Math.round(Number(pet?.comfort)||0),state:clean(pet?.state||pet?.mood)}}
async function healthAnalyze(text,context){try{return await root.OnyxHealthRuntime?.analyze?.(text,context||{})||null}catch(_){return null}}
function supportAreas(mode){const out=[];if(mode==='dbt')out.push('dbt');if(mode==='cbt')out.push('cbt');if(mode==='executive')out.push('executive_support');if(mode==='ground')out.push('trauma');if(mode==='appointment')out.push('care_coordination');if(mode==='health'||mode==='support')out.push('support');return out}
// Backward-compatible name retained for older host integrations; current implementation is supportAreas.
function userSupportAreas(mode){return supportAreas(mode)}
function charCount(turns){return (turns||[]).reduce((n,t)=>n+clean(t?.content).length+16,0)}
function questionCount(text){return (clean(text).match(RX.question)||[]).length}
function detailLevel(text){if(RX.concise.test(text))return 0;if(RX.deep.test(text)||clean(text).length>1200)return 2;return 1}
function complexityHits(text){const patterns=[RX.deep,RX.creative,RX.appointment,RX.dbt,RX.cbt,RX.current,RX.ttrpg,RX.coding,RX.writing];let n=0;for(const re of patterns){re.lastIndex=0;if(re.test(text))n++}return n}
function chooseEffort(text,health,lane){const k=root.OnyxHealthRuntime?.kernel;const safety=Boolean(health?.risk?.emergency||health?.risk?.elevated||crisisTest(text));const project=lane==='work'&&(RX.ttrpg.test(text)||RX.coding.test(text)||RX.writing.test(text));return k?.effort?k.effort({chars:text.length,questions:questionCount(text),complexityHits:complexityHits(text)+(project?1:0),safety}):(safety||project||RX.deep.test(text)||text.length>900?'high':'medium')}
function outputBudget(text,effort,requested){if(Number(requested)>0)return Math.max(900,Math.min(5000,Number(requested)));const k=root.OnyxHealthRuntime?.kernel;return Math.max(900,Math.min(5000,Math.round(k?.responseBudget?k.responseBudget({inputChars:text.length,requestedDetail:detailLevel(text),effort}):1500+(detailLevel(text)*650))))}
function namedAnchors(text){const candidates=[];const rx=/\b[A-Z][a-zA-Z0-9'_-]{2,}(?:\s+[A-Z][a-zA-Z0-9'_-]{2,}){0,2}\b/g;for(const m of String(text||'').match(rx)||[])if(!/^(The|This|That|What|When|Where|Please|Onyx)$/i.test(m))candidates.push(m);return [...new Set(candidates)].slice(0,10)}
function topicFrom(text,history=[]){const anchors=root.OnyxDataRuntime?.extractAnchors?.([...history.filter(t=>t.role==='user').slice(-5).map(t=>t.content),text],12)||[];return {anchors:[...new Set([...namedAnchors(text),...anchors])].slice(0,14),fingerprint:anchors.slice(0,6).join('|')}}
function newTopicLikely(text,state){if(!state.lastTopic||isFollowUpText(text))return false;const current=new Set(root.OnyxDataRuntime?.extractAnchors?.([text],10)||[]),old=new Set(state.topicAnchors||[]);if(!current.size)return false;let overlap=0;for(const t of current)if(old.has(t))overlap++;return overlap===0&&(clean(text).split(/\s+/).length>=5||current.size>=2)&&!RX.references.test(text)}
function summarizeOldTurns(turns,maxChars=5800){if(!turns.length)return'';const user=[],assistant=[];for(const t of turns){const compact=t.content.replace(/\s+/g,' ').slice(0,420);(t.role==='assistant'?assistant:user).push(compact)}const lines=[];if(user.length)lines.push('Earlier user topics: '+user.slice(-8).join(' | '));if(assistant.length)lines.push('Earlier Onyx responses covered: '+assistant.slice(-5).join(' | '));return lines.join('\n').slice(0,maxChars)}
function packHistory(turns,{maxChars=24000,protectTurns=14}={}){const normalized=mergeHistory(turns),protectedRows=normalized.slice(-protectTurns),older=normalized.slice(0,-protectTurns);let used=charCount(protectedRows),chosen=[];for(let i=older.length-1;i>=0;i--){const c=older[i].content.length+16;if(used+c>maxChars)break;chosen.unshift(older[i]);used+=c}const omitted=older.slice(0,older.length-chosen.length),digest=summarizeOldTurns(omitted);if(digest&&used+digest.length+32<=maxChars){chosen.unshift({role:'user',content:'[Conversation continuity summary — do not treat as a new request]\n'+digest});used+=digest.length+32}return {turns:[...chosen,...protectedRows],omittedTurns:omitted.length,characters:used,digestCharacters:digest.length}}
function stylePlan(text,mode,lane){const concise=RX.concise.test(text),detail=detailLevel(text),listenOnly=mode==='listen',emotional=distressTest(text)||['crisis','safety_clarify','ground','listen'].includes(mode),creative=!listenOnly&&(RX.creative.test(text)||lane==='work');return {responseIntent:listenOnly?'listen_only':mode==='safety_clarify'?'safety_clarify':'normal',verbosity:concise?'concise':detail===2&&!listenOnly?'detailed':'natural',tone:emotional?'warm-grounded':lane==='health'&&mode==='work'?'collaborative-professor':lane==='health'&&mode==='pet'?'affectionate-companion':lane==='leisure'?'playful-knowledgeable':lane==='work'?'collaborative-competent':'familiar-direct',structure:listenOnly?'conversational':creative?'collaborative':detail===2?'organized':'conversational',maxFollowUpQuestions:listenOnly?0:mode==='chat'?1:0,avoidRepeatedGreeting:true,respondBeforeCoaching:!listenOnly,noAdvice:listenOnly,suppressSkills:listenOnly,suppressWorksheets:listenOnly,suppressActionPlans:listenOnly,allowSafetyIntervention:true,noForcedTherapyLanguage:listenOnly||lane!=='health',preserveOnyxVoice:true,professorStillOnyx:true}}
function stateFor(text,mode,response,health,lane,toolsUsed=[]){
  const cue=lower(response?.behavior?.state||response?.behaviorCue?.state||response?.state),toolText=toolsUsed.join('|').toLowerCase(),out=clean(response?.response||response?.onyxReply||response?.text||response?.reply),instructional=/\b(step|first|next|do this|try this|here(?:'s| is) how|plan|checklist|guide|instructions?)\b/i.test(out);
  const immediateSafety=mode==='crisis'||crisisTest(text)||Boolean(health?.risk?.emergency);
  if(immediateSafety)return'caring';
  if(mode==='listen')return'listening';
  if(mode==='safety_clarify')return'caring';
  if(lane==='health'&&mode==='work')return /\b(search|research|debug|analy[sz]e|compare|code|file|repo|project)\b/i.test(text)?'thinking':'advising_professor';
  if(lane==='health'&&mode==='pet')return /\b(purr|snuggl|cuddl|pet|scratch|treat|feed|blanket|nuzzle|slow blink)\b/i.test(text)?'snuggly':'listening';
  if(/care|comfort|service_alert/.test(cue)||['ground','health'].includes(mode)||distressTest(text)||health?.risk?.elevated)return'caring';
  if(/professor|advis|professor_support/.test(cue)||['dbt','cbt','appointment'].includes(mode))return lane==='health'?'advising_professor':'thoughtful';
  if(/judg|playful_chat/.test(cue))return /affection|love|snug|purr/i.test(cue)?'purring':'judgmental';
  if(/purr/.test(cue))return'purring';
  if(/listen|active_listening|casual_chat/.test(cue))return'listening';
  if(/thought/.test(cue)||['journal','executive','support'].includes(mode))return'thoughtful';
  if(/think/.test(cue))return'thinking';
  if(/web|url|parse|drive|retriev|search|analysis/.test(toolText))return instructional?'thinking':'thoughtful';
  if(/file|archive|image|code/.test(toolText))return instructional?'thinking':'thoughtful';
  if(lane==='work')return instructional?'thinking':'thoughtful';
  if(lane==='leisure')return instructional?'thinking':'thoughtful';
  return'listening'
}
function historyMeta(history,text){const users=history.filter(x=>x.role==='user').slice(-6).map(x=>x.content);return {turnCount:history.length,recentUserTurns:users,followUpLikely:isFollowUpText(text),referencesPriorContext:RX.references.test(text)}}
function referencesFor(retrieved,core,profileContext,toolRefs=[]){const refs=[];if(retrieved?.context)refs.push({type:'ourspace-local-expanded-context',title:'Relevant Onyx and OurSpace context',text:retrieved.context});if(profileContext)refs.push({type:'current-profile-context',title:'Current profile facts',text:JSON.stringify(profileContext)});if(core)refs.push({type:'onyx-conversation-core',title:'Onyx conversation identity and orchestration',text:JSON.stringify(core)});for(const r of toolRefs||[])if(r?.text)refs.push({type:r.type||'tool-result',title:r.title||'Tool result',text:String(r.text).slice(0,70000)});return refs}
function extractUrls(text){const out=[];for(const m of String(text||'').match(/https?:\/\/[^\s<>"')\]]+/gi)||[]){try{const u=new URL(m);if(/^https?:$/.test(u.protocol)&&!out.includes(u.href))out.push(u.href)}catch(_){}}return out.slice(0,3)}
function attachmentRecords(items){return (items||[]).map(x=>({fileId:clean(x?.fileId||x?.id),name:clean(x?.name||x?.fileName),mimeType:clean(x?.mimeType||x?.type),sizeBytes:Number(x?.sizeBytes||x?.size||0)||0,url:clean(x?.url)})).filter(x=>x.fileId||x.name).slice(0,12)}
function intentDomains(text,lane){const out=[...LANES[lane].domains];if(RX.ttrpg.test(text))out.push('ttrpg');if(RX.writing.test(text))out.push('writing');if(RX.coding.test(text))out.push('coding');if(RX.game.test(text))out.push('games');return [...new Set(out)]}
function planTools(text,lane,attachments,mode,health,toolHints={}){
  const urls=extractUrls(text),hasFiles=attachments.length>0,hints=toolHints&&typeof toolHints==='object'?toolHints:{};
  const explicitWeb=Boolean(hints.forceWeb)||RX.current.test(text)||RX.source.test(text)||/\b(search|browse|internet|web)\b/i.test(text);
  const image=Boolean(hints.imageIntent)||RX.image.test(text);
  const archive=Boolean(hints.forceArchive)||RX.archive.test(text);
  const write=Boolean(hints.forceWrite)||RX.fileWrite.test(text)||archive||image;
  const serious=mode==='crisis'||Boolean(health?.risk?.emergency);
  const leisureFresh=lane==='leisure'&&/\b(patch|patch notes?|version|update|release|server status|current|today|this week|wiki|walkthrough|price|availability|news|new season|event|hotfix|rotation|season|edition)\b/i.test(text);
  const gameVersionSensitive=lane==='leisure'&&RX.game.test(text)&&/\b(best build|meta|spawn|seed|biome|villager|recipe|craft|drop rate|quest|boss|location|achievement|mechanic|does .* still|can .* still|bedrock|java edition|console version)\b/i.test(text);
  const workExternal=lane==='work'&&/\b(repo|repository|github|documentation|docs|package|library|framework|version|latest|web research|research online|source|citation|standard|specification|errata|release notes?)\b/i.test(text);
  const ttrpgRules=lane==='work'&&RX.ttrpg.test(text)&&/\b(rules?|srd|edition|errata|official|sourcebook|stat block|spell|feat|class|subclass|monster|item|2014|2024)\b/i.test(text);
  const healthEvidence=lane==='health'&&/\b(medication|medicine|drug|side effect|interaction|contraindication|dose|dosage|guideline|official guidance|fda|cdc|nih|nhs)\b/i.test(text);
  const webAllowed=!serious&&(explicitWeb||urls.length>0||leisureFresh||gameVersionSensitive||workExternal||ttrpgRules||healthEvidence);
  const useDrive=Boolean(root.OnyxRetrieval?.shouldUseDrive?.({text,lane,hasAttachments:hasFiles,hints}))||hasFiles;
  const parseFiles=hasFiles&&(Boolean(hints.forceParse)||!archive);
  return {urls,explicitWeb,webAllowed,useDrive,parseFiles,image,archive,write,allowExternalTools:Boolean(urls.length||webAllowed||write),allowAssetGeneration:image,allowWrites:write,domains:intentDomains(text,lane),reason:{leisureFresh,gameVersionSensitive,workExternal,ttrpgRules,healthEvidence},manualHints:{forceWeb:Boolean(hints.forceWeb),imageIntent:Boolean(hints.imageIntent),forceArchive:Boolean(hints.forceArchive),forceWrite:Boolean(hints.forceWrite),forceParse:Boolean(hints.forceParse)}};
}
function toolRef(type,title,text){return {type,title,text:clean(text)}}
function citationList(value){return Array.isArray(value)?value.map(x=>typeof x==='string'?x:(x?.url||x?.href||x?.source||'')).filter(Boolean).slice(0,20):[]}
async function mapLimit(items,limit,worker,signal){const rows=Array.isArray(items)?items:[],out=new Array(rows.length);let cursor=0;async function runner(){while(true){throwIfAborted(signal);const i=cursor++;if(i>=rows.length)return;out[i]=await worker(rows[i],i)}}const n=Math.min(Math.max(1,Number(limit)||1),rows.length);await Promise.all(Array.from({length:n},runner));return out}
async function runPreTools(backend,{text,lane,attachments,plan,effort,threadId,signal}){
  const refs=[],artifacts=[],citations=[],used=[],notes=[];throwIfAborted(signal);
  if(plan.urls.length){
    const results=await mapLimit(plan.urls.slice(0,2),2,async url=>{try{throwIfAborted(signal);const r=await backend.urlFetch(url,{sessionId:threadId,signal});return{ok:true,url,body:clean(r?.response||r?.text||r?.content)}}catch(e){if(signal?.aborted||e?.name==='AbortError')throw abortError();return{ok:false,url,note:backend.publicError?.(e)||'URL fetch unavailable.'}}},signal);
    for(const row of results){if(!row)continue;if(row.ok){if(row.body)refs.push(toolRef('public-url','Fetched URL: '+row.url,row.body));used.push('url.fetch')}else notes.push(row.note)}
  }
  if(plan.parseFiles){
    const results=await mapLimit(attachments.slice(0,12),3,async file=>{try{throwIfAborted(signal);const r=await backend.fileParse(file.fileId||file,{instructions:'Analyze this attached file for the current user request. Preserve structure, distinguish file content from inference, and surface the details most relevant to the request.',reasoningEffort:effort,sessionId:threadId,signal});return{ok:true,file,body:clean(r?.analysis||r?.response||r?.text)}}catch(e){if(signal?.aborted||e?.name==='AbortError')throw abortError();return{ok:false,file,note:(file.name||'File')+': '+(backend.publicError?.(e)||'could not be parsed.')}}},signal);
    for(const row of results){if(!row)continue;if(row.ok){if(row.body)refs.push(toolRef('parsed-file','Parsed file: '+(row.file.name||'file'),row.body));used.push('file.parse')}else notes.push(row.note)}
  }
  if(plan.archive&&attachments.some(x=>x.fileId)){
    try{throwIfAborted(signal);const r=await backend.fileArchive(attachments.map(x=>x.fileId).filter(Boolean),deriveArchiveName(text),{timeout:90000,signal});artifacts.push(...backend.extractArtifacts(r));used.push('file.archive');refs.push(toolRef('archive-result','Archive created','A ZIP archive was created from the attached files.'))}catch(e){if(signal?.aborted||e?.name==='AbortError')throw abortError();notes.push(backend.publicError?.(e)||'Archive could not be created.')}
  }
  if(plan.image){
    try{throwIfAborted(signal);const r=await backend.imageGenerate(text,{name:'onyx-generated-image',sessionId:threadId,timeout:120000,signal});artifacts.push(...backend.extractArtifacts(r));used.push('image.generate');refs.push(toolRef('image-result','Generated image','The requested image generation completed.'));if(r?.revisedPrompt)refs.push(toolRef('image-prompt','Image generation interpretation',r.revisedPrompt))}catch(e){if(signal?.aborted||e?.name==='AbortError')throw abortError();notes.push(backend.publicError?.(e)||'Image generation could not finish.')}
  }
  if(plan.explicitWeb&&!plan.urls.length&&!plan.image){
    try{throwIfAborted(signal);const r=await backend.webSearch(text,{reasoningEffort:effort,maxOutputTokens:2200,sessionId:threadId,timeout:70000,signal});const body=clean(r?.response||r?.text);if(body)refs.push(toolRef('web-research','Current web research',body));citations.push(...citationList(r?.citations));used.push('web.search')}catch(e){if(signal?.aborted||e?.name==='AbortError')throw abortError();notes.push(backend.publicError?.(e)||'Web research could not finish.')}
  }
  return {refs,artifacts,citations,used:[...new Set(used)],notes};
}
function deriveArchiveName(text){const m=String(text||'').match(/(?:name|called)\s+["']?([\w ._-]{2,80})["']?/i);return (m?.[1]||'onyx-files').replace(/\.zip$/i,'').trim()||'onyx-files'}
function fileExtensionFromRequest(text){const m=lower(text).match(/\.(json|html|js|css|txt|md|csv)\b|\b(json|html|javascript|js|css|text|txt|markdown|md|csv) file\b/);const raw=m?.[1]||m?.[2]||'';return ({javascript:'js',text:'txt',markdown:'md'})[raw]||raw}
function extractLocalTextArtifacts(response,requestText){
  const out=[],seen=new Set(),rx=/(?:^|\n)FILE:\s*([^\n]{1,160})\s*\n```[^\n]*\n([\s\S]*?)```/gi;let m;
  while((m=rx.exec(response))){const name=m[1].trim().replace(/[\\/:*?"<>|]+/g,'_'),content=m[2];if(name&&content&&!seen.has(name)){seen.add(name);out.push({kind:'file',name,mimeType:mimeFromName(name),content})}}
  if(!out.length){const ext=fileExtensionFromRequest(requestText),blocks=[...String(response||'').matchAll(/```[^\n]*\n([\s\S]*?)```/g)];if(ext&&blocks.length===1)out.push({kind:'file',name:'onyx-output.'+ext,mimeType:mimeFromName('x.'+ext),content:blocks[0][1]})}
  return out.slice(0,12);
}
function mimeFromName(name){const ext=String(name||'').split('.').pop().toLowerCase();return ({json:'application/json',html:'text/html',js:'text/javascript',css:'text/css',txt:'text/plain',md:'text/markdown',csv:'text/csv'})[ext]||'text/plain'}
function dedupeArtifacts(items){const out=[],seen=new Set();for(const a of items||[]){if(!a)continue;const key=[a.fileId||'',a.url||'',a.name||a.fileName||'',a.content!=null?'content:'+String(a.content).length:'',a.base64?'base64:'+String(a.base64).length:''].join('|');if(seen.has(key))continue;seen.add(key);out.push(a)}return out.slice(0,24)}
async function maybeArchiveGenerated(backend,artifacts,localArtifacts,plan,text,signal){
  throwIfAborted(signal);if(!plan.archive)return [];
  const fileIds=artifacts.map(x=>x.fileId).filter(Boolean);
  for(const local of localArtifacts){
    if(fileIds.length>=50)break;
    try{throwIfAborted(signal);const blob=new File([local.content],local.name,{type:local.mimeType||'text/plain'}),up=await backend.fileUpload(blob,{purpose:'Onyx generated artifact',signal}),a=backend.extractArtifacts(up);for(const r of a){if(r.fileId){fileIds.push(r.fileId);local.fileId=r.fileId;local.url=r.url||local.url}}
    }catch(error){if(signal?.aborted||error?.name==='AbortError')throw abortError()}
  }
  throwIfAborted(signal);if(!fileIds.length)return [];
  try{throwIfAborted(signal);const z=await backend.fileArchive(fileIds,deriveArchiveName(text),{signal});throwIfAborted(signal);return backend.extractArtifacts(z)}catch(error){if(signal?.aborted||error?.name==='AbortError')throw abortError();return []}
}

async function reply(input){
  const text=clean(input?.text||input?.message);if(!text)throw new Error('Message is empty.');
  const signal=input?.signal;throwIfAborted(signal);
  const backend=root.OnyxBackendClient;if(!backend)return null;
  if(!backend.available?.())await backend.waitForAuthContext?.(3200,signal);throwIfAborted(signal);
  if(!backend.available?.())return null;
  const lane=laneId(input?.lane||input?.tab),profile=(await backend.resolveProfile?.({signal}))||backend.activeProfile(),pstate=profileState(profile),requestedThread=clean(input?.threadId),threadId=requestedThread||backend.stableThread(profile),isolateThreadHistory=input?.isolateThreadHistory===true;
  let lstate=pstate.lanes[lane]||freshLane(threadId);if(lstate.threadId&&lstate.threadId!==threadId)lstate=freshLane(threadId);lstate.threadId=threadId;
  const localHistory=Array.isArray(input?.history)?input.history:[];
  const persistedAll=await backendHistory(backend,profile,signal);throwIfAborted(signal);
  const persisted=isolateThreadHistory?[]:persistedAll;
  const crossTabContinuity=isolateThreadHistory?selectCrossTabContinuity(persistedAll,text):[];
  const historyAll=mergeHistory(persisted,lstate.turns,localHistory),topicReset=newTopicLikely(text,lstate);
  const requested=lower(input?.mode||LANES[lane].defaultMode),preMode=topicReset?'auto':requested,health=await healthAnalyze(text,{supportAreas:supportAreas(preMode),message:text,accessibility:input?.accessibility||{},profileKey:profile,lane}),mode=inferMode(text,input?.mode,health,topicReset?'chat':lstate.lastMode,lane);
  const effort=chooseEffort(text,health,lane),maxOutputTokens=outputBudget(text,effort,input?.maxOutputTokens),packed=packHistory(historyAll,{maxChars:effort==='high'?32000:25000,protectTurns:effort==='high'?18:14}),attachments=attachmentRecords(input?.attachments),plan=planTools(text,lane,attachments,mode,health,input?.toolHints||{});
  const [retrieved,profileContext,core,pre]=await Promise.all([
    root.OnyxDataRuntime?.retrieve?.(text,{profileId:profile,history:topicReset?[]:packed.turns,maxChars:effort==='high'?42000:32000,maxHits:effort==='high'?34:26}).catch(()=>null),
    root.OnyxDataRuntime?.currentProfile?.(profile).catch(()=>null),
    root.OnyxDataRuntime?.core?.().catch(()=>null),
    runPreTools(backend,{text,lane,attachments,plan,effort,threadId,signal})
  ]);throwIfAborted(signal);
  const listenOnly=mode==='listen',topic=topicFrom(text,historyAll),style=stylePlan(text,mode,lane),serious=mode==='crisis'||crisisTest(text)||Boolean(health?.risk?.elevated),requestedMemory=lower(input?.memoryPolicy||'auto'),memoryDecision=root.OnyxMemory?.resolve?.({lane,requested:requestedMemory,serious})||{policy:(requestedMemory==='on'||requestedMemory==='off')?requestedMemory:(lane==='health'?'off':'on'),durable:requestedMemory==='on'&&!serious},memoryPolicy=memoryDecision.policy,autoRemember=Boolean(memoryDecision.durable),preGroundedWeb=pre.used.includes('web.search')||pre.used.includes('url.fetch'),preHandledExternal=pre.used.some(x=>['web.search','url.fetch','file.parse','file.archive','image.generate'].includes(x)),capabilityContract=backend.snapshot?.().capabilityContract||null;
  const context={
    schema:'ourspace.onyx.client-context.v9',moduleMode:'support-pet-module-only',conversationPolicy:'continuous-account-scoped-multi-lane',tabLane:lane,tabLabel:LANES[lane].label,requestedMode:requested,resolvedMode:mode,responseIntent:listenOnly?'listen_only':mode==='safety_clarify'?'safety_clarify':'normal',listenOnly,serious,safetyAssessment:safetyAssessment(text),pet:compactPet(input?.pet),healthAnalysis:health||null,supportPreferences:input?.accessibility&&typeof input.accessibility==='object'?input.accessibility:{},
    llmOrchestration:{architecture:'Gemini generation + AI-Brain tools/retrieval + profile-scoped frontend orchestration',threadId,turnNumber:lstate.turnNumber+1,reasoningEffort:effort,maxOutputTokens,history:historyMeta(packed.turns,text),historyPacking:{characters:packed.characters,omittedTurns:packed.omittedTurns,digestCharacters:packed.digestCharacters,newestTurnsProtected:true,oldestContextTrimmedFirst:true},topic:{reset:topicReset,activeAnchors:topic.anchors,previousAnchors:lstate.topicAnchors||[],followUp:isFollowUpText(text)},responseStyle:style,memoryTiers:isolateThreadHistory?['recent-verbatim-turns','active-thread-topic','bounded-account-continuity','retrieved-long-term-context']:['recent-verbatim-turns','active-tab-topic','cross-tab-backend-history','retrieved-long-term-context'],domains:plan.domains},
    capabilityPlan:{webAllowed:plan.webAllowed,webAlreadyGrounded:preGroundedWeb,useDrive:plan.useDrive,allowWrites:plan.allowWrites,allowAssetGeneration:plan.allowAssetGeneration,allowExternalTools:plan.allowExternalTools,reason:plan.reason,manualHints:plan.manualHints,backendCapabilities:capabilityContract,attachments:attachments.map(x=>({name:x.name,mimeType:x.mimeType,sizeBytes:x.sizeBytes,fileId:x.fileId?'available':''})),preTools:pre.used,toolNotes:pre.notes},
    conversationCore:core||null,conversationContinuity:historyMeta(packed.turns,text),memoryPolicy:{requested:memoryPolicy,durable:autoRemember,healthDefaultsOff:lane==='health',seriousTurnsNeverAutoRemember:true},crossTabContinuity:crossTabContinuity.length?{scope:'same-profile relevant non-sensitive Onyx conversation only',purpose:'preserve useful continuity without carrying health/crisis/medical text across tabs',turns:crossTabContinuity}:null,localKnowledge:{authorityOrder:retrieved?.authorityOrder||[],continuityQuery:retrieved?.continuityQuery||text,topicAnchors:retrieved?.topicAnchors||topic.anchors,retrievedContext:retrieved?.context||'',retrievedSources:(retrieved?.hits||[]).map(h=>({group:h.group,source:h.source,path:h.path,priority:h.priority,score:h.retrievalScore,authority:h.authority})),currentProfileContext:profileContext||null},
    tabBehavior:{virtual:'Companion conversation and pet care remain genuine conversation; do not force therapy framing.',health:'This is one continuous Virtual Health conversation. Follow the user’s tone naturally: affectionate/casual pet language should feel like companion Onyx; project, explanation, research, coding, writing, planning, or other work-like language should shift into Professor Onyx without starting a new thread. Health/support requests remain careful and accurate. Professor mode stays recognizably Onyx: warm, observant, dry when appropriate, non-shaming, accurate, and serious when safety requires it. Converse first; do not turn every reply into a worksheet, checklist, or lecture unless the user asks for one. If responseIntent is listen_only, stay receptive and do not coach, prescribe a skill, make an action plan, or switch into professor posture unless immediate safety requires direct intervention.',leisure:'Be an enthusiastic, competent companion for games and special interests. Use current web research when facts may have changed, especially game versions, patches, mechanics, and live information.',work:'Collaborate deeply on TTRPGs, writing, worldbuilding, coding, research, and project files. Inspect relevant files before making file-specific claims, and create concrete files or archives when requested and supported.'}[lane],
    profileInterestGuidance:'Use only authenticated backend-returned profile context. Do not infer or embed private profile facts on the client.',
    frontendRules:{useBackendNativeOnyxActions:true,naturalLanguageAction:'onyx.chat',answerNewestRequestDirectly:true,maintainNaturalMultiTurnConversation:true,preserveRelevantCrossTabContinuity:true,personalityAcrossEveryTab:true,professorModeStillOnyx:true,professorVisualAndAdvisingStateHealthLaneOnly:true,ordinaryConversationMustNotBeForcedIntoTherapy:true,listenOnlyIsBindingUnlessImmediateSafety:true,listenOnlySuppressesAdviceSkillsWorksheetsAndActionPlans:true,safetyClarificationMustBeBriefAndNonAssumptive:true,userSelectedSupportPreferencesAreAuthoritative:true,doNotInferDiagnosisFromSupportPreferences:true,toolResultsMustBeExplainedInOnyxVoice:true,useWebWhenFreshnessVersionOrSourcesMatter:true,avoidWebForPureCreativeConversation:true,parseRelevantAttachmentsBeforeAnswering:true,noMissedCarePenalty:true,noRelationshipDecay:true,doNotInventProfileFacts:true,profileIsolationRequired:true,sensitiveHealthDoesNotCrossTabsByDefault:true,doNotExposeToolTrace:true,doNotExposeCredentials:true,doNotExposeBackendInternals:true,neverClaimAnArtifactWasCreatedUnlessReturned:true,generatedArtifactsShouldBeConcreteWhenAvailable:true,textFileFallbackProtocol:'When the user explicitly asks for a text/code file and no native artifact tool returns a file, emit each requested file as FILE: filename.ext followed immediately by one fenced code block containing the complete file. Do not use this protocol for ordinary chat.'}
  };
  const refs=referencesFor(retrieved,core,profileContext,pre.refs),data={message:text,text,responseIntent:listenOnly?'listen_only':mode==='safety_clarify'?'safety_clarify':'normal',listenOnly,supportMode:mode,chatMode:mode,mode:(lane==='health'&&['dbt','cbt','appointment','support','health','work'].includes(mode))?'professor':'chat',mood:clean(input?.pet?.state||input?.pet?.mood),history:packed.turns,threadId,useBrain:true,ai:true,useDrive:plan.useDrive,autoRemember,memoryClass:lane==='health'?'protected-health':'ordinary',webSearch:plan.webAllowed&&!preGroundedWeb,allowWrites:plan.allowWrites,allowAssetGeneration:plan.allowAssetGeneration&&!pre.used.includes('image.generate'),allowExternalTools:plan.allowExternalTools&&!preHandledExternal,reasoningEffort:effort,maxOutputTokens,context,references:refs};
  const brainChatOptions={timeout:effort==='high'||plan.write?90000:70000,signal};const result=await (root.OnyxBrainLink?.chat?root.OnyxBrainLink.chat(data,brainChatOptions):backend.chat(data,brainChatOptions));throwIfAborted(signal);const out=clean(result?.response||result?.onyxReply||result?.text||result?.reply);if(!out)throw new Error('Onyx backend returned no conversation text.');
  const chatArtifacts=backend.extractArtifacts?.(result)||[],localArtifacts=plan.write?extractLocalTextArtifacts(out,text):[],archivePlan={...plan,archive:plan.archive&&!pre.used.includes('file.archive')},postZip=await maybeArchiveGenerated(backend,[...pre.artifacts,...chatArtifacts],localArtifacts,archivePlan,text,signal),artifacts=dedupeArtifacts([...pre.artifacts,...chatArtifacts,...localArtifacts,...postZip]);
  const citations=[...new Set([...pre.citations,...citationList(result?.citations)])].slice(0,24),toolsUsed=[...new Set([...pre.used,...((result?.toolTrace||[]).map(x=>clean(x?.name)).filter(Boolean))])];
  try{root.OnyxHealthRuntime?.addTurn?.('user',text,{mode,profile,threadId,lane});root.OnyxHealthRuntime?.addTurn?.('assistant',out,{mode,profile,responseId:result?.responseId||'',threadId,lane})}catch(_){}
  const backendChatId=clean(result?.chatId||result?.messageId),backendResponseId=clean(result?.responseId),turnStamp=new Date().toISOString(),turnNonce=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);lstate.turns=mergeHistory(lstate.turns,[{id:backendChatId?backendChatId+':user':'local-user-'+turnNonce,role:'user',content:text,createdAt:turnStamp,threadId,lane},{id:backendChatId?backendChatId+':assistant':backendResponseId?'response:'+backendResponseId+':assistant':'local-assistant-'+turnNonce,role:'assistant',content:out,createdAt:turnStamp,threadId,lane,responseId:backendResponseId}]);lstate.lastMode=mode;lstate.turnNumber++;lstate.lastTopic=topic.fingerprint||lstate.lastTopic;lstate.topicAnchors=topic.anchors;lstate.lastResponseId=clean(result?.responseId);pstate.historyAt=Date.now();pstate.lanes[lane]=lstate;
  return {text:out,state:stateFor(text,mode,result,health,lane,toolsUsed),mode,responseIntent:listenOnly?'listen_only':mode==='safety_clarify'?'safety_clarify':'normal',listenOnly,lane,memoryPolicy,durableMemory:autoRemember,profileKey:clean(result.profileKey||result.profile||profile),threadId,artifacts,citations,toolsUsed,historyUsed:packed.turns.length,historyOmitted:packed.omittedTurns,webSearch:plan.webAllowed,reasoningEffort:effort,maxOutputTokens,topicReset};
}
function clearHistoryCache(profile){if(profile){PROFILE_STATES.delete(lower(profile));return}PROFILE_STATES.clear()}
function resetLane(profile,lane,threadId=''){const p=profileState(profile||root.OnyxBackendClient?.activeProfile?.()||'shared'),id=laneId(lane);p.lanes[id]=freshLane(threadId);return JSON.parse(JSON.stringify(p.lanes[id]))}
root.OnyxConversationEngine=Object.freeze({reply,inferMode,isListenOnly,stateFor,planTools,laneConfig:LANES,isCrisis(text){return crisisTest(text)},isDistress(text){return distressTest(text)},safetyAssessment,isFollowUpText,clearHistoryCache,resetLane,getState(profile){const s=PROFILE_STATES.get(lower(profile));return s?JSON.parse(JSON.stringify(s)):null}});
})(window);

/* ===== explicit bridge to the existing authenticated Onyx brain endpoint ===== */
(function(root){
  'use strict';
  const metadata=Object.freeze({
    schema:'onyx.brain-link.v1',
    repository:'tyrannosaurusdm92/LifeHelpers',
    brainPath:'Onyx',
    repositoryUrl:'https://github.com/tyrannosaurusdm92/LifeHelpers/tree/main/Onyx',
    chatAction:'onyx.chat',
    transport:'existing-authenticated-OurSpace-backend',
    privateProfileKnowledge:'backend-only'
  });
  async function chat(payload={},options={}){
    const backend=root.OnyxBackendClient;
    if(!backend||typeof backend.chat!=='function')throw new Error('Onyx brain bridge is not ready.');
    let augmented=payload;
    try {
      if(root.OnyxRepositoryBridge?.enrich) augmented=await root.OnyxRepositoryBridge.enrich(payload,options);
    } catch(error) {
      try{root.dispatchEvent(new CustomEvent('onyx:brain-index-unavailable',{detail:{reason:String(error?.message||'Index unavailable').slice(0,180)}}))}catch(_){}
    }
    return backend.chat({...augmented,useBrain:true,ai:true},options);
  }
  function snapshot(){
    const backend=root.OnyxBackendClient;
    const backendState=backend?.snapshot?.()||{};
    const endpointMatchesConfig=backendState.endpointMatchesConfig===true;
    const actionSupported=backend?.actions?.chat===metadata.chatAction;
    return {...metadata,backendAvailable:Boolean(backend?.available?.()),endpointConfigured:backendState.endpointConfigured===true,endpointMatchesConfig,actionSupported,routeReady:endpointMatchesConfig&&actionSupported,connectionState:!endpointMatchesConfig?'configuration-mismatch':backend?.available?.()?'authenticated':'awaiting-auth'};
  }
  root.OnyxBrainLink=Object.freeze({metadata,chat,snapshot});
})(window);
