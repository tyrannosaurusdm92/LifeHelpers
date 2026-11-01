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
 if(token())payload.sessionToken=token();
 let response;
 const gateway='/api/ourspace',published='https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
 const requestOptions={method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),cache:'no-store',signal:AbortSignal.timeout(opts.timeout||18000)};
 try{
   // GitHub Pages does not provide /api/ourspace. Keep the secure gateway for
   // custom hosts that have one; never forward a token to an arbitrary URL.
   const isStaticHost=/\.github\.io$/i.test(location.hostname);
   if(isStaticHost)response=await fetch(published,{...requestOptions,redirect:'follow'});
   else{
     try{response=await fetch(gateway,{...requestOptions,credentials:'same-origin'});}catch(_){response=null}
     if(!response||response.status===404||response.status===405)response=await fetch(published,{...requestOptions,redirect:'follow'});
   }
 }catch(_){throw new Error('Account backend connection unavailable. Check the Apps Script deployment or hosting gateway.');}
 if(!response.ok)throw new Error('Account backend unavailable ('+response.status+').');
 let result;try{result=await response.json()}catch(_){throw new Error('The account service returned an invalid response.');}
 if(result?.ok===false)throw new Error(String(result.message||result.error||'The request was not accepted.'));
 return result;
}
async function signIn(identifier,password,remember){
 if(identifier.trim()==='#admin'&&password==='#admin'){
  await signOut(false);put(ss(),previewKey,'true');return {admin:true};
 }
 const result=await request('auth.signin',{identifier:identifier.trim(),password,rememberThisDevice:!!remember});
 if(!result?.sessionToken||!['william','jasper'].includes(result?.user?.profileKey))throw new Error('Account identity was not confirmed by the server.');
 memoryToken=result.sessionToken;memoryProfile=result.user.profileKey;
 [ss(),ls()].forEach(s=>{put(s,sessionKey,'');put(s,profileKey,'')});
 const store=remember?ls():ss();put(store,sessionKey,memoryToken);put(store,profileKey,memoryProfile);
 put(ss(),previewKey,'');return {admin:false,profile:memoryProfile,user:result.user};
}
async function signOut(contactServer=true){
 if(contactServer&&token()&&!isAdmin())try{await request('auth.signout',{})}catch(_){}
 memoryToken='';memoryProfile='';for(const s of [ss(),ls()]){put(s,sessionKey,'');put(s,profileKey,'')};put(ss(),previewKey,'');
}
function authorize(viewingProfile){return isAdmin()||isAuthenticated()&&profile()===viewingProfile}
window.OurSpaceAuth={request,signIn,signOut,token,profile,isAdmin,isAuthenticated,authorize};
})();
