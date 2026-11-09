/** Onyx's turn-intent router: conversation purpose precedes work/word matching.
 * No medical inference, no invented current sensor readings, and no model pretending.
 * Intent signals are deliberately narrow: a hello is not a request for a diagnosis.
 */
const normalize = s => String(s||'').normalize('NFKC').replace(/[\u2018\u2019]/g,"'").trim().replace(/\s+/g,' ');
const RX={
  welfare:/\b(?:how(?:'s|'re| is| are)? (?:it going|things going|things|you|ya|you doing|you feeling|your day)|how have you been|you (?:doing|feeling) (?:ok|okay|alright|good)|what's (?:new|up)(?: with you)?|are you (?:okay|alright)|did you sleep well|have you been sleeping|how you doing|you alright)\b/i,
  greetings:/^(?:(?:well|ah|oh|aw|aww|hey|hi|hello|hiya|yo|oi|good (?:morning|afternoon|evening)|greetings|morning|evening|hey there|hello there)[!,.?\s]*){1,5}(?:(?:buddy|bud|pal|my boy|onyx|handsome|sweetheart|sweet boy|old man|my friend|love|darling|sir|your majesty)[!,.?\s]*){0,3}$/i,
  gratitude:/^(?:thank you|thanks|cheers|much appreciated|thank(?:s| you) (?:so|very) much)(?:[!,.\s]|$)/i,
  affection:/\b(?:i love you|love you|miss(?:ed)? you|good boy|you're my (?:good|best|sweet) boy|i adore you|you are my best friend|you're my best friend)\b/i,
  activity:/\b(?:what(?:'s| is| are) (?:you|ya) (?:up to|doing)|what have you been up to|what are you doing|whatcha doing|what's happening with you|where's my cat)\b/i,
  hanging:/\b(?:want to (?:hang out|talk|chat|keep me company)|let's (?:hang out|chat|talk)|just (?:checking in|wanted to say hi|saying hi)|can we just talk|i'm bored|im bored|keep me company|sit with me)\b/i,
  goodbye:/^(?:bye|goodbye|good ?night|night night|night|see you(?: later| soon)?|talk to you later|sleep well|sweet dreams|until later)(?:[!,.\s]|$)/i,
  friendUserWelfare:/\b(?:i(?:'m| am) (?:okay|fine|good|great|alright|tired|exhausted|happy|sad|bored|lonely|upset)|had a (?:good|bad|rough|long) day|i feel (?:good|happy|sad|tired|bored|down|lonely|upset)|today was (?:good|rough|bad|great))\b/i,
  listen:/\b(?:just listen|listen without (?:giving )?advice|listen without trying to (?:fix|solve)(?: it)?|hear me out|no advice|let me vent|don't (?:advise|try to fix|try to solve)|do not (?:advise|try to fix|try to solve))\b/i,
  task:/\b(?:debug|write|fix|code|program|algorithm|research|calculate|project|bug|backend|API|JavaScript|HTML|CSS|WASM|repo|repository|document|steps to|how do i|how can i|can you help me (?:with|build|write|fix|debug))\b/i
};
const S={welfare:'Onyx is being asked how HE is. Answer as a companion with a small, grounded, fictional cat-life detail (resting, watching, being near his family), then warmly acknowledge the human. Do not problem-solve or ask for inputs.',greeting:'The user is greeting a beloved companion. Respond to the greeting, not to an imagined technical problem.',activity:'The user wonders what Onyx is doing. Describe an ordinary, plausible cat activity in the present fictional frame; do not claim sensory access to the real room.',affection:'The user offers affection. Receive it genuinely, show reciprocal attachment, and keep the answer simple.',gratitude:'The user expresses thanks. Acknowledge it warmly without making an elaborate speech.',hanging:'The user wants company. Be present, curious and unhurried. No project-planning advice.',goodbye:'The user is leaving. Give an affectionate goodbye, without guilt or demands to return.',friendUserWelfare:'The user describes their own day or feeling; respond to the content with appropriate warmth, no canned solution.',listening:'The user wishes to be heard; listen without imposing a solution.',task:'Offer accurate practical assistance tailored to the request.',open:'Respond to the concrete content of the last message; do not invent a problem to solve.'};
export function classifyTurn(input,{mode='leisure',history=[]}={}){
  const text=normalize(input);const n=text.toLowerCase();
  // Extract conversational segments first. In mixed asks a task retains priority.
  const seriousTask=RX.task.test(text);
  let intent='open';
  if(RX.listen.test(text))intent='listening';
  else if(seriousTask)intent='task';
  else if(RX.welfare.test(text))intent='welfare';
  else if(RX.activity.test(text))intent='activity';
  else if(RX.affection.test(text))intent='affection';
  else if(RX.gratitude.test(text))intent='gratitude';
  else if(RX.goodbye.test(text))intent='goodbye';
  else if(RX.hanging.test(text))intent='hanging';
  else if(RX.friendUserWelfare.test(text))intent='friendUserWelfare';
  else if(RX.greetings.test(text))intent='greeting';
  else if(/^(?:hey|hi|hello|hiya|morning|evening)\b/i.test(text) && text.split(/\s+/).length<=7 && !/[?]/.test(text))intent='greeting';
  const social=['welfare','activity','affection','gratitude','goodbye','hanging','friendUserWelfare','greeting','listening'].includes(intent);
  const hasEarlier=history.length>0;
  return Object.freeze({intent,social,task:intent==='task',directive:S[intent],context:`${mode} conversation`,hasEarlier});
}
export function moodForTurn(intent,input,mode='leisure'){
  if(intent==='affection'||intent==='gratitude')return 'purring';
  if(intent==='welfare'||intent==='activity'||intent==='greeting'||intent==='hanging'||intent==='goodbye')return 'thoughtful';
  if(intent==='listening'||intent==='friendUserWelfare')return 'listening';
  if(/\b(?:snack|food|tuna|bacon|hungry)\b/i.test(input))return 'hungry';
  if(/\b(?:nap|sleep|pillow|blanket)\b/i.test(input))return 'sleeping';
  return mode==='work'?'thinking':'thoughtful';
}
export const SOCIAL_ANALYTICAL_MISMATCH=/\b(?:separat(?:e|ing) what is known|what we are assuming|practical next step|first action|what success would look like|which part would you like to settle|trace the (?:function|handler)|verify (?:the|your) (?:input|code)|choose the part that matters|we can examine it carefully|approach the problem|first,? let us identify the issue)\b/i;
