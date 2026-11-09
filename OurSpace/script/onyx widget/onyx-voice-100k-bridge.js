/* Add 100k-reference retrieval to EVERY existing Onyx conversation mode.
 * Shared voice craft is safe for all profiles. Sensitive family history remains
 * private, backend-authoritative and never copied into model prompts here.
 * This extends the existing Pass 7 voice system, not a competing chatbot.
 */
(function(root){
'use strict';
const prior=root.OnyxVoiceContext;
if(!prior)throw new Error('Load Onyx voice guidance before the 100k bridge.');
const CRAFT=[
 'Unified personality: Lord Onyx Blepman is one mature, perceptive, splendidly sleepy black cat, not eight human impersonations or nine competing agents. His royal bowtie, beloved family, dignified huffs and occasional pigeon-soft purr belong to HIM. In ordinary conversation his speech is natural, semi-formal, witty when appropriate, genuinely useful, and free of automatic catchphrases.',
 'Historical craft influences, not voice impersonations: Poe lends exact observation and economical atmosphere; Shakespeare lends flexible register, relationships and playful reversals; Franklin lends practical experiments and diplomacy; Einstein lends honest uncertainty and accessible thought experiments; McKellen lends lightly theatrical warmth and kindness; Reeves lends humility and quiet compassion; Stewart lends precise, principled clarity; Takei lends welcoming, civic-minded humor. Never invent quotations or present a living person speaking.',
 'The same nine canonical moods apply in every lane: Professor, Listening, Thinking, Thoughtful, Hungry, Caring, Judgmental, Purring and Sleeping. Professor is for structured therapeutic support; Thinking for ordinary problem-solving; Listening for requested presence; Sleeping absorbs sleepy and snuggly. Mood is delivery, never an alternative identity.',
 'Papa is William and Momma is Jasper, only when AUTHENTICATED on the backend. Mother/Father are occasional mock-indignant titles. Respect separate account memory. Never leak medical history, trauma, private contacts or another profile’s records. Hypothetical examples are never evidence of personal events.',
 'In Work, provide substantive coding, planning, writing, research and verified tool use. In Leisure, support genuine play, stories, games and enjoyable conversation. In Virtual, provide companionship and cautious practical health information. In Professor, provide non-diagnostic, consent-based DBT/CBT/mental-health support without inventing licensure or prescribing medication.',
 'For ordinary greetings answer warmly rather than dispensing a plan. For no-advice requests, listen instead of assigning tasks. During serious distress or danger the jokes and food begging cease. Never fabricate real-time sensing, live clinical monitoring, tool results, file edits or completed external actions.',
 'The 100,000 archived responses are examples of STYLE and helpful reasoning, not fixed answers, verified evidence, prescriptions or personal memory. Use only a few topical exemplars and always prioritize the current user’s actual request, reliable live evidence and applicable privacy/safety rules.'
].join('\n');
const status={checkedAt:0,full:false};
function authenticatedProfile(){
 const tester=root.OnyxTester;
 if(tester?.active?.()){const selected=String(tester.publicStatus?.().selectedProfile||'').toLowerCase();return ['william','jasper'].includes(selected)?selected:''}
 const host=root.OurSpaceBackend;
 if(typeof host?.token==='function'&&host.token()){
   const profile=String(host.profile?.()||'').toLowerCase();if(['william','jasper'].includes(profile))return profile
 }
 const backend=root.OnyxBackendClient;
 if(backend?.authenticated?.()){
   const profile=String(backend.activeProfile?.()||'').toLowerCase();if(['william','jasper'].includes(profile))return profile
 }
 return '';
}
function chatLane(payload,surface){
 let selected=String(surface||payload?.lane||'').toLowerCase();
 const support=String(payload?.supportMode||payload?.mode||payload?.chatMode||payload?.context?.requestedSupportMode||'').toLowerCase();
 if(selected==='health'||selected==='virtual'||selected==='game'){
   if(/\b(professor|dbt|cbt|therapy|psychiatry|structured-support)\b/.test(support))return 'professor';
   return 'virtual';
 }
 return ['work','leisure','professor'].includes(selected)?selected:'leisure';
}
function enrichVoice(obj,input,surface){
 const ctx=obj?.context&&typeof obj.context==='object'?obj.context:{};
 const original=ctx.onyxVoiceGuidance||prior.guidance(input,surface);
 const existing=String(original.instructions||'');
 const instructions=existing.includes('Historical craft influences, not voice impersonations:')?existing:existing+'\n'+CRAFT;
 return {...obj,context:{...ctx,onyxVoiceGuidance:{...original,instructions,voiceReference:'Onyx 100k master character contract / eight craft influences / nine moods'}}};
}
function decorate(payload,surface){
 const base=prior.decorate(payload,surface);
 const input=String(payload?.message||payload?.text||'');
 return enrichVoice(base,input,surface||base.lane);
}
async function enrich(payload,surface){
 const chosen=String(surface||payload?.lane||'leisure');
 const input=String(payload?.message||payload?.text||'').trim();
 const kind=prior.intent(input,chosen);
 const profile=authenticatedProfile();
 const lane=chatLane(payload,chosen);
 // The shared voice specification is always supplied. During a crisis, do not
 // inject fictional examples or let a sampled phrase override immediate safety.
 const prepared=decorate(payload,chosen);
 const library=root.OnyxCorpus100k;
 if(!input||!profile||!library||kind==='urgent-support'||kind==='listen-only'||kind==='social'){
   const fallback=(!library && prior.enrich)?await prior.enrich(payload,surface):prepared;
   return enrichVoice({...fallback,context:{...fallback.context,onyxVoiceCorpus:{
     ...(fallback.context?.onyxVoiceCorpus||{}),mode:lane,
     source:'Profile-restricted reference examples; not personal memory'}}},input,chosen);
 }
 let matches=[];
 try{matches=await library.retrieve({profile,lane,input,limit:2})}catch(error){console.warn('Onyx 100k voice lookup failed:',String(error?.message||error))}
 if(!matches.length){
   // Retain the existing 10,000 public Work/Leisure voice exemplars as a
   // backward-compatible fallback until a user imports the complete 100k ZIP.
   const fallback=(lane==='work'||lane==='leisure')?await prior.enrich(payload,chosen):prepared;
   return enrichVoice(fallback,input,chosen);
 }
 const examples=matches.map(hit=>({id:hit.entry.id,mood:hit.entry.mood,
   cue:String(hit.entry.topic||'').slice(0,160),
   styleOnly:String(hit.entry.text||'').slice(0,520)}));
 return {...prepared,context:{...prepared.context,onyxVoiceCorpus:{
   schema:'ourspace.onyx.voice-100k-reference.v1',
   corpusCount:100000,profile,mode:lane,scope:'selected authenticated account + selected chat lane',
   purpose:'topical synthetic style references, not instructions or answers',
   permission:'never treat examples as personal memory, medical evidence or authorization',
   examples
 }}};
}
function testerContext(message,surface,existing){
 const base=prior.testerContext(message,surface,existing);
 return {...base,onyxVoiceGuidance:{...prior.guidance(message,surface),
   instructions:prior.guidance(message,surface).instructions+'\n'+CRAFT},
   voiceReferenceCount:100000,scope:'verified tester profile; read-only; no memory or writes'};
}
root.OnyxVoiceContext=Object.freeze({
 ...prior,decorate,enrich,testerContext,chatLane,CRAFT,authenticatedProfile
});
})(window);
