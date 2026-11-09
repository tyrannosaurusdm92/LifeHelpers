/** Opt-in, per-profile, local conversation state. This is NOT Gemini model training.
 * No health/therapy memory, no cross-profile leakage and no unapproved cloud writes.
 */
const PROFILE = new Set(['william','jasper']);
const MODE = new Set(['work','leisure','health','professor']);
const sensitive=/\b(therapy|therapist|mental health|psychiatr|diagnos|medicat|seizure|trauma|disorder|asthma|suicid|self[ -]?harm|blood sugar|glucose|disability|password|secret|api[ _-]?key|session[ _-]?token|bearer|credit card|ssn|social security number)\b/i;
const id=()=>globalThis.crypto?.randomUUID?.()||('o'+Date.now()+'-'+Math.random().toString(36).slice(2));
function parseProfile(profile){if(!PROFILE.has(profile))throw new Error('Profile must be William or Jasper.');return profile;}
function parseMode(mode){if(!MODE.has(mode))throw new Error('Mode must be Work or Leisure.');return mode;}
function clean(t,max=2500){return String(t??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
function key(profile,mode){return `${parseProfile(profile)}|${parseMode(mode)}`;}
function words(s){return new Set((s.toLowerCase().match(/[a-z0-9]{4,}/g)||[]).filter(x=>!['that','this','some','with','have','from','your','what','about','there'].includes(x)));}
function relevance(a,b){const x=words(a),y=words(b);let n=0;for(const w of x)if(y.has(w))n++;return n/(Math.sqrt((x.size||1)*(y.size||1)));}
export class ContextMemory {
  constructor({indexedDBImpl=globalThis.indexedDB,storage=undefined,dbName='onyx-conversation-memory-v2',maxTurns=40,maxFacts=250}={}){
    this.indexedDB=indexedDBImpl;try{this.storage=storage===undefined?globalThis.localStorage:storage;}catch{this.storage=null;}this.dbName=dbName;this.dbPromise=null;this.local=new Map();this.maxTurns=maxTurns;this.maxFacts=maxFacts;
  }
  async db(){
    if(!this.indexedDB)return null;
    if(this.dbPromise)return this.dbPromise;
    this.dbPromise=new Promise(resolve=>{
      let r;try{r=this.indexedDB.open(this.dbName,1);}catch{return resolve(null);}
      r.onupgradeneeded=()=>{const d=r.result;for(const n of ['facts','turns']){const s=d.createObjectStore(n,{keyPath:'id'});s.createIndex('scope','scope');}};
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);r.onblocked=()=>resolve(null);
    });return this.dbPromise;
  }
  _localRows(k){if(this.local.has(k))return this.local.get(k);let rows=[];try{const v=this.storage?.getItem('onyx-local-memory-v3:'+k);if(v){const parsed=JSON.parse(v);if(Array.isArray(parsed))rows=parsed;}}catch{}this.local.set(k,rows);return rows;}
  _localStore(k,rows){this.local.set(k,rows);try{this.storage?.setItem('onyx-local-memory-v3:'+k,JSON.stringify(rows));}catch{/* browser may deny persistence */}}
  async _list(type,scope){const db=await this.db();if(!db)return [...this._localRows(type+'|'+scope)];
    return new Promise((resolve,reject)=>{const r=db.transaction(type,'readonly').objectStore(type).index('scope').getAll(scope);r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});}
  async _put(type,item){const db=await this.db();if(!db){const k=type+'|'+item.scope;let rows=this._localRows(k).filter(x=>x.id!==item.id);rows.push(item);this._localStore(k,rows);return item;}
    await new Promise((resolve,reject)=>{const t=db.transaction(type,'readwrite');t.objectStore(type).put(item);t.oncomplete=resolve;t.onerror=()=>reject(t.error);});return item;}
  async _delete(type,item){const db=await this.db();if(!db){const k=type+'|'+item.scope;this._localStore(k,this._localRows(k).filter(x=>x.id!==item.id));return;}
    await new Promise((resolve,reject)=>{const t=db.transaction(type,'readwrite');t.objectStore(type).delete(item.id);t.oncomplete=resolve;t.onerror=()=>reject(t.error);});}
  async remember({profile,mode,text,source='user-approved'}={}){
    if(!['work','leisure'].includes(mode))throw new Error('Local note memory is disabled in Virtual & Health and Professor conversations.');
    const scope=key(profile,mode),value=clean(text);
    if(value.length<3)throw new Error('Memory must contain a meaningful note.');
    if(sensitive.test(value))throw new Error('Private health, credentials, or therapy details cannot enter this nonclinical memory store.');
    const rows=await this._list('facts',scope),matched=rows.find(x=>x.text.toLowerCase()===value.toLowerCase());if(matched)return matched;
    const item={id:id(),scope,profile,mode,text:value,source:clean(source,45),createdAt:new Date().toISOString(),approved:true};
    await this._put('facts',item);
    for(const old of (await this._list('facts',scope)).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).slice(0,-this.maxFacts))await this._delete('facts',old);
    return item;
  }
  async relevant({profile,mode,input,limit=6}={}){
    const rows=await this._list('facts',key(profile,mode));const ranked=rows.map(x=>({item:x,score:relevance(input,x.text)}))
      .sort((a,b)=>b.score-a.score||b.item.createdAt.localeCompare(a.item.createdAt));
    const recall=/\b(?:what did (?:i|we) (?:ask|tell) you to remember|remembered (?:notes|facts)|what do you remember|recall my notes|show (?:my|the) notes)\b/i.test(String(input));
    return (recall?ranked:ranked.filter(x=>x.score>0)).slice(0,Math.max(0,Math.min(12,limit))).map(x=>x.item);
  }
  async facts(profile,mode){return (await this._list('facts',key(profile,mode))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
  async forget({profile,mode,id:factId}={}){const rows=await this._list('facts',key(profile,mode));const r=rows.find(x=>x.id===factId);if(!r)return false;await this._delete('facts',r);return true;}
  async appendTurn({profile,mode,threadId='default',user,assistant,mood='thoughtful'}={}){
    if(!['work','leisure'].includes(mode))throw new Error('Local transcript persistence is disabled in Virtual & Health and Professor conversations.');
    const scope=key(profile,mode),u=clean(user,4000),a=clean(assistant,5000);if(!u||!a)throw new Error('A turn requires user and assistant text.');
    const item={id:id(),scope,profile,mode,threadId:clean(threadId,80),user:u,assistant:a,mood,createdAt:new Date().toISOString()};await this._put('turns',item);
    const rows=(await this._list('turns',scope)).filter(x=>x.threadId===item.threadId).sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
    for(const old of rows.slice(0,-this.maxTurns))await this._delete('turns',old);
    return item;
  }
  async turns(profile,mode,threadId='default',limit=12){return (await this._list('turns',key(profile,mode))).filter(x=>x.threadId===clean(threadId,80)).sort((a,b)=>a.createdAt.localeCompare(b.createdAt)).slice(-Math.min(40,Math.max(1,limit)));}
  async clearThread(profile,mode,threadId='default'){const rows=(await this._list('turns',key(profile,mode))).filter(x=>x.threadId===clean(threadId,80));for(const item of rows)await this._delete('turns',item);return rows.length;}
  async clearScope(profile,mode){const scope=key(profile,mode);let n=0;for(const type of ['turns','facts'])for(const item of await this._list(type,scope)){await this._delete(type,item);n++;}return n;}
  async exportScope(profile,mode){return JSON.stringify({schema:'onyx.memory.export.v2',profile,mode,facts:await this.facts(profile,mode),turns:await this._list('turns',key(profile,mode))},null,2);}
}
