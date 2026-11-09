import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {classifyTurn,moodForTurn} from './conversation-intents.js';
import {composeLocalReply} from './local-composer.js';
import {createConversationEngine} from './conversation-engine.js';
import {createOnyxResponses} from './onyx-responses.js';
import {evaluateReply} from './quality-guard.js';
import {ContextMemory} from './context-memory.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const localFetch=async url=>new Response(await readFile(fileURLToPath(url)),{status:200});
const socialQuestions=['Hey buddy how are you doing?','How are you?','Hi, Onyx!','What are you up to?','I love you, little man','Thanks buddy','Goodnight, my boy','Just wanted to say hi'];
const techAnswers=/what is known|what we are assuming|first action|practical next step|which part would you like to settle|browser console|input handler|first step|success would look like/i;
test('Exact user regression: leisure how-are-you routes as Onyx check-in and not advice',()=>{
 const q='Hey buddy how are you doing?';const i=classifyTurn(q,{mode:'leisure'});
 assert.equal(i.intent,'welfare');assert.equal(i.social,true);
 assert.equal(moodForTurn(i.intent,q,'leisure'),'thoughtful');
 const answer=composeLocalReply({input:q,mode:'leisure',profile:'william'});
 assert.match(answer,/I am|well|content|rest|nap|quiet|good spirits|comfortable/i);
 assert.doesNotMatch(answer,techAnswers);
 assert.doesNotMatch(answer,/Mother|Momma|William|Jasper/);
});
test('Every common social cue is recognized, and no social cue gives technical nonsense',()=>{
 for(const q of socialQuestions){
  const tag=classifyTurn(q,{mode:'leisure'});assert.ok(tag.social,`${q}: ${tag.intent}`);
  for(const profile of ['william','jasper']){
   const answer=composeLocalReply({input:q,mode:'leisure',profile});
   assert.ok(answer.length>18);assert.doesNotMatch(answer,techAnswers,`${q}: ${answer}`);
   assert.doesNotMatch(answer,profile==='jasper'?/Papa|Father/:/Momma|Mother/);
  }
 }
});
test('Intent routing obeys task priority even with greeting at the front',()=>{
 const q='Hey buddy, how do I fix the CSS?';
 assert.equal(classifyTurn(q,{mode:'leisure'}).intent,'task');
 assert.match(composeLocalReply({input:q,mode:'leisure'}),/CSS|style|selector|element|viewport/i);
});
test('Social response variety across turns without accidental first name',()=>{
 const q='Hey buddy how are you doing?';
 const options=new Set(Array.from({length:12},(_,i)=>composeLocalReply({input:q,mode:'leisure',profile:'jasper',variation:i})));
 assert.ok(options.size>=10,`only ${options.size} unique`);
 for(const a of options) assert.doesNotMatch(a,/\b(?:William|Jasper|Father|Papa)\b/);
});
test('Quality checker rejects specific old Pass3 reply for social intent',()=>{
 const q='Hey buddy how are you doing?';
 const old='Papa, I would begin by separating what is known from what we are assuming. That gives us a practical next step without pretending to possess information I have not seen. Which part would you like to settle first?';
 const r=evaluateReply({text:old,profile:'william',input:q,intent:'welfare',mode:'leisure'});
 assert.ok(r.warnings.includes('social-intent mismatch'));
});
test('Mock Gemini that ignores greeting is retried then safely labeled local when still wrong',async()=>{
 const old='Papa, I would begin by separating what is known from what we are assuming. That gives us a practical next step. Which part would you like to settle first?';
 const calls=[];
 const fake={chat:async args=>{calls.push(args);return {text:old,rawMetadata:{aiBrain:true}}}};
 const e=await createConversationEngine({fetchImpl:localFetch,backendClient:fake,memory:new ContextMemory({indexedDBImpl:null,storage:null})});
 const r=await e.chat({profile:'william',mode:'leisure',input:'Hey buddy how are you doing?',sessionToken:'mock-token',provider:'backend',qualityRetry:true});
 assert.equal(calls.length,2);
 assert.match(calls[0].message,/ordinary companion conversation/i);
 assert.doesNotMatch(calls[0].message,/REFERENCE_VOICE_EXEMPLARS/);
 assert.equal(r.source,'local-social-repair-not-llm');
 assert.equal(r.aiBrainConfirmed,false);
 assert.doesNotMatch(r.text,techAnswers);
});
test('Social Gemini first reply is accepted, without unnecessary retries',async()=>{
 const calls=[];const fake={chat:async args=>{calls.push(args);return {text:'I am very well, Papa. I found a comfortable spot to settle, and I am glad of your company. How has your day been?',rawMetadata:{aiBrain:true}}}};
 const e=await createConversationEngine({fetchImpl:localFetch,backendClient:fake,memory:new ContextMemory({indexedDBImpl:null,storage:null})});
 const r=await e.chat({profile:'william',mode:'leisure',input:'Hey buddy how are you doing?',sessionToken:'mock',provider:'backend'});
 assert.equal(calls.length,1);assert.equal(r.source,'existing-apps-script-backend');assert.equal(r.aiBrainConfirmed,true);
});
test('End-to-end local generator and conversation both respond appropriately',async()=>{
 const e=await createOnyxResponses({fetchImpl:localFetch,conversationMemory:new ContextMemory({indexedDBImpl:null,storage:null})});
 const g=await e.generate({profile:'william',mode:'leisure',input:'Hey buddy how are you doing?',provider:'offline-preview',count:5});
 assert.equal(g.entries.length,5);
 for(const x of g.entries){assert.doesNotMatch(x.text,techAnswers);assert.equal(x.mood,'thoughtful');}
 const c=await e.chat({profile:'jasper',mode:'leisure',input:'Hey buddy how are you doing?',provider:'offline-preview'});
 assert.equal(c.intent,'welfare');assert.doesNotMatch(c.text,techAnswers);
});
test('Backend response generator rejects social-analysis replies and truthfully labels local repair',async()=>{
 const {readFile}=await import('node:fs/promises');
 const {OnyxBackendClient}=await import('./backend-client.js');
 const fakeFetch=async (url,opts)=>{
   if(String(url).startsWith('file:'))return new Response(await readFile(fileURLToPath(url)),{status:200});
   return new Response(JSON.stringify({ok:true,data:{reply:'Papa, let us first separate what we know from our assumptions. Which part would you like to settle first?'}}),{status:200,headers:{'Content-Type':'application/json'}});
 };
 const e=await createOnyxResponses({fetchImpl:fakeFetch,conversationMemory:new ContextMemory({indexedDBImpl:null,storage:null})});
 const g=await e.generate({profile:'william',mode:'leisure',input:'Hey buddy how are you doing?',provider:'backend',sessionToken:'test-session',count:1});
 assert.equal(g.entries[0].source,'local-social-repair-not-llm');
 assert.equal(g.entries[0].aiBrain,false);
 assert.doesNotMatch(g.entries[0].text,techAnswers);
});
