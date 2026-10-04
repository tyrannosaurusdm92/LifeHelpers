(function(root){'use strict';
const A=root.AIBrain=root.AIBrain||{};
const DOMAIN_HINTS={writing_language:['writing','language','publishing','editing','story','narrative','translation','speech'],ttrpg_worldbuilding:['ttrpg','dice','campaign','character','worldbuilding','npc'],art_images_3d:['art','design','image','paint','brush','3d','mesh','geometry','studio'],video_games_game_creation:['game','code','javascript','html','css','api','software'],psychiatry:['psychiatr','psychopharmacology'],mental_health:['mental health','dbt','cbt','adhd','autism','coping'],physical_health:['medical','injury','physical health','pain','symptom'],health_context_support:['disability','caregiving','trauma','housing','migration','identity','legal']};
function infer(path){const p=A.norm?A.norm(path):String(path||'').toLowerCase();return Object.entries(DOMAIN_HINTS).filter(([,terms])=>terms.some(t=>p.includes(t))).map(([d])=>d);}
function fromPaths(paths){return(paths||[]).map(path=>({path:String(path).replace(/\\/g,'/'),kind:A.pathKind?A.pathKind(path):(String(path).endsWith('.js')?'javascript':'other'),domains:infer(path)}));}
function flattenTree(tree,prefix=''){const out=[];for(const x of tree||[]){const path=x.path||[prefix,x.name].filter(Boolean).join('/');if(x.type==='tree'&&Array.isArray(x.children))out.push(...flattenTree(x.children,path));else if(path)out.push(path);}return out;}
function fromCatalog(catalog){return((catalog&&catalog.shards)||[]).map(s=>({path:s.path,kind:'knowledge',domains:[s.domain],bytes:s.bytes,health_education_only:Boolean(s.health_education_only)}));}
function githubTree(opts={}){return Promise.resolve(fromCatalog(opts.catalog||{}));}
function merge(...catalogs){const m=new Map();for(const cat of catalogs.flat())for(const x of cat||[]){const key=x.path||x.name;if(!key)continue;const old=m.get(key)||{};m.set(key,{...old,...x,domains:[...new Set([...(old.domains||[]),...(x.domains||infer(key))])]});}return[...m.values()];}
const API={DOMAIN_HINTS,infer,fromPaths,flattenTree,fromCatalog,githubTree,merge};
root.AIBrainResourceDiscovery=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
