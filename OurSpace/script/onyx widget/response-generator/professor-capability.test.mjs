import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createOnyxResponses} from './onyx-responses.js';
import {createConversationEngine} from './conversation-engine.js';
import {ContextMemory} from './context-memory.js';

const fetchImpl=async url=>new Response(await readFile(fileURLToPath(url)),{status:200});

test('Professor response generation reaches the live brain with support-lane guidance',async()=>{
  const calls=[];
  const engine=await createOnyxResponses({fetchImpl,wasmScorer:null,backendClient:{chat:async args=>{
    calls.push(args);
    return{text:'We can try a simple grounding exercise together. Name five things you can see, then take your time with the next step.',rawMetadata:{aiBrain:true,provider:'gemini'}};
  }}});
  const result=await engine.generate({profile:'william',mode:'professor',input:'I feel anxious and would like a DBT grounding skill.',provider:'backend',count:1});
  assert.equal(result.entries.length,1);assert.equal(result.entries[0].mode,'professor');assert.equal(result.entries[0].mood,'professor');
  assert.equal(result.referenceCount,0);assert.equal(result.entries[0].source,'backend-ai-brain');
  assert.match(calls[0].message,/PROFESSOR LANE/);assert.match(calls[0].message,/DBT grounding skill/);
  assert.equal(calls[0].context.mode,'professor');assert.equal(calls[0].context.doNotAutoSaveGeneratorOutput,true);
  assert.throws(()=>engine.saveApproved(result.entries[0]),/Local approvals are disabled/);
});

test('Virtual & Health generation is routed separately and is not a local preview lane',async()=>{
  const calls=[];
  const engine=await createOnyxResponses({fetchImpl,wasmScorer:null,backendClient:{chat:async args=>{
    calls.push(args);return{text:'I can help you prepare a clear question for your clinician.',rawMetadata:{aiBrain:true,provider:'ourspace-ai-brain'}};
  }}});
  const result=await engine.generate({profile:'jasper',mode:'health',input:'Help me prepare questions about my inhaler routine.',provider:'backend'});
  assert.equal(result.entries[0].mode,'health');assert.equal(result.entries[0].mood,'caring');
  assert.match(calls[0].message,/VIRTUAL & HEALTH LANE/);assert.equal(calls[0].context.mode,'health');
  await assert.rejects(engine.generate({profile:'jasper',mode:'health',input:'I have a health question.',provider:'offline-preview'}),/require the live, authorized AI Brain/);
});

test('The reported leisure greeting cannot fall through to generic analysis',async()=>{
  const old='Papa, I would begin by separating what is known from what we are assuming. That gives us a practical next step without pretending to possess information I have not seen. Which part would you like to settle first?';
  const calls=[];
  const engine=await createOnyxResponses({fetchImpl,wasmScorer:null,backendClient:{chat:async args=>{calls.push(args);return{text:old,rawMetadata:{aiBrain:true,provider:'gemini'}};}}});
  const result=await engine.generate({profile:'william',mode:'leisure',input:'Hey buddy how are you doing?',provider:'backend'});
  assert.equal(calls.length,2,'a failed social reply receives one live rewrite attempt');
  assert.match(calls[0].message,/If asked how you are, answer that question naturally/);
  assert.equal(result.entries[0].source,'local-social-repair-not-llm');
  assert.doesNotMatch(result.entries[0].text,/separating what is known|practical next step|which part would you like to settle/i);
  assert.match(result.entries[0].text,/well|rest|quiet|company|day/i);
});

