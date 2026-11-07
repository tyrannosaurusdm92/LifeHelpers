/* The floating Onyx widget owns the fullscreen Virtual & Health iframe.
 * No game scene, game HUD, or game runtime is mounted in this document. */
(()=>{
 'use strict';
 const host=document.getElementById('slowPetGame');
 const frame=document.getElementById('onyxHealthGameFrame');
 if(!host||!frame)return;
 const tag='catastrophic-health-iframe';
 const sameOrigin=e=>e.source===frame.contentWindow && (e.origin===location.origin || location.protocol==='file:');
 const active=()=>document.documentElement.dataset.runtimeMode==='slow-game'&&!host.hidden;
 let ready=false;
 function send(type,detail={}){
   if(!frame.contentWindow||frame.getAttribute('src')==='about:blank')return;
   frame.contentWindow.postMessage({source:'onyx-widget-host',type,...detail},location.protocol==='file:'?'*':location.origin);
 }
 function sync(){send('visibility',{visible:active()});}
 function forward(name){window.addEventListener(name,e=>{
   // Forward only serializable properties; DOM nodes and back-end objects must not cross frames.
   const raw=e.detail||{};
   const detail=name==='onyx:chat-line'?{
      tab:raw.tab,role:raw.role,content:String(raw.content||'').slice(0,8000),messageId:raw.messageId,restore:!!raw.restore
   }:name==='onyx:pet-action'?{action:String(raw.action||''),tab:raw.tab}:{};
   send('widget-event',{name,detail});
 });}
 ['onyx:chat-line','onyx:pet-action','ourspace:auth','ourspace:signed-out','onyx-currency-change','onyx-currency-refresh'].forEach(forward);
 window.addEventListener('message',event=>{
   if(!sameOrigin(event))return;
   const d=event.data||{};if(d.source!==tag)return;
   if(d.type==='ready'){ready=true;sync();return;}
   if(d.type==='exit'){window.OnyxShell?.exitToModule?.();return;}
   if(d.type==='open-chat'){window.OnyxShell?.openRuntimeChat?.('health');return;}
   if(d.type==='game-event'&&typeof d.name==='string'&&d.name.startsWith('onyx-adventures:')){
     window.dispatchEvent(new CustomEvent(d.name,{detail:{...d.detail,fromGameIframe:true}}));
   }
 });

 // The self-contained game ships its own local guided chat. Capture only that
 // Onyx chat form at the existing iframe boundary; do not touch game rendering,
 // NPC dialogue, quests, farming, currencies, movement or saved game files.
 let installedDocument=null,gameBusy=false;
 const gameHistory=new Map();
 let activeChatController=null;
 const gameProfile=()=>String(window.OnyxBackendClient?.activeProfile?.()||'').toLowerCase();
 const gameAuthenticated=()=>Boolean(window.OnyxBackendClient?.authenticated?.() && ['william','jasper'].includes(gameProfile()));
 function gameChatStatus(doc,label){
   const element=doc?.getElementById('chatRuntimeLabel');
   if(element)element.textContent=label;
   const account=doc?.getElementById('chatAccountName');
   if(account)account.textContent=gameAuthenticated()?'Chatting as '+(gameProfile()==='jasper'?'Jasper':'William'):'Sign in to OurSpace to chat with Onyx';
 }
 function renderGameChat(doc,role,content){
   const log=doc.getElementById('chatLog');if(!log)return;
   const item=doc.createElement('div');
   item.className='chat-message onyx-brain-chat-'+role;
   item.style.cssText='display:block;margin:8px 4px;padding:10px 12px;border-radius:12px;white-space:pre-wrap;overflow-wrap:anywhere;background:var(--panel-bg,rgba(20,23,34,.8));border:1px solid var(--panel-border,rgba(150,160,185,.35));color:inherit';
   const name=doc.createElement('strong');
   name.textContent=role==='user'?'You':role==='assistant'?'Onyx':'System';
   const body=doc.createElement('div');body.textContent=String(content||'');
   body.style.marginTop='4px';item.append(name,body);
   log.append(item);log.scrollTop=log.scrollHeight;
 }
 async function askGameBrain(message, options={}){
   const text=String(message||'').trim();
   if(!text)throw new Error('Write a message for Onyx first.');
   const profile=gameProfile();
   if(!gameAuthenticated())throw new Error('Sign in to your William or Jasper OurSpace account to chat with Onyx.');
   if(!window.OnyxRepositoryBridge?.status?.().available || !window.OnyxBrainLink?.chat)
     throw new Error("Onyx's repository brain is unavailable. Refresh OurSpace and try again.");
   const history=gameHistory.get(profile)||[];
   const lane=options.lane==='professor'?'professor':'game';
   const result=await window.OnyxBrainLink.chat({
     message:text,lane,history:history.slice(-24),
     threadId:'ourspace-onyx-game-'+profile,
     context:{
       interfaceSurface:lane,
       sourceGame:'CAT-astrophic Cuteness',
       mode:lane==='professor'?'Professor':'Virtual & Health',
       environment:'OurSpace fullscreen game',
       sceneLabel:String(frame.contentDocument?.getElementById('locationName')?.textContent||'').slice(0,100),
       petPresentationSeparateFromBrain:true
     },
     listenOnly:/\b(just listen|do not advise|don't advise|no advice|let me vent)\b/i.test(text),
     autoRemember:false,webSearch:false,useDrive:false,
     allowWrites:false,allowAssetGeneration:false,allowExternalTools:false,
     reasoningEffort:'medium',maxOutputTokens:1800,useBrain:true,ai:true
   },{signal:options.signal,timeout:90000});
   if(result?.llmVerified!==true || result?.profileVerified!==true || result?.profileVerification?.profileKey!==profile)
     throw new Error('The Onyx brain did not verify this account-scoped reply.');
   const reply=String(result.response||result.onyxReply||'').trim();
   if(!reply)throw new Error('Onyx returned no message.');
   gameHistory.set(profile,[...history,{role:'user',content:text},{role:'assistant',content:reply}].slice(-24));
   return result;
 }
 async function sendGameChat(doc){
   if(gameBusy)return;
   const field=doc.getElementById('chatInput'),button=doc.getElementById('chatSend');
   const text=String(field?.value||'').trim();
   if(!text)return;
   if(field)field.value='';
   gameBusy=true;if(button)button.disabled=true;
   renderGameChat(doc,'user',text);
   activeChatController=new AbortController();
   try{
     // The original game's explicit Professor phrases still open the
     // existing Professor workspace, which now also uses Onyx's brain.
     if(/\b(professor onyx|dbt worksheet)\b/i.test(text) && window.OnyxProfessor?.open){
       const opened=window.OnyxProfessor.open({source:'game-chat',initialMessage:text});
       if(opened){renderGameChat(doc,'system','Opening Professor Onyx for this conversation.');return;}
     }
     gameChatStatus(doc,'Onyx is thinking · LifeHelpers/Onyx');
     const result=await askGameBrain(text,{signal:activeChatController.signal});
     renderGameChat(doc,'assistant',result.response||result.onyxReply);
     gameChatStatus(doc,'Connected to Onyx brain · LifeHelpers/Onyx');
   }catch(error){
     renderGameChat(doc,'system',String(error?.message||'Onyx could not reply.'));
     gameChatStatus(doc,'Onyx brain connection unavailable');
   }finally{
     gameBusy=false;activeChatController=null;
     if(button)button.disabled=false;
   }
 }
 function installGameBrain(){
   let doc,child;
   try{doc=frame.contentDocument;child=frame.contentWindow;}catch(_){return;}
   if(!doc||!child||!doc.getElementById('chatForm'))return;
   if(installedDocument===doc){
     gameChatStatus(doc,gameAuthenticated()&&window.OnyxRepositoryBridge?.status?.().available
       ?'Connected to Onyx brain · LifeHelpers/Onyx'
       :'Sign in to connect game chat to Onyx brain');
     return;
   }
   installedDocument=doc;
   const intercept=(event)=>{
     const target=event.target;
     if(event.type==='submit' && target?.id!=='chatForm')return;
     if(event.type==='click' && !target?.closest?.('#chatSend'))return;
     if(event.type==='keydown'){
       if(target?.id!=='chatInput'||event.key!=='Enter'||event.shiftKey||event.isComposing)return;
     }
     // Run before the game archive's old local-chat submit listener.
     event.preventDefault();event.stopImmediatePropagation();
     void sendGameChat(doc);
   };
   child.addEventListener('submit',intercept,true);
   child.addEventListener('click',intercept,true);
   child.addEventListener('keydown',intercept,true);
   child.OnyxGameBrain=Object.freeze({
     chat:(message,options={})=>askGameBrain(message,options),
     status:()=>({connected:Boolean(window.OnyxRepositoryBridge?.status?.().available),
       authenticated:gameAuthenticated(),brain:'LifeHelpers/Onyx'})
   });
   const update=()=>gameChatStatus(doc,gameAuthenticated()&&window.OnyxRepositoryBridge?.status?.().available
     ?'Connected to Onyx brain · LifeHelpers/Onyx'
     :'Sign in to connect game chat to Onyx brain');
   child.addEventListener('catastrophic-archive-ready',update);
   update();
 }
 window.addEventListener('ourspace:signed-out',()=>{gameHistory.clear();activeChatController?.abort();installGameBrain();});
 window.addEventListener('ourspace:auth',()=>{gameHistory.clear();installGameBrain();});
 window.addEventListener('onyx:repository-brain-ready',installGameBrain);

 frame.addEventListener('load',()=>{ready=false;installedDocument=null;gameBusy=false;activeChatController?.abort();sync();installGameBrain();});
 window.OnyxGameFrame=Object.freeze({frame,host,sync,status:()=>({loaded:ready,active:active(),src:frame.getAttribute('src')})});
 // Public API remains available to existing Onyx widget integrations.
 const api=Object.freeze({id:'catastrophic',name:'CAT-astrophic Cuteness',
  open(){window.OnyxShell?.enterSlowGame?.();return Promise.resolve(frame)},
  close(){window.OnyxShell?.exitToModule?.()},
  status(){return {loaded:ready,active:active(),iframe:true};}});
 window.OnyxAdventuresIntegration=api;
 window.CatastrophicIntegration=api;
})();
