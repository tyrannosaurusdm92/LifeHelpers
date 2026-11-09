import test from 'node:test';
import assert from 'node:assert/strict';
import {createOurSpaceBackendAdapter,resolveActiveProfile} from './ourspace-adapter.js';

test('account requests use the canonical brain, verified account, and four-lane support routing',async()=>{
  const calls=[];
  const root={
    OurSpaceBackend:{profile:()=> 'william'},
    OnyxRepositoryBridge:{
      status:()=>({available:true,authenticated:true,profileKey:'william'}),
      chat:async(payload,options)=>{calls.push({payload,options});return{ok:true,response:'I hear you. We can take the grounding exercise one step at a time.',llmVerified:true,profileVerified:true,provider:'ourspace-ai-brain'};}
    }
  };
  assert.equal(resolveActiveProfile(root),'william');
  const backend=createOurSpaceBackendAdapter(root);
  const result=await backend.chat({profile:'william',message:'I feel anxious and want to try a grounding skill.',mood:'professor',threadId:'professor-test',context:{mode:'professor',supportMode:'dbt'}});
  assert.match(result.text,/grounding exercise/);assert.equal(result.rawMetadata.aiBrain,true);
  assert.equal(result.rawMetadata.testerMode,false);
  assert.equal(calls[0].payload.lane,'professor');assert.equal(calls[0].payload.supportMode,'dbt');
  assert.equal(calls[0].payload.autoRemember,false);assert.equal(calls[0].payload.memoryPolicy,'off');
  assert.equal(calls[0].payload.allowWrites,false);assert.equal(calls[0].payload.useDrive,false);
  assert.equal(calls[0].options.timeoutMs,180000);
});

test('account adapter refuses a profile mismatch before any brain request',async()=>{
  let called=false;
  const backend=createOurSpaceBackendAdapter({
    OurSpaceBackend:{profile:()=> 'jasper'},
    OnyxRepositoryBridge:{status:()=>({available:true}),chat:async()=>{called=true;return{};}}
  });
  await assert.rejects(backend.chat({profile:'william',message:'hello',context:{mode:'leisure'}}),/does not match/);
  assert.equal(called,false);
});

test('tester adapter reuses the verified read-only session and Professor mode',async()=>{
  const calls=[];
  const root={OnyxTester:{
    active:()=>true,
    publicStatus:()=>({active:true,selectedProfile:'jasper'}),
    chat:async(message,options)=>{calls.push({message,options});return{testerMode:true,selectedProfile:'jasper',response:'I am here with you, Momma.',aiBrain:true};}
  }};
  const backend=createOurSpaceBackendAdapter(root);
  const result=await backend.chat({profile:'jasper',message:'I feel overwhelmed.',context:{mode:'professor'},threadId:'private-test'});
  assert.equal(result.rawMetadata.testerMode,true);assert.match(result.text,/here with you/);
  assert.equal(calls[0].options.mode,'professor');assert.equal(calls[0].options.supportMode,'dbt');
  assert.equal(calls[0].options.threadId,'private-test');
});

test('tester adapter refuses cross-profile requests',async()=>{
  const backend=createOurSpaceBackendAdapter({OnyxTester:{active:()=>true,publicStatus:()=>({active:true,selectedProfile:'william'}),chat:async()=>{throw new Error('must not run');}}});
  await assert.rejects(backend.chat({profile:'jasper',message:'hello',context:{mode:'leisure'}}),/matching read-only tester profile/);
});