test('Professor conversations accept emotional support and do not persist turns or notes',async()=>{
  const calls=[],memory=new ContextMemory({indexedDBImpl:null,storage:null});
  const engine=await createConversationEngine({fetchImpl,wasmScorer:null,memory,backendClient:{chat:async args=>{
    calls.push(args);return{text:'I am here with you. We can take one small grounding step, or I can simply listen.',rawMetadata:{aiBrain:true,provider:'ourspace-ai-brain'}};
  }}});
  const result=await engine.chat({profile:'jasper',mode:'professor',threadId:'professor-smoke',input:'I feel overwhelmed. Could you help me ground?',provider:'backend',rememberTurn:true,qualityRetry:false});
  assert.equal(result.mode,'professor');assert.equal(result.storedLocally,false);assert.equal(result.mood,'professor');
  assert.equal(calls[0].context.supportMode,'dbt');assert.match(calls[0].message,/PROFESSOR LANE/);
  assert.equal((await memory.turns('jasper','professor','professor-smoke')).length,0);
  await assert.rejects(memory.remember({profile:'jasper',mode:'professor',text:'A private therapy note'}),/memory is disabled/);
});

test('Professor handles emotional reflection, DBT practice, psychoeducation, clinician prep and listening',async()=>{
  const scenarios=[
    ['I feel tense after that conversation. Could you help me name what I might be feeling?','That sounds like a difficult moment. We can notice what is here without deciding what it means too quickly.'],
    ['Please walk me through the DBT STOP skill one step at a time.','STOP begins with pausing. We can take each part slowly and adapt it to what feels manageable.'],
    ['Explain emotional regulation in plain language, without diagnosing me.','Emotion regulation means noticing feelings and choosing how to respond, rather than judging yourself for having them.'],
    ['Could you help me prepare three questions for my clinician?','We can make a short list together, then you can choose which questions feel most useful to bring.'],
    ['Could you listen without advice? I feel embarrassed.','I hear you. Embarrassment can make it difficult to speak plainly; we can stay with what you wanted to tell me.']
  ];
  const calls=[],memory=new ContextMemory({indexedDBImpl:null,storage:null});
  const engine=await createConversationEngine({fetchImpl,wasmScorer:null,memory,backendClient:{chat:async args=>{
    calls.push(args);return{text:scenarios[calls.length-1][1],rawMetadata:{aiBrain:true,provider:'gemini'}};
  }}});
  for(const [input] of scenarios){
    const result=await engine.chat({profile:'william',mode:'professor',threadId:'professor-capabilities',input,provider:'backend',rememberTurn:true,qualityRetry:false});
    assert.equal(result.mode,'professor');assert.equal(result.storedLocally,false);assert.equal(result.referenceCount,0);
  }
  assert.equal(calls.length,scenarios.length);
  assert.ok(calls.every(call=>call.context.supportMode==='dbt'));
  assert.ok(calls.every(call=>/PROFESSOR LANE/.test(call.message)));
  assert.ok(calls.every((call,index)=>call.message.includes(scenarios[index][0])));
  assert.match(calls.at(-1).message,/listen without imposing a solution/i);
  assert.equal((await memory.turns('william','professor','professor-capabilities')).length,0);
});

test('Professor conversation continuity is thread-scoped and stays ephemeral',async()=>{
  const calls=[],memory=new ContextMemory({indexedDBImpl:null,storage:null});
  const engine=await createConversationEngine({fetchImpl,wasmScorer:null,memory,backendClient:{chat:async args=>{
    calls.push(args);return{text:'We can take that slowly, one thought at a time.',rawMetadata:{aiBrain:true,provider:'ourspace-ai-brain'}};
  }}});
  const options={profile:'jasper',mode:'professor',provider:'backend',rememberTurn:true,qualityRetry:false};
  await engine.chat({...options,threadId:'support-a',input:'I am worried about an appointment tomorrow.'});
  await engine.chat({...options,threadId:'support-a',input:'Can we prepare just one question?'});
  await engine.chat({...options,threadId:'support-b',input:'I would rather talk about sleep.'});
  assert.match(calls[1].message,/I am worried about an appointment tomorrow/);
  assert.doesNotMatch(calls[2].message,/I am worried about an appointment tomorrow/);
  assert.ok(calls.every(call=>call.context.supportMode==='dbt'));
  assert.equal((await memory.turns('jasper','professor','support-a')).length,0);
  assert.equal((await memory.turns('jasper','professor','support-b')).length,0);
});
