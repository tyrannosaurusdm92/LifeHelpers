/** Bounded lexical retrieval. Matching examples are style hints, never fixed chat responses. */
const STOP = new Set('a an the i you my our we he she it of on in at is are for to with from that this these those and or so if how what which when where why your me be been will would could should just not no yes please about can want need help get do does did have has had very more much up out as than then there their here one two after before into while but yet some also was were'.split(' '));
export function tokens(s) { return (String(s||'').toLowerCase().match(/[a-z0-9]{3,}/g)||[]).filter(x=>!STOP.has(x)).slice(0,160); }
function fnv(s) {let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0;}
export function fingerprint(s){ const bits=[0,0,0,0];for(const t of new Set(tokens(s))){let n=fnv(t)%128;bits[n>>>5]|=1<<(n&31);}return bits; }
function pop(n){n=n-((n>>>1)&0x55555555);n=(n&0x33333333)+((n>>>2)&0x33333333);return (((n+(n>>>4))&0x0f0f0f0f)*0x01010101)>>>24;}
function fallbackScore(q,d){ let k=0,n=0;for(let j=0;j<4;j++){k+=pop(q[j]&d[j]);n+=pop(d[j]);}return Math.trunc(k*1000/(n+6)); }
export class Retrieval {
  constructor(exemplars, scorer=null){this.all=exemplars;this.scorer=scorer;this.byScope=new Map();this.inverted=new Map();this._build();}
  _build(){for(let i=0;i<this.all.length;i++){
    const e=this.all[i],scope=e.profile+'|'+e.mode; if(!this.byScope.has(scope))this.byScope.set(scope,[]);this.byScope.get(scope).push(i);
    // Ranking is grounded primarily in the hypothetical cue and topic, not boilerplate phrasing.
    const queryText=[e.cue,e.topic,e.text]; e._bits=fingerprint(queryText.join(' '));
    const terms=new Set(tokens(`${e.cue} ${e.topic} ${e.text}`));
    for(const t of terms){const key=scope+'|'+t;if(!this.inverted.has(key))this.inverted.set(key,[]);this.inverted.get(key).push(i);}
  }}
  retrieve({profile,mode,input,mood='',limit=4,excludedIds=[]}={}) {
    if(!['william','jasper'].includes(profile)||!['work','leisure'].includes(mode)) throw new Error('Profile and mode must be explicit.');
    const terms=[...new Set(tokens(input))],scope=profile+'|'+mode,counts=new Map();
    const scopeTotal=this.byScope.get(scope)?.length||1;
    for(const t of terms){const hits=this.inverted.get(scope+'|'+t)||[];if(!hits.length)continue;
      const idf=Math.max(.2,Math.log2(1+scopeTotal/(2+hits.length)));
      for(const i of hits)counts.set(i,(counts.get(i)||0)+idf);
    }
    if(!counts.size){for(const i of (this.byScope.get(scope)||[]).slice(0,180)) counts.set(i,0);}
    const q=fingerprint(input),exclude=new Set(excludedIds),wasm=this.scorer;
    const scored=[...counts].filter(([i])=>!exclude.has(this.all[i].id)).map(([i,lex])=>{
      const e=this.all[i];const semantic=wasm?wasm(...q,...e._bits):fallbackScore(q,e._bits);
      const moodBoost=mood&&e.mood===mood?2.5:0;
      return {entry:e,score:lex*3+semantic/130+moodBoost};
    });
    scored.sort((a,b)=>b.score-a.score||a.entry.id.localeCompare(b.entry.id));
    const result=[],usedCues=new Set();
    for(const item of scored){ const cue=item.entry.cue.toLowerCase(); if(usedCues.has(cue)&&result.length<limit-1)continue;
      result.push(item);usedCues.add(cue);if(result.length>=limit)break; }
    return result;
  }
}
export async function loadWasmScorer(url,fetchImpl=globalThis.fetch){
  if(typeof WebAssembly==='undefined'||typeof fetchImpl!=='function')return null;
  try {const buf=await (await fetchImpl(url)).arrayBuffer();const {instance}=await WebAssembly.instantiate(buf,{});
    return typeof instance.exports.overlap_score==='function'?instance.exports.overlap_score:null;
  }catch {return null;}
}
