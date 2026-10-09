(function(global){
'use strict';
const C=global.SAVANSKI_BACKEND;if(!C)return;
const SESSION_KEY='savanski.sessionToken';
const DEVICE_KEY='savanski.deviceId';
const ctx={sessionToken:'',deviceId:'',storageMode:'shared',rememberThisDevice:false};
function readStore(store,key){try{return store.getItem(key)||''}catch(_){return ''}}
ctx.sessionToken=readStore(sessionStorage,SESSION_KEY)||readStore(localStorage,SESSION_KEY)||readStore(sessionStorage,'sessionToken')||readStore(localStorage,'sessionToken')||readStore(sessionStorage,'ourspace.sessionToken')||readStore(localStorage,'ourspace.sessionToken');
ctx.rememberThisDevice=!!readStore(localStorage,SESSION_KEY);
ctx.deviceId=readStore(localStorage,DEVICE_KEY)||('browser-'+Math.random().toString(36).slice(2));
try{localStorage.setItem(DEVICE_KEY,ctx.deviceId)}catch(_){ }
function persistSession(token,remember){
  token=String(token||''); remember=!!remember;
  try{sessionStorage.removeItem(SESSION_KEY);localStorage.removeItem(SESSION_KEY)}catch(_){ }
  if(token){try{(remember?localStorage:sessionStorage).setItem(SESSION_KEY,token)}catch(_){ }}
  ctx.sessionToken=token;ctx.rememberThisDevice=remember;
}
function setContext(next={}){
  if(Object.prototype.hasOwnProperty.call(next,'sessionToken'))persistSession(next.sessionToken,next.rememberThisDevice??ctx.rememberThisDevice);
  if(typeof next.deviceId==='string'&&next.deviceId){ctx.deviceId=next.deviceId;try{localStorage.setItem(DEVICE_KEY,ctx.deviceId)}catch(_){ }}
  if(next.storageMode)ctx.storageMode=next.storageMode==='personal'?'personal':'shared';
  global.dispatchEvent(new CustomEvent('savanski:backend-context',{detail:{...ctx}}));return {...ctx};
}
function clearSession(){persistSession('',false);global.dispatchEvent(new CustomEvent('savanski:backend-context',{detail:{...ctx}}));}
function url(action,params={}){const u=new URL(C.serviceUrl);u.searchParams.set('action',action);for(const [k,v] of Object.entries(params)){if(v!==undefined&&v!==null&&v!=='')u.searchParams.set(k,String(v))}return u}
async function decode(r){const text=await r.text();let out;try{out=JSON.parse(text)}catch{throw new Error('Savanski backend returned a non-JSON response.')}if(!r.ok||out?.ok===false)throw new Error(out?.error||out?.message||`Savanski backend request failed (${r.status}).`);return out}
async function get(action,params={}){return decode(await fetch(url(action,params),{cache:'no-store',redirect:'follow'}))}
async function post(action,data={}){return decode(await fetch(C.serviceUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...data}),cache:'no-store',redirect:'follow'}))}
async function health(){return get('health')}
function sessionData(){return ctx.sessionToken?{sessionToken:ctx.sessionToken,deviceId:ctx.deviceId,userAgent:navigator.userAgent}:{deviceId:ctx.deviceId,userAgent:navigator.userAgent}}
function toBase64(blob){return new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(String(f.result).split(',').pop());f.onerror=()=>reject(f.error||new Error('Could not encode file.'));f.readAsDataURL(blob)})}
async function authConfig(){return get('auth.config')}
async function bootstrap(){return get('auth.bootstrap',sessionData())}
async function signUp(data={}){const out=await post('auth.signup',{...data,...sessionData()});if(out.sessionToken)setContext({sessionToken:out.sessionToken,rememberThisDevice:!!data.rememberThisDevice});return out}
async function signIn(data={}){const out=await post('auth.signin',{...data,...sessionData()});if(out.sessionToken)setContext({sessionToken:out.sessionToken,rememberThisDevice:!!data.rememberThisDevice});return out}
async function signOut(){if(ctx.sessionToken){try{await post('auth.signout',sessionData())}finally{clearSession()}}else clearSession();return {ok:true,signedOut:true}}
async function signOutAll(){if(ctx.sessionToken){try{await post('auth.signout.all',sessionData())}finally{clearSession()}}else clearSession();return {ok:true,signedOutEverywhere:true}}
async function forgotPassword(identifier){return post('auth.password.forgot',{identifier,deviceId:ctx.deviceId,userAgent:navigator.userAgent})}
async function resetPassword(identifier,code,newPassword){return post('auth.password.reset',{identifier,code,newPassword,deviceId:ctx.deviceId,userAgent:navigator.userAgent})}
async function changePassword(currentPassword,newPassword){return post('auth.password.change',{...sessionData(),currentPassword,newPassword})}
async function storageContract(){return get('storage.contract')}
async function storagePricing(){return get('storage.pricing')}
async function storageStatus(){return get('storage.status',sessionData())}
async function donationClaim(amountUsd,paymentReference,note=''){return post('storage.donation.claim',{...sessionData(),amountUsd,paymentReference,note})}
async function donationList(){return post('storage.donation.list',sessionData())}
async function saveProject(project,{storageMode=ctx.storageMode}={}){if(!project)throw new Error('Project is missing.');if(storageMode==='shared'&&!ctx.sessionToken)throw new Error('Sign in is required for synced project backup.');return post('project.save',{...sessionData(),storageMode,project,title:project.name||project.projectName||'Untitled Project'})}
async function saveBinary(blob,fileName,{category='exports',storageMode=ctx.storageMode}={}){if(!blob)throw new Error('File is missing.');if(blob.size>C.maxInlineBytes)throw new Error(`Inline backend uploads are limited to ${(C.maxInlineBytes/1048576).toFixed(0)} MB.`);if(storageMode==='shared'&&!ctx.sessionToken)throw new Error('Sign in is required for synced file backup.');return post('binary.save',{...sessionData(),storageMode,base64:await toBase64(blob),filename:fileName,mimeType:blob.type||'application/octet-stream',category})}
async function listProjects({storageMode=ctx.storageMode}={}){if(storageMode==='shared'&&!ctx.sessionToken)return {ok:true,items:[],crossDevice:false};return get('project.list',{mode:storageMode,...sessionData()})}
async function getProject(id,{storageMode=ctx.storageMode}={}){return get('project.get',{id,mode:storageMode,...sessionData()})}
async function deleteProject(projectId){return post('project.delete',{...sessionData(),projectId})}
async function listLibrary(q='',type='all'){return get('listLibrary',{q,type,...sessionData()})}
async function getLibraryFile(id){return get('getLibraryFile',{id,...sessionData()})}
async function saveExport(blob,fileName,meta={}){return saveBinary(blob,fileName,{category:meta.category||'exports',storageMode:meta.storageMode||ctx.storageMode})}
async function recordEvent(){return {ok:true,local:true}}
const api={config:C,context:ctx,setContext,clearSession,hasSession:()=>!!ctx.sessionToken,get,post,health,authConfig,bootstrap,signUp,signIn,signOut,signOutAll,forgotPassword,resetPassword,changePassword,storageContract,storagePricing,storageStatus,donationClaim,donationList,saveProject,saveBinary,saveExport,listProjects,getProject,deleteProject,listLibrary,getLibraryFile,recordEvent};
global.SavanskiBackend=api;
global.SavanskiOurSpaceBackend=api;
})(window);
