(function(root){'use strict';
function retrieve(request,catalog,route,opts={}){
  const limit=Math.max(1,Math.min(Number(opts.limit)||8,24));
  const entries=Array.isArray(catalog)?catalog:(catalog&&catalog.shards)||[];
  const q=String(request||'').normalize('NFKC').toLocaleLowerCase().match(/[\p{L}\p{N}_+#-]{2,}/gu)||[];
  return entries.filter(entry=>entry.retrieval==='knowledge_module'||!entry.retrieval_policy)
    .map(entry=>{const text=JSON.stringify(entry).toLocaleLowerCase();const score=q.reduce((n,t)=>n+(text.includes(t)?1:0),0);return{entry,score,why:['fallback lexical']};})
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);
}
const API={retrieve}; root.AIBrainFallbackRetrieval=API; root.AIBrain=root.AIBrain||{}; root.AIBrain.fallbackRetrieval=retrieve;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
