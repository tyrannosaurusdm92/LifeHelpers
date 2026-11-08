/* Onyx Response Studio · OurSpace widget interface to the canonical LifeHelpers/Onyx brain.
   The existing Gemini backend is accessed only through the canonical authenticated
   OnyxBrainLink or through the read-only Pass 7 email-tester JSONP contract.
   Onyx's brain, history, reasoning and long-term memory stay in /Onyx.
*/
(function (root) {
 "use strict";
 const ENDPOINT="https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec";
 const PROFILES=["william","jasper"],MODES=["work","leisure"];
 const MOODS=["listening","thinking","thoughtful","hungry","caring","judgmental","purring","sleeping"];
 const CLINICAL=/\b(therapy|therapist|psychiatr|suicid|self.harm|diagnos|seizure|asthma|medicat|trauma treatment|blood glucose|blood sugar|chest pain)\b/i;
 let token="",expiresAt="",selectedProfile="";
 const str=x=>String(x==null?"":x).trim();
 const active=()=>Boolean(token&&(!expiresAt||Date.parse(expiresAt)>Date.now()));
 const clear=()=>{token="";expiresAt="";selectedProfile="";};
 const status=()=>{if(token&&!active())clear();return{active:active(),selectedProfile,expiresAt,readOnly:true};};
 const address=p=>p==="jasper"?"Momma":"Papa";
 const formal=p=>p==="jasper"?"Mother":"Father";
 function replyOf(reply) {
   if(!reply||typeof reply!=="object"||reply.ok===false||reply.error)throw Error(str(reply?.error||reply?.message||"Backend rejected reply."));
   const nodes=[reply,reply.data,reply.result,reply.data?.result,reply.response].filter(x=>x&&typeof x==="object"&&!Array.isArray(x));
   for(const n of nodes){
     const val=[n.onyxReply,n.reply,n.response,n.text,n.output,n.content,n.message].find(x=>typeof x==="string"&&x.trim());
     if(val){if(/^\s*<(?:!doctype|html|script)\b/i.test(val))throw Error("Backend returned HTML, not a chat reply.");return str(val);}
   }
   throw Error("The backend returned no usable Onyx response.");
 }
 function jsonp(action,data={},options={}) {
   const allow=["onyx.tester.request","onyx.tester.verify","onyx.tester.select","onyx.tester.status","onyx.tester.exit","onyx.chat"];
   if(!allow.includes(action))return Promise.reject(Error("Unsupported tester action."));
   const timeout=action==="onyx.chat"?180000:45000;
   const packet={action,namespace:"ourspace.onyx",data:{...data,...(options.token!==undefined?(options.token?{testerToken:options.token}:{}):(active()?{testerToken:token}:{}))}};
   const payload=JSON.stringify(packet);
   if(payload.length>4500)return Promise.reject(Error("Shorten the test message to fit Apps Script URL limits."));
   return new Promise((resolve,reject)=>{
     if(options.signal?.aborted)return reject(Error("Request cancelled."));
     const id="__onyxStudio_"+Math.random().toString(36).slice(2).replace(/[^A-Za-z0-9_]/g,"");
     const url=new URL(ENDPOINT);url.searchParams.set("callback",id);url.searchParams.set("payload",payload);
     if(url.href.length>8200)return reject(Error("Tester request exceeds the URL limit."));
     const script=document.createElement("script");
     let done=false,timer=0;
     const cancel=()=>finish(Error("Request cancelled."));
     function finish(error,result){
       if(done)return;done=true;clearTimeout(timer);script.remove();
       try{delete root[id];}catch(_){root[id]=undefined;}
       options.signal?.removeEventListener("abort",cancel);
       if(error)reject(error);
       else if(!result||result.ok===false||result.error)reject(Error(str(result?.error||result?.message||"Tester request rejected.")));
       else resolve(result);
     }
     root[id]=data=>finish(null,data);
     script.src=url.toString();script.referrerPolicy="no-referrer";script.async=true;
     script.onerror=()=>finish(Error("Apps Script tester backend could not be reached."));
     timer=setTimeout(()=>finish(Error(action==="onyx.chat"?"The AI Brain did not respond within three minutes.":"Tester backend request timed out.")),timeout);
     options.signal?.addEventListener("abort",cancel,{once:true});document.head.append(script);
   });
 }
 const tester=Object.freeze({
   status,
   async request(email){if(str(email).toLowerCase()!=="williamsaville92@gmail.com")throw Error("Enter the backend-registered tester email.");return jsonp("onyx.tester.request",{}, {token:""});},
   async verify(code){if(!/^\d{6}$/.test(str(code)))throw Error("Enter exactly six digits.");const res=await jsonp("onyx.tester.verify",{code:str(code)},{token:""});if(!res.testerToken)throw Error("The backend did not issue a tester session.");token=res.testerToken;expiresAt=res.expiresAt||"";selectedProfile="";return status();},
   async select(profile){if(!active())throw Error("Verify your tester code first.");if(!PROFILES.includes(profile))throw Error("Select William or Jasper.");const res=await jsonp("onyx.tester.select",{profileKey:profile});if(res.testerMode!==true||res.selectedProfile!==profile)throw Error("Backend did not confirm the tester profile.");selectedProfile=profile;expiresAt=res.expiresAt||expiresAt;return status();},
   async exit(){try{if(active())await jsonp("onyx.tester.exit",{});}finally{clear();}return status();}
 });
 function promptFor(input,profile,mode,mood,index,total,repair=false){
   return [
     "Onyx voice-library test, "+mode+" conversation. Please respond naturally to "+address(profile)+" as Onyx would.",
     "This is candidate "+index+" of "+total+"; keep the wording fresh and address the situation directly.",
     "Use the canonical Onyx personality: a large elderly black cat with green-gold eyes, royal bowtie, instinct to nap, care for his people, keen intelligence and a softly formal, vaguely old-world voice. Speak naturally. Avoid canned humor, constant performance, and impersonation. Do not claim any work or monitoring that did not happen.",
     "Use "+formal(profile)+" only for mild displeasure, otherwise "+address(profile)+". Mood: "+mood+".",
     "Friendly greetings deserve friendly personal replies, not methods or action plans. Do not discuss being a sample or mention prompt instructions.",
     repair?"Previous attempt was too analytical. Answer warmly and personally, without workflow advice.":"",
     "Their message: "+input.slice(0,1700)
   ].filter(Boolean).join("\n");
 }
 function badSocial(input,reply){
   return /^(?:hey|hi|hello|hiya|good morning|good evening|how are you|how're you|i love you|miss you)\b/i.test(input.trim())&&/separating what is known|practical next step|what we are assuming|identify the assumptions|which part would you like to settle/i.test(reply);
 }
 async function requestOne({input,profile,mode,mood="auto",index=1,total=1,signal}={}){
   input=str(input);
   if(!PROFILES.includes(profile)||!MODES.includes(mode))throw Error("Choose a valid parent and conversation mode.");
   if(!input||input.length>1800)throw Error("Enter a scenario of at most 1,800 characters.");
   if(CLINICAL.test(input))throw Error("This generator is for nonclinical Work and Leisure. Use the regular Professor interface for mental-health support.");
   if(!["auto",...MOODS].includes(mood))throw Error("Choose a supported nonclinical mood.");
   const chosen=mood==="auto"?(mode==="work"?"thinking":"thoughtful"):mood;
   async function call(repair){
     const message=promptFor(input,profile,mode,chosen,index,total,repair);
     if(active()){
       if(selectedProfile!==profile)await tester.select(profile);
       const res=await jsonp("onyx.chat",{message,profileKey:profile,webSearch:false,autoRemember:false,allowWrites:false},{signal});
       if(res.testerMode!==true||res.selectedProfile!==profile)throw Error("The backend did not confirm the selected read-only tester profile.");
       return{ text:replyOf(res),source:"Read-only Apps Script tester",modelAttested:/gemini/i.test(str(res.provider||res.modelProvider)) };
     }
     const activeAccountProfile=root.OnyxBackendClient?.activeProfile?.();
     if(!root.OnyxBackendClient?.authenticated?.() || !PROFILES.includes(activeAccountProfile)) throw Error("Sign in to your OurSpace profile, or use the verified email tester.");
     if(activeAccountProfile!==profile) throw Error("The signed-in OurSpace profile differs from the selected parent. Select your own profile or enter verified tester mode to test both.");
     if(!root.OnyxRepositoryBridge?.status?.().available || !root.OnyxBrainLink?.chat)
       throw Error("Canonical LifeHelpers/Onyx brain not available. Sign in to OurSpace or use Email tester code.");
     const res=await root.OnyxBrainLink.chat({
       message,lane:mode,mood:chosen,
       threadId:"onyx-response-studio-"+profile+"-"+mode,
       context:{responseStudio:true,hypothetical:true,voiceLibrary:true,requestedProfile:profile},
       webSearch:false,useDrive:false,autoRemember:false,memoryPolicy:"none",
       allowWrites:false,allowExternalTools:false,allowAssetGeneration:false,maxOutputTokens:900
     },{timeout:180000,signal});
     return{text:replyOf(res),source:"Canonical LifeHelpers/Onyx brain",modelAttested:/gemini/i.test(str(res.provider||res.modelProvider))};
   }
   let result=await call(false);
   if(badSocial(input,result.text))result=await call(true);
   return {...result,id:"ors-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2),
     profile,mode,mood:chosen,input,createdAt:new Date().toISOString()};
 }
 async function generate({input,profile,mode,mood="auto",count=1,signal,onProgress,onReply}={}){
   count=Number(count);if(!Number.isInteger(count)||count<1||count>12)throw Error("Generate between one and twelve responses.");
   const result=[];
   for(let i=1;i<=count;i++){
     if(signal?.aborted)throw Error("Generation cancelled.");
     onProgress?.({index:i,total:count});
     const reply=await requestOne({input,profile,mode,mood,index:i,total:count,signal});
     result.push(reply);onReply?.(reply,{index:i,total:count});
   }
   return result;
 }
 root.OnyxResponses=Object.freeze({endpoint:ENDPOINT,profiles:PROFILES,modes:MODES,moods:MOODS,tester,generate,requestOne,
   status:()=>({tester:status(),repository:root.OnyxRepositoryBridge?.status?.()||{available:false}})});
})(window);
