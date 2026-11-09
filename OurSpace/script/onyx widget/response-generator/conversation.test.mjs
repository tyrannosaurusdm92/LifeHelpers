import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {ContextMemory} from './context-memory.js';
import {createConversationEngine} from './conversation-engine.js';
import {evaluateReply} from './quality-guard.js';
const memory=new ContextMemory({indexedDBImpl:null,maxTurns:5});
const calls=[];
const fakeBackend={chat:async args=>{
  calls.push(args);
  return {text:args.profile==='jasper'?'Momma, this follows from our previous discussion.':'Papa, let us examine the event handler, then verify its return value.',rawMetadata:{aiBrain:true}};
}};
const fetchImpl=async url=>new Response(await readFile(fileURLToPath(url)),{status:200});
let engine;
test.before(async()=>engine=await createConversationEngine({memory,backendClient:fakeBackend,fetchImpl}));
test('exact original 10k references are preserved; wasm runtime loads',()=>{assert.equal(engine.exampleCount,10000);assert.equal(engine.usedWasm,true);});
test('Opt-in memories isolate family members and work/leisure',async()=>{
  const fact=await memory.remember({profile:'william',mode:'work',text:'The current coding priority is to repair the drag handler.'});
  assert.equal((await memory.relevant({profile:'william',mode:'work',input:'drag handler'})).length,1);
  assert.equal((await memory.facts('jasper','work')).length,0);
  assert.equal((await memory.facts('william','leisure')).length,0);
  assert.equal(await memory.forget({profile:'jasper',mode:'work',id:fact.id}),false);
  assert.equal(await memory.forget({profile:'william',mode:'work',id:fact.id}),true);
});
test('Sensitive clinical/secret notes are rejected from nonclinical memory',async()=>{
  await assert.rejects(memory.remember({profile:'jasper',mode:'leisure',text:'My API key is ABC123'}),/Private health/);
  await assert.rejects(memory.remember({profile:'jasper',mode:'work',text:'Remember my therapy notes'}),/Private health/);
});
test('Continuity passes only same-profile and same-mode previous conversation',async()=>{
  const first=await engine.chat({profile:'william',mode:'work',input:'How shall we test the onyx drag handler?',sessionToken:'mock-token',threadId:'test-1',rememberTurn:true,qualityRetry:false});
  assert.equal(first.storedLocally,true);
  await engine.chat({profile:'william',mode:'work',input:'What was the first step we decided on?',sessionToken:'mock-token',threadId:'test-1',qualityRetry:false});
  assert.match(calls.at(-1).message,/How shall we test the onyx drag handler/);
  await engine.chat({profile:'jasper',mode:'work',input:'Could we discuss the login button?',sessionToken:'mock-token',threadId:'test-1',qualityRetry:false});
  assert.doesNotMatch(calls.at(-1).message,/How shall we test the onyx drag handler/);
});
test('No silent memory: turns are persisted only if explicitly requested',async()=>{
  assert.equal((await memory.turns('william','work','test-1')).length,1);
});
test('Professor and Virtual & Health route clinical conversation through the live brain without local persistence',async()=>{
  const professor=await engine.chat({profile:'william',mode:'professor',input:'I feel anxious and would like a grounding skill.',sessionToken:'mock-token',threadId:'professor-test',rememberTurn:true,qualityRetry:false});
  assert.equal(professor.mode,'professor');assert.equal(professor.storedLocally,false);assert.equal(professor.mood,'professor');
  assert.match(calls.at(-1).message,/PROFESSOR LANE/);assert.match(calls.at(-1).message,/grounding skill/i);assert.equal(calls.at(-1).context.supportMode,'dbt');
  const health=await engine.chat({profile:'jasper',mode:'health',input:'I have a question about my inhaler routine.',sessionToken:'mock-token',qualityRetry:false});
  assert.equal(health.mode,'health');assert.equal(health.storedLocally,false);assert.match(calls.at(-1).message,/VIRTUAL & HEALTH LANE/);
  assert.equal((await memory.turns('william','professor','professor-test')).length,0);
  await assert.rejects(engine.chat({profile:'william',mode:'leisure',input:'Help with DBT therapy',sessionToken:'mock-token'}),/belong in Virtual & Health or Professor/);
  await assert.rejects(engine.chat({profile:'jasper',mode:'professor',input:'What shall I write tomorrow?',mood:'sleeping',sessionToken:'mock-token'}),/mood available/);
});
test('Reply quality feedback detects wrong profile and false tool activity',()=>{
  const r=evaluateReply({profile:'william',input:'Can you help',text:'Mother, I committed your changes to GitHub.'});
  assert.equal(r.pass,false);assert.ok(r.warnings.includes('wrong-profile address'));assert.ok(r.warnings.includes('possible invented tool execution'));
});
test('User can clear a single thread without deleting memory in other modes',async()=>{
  const n=await memory.clearThread('william','work','test-1');assert.equal(n,1);
  assert.equal((await memory.turns('william','work','test-1')).length,0);
});

test('Unpersisted short-term conversation remains available during the same tab session',async()=>{
  await engine.chat({profile:'jasper',mode:'leisure',input:'Tell me about a puzzle we could try together.',sessionToken:'mock-token',threadId:'ephemeral',rememberTurn:false,qualityRetry:false});
  await engine.chat({profile:'jasper',mode:'leisure',input:'How shall we continue that same puzzle?',sessionToken:'mock-token',threadId:'ephemeral',rememberTurn:false,qualityRetry:false});
  assert.match(calls.at(-1).message,/Tell me about a puzzle we could try together/);
  assert.equal((await memory.turns('jasper','leisure','ephemeral')).length,0);
});
