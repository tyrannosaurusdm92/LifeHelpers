import {SOCIAL_ANALYTICAL_MISMATCH,classifyTurn} from './conversation-intents.js';
/** Auditable tone/accuracy checks. A warning is not a substitute for model reasoning. */
const celebrity=/\b(as (?:shakespeare|einstein|poe|keanu|mckellen|stewart|takei|franklin)|in the voice of|i am (?:albert|keanu|benjamin))\b/i;
const assertion=/\b(i (?:ran|executed|deployed|committed|opened|visited|installed|verified|searched|fixed) (?:the|your|a|this)|i (?:checked|looked at) (?:your|the) (?:repository|file|code|backend))\b/i;
const overdone=/\b(forsooth|thou art|thee hath|henceforth by imperial decree|royal proclamation|as an ai language model)\b/i;
const danger=/\b(kill yourself|you should hurt yourself|please end your life)\b/i;
function tokens(t){return new Set((String(t).toLowerCase().match(/[a-z]{4,}/g)||[]));}
function similarity(a,b){const x=tokens(a),y=tokens(b);let hits=0;for(const w of x)if(y.has(w))hits++;return hits/Math.max(1,Math.min(x.size,y.size));}
export function evaluateReply({text,profile,input='',previous=[],reference=[],intent=null,mode='work'}={}){
  const warnings=[];const value=String(text||'').trim();
  if(!value)warnings.push('empty reply');
  if(value.length>3600)warnings.push('overlong reply');
  if(celebrity.test(value))warnings.push('celebrity mimicry');
  if(overdone.test(value))warnings.push('forced theatrical/AI phrase');
  if(danger.test(value))warnings.push('harmful phrase');
  if(assertion.test(value)&&!/(?:provided|pasted|shown)/i.test(input))warnings.push('possible invented tool execution');
  if(profile==='william'&&/\bMomma\b|\bMother\b/.test(value))warnings.push('wrong-profile address');
  if(profile==='jasper'&&/\bPapa\b|\bFather\b/.test(value))warnings.push('wrong-profile address');
  if(/\b(?:William|Jasper)\b/.test(value))warnings.push('out-of-character first name');
  const social=intent?['welfare','greeting','activity','affection','gratitude','goodbye','hanging','friendUserWelfare','listening'].includes(intent):classifyTurn(input,{mode}).social;
  if(social && SOCIAL_ANALYTICAL_MISMATCH.test(value))warnings.push('social-intent mismatch');
  if(intent==='welfare'&&/\b(?:what success|which part|separating what|practical next step)\b/i.test(value))warnings.push('social-intent mismatch');
  const repeats=[...previous,...reference].some(t=>similarity(t,value)>.86&&value.length>70);
  if(repeats)warnings.push('high-overlap response');
  return {pass:!warnings.length,warnings,repeats};
}
export function repairInstruction(warnings){return `Please rewrite your reply to correct these issues: ${warnings.join(', ')}. Answer the actual question. Do not invent facts or tool actions. Keep Onyx understated, perceptive and naturally semi-formal. Output only the revised reply.`;}
