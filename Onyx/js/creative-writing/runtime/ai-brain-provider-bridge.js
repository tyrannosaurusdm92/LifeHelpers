/* Writer Helper Ready consolidated module: ai-brain-provider-bridge.js
 * Generated 2026-09-22 by loss-preserving concatenation.
 * Every source module is retained below in an isolated source section unless explicitly documented.
 */

/* ===== BEGIN SOURCE: writer-generation-stream.js | sha256:dfaa68f58ef4f246862493d1d5a9d984ae304279fe5ee2b2425b617a6a849bf7 ===== */
/* Writer Tools — streaming JSON/event reader for optional generation backends. */
(function(global){'use strict';
function splitSSEBuffer(buffer){const parts=String(buffer||'').split(/\r?\n\r?\n/);return {events:parts.slice(0,-1),rest:parts.at(-1)||''};}
function parseSSEEvent(block){const lines=String(block||'').split(/\r?\n/);let event='message',data=[];for(const line of lines){if(line.startsWith('event:'))event=line.slice(6).trim();else if(line.startsWith('data:'))data.push(line.slice(5).trimStart());}if(!data.length)return null;const raw=data.join('\n');try{return {event,data:JSON.parse(raw)}}catch(_){return {event,data:raw}}}
async function consumeGenerationStream(res,onEvent,{isAborted}={}){if(!res?.body)throw new Error('No generation response stream.');const reader=res.body.getReader(),decoder=new TextDecoder();let buffer='';while(true){if(isAborted?.())break;const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const split=splitSSEBuffer(buffer);buffer=split.rest;for(const block of split.events){const evt=parseSSEEvent(block);if(evt)onEvent?.(evt);}}if(buffer.trim()){const evt=parseSSEEvent(buffer);if(evt)onEvent?.(evt);}}
global.WriterToolsGenerationStream=Object.freeze({splitSSEBuffer,parseSSEEvent,consumeGenerationStream});
})(typeof globalThis!=='undefined'?globalThis:window);

/* ===== END SOURCE: writer-generation-stream.js ===== */

