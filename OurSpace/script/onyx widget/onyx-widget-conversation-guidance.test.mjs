/** Node-only smoke tests for the existing OurSpace widget's Pass 7 bridge.
 * Run: node "OurSpace/script/onyx widget/onyx-widget-conversation-guidance.test.mjs"
 * No Python, no backend secrets, no live email or Gemini calls.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const folder=dirname(fileURLToPath(import.meta.url));
const source=name=>readFileSync(join(folder,name),'utf8');
const testerCalls=[];
let selectedProfile='william';
const window={
  addEventListener(){},
  OnyxTester:{
    active:()=>true,
    publicStatus:()=>({selectedProfile}),
    chat:async(message,options)=>{
      testerCalls.push({message,options});
      return {testerMode:true,aiBrain:true,response:'Papa, I am comfortable and glad to see you. I was resting.'};
    }
  }
};
const document={readyState:'loading',addEventListener(){}};
const vm={window,document,console};
runInNewContext(source('onyx-widget-conversation-guidance.js'),vm,{filename:'voice-guidance.js'});
runInNewContext(source('onyx-responses.js'),vm,{filename:'onyx-responses.js'});

const voice=window.OnyxVoiceContext,workshop=window.OnyxResponses;
assert.equal(voice.intent('Hey buddy how are you doing?','leisure'),'social');
assert.equal(voice.intent('Hey, can you fix this JavaScript error?','work'),'task');
assert.equal(voice.intent('Please just listen without advice','health'),'listen-only');
assert.ok(voice.guidance('Tell me more','professor').instructions.includes('non-diagnostic'));
assert.equal(workshop.MOODS.filter(x=>x!=='auto').length,9);
const scenarios=[
  ['work','Help me debug an error in my code.','chat'],
  ['leisure','Hey buddy, how are you doing?','chat'],
  ['health','Can you listen while I talk about my health?','health'],
  ['professor','Can we do a DBT worksheet together?','dbt']
];
for(const [mode,input,expectedSupport] of scenarios){
  const items=await workshop.generate({input,profile:'william',mode,count:1});
  assert.equal(items.length,1);
  assert.equal(items[0].source,'tester-ai-brain');
  assert.equal(testerCalls.at(-1).options.mode,mode);
  assert.equal(testerCalls.at(-1).options.supportMode,expectedSupport);
  assert.equal(testerCalls.at(-1).options.context.repositoryBrain,'LifeHelpers/Onyx');
  assert.equal(testerCalls.at(-1).options.context.onyxVoiceGuidance.surface,mode);
}
await workshop.converse({input:'How are you today?',mode:'leisure',profile:'william',threadId:'greetings'});
await workshop.converse({input:'Did you get a nap?',mode:'leisure',profile:'william',threadId:'greetings'});
assert.equal(workshop.getConversation('william','leisure','greetings').length,2);
assert.match(testerCalls.at(-1).message,/CONVERSATION SO FAR/);
selectedProfile='jasper';
assert.equal(workshop.getConversation('jasper','leisure','greetings').length,0);
assert.equal(workshop.clearConversation('jasper','leisure','greetings'),false);
const html=readFileSync(join(folder,'../../assets/code/onyx_widget.html'),'utf8');
assert.match(html,/id="onyxVoiceChatSend"/);
assert.match(html,/value="professor">Professor/);
assert.doesNotMatch(html,/generator\.css/i);
assert.ok(html.indexOf('onyx-widget-conversation-guidance.js')<html.indexOf('onyx_widget_onyx-repository-bridge.js'));
console.log('PASS: shared voice, four lanes, profile boundaries, history, tester and CSS restrictions.');
