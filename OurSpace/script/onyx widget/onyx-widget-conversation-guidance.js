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
  const listenWords = /\b(?:just listen|no advice|let me vent|hear me out|don't try to fix|do not advise)\b/i;
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
    if(kind==='social') shared.push('This is casual companionship. Answer the greeting or personal check-in warmly and directly; do not separate facts from assumptions or propose a troubleshooting plan. A little affectionate feline body language is enough.');
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
    return {...source,lane:chosen,context:{...context,onyxVoiceGuidance:context.onyxVoiceGuidance?.schema===guide.schema?context.onyxVoiceGuidance:guide}};
  }
  function testerContext(message, surface, existing) {
    const context=existing&&typeof existing==='object'&&!Array.isArray(existing)?{...existing}:{};
    const chosen=lane(surface);
    return {...context,interfaceSurface:chosen,conversationLane:chosen,
      onyxVoiceGuidance:context.onyxVoiceGuidance?.schema==='ourspace.onyx.pass7.voice-bridge.v1'?context.onyxVoiceGuidance:guidance(message,chosen),repositoryBrain:'LifeHelpers/Onyx',
      readOnly:true,autoRemember:false,allowWrites:false,allowExternalTools:false};
  }
  function inspectReply(message,reply,surface){
    const input=intent(message,surface),output=normal(reply);
    const misplaced=input==='social'&&/\b(?:separat(?:e|ing) what is known|practical next step|what we are assuming|settle first|break this down into steps)\b/i.test(output);
    return {socialMismatch:misplaced,empty:!output,shouldReview:misplaced||!output};
  }
  root.OnyxVoiceContext=Object.freeze({LANES,NINE,intent,guidance,decorate,testerContext,inspectReply});
})(window);
