/* OurSpace browser client for the existing Apps Script deployment. No backend code. */
(()=>{'use strict';
const ENDPOINT='https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
const SK='ourspace.auth.session';const AK='ourspace.admin.demo';
const emptyStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
const ss=()=>{try{return window.sessionStorage}catch(_){return emptyStorage}},ls=()=>{try{return window.localStorage}catch(_){return emptyStorage}};
let memoryToken='',memoryProfile='';
const read=(store,key)=>{try{return store.getItem(key)||'';}catch(_){return ''}};
const write=(store,key,val)=>{try{val?store.setItem(key,val):store.removeItem(key);}catch(_){}};
const demo=()=>read(ss(),AK)==='true';
const token=()=>memoryToken||read(ss(),SK)||read(ls(),SK);
const profile=()=>memoryProfile||read(ss(),'ourspace.auth.profile')||read(ls(),'ourspace.auth.profile');
const loggedIn=()=>demo()||!!token();
const publicActions=new Set(['health','actions','auth.config','auth.password.forgot','auth.password.reset','auth.recovery.options','auth.signin','auth.bootstrap','public.profile.get','route.resolve','pwa.manifest.hints']);
async function request(action,data={},options={}){
 if(demo()&&!publicActions.has(action))throw new Error('Testing mode is local only. Sign in to save or send.');
 const payload={action,data,clientId:'ourspace-browser',...(token()?{sessionToken:token()}:{})};
 let response;
 try{
  response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(payload),redirect:'follow',signal:AbortSignal.timeout(20000)});
 }catch(err){throw new Error('OurSpace could not reach the server. Check your connection and try again.');}
 if(!response.ok)throw new Error('OurSpace is unavailable right now ('+response.status+').');
 let body;try{body=await response.json()}catch(_){throw new Error('The server did not return a usable response.');}
 if(body?.ok===false)throw new Error(body.error||body.message||'This action could not be completed.');
 return body;
}
function saveSession(result,remember){
 if(!result?.sessionToken||!['william','jasper'].includes(result?.user?.profileKey))throw new Error('The server did not confirm the account.');
 memoryToken=result.sessionToken;memoryProfile=result.user.profileKey;
 [ss(),ls()].forEach(store=>{write(store,SK,'');write(store,'ourspace.auth.profile','');});
 const store=remember?ls():ss();
 write(store,SK,memoryToken);write(store,'ourspace.auth.profile',memoryProfile);
 write(ss(),AK,'');
 window.dispatchEvent(new CustomEvent('ourspace:auth',{detail:{profile:memoryProfile,admin:false}}));
 return result;
}
async function signIn(identifier,password,remember){
 if(identifier.trim()==='#admin'&&password==='#admin'){
  write(ss(),AK,'true');memoryToken='';memoryProfile='';
  [ss(),ls()].forEach(s=>{write(s,SK,'');write(s,'ourspace.auth.profile','');});
  window.dispatchEvent(new CustomEvent('ourspace:auth',{detail:{admin:true}}));
  return {ok:true,admin:true,user:{displayName:'Preview',profileKey:''}};
 }
 const result=await request('auth.signin',{identifier:identifier.trim(),password,rememberThisDevice:!!remember});
 return saveSession(result,remember);
}
async function signOut(){const t=token();if(t&&!demo()){try{await request('auth.signout',{});}catch(_){}}
 memoryToken='';memoryProfile='';for(const s of [ss(),ls()]){write(s,SK,'');write(s,'ourspace.auth.profile','');}write(ss(),AK,'');window.dispatchEvent(new Event('ourspace:signed-out'));
}
window.OurSpaceBackend={endpoint:ENDPOINT,request,signIn,signOut,token,profile,isAdmin:demo,isAuthenticated:loggedIn};
window.OurSpaceAccess={isAdmin:demo,isAuthenticated:loggedIn,profile};
window.OurSpaceProfiles={getActiveProfile:()=>document.documentElement.dataset.profile||profile()||'william'};
})();
