import { AI_BRAIN_CONFIG } from "./ai-brain-config.js";
import { fetchBrainJson, loadCatalog } from "./ai-brain-loader.js";
import { routeIntent } from "./ai-brain-router.js";
const tokens = s => new Set(String(s || "").normalize("NFKC").toLocaleLowerCase().match(/[\p{L}\p{N}_+#-]{2,}/gu) || []);
function overlap(a,b) { let n=0; for (const x of a) if (b.has(x)) n++; return n; }
function recordText(r) { try { return JSON.stringify(r.data ?? r.text ?? r); } catch { return String(r); } }
export async function chooseShards(query,{limit=AI_BRAIN_CONFIG.maxShards}={}) {
  const [route,catalog] = await Promise.all([routeIntent(query).catch(()=>({domains:["core_chat_support"],capabilities:[],tags:[]})),loadCatalog().catch(()=>({shards:[]}))]);
  const q = new Set([...tokens(query),...(route.tags||[]).flatMap(x=>[x,String(x).replaceAll("_"," ")]),...(route.capabilities||[])]);
  return (catalog.shards||[]).map(shard=>{
    const terms = new Set([shard.domain,shard.folder,...(shard.routing_tags||[]),...(shard.category?String(shard.category).split(/[_-]/):[]),...String(shard.path||"").split(/[._/-]/)]);
    const score = (route.domains||[]).includes(shard.domain) ? 8 : 0;
    return {shard,score:score+overlap(q,terms)};
  }).sort((a,b)=>b.score-a.score||a.shard.bytes-b.shard.bytes).slice(0,Math.max(1,limit)).map(x=>x.shard);
}
export async function retrieveKnowledge(query,{shardLimit=AI_BRAIN_CONFIG.maxShards,recordLimit=AI_BRAIN_CONFIG.maxContextRecords,maxChars=AI_BRAIN_CONFIG.maxContextChars}={}) {
  const q=tokens(query), shards=await chooseShards(query,{limit:shardLimit}), hits=[];
  for(const shard of shards) {
    if(shard.retrieval!=="knowledge_json") continue;
    let doc; try { doc=await fetchBrainJson(shard.path); } catch { continue; }
    const records=Array.isArray(doc?.records)?doc.records:Array.isArray(doc?.entries)?doc.entries:[{data:doc,source_path:shard.path}];
    for(const rec of records) {
      const txt=recordText(rec), terms=tokens(txt.slice(0,180000));
      const score=overlap(q,terms)+overlap(q,new Set(rec.routing_tags||rec.tags||[]))*3;
      if(score) hits.push({score,shard:shard.path,record:rec,text:txt,domain:shard.domain,health_education_only:Boolean(shard.health_education_only)});
    }
  }
  hits.sort((a,b)=>b.score-a.score||a.shard.localeCompare(b.shard));
  const out=[]; let chars=0;
  for(const hit of hits) {
    if(out.length>=recordLimit||chars>=maxChars) break;
    const text=hit.text.slice(0,Math.max(0,maxChars-chars));
    out.push({...hit,text}); chars+=text.length;
  }
  return out;
}
if (typeof globalThis !== "undefined") globalThis.AIBrainRetrieval = { chooseShards, retrieveKnowledge };
