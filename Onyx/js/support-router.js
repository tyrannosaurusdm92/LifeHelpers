(function(root){'use strict';
const DOMAIN_RX={
 adhd:/\b(adhd|executive dysfunction|time blind|procrastinat|focus|distract|working memory|task initiation)\b/i,
 autism:/\b(autis|sensory|meltdown|shutdown|masking|burnout|aac|nonverbal|nonspeaking|transition)\b/i,
 cbt:/\b(cbt|thought record|cognitive distortion|automatic thought|behavioral activation|worry|avoidance|exposure)\b/i,
 dbt:/\b(dbt|wise mind|tipp|stop skill|dear man|give skill|fast skill|opposite action|radical acceptance|distress tolerance|chain analysis)\b/i,
 psychiatric_support:/\b(psychiatr|psychosis|hallucinat|paranoi|mania|depression|anxiety|medication|prescriber|therapist|clinician)\b/i,
 physical_health:/\b(pain|fatigue|symptom|doctor|medical|mobility|wheelchair|oxygen|breathing|glucose|seizure|allergy|hydration|nausea|dizziness)\b/i,
 general_mental_health:/\b(grief|grounding|dissociat|sad|lonely|overwhelm|panic|relationship|sleep|self care|stress)\b/i
};
function domains(text){const hits=Object.entries(DOMAIN_RX).filter(([,rx])=>rx.test(String(text||''))).map(([d])=>d);return hits.length?hits.slice(0,4):['general_mental_health'];}
function hash(text){let h=2166136261;for(const c of String(text||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function chooseShard(index,domain,text){const info=index&&index.domains&&index.domains[domain];if(!info||!info.shards||!info.shards.length)return null;return info.shards[hash(domain+'|'+text)%info.shards.length];}
function resolve(action){return ['site.knowledge','site.contact'].includes(String(action||''))?{ok:true,action:String(action)}:{ok:false,status:'unsupported_action'};}
root.PsychiatryPT3Router={domains,chooseShard,hash};
root.AIBrainSupportRouter={resolve};
})(typeof globalThis!=='undefined'?globalThis:this);
