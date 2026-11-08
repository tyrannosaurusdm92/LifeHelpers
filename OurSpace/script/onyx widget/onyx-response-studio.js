/* The Pass 7 Response Generator workflow absorbed into the existing Onyx widget.
   Isolated DOM: #onyxResponseStudio; no replacement or modification of widget/chat/game logic. */
(function(root){
 "use strict";
 const $=id=>document.getElementById(id);
 const panel=$("onyxResponseStudio");
 if(!panel||!root.OnyxResponses)return;
 const brain=root.OnyxResponses;
 let controller=null,busy=false,results=[],lastFocus=null;
 const safe=x=>String(x==null?"":x).trim();
 const parent=p=>p==="jasper"?"Momma":"Papa";
 const key=p=>"ourspace.onyx.response-studio.approved.v1."+p;
 function approved(profile){try{const list=JSON.parse(localStorage.getItem(key(profile))||"[]");return Array.isArray(list)?list:[];}catch(_){return[];}}
 function save(profile,list){localStorage.setItem(key(profile),JSON.stringify(list.slice(-1000)));}
 function status(text,isError=false){$("ors-status").textContent=text;$("ors-status").dataset.error=String(isError);}
 function getProfile(){return $("ors-profile").value;}
 function connection(){
   const s=brain.status();
   $("ors-connection").textContent=s.tester.active?"Read-only tester · "+(s.tester.selectedProfile||"select parent"):s.repository.available?"Canonical LifeHelpers/Onyx brain linked":"Sign in or verify an email tester code";
   $("ors-test-exit").hidden=!s.tester.active;
 }
 function savedCount(){
   const list=approved(getProfile());
   $("ors-saved-count").textContent=list.length+" approved locally for "+parent(getProfile())+".";
   $("ors-export").disabled=!list.length;
 }
 function open(){
   lastFocus=document.activeElement;panel.hidden=false;panel.setAttribute("aria-hidden","false");
   if(!brain.tester.status().active){const p=root.OnyxBackendClient?.activeProfile?.();if(p==="william"||p==="jasper")$("ors-profile").value=p;}
   connection();savedCount();$("ors-input").focus();
 }
 function close(){
   controller?.abort();panel.hidden=true;panel.setAttribute("aria-hidden","true");
   if(lastFocus?.focus)lastFocus.focus();
 }
 const el=(name,cls="",txt)=>{const n=document.createElement(name);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 function showReply(draft){
   const li=el("li","ors-response"),meta=el("div","ors-response-meta",parent(draft.profile)+" · "+draft.mode+" · "+draft.mood+" · "+draft.source);
   const textarea=el("textarea","ors-edit");textarea.value=draft.text;textarea.rows=4;textarea.setAttribute("aria-label","Edit proposed Onyx reply");
   const bar=el("div","ors-actions");
   const approve=el("button","","Approve and save");approve.type="button";
   approve.addEventListener("click",()=>{
     const text=safe(textarea.value);if(!text)return status("A saved reply cannot be empty.",true);
     const saved=approved(draft.profile);
     if(saved.some(r=>r.text===text))return status("This reply is already approved.");
     try{save(draft.profile,[...saved,{...draft,text,approvedAt:new Date().toISOString()}]);savedCount();status("Approved locally for "+parent(draft.profile)+".");}
     catch(e){status("Browser could not save the approval: "+e.message,true);}
   });
   const copy=el("button","","Copy");copy.type="button";
   copy.addEventListener("click",async()=>{
     try{await navigator.clipboard.writeText(textarea.value);status("Copied.");}
     catch(_){textarea.select();status("Select the text and use your browser copy shortcut.");}
   });
   bar.append(approve,copy);li.append(meta,textarea,bar);return li;
 }
 async function onGenerate(event){
   event.preventDefault();if(busy)return;
   const input=safe($("ors-input").value),profile=getProfile(),mode=$("ors-mode").value,mood=$("ors-mood").value,count=Number($("ors-count").value);
   if(!input)return status("Enter a situation or message for Onyx.",true);
   busy=true;controller=new AbortController();results=[];
   $("ors-generate").disabled=true;$("ors-cancel").disabled=false;$("ors-results").replaceChildren();
   let index=1;const started=Date.now();
   const ticker=setInterval(()=>status("Waiting for Onyx AI Brain · "+index+"/"+count+" · "+Math.floor((Date.now()-started)/1000)+" seconds"),4000);
   try{
     await brain.generate({input,profile,mode,mood,count,signal:controller.signal,
       onProgress:({index:i,total})=>{index=i;status("Generating "+i+"/"+total+" through the existing brain…");},
       onReply:(reply,progress)=>{
         results.push(reply);$("ors-results").append(showReply(reply));
         status("Received "+progress.index+"/"+progress.total+" from "+reply.source+".");
       }});
     status("Created "+results.length+" response(s). Review, edit and approve whichever you wish to keep.");
   }catch(error){status(safe(error?.message||error)+(results.length?" Earlier responses remain available.":""),true);}
   finally{clearInterval(ticker);controller=null;busy=false;$("ors-generate").disabled=false;$("ors-cancel").disabled=true;connection();}
 }
 const modal=$("ors-tester-dialog");
 function modalStatus(text,error=false){$("ors-tester-message").textContent=text;$("ors-tester-message").dataset.error=String(error);}
 function step(s){$("ors-email-step").hidden=s!=="email";$("ors-code-step").hidden=s!=="code";}
 function openModal(){step("email");modalStatus("");modal.showModal();$("ors-email").focus();}
 function closeModal(){if(modal.open)modal.close();}
 async function sendCode(){
   modalStatus("Requesting a tester code…");
   try{
     const res=await brain.tester.request($("ors-email").value);
     step("code");modalStatus(res.message||"The verification code was sent to your registered email.");$("ors-code").focus();
   }catch(e){modalStatus(e.message,true);}
 }
 async function verifyCode(){
   modalStatus("Verifying code and selecting profile…");
   try{
     await brain.tester.verify($("ors-code").value);
     await brain.tester.select(getProfile());
     $("ors-code").value="";closeModal();connection();status("Read-only tester active. Generate through the existing Apps Script AI Brain.");
   }catch(e){modalStatus(e.message,true);connection();}
 }
 function download(name,data){
   const url=URL.createObjectURL(new Blob([data],{type:"application/javascript;charset=utf-8"}));
   const link=document.createElement("a");link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1800);
 }
 for(const selector of ["onyxOpenResponseStudio","onyxOpenResponseStudioFull"]){
   const b=$(selector);if(b)b.addEventListener("click",open);
 }
 $("ors-close").addEventListener("click",close);
 $("ors-form").addEventListener("submit",onGenerate);
 $("ors-cancel").addEventListener("click",()=>controller?.abort());
 $("ors-profile").addEventListener("change",()=>{connection();savedCount();});
 $("ors-test-email").addEventListener("click",openModal);
 $("ors-email-confirm").addEventListener("click",sendCode);
 $("ors-code-confirm").addEventListener("click",verifyCode);
 $("ors-code-resend").addEventListener("click",sendCode);
 $("ors-email-cancel").addEventListener("click",closeModal);
 $("ors-code-cancel").addEventListener("click",closeModal);
 $("ors-test-exit").addEventListener("click",async()=>{
   try{await brain.tester.exit();status("Tester mode ended.");}catch(e){status(e.message,true);}finally{connection();}
 });
 $("ors-export").addEventListener("click",()=>{
   const profile=getProfile();
   const entries=approved(profile).map(({profile,mode,mood,input,text,approvedAt})=>({profile,mode,mood,input,text,approvedAt}));
   download("onyx-responses.js","/* Explicitly approved Onyx Work/Leisure dialogue. */\nexport const onyxApprovedResponses = "+JSON.stringify(entries,null,2)+";\n");
   status("Exported "+entries.length+" approved responses for "+parent(profile)+".");
 });
 panel.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.open){e.preventDefault();close();}});
 root.addEventListener("onyx:repository-brain-ready",connection);
 root.addEventListener("ourspace:auth",connection);
 connection();savedCount();
 root.OnyxResponseStudio=Object.freeze({open,close});
})(window);
