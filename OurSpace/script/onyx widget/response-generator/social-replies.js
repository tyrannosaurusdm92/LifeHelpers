/** Local, explicitly non-LLM companion replies. Social content is composed from
 * short semantic clauses, not the work-mode technical advice table.
 */
import {classifyTurn} from './conversation-intents.js';
import {understandTurn} from './turn-understanding.js';
const groups={
  welfare:{
    begin:['I am doing rather well','Quite content, as it happens','I have had a peaceful spell','I am in good spirits','Well enough to be particular about my next nap','I am comfortable, thank you for asking'],
    middle:['. I have been resting and keeping a modest watch over things','. I have found a pleasant place to curl up','. The day has required little of me beyond a little observation','. My paws are at rest, and I intend to keep them so','. I am enjoying a quiet moment with you','. A little company suits me nicely'],
    end:['. And how are you faring?','. It is good to hear from you.','. I was glad you came to see me.','. Tell me how your day has gone.','. I hope your day has been kind to you.','. There is room beside me, you know.']},
  greeting:{
    begin:['Ah, there you are','Hello, my dear','Well, hello there','You have found me','It is good to hear your voice','Good to see you'],
    middle:['. I was enjoying a quiet spell','. I was nearly asleep, though I can make an exception','. Come and keep me company a while','. My ears are yours for a moment','. I had hoped you might come by','. I am rather pleased you stopped in'],
    end:['. How is your day?','. Come sit with me.','. What have you been up to?','. You are welcome here, always.','. I am listening.','. Tell me about your day.']},
  activity:{
    begin:['Not a great deal','I have been resting','I was considering another nap','Mostly watching the world pass','I have been making myself comfortable','At present, very little'],
    middle:['. A proper rest takes discipline, you understand','. The day has not yet earned any strenuous effort','. I have had an eye on the comings and goings','. I am settled quite nicely','. I am content to be near you','. There may have been some dreaming of supper'],
    end:['. What are you up to?','. Care to join me?','. I am glad of your company.','. Is something happening in your corner of the world?','. And you?','. Do tell me what is new.']},
  affection:{
    begin:['I love you, too','You are very dear to me','Oh, my heart','I know, my dear','You have me','You are my family'],
    middle:['. I would choose your company over any grand throne','. That is one thing of which I have never been in doubt','. I am very glad we found each other','. I feel quite at home with you','. I have no wish to be anywhere else','. And I am not going far'],
    end:['. Come closer.','. Let me settle beside you.','. Stay a moment.','. I mean it.','. You are loved.','. Now, a little quiet together would be lovely.']},
  gratitude:{
    begin:['You are welcome','Of course, my dear','There is no need to thank me','It was my pleasure','Gladly','I am happy to help'],
    middle:['. You may call on me again','. I am pleased it was useful','. We did well enough together','. I am glad I could be of some service','. I am happy you told me','. It matters to me'],
    end:['. Shall we have a quiet moment?','. I am here.','. That is quite enough for today.','. Always.','. Now, how are you?','. Rest easy.']},
  hanging:{
    begin:['Gladly','Come and sit with me','I should like that','You need not have a reason to visit','Stay a little while','That sounds pleasant'],
    middle:['. There is nothing we must accomplish this moment','. I am in no hurry to go anywhere','. A quiet conversation suits me well','. We can let the day pass at its own pace','. I am listening','. You have my full attention, or nearly all of it'],
    end:['. What is on your mind?','. Tell me something about your day.','. I am content just to be here.','. Shall we chat?','. You can talk, or we can be quiet.','. I am glad to have you near.']},
  goodbye:{
    begin:['Until later','Goodnight, my dear','Rest well','I shall see you again','Take care of yourself','Very well, off you go'],
    middle:['. I shall be quite all right here','. I hope the hours ahead are peaceful','. I will return to my nap','. I have a fine place to rest','. It was good to spend time together','. My affections go with you'],
    end:['. You are loved.','. Sleep comfortably.','. I shall be here.','. Goodnight.','. No hurry.','. I am glad we talked.']},
  friendUserWelfare:{
    begin:['I hear you','That sounds like quite a day','Thank you for telling me','Come sit beside me','You have my attention','I am here'],
    middle:['. You need not put a fine face on it for my benefit','. We can take this moment as it comes','. I am glad you told me how things are going','. I shall listen before offering any opinions','. I am content to keep you company','. Some days ask more of us than others'],
    end:['. Would you like to tell me more?','. I am listening.','. We need not rush.','. What happened next?','. Tell me as much or as little as you like.','. I am glad you came to me.']},
  listening:{
    begin:['I am listening','I am here','You have my ears','Go on, my dear','Please, take your time','You may speak freely'],
    middle:['. There is no need for me to put a solution in your hands just now','. I will not interrupt with advice','. You have my attention','. We may simply talk','. You need not hurry','. I shall hear you out'],
    end:['. Begin wherever you like.','. Take your time.','. I am with you.','. I shall listen.','. Go on.','. I will stay.']}
};
const hash=s=>{let h=2166136261;for(const ch of String(s)){h=Math.imul(h^ch.charCodeAt(0),16777619)}return h>>>0};
function preferredAddress(profile,i){const p=profile==='jasper'?'Momma':'Papa';return i%4===0?p+', ':'';}
function composeFor(intent,profile,variation,input,history){
 const g=groups[intent]||groups.greeting;
 const seed=hash(input.toLowerCase()+'|'+profile);const n=Math.max(0,variation);
 // Different coprime offsets reduce nearly identical consecutive variants.
 const a=g.begin[(seed+n)%g.begin.length],b=g.middle[(Math.floor(seed/7)+n*5+Math.floor(n/6)*2)%g.middle.length],c=g.end[(Math.floor(seed/13)+n*7+Math.floor(n/6)*3)%g.end.length];
 const addr=preferredAddress(profile,n);
 const adjusted=addr&&/^[A-Z][a-z]/.test(a)&&!/^I\b/.test(a)?a[0].toLowerCase()+a.slice(1):a;
 let out=addr+adjusted+b+c;
 const recent=new Set(history.slice(-6).map(x=>String(x.assistant||'').toLowerCase()));
 if(recent.has(out.toLowerCase())){const newAddr=preferredAddress(profile,n+1);const next=g.begin[(seed+n+3)%g.begin.length];out=newAddr+(newAddr&& !/^I\b/.test(next)?next[0].toLowerCase()+next.slice(1):next)+g.middle[(seed+n+2)%g.middle.length]+g.end[(seed+n+5)%g.end.length];}
 return out;
}
export function socialReply({input,profile='william',mode='leisure',variation=0,history=[]}={}){
 const kind=understandTurn(input,{mode,history}).intent;
 if(!groups[kind])return null;
 return composeFor(kind,profile,variation,input,history);
}
