import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {understandTurn} from './turn-understanding.js';
import {evaluateContextFit} from './dialogue-evaluator.js';
import {composeLocalReply} from './local-composer.js';
import {ContextMemory} from './context-memory.js';
import {parseBackendReply,BackendError} from './backend-client.js';
import {createOnyxResponses} from './onyx-responses.js';
import {createConversationEngine} from './conversation-engine.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const fetchImpl=async u=>new Response(await readFile(fileURLToPath(u)),{status:200});
const old='Papa, I would begin by separating what is known from what we are assuming. That gives us a practical next step without pretending to possess information I have not seen. Which part would you like to settle first?';
const history=[{user:'Hey buddy, how are you doing?',assistant:'I am quite well, Papa. I have been enjoying a peaceful nap.',createdAt:new Date().toISOString()}];
test('Turn director preserves check-in and recognizes follow-up welfare',()=>{
 let p=understandTurn('Hey buddy how are you doing?',{mode:'leisure'});assert.equal(p.intent,'welfare');assert.equal(p.social,true);
 p=understandTurn('And you?',{mode:'leisure',history});assert.equal(p.intent,'welfare');assert.equal(p.continuation,true);
 const reply=composeLocalReply({input:'And you?',profile:'william',mode:'leisure',history});assert.match(reply,/rest|quiet|comfortable|content|well|nap|good spirits|doing/i);
});
test('Greetings followed by real work questions route to task',()=>{
 for(const x of ['Hi, can you repair this JavaScript function?','Hey buddy, please explain why my code crashes','What does this CSS selector do?'])assert.equal(understandTurn(x,{mode:'leisure'}).intent,'task',x);
});
test('Wellbeing reply from backend with old analytic advice is rejected',()=>{
 const q=evaluateContextFit({input:'Hey buddy how are you doing?',text:old,mode:'leisure'});assert.equal(q.pass,false);assert.ok(q.warnings.includes('social turn answered as analysis'));
});
test('Normal Onyx wellbeing reply fits both parents',()=>{
 for(const profile of ['william','jasper']){
  const t=composeLocalReply({input:'Hey buddy how are you doing?',mode:'leisure',profile});
  assert.equal(evaluateContextFit({input:'Hey buddy how are you doing?',text:t,mode:'leisure'}).pass,true,t);
 }
});
test('Backend payload parser does not attest Gemini without provider',()=>{
 const x=parseBackendReply({ok:true,data:{result:{reply:'I am quite well, Papa.',aiBrain:true}}});
 assert.equal(x.rawMetadata.aiBrain,true);assert.equal(x.rawMetadata.provider,'unverified');
 const y=parseBackendReply({data:{choices:[{message:{content:'A little tired, Papa, but glad to see you.'}}]},provider:'gemini'});
 assert.equal(y.text,'A little tired, Papa, but glad to see you.');assert.equal(y.rawMetadata.provider,'gemini');
 assert.throws(()=>parseBackendReply({ok:true,data:{}}),BackendError);
});
test('Context memory avoids injecting irrelevant approved notes',async()=>{
 const m=new ContextMemory({indexedDBImpl:null,storage:null});
 await m.remember({profile:'william',mode:'work',text:'Aza’ra letters are a separate language design project.'});
 assert.deepEqual(await m.relevant({profile:'william',mode:'work',input:'How do I fix a network retry?'}),[]);
 assert.equal((await m.relevant({profile:'william',mode:'work',input:'What do you remember?'})).length,1);
 assert.equal((await m.relevant({profile:'jasper',mode:'work',input:'What do you remember?'})).length,0);
});
test('Generated response source is unverified unless upstream actually reports AI Brain',async()=>{
 const g=await createOnyxResponses({fetchImpl,wasmScorer:null});
 const backend=await import('./backend-client.js');
 const old=backend.OnyxBackendClient.prototype.chat;
 backend.OnyxBackendClient.prototype.chat=async()=>({text:'I am comfortable, Papa. It is good to hear from you.',rawMetadata:{aiBrain:false,provider:'unverified'},backendLogged:false});
 try {const output=await g.generate({profile:'william',mode:'leisure',input:'Hey buddy how are you doing?',count:1,provider:'backend',sessionToken:'fixture'});assert.equal(output.entries[0].source,'backend-unverified');}
 finally{backend.OnyxBackendClient.prototype.chat=old;}
});
test('Conversation planner carries prior turn in backend prompt without storing in another profile',async()=>{
 const exampleData=JSON.parse(await readFile(path.join(root,'json/onyx widget/response-generator/voice-exemplars.json')));
 const messages=[];
 const stub={chat:async({message})=>{messages.push(message);return {text:'Quite well, Papa. I was nearly asleep.',rawMetadata:{aiBrain:true,provider:'gemini'}};}};
 const g=await createConversationEngine({exampleData,backendClient:stub,wasmScorer:null,memory:new ContextMemory({indexedDBImpl:null,storage:null})});
 await g.chat({profile:'william',mode:'leisure',threadId:'follow',input:'Hey buddy how are you doing?',provider:'backend'});
 await g.chat({profile:'william',mode:'leisure',threadId:'follow',input:'And you?',provider:'backend'});
 assert.match(messages[1],/continuing thought/i);
 assert.match(messages[1],/Hey buddy how are you doing/);
 assert.equal((await g.memory.turns('jasper','leisure','follow')).length,0);
});

