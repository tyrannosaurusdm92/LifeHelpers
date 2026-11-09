/** Conversational turn planner: no network, no hidden profile crossover, no diagnosis.
 * Separates user speech acts from the output voice. The backend model still writes natural language.
 */
import {classifyTurn} from './conversation-intents.js';
const POLITE=/^(?:hey|hi|hello|hiya|good (?:morning|evening)|well|oh|ah|buddy|papa|momma)[\s,!?.-]*/i;
const FOLLOW=/^(?:and you\??|what about you\??|you\??|what about that\??|and then\??|so\??|why\??|how so\??|really\??|tell me more[.!?]?|go on[.!?]?|continue[.!?]?|the same thing[.!?]?)$/i;
const AFFIRM=/^(?:yes|yeah|yep|sure|okay|ok|please|that's right|exactly|no|nope|not quite|i agree|i disagree)[!., ]*$/i;
const SOCIAL=['welfare','greeting','activity','affection','gratitude','goodbye','hanging','friendUserWelfare','listening'];
const DANGER=/\b(?:suicide|suicidal|self[ -]?harm|harm myself|kill myself|emergency|chest pain|not breathing|seizure|medical crisis)\b/i;
const WORK=/\b(?:bug|javascript|css|code|program|repo|deploy|implement|function|backend|json|wasm|computer|error|crash|tests?|fix|script|files?|explain|create|make|write|build|design|research)\b/i;
function compact(s,max=4000){return String(s??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
export function understandTurn(input,{mode='leisure',history=[]}={}){
  const text=compact(input),base=classifyTurn(text,{mode,history});
  const last=history.slice(-1)[0]||null, previousUser=compact(last?.user||'',400);
  let intent=base.intent,topic='',continuation=false;
  const trimmed=text.replace(POLITE,'').trim();
  if(FOLLOW.test(trimmed)&&previousUser){
    continuation=true; const previous=classifyTurn(previousUser,{mode});
    intent= /^(?:and you|what about you|you\?)/i.test(trimmed)?'welfare': previous.intent==='task'?'task':previous.social?'hanging':'open';
    topic=previousUser;
  } else if(AFFIRM.test(trimmed)&&previousUser){
    continuation=true;intent=classifyTurn(previousUser,{mode}).intent;topic=previousUser;
  } else if(/\b(?:the same|that idea|what we discussed|earlier|continue from|as before)\b/i.test(text)&&previousUser){
    continuation=true;topic=previousUser;
  }
  const social=SOCIAL.includes(intent),explicitTask=base.task||WORK.test(text) && /\b(?:can you|please|need you|help me|fix|how do|how can|write|make|build|create|explain)\b/i.test(text);
  if(explicitTask && !/^and you\??$/i.test(trimmed)){intent='task';}
  const finalSocial=SOCIAL.includes(intent);
  return Object.freeze({
    text,intent,social:finalSocial,task:intent==='task',continuation,previousUser:topic,
    emotionalPosture: /\b(?:love you|adore you|miss you)\b/i.test(text)?'affection':/\b(?:sad|upset|tired|lonely|frustrated|bad day|rough day)\b/i.test(text)?'attentive':'ordinary',
    safetyRouting:DANGER.test(text)?'nonclinical-boundary':'normal',
    replyContract:finalSocial?'Speak to the social meaning first; no unsolicited troubleshooting, research protocol or advice. Respond like a familiar companion, not a customer support script.':intent==='task'?'Help with the concrete task. Name relevant details; separate any uncertain facts from verified tool outputs.':'Attend to the user’s specific words and preceding turn. Do not invent a task or fill silence with generic advice.',
    recommendedSentences:finalSocial?'1–3 (more only if the user asks for it)':'as needed for the task',
    useReferenceExamples:!finalSocial,questionBudget:finalSocial?1:2,
    directAddress:mode==='leisure'?'relaxed, familiar':'focused, still distinctly Onyx'
  });
}
export function compactUserText(s,max=4000){return compact(s,max);}
