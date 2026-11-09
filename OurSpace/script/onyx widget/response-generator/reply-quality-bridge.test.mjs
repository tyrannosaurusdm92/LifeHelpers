import test from 'node:test';
import assert from 'node:assert/strict';
import {chatWithSocialRepair} from './reply-quality-bridge.js';

const inspectReply=(message,reply)=>({
  socialMismatch:/^\s*(?:hey|hi|hello|how are you)\b/i.test(message) &&
    /separating what is known|practical next step|which part would you like to settle/i.test(reply),
  shouldReview:/separating what is known|practical next step|which part would you like to settle/i.test(reply)
});

test('the exact failed Leisure greeting gets one live retry without changing the user turn',async()=>{
  const requests=[];
  const reply=await chatWithSocialRepair({
    message:'Hey buddy how are you doing?',lane:'leisure',history:[{role:'user',content:'Good evening'}],
    context:{onyxVoiceGuidance:{instructions:'Be Onyx.'},profileContinuity:{profileKey:'william'}}
  },{
    chat:async request=>{requests.push(request);return {response:requests.length===1
      ?'Papa, I would begin by separating what is known from what we are assuming. That gives us a practical next step without pretending to possess information I have not seen. Which part would you like to settle first?'
      :'I am well enough, thank you. The evening is better for your company; how are you keeping, Papa?'};},
    inspectReply
  });
  assert.equal(requests.length,2);
  assert.equal(requests[1].message,requests[0].message);
  assert.deepEqual(requests[1].history,requests[0].history);
  assert.deepEqual(requests[1].context.profileContinuity,requests[0].context.profileContinuity);
  assert.equal(requests[1].memoryPolicy,'off');
  assert.equal(requests[1].autoRemember,false);
  assert.match(requests[1].context.onyxVoiceGuidance.instructions,/answer a casual social check-in/);
  assert.equal(reply.response,'I am well enough, thank you. The evening is better for your company; how are you keeping, Papa?');
  assert.equal(reply.voiceQualityReview.status,'passed');
});

test('natural greetings, Professor support and concrete tasks do not get unnecessary retries',async()=>{
  for(const input of [
    {message:'Hey buddy, how are you?',lane:'professor'},
    {message:'Help me practice the DBT STOP skill.',lane:'professor'},
    {message:'Please review this JavaScript function.',lane:'work'}
  ]){
    let calls=0;
    await chatWithSocialRepair(input,{chat:async()=>{calls++;return {response:'I am listening, and we can take this at your pace.'};},inspectReply});
    assert.equal(calls,1,input.message);
  }
});

test('a poor second draft stays clearly reviewable instead of becoming a canned local reply',async()=>{
  let calls=0;
  const result=await chatWithSocialRepair({message:'How are you?',lane:'leisure'},{
    chat:async()=>({response:++calls===1?'I would begin by separating what is known from what we are assuming.':'Which part would you like to settle first?'}),
    inspectReply
  });
  assert.equal(calls,2);
  assert.equal(result.voiceQualityReview.status,'needs-review');
  assert.match(result.response,/settle first/);
});