/* ===== BEGIN SOURCE: writer-backend-provider.js | sha256:2dae1eee960990f2ac028a613d7f9bfbdb2be53caab98c6edaef1b64bece0cf1 ===== */
/* Writer Tools — Onyx AI-brain provider adapter with shared William-voice fallback support. */
(function(global){'use strict';
 const VERSION='2.1.0';
 const DEFAULT_ONYX_AI_BRAIN_URL='https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
 function endpoint(){return String(global.WRITER_TOOLS_BACKEND_URL||global.STORY_BACKEND_URL||global.ONYX_AI_BRAIN_URL||DEFAULT_ONYX_AI_BRAIN_URL||'').trim();}
 async function post(action,data){const url=endpoint();if(!url)throw new Error('Writer Tools backend URL is not configured. Set window.WRITER_TOOLS_BACKEND_URL or provide window.WRITER_TOOLS_BACKEND_PROVIDER.');const response=await fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,data:data||{},frontend:'writer-tools',version:VERSION}),credentials:'omit',redirect:'follow',cache:'no-store'});const text=await response.text();let payload;try{payload=JSON.parse(text)}catch(_e){throw new Error('Writer Tools backend returned an unreadable response.')}if(!response.ok||payload?.ok===false)throw new Error(payload?.error||`Writer Tools backend returned HTTP ${response.status}.`);return payload;}
 function finalizeText(text,kind='story',request={}){let out=String(text||'');if(!out)return{content:'',audit:null,changed:false};const before=global.WriterWilliamVoice?.audit?.(out,{...request,kind})||null;if(request.preserveExact!==true){out=global.WriterWilliamVoice?.repairHeuristic?.(out,{...request,kind})||out;out=global.WriterWilliamVoice?.lightPolish?.(out,{...request,kind})||out;}const audit=global.WriterWilliamVoice?.audit?.(out,{...request,kind})||null;return{content:out,audit,before,changed:out!==String(text||'')};}
 function finalizeResult(result={},request={},kind='story'){if(!result||typeof result!=='object')return result;const out={...result};if(out.chapter?.content!=null){const f=finalizeText(out.chapter.content,kind,request);out.chapter={...out.chapter,content:f.content,william_voice_audit:f.audit};out.williamVoiceAudit=f.audit;out.craftCorrection={applied:true,changed:f.changed,before:f.before,after:f.audit};return out;}for(const key of ['content','text','prose']){if(out[key]!=null){const f=finalizeText(out[key],kind,request);out[key]=f.content;out.williamVoiceAudit=f.audit;out.craftCorrection={applied:true,changed:f.changed,before:f.before,after:f.audit};break;}}return out;}
 function mode(context={},series={}){return global.WriterToolsRomanceBoundary?.normalizeMode?.(context?.content?.effective_mode||context?.content?.requested_mode||series?.content_mode)||'romance';}
 function activeSeries(context={}){const engine=global.WriterToolsApp?.engine||global.WRITER_CYOA;const key=context?.series?.key||engine?.currentSeriesKey||'';return engine?.getSeries?.(key)||context?.series||null;}
 function directionFor(request={},context={}){return [String(context?.requested?.direction||''),context?.selected_choice?`${context.selected_choice.label||''}: ${context.selected_choice.description||''}`:'',global.WriterToolsRomanceBoundary?.promptBlock?.(activeSeries(context)||{},context)||'',global.StoryTools?.WriterReference?.buildWriterReferencePrompt?.({query:request.prompt||'',sceneGoal:context?.requested?.direction||''})||'',String(request.prompt||'')].filter(Boolean).join('\n\n');}
 async function provider(request={}){const context=request.context||{},series=activeSeries(context);
   const voiceContract=global.WriterWilliamVoice?.contractForBackend?.({...request,workType:request.workType||context?.series?.story_type||request.mode,prompt:request.prompt||''})||null;
   if(voiceContract){request={...request,prompt:[voiceContract.voicePrompt,request.prompt||''].filter(Boolean).join('\n\n'),voiceContract};context.william_voice=voiceContract.voicePacket;}if(!series)throw new Error('No active writing project is available for backend generation.');const m=mode(context,series);if(m==='fade_to_black'){return {chapter:global.WriterFadeToBlackBridge?.makeFadeChapter?.({series,parent:context.parent,resumeTarget:context?.fade_transition?.resume_target||'@generate'})||null,fade_to_black:true};}
   const synced={...series,content_mode:m,rating:global.WriterToolsRomanceBoundary?.RATING||'General / Romance / Fade-to-Black',story_bible:[...(Array.isArray(series.story_bible)?series.story_bible:[series.story_bible].filter(Boolean)),global.WriterToolsRomanceBoundary?.promptBlock?.(series,context)].filter(Boolean)};
   const opening=context?.requested?.mode==='new_story_opening'; const action=opening?'writer.create':(context?.selected_choice?'writer.branch':'writer.continue'); const data=opening?{...synced,overwrite:true,voice_contract:voiceContract}:{series:synced,seriesKey:synced.key,currentChapterId:context?.parent?.id||'',choice:context?.selected_choice||undefined,direction:directionFor(request,context),voice_contract:voiceContract,session_id:`writer-${synced.key}`}; const result=await post(action,data); if(!result?.chapter)throw new Error('Writer Tools backend did not return a generated chapter.'); return finalizeResult(result,request,global.WriterWilliamVoice?.taskKind?.(request)||'story');
 }
 async function generateWithFallback(request={}){
   const context=request.context||{};
   const kind=global.WriterWilliamVoice?.taskKind?.(request)||'story';
   const series=activeSeries(context);
   if(series){try{return await provider(request);}catch(error){console.warn?.('Onyx writer provider failed; using shared William-voice fallback.',error);return {...(global.WriterFallbackBrain?.generate?.({...request,kind},context)||{ok:false,content:''}),primaryError:String(error?.message||error)};}}
   const voiceContract=global.WriterWilliamVoice?.contractForBackend?.({...request,kind,prompt:request.prompt||''})||null;
   const payload={kind,prompt:[voiceContract?.voicePrompt,request.prompt||''].filter(Boolean).join('\n\n'),voice_contract:voiceContract,context,data:request.data||{},mode:request.mode||kind,schema:request.schema||'writer.generic.v1'};
   try{
     const action=String(request.action||global.WRITER_TOOLS_GENERIC_ACTION||'writer.generate');
     const result=await post(action,payload);
     const text=String(result?.content||result?.text||result?.prose||result?.chapter?.content||'');
     return text?finalizeResult(result,request,kind):result;
   }catch(error){
     console.warn?.('Onyx generic writer route failed; using shared William-voice fallback.',error);
     return {...(global.WriterFallbackBrain?.generate?.({...request,kind},context)||{ok:false,content:''}),primaryError:String(error?.message||error)};
   }
 }
 function install(){
   if(typeof global.WRITER_TOOLS_BACKEND_PROVIDER!=='function')global.WRITER_TOOLS_BACKEND_PROVIDER=provider;
   global.WRITER_TOOLS_STORY_PROVIDER=global.WRITER_TOOLS_BACKEND_PROVIDER;
   global.WRITER_TOOLS_PROVIDER=global.WRITER_TOOLS_BACKEND_PROVIDER;
   global.WRITER_TOOLS_DIALOGUE_PROVIDER=global.WRITER_TOOLS_BACKEND_PROVIDER;
   global.WRITER_TOOLS_GENERAL_PROVIDER=generateWithFallback;
   global.CYOA_STORY_PROVIDER=global.WRITER_TOOLS_BACKEND_PROVIDER;
   return global.WRITER_TOOLS_BACKEND_PROVIDER;
 }
 if(endpoint())install();
 global.WriterToolsBackendBridge=Object.freeze({VERSION,DEFAULT_ONYX_AI_BRAIN_URL,endpoint,post,finalizeText,finalizeResult,provider,generateWithFallback,install});
})(typeof globalThis!=='undefined'?globalThis:window);

