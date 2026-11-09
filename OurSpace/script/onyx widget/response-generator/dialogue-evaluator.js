/** Context fit checks for the most damaging failures (not a substitute for model judgement). */
import {understandTurn} from './turn-understanding.js';
const WORKISH=/\b(?:separat(?:e|ing) (?:the )?facts|what is known|assumptions?|practical next steps?|break it down|define the problem|first identify|investigat(?:e|ion)|context window|methodology|evidence|determin(?:e|ing) the objective|clear deliverables|diagnos(?:e|tic)|requirements?|task at hand|let us begin|as an ai)\b/i;
const DIRECTIVE=/\b(?:you should|i suggest|first,|step one|first step|to proceed|please provide|specify your|we must|prioritiz(?:e|ing)|i recommend)\b/i;
const AFFECT=/\b(?:fine|well|content|comfortable|sleep|nap|rest|awake|here|doing|glad|peaceful|quiet|lovely|happy|good|delighted|enjoy|company|purr|pleasant|tired|wonderful|pleased)\b/i;
const BOT=/\b(?:as an ai|i (?:don't|do not) have (?:feelings|a body)|i am programmed to|i cannot experience|large language model|i am a chatbot)\b/i;
const SCRIPTED=/\b(?:as your faithful feline assistant|royal protocol dictates|feline overlord|imperial decree|my circuits|dear user|in conclusion|rest assured)\b/i;
function tokens(s){return new Set((String(s).toLowerCase().match(/[a-z0-9]{4,}/g)||[]).filter(x=>!['about','what','your','that','would','could','should','they','have','with','from','into','then','this','there','while'].includes(x)));}
function overlap(a,b){const x=tokens(a),y=tokens(b),n=[...x].filter(t=>y.has(t)).length;return n/Math.max(1,Math.min(x.size,y.size));}
export function evaluateContextFit({input,text,mode='leisure',history=[],previous=[]}={}){
 const p=understandTurn(input,{mode,history}),s=String(text||'').trim(),warnings=[];
 if(!s)return {pass:false,warnings:['empty reply'],intent:p.intent};
 if(BOT.test(s)) warnings.push('chatbot-disclaimer voice');
 if(SCRIPTED.test(s))warnings.push('uncharacteristic scripted voice');
 if(p.social&&WORKISH.test(s))warnings.push('social turn answered as analysis');
 if(p.social&&DIRECTIVE.test(s)&&p.intent!=='friendUserWelfare'&&p.intent!=='listening')warnings.push('unwanted advice in casual chat');
 if((p.intent==='welfare'||p.intent==='activity')&&!AFFECT.test(s))warnings.push('failed to answer familiar personal check-in');
 if(p.social&&/\b(?:something I have not seen|without (?:enough|sufficient) information|which part would you like to settle|let me know if you need anything else|how can I assist you)\b/i.test(s))warnings.push('generic assistant filler');
 if(p.continuation && !p.previousUser && s.length<12)warnings.push('empty continuation');
 if(previous.some(t=>overlap(t,s)>.9&&s.length>65))warnings.push('near-repeat');
 return {pass:warnings.length===0,warnings,intent:p.intent,continuation:p.continuation};
}
export function substantiveRewriteInstruction(issues,plan){return 'REWRITE THE DRAFT, do not append commentary. Problems: '+issues.join('; ')+'. '+plan.replyContract+' The reply must address the current message concretely, preserve Onyx’s sleepy, elder, gently formal character, and avoid canned reassurance, non sequiturs, fake actions, and unnecessary questions. Output only the reply.';}
