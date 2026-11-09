import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createOnyxResponses,ONYX_MOODS} from './onyx-responses.js';
import {OnyxBackendClient} from './backend-client.js';
import {fingerprint} from './lexical-retrieval.js';
import {LearningStore} from './learning-store.js';

const requests=[];
async function fetchImpl(url,options){
  const name=String(url);
  if(name.startsWith('file:')){
    const data=await readFile(fileURLToPath(url));return new Response(data,{status:200});
  }
  if(name.startsWith('https://script.google.com/')){
    const req=JSON.parse(options.body);requests.push(req);
    return new Response(JSON.stringify({ok:true,aiBrain:true,response:'Papa, the first test is to trace the click handler before changing the CSS.',responseId:'fake-model-reply'}),{status:200,headers:{'Content-Type':'application/json'}});
  }
  throw new Error('Unexpected URL '+name);
}
let engine;
test.before(async()=>{engine=await createOnyxResponses({fetchImpl,store:new LearningStore({indexedDBImpl:null})});});

test('source inventory is complete: 5000 per profile, 9 moods, no Professor exemplars',()=>{
  assert.equal(engine.exampleCount,10000);assert.equal(ONYX_MOODS.length,9);assert.equal(ONYX_MOODS.includes('sleeping'),true);assert.equal(ONYX_MOODS.includes('snuggly'),false);
  const w=engine.findExamples({profile:'william',mode:'work',input:'button event does not respond',limit:5});
  const j=engine.findExamples({profile:'jasper',mode:'leisure',input:'food plate',limit:5});
  assert.ok(w.length);assert.ok(j.length);assert.ok(w.every(x=>x.entry.profile==='william'&&x.entry.mode==='work'));
  assert.ok(j.every(x=>x.entry.profile==='jasper'&&x.entry.mode==='leisure'));
});
test('WASM module is real and returns a callable overlap scorer',()=>assert.equal(engine.usedWasm,true));
test('fingerprint 128 bits is stable',()=>assert.deepEqual(fingerprint('hello lovely world'),fingerprint('hello lovely world')));
test('offline preview responds to input but labels itself non-LLM',async()=>{
  const data=await engine.generate({profile:'jasper',mode:'work',mood:'auto',provider:'offline-preview',input:'I am editing code but my button has no handler.'});
  assert.equal(data.entries.length,1);assert.equal(data.entries[0].source,'offline-preview');assert.match(data.entries[0].text,/Momma/);
});
test('Professor mode accepts supportive prompts while ordinary lanes keep their boundary',async()=>{
  await assert.rejects(()=>engine.generate({profile:'william',mode:'work',input:'Please plan a coding feature',mood:'professor',provider:'offline-preview'}),/mood available/);
  await assert.rejects(()=>engine.generate({profile:'william',mode:'leisure',input:'Help me plan my therapy appointment',provider:'offline-preview'}),/belong in Virtual & Health or Professor/);
  await assert.rejects(()=>engine.generate({profile:'william',mode:'professor',input:'I need help with a DBT grounding skill.',provider:'offline-preview'}),/require the live, authorized AI Brain/);
});
test('requires credentials for live backend; never stores keys or makes Gemini direct calls',async()=>{
  await assert.rejects(()=>engine.generate({profile:'william',mode:'work',input:'How would you fix this button?',provider:'backend'}),/session token/);
  const result=await engine.generate({profile:'william',mode:'work',input:'How would you fix this button?',provider:'backend',sessionToken:'test-session-only'});
  assert.equal(result.entries[0].source,'backend-ai-brain');assert.equal(requests.at(-1).action,'onyx.chat');
  assert.equal(requests.at(-1).sessionToken,'test-session-only');
  assert.equal(requests.at(-1).data.profileKey,'william');
  assert.equal(requests.at(-1).data.autoRemember,false);assert.equal(requests.at(-1).data.useDrive,false);
  assert.equal(requests.at(-1).data.allowWrites,false);
  assert.ok(!JSON.stringify(requests.at(-1)).match(/API_KEY|AIza/));
});
test('verified tester generation stays under the backend cap and keeps Leisure mode through social rewrite',async()=>{
  const calls=[];
  const testerEngine=await createOnyxResponses({fetchImpl,store:new LearningStore({indexedDBImpl:null}),backendClient:{chat:async args=>{
    calls.push(args);
    return {text:calls.length===1
      ?'Papa, I would begin by separating what is known from what we are assuming. Which part would you like to settle first?'
      :"I'm well, Papa. I have been dozing in a patch of sun, and it is lovely to hear from you.",
      rawMetadata:{testerMode:true,aiBrain:true,provider:'unverified'}};
  }}});
  const result=await testerEngine.generate({profile:'william',mode:'leisure',input:'Hey buddy how are you doing?',provider:'backend',testerToken:'verified-test-session'});
  assert.equal(calls.length,2,'the context guard should request one rewrite after the analytical first reply');
  assert.equal(result.entries[0].text,"I'm well, Papa. I have been dozing in a patch of sun, and it is lovely to hear from you.");
  assert.equal(result.entries[0].source,'backend-tester-readonly');
  for(const call of calls){
    assert.ok(call.message.length<=2400,`tester message was ${call.message.length} characters`);
    assert.equal(call.context.mode,'leisure');
    assert.equal(call.context.conversationLane,'leisure');
    assert.equal(call.testerToken,'verified-test-session');
  }
  assert.match(calls[0].message,/answer the social meaning directly/i);
  assert.match(calls[1].message,/Rejected draft/);
  assert.match(calls[1].message,/User message: Hey buddy how are you doing\?/);
});
test('tester generation reports oversized input instead of silently truncating it',async()=>{
  let called=false;
  const testerEngine=await createOnyxResponses({fetchImpl,store:new LearningStore({indexedDBImpl:null}),backendClient:{chat:async()=>{called=true;return {text:'unexpected'};}}});
  await assert.rejects(testerEngine.generate({profile:'william',mode:'professor',input:'x'.repeat(2400),provider:'backend',testerToken:'verified-test-session'}),/safe limit is 2400.*Shorten the input; it will not be silently cut/);
  assert.equal(called,false);
});
test('approved response memory remains profile scoped; exports are clean JS/JSON',async()=>{
  const saved=await engine.saveApproved({id:'approved-one',profile:'william',mode:'work',mood:'thinking',topic:'the button does not work',text:'Papa, inspect the handler first.',source:'backend-ai-brain'});
  assert.equal(saved.id,'approved-one');assert.equal((await engine.listApproved('william')).length,1);
  assert.equal((await engine.listApproved('jasper')).length,0);
  assert.match(await engine.exportWidgetJS('william'),/approvedOnyxResponses/);
  assert.equal(JSON.parse(await engine.exportSaved('william')).entries.length,1);
  await engine.clearApproved('william');assert.equal((await engine.listApproved('william')).length,0);
});
test('backend rejects unknown endpoint URL without contacting it',()=>{
  assert.throws(()=>new OnyxBackendClient({url:'https://bad.example/exec'}),/existing HTTPS/);
});