/* ===== END SOURCE: writer-backend-provider.js ===== */


/* ===== WRITER_HELPER_READY — authoritative OurSpace/Onyx AI-Brain transport ===== */
(function(global){'use strict';
const ENDPOINT='https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
const legacy=global.WriterToolsBackendBridge;
function endpoint(){return String(global.WRITER_TOOLS_BACKEND_URL||global.ONYX_AI_BRAIN_URL||ENDPOINT).trim();}
function storageGet(keys=[]){if(typeof localStorage==='undefined')return'';for(const k of keys)try{const v=localStorage.getItem(k);if(v)return v;}catch(_e){}return'';}
function sessionToken(request={}){return String(request.sessionToken||request.context?.sessionToken||global.OURSPACE_SESSION_TOKEN||global.ONYX_SESSION_TOKEN||storageGet(['ourspace-session-token','ourspace_session_token','sessionToken','site_session_token'])||'').trim();}
function threadId(request={}){return String(request.threadId||request.context?.threadId||storageGet(['writer-helper-thread-id'])||`writer-helper-${Date.now().toString(36)}`);}
async function postOnyx(request={},message='',context={}){const token=sessionToken(request);if(!token)throw new Error('Authenticated OurSpace session token is unavailable; static writer fallback will be used.');const body={action:'onyx.chat',namespace:'ourspace.onyx',sessionToken:token,useBrain:true,ai:true,data:{message:String(message||''),threadId:threadId(request),useBrain:true,ai:true,webSearch:request.webSearch===true,useDrive:request.useDrive===true,autoRemember:request.autoRemember!==false,reasoningEffort:request.reasoningEffort||'medium',maxOutputTokens:Number(request.maxOutputTokens||2400),context:{writerHelper:true,kind:global.WriterWilliamVoice?.taskKind?.(request)||request.kind||'story',requestContext:context,voiceContract:request.voiceContract||null,craft:request.craft||null}}};const res=await fetch(endpoint(),{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(body),credentials:'omit',redirect:'follow',cache:'no-store'});const raw=await res.text();let data;try{data=JSON.parse(raw);}catch(_e){throw new Error('Onyx backend returned an unreadable response.');}if(!res.ok||data?.ok===false)throw new Error(data?.error||`Onyx backend returned HTTP ${res.status}.`);return data;}
function buildMessage(request={},context={}){const kind=global.WriterWilliamVoice?.taskKind?.(request)||request.kind||'story',voice=global.AIBrainPersona?.prompt?.({...request,kind,prompt:request.prompt||request.direction||'',includeEvidence:true})||global.WriterWilliamVoice?.promptBlock?.({...request,kind})||'',craft=global.AIBrainCreativeResearch?.craftPacket?.({...request,kind,text:request.draft||'',scene:request.scene,beats:request.beats})||null;request.voiceContract=global.WriterWilliamVoice?.contractForBackend?.({...request,kind,prompt:request.prompt||''})||null;request.craft=craft;const instructions=['WRITER HELPER REQUEST',`KIND: ${kind}`,voice,'Use the research/craft systems as invisible support. Preserve William’s voice but actively repair over-explanation, rushed causal/emotional transitions, overloaded lyrics, flat hooks, and same-voice dialogue. Character dialogue belongs to each character, not to the author.','For sexual intimacy, keep the established fade-to-black boundary; do not generate explicit sexual detail.','For conlang/language-history output, distinguish user-given facts from modeled evolution. Do not claim simulated outcomes are historically inevitable.',request.prompt||request.direction||'',context&&Object.keys(context).length?`CONTEXT JSON:\n${JSON.stringify(context).slice(0,50000)}`:'',craft?`CRAFT DIAGNOSTICS/PLAN:\n${JSON.stringify(craft).slice(0,24000)}`:''].filter(Boolean);return instructions.join('\n\n');}
function wrapStory(content,request={},context={},backend={}){const parent=context.parent||{},num=Number(parent.chapter_number||0)+1;return{ok:true,source:'onyx-ai-brain',chapter:{id:`onyx-${Date.now().toString(36)}`,chapter_number:num,title:request.title||`Chapter ${num}`,content:String(content||''),generated:true,choices:[]},content:String(content||''),responseId:backend.responseId||'',backend};}
async function postCompat(action,data={},request={}){const a=String(action||'onyx.chat'),d=(data&&typeof data==='object')?data:{message:String(data||'')},context=d.context||request.context||{};const message=String(d.message||d.prompt||d.direction||request.prompt||`Legacy writer request (${a})`);return postOnyx({...request,sessionToken:request.sessionToken||d.sessionToken||''},message,{...context,legacyWriterAction:a});}
async function generatePrimary(request={},context=request.context||{}){const msg=buildMessage(request,context),data=await postOnyx(request,msg,context),text=String(data.response||data.onyxReply||data.text||'');if(!text)throw new Error('Onyx AI-Brain returned no text.');const kind=global.WriterWilliamVoice?.taskKind?.(request)||'story',governed=global.AIBrainPersona?.govern?.(text,{...request,kind})||{content:text,audit:null};return context?.series||request.expectChapter?{...wrapStory(governed.content,request,context,data),williamVoiceAudit:governed.audit}:{...data,content:governed.content,text:governed.content,williamVoiceAudit:governed.audit,source:'onyx-ai-brain'};}
async function generateWithFallback(request={}){const context=request.context||{};try{return await generatePrimary(request,context);}catch(error){const fb=global.WriterFallbackBrain?.generate?.(request,context)||{ok:false,content:'',source:'fallback-unavailable'};return{...fb,primaryError:String(error?.message||error),primary:'onyx.chat',fallback:true};}}
function install(){global.WRITER_TOOLS_BACKEND_PROVIDER=(request={})=>generatePrimary(request,request.context||{});global.WRITER_TOOLS_STORY_PROVIDER=global.WRITER_TOOLS_BACKEND_PROVIDER;global.WRITER_TOOLS_PROVIDER=global.WRITER_TOOLS_BACKEND_PROVIDER;global.WRITER_TOOLS_DIALOGUE_PROVIDER=global.WRITER_TOOLS_BACKEND_PROVIDER;global.WRITER_TOOLS_GENERAL_PROVIDER=generateWithFallback;global.CYOA_STORY_PROVIDER=global.WRITER_TOOLS_BACKEND_PROVIDER;return global.WRITER_TOOLS_BACKEND_PROVIDER;}
install();
global.WriterToolsBackendBridge=Object.freeze({...legacy,VERSION:'4.0.0-ready',DEFAULT_ONYX_AI_BRAIN_URL:ENDPOINT,endpoint,sessionToken,threadId,post:postCompat,postOnyx,postCompat,buildMessage,generatePrimary,generateWithFallback,provider:(request={})=>generatePrimary(request,request.context||{}),install});
})(typeof globalThis!=='undefined'?globalThis:window);


if (typeof globalThis !== 'undefined') { globalThis.WRITER_HELPER_READY_BUILD = globalThis.WRITER_HELPER_READY_BUILD || '2026-09-22-ready'; }
