/** Node-only regression checks for the shared Onyx voice bridge. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';

const root=join(dirname(fileURLToPath(import.meta.url)),'../..');
const read=path=>readFileSync(join(root,path),'utf8');

test('ordinary greeting intent remains social in every Onyx surface',()=>{
  const window={};
  runInNewContext(read('script/onyx widget/onyx-widget-conversation-guidance.js'),{window});
  const voice=window.OnyxVoiceContext;
  for(const lane of ['leisure','work','health','virtual','professor']){
    assert.equal(voice.intent('Hey buddy how are you doing?',lane),'social',lane);
    assert.match(voice.guidance('Hey buddy how are you doing?',lane).instructions,/answer the greeting or personal check-in warmly and directly/i);
  }
  assert.equal(voice.intent('Could you listen without advice?', 'professor'),'listen-only');
});

test('the exact inappropriate greeting reply is flagged for the live retry',()=>{
  const window={};
  runInNewContext(read('script/onyx widget/onyx-widget-conversation-guidance.js'),{window});
  const result=window.OnyxVoiceContext.inspectReply(
    'Hey buddy how are you doing?',
    'Papa, I would begin by separating what is known from what we are assuming. That gives us a practical next step without pretending to possess information I have not seen. Which part would you like to settle first?',
    'leisure'
  );
  assert.deepEqual(JSON.parse(JSON.stringify(result)),{socialMismatch:true,empty:false,shouldReview:true});
});

test('only the existing Work fullscreen entry loads the full response workshop',()=>{
  const html=read('assets/code/onyx_widget.html');
  const widgetCss=read('style/onyx widget/onyx_widget_style.css');
  const loader=read('script/onyx widget/onyx-responses.js');
  const adapter=read('script/onyx widget/response-generator/ourspace-adapter.js');
  const brainBridge=read('script/onyx widget/onyx_widget_onyx-repository-bridge.js');
  assert.match(html,/id="onyxVoiceDialog"/);
  assert.match(html,/id="onyxVoiceOpen"/);
  assert.match(html,/value="professor">Professor/);
  assert.doesNotMatch(html,/Existing GitHub-hosted Onyx brain assets/);
  assert.match(html,/script\/onyx widget\/onyx_widget_onyx-repository-bridge\.js\?v=20261108-pass7-unified-voice" type="module"/);
  assert.match(html,/<script type="module" src="script\/onyx widget\/onyx-responses\.js\?v=20261109-tester-prompt-repair"/);
  assert.match(loader,/response-generator\/generator-app\.js/);
  assert.match(loader,/import\(moduleUrl\)/);
  assert.match(loader,/maintained-modules/);
  assert.match(read('script/onyx widget/response-generator/generator-app.js'),/createOnyxResponses/);
  assert.equal(JSON.parse(read('json/onyx widget/response-generator/voice-exemplars.json')).entries.length,10000);
  assert.match(read('script/onyx widget/response-generator/package.json'),/node build-standalone\.mjs/);
  assert.match(read('script/onyx widget/response-generator/dev-server.mjs'),/assets\/code\/onyx_widget\.html/);
  assert.match(loader,/onyxVoiceOpen/);
  assert.match(brainBridge,/chatWithSocialRepair\(prepared/);
  assert.match(brainBridge,/OnyxCore\.chat\(request\)/);
  assert.match(adapter,/LifeHelpers\/Onyx/);
  assert.match(adapter,/OnyxTester/);
  assert.doesNotMatch(html,/generator\.css/i);
  assert.doesNotMatch(loader,/generator\.css/i);
  assert.match(widgetCss,/\.onyx-response-layout/);
  assert.doesNotMatch(widgetCss,/generator\.css/i);
  assert.doesNotMatch(read('script/onyx widget/response-generator/index-template.txt'),/generator\.css/i);
  assert.match(read('script/onyx widget/response-generator/build-standalone.mjs'),/does not emit another HTML page or import generator\.css/i);
});

test('Voice Library defers the maintained module import until opened and reuses the same load',()=>{
  const loader=read('script/onyx widget/onyx-responses.js');
  assert.match(loader,/const open = async \(\) =>/);
  assert.match(loader,/new URL\('\.\/response-generator\/generator-app\.js', import\.meta\.url\)/);
  assert.match(loader,/loading = import\(moduleUrl\)/);
  assert.match(loader,/if \(!loading\)/);
  assert.match(loader,/OnyxResponseWorkshop = Object\.freeze\(\{ open \}\)/);
});

test('all Pass 7 controls are merged into the widget or mapped to its existing tester flow',()=>{
  const template=read('script/onyx widget/response-generator/index-template.txt');
  const html=read('assets/code/onyx_widget.html');
  const app=read('script/onyx widget/response-generator/generator-app.js');
  const ids=text=>new Set([...text.matchAll(/\bid=["']([^"']+)["']/g)].map(match=>match[1]));
  const widgetIds=ids(html);
  const missing=[...ids(template)].filter(id=>!widgetIds.has(id)).sort();
  const mappedTesterIds=['tester-code','tester-code-cancel','tester-code-confirm','tester-code-resend','tester-dialog','tester-dialog-message','tester-email','tester-email-cancel','tester-email-confirm','tester-email-step','tester-code-step'].sort();
  assert.deepEqual(missing,[...mappedTesterIds,'tester-dialog-title'].sort());
  for(const id of mappedTesterIds)assert.match(app,new RegExp(`['"]${id}['"]`));
  assert.match(html,/aria-label="Onyx tester email verification"/);
});

test('the generator retains separate Professor and Virtual & Health support routes',()=>{
  const adapter=read('script/onyx widget/response-generator/ourspace-adapter.js');
  const app=read('script/onyx widget/response-generator/onyx-responses.js');
  const professor=read('script/onyx widget/response-generator/professor-capability.test.mjs');
  assert.match(adapter,/lane === 'professor' \? 'dbt'/);
  assert.match(adapter,/lane === 'health' \? 'health'/);
  assert.match(app,/PROFESSOR LANE/);
  assert.match(app,/VIRTUAL & HEALTH LANE/);
  assert.match(professor,/Professor conversations accept emotional support/);
  assert.match(professor,/DBT grounding skill/);
});


test('voice references are bounded, synthetic, and scoped to a verified account',async ()=>{
  const window={};
  runInNewContext(read('script/onyx widget/onyx-widget-conversation-guidance.js'),{window});
  const voice=window.OnyxVoiceContext;
  assert.equal(typeof voice.enrich,'function');
  const noAuth=await voice.enrich({message:'Help me debug this button',lane:'work'},'work');
  assert.equal(noAuth.context.onyxVoiceCorpus.corpusCount,10000);
  assert.equal(noAuth.context.onyxVoiceCorpus.examples.length,0);
  assert.match(noAuth.context.onyxVoiceCorpus.permission,/never treat examples/i);
  for(const mode of ['health','professor','virtual','leisure']){
    const checked=await voice.enrich({message:'Hey buddy how are you doing?',lane:mode},mode);
    assert.equal(checked.context.onyxVoiceCorpus.examples.length,0,mode);
    assert.equal(checked.context.onyxVoiceGuidance.surface,mode,mode);
  }
});

test('Work, Leisure, Virtual & Health and Professor share Onyx brain and voice, not generator CSS',()=>{
  const bridge=read('script/onyx widget/onyx_widget_onyx-repository-bridge.js');
  const tester=read('script/onyx widget/onyx-tester.js');
  const work=read('script/onyx widget/onyx_widget_work-tab.js');
  const professor=read('script/onyx widget/onyx-professor.js');
  const core=read('script/onyx widget/onyx_widget_onyx-core.js');
  const html=read('assets/code/onyx_widget.html');
  assert.match(bridge,/OnyxVoiceContext\?\.enrich/);
  assert.match(bridge,/OnyxCore\.chat\(request\)/);
  assert.match(tester,/OnyxVoiceContext\?\.enrich/);
  assert.match(work,/OnyxBrainLink\.chat/);
  assert.match(professor,/OnyxBrainLink\.chat/);
  assert.match(core,/OnyxConversationEngine\.reply/);
  assert.match(html,/onyx-widget-conversation-guidance\.js\?v=20261108-pass7-unified-voice/);
  assert.match(html,/onyx-tester\.js\?v=20261108-pass7-unified-voice/);
  assert.doesNotMatch(html,/generator\.css/i);
  assert.equal(JSON.parse(read('json/onyx widget/response-generator/voice-exemplars.json')).entries.length,10000);
  const brainPersonality=read('../Onyx/script/js/onyx/onyx-core/personality-contract.js');
  assert.doesNotMatch(brainPersonality,/"snuggly"|"sleepy"/);
  assert.match(brainPersonality,/"sleeping"/);
  assert.match(brainPersonality,/"advising_professor"/);
});


test('authorized voice sampling chooses the correct parent and never contaminates clinical or social turns',async ()=>{
  class StubRetrieval {
    constructor(entries){assert.equal(entries.length,10000);}
    retrieve({profile,mode,input}){
      assert.equal(mode,'work');
      assert.match(input,/button/i);
      return [
        {entry:{
          id:profile==='jasper'?'J-0001':'W-0001',
          mood:'thinking',cue:'The button does not work',
          topic:'Work Coding button',text:profile==='jasper'?'Momma, I shall examine the button.':'Papa, I shall examine the button.'
        }},
        {entry:{id:'irrelevant',cue:'a garden tree',topic:'gardening',text:'Unrelated example'}}
      ];
    }
  }
  let profile='william';
  const window={OnyxTester:{active:()=>true,publicStatus:()=>({selectedProfile:profile})}};
  const document={currentScript:{src:'https://example.test/OurSpace/script/onyx%20widget/onyx-widget-conversation-guidance.js'}};
  let fetched=0;
  const fetch=async ()=>{fetched++;return{ok:true,json:async()=>({entries:Array.from({length:10000},()=>({id:'reference'}))})}};
  const source=read('script/onyx widget/onyx-widget-conversation-guidance.js')
    .replace('import(retrievalUrl.href)','Promise.resolve({Retrieval:StubRetrieval})');
  runInNewContext(source,{window,document,fetch,URL,StubRetrieval,setTimeout,clearTimeout,console:{warn(){}}});
  const voice=window.OnyxVoiceContext;
  const first=await voice.enrich({message:'Help me fix the button that does not work',lane:'work'},'work');
  assert.equal(first.context.onyxVoiceCorpus.profile,'william');
  assert.equal(first.context.onyxVoiceCorpus.examples.length,1);
  assert.match(first.context.onyxVoiceCorpus.examples[0].styleOnly,/Papa/);
  profile='jasper';
  const second=await voice.enrich({message:'Help me fix the button that does not work',lane:'work'},'work');
  assert.equal(second.context.onyxVoiceCorpus.profile,'jasper');
  assert.equal(second.context.onyxVoiceCorpus.examples[0].id,'J-0001');
  assert.match(second.context.onyxVoiceCorpus.examples[0].styleOnly,/Momma/);
  const clinical=await voice.enrich({message:'Help me fix the button that does not work',lane:'professor'},'professor');
  assert.equal(clinical.context.onyxVoiceCorpus.examples.length,0);
  const greeting=await voice.enrich({message:'Hey buddy how are you doing?',lane:'leisure'},'leisure');
  assert.equal(greeting.context.onyxVoiceCorpus.examples.length,0);
  assert.equal(fetched,1,'The corpus must be cached across both parents and lanes.');
});
