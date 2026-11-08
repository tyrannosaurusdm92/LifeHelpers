/* OurSpace client: prefer secure same-origin gateway, fall back to owner-supplied public Apps Script Web App when hosted on GitHub Pages. No backend source or keys included. */
(()=>{'use strict';
const sessionKey='ourspace.auth.session',profileKey='ourspace.auth.profile',previewKey='ourspace.admin.preview';
const get=(storage,key)=>{try{return storage.getItem(key)||''}catch(_){return ''}};
const put=(storage,key,value)=>{try{if(value)storage.setItem(key,value);else storage.removeItem(key)}catch(_){}};
const ephemeral=new Map(),memory={getItem:k=>ephemeral.get(k)||null,setItem:(k,v)=>ephemeral.set(k,String(v)),removeItem:k=>ephemeral.delete(k)};const ss=()=>{try{return sessionStorage}catch(_){return memory}},ls=()=>{try{return localStorage}catch(_){return memory}};
let memoryToken='',memoryProfile='';
const isAdmin=()=>get(ss(),previewKey)==='true';
const token=()=>memoryToken||get(ss(),sessionKey)||get(ls(),sessionKey);
const profile=()=>memoryProfile||get(ss(),profileKey)||get(ls(),profileKey);
const isAuthenticated=()=>!!token()&&!isAdmin();
async function request(action,data={},opts={}){
 const payload={action,data,clientId:'ourspace-browser'};
 // Pre-auth requests must never inherit an unrelated account's old session.
 const publicAuthActions=new Set([
  'auth.signin','auth.signup','auth.recovery.options','auth.password.forgot',
  'auth.password.reset','auth.config','auth.ui.contract',
  'auth.verification.request','auth.verification.complete'
 ]);
 if(!publicAuthActions.has(action)&&token()&&!isAdmin())payload.sessionToken=token();
 let response;
 const gateway='/api/ourspace',published='https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
 const requestOptions={method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),cache:'no-store',signal:AbortSignal.timeout(opts.timeout||18000)};
 // Email challenges can continue server-side after a browser timeout. Distinguish
 // "unknown delivery state" from a confirmed backend failure; never auto-resend.
 const emailChallengeRequest=action==='auth.password.forgot'||
   (action==='auth.signup'&&!data.verificationCode&&!data.code&&!data.verificationToken);
 const timeoutError=()=>{const error=new Error(emailChallengeRequest
   ? 'The email request took too long to confirm; a code may still arrive. Please do not request another immediately.'
   : 'The account request timed out. Please check the account state before retrying.');
   error.deliveryUnconfirmed=emailChallengeRequest;return error;};
 try{
   // GitHub Pages does not provide /api/ourspace. Keep the secure gateway for
   // custom hosts that have one; never forward a token to an arbitrary URL.
   const isStaticHost=/\.github\.io$/i.test(location.hostname);
   if(isStaticHost)response=await fetch(published,{...requestOptions,redirect:'follow'});
   else{
     try{response=await fetch(gateway,{...requestOptions,credentials:'same-origin'});}catch(_){response=null}
     if(!response||response.status===404||response.status===405)response=await fetch(published,{...requestOptions,redirect:'follow'});
   }
 }catch(error){
   if(requestOptions.signal.aborted)throw timeoutError();
   throw new Error('Account backend connection unavailable. Check the Apps Script deployment or hosting gateway.');
 }
 if(!response.ok)throw new Error('Account backend unavailable ('+response.status+').');
 let result;try{result=await response.json()}catch(error){
   if(requestOptions.signal.aborted)throw timeoutError();
   throw new Error('The account service returned an invalid response.');
 }
 if(result?.ok===false){
  const rejected=new Error(String(result.message||result.error||'The request was not accepted.'));
  rejected.serverRejected=true;
  throw rejected;
 }
 return result;
}
function acceptSession(result,remember){
 // Only a successful backend-verified sign-in or verified account creation
 // may return an authoritative session; never synthesize client credentials.
 if(result?.ok===false||!result?.sessionToken||!['william','jasper'].includes(result?.user?.profileKey))
  throw new Error('Account identity was not confirmed by the server.');
 memoryToken=result.sessionToken;memoryProfile=result.user.profileKey;
 [ss(),ls()].forEach(s=>{put(s,sessionKey,'');put(s,profileKey,'')});
 const store=remember?ls():ss();put(store,sessionKey,memoryToken);put(store,profileKey,memoryProfile);
 put(ss(),previewKey,'');return {admin:false,profile:memoryProfile,user:result.user};
}
async function signIn(identifier,password,remember){
 if(identifier.trim()==='#admin'&&password==='#admin'){
  await signOut(false);put(ss(),previewKey,'true');return {admin:true};
 }
 const result=await request('auth.signin',{identifier:identifier.trim(),password,rememberThisDevice:!!remember});
 return acceptSession(result,remember);
}
async function signOut(contactServer=true){
 try{window.OurSpaceMemberMedia?.clear?.()}catch(_){}
 if(contactServer&&token()&&!isAdmin())try{await request('auth.signout',{})}catch(_){}
 memoryToken='';memoryProfile='';for(const s of [ss(),ls()]){put(s,sessionKey,'');put(s,profileKey,'')};put(ss(),previewKey,'');
}
function authorize(viewingProfile){return isAdmin()||isAuthenticated()&&profile()===viewingProfile}
window.OurSpaceAuth={request,signIn,acceptSession,signOut,token,profile,isAdmin,isAuthenticated,authorize};
/* OurSpace 3.4.6: single authenticated Drive media client. File bytes and session
 * tokens never enter URLs, localStorage, GitHub, or public profiles. */
const mediaUrls=new Set();
const mediaMember=()=>isAuthenticated()&&!isAdmin()&&
 ['william','jasper'].includes(profile())&&
 document.documentElement.dataset.profile===profile()&&
 new URLSearchParams(location.search).get('public')!=='1'&&
 document.documentElement.dataset.osNativePublic!=='true';
const requireMediaMember=()=>{if(!mediaMember())throw new Error('Sign in as the current OurSpace profile to access shared Drive media.');};
const mediaId=record=>{
 const id=String(record?.fileId||record?.driveFileId||record?.mediaId||record||'').replace(/^drive-/,'');
 if(!/^[A-Za-z0-9_-]{15,128}$/.test(id))throw new Error('Invalid Drive media file identifier.');
 return id;
};
async function mediaList(options={}){
 requireMediaMember();
 const kind=String(options.kind||'').toLowerCase(),owner=String(options.owner||'all').toLowerCase();
 if(kind&&!['image','audio','video'].includes(kind))throw new Error('Invalid media kind.');
 if(!['all','william','jasper','shared'].includes(owner))throw new Error('Invalid media owner.');
 let offset=0,files=[],pages=0;
 do{
  requireMediaMember();
  const result=await request('media.drive.list',{kind,ownerProfileKey:owner,offset,limit:250},{timeout:90000});
  const batch=Array.isArray(result.media)?result.media:[];
  for(const f of batch){
   if(!f||!['image','audio','video'].includes(f.kind)||!['william','jasper','shared'].includes(f.ownerProfileKey))continue;
   files.push({fileId:mediaId(f),mediaId:f.mediaId||'drive-'+mediaId(f),
    name:String(f.name||f.fileName||'Untitled'),mimeType:String(f.mimeType||'application/octet-stream'),
    sizeBytes:Number(f.sizeBytes)||0,kind:f.kind,category:String(f.category||'media'),
    ownerProfileKey:f.ownerProfileKey,path:String(f.path||''),modifiedAt:String(f.modifiedAt||'')});
  }
  offset=Number.isSafeInteger(result.nextOffset)?result.nextOffset:null;
  pages++;
 }while(offset!==null&&pages<8);
 return files;
}
async function mediaGet(record){
 requireMediaMember();
 const result=await request('media.drive.get',{fileId:mediaId(record)},{timeout:45000});
 if(!result?.media||!['image','audio','video'].includes(result.media.kind))throw new Error('Drive did not return an accessible media file.');
 return result.media;
}
async function mediaBlob(record,options={}){
 requireMediaMember();
 const fileId=mediaId(record);
 const metadata=await mediaGet(fileId);
 const size=Number(metadata.sizeBytes);
 if(!Number.isSafeInteger(size)||size<0||size>512*1024*1024)throw new Error('Drive media size is unsupported.');
 const maximum=Number(options.maxBytes||512*1024*1024);
 if(size>maximum)throw new Error('This Drive file is larger than the selected player can safely assemble.');
 const chunks=[];let offset=0,steps=0;
 while(offset<size){
  requireMediaMember();
  if(options.signal?.aborted)throw new DOMException('Media load cancelled.','AbortError');
  const part=await request('media.drive.content',{fileId,offset,maxBytes:262144},{timeout:90000});
  if(part.fileId!==fileId||part.offset!==offset||!Number.isInteger(part.bytesRead)||part.bytesRead<=0||
     part.bytesRead>262144||part.bytesRead>size-offset||typeof part.base64!=='string')
   throw new Error('Drive returned an invalid media chunk.');
  const raw=atob(part.base64);
  if(raw.length!==part.bytesRead)throw new Error('Drive media chunk length mismatch.');
  const bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  chunks.push(bytes);offset+=bytes.length;steps++;
  options.onProgress?.({fileId,bytesRead:offset,sizeBytes:size});
  if(steps>2048)throw new Error('Drive media chunk count exceeds the playback limit.');
 }
 return new Blob(chunks,{type:metadata.mimeType||'application/octet-stream'});
}
async function mediaObjectUrl(record,options={}){
 const blob=await mediaBlob(record,options),url=URL.createObjectURL(blob);
 mediaUrls.add(url);return url;
}
function revokeMediaUrl(url){if(mediaUrls.delete(url))URL.revokeObjectURL(url)}
function clearMediaUrls(){for(const url of mediaUrls)URL.revokeObjectURL(url);mediaUrls.clear()}
window.OurSpaceMemberMedia=Object.freeze({
 contractVersion:'3.4.6',available:mediaMember,list:mediaList,get:mediaGet,
 blob:mediaBlob,objectUrl:mediaObjectUrl,revoke:revokeMediaUrl,clear:clearMediaUrls
});
// Member-only destinations for Visual -> Picture Carousel and Audio -> Record Player.
// Preferences store small references, never binary bytes or temporary blob: URLs.
// Sending to a signed-in profile is NOT permission to publish anything publicly.
const profileMediaScope='profile-media',profileMediaQueues=new Map();
const profileMediaDestination=kind=>{
 if(kind!=='carousel'&&kind!=='record')throw new Error('Unknown profile player destination.');
 return kind==='carousel'?'picture-carousel-v1':'retro-record-player-v1';
};
function assertProfileMedia(){
 if(!mediaMember())throw new Error('Sign in as this profile to send media.');
 return profile();
}
function safeProfileMediaItem(input,kind){
 if(!input||typeof input!=='object')throw new Error('Choose an existing media item.');
 const mediaKind=String(input.kind||'').toLowerCase();
 if(kind==='carousel'&&!['image','video'].includes(mediaKind)||
    kind==='record'&&mediaKind!=='audio')throw new Error('This media type does not match the selected profile player.');
 let driveFileId=String(input.driveFileId||input.backendId||'').replace(/^drive-/,'');
 if(driveFileId&&!/^[A-Za-z0-9_-]{15,128}$/.test(driveFileId))
   throw new Error('The Drive file reference is not valid.');
 let url='';
 if(typeof input.url==='string'&&input.url){
  try{const parsed=new URL(input.url);if(['https:','http:'].includes(parsed.protocol))url=parsed.href}
  catch(_){}
 }
 if(!driveFileId&&!url)throw new Error('Save this file to your OurSpace Drive first, or use a playable HTTPS media link.');
 const sourceId=String(input.sourceId||input.id||driveFileId||url).slice(0,220);
 if(!sourceId)throw new Error('The source media has no identifier.');
 const clean=value=>String(value||'').slice(0,220);
 return{ id:sourceId,kind:mediaKind,driveFileId,url,
  title:clean(input.title||'Untitled'),artist:clean(input.artist),
  caption:clean(input.caption||input.title),addedAt:new Date().toISOString()};
}
async function listProfileMedia(destination){
 const owner=assertProfileMedia(),key=profileMediaDestination(destination);
 const result=await request('preference.get',{profileKey:owner,scope:profileMediaScope,key},{timeout:45000});
 const value=result?.value;
 if(value===null||value===undefined)return [];
 if(value.profileKey!==owner||value.schema!=='ourspace.profile-media.v1'||!Array.isArray(value.items))
   throw new Error('The saved profile media is not in the supported account format.');
 const items=[];
 for(const item of value.items.slice(0,160)){
  try{
   const clean=safeProfileMediaItem(item,destination);
   items.push({...clean,addedAt:String(item.addedAt||clean.addedAt)});
  }catch(_){}
 }
 return items;
}
function mutateProfileMedia(destination,fn){
 profileMediaDestination(destination);
 const pending=profileMediaQueues.get(destination)||Promise.resolve();
 const next=pending.catch(()=>{}).then(async()=>{
  const owner=assertProfileMedia(),key=profileMediaDestination(destination);
  const items=await listProfileMedia(destination);
  const result=fn(items);
  if(result.changed){
   await request('preference.set',{profileKey:owner,scope:profileMediaScope,key,
    value:{schema:'ourspace.profile-media.v1',profileKey:owner,items:result.items.slice(0,150)}
   },{timeout:90000});
   window.dispatchEvent(new CustomEvent('ourspace:profile-media-updated',{detail:{profileKey:owner,destination}}));
  }
  return result;
 });
 profileMediaQueues.set(destination,next);
 next.finally(()=>{if(profileMediaQueues.get(destination)===next)profileMediaQueues.delete(destination)}).catch(()=>{});
 return next;
}
function sendProfileMedia(destination,item){
 const normalized=safeProfileMediaItem(item,destination);
 return mutateProfileMedia(destination,items=>{
  const i=items.findIndex(x=>x.id===normalized.id||
   (normalized.driveFileId&&x.driveFileId===normalized.driveFileId));
  if(i>=0){
   const merged={...items[i],...normalized,addedAt:items[i].addedAt||normalized.addedAt};
   items.splice(i,1);items.unshift(merged);
  }else items.unshift(normalized);
  return{changed:true,items,added:i<0,entry:items[0]};
 });
}
function removeProfileMedia(destination,id){
 return mutateProfileMedia(destination,items=>{
  const next=items.filter(x=>x.id!==id);
  return{changed:next.length!==items.length,items:next};
 });
}
window.OurSpaceProfileMedia=Object.freeze({
 list:listProfileMedia,send:sendProfileMedia,remove:removeProfileMedia,
 available:mediaMember
});
window.addEventListener('pagehide',clearMediaUrls);
})();
