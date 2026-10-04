(function(root){'use strict';
async function ask(query){
  const api=root.AIBrainRetrieval;
  if(!api||typeof api.retrieveKnowledge!=='function')return{status:'unavailable',results:[],sources:[]};
  const results=await api.retrieveKnowledge(String(query||'').slice(0,2000));
  return results.length?{status:'retrieved',mode:'internal_knowledge_only',results,sources:[...new Set(results.map(x=>x.shard))]}:
    {status:'insufficient_evidence',mode:'internal_knowledge_only',results:[],sources:[],text:"I don't have enough matching material in the internal corpus to answer without inventing information."};
}
root.AIBrainChatbot={ask,mode:'read-only knowledge retrieval'};
})(typeof globalThis!=='undefined'?globalThis:this);
