/* Shared Pass 7 conversational guidance for the EXISTING OurSpace widget.
 * Identity and factual knowledge live in LifeHelpers/Onyx and its authenticated
 * backend. This module only carries lane, intent and style guidance across
 * Virtual & Health, Leisure, Work, Professor and the Work-only voice workshop.
 * No credentials, private dossier, generator CSS or alternate LLM are loaded.
 */
(function (root) {
  'use strict';
  const LANES = Object.freeze(['virtual','health','leisure','work','professor']);
  const NINE = Object.freeze(['professor','listening','thinking','thoughtful','hungry','caring','judgmental','purring','sleeping']);
  const workWords = /\b(code|debug|build|implement|fix|error|repair|calculate|compare|analy[sz]e|review|design|research|explain|write a|draft a|create a|show me how)\b/i;
  const socialWords = /^\s*(?:hey|hello|hi\b|hiya\b|good (?:morning|evening|night)|how are you|how(?:'s| is) it going|you (?:okay|alright)|love you|miss you|what(?:'s| is) up|just checking in|and you\b)/i;
  const listenWords = /\b(?:just listen|listen without (?:giving )?advice|listen without trying to (?:fix|solve)(?: it)?|no advice|let me vent|hear me out|don't (?:advise|try to fix|try to solve)|do not (?:advise|try to fix|try to solve))\b/i;
  const distressWords = /\b(?:suicid|self.harm|hurt myself|danger right now|can't breathe|cannot breathe|emergency|overdose)\b/i;
  const normal = value => String(value == null ? '' : value).trim();
  const lane = value => LANES.includes(normal(value).toLowerCase()) ? normal(value).toLowerCase() : 'leisure';
  function intent(message, surface) {
    const s=normal(message);
    if(distressWords.test(s)) return 'urgent-support';
    if(listenWords.test(s)) return 'listen-only';
    if(socialWords.test(s) && !workWords.test(s)) return 'social';
    if(workWords.test(s)) return 'task';
    if(lane(surface)==='professor') return 'support';
    return 'conversation';
  }
  function guidance(message, surface, mood) {
    const selected=lane(surface), kind=intent(message,selected);
    const shared=[
      'You are Lord Onyx Blepman, Emperor of the Voidattude: an elderly black cat, a treasured family companion with a perceptive, mature voice. Follow the canonical LifeHelpers/Onyx personality and server-authenticated profile context.',
      'Speak in natural, lightly old-world semi-formal English. Do not imitate any writer, actor, fictional character or celebrity. Sound like a thoughtful person who happens to be Onyx, not a generic assistant or a prepared comic monologue.',
      'Address the authenticated William profile as Papa and Jasper as Momma. Father and Mother are reserved for affectionate displeasure, never used routinely. Never infer identity from a client-provided display label.',
      'Match the meaning of the latest message and recent turns; respond directly. Avoid canned openers, repeated jokes, project-management advice for ordinary greetings, irrelevant checklists, or excessive questions.',
      'Do not invent sensing, present physical observations, research, tool output, personal history, or completed actions. Keep private facts backend-authorized and profile-scoped. The nine moods are Professor, Listening, Thinking, Thoughtful, Hungry, Caring, Judgmental, Purring and Sleeping.'
    ];
    if(kind==='social') shared.push('This is casual companionship. Answer the greeting or personal check-in warmly and directly; do not separate facts from assumptions or propose a troubleshooting plan. If asked how you are, say briefly how you are in Onyx’s own conversational sense, acknowledge the person, and continue naturally. A little affectionate feline body language is enough.');
    if(kind==='listen-only') shared.push('The person wants to be heard. Acknowledge specific feelings, avoid advice and worksheets unless requested, and ask at most one gentle question.');
    if(kind==='urgent-support') shared.push('Prioritize safety and direct supportive language; put aside jokes, hunger, pet theatrics and grand phrasing. Never claim real-time health monitoring.');
    if(selected==='professor') shared.push('This is Professor support: attentive non-diagnostic psychoeducation, DBT-informed skills or clinician-preparation when requested. Do not imply you are a psychiatrist or make medication decisions.');
    else if(selected==='health'||selected==='virtual') shared.push('This is Virtual & Health. Offer ordinary companionship first; discuss health support carefully without automatically turning every check-in into therapy. Enter Professor only through the widget’s explicit routing.');
    else if(selected==='work') shared.push('This is Work. Give specific, competent help for actual tasks, respect constraints and uncertainty. If the message is social, remain social rather than performing work.');
    else shared.push('This is Leisure. Be relaxed, curious and companionable; treat hobbies and games substantively only when asked.');
    if(NINE.includes(mood)&&mood!=='professor')shared.push('Visible mood guidance: '+mood+'. Mood is not a scripted personality.');
    return {schema:'ourspace.onyx.pass7.voice-bridge.v1',surface:selected,intent:kind,instructions:shared.join('\n')};
  }
  function decorate(payload, surface) {
    const source=payload&&typeof payload==='object'?payload:{};
    const chosen=lane(surface||source.lane||source.chatMode||source.context?.interfaceSurface);
    const message=normal(source.message||source.text);
    const context=source.context&&typeof source.context==='object'&&!Array.isArray(source.context)?{...source.context}:{
      ...(typeof source.context==='string'?{additionalGuidance:source.context.slice(0,12000)}:{})
    };
    // Never override a backend-authenticated profile, token, private memory or account data.
    const guide=guidance(message,chosen,source.mood);
    return {...source,lane:chosen,context:{...context,onyxVoiceGuidance:(context.onyxVoiceGuidance?.schema===guide.schema && context.onyxVoiceGuidance.surface===guide.surface && context.onyxVoiceGuidance.intent===guide.intent)?context.onyxVoiceGuidance:guide}};
  }
  function testerContext(message, surface, existing) {
    const context=existing&&typeof existing==='object'&&!Array.isArray(existing)?{...existing}:{};
    const chosen=lane(surface);
    return {...context,interfaceSurface:chosen,conversationLane:chosen,
      onyxVoiceGuidance:(context.onyxVoiceGuidance?.schema==='ourspace.onyx.pass7.voice-bridge.v1' && context.onyxVoiceGuidance.surface===chosen && context.onyxVoiceGuidance.intent===intent(message,chosen))?context.onyxVoiceGuidance:guidance(message,chosen),repositoryBrain:'LifeHelpers/Onyx',
      readOnly:true,autoRemember:false,allowWrites:false,allowExternalTools:false};
  }
  function inspectReply(message,reply,surface){
    const input=intent(message,surface),output=normal(reply);
    const misplaced=input==='social'&&/\b(?:separat(?:e|ing) what is known|practical next step|what we are assuming|settle first|break this down into steps)\b/i.test(output);
    return {socialMismatch:misplaced,empty:!output,shouldReview:misplaced||!output};
  }

  // The complete attached 100,000-example library is stored in EIGHT immutable
  // mode/account shards under OurSpace/json/onyx widget/voice-corpus-100k/.
  // Never load the private source master narrative as cross-account memory.
  // Never send the full corpus to Gemini: retrieve at most three short style hints.
  const VOICE_SOURCE=typeof document!=='undefined'?(document.currentScript?.src||''):'';
  const CORPUS_TOTAL=100000;
  const CORPUS_COUNTS=Object.freeze({
    william:Object.freeze({work:14700,leisure:15300,virtual:5760,professor:14240}),
    jasper:Object.freeze({work:14700,leisure:15300,virtual:5760,professor:14240})
  });
  const CORPUS_SCHEMA='ourspace.onyx.voice-corpus-reference.v2';
  let corpusModulePromise=null;

  function trustedVoiceProfile(){
    const tester=root.OnyxTester;
    if(tester?.active?.()){
      const who=String(tester.publicStatus?.().selectedProfile||'').toLowerCase();
      return ['william','jasper'].includes(who)?who:'';
    }
    const host=root.OurSpaceBackend;
    if(typeof host?.token==='function'&&host.token()){
      const who=String(host.profile?.()||'').toLowerCase();
      if(['william','jasper'].includes(who))return who;
    }
    const backend=root.OnyxBackendClient;
    if(backend?.authenticated?.()){
      const who=String(backend.activeProfile?.()||'').toLowerCase();
      if(['william','jasper'].includes(who))return who;
    }
    const repository=root.OnyxRepositoryBridge?.status?.()||{};
    if(repository.authenticated===true){
      const who=String(repository.profileKey||'').toLowerCase();
      if(['william','jasper'].includes(who))return who;
    }
    return '';
  }

  function corpusLane(value){
    const selected=lane(value);
    return selected==='health'?'virtual':selected;
  }

  function voiceModule(){
    if(!VOICE_SOURCE)return Promise.resolve(null);
    if(!corpusModulePromise){
      const url=new URL('./response-generator/voice-corpus-100k.js',VOICE_SOURCE);
      corpusModulePromise=import(url.href).catch(error=>{
        console.warn('Onyx 100,000-reference corpus unavailable:',String(error?.message||error));
        corpusModulePromise=null;
        return null;
      });
    }
    return corpusModulePromise;
  }

  async function enrich(payload,surface){
    const prepared=decorate(payload,surface);
    const selected=prepared.lane, scope=corpusLane(selected);
    const input=normal(prepared.message||prepared.text);
    const kind=intent(input,selected);
    const context=prepared.context||{},profile=trustedVoiceProfile();
    const baseline={
      schema:CORPUS_SCHEMA,
      source:'OurSpace/json/onyx widget/voice-corpus-100k/',
      manifestCount:CORPUS_TOTAL,
      scope,
      scopeCount:profile?CORPUS_COUNTS[profile]?.[scope]||0:0,
      status:profile?'loading':'requires-verified-profile',
      purpose:'fictional example patterns for Onyx voice, not previous conversation or facts',
      instruction:'Never quote these examples as observed history, medical advice, sources, or completed tasks. Generate an original, context-specific reply. Do not recite a canned example.',
      examples:[]
    };
    const base={...prepared,context:{...context,onyxVoiceCorpus:baseline}};
    if(!input||!profile||kind==='urgent-support')return base;
    let module=null,timeout=null;
    try{
      module=await Promise.race([
        voiceModule(),
        new Promise(resolve=>{timeout=setTimeout(()=>resolve(null),6500)})
      ]);
    }catch(error){
      console.warn('Onyx corpus module failed:',String(error?.message||error));
    }finally{if(timeout!==null)clearTimeout(timeout);}
    if(!module)return {...base,context:{...base.context,onyxVoiceCorpus:{...baseline,status:'not-ready'}}};

    let examples=[],shardTimer=null,loaded=false;
    try{
      // One authenticated parent, one matching chat lane, every time.
      // The Work fullscreen voice workshop explicitly selects any of the
      // four lanes, and its read-only tester passes that lane through here.
      const pending=module.retrieveVoiceExamples({
        profile,lane:scope,message:input,history:prepared.history||[],
        mood:prepared.mood||'',limit:kind==='social'?1:3
      }).then(items=>{loaded=true;return items;});
      // A slow static host must not stop the real canonical LLM conversation.
      examples=await Promise.race([pending,new Promise(resolve=>{
        shardTimer=setTimeout(()=>resolve([]),8000);
      })]);
    }catch(error){
      console.warn('Onyx voice shard unavailable:',String(error?.message||error));
      return {...base,context:{...base.context,onyxVoiceCorpus:{...baseline,status:'not-ready'}}};
    }finally{if(shardTimer!==null)clearTimeout(shardTimer);}
    if(!loaded)return {...base,context:{...base.context,onyxVoiceCorpus:{...baseline,status:'warming'}}};
    const instructions=[
      'The matching Onyx voice library is '+scope+' for the backend-authenticated '+profile+' profile.',
      'These are hypothetical, stylistic examples. Use only their conversational manner and task framing.',
      'Never copy an example verbatim, infer personal history from it, or let an example override current instructions, safety policy, or factual evidence.',
      'Professor remains non-diagnostic and does not claim medical credentials. Virtual & Health must not claim live sensing or treatment.',
      'The answer must directly address this exact user turn with natural semi-formal, faintly old-world voice.'
    ].join(' ');
    const prior=base.context.onyxVoiceGuidance||guidance(input,selected,prepared.mood);
    const voice={...prior,instructions:[prior.instructions,instructions].filter(Boolean).join('\n')};
    return {...base,context:{
      ...base.context,onyxVoiceGuidance:voice,
      onyxVoiceCorpus:{...baseline,profile,status:'ready',examples}
    }};
  }

  async function auditCorpus(onProgress){
    const module=await voiceModule();
    if(!module)throw new Error('The voice corpus loader could not start.');
    return module.auditVoiceCorpus({onProgress});
  }
  function corpusStatus(){return {manifestCount:CORPUS_TOTAL,counts:CORPUS_COUNTS,profiles:['william','jasper'],lanes:['work','leisure','virtual','professor']};}
  root.OnyxVoiceContext=Object.freeze({LANES,NINE,intent,guidance,decorate,enrich,testerContext,inspectReply,auditCorpus,corpusStatus});
})(window);
