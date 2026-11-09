/** Opt-in local curation only. Nothing is stored until the user clicks Save. */
export class LearningStore {
  constructor({indexedDBImpl=globalThis.indexedDB,storage=undefined}={}){ this.indexedDB=indexedDBImpl;this.memory=[];this.dbPromise=null;try{this.storage=storage===undefined?globalThis.localStorage:storage;}catch{this.storage=null;} }
  async db(){ if(!this.indexedDB)return null;if(this.dbPromise)return this.dbPromise;
    this.dbPromise=new Promise(resolve=>{
      let r;try{r=this.indexedDB.open('onyx-response-generator-v1',1);}catch{return resolve(null);}
      r.onupgradeneeded=()=>{const s=r.result.createObjectStore('approved',{keyPath:'id'});s.createIndex('profile','profile');};
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>resolve(null);r.onblocked=()=>resolve(null);
    });return this.dbPromise;
  }
  _localList(){try{const value=this.storage?.getItem('onyx-approved-responses-v3');if(value){const rows=JSON.parse(value);return Array.isArray(rows)?rows:[];}}catch{}return this.memory;}
  _localSave(rows){this.memory=rows;try{this.storage?.setItem('onyx-approved-responses-v3',JSON.stringify(rows));}catch{ /* origin may deny storage; retain data only for this tab */ }}
  async approve(row){
    const allowed=['william','jasper'];if(!allowed.includes(row.profile))throw new Error('Invalid profile');
    const item={id:String(row.id||globalThis.crypto?.randomUUID?.()||('r'+Date.now()+Math.random())),profile:row.profile,
      mode:row.mode,mood:row.mood,topic:String(row.topic||''),text:String(row.text||'').slice(0,5000),
      createdAt:new Date().toISOString(),source:String(row.source||'curated'),approved:true};
    const db=await this.db();if(!db){this._localSave([...this._localList().filter(x=>x.id!==item.id),item]);return item;}
    await new Promise((resolve,reject)=>{const tx=db.transaction('approved','readwrite');tx.objectStore('approved').put(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});return item;
  }
  async list(profile){ if(!['william','jasper'].includes(profile)) throw new Error('Invalid profile');
    const db=await this.db();if(!db)return this._localList().filter(x=>x.profile===profile);
    return new Promise((resolve,reject)=>{const tx=db.transaction('approved','readonly'),req=tx.objectStore('approved').index('profile').getAll(profile);req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);});
  }
  async delete(id,profile){const db=await this.db();if(!db){this._localSave(this._localList().filter(x=>!(x.id===id&&x.profile===profile)));return;}
    const entries=await this.list(profile);if(!entries.some(x=>x.id===id))throw new Error('Cannot delete another profile\'s entry');
    await new Promise((resolve,reject)=>{const tx=db.transaction('approved','readwrite');tx.objectStore('approved').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
  }
  async clear(profile){const entries=await this.list(profile);for(const x of entries)await this.delete(x.id,profile);return entries.length;}
}
