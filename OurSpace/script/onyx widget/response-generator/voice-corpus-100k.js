/**
 * Onyx 100,000-reference voice corpus, source edition 2026-11-08.
 * All 8 original account/lane sets are present as immutable gzip JSON assets.
 * Examples are fictional writing references, NEVER memory, facts, or answers.
 * This module has no authentication, LLM, UI, or clinical authority.
 * The caller MUST choose the account from a verified session, never from text.
 */
export const CORPUS_COUNTS = Object.freeze({
  william: Object.freeze({work:14700, leisure:15300, virtual:5760, professor:14240}),
  jasper: Object.freeze({work:14700, leisure:15300, virtual:5760, professor:14240})
});
export const CORPUS_TOTAL = 100000;
export const CORPUS_SCHEMA = 'onyx.voice-corpus.v2';
export const CORPUS_REFERENCE_SCHEMA = 'ourspace.onyx.voice-corpus-reference.v2';
const ROOT = new URL('../../../json/onyx%20widget/voice-corpus-100k/', import.meta.url);
const cache = new Map();
const PROFILES = new Set(['william','jasper']);
const LANES = new Set(['work','leisure','virtual','professor']);
const STOP = new Set('a an and are as at be been being but by can could did do does for from had has have he her here him how i if in into is it its just let me more my no not of on or our please she so some than that the their them there these they this those to too us very was we were what when where which who why will with would you your youre youd ive im need needs want wants help helping like about after before then now today buddy onyx papa momma mother father feel feeling says said please thanks thank'.split(' '));
const SYNONYMS = Object.freeze({
  debugging:'debug', debugger:'debug', broken:'break', breaks:'break', breaking:'break', failed:'fail', failing:'fail', failure:'fail',
  clicking:'click', clicked:'click', buttons:'button', events:'event', handlers:'handler',
  anxious:'anxiety', worrying:'worry', worries:'worry', panicking:'panic', sad:'sadness', depressed:'depression',
  sleeping:'sleep', sleepy:'sleep', tiredness:'fatigue', exhausted:'fatigue', overwhelm:'overwhelmed',
  dinner:'meal', supper:'meal', plate:'meal', food:'meal', breakfast:'meal', lunch:'meal',
  accessibility:'access', accessible:'access', wheelchair:'mobility', mobility:'mobility',
  therapy:'therapeutic', therapist:'therapeutic', psychiatric:'psychiatry', diagnosis:'diagnose',
  games:'game', gaming:'game', videogame:'game', stories:'story', writing:'write', coded:'code', coding:'code',
  conversation:'chat', chatting:'chat', greetings:'greet', greeting:'greet'
});
function normalizeLane(value) {const s=String(value||'').toLowerCase();return s==='health'?'virtual':LANES.has(s)?s:'';}
function normalizeProfile(value) {const s=String(value||'').toLowerCase();return PROFILES.has(s)?s:'';}
function terms(value) {
  const raw=String(value||'').normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)||[];
  const found=new Set();
  for(const word of raw){
    if(STOP.has(word))continue;
    const stem=SYNONYMS[word]||word.replace(/(?:ing|ment|ness|ies|ers|ed|es|s)$/u,(s)=>s==='ies'?'y':'');
    if(stem.length>2&&!STOP.has(stem))found.add(stem);
    if(found.size>=64)break;
  }
  return found;
}
function overlap(a,b) {let n=0;for(const x of a)if(b.has(x))n++;return n;}
function titleOf(row) {const p=row[0].split(' | ');return p.slice(3).join(' ');}
function indexShard(json){
  return json.entries.map(row=>{
    const label=String(row[0]),pieces=label.split(' | ');
    const topic=titleOf(row),cue=String(row[1]||''),body=String(row[2]||'');
    return {id:pieces[0],category:String(pieces[1]||''),mood:String(pieces[2]||''),topic,cue,body,
      topicTerms:terms(topic+' '+pieces[1]),cueTerms:terms(cue)};
  });
}
async function decodeGzip(bytes){
  if(bytes[0]===0x1f && bytes[1]===0x8b){
    if(typeof DecompressionStream!=='function')throw new Error('This browser does not support gzip streaming; the canonical voice guidance remains available.');
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  }
  // A proxy may have already decompressed an HTTP Content-Encoding response.
  return new TextDecoder('utf-8').decode(bytes);
}
export async function loadVoiceShard(profile,lane,{fetchImpl=globalThis.fetch,signal}={}){
  const who=normalizeProfile(profile),where=normalizeLane(lane);
  if(!who||!where)throw new Error('Voice corpus requires an explicitly verified account and lane.');
  const key=who+'/'+where;
  if(cache.has(key))return cache.get(key);
  const promise=(async()=>{
    if(typeof fetchImpl!=='function')throw new Error('Fetch is unavailable for the voice corpus.');
    const url=new URL(`${who}/${where}.json.gz`,ROOT);
    const response=await fetchImpl(url.href,{credentials:'same-origin',signal,cache:'force-cache'});
    if(!response.ok)throw new Error(`Voice corpus ${key} HTTP ${response.status}`);
    const payload=JSON.parse(await decodeGzip(new Uint8Array(await response.arrayBuffer())));
    const expected=CORPUS_COUNTS[who][where];
    if(payload?.schema!==CORPUS_SCHEMA||payload.profile!==who||payload.lane!==where||payload.count!==expected||
      !Array.isArray(payload.entries)||payload.entries.length!==expected)throw new Error(`Voice corpus ${key} did not pass count/schema checks.`);
    const ids=new Set();
    for(const row of payload.entries){
      if(!Array.isArray(row)||row.length!==3||typeof row[0]!=='string'||typeof row[2]!=='string')throw new Error(`Malformed voice example in ${key}.`);
      const id=row[0].split(' | ')[0];
      if(!id.startsWith(who==='william'?'W-':'J-')||ids.has(id))throw new Error(`Duplicate or incorrect voice ID ${id} in ${key}.`);
      ids.add(id);
    }
    return Object.freeze({profile:who,lane:where,count:expected,entries:indexShard(payload)});
  })();
  cache.set(key,promise);
  try{return await promise;}catch(e){cache.delete(key);throw e;}
}
export async function retrieveVoiceExamples({profile,lane,message,history=[],mood='',limit=3,fetchImpl}={}){
  const who=normalizeProfile(profile),where=normalizeLane(lane);
  if(!who||!where)throw new Error('A verified account and an explicit conversation lane are required.');
  const input=String(message||'').trim();
  if(!input)return [];
  const shard=await loadVoiceShard(who,where,{fetchImpl});
  const query=terms(input),lastMessage=Array.isArray(history)?history.slice(-2).filter(t=>t?.role==='user').map(t=>t.content||t.text).join(' '):'';
  if(query.size<2 && lastMessage)for(const t of terms(lastMessage))query.add(t);
  if(!query.size)return [];
  const ranks=[];
  for(const e of shard.entries){
    const a=overlap(query,e.topicTerms),b=overlap(query,e.cueTerms);
    const support=a+b;
    if(!support)continue;
    // Subject/cue agreement is required. Generic body phrasing is excluded.
    const score=a*7+b*4+(a&&b?3:0)+(mood&&e.mood.toLowerCase()===mood.toLowerCase()?2:0);
    const threshold=7;
    if(score<threshold||((a===0)&&(b<2)))continue;
    ranks.push({entry:e,score});
  }
  ranks.sort((a,b)=>b.score-a.score||a.entry.id.localeCompare(b.entry.id));
  const selected=[],seen=new Set();
  for(const item of ranks){
    const e=item.entry,contextKey=(e.topic||e.cue).toLowerCase().slice(0,140);
    if(seen.has(contextKey) && ranks.length>selected.length+3)continue;
    seen.add(contextKey);
    selected.push(Object.freeze({id:e.id,category:e.category,mood:e.mood,
      cue:(e.topic||e.cue).slice(0,155),styleOnly:e.body.slice(0,530)}));
    if(selected.length>=Math.max(1,Math.min(3,limit)))break;
  }
  return selected;
}
export async function auditVoiceCorpus({fetchImpl=globalThis.fetch,onProgress}={}){
  const counts=[],unique=new Set();let total=0;
  for(const profile of ['william','jasper']){
    for(const lane of ['work','leisure','virtual','professor']){
      const shard=await loadVoiceShard(profile,lane,{fetchImpl});
      for(const entry of shard.entries){if(unique.has(entry.id))throw new Error('Duplicate voice ID across lanes: '+entry.id);unique.add(entry.id);}
      total+=shard.count;
      const item={profile,lane,count:shard.count,expected:CORPUS_COUNTS[profile][lane]};
      counts.push(item);if(typeof onProgress==='function')onProgress({...item,total});
    }
  }
  if(total!==CORPUS_TOTAL||unique.size!==CORPUS_TOTAL)throw new Error('100,000-reference audit mismatch.');
  return Object.freeze({ok:true,total,uniqueIds:unique.size,lanes:counts,profileCounts:{william:50000,jasper:50000}});
}
export function corpusCacheStatus(){return Object.freeze({loaded:[...cache.keys()],manifestTotal:CORPUS_TOTAL});}