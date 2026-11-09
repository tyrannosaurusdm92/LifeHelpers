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
  assert.match(html,/script\/onyx widget\/onyx_widget_onyx-repository-bridge\.js" type="module"/);
  assert.match(html,/<script type="module" src="script\/onyx widget\/onyx-responses\.js"/);
  assert.match(loader,/import\('\.\/response-generator\/generator-app\.js'\)/);
  assert.match(loader,/onyxVoiceOpen/);
  assert.match(brainBridge,/chatWithSocialRepair\(prepared/);
  assert.match(brainBridge,/OnyxCore\.chat\(request\)/);
  assert.match(adapter,/LifeHelpers\/Onyx/);
  assert.match(adapter,/OnyxTester/);
  assert.doesNotMatch(html,/generator\.css/i);
  assert.doesNotMatch(loader,/generator\.css/i);
  assert.match(widgetCss,/\.onyx-response-layout/);
  assert.doesNotMatch(widgetCss,/generator\.css/i);
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