// Pass 6 tester email / read-only backend regression tests. Added to an EXISTING test file.
test('Email tester uses the backend-selected mailbox, not an arbitrary delivery address',async()=>{
 const {OnyxBackendClient}=await import('./backend-client.js');
 const calls=[];
 const client=new OnyxBackendClient({jsonpImpl:async({action,payload})=>{calls.push({action,payload});return {ok:true,verificationPending:true,codeLength:6,message:'Email queued'};}});
 await assert.rejects(()=>client.testerRequest('thirdparty@example.com'),/registered tester email/);
 const r=await client.testerRequest('williamsaville92@gmail.com');
 assert.equal(r.verificationPending,true);
 assert.equal(calls.length,1);assert.equal(calls[0].action,'onyx.tester.request');
 assert.deepEqual(calls[0].payload.data,{});
});
test('Tester code verification, profile selection, read-only chat, and exit use the supplied backend contract',async()=>{
 const {OnyxBackendClient}=await import('./backend-client.js');
 const token='fixture-temporary-tester-token';const calls=[];let selected='';
 const client=new OnyxBackendClient({jsonpImpl:async({action,payload})=>{
   calls.push({action,payload});
   if(action==='onyx.tester.verify')return {ok:true,testerMode:true,testerToken:token,selectionRequired:true,expiresAt:'2026-11-08T20:00:00Z'};
   if(action==='onyx.tester.select'){selected=payload.data.profileKey;return{ok:true,testerMode:true,selectedProfile:selected,expiresAt:'2026-11-08T20:00:00Z'};}
   if(action==='onyx.chat')return{ok:true,testerMode:true,selectedProfile:selected,onyxReply:selected==='william'?'Well enough, Papa. A nap would improve matters.':'Quite well, Momma. I hear you.'};
   if(action==='onyx.tester.exit')return {ok:true,testerMode:false};
   throw new Error('Unexpected action '+action);
 }});
 await assert.rejects(()=>client.testerVerify('not-six'),/six digits/);
 const auth=await client.testerVerify('839201');assert.equal(auth.testerToken,token);
 await client.testerSelect(token,'william');
 const chat=await client.chat({profile:'william',testerToken:token,message:'Hey buddy how are you doing?'});
 assert.match(chat.text,/Papa/);assert.equal(chat.rawMetadata.testerMode,true);assert.equal(chat.rawMetadata.provider,'unverified');
 assert.equal(calls.at(-1).payload.data.testerToken,token);
 assert.equal(calls.at(-1).payload.data.message,'Hey buddy how are you doing?');
 assert.equal(calls.at(-1).payload.sessionToken,undefined);
 await client.testerSelect(token,'jasper');
 const jasper=await client.chat({profile:'jasper',testerToken:token,message:'Hi buddy'});
 assert.match(jasper.text,/Momma/);
 assert.equal((await client.testerExit(token)).testerMode,false);
 assert.deepEqual(calls.map(x=>x.action),['onyx.tester.verify','onyx.tester.select','onyx.chat','onyx.tester.select','onyx.chat','onyx.tester.exit']);
});
test('Direct-file tester rejects unauthorized actions and unauthenticated chat',async()=>{
 const {OnyxBackendClient}=await import('./backend-client.js');
 const client=new OnyxBackendClient({jsonpImpl:async()=>({ok:true})});
 await assert.rejects(()=>client.requestJSONP('currency.spend',{}),/does not permit/);
 await assert.rejects(()=>client.requestJSONP('onyx.chat',{message:'hi'}),/Verify a tester email code/);
});
test('The browser-facing tester surfaces backend errors rather than guessing validity',async()=>{
 const {OnyxBackendClient}=await import('./backend-client.js');
 const client=new OnyxBackendClient({jsonpImpl:async()=>({ok:false,error:'Tester session expired or invalid. Request a new verification code.'})});
 await assert.rejects(()=>client.testerSelect('expired','william'),/expired or invalid/);
});
test('Tester conversation sends the literal human utterance, with no internal prompt injected',async()=>{
 const corpus=JSON.parse(await readFile(path.join(root,'json/onyx widget/response-generator/voice-exemplars.json')));
 const seen=[];
 const engine=await createConversationEngine({exampleData:corpus,wasmScorer:null,backendClient:{chat:async args=>{
   seen.push(args);return{text:'Papa, I am well, if a little drowsy. Thank you for asking.',rawMetadata:{testerMode:true,provider:'unverified',aiBrain:false}};
 }},memory:new ContextMemory({indexedDBImpl:null,storage:null})});
 const r=await engine.chat({profile:'william',mode:'leisure',input:'Hey buddy how are you doing?',provider:'backend',testerToken:'read-only-token',qualityRetry:true});
 assert.equal(seen.length,1);assert.equal(seen[0].message,'Hey buddy how are you doing?');
 assert.equal(r.source,'backend-tester-readonly');
});
test('Tester generator uses compact contextual prompts within the Apps Script URL contract',async()=>{
 const {OnyxBackendClient}=await import('./backend-client.js');
 const old=OnyxBackendClient.prototype.chat;const seen=[];
 OnyxBackendClient.prototype.chat=async args=>{
   seen.push(args);return{text:'Papa, I am in fine spirits, albeit considering another nap.',rawMetadata:{testerMode:true,provider:'unverified',aiBrain:false}};
 };
 try{
   const generator=await createOnyxResponses({fetchImpl,wasmScorer:null});
   const r=await generator.generate({profile:'william',mode:'leisure',input:'Hey buddy how are you doing?',provider:'backend',testerToken:'read-only-token',count:1});
   assert.equal(r.entries[0].source,'backend-tester-readonly');
   assert.equal(seen[0].testerToken,'read-only-token');
   assert.match(seen[0].message,/answer the social meaning directly/i);assert.match(seen[0].message,/Leisure: answer as familiar companionship/);
   assert.ok(seen[0].message.length<=2400,'prompt must stay beneath the existing tester backend message limit');
 }finally{OnyxBackendClient.prototype.chat=old;}
});

