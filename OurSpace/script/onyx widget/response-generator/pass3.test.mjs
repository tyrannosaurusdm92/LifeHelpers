import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createOnyxResponses} from './onyx-responses.js';
import {ContextMemory} from './context-memory.js';
import {LearningStore} from './learning-store.js';
import {composeLocalReply} from './local-composer.js';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
async function localFetch(url){return new Response(await readFile(fileURLToPath(url)),{status:200});}
const deniedDB={open(){throw new Error('IDB denied by security policy');}};
function storage(){const m=new Map();return {getItem:x=>m.get(x)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};}
test('Integrated Work view loads Pass 7 modules without importing generator CSS',async()=>{
 const s=await readFile(path.join(base,'assets/code/onyx_widget.html'),'utf8');
 assert.match(s,/id="onyxVoiceDialog"/);assert.match(s,/id="onyxVoiceOpen"/);
 assert.match(s,/script\/onyx widget\/onyx-responses\.js/);
 assert.doesNotMatch(s,/generator\.css/);
});
test('local composer is situation-specific: drag, CSS, writing, backend',()=>{
 const q={profile:'william',mode:'work',mood:'thinking'};
 assert.match(composeLocalReply({...q,input:'Button fails after widget moves, clicking does nothing'}),/drag|pointer|event|overlay/i);
 assert.match(composeLocalReply({...q,input:'My CSS stylesheet is not loading and text color is white'}),/CSS|style|selector|viewport|element/i);
 assert.match(composeLocalReply({...q,input:'My Gemini backend returns CORS on session request'}),/server|request|CORS|endpoint|token/i);
 assert.match(composeLocalReply({...q,input:'I am revising my chapter and the dialogue feels flat'}),/scene|dialogue|character|reader|emotional/i);
});
test('user sees working offline generation and chat without network/token',async()=>{
 const memo=new ContextMemory({indexedDBImpl:null,storage:null}),onyx=await createOnyxResponses({fetchImpl:localFetch,conversationMemory:memo,store:new LearningStore({indexedDBImpl:null,storage:null})});
 const g=await onyx.generate({profile:'william',mode:'work',input:'The button stops clicking after widget moves.',count:3,provider:'offline-preview'});
 assert.equal(g.entries.length,3);assert.equal(new Set(g.entries.map(x=>x.text)).size,3);
 assert.equal(g.entries.every(x=>x.source==='offline-preview'),true);
 const c1=await onyx.chat({profile:'jasper',mode:'work',input:'Can we debug the widget click handler?',provider:'offline-preview',threadId:'test'});
 const c2=await onyx.chat({profile:'jasper',mode:'work',input:'Continue that earlier button fix.',provider:'offline-preview',threadId:'test'});
 assert.match(c1.text,/Momma/);assert.match(c2.text,/earlier|recall|discuss/i);
 assert.equal((await memo.turns('jasper','work','test')).length,0);
});
test('IndexedDB open exception gracefully uses localStorage for approved responses',async()=>{
 const s=storage();const first=new LearningStore({indexedDBImpl:deniedDB,storage:s});
 await first.approve({id:'pass3-save',profile:'jasper',mode:'leisure',mood:'thoughtful',text:'Momma, what a good puzzle.'});
 const second=new LearningStore({indexedDBImpl:deniedDB,storage:s});
 assert.equal((await second.list('jasper')).length,1);assert.equal((await second.list('william')).length,0);
 await second.delete('pass3-save','jasper');assert.equal((await first.list('jasper')).length,0);
});
test('IndexedDB denied still allows approved fact and turn persistence by localStorage',async()=>{
 const s=storage();let first=new ContextMemory({indexedDBImpl:deniedDB,storage:s});
 await first.remember({profile:'william',mode:'work',text:'The drag handle needs a five pixel movement threshold.'});
 await first.appendTurn({profile:'william',mode:'work',threadId:'fix',user:'What now?',assistant:'Papa, trace the pointer state.'});
 const second=new ContextMemory({indexedDBImpl:deniedDB,storage:s});
 assert.equal((await second.facts('william','work')).length,1);assert.equal((await second.turns('william','work','fix')).length,1);
 assert.equal((await second.facts('jasper','work')).length,0);assert.equal((await second.turns('william','leisure','fix')).length,0);
});
