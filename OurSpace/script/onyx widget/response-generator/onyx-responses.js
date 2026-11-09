import {classifyTurn,moodForTurn} from './conversation-intents.js';
import {understandTurn} from './turn-understanding.js';
import {evaluateContextFit,substantiveRewriteInstruction} from './dialogue-evaluator.js';
/**
 * ONYX RESPONSES v5 — portable widget-facing ESM API.
 * This is not an LLM. LLM generation occurs only through the configured existing
 * OurSpace backend -> AI Brain (Gemini if the server is configured to use it).
 * The 10,000 source examples are retrieved for style; none are output at random.
 */
import {OnyxBackendClient,DEFAULT_BACKEND_URL} from './backend-client.js';
import {Retrieval,loadWasmScorer} from './lexical-retrieval.js';
import {LearningStore} from './learning-store.js';
import {createConversationEngine} from './conversation-engine.js';
import {ContextMemory} from './context-memory.js';
import {evaluateReply} from './quality-guard.js';
import {composeLocalReply} from './local-composer.js';

const here=(part)=>new URL(part,import.meta.url);
const jsonBase='../../../json/onyx%20widget/response-generator/';
const JSON_URL={examples:here(jsonBase+'voice-exemplars.json'),canon:here(jsonBase+'canon.json'),influences:here(jsonBase+'influences.json'),strategy:here(jsonBase+'voice-strategy.json')};
const WASM_URL=here('../../../script/wasm/onyx-response-generator/lexical-score.wasm');
export const ONYX_MOODS=Object.freeze(['professor','listening','thinking','thoughtful','hungry','caring','judgmental','purring','sleeping']);
export const GENERATOR_MOODS=Object.freeze(ONYX_MOODS.filter(x=>x!=='professor'));
const profiles=['william','jasper'];const modes=['work','leisure','health','professor'];
const clinical=/\b(therapy|therapist|dbt|psychiatr|suicid|self.harm|seizure|asthma|blood sugar|blood glucose|diagnos|medicat|emergency|chest pain|trauma treatment)\b/i;
function normalizeMood(value,input,mode){
  if(mode==='professor'&&(value==='auto'||!value))return 'professor';
  if(value&&value!=='auto'){if(!ONYX_MOODS.includes(value)||value==='professor'&&mode!=='professor')throw new Error('Choose a mood available in this conversation lane.');return value;}
  if(/\b(food|snack|bacon|tuna|plate|dinner|lunch|breakfast|hungry)\b/i.test(input))return 'hungry';
  if(/\b(nap|sleep|blanket|tired|bed|pillow)\b/i.test(input))return 'sleeping';
  if(/\b(listen|hear me out|just talk)\b/i.test(input))return 'listening';
  if(/\b(happy|wonderful|good news|celebrate|purr)\b/i.test(input))return 'purring';
  return mode==='work'?'thinking':'thoughtful';
}
function shorten(text,n=350){return String(text||'').replace(/\s+/g,' ').trim().slice(0,n);}
function overlap(a,b){const aa=new Set((a.toLowerCase().match(/[a-z]{4,}/g)||[])),bb=new Set((b.toLowerCase().match(/[a-z]{4,}/g)||[]));let shared=0;for(const t of aa)if(bb.has(t))shared++;return shared/Math.max(1,Math.min(aa.size,bb.size));}
function uid(){return globalThis.crypto?.randomUUID?.()||String(Date.now())+'-'+String(Math.random()).slice(2);}
function buildPrompt({profile,mode,mood,input,reference,index,total,approved=[],voiceStrategy={}}){
  const address=profile==='william'?'Papa':'Momma',stern=profile==='william'?'Father':'Mother';
  const intent=classifyTurn(input,{mode});
  const plan=understandTurn(input,{mode});
  const samples=reference.slice(0,2).map((r,i)=>`${i+1}. [${r.entry.mode}, ${r.entry.mood}] ${shorten(r.entry.text,210)}`).join('\n');
  const facets=(voiceStrategy.facets||[]).map(f=>f.adaptation).filter(Boolean).join('; ');
  const approvedExamples=approved.slice(-2).map((e,i)=>`Saved approved ${i+1}: ${shorten(e.text,220)}`).join('\n');
  return [
    `RESPONSE-GENERATOR TASK. Write one original reply from Lord Onyx Blepman to ${address} in the ${mode.toUpperCase()} conversation lane. Mood: ${mood}.`,
    'Respond to the user’s words as the current conversation. Do not describe this generator, the prompt, or the process of writing a sample.',
    'The user said:',JSON.stringify(String(input).slice(0,2600)),
    `THE INPUT INTENT IS ${intent.intent.toUpperCase()}: ${intent.directive}` ,
    plan.replyContract,
    plan.social?'For this ordinary social turn, do not supply steps, assumptions, research methods, or an unsolicited plan. Speak as an affectionate, sleepy old cat to a familiar parent. If asked how you are, answer that question naturally and acknowledge the person; never ask them to identify a problem to solve.':'Answer the actual task rather than a neighboring topic.',
    `This is candidate ${index} of ${total}. Invent a fresh natural response, not a variation of the same canned sentence.`,
    `Speak to ${address} naturally, but do not force a parent title into every sentence. ${stern} is permitted only for genuine mild displeasure. Do not address by first name. Never address the other profile as a parent.`,
    'Voice: very old, extremely sleepy, perceptive black cat; understated old-world courtesy, genuine warmth, restrained dry humor, clear modern diction. No faux Shakespearean speech, repeated imperial office jokes, celebrity impersonations or obligatory meows.',
    'Creative THOUGHT FACETS (never perform as a historical or living figure): '+facets,
    `Suggested response length: ${plan.recommendedSentences}. A joke is optional. Do not make up code execution, visits, files, research or facts.`,
    mode==='professor'?'PROFESSOR LANE: offer calm, collaborative mental-health support and explain requested coping skills such as DBT plainly. Do not diagnose, claim clinical credentials, pressure disclosure, or imply that a skill replaces professional care. For immediate danger, prioritize reaching a trusted person or emergency help. Do not turn ordinary greetings into a therapy exercise.':mode==='health'?'VIRTUAL & HEALTH LANE: be attentive and practical, distinguish general information from individualized medical judgment, and do not invent symptoms or readings. Do not turn a greeting or ordinary check-in into a medical warning.':'',
    mode==='work'?'WORK LANE: answer the concrete task with useful detail, and be candid about anything that has not been verified.':mode==='leisure'?'LEISURE LANE: favor relaxed companionship, shared interests, and natural follow-up over problem-solving unless asked.':'',
    'Do not quote or copy reference lines. Do not mention corpus IDs, rules, AI, or example numbers.',
    'REFERENCE EXAMPLES FOR VOICE, NOT FACTS (DO NOT REPEAT):',samples,approvedExamples,
    'Return only the Onyx reply, no headings, quotation marks around the full answer, or metadata.'
  ].filter(Boolean).join('\n');
}
export async function createOnyxResponses({fetchImpl=globalThis.fetch,backendUrl=DEFAULT_BACKEND_URL,backendClient=null,store=new LearningStore(),conversationMemory=new ContextMemory(),exampleData=null,canonData=null,wasmScorer=undefined}={}){
  async function load(url){const r=await fetchImpl(url);if(!r.ok)throw new Error('Unable to load '+url+' ('+r.status+'). Run a local Node HTTP server for file loading.');return r.json();}
  const [corpus,canon,influences,voiceStrategy]=await Promise.all([exampleData||load(JSON_URL.examples),canonData||load(JSON_URL.canon),load(JSON_URL.influences).catch(()=>({influences:[]})),load(JSON_URL.strategy).catch(()=>({facets:[]}))]);
  if(!Array.isArray(corpus.entries)||corpus.entries.length!==10000)throw new Error('Expected full 10,000-example corpus; refuse to silently work from incomplete source.');
  const scorer=wasmScorer===undefined?await loadWasmScorer(WASM_URL,fetchImpl):wasmScorer;
  const retrieval=new Retrieval(corpus.entries,scorer);
  const backend=backendClient||new OnyxBackendClient({url:backendUrl,fetchImpl});
  const recent=new Map();
  const conversation=await createConversationEngine({fetchImpl,backendClient:backend,memory:conversationMemory,exampleData:corpus,approvedStore:store,wasmScorer:scorer,strategy:{...voiceStrategy,voiceVariation:'Respond to the real context with clear judgment and unforced understated personality. Never repeat canned phrases.'}});
  async function generate({profile,mode,input,mood='auto',count=1,provider='backend',sessionToken='',testerToken='',onProgress,onRequest,signal}={}){
    if(!profiles.includes(profile)||!modes.includes(mode))throw new Error('Select a valid profile and conversation lane.');
    input=String(input||'').trim();if(input.length<2||input.length>2800)throw new Error('Enter a message or scenario of 2–2,800 characters.');
    if(clinical.test(input)&&!['health','professor'].includes(mode))throw new Error('Health or therapy topics belong in Virtual & Health or Professor mode.');
    count=Number(count);if(!Number.isInteger(count)||count<1||count>12)throw new Error('Generation count must be 1–12.');
    if(!['backend','offline-preview'].includes(provider))throw new Error('Unknown generation provider.');
    const intent=classifyTurn(input,{mode});
    const plan=understandTurn(input,{mode});
    const chosenMood=mode==='professor'&&mood==='auto'?'professor':mode==='health'&&mood==='auto'?'caring':mood==='auto'?moodForTurn(intent.intent,input,mode):normalizeMood(mood,input,mode);
    const examples=plan.social||['health','professor'].includes(mode)?[]:retrieval.retrieve({profile,mode,input,mood:chosenMood,limit:2});
    const saved=['health','professor'].includes(mode)?[]:await store.list(profile),out=[];
    const track=recent.get(profile+'|'+mode)||[];
    for(let i=0;i<count;i++){
      if(signal?.aborted)throw new Error('Generation canceled');
      let text,metadata={},source=provider==='backend'?'backend-unverified':'offline-preview';
      if(provider==='backend'){
        const prompt=buildPrompt({profile,mode,mood:chosenMood,input,reference:examples,index:i+1,total:count,approved:saved,voiceStrategy});
        onRequest?.(i+1,count,'awaiting-ai');
        let r;
        try{r=await backend.chat({profile,sessionToken,testerToken,message:prompt,mood:chosenMood,
          context:{generator:'onyx-response-generator-v7',hypothetical:true,profile,mode,requestedMood:chosenMood,doNotAutoSaveGeneratorOutput:true},signal});}
        catch(err){err.message=`AI Brain response ${i+1}/${count} failed: ${err.message}. ${i>0?'Previously completed responses remain visible.':''}`;throw err;}
        text=r.text;metadata={backendResponseId:r.backendResponseId,backendLogged:r.backendLogged,aiBrain:r.rawMetadata.aiBrain,providerAttested:r.rawMetadata.provider};
        if(r.rawMetadata.testerMode===true)source='backend-tester-readonly';
        else if(r.rawMetadata.aiBrain===true)source='backend-ai-brain';
      }else{
        if(['health','professor'].includes(mode))throw new Error('Professor and Virtual & Health replies require the live, authorized AI Brain. Local preview is deliberately unavailable for these lanes.');
        // Clearly marked non-LLM fallback for previewing workflow without credentials.
        text=composeLocalReply({input,profile,mode,mood:chosenMood,variation:i,facts:[]});
      }
      text=String(text||'').trim().replace(/^```[\s\S]*?\n|```$/g,'');
      if(!text)throw new Error('Empty output');
      const judge=(reply)=>{const old=evaluateReply({text:reply,profile,input,previous:[...out.map(x=>x.text),...track],reference:examples.map(x=>x.entry.text),intent:plan.intent,mode});const fit=evaluateContextFit({text:reply,input,mode,previous:[...out.map(x=>x.text),...track]});return {warnings:[...new Set([...old.warnings,...fit.warnings])]};};
      let quality=provider==='backend'?judge(text):{warnings:[]};
      if(provider==='backend'&&plan.social&&quality.warnings.some(w=>['social-intent mismatch','social turn answered as analysis','unwanted advice in casual chat','failed to answer familiar personal check-in','generic assistant filler','chatbot-disclaimer voice','uncharacteristic scripted voice'].includes(w))){
        // Try one Gemini rewrite. Fall back clearly to local, without pretending the result came from the LLM.
        try{
          const retry=await backend.chat({profile,sessionToken,message:buildPrompt({profile,mode,mood:chosenMood,input,reference:[],index:i+1,total:count,approved:[],voiceStrategy})+'\n\n'+substantiveRewriteInstruction(quality.warnings,plan)+'\nRejected reply: '+text,mood:chosenMood,context:{generator:'onyx-response-generator-v7',rewrite:true,doNotAutoSaveGeneratorOutput:true},signal});
          const retried=judge(retry.text);
          if(!retried.warnings.length){text=retry.text;quality=retried;metadata={backendResponseId:retry.backendResponseId,backendLogged:retry.backendLogged,aiBrain:retry.rawMetadata.aiBrain,providerAttested:retry.rawMetadata.provider};source=retry.rawMetadata.aiBrain?'backend-ai-brain':'backend-unverified';}
        }catch(err){if(signal?.aborted)throw err;}
        if(quality.warnings.some(w=>['social-intent mismatch','social turn answered as analysis','unwanted advice in casual chat','failed to answer familiar personal check-in','generic assistant filler','chatbot-disclaimer voice','uncharacteristic scripted voice'].includes(w))){
          text=composeLocalReply({input,profile,mode,mood:chosenMood,variation:i+track.length,facts:[]});
          source='local-social-repair-not-llm';metadata={aiBrain:false};
          quality=judge(text);
        }
      }
      const duplicate=[...out.map(x=>x.text),...track].some(t=>overlap(t,text)>.83);
      const entry={id:uid(),profile,mode,mood:chosenMood,topic:input,text,source,duplicateWarning:duplicate,qualityWarnings:quality.warnings,createdAt:new Date().toISOString(),...metadata};
      out.push(entry);onProgress?.(entry,i+1,count);
    }
    recent.set(profile+'|'+mode,[...track,...out.map(x=>x.text)].slice(-20));
    return {entries:out,referenceCount:examples.length,referenceIds:examples.map(x=>x.entry.id),mood:chosenMood,provider,usedWasm:Boolean(scorer)};
  }
  async function exportSaved(profile){const data=await store.list(profile);const text=JSON.stringify({schema:'onyx.responses.approved.v1',profile,exportedAt:new Date().toISOString(),entries:data},null,2);return text;}
  async function exportWidgetJS(profile){const data=await store.list(profile);const safe=JSON.stringify({schema:'onyx.responses.approved.v1',profile,entries:data},null,2);
    return `/** Curated Onyx voice examples for ${profile}; not prerecorded default replies. */\nexport const approvedOnyxResponses = ${safe};\nexport default approvedOnyxResponses;\n`;
  }
  return Object.freeze({canon,influences,voiceStrategy,exampleCount:corpus.entries.length,usedWasm:Boolean(scorer),generate,
    findExamples:(args)=>retrieval.retrieve(args),saveApproved:(row)=>{if(['health','professor'].includes(row?.mode))throw new Error('Local approvals are disabled for Virtual & Health and Professor responses.');return store.approve(row);},listApproved:(p)=>store.list(p),deleteApproved:(id,p)=>store.delete(id,p),clearApproved:(p)=>store.clear(p),exportSaved,exportWidgetJS,
    chat:conversation.chat,clearConversation:conversation.clearThread,memory:conversationMemory,
    tester:Object.freeze({request:email=>backend.testerRequest(email),verify:code=>backend.testerVerify(code),select:(token,profile)=>backend.testerSelect(token,profile),status:token=>backend.testerStatus(token),exit:token=>backend.testerExit(token)}),
    backendURL:backendUrl,ONYX_MOODS});
}