// Pass 7: unlike the quick email-code routes, full AI Brain calls need real model latency.
test('Tester AI Brain calls receive 180-second timeout while code actions stay short',async()=>{
  const {OnyxBackendClient}=await import('./backend-client.js');
  const seen=[];
  const client=new OnyxBackendClient({timeoutMs:45000,jsonpImpl:async({action,payload,timeoutMs})=>{
    seen.push({action,timeoutMs,payload});
    if(action==='onyx.chat')return {ok:true,testerMode:true,selectedProfile:'william',response:'Papa, I am enjoying a quiet morning.'};
    return {ok:true,testerMode:true,selectedProfile:'william'};
  }});
  await client.testerSelect('temporary-session','william');
  await client.chat({profile:'william',testerToken:'temporary-session',message:'Hey buddy, how are you?'});
  assert.equal(seen[0].timeoutMs,45000);
  assert.equal(seen[1].timeoutMs,180000);
  assert.equal(seen[1].payload.data.message,'Hey buddy, how are you?');
  assert.equal(seen[1].payload.data.testerToken,'temporary-session');
});
test('Tester mode distinguishes email verification success from missing AI Brain configuration',async()=>{
  const {OnyxBackendClient}=await import('./backend-client.js');
  const client=new OnyxBackendClient({jsonpImpl:async()=>({ok:false,error:'The shared AI Brain is not configured.'})});
  await assert.rejects(
    ()=>client.chat({profile:'william',testerToken:'temporary-session',message:'Hello Onyx'}),
    e=>e.name==='BackendError'&&e.details.code==='ai-brain-not-configured'&&/email|tester verification|AI Brain/i.test(e.message)
  );
});
test('Generator provides which candidate failed and keeps previously delivered progress',async()=>{
  const {OnyxBackendClient}=await import('./backend-client.js');
  const old=OnyxBackendClient.prototype.chat;const seen=[];let n=0;
  OnyxBackendClient.prototype.chat=async()=>{
    if(++n===2)throw new Error('AI Brain unavailable');
    return {text:'Papa, I am comfortable this morning.',rawMetadata:{testerMode:true,provider:'unverified',aiBrain:false}};
  };
  try{
    const generator=await createOnyxResponses({fetchImpl,wasmScorer:null});
    await assert.rejects(()=>generator.generate({profile:'william',mode:'leisure',input:'How are you doing?',provider:'backend',testerToken:'temp',count:2,
      onProgress:entry=>seen.push(entry.text)}),/response 2\/2 failed/);
    assert.equal(seen.length,1);
  }finally{OnyxBackendClient.prototype.chat=old;}
});
test('Generator reports each AI Brain request before awaiting a model response',async()=>{
  const {OnyxBackendClient}=await import('./backend-client.js');
  const old=OnyxBackendClient.prototype.chat;const progress=[];
  OnyxBackendClient.prototype.chat=async()=>({text:'Momma, this has been a restful afternoon.',rawMetadata:{testerMode:true}});
  try{
    const g=await createOnyxResponses({fetchImpl,wasmScorer:null});
    await g.generate({profile:'jasper',mode:'leisure',input:'How are you doing?',provider:'backend',testerToken:'temp',count:2,onRequest:(i,total,state)=>progress.push({i,total,state})});
    assert.deepEqual(progress,[{i:1,total:2,state:'awaiting-ai'},{i:2,total:2,state:'awaiting-ai'}]);
  }finally{OnyxBackendClient.prototype.chat=old;}
});
