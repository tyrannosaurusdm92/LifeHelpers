(function(){
'use strict';
const DB='SavanskiArtStudioDB', STORE='projects', VERSION=2;
function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function clone(value){if(typeof structuredClone==='function')return structuredClone(value);return JSON.parse(JSON.stringify(value));}
function id(prefix='project'){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;}
async function request(mode,operation){const d=await openDB();return new Promise((resolve,reject)=>{const t=d.transaction(STORE,mode),s=t.objectStore(STORE);let r;try{r=operation(s);}catch(e){d.close();reject(e);return;}if(r&&typeof r==='object'&&'onsuccess' in r){r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);}else{t.oncomplete=()=>resolve(r);t.onerror=()=>reject(t.error);}t.oncomplete=()=>d.close();});}
async function getAll(){return (await request('readonly',s=>s.getAll()))||[];}
function normalize(project){const p=clone(project||{});p.id=p.id||id(p.projectType==='uniform-3d'?'3d':'art');p.name=String(p.name||p.projectName||'Untitled Project').trim()||'Untitled Project';p.createdAt=p.createdAt||Date.now();p.updatedAt=Date.now();if(p.deletedAt===undefined)p.deletedAt=null;return p;}
const api={
 async put(project){const p=normalize(project);await request('readwrite',s=>s.put(p));return p;},
 async get(projectId,{includeDeleted=true}={}){const p=await request('readonly',s=>s.get(projectId));if(!p)return null;if(!includeDeleted&&p.deletedAt)return null;return p;},
 async list(options={}){const {includeDeleted=false,deletedOnly=false,projectType=null}=options||{};let rows=await getAll();rows=rows.filter(p=>deletedOnly?!!p.deletedAt:(includeDeleted||!p.deletedAt));if(projectType)rows=rows.filter(p=>p.projectType===projectType);return rows.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));},
 async listTrash(){return api.list({deletedOnly:true});},
 async remove(projectId){const p=await api.get(projectId);if(!p)return false;p.deletedAt=Date.now();p.updatedAt=Date.now();await request('readwrite',s=>s.put(p));return true;},
 async restore(projectId){const p=await api.get(projectId);if(!p)return null;p.deletedAt=null;p.updatedAt=Date.now();await request('readwrite',s=>s.put(p));return p;},
 async purge(projectId){await request('readwrite',s=>s.delete(projectId));return true;},
 async rename(projectId,newName){const p=await api.get(projectId);if(!p)throw new Error('Project not found.');p.name=String(newName||'').trim().slice(0,120)||p.name;p.updatedAt=Date.now();await request('readwrite',s=>s.put(p));return p;},
 async duplicate(projectId,newName){const source=await api.get(projectId);if(!source)throw new Error('Project not found.');const copy=clone(source);copy.id=id(source.projectType==='uniform-3d'?'3d':'art');copy.name=String(newName||`${source.name||'Untitled'} Copy`).trim().slice(0,120);copy.createdAt=copy.updatedAt=Date.now();copy.deletedAt=null;if(copy.project3d?.meta)copy.project3d.meta=Object.assign({},copy.project3d.meta,{duplicatedFrom:source.id});await request('readwrite',s=>s.put(copy));return copy;},
 async emptyTrash(){const rows=await api.listTrash();for(const p of rows)await api.purge(p.id);return rows.length;},
 makeId:id
};
window.LFStorage=api;
})();
