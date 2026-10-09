/* Savanski routed Apps Script API client. Matches 2026.10.09-v3-routed-sas-pwa.
   GETs have JSONP fallback because Google Apps Script deployments can block
   cross-origin browser fetches. POSTs require readable CORS responses to claim success.
   Neither browser auth nor protected AI-Brain credentials are emulated here. */
(function(global){
'use strict';
const C=global.SAVANSKI_BACKEND;
if(!C)return;
const KEY='savanski.clientKey', MODE='savanski.storageMode', PERSONAL_URL='savanski.personalConnectorUrl', AUTO='savanski.autoBackup';
const read=(k,defaultValue='')=>{try{return localStorage.getItem(k)??defaultValue}catch{return defaultValue}};
const write=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
function generateKey(){const b=new Uint8Array(24);if(!global.crypto?.getRandomValues)throw new Error('Secure browser crypto is required to create a shared storage identity.');global.crypto.getRandomValues(b);return [...b].map(n=>n.toString(16).padStart(2,'0')).join('')}
function validKey(k){return /^[A-Za-z0-9_-]{24,100}$/.test(String(k||''))}
function clientKey(){let k=read(KEY);if(!validKey(k)){k=generateKey();write(KEY,k)}return k}
function connectorUrl(input){const s=String(input||'').trim();if(!s)return '';try{const u=new URL(s);if(u.protocol!=='https:'||u.hostname!=='script.google.com'||!/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(u.pathname))throw Error();return u.origin+u.pathname}catch{throw new Error('Use the published HTTPS Google Apps Script /exec URL for your personal connector.') }}
const ctx={storageMode:read(MODE,'shared')==='personal'?'personal':'shared',clientKey:clientKey(),personalConnectorUrl:'',autoBackup:read(AUTO)==='true'};
try{ctx.personalConnectorUrl=connectorUrl(read(PERSONAL_URL))}catch{}
const endpoints={shared:C.serviceUrl,personal:()=>ctx.personalConnectorUrl};
function endpoint(mode=ctx.storageMode){if(mode==='personal'){if(!ctx.personalConnectorUrl)throw new Error('Enter your personal Drive connector deployment URL in Savanski Settings first.');return ctx.personalConnectorUrl}return C.serviceUrl}
function modeParams(mode){return mode==='personal'?{}:{clientKey:ctx.clientKey}}
function urlFor(action,params={},mode){const u=new URL(endpoint(mode));u.searchParams.set('action',action);for(const [k,v] of Object.entries(params||{})){if(v!==null&&v!==undefined&&v!=='')u.searchParams.set(k,String(v))}return u.toString()}
function decodePayload(body,status=200){if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Savanski service returned an unexpected response.');if(body.ok===false)throw new Error(String(body.error||body.message||'Backend request failed.'));if(status<200||status>=300)throw new Error('Backend request failed (HTTP '+status+').');return body}
async function fetchJson(url,options){const response=await fetch(url,{cache:'no-store',redirect:'follow',...options});const raw=await response.text();let result;try{result=JSON.parse(raw)}catch{throw new Error('The deployment returned HTML or an invalid JSON response. Check its /exec URL and access settings.')}return decodePayload(result,response.status)}
let jsonpId=0;
function jsonp(fullUrl){return new Promise((resolve,reject)=>{const callback='__savanskiJsonp'+(++jsonpId);let finished=false;const script=document.createElement('script');const cleanup=()=>{clearTimeout(timeout);delete global[callback];script.remove()};const finish=(err,value)=>{if(finished)return;finished=true;cleanup();err?reject(err):resolve(value)};const timeout=setTimeout(()=>finish(new Error('The Savanski service did not respond (JSONP timeout).')),16000);global[callback]=(result)=>{try{finish(null,decodePayload(result))}catch(err){finish(err)}};script.onerror=()=>finish(new Error('The Savanski service could not be loaded. Check deployment permissions.'));const u=new URL(fullUrl);u.searchParams.set('callback',callback);script.src=u.toString();script.referrerPolicy='no-referrer';document.head.appendChild(script)})}
async function get(action,params={},options={}){if(!C.getActions.includes(action))throw new Error('Unsupported routed-backend GET action: '+action);const u=urlFor(action,params,options.mode);try{return await fetchJson(u)}catch(err){if(options.jsonp===false||typeof document==='undefined')throw err;return jsonp(u)}}
async function post(action,data={},options={}){if(!C.postActions.includes(action))throw new Error('Unsupported routed-backend POST action: '+action);const u=endpoint(options.mode);try{return await fetchJson(u,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...data})})}catch(err){if(err instanceof TypeError||/Failed to fetch|NetworkError|CORS/i.test(String(err))){throw new Error('The browser could not read the Apps Script POST response. Check the deployment’s browser/CORS access; no save is confirmed. Your local project is preserved.')}throw err}}
function setContext(next={}){if(next.storageMode){ctx.storageMode=next.storageMode==='personal'?'personal':'shared';write(MODE,ctx.storageMode)}if(Object.prototype.hasOwnProperty.call(next,'autoBackup')){ctx.autoBackup=!!next.autoBackup;write(AUTO,String(ctx.autoBackup))}if(Object.prototype.hasOwnProperty.call(next,'personalConnectorUrl')){ctx.personalConnectorUrl=connectorUrl(next.personalConnectorUrl);write(PERSONAL_URL,ctx.personalConnectorUrl)}if(Object.prototype.hasOwnProperty.call(next,'clientKey')){if(!validKey(next.clientKey))throw new Error('Shared storage identity must be 24–100 letters, digits, hyphens or underscores.');ctx.clientKey=String(next.clientKey);write(KEY,ctx.clientKey)}global.dispatchEvent?.(new CustomEvent('savanski:backend-context',{detail:{...ctx}}));return {...ctx}}
function identity(){return ctx.clientKey}
function canSync(){return !!ctx.autoBackup && (ctx.storageMode==='shared'||!!ctx.personalConnectorUrl)}
async function ping({storageMode='shared'}={}){return get('ping',{}, {mode:storageMode})}
async function storageStatus({storageMode=ctx.storageMode}={}){return get('storageStatus',{mode:storageMode,...modeParams(storageMode)},{mode:storageMode})}
async function listProjects({storageMode=ctx.storageMode}={}){return get('listProjects',modeParams(storageMode),{mode:storageMode})}
async function getProject(id,{storageMode=ctx.storageMode}={}){return get('getProject',{id,...modeParams(storageMode)},{mode:storageMode})}
async function saveProject(project,{storageMode=ctx.storageMode,title}={}){if(!project||typeof project!=='object'||Array.isArray(project))throw new Error('A Savanski project object is required.');return post('saveProject',{project,storageMode,title:title||project.name||project.projectName||'Untitled Project',...modeParams(storageMode)},{mode:storageMode})}
const base64=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',').pop());reader.onerror=()=>reject(reader.error||new Error('File encoding failed.'));reader.readAsDataURL(blob)});
async function saveBinary(blob,filename,{category='exports',storageMode=ctx.storageMode}={}){if(!(blob instanceof Blob))throw new Error('A file or Blob is required.');if(blob.size>C.maxInlineBytes)throw new Error('This backend accepts at most 8 MiB per inline upload. Export the larger file locally.');return post('saveBinary',{base64:await base64(blob),filename:filename||'savanski-export',mimeType:blob.type||'application/octet-stream',category,storageMode,...modeParams(storageMode)},{mode:storageMode})}
async function saveExport(blob,filename,meta={}){return saveBinary(blob,filename,meta)}
async function listLibrary(q='',type='all'){return get('listLibrary',{q,type},{mode:'shared'})}
async function getLibraryFile(id){return get('getLibraryFile',{id},{mode:'shared'})}
async function appInstallInfo(){return get('appInstallInfo',{}, {mode:'shared'})}
async function aiBrainStatus(){return get('aiBrainStatus',{}, {mode:'shared'})}
async function aiBrain(request){if(!request||typeof request!=='object')throw new Error('AI-Brain request must be an object.');const safe={...request};delete safe.clientId;delete safe.clientKey;delete safe.apiKey;delete safe.siteUrl;return post('aiBrain',{request:safe},{mode:'shared'})}
function connectPersonalDrive(){const u=new URL(endpoint('personal'));u.searchParams.set('action','connect');return global.open(u.toString(),'_blank','noopener,noreferrer')}
function personalConnectLink(){const u=new URL(endpoint('personal'));u.searchParams.set('action','connect');return u.toString()}
function importSharedIdentity(k){return setContext({clientKey:k})}
const api={config:C,context:ctx,identity,clientKey,canSync,hasSession:canSync,setContext,ping,health:ping,get,post,storageStatus,listProjects,getProject,saveProject,saveBinary,saveExport,listLibrary,getLibraryFile,appInstallInfo,aiBrainStatus,aiBrain,connectPersonalDrive,personalConnectLink,importSharedIdentity,recordEvent:async()=>({ok:true,local:true})};
global.SavanskiBackend=api;global.SavanskiOurSpaceBackend=api;
})(window);
