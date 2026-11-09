/** Shared 100k response voice-guidance routing regression tests. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';

const source=readFileSync(fileURLToPath(new URL('./onyx-voice-100k-bridge.js',import.meta.url)),'utf8');
function harness(){
  let profile='william',calls=[];
  const base={
    decorate:(payload,lane)=>({...payload,lane,context:{...payload.context,onyxVoiceGuidance:{surface:lane,intent:'task',instructions:'Onyx base voice.'}}}),
    guidance:(message,lane)=>({surface:lane,intent:'task',instructions:'Onyx base voice.'}),
    intent:message=>String(message).startsWith('Hey')?'social':/no advice/i.test(message)?'listen-only':'task',
    testerContext:(message,lane,context)=>({...(context||{}),onyxVoiceGuidance:{surface:lane,instructions:'Onyx base voice.'}}),
    enrich:async(payload)=>({...payload,context:{onyxVoiceCorpus:{examples:[{id:'OLD',styleOnly:'Historical 10k fallback.'}]}}})
  };
  const window={
    OnyxVoiceContext:base,
    OnyxTester:{active:()=>true,publicStatus:()=>({selectedProfile:profile})},
    OnyxCorpus100k:{retrieve:async args=>{calls.push({...args});return [{
      entry:{id:args.profile==='william'?'W-MOCK':'J-MOCK',mood:'Listening',topic:args.lane,text:'A short fictional voice example.'}
    }];}}
  };
  runInNewContext(source,{window,console:{warn(){}}});
  return {voice:window.OnyxVoiceContext,selectProfile:v=>{profile=v;},calls};
}
test('both verified accounts keep the 100k contract in all four chat modes',async()=>{
  const h=harness();
  for(const who of ['william','jasper']){
    h.selectProfile(who);
    for(const lane of ['work','leisure','virtual','professor']){
      const result=await h.voice.enrich({message:'Explain this topic',lane},lane);
      const corpus=result.context.onyxVoiceCorpus;
      assert.equal(corpus.corpusCount,100000);
      assert.equal(corpus.profile,who);
      assert.equal(corpus.mode,lane);
      assert.equal(corpus.examples.length,1);
      assert.equal(corpus.examples[0].id,who==='william'?'W-MOCK':'J-MOCK');
      assert.match(result.context.onyxVoiceGuidance.instructions,/Onyx/);
    }
  }
  assert.equal(h.calls.length,8);
});
test('ordinary social and listen-only turns receive identity/voice guidance without canned examples',async()=>{
  const h=harness();
  for(const message of ['Hey buddy how are you?','Just listen with no advice']){
    const result=await h.voice.enrich({message,lane:'leisure'},'leisure');
    assert.equal(result.context.onyxVoiceCorpus.corpusCount,100000);
    assert.equal(result.context.onyxVoiceCorpus.mode,'leisure');
    assert.equal(result.context.onyxVoiceCorpus.examples.length,0);
    assert.match(result.context.onyxVoiceGuidance.instructions,/Onyx/);
  }
  assert.equal(h.calls.length,0);
});
