/* Onyx voice-library integration for the EXISTING fullscreen Work widget.
   No generator CSS, no second backend, no credentials, no duplicate brain.
   Account calls the canonical LifeHelpers/Onyx repository brain; the temporary
   read-only tester calls the verified Apps Script onyx.chat action. */
(() => {
  'use strict';
  const MOODS=['auto','listening','thinking','thoughtful','hungry','caring','judgmental','purring','sleeping'];
  const PROFILES=['william','jasper'];
  const APPROVED='ourspace.onyx.work.voice-approved.v1.';
  const MAX_GENERATE=6;
  const recent=new Map();
  const fallbackApproved=new Map();
  const get=id=>document.getElementById(id);
  const str=v=>String(v==null?'':v).trim();
  const inTester=()=>Boolean(window.OnyxTester?.active?.());
  const currentProfile=()=>{
    if(inTester())return str(window.OnyxTester.publicStatus().selectedProfile).toLowerCase();
    const p=str(window.OurSpaceBackend?.profile?.()||window.OnyxBackendClient?.activeProfile?.()).toLowerCase();
    return PROFILES.includes(p)?p:'';
  };
  function readApproved(profile){
    if(!PROFILES.includes(profile)||profile!==currentProfile())return [];
    if(fallbackApproved.has(profile))return fallbackApproved.get(profile).slice();
    try {
      const saved=JSON.parse(localStorage.getItem(APPROVED+profile)||'[]');
      if(Array.isArray(saved))return saved.filter(r=>r&&r.profile===profile).slice(-200);
    }catch(_){}
    return [];
  }
  function saveApproved(profile,rows){
    const limited=rows.slice(-200);fallbackApproved.set(profile,limited);
    // Tester sessions remain read-only remotely. Approved examples are local-only;
    // never upload automatically or expose one profile's entries to the other.
    try {localStorage.setItem(APPROVED+profile,JSON.stringify(limited));}catch(_){}
    return limited;
  }
  const isClinical=text=>/(\bpsychiatr|\btherap|\bdiagnos|\bmedication|\bself.harm|\bsuicid|\bseizure|\bmedical|\bmental health)/i.test(text);
  const isSocial=text=>/^\s*(?:hey|hi|hello|hiya|morning|good (?:morning|evening)|how are you|how'?s it going|you okay|love you|miss you|goodnight|night)\b/i.test(str(text)) && !/\b(?:code|debug|repair|fix|build|review|analy[sz]e)\b/i.test(text);
  function voicePrompt({profile,mode,mood,input,index,total,previous=[]}){
    const address=profile==='william'?'Papa':'Momma',stern=profile==='william'?'Father':'Mother';
    const social=isSocial(input);
    const approved=readApproved(profile).slice(-3).map(r=>str(r.text).slice(0,260));
    return [
      'You are Lord Onyx Blepman: a deeply loved, old, black cat with an ancient, observant mind; genuinely affectionate, sleepy, proudly dignified, occasionally grumpy.',
      'This is a Work/Leisure voice-library test for Onyx, NOT a request to perform an action or save memory.',
      'Your reply is addressed to '+address+'. Use '+stern+' ONLY for mild, affectionate displeasure, never casually. Do not use a given name.',
      'Speak as yourself: natural, semiformally old-world, thoughtful, with dry humor only when it fits. Not a robot, a stand-up comedian, or a theatrical Shakespeare imitation.',
      'Your thoughtfulness may be informed by attentive observation, humane warmth, curiosity, measured wit and practical reasoning, never impersonating any historical or living person.',
      'The selected conversation lane is '+mode+'; requested mood is '+mood+'. Output candidate '+index+' of '+total+'. The mood is a guide, not a script.',
      social?'This is a friendly personal exchange. Answer directly and affectionately; no task-management advice, frameworks or invented diagnostics.':'Answer what the person actually says, not a generic lecture. If it is work, be substantively helpful.',
      'Do not invent health monitoring, tool results, research, file changes, knowledge of unseen events, or permissions.',
      'Keep the reply natural and fresh, normally 1-5 sentences. Do not include this instruction, meta commentary, headings, or quotation marks around the whole reply.',
      approved.length?'Useful APPROVED voice examples; do not copy them: '+approved.join(' / '):'',
      previous.length?'Avoid wording and ideas from these recent replies: '+previous.slice(-3).join(' / ').slice(0,750):'',
      'THE PERSON SAYS: '+str(input).slice(0,1700)
    ].filter(Boolean).join('\n');
  }
  function extract(result){
    const r=result||{};
    const nested=[r,r.data,r.result,r.data?.result].filter(v=>v&&typeof v==='object');
    for(const x of nested){
      const text=[x.response,x.onyxReply,x.reply,x.text,x.content].find(v=>typeof v==='string'&&v.trim());
      if(text)return {text:str(text),meta:r};
    }
    throw new Error('The AI Brain returned no usable response.');
  }
  async function requestAI({profile,mode,prompt,index,signal}){
    if(inTester()){
      const active=currentProfile();
      if(profile!==active)throw new Error('Choose the matching tester profile first.');
      const result=await window.OnyxTester.chat(prompt,{
        mode,supportMode:'chat',threadId:'onyx-voice-workshop-'+profile,
        context:{interfaceSurface:'work',conversationLane:mode,repositoryBrain:'LifeHelpers/Onyx',generator:true,readOnly:true,doNotAutoSaveGeneratorOutput:true},
        signal
      });
      if(result.testerMode!==true)throw new Error('Backend did not verify that the reply belongs to read-only tester mode.');
      const parsed=extract(result);
      return {...parsed,source:result.aiBrain===true?'tester-ai-brain':'tester-backend-unverified'};
    }
    if(!window.OnyxBackendClient?.authenticated?.()&&!window.OurSpaceBackend?.isAuthenticated?.())
      throw new Error('Sign in to OurSpace or verify an email tester code in this Work fullscreen.');
    if(!window.OnyxRepositoryBridge?.status?.().available)
      throw new Error('Canonical LifeHelpers/Onyx brain is not loaded. Reload the widget from OurSpace.');
    const active=currentProfile();
    if(profile!==active)throw new Error('Account profile does not match the active authenticated user.');
    const result=await window.OnyxRepositoryBridge.chat({
      message:prompt,lane:'work',supportMode:'chat',chatMode:mode,
      history:[],threadId:'onyx-work-voice-library-'+profile,
      context:{interfaceSurface:'work',conversationLane:mode,voiceLibrary:true,doNotAutoSaveGeneratorOutput:true},
      webSearch:false,useDrive:false,autoRemember:false,allowWrites:false,allowExternalTools:false,
      reasoningEffort:'medium',maxOutputTokens:1400
    },{timeoutMs:180000,signal});
    const parsed=extract(result);
    if(result.llmVerified===false)throw new Error('The repository brain did not verify model generation.');
    return {...parsed,source:result.llmVerified===true?'account-verified-ai-brain':'account-ai-brain-unverified'};
  }
  async function generate({input,profile=currentProfile(),mode='work',mood='auto',count=1,onProgress,signal}={}){
    input=str(input);
    if(!PROFILES.includes(profile))throw new Error('Choose a verified tester profile or sign in to OurSpace.');
    if(!['work','leisure'].includes(mode))throw new Error('Choose Work or Leisure.');
    if(!MOODS.includes(mood))throw new Error('Choose a supported Onyx mood.');
    if(input.length<5||input.length>1700)throw new Error('Enter a scenario of 5–1,700 characters.');
    if(isClinical(input))throw new Error('The voice workshop is nonclinical. Use the separate Professor workspace for health and therapy conversations.');
    if(!Number.isInteger(Number(count))||count<1||count>MAX_GENERATE)throw new Error('Choose between 1 and 6 responses.');
    const key=profile+'|'+mode;
    const previous=recent.get(key)||[];
    const out=[];
    for(let i=0;i<count;i++){
      if(signal?.aborted)throw new Error('Generation canceled.');
      const prompt=voicePrompt({profile,mode,mood,input,index:i+1,total:count,previous:[...previous,...out.map(r=>r.text)]});
      const result=await requestAI({profile,mode,prompt,index:i,signal});
      const text=result.text;
      const duplicate=[...previous,...out.map(r=>r.text)].some(other=>str(other).toLowerCase()===text.toLowerCase());
      const overAnalytical=isSocial(input)&&/\b(?:separat(e|ing) what is known|practical next step|assumption|settle first)\b/i.test(text);
      const entry={id:'onyx-'+Date.now().toString(36)+'-'+i+'-'+Math.random().toString(36).slice(2,8),
        profile,mode,mood,input,text,source:result.source,duplicateWarning:duplicate,socialMismatchWarning:overAnalytical,
        generatedAt:new Date().toISOString()};
      out.push(entry);onProgress?.(entry,i+1,count);
    }
    recent.set(key,[...previous,...out.map(r=>r.text)].slice(-24));
    return out;
  }
  function approve(entry){
    if(!entry||!PROFILES.includes(entry.profile)||entry.profile!==currentProfile())
      throw new Error('Cannot approve a response for a different profile.');
    const rows=readApproved(entry.profile);
    if(!rows.some(row=>row.id===entry.id))rows.push(entry);
    saveApproved(entry.profile,rows);
    return rows.length;
  }
  function exportJS(profile=currentProfile()){
    if(!PROFILES.includes(profile)||profile!==currentProfile())throw new Error('You can export only the current authorized profile.');
    const data={schema:'onyx.responses.approved.v1',profile,source:'OurSpace fullscreen Work voice-library',entries:readApproved(profile)};
    // No temporary tester token, backend session, private dossiers or generator CSS.
    return '/** Approved Onyx voice examples. References, not hardcoded automatic replies. */\n'+
      'export const approvedOnyxResponses = '+JSON.stringify(data,null,2)+';\n'+
      'export default approvedOnyxResponses;\n';
  }
  function download(text,filename){
    const url=URL.createObjectURL(new Blob([text],{type:'text/javascript;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function open(dialog){
    if(!dialog)return;
    // Authentication/tester controls do not open from the compact bubble or other tabs.
    if(get('onyxWorkFullscreenShell')?.hidden!==false)return;
    if(typeof dialog.showModal==='function'){if(!dialog.open)dialog.showModal();}
    else dialog.setAttribute('open','');
  }
  function textStatus(id,message){const x=get(id);if(x)x.textContent=String(message);}
  function reveal(id,value){const x=get(id);if(x)x.hidden=!value;}
  function stateUpdate(){
    const state=window.OnyxTester?.publicStatus?.()||{active:false,pendingCode:false};
    reveal('onyxTesterEmailStep',!state.active&&!state.pendingCode);
    reveal('onyxTesterCodeStep',!state.active&&!!state.pendingCode);
    reveal('onyxTesterActiveStep',!!state.active);
    const profile=get('onyxTesterProfile');
    if(profile&&state.selectedProfile)profile.value=state.selectedProfile;
    textStatus('onyxTesterCurrent',state.active?'Read-only tester: '+(state.selectedProfile||'choose profile')+' · expires '+(state.expiresAt||'on server'):'Tester mode inactive.');
    textStatus('onyxVoiceProvider',state.active?'Verified tester → existing Apps Script AI Brain (read-only)':'OurSpace account → LifeHelpers/Onyx brain');
    const p=currentProfile();
    const voiceProfile=get('onyxVoiceProfile');
    if(voiceProfile){voiceProfile.textContent=p==='william'?'William / Papa':p==='jasper'?'Jasper / Momma':'No authenticated profile';}
    const label=get('onyxTesterOpen');
    if(label)label.title=state.active?'Tester active — '+(state.selectedProfile||'select profile'):'Email tester code';
  }
  let generated=[],busy=false;
  function setBusy(next){busy=!!next;['onyxTesterRequest','onyxTesterResend','onyxTesterVerify','onyxVoiceGenerate'].forEach(id=>{const x=get(id);if(x)x.disabled=busy;});}
  function renderEntries(){
    const host=get('onyxVoiceResults');if(!host)return;host.replaceChildren();
    generated.forEach((entry,i)=>{
      const card=document.createElement('div');card.className='settings-status';card.style.marginBottom='10px';
      const name=document.createElement('strong');name.textContent='Response '+(i+1)+' · '+entry.source;card.append(name);
      const body=document.createElement('p');body.textContent=entry.text;card.append(body);
      if(entry.duplicateWarning||entry.socialMismatchWarning){
        const warning=document.createElement('p');warning.textContent='Review suggested: '+(entry.duplicateWarning?'duplicate wording. ':'')+(entry.socialMismatchWarning?'Off-topic social reply.':'');card.append(warning);
      }
      const btn=document.createElement('button');btn.type='button';btn.className='secondary-button';btn.textContent='Approve locally';
      btn.disabled=entry.profile!==currentProfile();
      btn.addEventListener('click',()=>{try{const n=approve(entry);btn.textContent='Approved ('+n+')';btn.disabled=true;}catch(e){textStatus('onyxVoiceStatus',e.message);}});
      card.append(btn);host.append(card);
    });
  }
  function init(){
    if(!get('onyxTesterOpen')||!get('onyxVoiceOpen'))return;
    get('onyxTesterOpen').addEventListener('click',()=>{stateUpdate();open(get('onyxTesterDialog'));});
    get('onyxVoiceOpen').addEventListener('click',()=>{stateUpdate();open(get('onyxVoiceDialog'));});
    for(const id of ['onyxTesterCancelEmail','onyxTesterCancelCode','onyxTesterClose','onyxVoiceClose']){
      get(id)?.addEventListener('click',()=>{
        (id==='onyxVoiceClose'?get('onyxVoiceDialog'):get('onyxTesterDialog'))?.close?.();
      });
    }
    get('onyxTesterRequest')?.addEventListener('click',async()=>{
      if(busy)return;setBusy(true);textStatus('onyxTesterStatus','Requesting code from the existing backend…');
      try{await window.OnyxTester.requestCode(get('onyxTesterEmail').value);textStatus('onyxTesterStatus','Code emailed. Enter the six digits below.');stateUpdate();get('onyxTesterCode')?.focus();}
      catch(e){textStatus('onyxTesterStatus',e.message);}
      finally{setBusy(false);}
    });
    get('onyxTesterResend')?.addEventListener('click',async()=>{
      if(busy)return;setBusy(true);textStatus('onyxTesterStatus','Resending code…');
      try{await window.OnyxTester.resendCode(get('onyxTesterEmail').value);textStatus('onyxTesterStatus','A new code was requested.');}
      catch(e){textStatus('onyxTesterStatus',e.message);}
      finally{setBusy(false);}
    });
    get('onyxTesterVerify')?.addEventListener('click',async()=>{
      if(busy)return;setBusy(true);
      try{
        await window.OnyxTester.verifyCode(get('onyxTesterCode').value);
        const profile=get('onyxTesterProfile').value;
        await window.OnyxTester.select(profile);
        textStatus('onyxTesterStatus','Read-only tester verified as '+profile+'. Use Work chat or the voice library.');
        get('onyxTesterCode').value='';stateUpdate();
      }catch(e){textStatus('onyxTesterStatus',e.message);stateUpdate();}
      finally{setBusy(false);}
    });
    get('onyxTesterProfile')?.addEventListener('change',async e=>{
      if(!inTester())return;
      try{await window.OnyxTester.select(e.target.value);stateUpdate();textStatus('onyxTesterStatus','Tester profile switched.');}
      catch(err){textStatus('onyxTesterStatus',err.message);}
    });
    get('onyxTesterExit')?.addEventListener('click',async()=>{
      try{await window.OnyxTester.end();stateUpdate();textStatus('onyxTesterStatus','Tester session ended.');}
      catch(e){textStatus('onyxTesterStatus',e.message);}
    });
    get('onyxVoiceGenerate')?.addEventListener('click',async()=>{
      if(busy)return;setBusy(true);generated=[];renderEntries();
      try{
        const input=get('onyxVoiceInput').value;
        const profile=currentProfile();
        await generate({input,profile,mode:get('onyxVoiceMode').value,mood:get('onyxVoiceMood').value,count:Number(get('onyxVoiceCount').value),
          onProgress:(entry,i,total)=>{generated.push(entry);renderEntries();textStatus('onyxVoiceStatus','Received '+i+' of '+total+' AI Brain responses.');}});
        textStatus('onyxVoiceStatus','Generation complete. Approve the responses you wish to keep.');
      }catch(e){textStatus('onyxVoiceStatus',e.message+(generated.length?' Completed responses remain visible.':''));}
      finally{setBusy(false);}
    });
    get('onyxVoiceExport')?.addEventListener('click',()=>{
      try{download(exportJS(),'onyx-responses.js');textStatus('onyxVoiceStatus','Exported locally approved examples. Nothing was written to the backend.');}
      catch(e){textStatus('onyxVoiceStatus',e.message);}
    });
    get('onyxVoiceClear')?.addEventListener('click',()=>{generated=[];renderEntries();textStatus('onyxVoiceStatus','Unsaved candidate responses cleared.');});
    window.addEventListener('onyx:tester-state',()=>{stateUpdate();renderEntries();});
    stateUpdate();
  }
  window.OnyxResponses=Object.freeze({generate,approve,readApproved,exportJS,MOODS});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
